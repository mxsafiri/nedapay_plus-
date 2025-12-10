import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/webhooks/paycrest
 * Receives status updates from Paycrest for off-ramp orders
 * 
 * Webhook Events:
 * - order.pending: Order created, awaiting USDC
 * - order.processing: USDC received, converting to fiat
 * - order.fulfilled: Fiat sent to recipient bank
 * - order.settled: Recipient confirmed receipt
 * - order.cancelled: Order cancelled or expired
 * - order.refunded: USDC refunded to sender
 */
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();
    console.log('📨 Paycrest webhook received:', JSON.stringify(webhook, null, 2));

    const { 
      orderId,           // Paycrest order ID
      status,            // Order status
      reference,         // Your internal order ID
      transactionHash,   // Blockchain tx hash (if applicable)
      completedAt,       // Completion timestamp
      failureReason,     // Reason if failed
      event             // Webhook event type
    } = webhook;

    if (!orderId && !reference) {
      console.error('⚠️ Webhook missing orderId or reference');
      return NextResponse.json({ error: 'Missing orderId or reference' }, { status: 400 });
    }

    // Find order by Paycrest order ID or our reference
    const whereClause: any = {};
    if (orderId) {
      whereClause.paycrest_order_id = orderId;
    } else if (reference) {
      whereClause.id = reference;
    }

    const order = await prisma.payment_orders.findFirst({
      where: whereClause,
      include: {
        sender_profiles: {
          select: { 
            webhook_url: true,
            users: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!order) {
      console.error(`⚠️ Order not found for webhook:`, { orderId, reference });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`📊 Processing webhook for order: ${order.id}`);

    // Map Paycrest status to our internal status
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'processing',
      'fulfilled': 'completed',
      'validated': 'completed',
      'settled': 'completed',
      'cancelled': 'failed',
      'refunded': 'failed',
      'expired': 'failed'
    };

    const nedapayStatus = statusMap[status] || 'processing';
    const isCompleted = ['fulfilled', 'validated', 'settled'].includes(status);
    const isFailed = ['cancelled', 'refunded', 'expired'].includes(status);

    console.log(`📊 Status update: ${status} → ${nedapayStatus}`);

    // Update order status
    const updateData: any = {
      status: nedapayStatus,
      updated_at: new Date()
    };

    // Mark as completed if fulfilled
    if (isCompleted) {
      updateData.percent_settled = 100;
      updateData.settlement_status = 'completed';
      updateData.settled_at = completedAt ? new Date(completedAt) : new Date();
    }

    // Add failure reason if failed
    if (isFailed && failureReason) {
      updateData.failure_reason = failureReason;
    }

    await prisma.payment_orders.update({
      where: { id: order.id },
      data: updateData
    });

    console.log(`✅ Order ${order.id} updated to status: ${nedapayStatus}`);

    // Log webhook event
    await prisma.transaction_logs.create({
      data: {
        id: crypto.randomUUID(),
        payment_order_transactions: order.id,
        tx_hash: transactionHash || `paycrest_${event || status}`,
        network: 'paycrest',
        status: `paycrest_${status}`,
        metadata: { 
          webhook_event: event,
          webhook_data: webhook,
          paycrest_order_id: orderId
        },
        created_at: new Date()
      }
    });

    console.log(`📝 Webhook logged to transaction_logs`);

    // Notify sender via their webhook (if configured)
    if (order.sender_profiles?.webhook_url) {
      try {
        const senderWebhookPayload = {
          orderId: order.id,
          status: nedapayStatus,
          reference: order.reference,
          paycrestOrderId: orderId,
          paycrestStatus: status,
          completedAt: isCompleted ? (completedAt || new Date().toISOString()) : undefined,
          failureReason: isFailed ? failureReason : undefined,
          event: event
        };

        console.log(`🔔 Notifying sender at: ${order.sender_profiles.webhook_url}`);
        
        const response = await fetch(order.sender_profiles.webhook_url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'NedaPay-Plus/1.0'
          },
          body: JSON.stringify(senderWebhookPayload)
        });

        if (response.ok) {
          console.log(`✅ Sender notified successfully`);
        } else {
          console.error(`⚠️ Sender webhook failed: ${response.status} ${response.statusText}`);
        }
      } catch (webhookError: any) {
        console.error('⚠️ Failed to notify sender via webhook:', webhookError.message);
      }
    }

    console.log(`✅ Paycrest webhook processed successfully`);

    // Return success
    return NextResponse.json({ 
      success: true,
      orderId: order.id,
      status: nedapayStatus,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error('❌ Paycrest webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/paycrest
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'Paycrest Webhook Handler',
    status: 'online',
    timestamp: new Date().toISOString()
  });
}
