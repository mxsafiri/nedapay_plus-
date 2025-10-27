import { NextRequest, NextResponse } from 'next/server';
import { sendOrderWebhookToSender } from '@/lib/webhooks/delivery';
import { prisma } from '@/lib/prisma';
import { MockBlockchainService, shouldUseMockService } from '@/lib/blockchain/mock-service';
import crypto from 'crypto';

/**
 * Hash API key for matching against stored hash
 */
function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

/**
 * Payment Orders API
 * 
 * Allows banks to submit cross-border payment requests
 * PSPs fulfill these orders and earn commission
 */

// Authenticate via API key
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header' };
  }

  const apiKey = authHeader.substring(7); // Remove 'Bearer '

  try {
    // Hash the incoming API key to match against stored hash
    const hashedKey = hashApiKey(apiKey);
    
    const key = await prisma.api_keys.findUnique({
      where: { secret: hashedKey },
      include: {
        sender_profiles: {
          select: {
            id: true,
            markup_percentage: true,
            user_sender_profile: true,
            test_balance: true
          }
        },
        provider_profiles: {
          select: {
            id: true,
            commission_rate: true,
            user_provider_profile: true,
            test_balance: true
          }
        }
      }
    });

    if (!key) {
      return { authenticated: false, error: 'Invalid API key' };
    }

    // Get user from profile
    let _userId: string | null = null;
    let _scope: string | null = null;
    let _profile: any = null;

    if (key.sender_profiles) {
      _userId = key.sender_profiles.user_sender_profile;
      _scope = 'sender';
      _profile = key.sender_profiles;
    } else if (key.provider_profiles) {
      _userId = key.provider_profiles.user_provider_profile;
      _scope = 'provider';
      _profile = key.provider_profiles;
    } else {
      return { authenticated: false, error: 'API key not linked to any profile' };
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: _userId },
      select: {
        id: true,
        email: true,
        scope: true
      }
    });

    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }

    return { 
      authenticated: true, 
      user: user,
      senderProfile: key.sender_profiles,
      providerProfile: key.provider_profiles,
      isTestMode: key.is_test,
      apiKey: apiKey
    };
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

// Get available PSP for order fulfillment
async function assignPSP(_toCurrency: string, _amount: number) {
  try {
    // Find active PSPs that support the destination currency
    const providers = await prisma.provider_profiles.findMany({
      where: {
        is_active: true,
        is_available: true,
        is_kyb_verified: true,
      },
      orderBy: {
        fulfillment_count: 'asc' // Round-robin: assign to PSP with least orders
      },
      take: 1
    });

    if (providers.length === 0) {
      return null;
    }

    return providers[0];
  } catch (error) {
    console.error('Error assigning PSP:', error);
    return null;
  }
}

/**
 * POST /api/v1/payment-orders
 * Create a new cross-border payment order
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Payment Order API - Received request');

    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { user, senderProfile, isTestMode } = auth;

    console.log(`🔧 Test Mode: ${isTestMode ? 'ON' : 'OFF'}`);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Only senders/banks can create payment orders
    if (user.scope.toLowerCase() !== 'sender' && user.scope.toLowerCase() !== 'bank') {
      return NextResponse.json(
        { success: false, error: 'Only banks can create payment orders' },
        { status: 403 }
      );
    }

    if (!senderProfile) {
      return NextResponse.json(
        { success: false, error: 'Sender profile not found. Please complete onboarding.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      fromCurrency,
      toCurrency,
      amount,
      recipientDetails,
      reference,
      webhookUrl
    } = body;

    // Validate required fields
    if (!fromCurrency || !toCurrency || !amount || !recipientDetails) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['fromCurrency', 'toCurrency', 'amount', 'recipientDetails']
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get exchange rate (placeholder - would call external API)
    const exchangeRate = 0.00245; // TZS to CNY example rate
    const toAmount = amount * exchangeRate;

    // Calculate fees
    const markupPercentage = senderProfile.markup_percentage || 0.002; // 0.2% default
    const bankMarkup = toAmount * markupPercentage;
    
    const platformFee = 0.50; // $0.50 per transaction
    const pspCommissionRate = 0.003; // 0.3% default
    const pspCommission = toAmount * pspCommissionRate;

    const amountInUsd = fromCurrency === 'USD' ? amount : toAmount; // Simplified

    // Assign PSP
    const assignedPSP = await assignPSP(toCurrency, toAmount);
    
    if (!assignedPSP) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No available PSPs for this currency corridor. Please try again later.' 
        },
        { status: 503 }
      );
    }

    // Get default token (USDC)
    const defaultToken = await prisma.tokens.findFirst({
      where: { symbol: 'USDC' }
    });

    if (!defaultToken) {
      return NextResponse.json(
        { success: false, error: 'System configuration error: No default token found' },
        { status: 500 }
      );
    }

    // Generate mock transaction if in test mode
    let mockTx = null;
    if (isTestMode || shouldUseMockService(isTestMode)) {
      mockTx = await MockBlockchainService.mockSendTransaction({
        from: 'test_bank_address',
        to: recipientDetails.accountNumber || recipientDetails.address || 'test_recipient',
        amount: toAmount,
        network: 'hedera-testnet'
      });
      console.log('🧪 Mock transaction generated:', mockTx.txHash);
    }

    // Create payment order
    const orderId = isTestMode ? `test_order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}` : `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
    const order = await prisma.payment_orders.create({
      data: {
        id: orderId,
        amount: amount,
        amount_paid: toAmount,
        amount_returned: 0,
        amount_in_usd: amountInUsd,
        sender_fee: 0,
        rate: exchangeRate,
        receive_address_text: recipientDetails.accountNumber || recipientDetails.address || 'pending',
        status: isTestMode ? 'confirmed' : 'pending', // Auto-confirm in test mode
        sender_profile_payment_orders: senderProfile.id,
        token_payment_orders: defaultToken.id,
        network_fee: mockTx ? mockTx.fee : 0,
        fee_percent: markupPercentage,
        percent_settled: isTestMode ? 100 : 0, // Auto-settle in test mode
        protocol_fee: platformFee,
        reference: reference || null,
        
        // Test mode tracking
        is_test_mode: isTestMode,
        tx_hash: mockTx ? mockTx.txHash : null,
        tx_id: mockTx ? mockTx.txId : null,
        network_used: mockTx ? mockTx.network : null,
        block_number: mockTx ? mockTx.blockNumber : 0,
        
        // Revenue tracking
        bank_markup: bankMarkup,
        psp_commission: pspCommission,
        platform_fee: platformFee,
        assigned_psp_id: assignedPSP.id,
        
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Update PSP fulfillment count
    await prisma.provider_profiles.update({
      where: { id: assignedPSP.id },
      data: {
        fulfillment_count: {
          increment: 1
        }
      }
    });

    // Send webhooks asynchronously (don't wait for completion)
    // Send to bank if webhook configured
    if (senderProfile && webhookUrl) {
      sendOrderWebhookToSender(webhookUrl, {
        orderId: order.id,
        status: order.status,
        fromAmount: amount,
        fromCurrency: fromCurrency,
        toAmount: toAmount,
        toCurrency: toCurrency,
        bankMarkup: bankMarkup,
        reference: reference
      }).catch(err => console.error('Webhook delivery to sender failed:', err));
    }

    // TODO: Send webhook to PSP (need to get PSP webhook URL from provider_profiles)

    console.log('✅ Payment order created:', orderId);

    // Return response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      fromAmount: amount,
      fromCurrency: fromCurrency,
      toAmount: toAmount,
      toCurrency: toCurrency,
      exchangeRate: exchangeRate,
      bankMarkup: bankMarkup,
      estimatedCompletion: isTestMode ? new Date().toISOString() : new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: order.created_at.toISOString(),
      reference: reference || null,
      testMode: isTestMode,
      ...(isTestMode && mockTx && {
        testData: {
          txHash: mockTx.txHash,
          network: mockTx.network,
          message: 'This is a test transaction. No real funds were moved.'
        }
      })
    });

  } catch (error) {
    console.error('❌ Error creating payment order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/payment-orders
 * List payment orders for the authenticated user
 * - Senders (Banks): View orders they created
 * - Providers (PSPs): View orders assigned to them for fulfillment
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Payment Order API - List orders request');

    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { user, senderProfile, providerProfile, isTestMode } = auth;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log(`📊 Listing orders for ${user.scope} (Test Mode: ${isTestMode})`);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let orders;
    let totalCount = 0;

    if (user.scope.toLowerCase() === 'sender' || user.scope.toLowerCase() === 'bank') {
      // Bank view: Orders they submitted
      const whereClause: any = {
        sender_profile_payment_orders: senderProfile?.id || '',
        is_test_mode: isTestMode // Only show orders matching API key mode
      };

      if (status) {
        whereClause.status = status;
      }

      // Get total count for pagination
      totalCount = await prisma.payment_orders.count({ where: whereClause });

      orders = await prisma.payment_orders.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        include: {
          tokens: {
            select: { symbol: true }
          },
          payment_order_recipients: {
            select: {
              account_name: true,
              account_identifier: true,
              institution: true,
              memo: true
            }
          }
        }
      });

      console.log(`✅ Found ${orders.length} orders for sender ${senderProfile?.id}`);

      return NextResponse.json({
        success: true,
        orders: orders.map(order => ({
          orderId: order.id,
          status: order.status,
          fromAmount: order.amount,
          toAmount: order.amount_paid,
          exchangeRate: order.rate,
          bankMarkup: order.bank_markup,
          platformFee: order.platform_fee,
          reference: order.reference,
          recipient: order.payment_order_recipients,
          token: order.tokens?.symbol,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          txHash: order.tx_hash,
          network: order.network_used,
          testMode: order.is_test_mode
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + orders.length < totalCount
        }
      });

    } else if (user.scope.toLowerCase() === 'provider' || user.scope.toLowerCase() === 'psp') {
      // Provider view: Orders assigned to them for fulfillment
      const whereClause: any = {
        assigned_psp_id: providerProfile?.id || '',
        is_test_mode: isTestMode // Only show orders matching API key mode
      };

      if (status) {
        whereClause.status = status;
      }

      // Get total count for pagination
      totalCount = await prisma.payment_orders.count({ where: whereClause });

      orders = await prisma.payment_orders.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        include: {
          tokens: {
            select: { symbol: true }
          },
          payment_order_recipients: {
            select: {
              account_name: true,
              account_identifier: true,
              institution: true,
              memo: true
            }
          },
          sender_profiles: {
            select: {
              id: true,
              users: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      });

      console.log(`✅ Found ${orders.length} orders assigned to provider ${providerProfile?.id}`);

      return NextResponse.json({
        success: true,
        orders: orders.map(order => ({
          orderId: order.id,
          status: order.status,
          fromAmount: order.amount,
          toAmount: order.amount_paid,
          amountInUsd: order.amount_in_usd,
          exchangeRate: order.rate,
          pspCommission: order.psp_commission, // How much PSP earns
          platformFee: order.platform_fee,
          reference: order.reference,
          recipient: order.payment_order_recipients,
          senderEmail: order.sender_profiles?.users?.email,
          token: order.tokens?.symbol,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          txHash: order.tx_hash,
          network: order.network_used,
          testMode: order.is_test_mode,
          // PSP-specific fields
          percentSettled: order.percent_settled,
          needsFulfillment: order.percent_settled < 100
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + orders.length < totalCount
        },
        summary: {
          totalEarnings: orders.reduce((sum, o) => sum + o.psp_commission, 0),
          pendingOrders: orders.filter(o => o.percent_settled < 100).length,
          completedOrders: orders.filter(o => o.percent_settled === 100).length
        }
      });

    } else {
      // Other roles can't list orders via this API
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only senders and providers can list orders' },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('❌ Error listing payment orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to list payment orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
