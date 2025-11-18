/**
 * On-Demand Demo Order Processing
 * This endpoint can be called by the frontend to process pending demo orders
 * No cron needed - works on free tier!
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

function generateMockTxHash(): string {
  const accountId = Math.floor(Math.random() * 10000000);
  const timestamp = Date.now() / 1000;
  return `0.0.${accountId}@${timestamp.toFixed(3)}`;
}

async function getAvailablePSP(): Promise<{ id: string; name: string } | null> {
  try {
    const psp = await prisma.provider_profiles.findFirst({
      where: {
        is_active: true,
        is_available: true,
        is_kyb_verified: true,
      },
      orderBy: {
        fulfillment_count: 'asc',
      },
      select: {
        id: true,
        trading_name: true,
      },
    });

    if (!psp) return null;
    
    return {
      id: psp.id,
      name: psp.trading_name || 'Unknown PSP',
    };
  } catch (error) {
    console.error('Error getting available PSP:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId },
      include: {
        sender_profiles: true,
        tokens: { select: { symbol: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only process demo orders
    if (!order.is_test_mode) {
      return NextResponse.json(
        { success: false, error: 'Can only process demo orders' },
        { status: 403 }
      );
    }

    // Check current status
    if (order.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Order already completed',
        order: {
          id: order.id,
          status: order.status,
          tx_hash: order.tx_hash,
          settlement_tx_hash: order.settlement_tx_hash,
        },
      });
    }

    // If pending, assign PSP
    if (order.status === 'pending' && !order.assigned_psp_id) {
      const psp = await getAvailablePSP();
      if (!psp) {
        return NextResponse.json(
          { success: false, error: 'No available PSPs' },
          { status: 503 }
        );
      }

      await prisma.payment_orders.update({
        where: { id: orderId },
        data: {
          status: 'processing',
          assigned_psp_id: psp.id,
          updated_at: new Date(),
        },
      });

      await prisma.provider_profiles.update({
        where: { id: psp.id },
        data: {
          fulfillment_count: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        status: 'processing',
        message: 'PSP assigned, processing...',
        pspName: psp.name,
        estimatedCompletion: 30,
      });
    }

    // If processing and enough time passed (30+ seconds), complete it
    if (order.status === 'processing') {
      const elapsed = Date.now() - new Date(order.updated_at).getTime();
      
      if (elapsed < 30000) {
        return NextResponse.json({
          success: true,
          status: 'processing',
          message: 'Still processing...',
          remainingSeconds: Math.ceil((30000 - elapsed) / 1000),
        });
      }

      // Complete the order
      const txHash = generateMockTxHash();
      const settlementHash = generateMockTxHash();
      const network = 'hedera-testnet';

      await prisma.payment_orders.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          tx_hash: txHash,
          tx_id: txHash,
          network_used: network,
          settlement_tx_hash: settlementHash,
          settlement_network: network,
          settlement_status: 'completed',
          settled_at: new Date(),
          fulfillment_method: 'mpesa',
          updated_at: new Date(),
        },
      });

      // Update PSP commissions
      if (order.assigned_psp_id) {
        await prisma.provider_profiles.update({
          where: { id: order.assigned_psp_id },
          data: {
            total_commissions: { increment: order.psp_commission },
            monthly_commissions: { increment: order.psp_commission },
          },
        });
      }

      // Update bank earnings
      if (order.sender_profile_payment_orders) {
        await prisma.sender_profiles.update({
          where: { id: order.sender_profile_payment_orders },
          data: {
            total_earnings: { increment: order.bank_markup },
            monthly_earnings: { increment: order.bank_markup },
          },
        });
      }

      // Create transaction log
      await prisma.transaction_logs.create({
        data: {
          id: crypto.randomUUID(),
          payment_order_transactions: order.id,
          tx_hash: settlementHash,
          network: network,
          status: 'auto_completed',
          metadata: {
            type: 'on_demand_demo_fulfillment',
            psp_id: order.assigned_psp_id,
            fulfillment_method: 'mpesa',
            completed_by: 'frontend-polling',
          },
          created_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Order completed!',
        order: {
          id: order.id,
          status: 'completed',
          tx_hash: txHash,
          settlement_tx_hash: settlementHash,
          settlement_network: network,
          bank_markup: order.bank_markup,
          psp_commission: order.psp_commission,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      message: 'Order status retrieved',
    });

  } catch (error) {
    console.error('❌ Error processing demo order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process demo order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if processing is needed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      // Return count of pending demo orders
      const pending = await prisma.payment_orders.count({
        where: {
          is_test_mode: true,
          status: { in: ['pending', 'processing'] },
        },
      });

      return NextResponse.json({
        success: true,
        pendingOrders: pending,
      });
    }

    // Get specific order status
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        assigned_psp_id: true,
        tx_hash: true,
        settlement_tx_hash: true,
        updated_at: true,
        is_test_mode: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        canProcess: order.is_test_mode && order.status !== 'completed',
      },
    });

  } catch (error) {
    console.error('Error checking order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check order' },
      { status: 500 }
    );
  }
}
