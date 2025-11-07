/**
 * Virtual PSP Bot
 * Automatically fulfills pending payment orders to simulate real PSP behavior
 * 
 * Features:
 * - Monitors pending orders in real-time
 * - Auto-assigns to available PSPs
 * - Simulates processing delay (30-90 seconds)
 * - Marks orders as completed with mock tx data
 * - Triggers USDC settlement flow
 * 
 * Usage: npm run demo:bot
 * Keep running during demos for automatic fulfillment
 */

import { PrismaClient } from '../lib/generated/prisma';
import * as crypto from 'crypto';

// Use direct connection for reliable order processing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

// Configuration
const CONFIG = {
  POLL_INTERVAL_MS: 5000, // Check for new orders every 5 seconds
  MIN_PROCESSING_TIME_MS: 30000, // Min 30 seconds to "process"
  MAX_PROCESSING_TIME_MS: 90000, // Max 90 seconds
  MAX_CONCURRENT_ORDERS: 10, // Process up to 10 orders simultaneously
};

interface ProcessingOrder {
  orderId: string;
  startTime: number;
  processingDuration: number;
  pspId: string;
  pspName: string;
}

const processingOrders = new Map<string, ProcessingOrder>();

function generateMockTxHash(): string {
  const accountId = Math.floor(Math.random() * 10000000);
  const timestamp = Date.now() / 1000;
  return `0.0.${accountId}@${timestamp.toFixed(3)}`;
}

function getRandomProcessingTime(): number {
  const min = CONFIG.MIN_PROCESSING_TIME_MS;
  const max = CONFIG.MAX_PROCESSING_TIME_MS;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
        fulfillment_count: 'asc', // Round-robin assignment
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

async function startProcessingOrder(orderId: string, pspId: string, pspName: string) {
  const processingDuration = getRandomProcessingTime();
  
  processingOrders.set(orderId, {
    orderId,
    startTime: Date.now(),
    processingDuration,
    pspId,
    pspName,
  });

  console.log(`🔄 [${new Date().toLocaleTimeString()}] Processing order: ${orderId}`);
  console.log(`   PSP: ${pspName}`);
  console.log(`   Duration: ${(processingDuration / 1000).toFixed(0)}s`);

  // Update order to processing status
  try {
    await prisma.payment_orders.update({
      where: { id: orderId },
      data: {
        status: 'processing',
        assigned_psp_id: pspId,
        updated_at: new Date(),
      },
    });

    // Increment PSP fulfillment count
    await prisma.provider_profiles.update({
      where: { id: pspId },
      data: {
        fulfillment_count: { increment: 1 },
      },
    });
  } catch (error) {
    console.error(`❌ Error updating order ${orderId}:`, error);
    processingOrders.delete(orderId);
  }
}

async function completeOrder(processing: ProcessingOrder) {
  const { orderId, pspId, pspName } = processing;

  try {
    // Get order details
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId },
      include: {
        tokens: { select: { symbol: true } },
        sender_profiles: { select: { webhook_url: true } },
      },
    });

    if (!order) {
      console.error(`❌ Order ${orderId} not found`);
      processingOrders.delete(orderId);
      return;
    }

    // Generate mock transaction data
    const txHash = generateMockTxHash();
    const settlementHash = generateMockTxHash();
    const network = 'hedera-testnet';

    // Update order to completed
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
    await prisma.provider_profiles.update({
      where: { id: pspId },
      data: {
        total_commissions: { increment: order.psp_commission },
        monthly_commissions: { increment: order.psp_commission },
      },
    });

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
        payment_order_transactions: orderId,
        tx_hash: settlementHash,
        network: network,
        status: 'auto_completed',
        metadata: {
          type: 'virtual_psp_fulfillment',
          psp_id: pspId,
          psp_name: pspName,
          fulfillment_method: 'mpesa',
          processing_time_ms: Date.now() - processing.startTime,
          completed_by: 'virtual-psp-bot',
        },
        created_at: new Date(),
      },
    });

    console.log(`✅ [${new Date().toLocaleTimeString()}] Completed order: ${orderId}`);
    console.log(`   PSP: ${pspName}`);
    console.log(`   Tx Hash: ${txHash}`);
    console.log(`   Settlement: ${settlementHash}`);
    console.log(`   Bank Markup: $${order.bank_markup.toFixed(2)}`);
    console.log(`   PSP Commission: $${order.psp_commission.toFixed(2)}\n`);

    processingOrders.delete(orderId);
  } catch (error) {
    console.error(`❌ Error completing order ${orderId}:`, error);
    processingOrders.delete(orderId);
  }
}

async function checkProcessingOrders() {
  const now = Date.now();

  for (const [orderId, processing] of processingOrders.entries()) {
    const elapsed = now - processing.startTime;

    if (elapsed >= processing.processingDuration) {
      await completeOrder(processing);
    }
  }
}

async function findNewOrders() {
  // Don't queue more if we're at capacity
  if (processingOrders.size >= CONFIG.MAX_CONCURRENT_ORDERS) {
    return;
  }

  try {
    // Find pending orders that aren't already being processed
    const pendingOrders = await prisma.payment_orders.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        assigned_psp_id: null, // Not yet assigned
      },
      orderBy: {
        created_at: 'asc', // FIFO
      },
      take: CONFIG.MAX_CONCURRENT_ORDERS - processingOrders.size,
      select: {
        id: true,
        amount: true,
        created_at: true,
      },
    });

    for (const order of pendingOrders) {
      // Skip if already processing
      if (processingOrders.has(order.id)) continue;

      // Get available PSP
      const psp = await getAvailablePSP();
      if (!psp) {
        console.log(`⚠️ No available PSPs for order ${order.id}`);
        continue;
      }

      // Start processing
      await startProcessingOrder(order.id, psp.id, psp.name);
    }
  } catch (error) {
    console.error('Error finding new orders:', error);
  }
}

async function runBot() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          VIRTUAL PSP BOT - AUTO FULFILLMENT          ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('🤖 Bot Configuration:');
  console.log(`   Poll Interval: ${CONFIG.POLL_INTERVAL_MS / 1000}s`);
  console.log(`   Processing Time: ${CONFIG.MIN_PROCESSING_TIME_MS / 1000}-${CONFIG.MAX_PROCESSING_TIME_MS / 1000}s`);
  console.log(`   Max Concurrent: ${CONFIG.MAX_CONCURRENT_ORDERS} orders`);
  console.log('\n');
  console.log('🚀 Bot started! Monitoring for pending orders...\n');
  console.log('Press Ctrl+C to stop\n');
  console.log('─────────────────────────────────────────────────────────\n');

  // Main loop
  setInterval(async () => {
    await checkProcessingOrders();
    await findNewOrders();
  }, CONFIG.POLL_INTERVAL_MS);

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down Virtual PSP Bot...');
    console.log(`   Orders still processing: ${processingOrders.size}`);
    console.log('   Goodbye!\n');
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Start the bot
runBot().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
