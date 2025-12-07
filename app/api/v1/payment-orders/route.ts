import { NextRequest, NextResponse } from 'next/server';
import { sendOrderWebhookToSender } from '@/lib/webhooks/delivery';
import { prisma } from '@/lib/prisma';
import { MockBlockchainService, shouldUseMockService } from '@/lib/blockchain/mock-service';
import { getPaycrestService } from '@/lib/offramp/paycrest-service';
import { createEVMService } from '@/lib/blockchain/evm-service';
import { getNetworkSelector } from '@/lib/blockchain/network-selector';
import crypto from 'crypto';

// CORS headers for API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to create JSON response with CORS headers
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

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
 * Create a new stablecoin off-ramp order (USDC/USDT → Fiat)
 * 
 * Use Cases:
 * - Crypto exchanges offering fiat withdrawals
 * - Web3 companies paying contractors
 * - DeFi platforms enabling fiat off-ramps
 * - Stablecoin remittance services
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Stablecoin Off-Ramp API - Received request');

    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return jsonResponse({ success: false, error: auth.error }, 401);
    }

    const { user, senderProfile, isTestMode } = auth;

    console.log(`🔧 Test Mode: ${isTestMode ? 'ON' : 'OFF'}`);

    if (!user) {
      return jsonResponse({ success: false, error: 'Authentication failed' }, 401);
    }

    // Only senders can create off-ramp orders
    if (user.scope.toLowerCase() !== 'sender') {
      return jsonResponse({ success: false, error: 'Only senders can create off-ramp orders' }, 403);
    }

    if (!senderProfile) {
      return jsonResponse({ success: false, error: 'Sender profile not found. Please complete onboarding.' }, 400);
    }

    // Parse request body
    const body = await request.json();
    const {
      amount,              // USDC/USDT amount
      token = 'USDC',      // Default to USDC
      toCurrency,          // Destination currency (NGN, KES, TZS, etc.)
      recipientDetails: {
        bankCode: bodyBankCode,
        institution,       // Accept 'institution' as alias for 'bankCode'
        accountNumber,
        accountName,
        memo
      } = {},
      reference,
      webhookUrl
    } = body;

    // Accept either bankCode or institution
    const bankCode = bodyBankCode || institution;

    // Validate required fields
    if (!amount || !toCurrency || !bankCode || !accountNumber || !accountName) {
      return jsonResponse({ 
        success: false, 
        error: 'Missing required fields',
        required: {
          amount: 'USDC/USDT amount (e.g., 100)',
          token: 'USDC or USDT (optional, defaults to USDC)',
          toCurrency: 'Destination currency (e.g., NGN, KES, TZS)',
          recipientDetails: {
            bankCode: 'Bank code (e.g., GTB, CRDB)',
            accountNumber: 'Recipient account number',
            accountName: 'Recipient account name',
            memo: 'Optional payment memo'
          }
        }
      }, 400);
    }

    if (amount <= 0) {
      return jsonResponse({ success: false, error: 'Amount must be greater than 0' }, 400);
    }

    if (!['USDC', 'USDT'].includes(token.toUpperCase())) {
      return jsonResponse({ success: false, error: 'Only USDC and USDT tokens supported' }, 400);
    }

    // Check Paycrest support
    const paycrest = getPaycrestService();
    
    if (!paycrest.isCurrencySupported(toCurrency)) {
      return jsonResponse({ 
        success: false, 
        error: `Currency ${toCurrency} not supported`,
        supportedCurrencies: paycrest.getSupportedCurrencies()
      }, 400);
    }

    console.log(`✅ ${toCurrency} supported by Paycrest`);

    // Validate recipient
    const validation = paycrest.validateRecipient({
      institution: bankCode,
      accountIdentifier: accountNumber,
      accountName: accountName,
      currency: toCurrency,
      memo: memo
    });

    if (!validation.valid) {
      return jsonResponse({ success: false, error: 'Invalid recipient details', details: validation.errors }, 400);
    }

    // Calculate fees
    const markupPercentage = senderProfile.markup_percentage || 0.005; // 0.5% default for crypto
    const senderMarkup = amount * markupPercentage;
    
    // Platform revenue: Base fee + percentage (hybrid model)
    const baseFee = 0.25; // $0.25 base per transaction
    const platformFeePercentage = 0.0005; // 0.05% of transaction value
    const platformFee = baseFee + (amount * platformFeePercentage);

    // Get token record
    const tokenRecord = await prisma.tokens.findFirst({
      where: { 
        symbol: token.toUpperCase(),
        is_enabled: true 
      }
    });

    if (!tokenRecord) {
      return jsonResponse({ success: false, error: `${token} token not configured in system` }, 500);
    }

    // Create order ID
    const orderId = isTestMode 
      ? `test_offramp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}` 
      : `offramp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    console.log(`📝 Creating off-ramp order: ${orderId}`);

    // === PAYCREST INTEGRATION ===
    
    try {
      // Step 1: Get Paycrest rate
      console.log(`📊 Getting Paycrest rate for ${amount} ${token} → ${toCurrency}...`);
      
      const paycrestRate = await paycrest.getRate(
        token.toUpperCase() as 'USDC' | 'USDT',
        amount.toString(),
        toCurrency
      );
      
      console.log(`💱 Paycrest rate: 1 ${token} = ${paycrestRate.rate} ${toCurrency}`);
      console.log(`💰 Expected payout: ${paycrestRate.estimatedPayout} ${toCurrency}`);

      // Step 2: Create order in database (pending)
      const order = await prisma.payment_orders.create({
        data: {
          id: orderId,
          amount: parseFloat(amount),
          amount_paid: parseFloat(paycrestRate.estimatedPayout),
          amount_returned: 0,
          amount_in_usd: parseFloat(amount), // Already in USD
          sender_fee: paycrestRate.fees.senderFee,
          rate: parseFloat(paycrestRate.rate),
          receive_address_text: accountNumber,
          status: 'pending',
          sender_profile_payment_orders: senderProfile.id,
          token_payment_orders: tokenRecord.id,
          network_fee: paycrestRate.fees.transactionFee,
          fee_percent: markupPercentage,
          percent_settled: 0,
          protocol_fee: platformFee,
          reference: reference || null,
          is_test_mode: isTestMode,
          
          // Paycrest-specific tracking
          fulfillment_method: 'paycrest',
          
          // Revenue tracking
          bank_markup: senderMarkup,
          psp_commission: 0, // No PSP involved
          platform_fee: platformFee,
          
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ Order created in database: ${order.id}`);

      // Step 3: Create Paycrest order
      console.log(`📤 Creating Paycrest off-ramp order...`);
      
      const paycrestOrder = await paycrest.createOrder({
        amount: amount.toString(),
        token: token.toUpperCase() as 'USDC' | 'USDT',
        network: 'base',
        rate: paycrestRate.rate,
        recipient: {
          institution: bankCode,
          accountIdentifier: accountNumber,
          accountName: accountName,
          currency: toCurrency,
          memo: memo || `NedaPay ${orderId.substring(0, 12)}`
        },
        reference: orderId,
        returnAddress: process.env.BASE_REFUND_ADDRESS || process.env.BASE_TREASURY_ADDRESS!
      });

      console.log(`✅ Paycrest order created: ${paycrestOrder.id}`);
      console.log(`📍 Send ${token} to: ${paycrestOrder.receiveAddress}`);
      console.log(`⏰ Valid until: ${paycrestOrder.validUntil}`);

      // Step 4: Update order with Paycrest details
      await prisma.payment_orders.update({
        where: { id: orderId },
        data: {
          paycrest_order_id: paycrestOrder.id,
          receive_address_text: paycrestOrder.receiveAddress,
          paycrest_valid_until: new Date(paycrestOrder.validUntil),
          status: 'confirmed',
          updated_at: new Date()
        }
      });

      // Step 5: Send USDC on Base chain to Paycrest
      console.log(`💸 Sending ${token} on Base to Paycrest...`);
      
      // Get Base network
      const networkSelector = getNetworkSelector();
      const baseNetwork = await networkSelector.getNetworkByIdentifier('base');

      if (!baseNetwork) {
        throw new Error('Base network not configured. Please contact support.');
      }

      const baseService = createEVMService(baseNetwork);

      const txResult = await baseService.transferToken({
        tokenAddress: tokenRecord.contract_address,
        from: process.env.BASE_TREASURY_ADDRESS!,
        to: paycrestOrder.receiveAddress,
        amount: BigInt(Math.floor(parseFloat(amount) * 1_000_000)) // USDC has 6 decimals
      });

      if (!txResult.success) {
        throw new Error(`Base transfer failed: ${txResult.error}`);
      }

      console.log(`✅ ${token} sent on Base: ${txResult.transactionHash}`);

      // Step 6: Update order with transaction details
      await prisma.payment_orders.update({
        where: { id: orderId },
        data: {
          status: 'processing',
          tx_hash: txResult.transactionHash,
          tx_id: txResult.transactionId,
          network_used: 'base',
          updated_at: new Date()
        }
      });

      // Step 7: Log transaction
      await prisma.transaction_logs.create({
        data: {
          id: `paycrest_offramp_${orderId}_${Date.now()}`,
          payment_order_transactions: orderId,
          tx_hash: txResult.transactionHash!,
          network: 'base',
          status: 'paycrest_initiated',
          metadata: {
            type: 'paycrest_offramp',
            paycrest_order_id: paycrestOrder.id,
            receive_address: paycrestOrder.receiveAddress,
            valid_until: paycrestOrder.validUntil,
            expected_payout: paycrestOrder.expectedPayout
          },
          created_at: new Date()
        }
      });

      console.log(`✅ Off-ramp order processing via Paycrest`);

      // Step 8: Send webhook to sender (if configured)
      if (webhookUrl) {
        sendOrderWebhookToSender(webhookUrl, {
          orderId: order.id,
          status: 'processing',
          fromAmount: amount,
          fromCurrency: token,
          toAmount: parseFloat(paycrestRate.estimatedPayout),
          toCurrency: toCurrency,
          reference: reference,
          txHash: txResult.transactionHash,
          networkUsed: 'base'
        }).catch(err => console.error('Webhook delivery failed:', err));
      }

      // Success response
      return jsonResponse({
        success: true,
        orderId: order.id,
        status: 'processing',
        fromAmount: amount,
        fromCurrency: token,
        toAmount: parseFloat(paycrestRate.estimatedPayout),
        toCurrency: toCurrency,
        exchangeRate: parseFloat(paycrestRate.rate),
        fees: {
          senderMarkup: senderMarkup,
          platformFee: platformFee,
          paycrestSenderFee: paycrestRate.fees.senderFee,
          networkFee: paycrestRate.fees.transactionFee,
          totalFees: senderMarkup + platformFee + paycrestRate.fees.senderFee + paycrestRate.fees.transactionFee
        },
        paycrest: {
          orderId: paycrestOrder.id,
          receiveAddress: paycrestOrder.receiveAddress,
          validUntil: paycrestOrder.validUntil
        },
        blockchain: {
          network: 'base',
          transactionHash: txResult.transactionHash
        },
        estimatedCompletion: '1-2 minutes',
        createdAt: order.created_at.toISOString(),
        reference: reference || null,
        testMode: isTestMode,
        message: 'Off-ramp order created successfully. Fiat will be delivered to recipient bank account within 1-2 minutes.'
      });

    } catch (paycrestError: any) {
      console.error('❌ Paycrest fulfillment error:', paycrestError);
      
      // Try to mark order as failed if it was created
      try {
        await prisma.payment_orders.updateMany({
          where: { id: orderId },
          data: {
            status: 'failed',
            updated_at: new Date()
          }
        });
      } catch (dbError) {
        console.error('Failed to update order status:', dbError);
      }

      return jsonResponse({
        success: false,
        error: 'Off-ramp fulfillment failed',
        details: paycrestError.message,
        orderId: orderId
      }, 500);
    }

  } catch (error: any) {
    console.error('❌ Error creating off-ramp order:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to create off-ramp order',
      details: error.message
    }, 500);
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
      return jsonResponse({ success: false, error: auth.error }, 401);
    }

    const { user, senderProfile, providerProfile, isTestMode } = auth;

    if (!user) {
      return jsonResponse({ success: false, error: 'Authentication failed' }, 401);
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

      return jsonResponse({
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

      return jsonResponse({
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
      return jsonResponse({ success: false, error: 'Unauthorized: Only senders and providers can list orders' }, 403);
    }

  } catch (error) {
    console.error('❌ Error listing payment orders:', error);
    return jsonResponse({ 
      success: false, 
      error: 'Failed to list payment orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
