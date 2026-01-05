/**
 * Settlement Service
 * Handles USDC settlements to providers after they fulfill fiat orders
 */

import { prisma } from '@/lib/prisma';
import { getTransactionRouter } from '@/lib/blockchain/transaction-router';
import crypto from 'crypto';

export interface SettlementResult {
  success: boolean;
  transactionId?: string;
  networkUsed?: string;
  amount?: number;
  error?: string;
}

/**
 * Settle a single completed order with the provider
 */
export async function settleProviderOrder(orderId: string): Promise<SettlementResult> {
  console.log(`💰 Starting settlement for order ${orderId}...`);
  
  try {
    // Get order
    const order = await prisma.payment_orders.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'completed') {
      throw new Error(`Order not completed yet (status: ${order.status})`);
    }

    if (order.settlement_status === 'completed') {
      console.log(`⚠️ Order ${orderId} already settled`);
      return {
        success: true,
        transactionId: order.settlement_tx_hash || '',
        networkUsed: order.settlement_network || '',
        amount: Number(order.amount_paid) + Number(order.psp_commission)
      };
    }

    if (!order.assigned_psp_id) {
      throw new Error('Order has no assigned provider');
    }

    // Fetch provider separately
    const provider = await prisma.provider_profiles.findUnique({
      where: { id: order.assigned_psp_id },
      select: {
        id: true,
        trading_name: true,
        treasury_accounts: true,
        user_provider_profile: true
      }
    });

    if (!provider) {
      throw new Error('Provider not found for order');
    }

    // Calculate settlement amount (reimbursement + commission)
    const reimbursement = Number(order.amount_paid);
    const commission = Number(order.psp_commission);
    const settlementAmount = reimbursement + commission;
    
    console.log(`💵 Settlement breakdown for ${provider.trading_name}:`);
    console.log(`   - Reimbursement: $${reimbursement.toFixed(2)}`);
    console.log(`   - Commission: $${commission.toFixed(2)}`);
    console.log(`   - Total: $${settlementAmount.toFixed(2)} USDC`);

    // Get provider's settlement wallet
    const treasuryAccounts = provider.treasury_accounts as any;
    
    // Try mainnet first, fallback to testnet
    const providerWallet = 
      treasuryAccounts?.['hedera-mainnet'] || 
      treasuryAccounts?.['hedera-testnet'] ||
      treasuryAccounts?.['base'] ||
      treasuryAccounts?.['base-sepolia'];

    if (!providerWallet) {
      throw new Error(
        `Provider ${provider.trading_name} has no settlement wallet configured. ` +
        `They need to complete wallet setup in their onboarding.`
      );
    }

    console.log(`📤 Settling to provider wallet: ${providerWallet}`);

    // Execute blockchain transfer
    const router = getTransactionRouter();
    const result = await router.transfer({
      from: process.env.HEDERA_OPERATOR_ID!, // NedaPay treasury
      to: providerWallet,
      tokenSymbol: 'USDC',
      amount: settlementAmount,
      memo: `Settlement: ${orderId.substring(0, 8)}`
    });

    if (!result.success) {
      throw new Error(result.error || 'Settlement transaction failed');
    }

    console.log(`✅ Blockchain transfer successful: ${result.transactionId}`);

    // Update order with settlement info
    await prisma.payment_orders.update({
      where: { id: orderId },
      data: {
        settlement_tx_hash: result.transactionId,
        settlement_network: result.networkUsed,
        settlement_status: 'completed',
        settled_at: new Date(),
        updated_at: new Date()
      }
    });

    // Log settlement transaction
    await prisma.transaction_logs.create({
      data: {
        id: crypto.randomUUID(),
        payment_order_transactions: orderId,
        tx_hash: result.transactionId,
        network: result.networkUsed,
        status: 'settlement_completed',
        metadata: {
          type: 'provider_settlement',
          amount: settlementAmount,
          provider_id: provider.id,
          provider_wallet: providerWallet,
          reimbursement: reimbursement,
          commission: commission,
          fulfillment_method: order.fulfillment_method || order.network_used,
          settled_at: new Date().toISOString()
        },
        created_at: new Date()
      }
    });

    console.log(`✅ Settlement completed successfully`);

    return {
      success: true,
      transactionId: result.transactionId,
      networkUsed: result.networkUsed,
      amount: settlementAmount
    };

  } catch (error: any) {
    console.error(`❌ Settlement failed for order ${orderId}:`, error.message);
    
    // Mark settlement as failed
    await prisma.payment_orders.update({
      where: { id: orderId },
      data: {
        settlement_status: 'failed',
        updated_at: new Date()
      }
    }).catch(() => {}); // Don't fail if update fails

    // Add to retry queue
    await addToRetryQueue(orderId, error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Batch settlement for multiple orders (end-of-day processing)
 */
export async function settlePendingOrders(providerId?: string) {
  console.log(`📦 Starting batch settlement process...`);
  
  const whereClause: any = {
    status: 'completed',
    settlement_status: { in: ['pending', 'failed'] }
  };

  if (providerId) {
    whereClause.assigned_psp_id = providerId;
  }

  const pendingOrders = await prisma.payment_orders.findMany({
    where: whereClause,
    select: { id: true, assigned_psp_id: true },
    orderBy: { updated_at: 'asc' }
  });

  console.log(`   Found ${pendingOrders.length} orders pending settlement`);

  const results = {
    succeeded: 0,
    failed: 0,
    total: pendingOrders.length,
    errors: [] as string[]
  };

  // Group by provider for batch processing
  const ordersByProvider = pendingOrders.reduce((acc, order) => {
    const pspId = order.assigned_psp_id || 'unknown';
    if (!acc[pspId]) acc[pspId] = [];
    acc[pspId].push(order.id);
    return acc;
  }, {} as Record<string, string[]>);

  console.log(`   Settling for ${Object.keys(ordersByProvider).length} providers`);

  // Process each provider's orders
  for (const [pspId, orderIds] of Object.entries(ordersByProvider)) {
    console.log(`\n💼 Processing ${orderIds.length} orders for provider ${pspId}...`);
    
    for (const orderId of orderIds) {
      const result = await settleProviderOrder(orderId);
      
      if (result.success) {
        results.succeeded++;
        console.log(`   ✅ ${orderId.substring(0, 8)}: ${result.amount} USDC`);
      } else {
        results.failed++;
        results.errors.push(`${orderId}: ${result.error}`);
        console.log(`   ❌ ${orderId.substring(0, 8)}: ${result.error}`);
      }

      // Small delay between settlements to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n📊 Settlement batch complete:`);
  console.log(`   ✅ Succeeded: ${results.succeeded}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success rate: ${((results.succeeded/results.total) * 100).toFixed(1)}%`);

  return results;
}

/**
 * Add failed settlement to retry queue
 */
async function addToRetryQueue(orderId: string, errorMessage: string) {
  try {
    const existingRetry = await prisma.settlement_retry_queue.findFirst({
      where: { 
        order_id: orderId,
        resolved_at: null
      }
    });

    if (existingRetry) {
      // Update existing retry
      await prisma.settlement_retry_queue.update({
        where: { id: existingRetry.id },
        data: {
          retry_count: { increment: 1 },
          last_error: errorMessage,
          next_retry_at: calculateNextRetry(existingRetry.retry_count + 1)
        }
      });
    } else {
      // Create new retry entry
      await prisma.settlement_retry_queue.create({
        data: {
          order_id: orderId,
          retry_count: 1,
          last_error: errorMessage,
          next_retry_at: calculateNextRetry(1),
          created_at: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Failed to add to retry queue:', error);
  }
}

/**
 * Calculate next retry time with exponential backoff
 */
function calculateNextRetry(retryCount: number): Date {
  const baseDelay = 5 * 60 * 1000; // 5 minutes
  const maxDelay = 24 * 60 * 60 * 1000; // 24 hours
  const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
  return new Date(Date.now() + delay);
}

/**
 * Process retry queue
 */
export async function processRetryQueue() {
  const retries = await prisma.settlement_retry_queue.findMany({
    where: {
      next_retry_at: { lte: new Date() },
      resolved_at: null,
      retry_count: { lt: 10 } // Max 10 retries
    },
    take: 20 // Process in batches
  });

  console.log(`🔄 Processing ${retries.length} settlement retries...`);

  for (const retry of retries) {
    const result = await settleProviderOrder(retry.order_id);
    
    if (result.success) {
      // Mark as resolved
      await prisma.settlement_retry_queue.update({
        where: { id: retry.id },
        data: { resolved_at: new Date() }
      });
      console.log(`✅ Retry successful for order ${retry.order_id}`);
    } else {
      console.log(`❌ Retry failed for order ${retry.order_id}: ${result.error}`);
      // addToRetryQueue will update the existing entry
    }
  }
}

/**
 * Get settlement stats for provider
 */
export async function getProviderSettlementStats(providerId: string) {
  const [pending, completed, failed] = await Promise.all([
    // Pending settlements
    prisma.payment_orders.aggregate({
      where: {
        assigned_psp_id: providerId,
        status: 'completed',
        settlement_status: 'pending'
      },
      _sum: {
        amount_paid: true,
        psp_commission: true
      },
      _count: true
    }),
    
    // Completed settlements
    prisma.payment_orders.aggregate({
      where: {
        assigned_psp_id: providerId,
        settlement_status: 'completed'
      },
      _sum: {
        amount_paid: true,
        psp_commission: true
      },
      _count: true
    }),
    
    // Failed settlements
    prisma.payment_orders.count({
      where: {
        assigned_psp_id: providerId,
        status: 'completed',
        settlement_status: 'failed'
      }
    })
  ]);

  const pendingAmount = (pending._sum.amount_paid || 0) + (pending._sum.psp_commission || 0);
  const totalSettled = (completed._sum.amount_paid || 0) + (completed._sum.psp_commission || 0);

  return {
    pending: {
      amount: pendingAmount,
      count: pending._count
    },
    completed: {
      amount: totalSettled,
      count: completed._count
    },
    failed: {
      count: failed
    }
  };
}
