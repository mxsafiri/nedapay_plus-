import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderWebhookToSender } from '@/lib/webhooks/delivery';
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

// Authenticate via API key
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header' };
  }

  const apiKey = authHeader.substring(7);

  try {
    // Hash the incoming API key to match against stored hash
    const hashedKey = hashApiKey(apiKey);
    
    const key = await prisma.api_keys.findUnique({
      where: { secret: hashedKey },
      include: {
        sender_profiles: {
          select: {
            id: true,
            user_sender_profile: true
          }
        },
        provider_profiles: {
          select: {
            id: true,
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
    if (key.sender_profiles) {
      userId = key.sender_profiles.user_sender_profile;
    } else if (key.provider_profiles) {
      userId = key.provider_profiles.user_provider_profile;
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

/**
 * GET /api/v1/payment-orders/:orderId
 * Get detailed status of a specific payment order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('📥 Getting payment order:', orderId);

    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { user, senderProfile, providerProfile } = auth;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId },
      include: {
        tokens: {
          select: {
            symbol: true,
            contract_address: true
          }
        },
        sender_profiles: {
          select: {
            id: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const userRole = user.scope.toLowerCase();
    const isSender = userRole === 'sender' || userRole === 'bank';
    const isProvider = userRole === 'provider' || userRole === 'psp';

    // Senders can only see their own orders
    if (isSender && order.sender_profile_payment_orders !== senderProfile?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this order' },
        { status: 403 }
      );
    }

    // Providers can only see orders assigned to them
    if (isProvider && order.assigned_psp_id !== providerProfile?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this order' },
        { status: 403 }
      );
    }

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        status: order.status,
        fromAmount: order.amount,
        toAmount: order.amount_paid,
        amountInUsd: order.amount_in_usd,
        exchangeRate: order.rate,
        bankMarkup: order.bank_markup,
        pspCommission: order.psp_commission,
        platformFee: order.platform_fee,
        token: order.tokens.symbol,
        txHash: order.tx_hash,
        txId: order.tx_id,
        networkUsed: order.network_used,
        receiveAddress: order.receive_address_text,
        reference: order.reference,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        // Only show PSP info to senders, hide from PSPs (privacy)
        ...(isSender && { assignedPspId: order.assigned_psp_id })
      }
    });

  } catch (error) {
    console.error('❌ Error getting payment order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/payment-orders/:orderId
 * Update order status (PSP fulfillment)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('📥 Updating payment order:', orderId);

    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { user, providerProfile } = auth;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Only PSPs can update orders
    if (user.scope.toLowerCase() !== 'provider' && user.scope.toLowerCase() !== 'psp') {
      return NextResponse.json(
        { success: false, error: 'Only PSPs can update payment orders' },
        { status: 403 }
      );
    }

    if (!providerProfile) {
      return NextResponse.json(
        { success: false, error: 'Provider profile not found' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is assigned to this PSP
    if (order.assigned_psp_id !== providerProfile.id) {
      return NextResponse.json(
        { success: false, error: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, txHash, txId, networkUsed } = body;

    // Validate status transitions
    const validStatuses = ['processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: processing, completed, or failed' },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.payment_orders.update({
      where: { id: orderId },
      data: {
        status: status,
        tx_hash: txHash || order.tx_hash,
        tx_id: txId || order.tx_id,
        network_used: networkUsed || order.network_used,
        updated_at: new Date()
      }
    });

    // If completed, update PSP commissions
    if (status === 'completed') {
      await prisma.provider_profiles.update({
        where: { id: providerProfile.id },
        data: {
          total_commissions: {
            increment: order.psp_commission
          },
          monthly_commissions: {
            increment: order.psp_commission
          }
        }
      });

      // Update sender earnings
      if (order.sender_profile_payment_orders) {
        await prisma.sender_profiles.update({
          where: { id: order.sender_profile_payment_orders },
          data: {
            total_earnings: {
              increment: order.bank_markup
            },
            monthly_earnings: {
              increment: order.bank_markup
            }
          }
        });
      }

      console.log('✅ Payment order completed. Commissions updated.');
    }

    // Send webhook to bank
    if (order.sender_profile_payment_orders) {
      const senderProfile = await prisma.sender_profiles.findUnique({
        where: { id: order.sender_profile_payment_orders },
        select: { webhook_url: true }
      });

      if (senderProfile?.webhook_url) {
        sendOrderWebhookToSender(senderProfile.webhook_url, {
          orderId: updatedOrder.id,
          status: updatedOrder.status,
          fromAmount: updatedOrder.amount,
          fromCurrency: 'TZS', // TODO: Get from order
          toAmount: updatedOrder.amount_paid,
          toCurrency: 'CNY', // TODO: Get from order
          bankMarkup: updatedOrder.bank_markup,
          txHash: updatedOrder.tx_hash || undefined,
          txId: updatedOrder.tx_id || undefined,
          networkUsed: updatedOrder.network_used || undefined,
          completedAt: status === 'completed' ? new Date() : undefined,
          reference: updatedOrder.reference || undefined
        }).catch(err => console.error('Webhook delivery to sender failed:', err));
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        txHash: updatedOrder.tx_hash,
        updatedAt: updatedOrder.updated_at
      },
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('❌ Error updating payment order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
