/**
 * Liquidity Management Service
 * Manages NEDAplus internal liquidity reserves for direct order fulfillment
 */

import { prisma } from '@/lib/prisma';

export interface LiquidityReserve {
  currency: string;
  totalAmount: number;
  availableAmount: number;
  reservedAmount: number;
  providerType: string;
  providerDetails: any;
}

export interface LiquidityCheckResult {
  available: boolean;
  currency: string;
  amountRequested: number;
  amountAvailable: number;
  providerType?: string;
  canFulfill: boolean;
}

export class LiquidityService {
  /**
   * Check if we have sufficient liquidity to fulfill an order
   */
  async checkAvailability(
    currency: string,
    amount: number
  ): Promise<LiquidityCheckResult> {
    try {
      const reserve = await prisma.$queryRaw<any[]>`
        SELECT 
          currency,
          available_amount,
          provider_type
        FROM liquidity_reserves
        WHERE currency = ${currency}
        LIMIT 1
      `;

      if (!reserve || reserve.length === 0) {
        return {
          available: false,
          currency,
          amountRequested: amount,
          amountAvailable: 0,
          canFulfill: false
        };
      }

      const availableAmount = Number(reserve[0].available_amount);
      const canFulfill = availableAmount >= amount;

      return {
        available: true,
        currency,
        amountRequested: amount,
        amountAvailable: availableAmount,
        providerType: reserve[0].provider_type,
        canFulfill
      };
    } catch (error: any) {
      console.error('Error checking liquidity:', error.message);
      return {
        available: false,
        currency,
        amountRequested: amount,
        amountAvailable: 0,
        canFulfill: false
      };
    }
  }

  /**
   * Reserve liquidity for a pending order
   */
  async reserveLiquidity(
    currency: string,
    amount: number,
    orderId: string
  ): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT reserve_liquidity(${currency}, ${amount}, ${orderId})
      `;

      return result[0]?.reserve_liquidity === true;
    } catch (error: any) {
      console.error('Error reserving liquidity:', error.message);
      return false;
    }
  }

  /**
   * Release reserved liquidity after order fulfillment
   */
  async releaseLiquidity(
    currency: string,
    amount: number,
    orderId: string
  ): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT release_liquidity(${currency}, ${amount}, ${orderId})
      `;

      return result[0]?.release_liquidity === true;
    } catch (error: any) {
      console.error('Error releasing liquidity:', error.message);
      return false;
    }
  }

  /**
   * Get all liquidity reserves
   */
  async getAllReserves(): Promise<LiquidityReserve[]> {
    try {
      const reserves = await prisma.$queryRaw<any[]>`
        SELECT 
          currency,
          total_amount,
          available_amount,
          reserved_amount,
          provider_type,
          provider_details
        FROM liquidity_reserves
        WHERE provider_type != 'thunes_api'
        ORDER BY currency
      `;

      return reserves.map(r => ({
        currency: r.currency,
        totalAmount: Number(r.total_amount),
        availableAmount: Number(r.available_amount),
        reservedAmount: Number(r.reserved_amount),
        providerType: r.provider_type,
        providerDetails: r.provider_details
      }));
    } catch (error: any) {
      console.error('Error fetching reserves:', error.message);
      return [];
    }
  }

  /**
   * Get liquidity status for a specific currency
   */
  async getReserveStatus(currency: string): Promise<LiquidityReserve | null> {
    try {
      const reserves = await prisma.$queryRaw<any[]>`
        SELECT 
          currency,
          total_amount,
          available_amount,
          reserved_amount,
          provider_type,
          provider_details,
          minimum_threshold,
          optimal_balance
        FROM liquidity_reserves
        WHERE currency = ${currency}
        LIMIT 1
      `;

      if (!reserves || reserves.length === 0) {
        return null;
      }

      const r = reserves[0];
      return {
        currency: r.currency,
        totalAmount: Number(r.total_amount),
        availableAmount: Number(r.available_amount),
        reservedAmount: Number(r.reserved_amount),
        providerType: r.provider_type,
        providerDetails: r.provider_details
      };
    } catch (error: any) {
      console.error('Error fetching reserve status:', error.message);
      return null;
    }
  }

  /**
   * Check for low liquidity and create alerts
   */
  async checkLowLiquidity(): Promise<void> {
    try {
      // Find reserves below minimum threshold
      await prisma.$executeRaw`
        INSERT INTO liquidity_alerts (
          currency,
          alert_type,
          threshold_amount,
          current_amount,
          recommended_action,
          severity,
          created_at
        )
        SELECT 
          currency,
          'low_balance',
          minimum_threshold,
          available_amount,
          'Rebalance to ' || optimal_balance || ' ' || currency,
          CASE 
            WHEN available_amount < (minimum_threshold * 0.5) THEN 'critical'
            WHEN available_amount < minimum_threshold THEN 'warning'
            ELSE 'info'
          END,
          NOW()
        FROM liquidity_reserves
        WHERE available_amount < minimum_threshold
          AND provider_type != 'thunes_api'
          AND NOT EXISTS (
            SELECT 1 FROM liquidity_alerts 
            WHERE liquidity_alerts.currency = liquidity_reserves.currency
              AND liquidity_alerts.resolved_at IS NULL
              AND liquidity_alerts.alert_type = 'low_balance'
          )
      `;

      console.log('✅ Liquidity check completed');
    } catch (error: any) {
      console.error('Error checking low liquidity:', error.message);
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<any[]> {
    try {
      const alerts = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          currency,
          alert_type,
          current_amount,
          threshold_amount,
          recommended_action,
          severity,
          created_at
        FROM liquidity_alerts
        WHERE resolved_at IS NULL
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'warning' THEN 2
            ELSE 3
          END,
          created_at DESC
      `;

      return alerts;
    } catch (error: any) {
      console.error('Error fetching alerts:', error.message);
      return [];
    }
  }

  /**
   * Log manual liquidity deposit
   */
  async logDeposit(
    currency: string,
    amount: number,
    notes: string,
    executedBy: string
  ): Promise<boolean> {
    try {
      await prisma.$executeRaw`
        WITH updated AS (
          UPDATE liquidity_reserves
          SET 
            total_amount = total_amount + ${amount},
            available_amount = available_amount + ${amount},
            last_updated = NOW()
          WHERE currency = ${currency}
          RETURNING id, available_amount - ${amount} as balance_before, available_amount as balance_after
        )
        INSERT INTO liquidity_transactions (
          reserve_id,
          transaction_type,
          amount,
          balance_before,
          balance_after,
          notes,
          executed_by,
          created_at
        )
        SELECT 
          id,
          'deposit',
          ${amount},
          balance_before,
          balance_after,
          ${notes},
          ${executedBy},
          NOW()
        FROM updated
      `;

      console.log(`✅ Logged deposit: ${amount} ${currency}`);
      return true;
    } catch (error: any) {
      console.error('Error logging deposit:', error.message);
      return false;
    }
  }

  /**
   * Get transaction history for a currency
   */
  async getTransactionHistory(
    currency: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const history = await prisma.$queryRaw<any[]>`
        SELECT 
          lt.id,
          lt.transaction_type,
          lt.amount,
          lt.balance_before,
          lt.balance_after,
          lt.payment_order_id,
          lt.notes,
          lt.executed_by,
          lt.created_at
        FROM liquidity_transactions lt
        JOIN liquidity_reserves lr ON lt.reserve_id = lr.id
        WHERE lr.currency = ${currency}
        ORDER BY lt.created_at DESC
        LIMIT ${limit}
      `;

      return history;
    } catch (error: any) {
      console.error('Error fetching transaction history:', error.message);
      return [];
    }
  }

  /**
   * Get liquidity utilization stats
   */
  async getUtilizationStats(): Promise<any> {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          currency,
          total_amount,
          available_amount,
          reserved_amount,
          ROUND((reserved_amount::DECIMAL / NULLIF(total_amount, 0)) * 100, 2) as utilization_pct,
          ROUND((available_amount::DECIMAL / NULLIF(total_amount, 0)) * 100, 2) as available_pct
        FROM liquidity_reserves
        WHERE provider_type != 'thunes_api'
        ORDER BY currency
      `;

      return stats.map(s => ({
        currency: s.currency,
        total: Number(s.total_amount),
        available: Number(s.available_amount),
        reserved: Number(s.reserved_amount),
        utilizationPct: Number(s.utilization_pct),
        availablePct: Number(s.available_pct)
      }));
    } catch (error: any) {
      console.error('Error fetching utilization stats:', error.message);
      return [];
    }
  }
}

/**
 * Singleton instance
 */
let liquidityServiceInstance: LiquidityService | null = null;

export function getLiquidityService(): LiquidityService {
  if (!liquidityServiceInstance) {
    liquidityServiceInstance = new LiquidityService();
  }
  return liquidityServiceInstance;
}
