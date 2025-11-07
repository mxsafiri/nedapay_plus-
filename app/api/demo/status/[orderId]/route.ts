import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/demo/status/[orderId]
 * Public endpoint to check demo order status
 * No authentication required for demo mode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Find the order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId },
      include: {
        sender_profiles: {
          select: {
            user_sender_profile: true
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

    // Return order status
    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        status: order.status,
        amount: order.amount,
        amountPaid: order.amount_paid,
        bankMarkup: order.bank_markup,
        pspCommission: order.psp_commission,
        txHash: order.tx_hash,
        settlementTxHash: order.settlement_tx_hash,
        settlementStatus: order.settlement_status,
        networkUsed: order.network_used,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }
    });
  } catch (error) {
    console.error('Error fetching demo order status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
