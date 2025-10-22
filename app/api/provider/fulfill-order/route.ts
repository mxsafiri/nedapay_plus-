import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import { sendOrderWebhookToSender } from '@/lib/webhooks/delivery';

/**
 * POST /api/provider/fulfill-order
 * PSP updates order status via UI (session-based auth)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 PSP fulfilling order...');
    
    // Authenticate via session
    const user = await getUserFromRequest(request);

    if (!user) {
      console.error('❌ Unauthorized - no user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.scope.toLowerCase();
    
    // Only PSPs can fulfill orders
    if (userRole !== 'provider' && userRole !== 'psp') {
      return NextResponse.json(
        { error: 'Only PSPs can fulfill payment orders' },
        { status: 403 }
      );
    }

    // Get provider profile
    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id },
      select: { id: true }
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderId, status, txHash, txId, networkUsed } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is assigned to this PSP
    if (order.assigned_psp_id !== providerProfile.id) {
      return NextResponse.json(
        { error: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validStatuses = ['processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: processing, completed, or failed' },
        { status: 400 }
      );
    }

    // Validate tx hash for completed orders
    if (status === 'completed' && !txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required for completed orders' },
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
          },
          fulfillment_count: {
            increment: 1
          },
          updated_at: new Date()
        }
      });

      console.log('✅ Payment order completed. Commissions updated.');
    }

    // Send webhook to bank
    if (order.sender_profile_payment_orders) {
      const senderProfile = await prisma.sender_profiles.findUnique({
        where: { id: order.sender_profile_payment_orders },
        select: { webhook_url: true }
      });

      if (senderProfile?.webhook_url) {
        // Get token for currency info
        const token = await prisma.tokens.findUnique({
          where: { id: Number(updatedOrder.token_payment_orders) },
          select: { symbol: true }
        });

        sendOrderWebhookToSender(senderProfile.webhook_url, {
          orderId: updatedOrder.id,
          status: updatedOrder.status,
          fromAmount: updatedOrder.amount,
          fromCurrency: 'TZS', // Default source currency
          toAmount: updatedOrder.amount_paid,
          toCurrency: token?.symbol || 'USDC',
          bankMarkup: updatedOrder.bank_markup,
          txHash: updatedOrder.tx_hash || undefined,
          networkUsed: updatedOrder.network_used || undefined,
          completedAt: status === 'completed' ? new Date() : undefined,
          reference: updatedOrder.reference || undefined
        }).catch(err => console.error('Webhook delivery to sender failed:', err));
      }
    }

    console.log('✅ Order updated successfully:', orderId);

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        txHash: updatedOrder.tx_hash,
        networkUsed: updatedOrder.network_used
      }
    });

  } catch (error) {
    console.error('❌ Error fulfilling order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
