/**
 * Vercel Cron Job - Process Demo Orders
 * Runs every minute to auto-complete pending demo orders
 * 
 * This allows the demo to work 24/7 even when your computer is off
 * 
 * Configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-demo-orders",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

// Verify this is called by Vercel Cron (security)
function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // In production, verify cron secret
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }
  
  // In development, allow all
  return true;
}

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
        fulfillment_count: 'asc', // Round-robin
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

async function processPendingOrders() {
  try {
    // Find pending demo orders that need PSP assignment
    const pendingOrders = await prisma.payment_orders.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        assigned_psp_id: null,
        is_test_mode: true, // ⚠️ DEMO ONLY - Never touches live orders
      },
      orderBy: {
        created_at: 'asc', // FIFO
      },
      take: 10, // Process up to 10 per run
      include: {
        sender_profiles: { select: { webhook_url: true } },
        tokens: { select: { symbol: true } },
      },
    });

    console.log(`📊 Found ${pendingOrders.length} pending demo orders`);

    // Assign PSP and mark as processing
    for (const order of pendingOrders) {
      const psp = await getAvailablePSP();
      if (!psp) {
        console.log(`⚠️ No available PSPs for order ${order.id}`);
        continue;
      }

      // Update to processing
      await prisma.payment_orders.update({
        where: { id: order.id },
        data: {
          status: 'processing',
          assigned_psp_id: psp.id,
          updated_at: new Date(),
        },
      });

      // Increment PSP fulfillment count
      await prisma.provider_profiles.update({
        where: { id: psp.id },
        data: {
          fulfillment_count: { increment: 1 },
        },
      });

      console.log(`🔄 Assigned order ${order.id} to ${psp.name}`);
    }

    // Find processing orders that are ready to complete (older than 30 seconds)
    const processingOrders = await prisma.payment_orders.findMany({
      where: {
        status: 'processing',
        is_test_mode: true, // ⚠️ DEMO ONLY
        updated_at: {
          lte: new Date(Date.now() - 30000), // At least 30 seconds old
        },
      },
      take: 10,
      include: {
        sender_profiles: true,
        tokens: { select: { symbol: true } },
      },
    });

    console.log(`📊 Found ${processingOrders.length} orders ready to complete`);

    // Complete orders
    for (const order of processingOrders) {
      const txHash = generateMockTxHash();
      const settlementHash = generateMockTxHash();
      const network = 'hedera-testnet';

      // Update order to completed
      await prisma.payment_orders.update({
        where: { id: order.id },
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
            type: 'cron_demo_fulfillment',
            psp_id: order.assigned_psp_id,
            fulfillment_method: 'mpesa',
            completed_by: 'vercel-cron-bot',
          },
          created_at: new Date(),
        },
      });

      console.log(`✅ Completed order ${order.id}`);
      console.log(`   Tx Hash: ${txHash}`);
      console.log(`   Bank Markup: $${order.bank_markup.toFixed(2)}`);
      console.log(`   PSP Commission: $${order.psp_commission.toFixed(2)}`);
    }

    return {
      pending: pendingOrders.length,
      completed: processingOrders.length,
    };

  } catch (error) {
    console.error('Error processing demo orders:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron authentication
    if (!isValidCronRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🤖 Vercel Cron: Processing demo orders...');
    
    const result = await processPendingOrders();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: {
        assigned: result.pending,
        completed: result.completed,
      },
      message: `Processed ${result.pending + result.completed} demo orders`,
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process demo orders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual triggers)
export async function POST(request: NextRequest) {
  return GET(request);
}
