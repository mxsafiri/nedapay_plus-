/**
 * Smart PSP Routing
 * Intelligently assigns orders to NEDAplus internal liquidity or external PSPs
 */

import { prisma } from '@/lib/prisma';
import { getLiquidityService } from '@/lib/liquidity/liquidity-service';

export interface PSPAssignmentResult {
  providerId: string;
  providerName: string;
  commissionRate: number;
  isInternal: boolean;
  reason: string;
}

/**
 * Smart PSP assignment with internal liquidity priority
 * 
 * Priority:
 * 1. NEDAplus internal liquidity (if available)
 * 2. External PSPs (by commission rate)
 */
export async function assignOptimalPSP(
  toCurrency: string,
  toAmount: number
): Promise<PSPAssignmentResult | null> {
  
  console.log(`🔍 Finding optimal PSP for ${toAmount} ${toCurrency}...`);

  // =====================================================
  // PRIORITY 1: Check NEDAplus Internal Liquidity
  // =====================================================
  
  const liquidityService = getLiquidityService();
  const liquidityCheck = await liquidityService.checkAvailability(toCurrency, toAmount);

  if (liquidityCheck.canFulfill) {
    // We have sufficient internal liquidity!
    const internalProvider = await prisma.provider_profiles.findFirst({
      where: {
        trading_name: 'NEDAplus Liquidity Reserve',
        is_active: true,
        is_available: true,
      },
      select: {
        id: true,
        trading_name: true,
        commission_rate: true
      }
    });

    if (internalProvider) {
      console.log(`✅ Assigned to internal liquidity (${liquidityCheck.providerType})`);
      console.log(`   Available: ${liquidityCheck.amountAvailable} ${toCurrency}`);
      console.log(`   💰 Capturing PSP commission + platform fee!`);

      return {
        providerId: internalProvider.id,
        providerName: internalProvider.trading_name || 'NEDAplus Internal',
        commissionRate: internalProvider.commission_rate,
        isInternal: true,
        reason: `Internal liquidity via ${liquidityCheck.providerType}`
      };
    }
  } else {
    console.log(`ℹ️  Internal liquidity insufficient:`);
    console.log(`   Needed: ${toAmount} ${toCurrency}`);
    console.log(`   Available: ${liquidityCheck.amountAvailable} ${toCurrency}`);
  }

  // =====================================================
  // PRIORITY 2: External PSPs (Fallback)
  // =====================================================
  
  console.log(`🔄 Falling back to external PSPs...`);

  const externalProviders = await prisma.provider_profiles.findMany({
    where: {
      is_active: true,
      is_available: true,
      is_kyb_verified: true,
      trading_name: { not: 'NEDAplus Liquidity Reserve' } // Exclude internal
    },
    orderBy: [
      { commission_rate: 'asc' }, // Lowest commission first
      { fulfillment_count: 'asc' } // Then round-robin
    ],
    take: 5,
    select: {
      id: true,
      trading_name: true,
      commission_rate: true,
      supported_countries: true
    }
  });

  if (externalProviders.length === 0) {
    console.log(`❌ No external PSPs available`);
    return null;
  }

  // Simple assignment: first available
  const selectedPSP = externalProviders[0];

  console.log(`✅ Assigned to external PSP: ${selectedPSP.trading_name}`);
  console.log(`   Commission rate: ${selectedPSP.commission_rate * 100}%`);

  return {
    providerId: selectedPSP.id,
    providerName: selectedPSP.trading_name || 'External PSP',
    commissionRate: selectedPSP.commission_rate,
    isInternal: false,
    reason: 'External PSP (insufficient internal liquidity)'
  };
}

/**
 * Get PSP assignment statistics
 */
export async function getPSPAssignmentStats(days: number = 30): Promise<any> {
  try {
    const stats = await prisma.$queryRaw<any[]>`
      WITH internal_provider AS (
        SELECT id FROM provider_profiles 
        WHERE trading_name = 'NEDAplus Liquidity Reserve'
        LIMIT 1
      )
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN po.assigned_psp_id = ip.id THEN 1 ELSE 0 END) as internal_fulfillment,
        SUM(CASE WHEN po.assigned_psp_id != ip.id THEN 1 ELSE 0 END) as external_fulfillment,
        ROUND(
          SUM(CASE WHEN po.assigned_psp_id = ip.id THEN 1 ELSE 0 END)::DECIMAL 
          / NULLIF(COUNT(*), 0) * 100, 
          2
        ) as internal_pct,
        SUM(CASE WHEN po.assigned_psp_id = ip.id THEN po.psp_commission ELSE 0 END) as internal_commission_earned,
        SUM(CASE WHEN po.assigned_psp_id != ip.id THEN po.psp_commission ELSE 0 END) as external_commission_paid
      FROM payment_orders po
      CROSS JOIN internal_provider ip
      WHERE po.created_at > NOW() - INTERVAL '${days} days'
        AND po.status != 'pending'
    `;

    if (!stats || stats.length === 0) {
      return {
        totalOrders: 0,
        internalFulfillment: 0,
        externalFulfillment: 0,
        internalPct: 0,
        internalCommissionEarned: 0,
        externalCommissionPaid: 0
      };
    }

    const s = stats[0];
    return {
      totalOrders: Number(s.total_orders),
      internalFulfillment: Number(s.internal_fulfillment),
      externalFulfillment: Number(s.external_fulfillment),
      internalPct: Number(s.internal_pct),
      internalCommissionEarned: Number(s.internal_commission_earned),
      externalCommissionPaid: Number(s.external_commission_paid),
      netCommissionCapture: Number(s.internal_commission_earned) - Number(s.external_commission_paid)
    };
  } catch (error: any) {
    console.error('Error fetching PSP assignment stats:', error.message);
    return null;
  }
}

/**
 * Calculate revenue impact of internal provider
 */
export async function calculateRevenueImpact(days: number = 30): Promise<any> {
  const stats = await getPSPAssignmentStats(days);
  
  if (!stats) return null;

  const platformFeePerTx = 0.50;
  
  // Current revenue
  const currentRevenue = {
    platformFees: stats.totalOrders * platformFeePerTx,
    pspCommissions: stats.internalCommissionEarned,
    total: (stats.totalOrders * platformFeePerTx) + stats.internalCommissionEarned
  };

  // Potential revenue if 100% internal
  const potentialRevenue = {
    platformFees: stats.totalOrders * platformFeePerTx,
    pspCommissions: stats.internalCommissionEarned + stats.externalCommissionPaid,
    total: (stats.totalOrders * platformFeePerTx) + stats.internalCommissionEarned + stats.externalCommissionPaid
  };

  return {
    period: `Last ${days} days`,
    current: currentRevenue,
    potential: potentialRevenue,
    missedRevenue: potentialRevenue.total - currentRevenue.total,
    capturePct: ((currentRevenue.pspCommissions / potentialRevenue.pspCommissions) * 100).toFixed(2)
  };
}
