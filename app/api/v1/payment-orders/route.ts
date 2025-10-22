import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendOrderWebhookToSender, sendOrderWebhookToPSP } from '@/lib/webhooks/delivery';

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
            user_sender_profile: true
          }
        },
        provider_profiles: {
          select: {
            id: true,
            commission_rate: true,
            user_provider_profile: true
          }
        }
      }
    });

    if (!key) {
      return { authenticated: false, error: 'Invalid API key' };
    }

    // Get user from profile
    let userId: string | null = null;
    let scope: string | null = null;
    let profile: any = null;

    if (key.sender_profiles) {
      userId = key.sender_profiles.user_sender_profile;
      scope = 'sender';
      profile = key.sender_profiles;
    } else if (key.provider_profiles) {
      userId = key.provider_profiles.user_provider_profile;
      scope = 'provider';
      profile = key.provider_profiles;
    } else {
      return { authenticated: false, error: 'API key not linked to any profile' };
    }

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
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
      providerProfile: key.provider_profiles
    };
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

// Get available PSP for order fulfillment
async function assignPSP(toCurrency: string, amount: number) {
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

    const { user, senderProfile } = auth;

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

    // Create payment order
    const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    
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
        status: 'pending',
        sender_profile_payment_orders: senderProfile.id,
        token_payment_orders: defaultToken.id,
        network_fee: 0,
        fee_percent: markupPercentage,
        percent_settled: 0,
        protocol_fee: platformFee,
        reference: reference || null,
        
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
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      createdAt: order.created_at.toISOString(),
      reference: reference || null
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

    const { user, senderProfile } = auth;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    let orders;

    if (user.scope.toLowerCase() === 'sender' || user.scope.toLowerCase() === 'bank') {
      // Bank view: their submitted orders
      const whereClause: any = {
        sender_profile_payment_orders: senderProfile?.id || ''
      };

      if (status) {
        whereClause.status = status;
      }

      orders = await prisma.payment_orders.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: limit,
        include: {
          tokens: {
            select: { symbol: true }
          }
        }
      });
    } else {
      // Other roles can't list orders via this API
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        orderId: order.id,
        status: order.status,
        fromAmount: order.amount,
        toAmount: order.amount_paid,
        exchangeRate: order.rate,
        bankMarkup: order.bank_markup,
        reference: order.reference,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        txHash: order.tx_hash
      })),
      count: orders.length
    });

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
