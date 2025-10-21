/**
 * Cost Savings Analytics
 * Calculates actual savings from using multi-chain routing
 */

import { prisma } from '@/lib/prisma';

export interface SavingsReport {
  period: string;
  totalTransactions: number;
  hederaTransactions: number;
  baseTransactions: number;
  actualCost: number;
  wouldHaveCost: number;
  savings: number;
  savingsPercent: number;
}

export interface NetworkStats {
  network: string;
  transactionCount: number;
  totalFees: number;
  averageFee: number;
  successRate: number;
}

export class CostSavingsAnalytics {
  /**
   * Calculate savings for a time period
   */
  async calculateSavings(
    startDate: Date,
    endDate: Date
  ): Promise<SavingsReport> {
    // Get all completed transactions in period
    const transactions = await prisma.payment_orders.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        status: 'completed',
        network_used: {
          not: null,
        },
      },
      select: {
        network_used: true,
        network_fee: true,
      },
    });

    const totalTransactions = transactions.length;
    const hederaTransactions = transactions.filter(
      t => t.network_used?.includes('hedera')
    ).length;
    const baseTransactions = transactions.filter(
      t => t.network_used?.includes('base')
    ).length;

    // Hedera fee: $0.0001, Base fee: $0.03
    const HEDERA_FEE = 0.0001;
    const BASE_FEE = 0.03;

    // Calculate actual cost
    const actualCost = 
      (hederaTransactions * HEDERA_FEE) + 
      (baseTransactions * BASE_FEE);

    // Calculate what it would have cost if all on Base
    const wouldHaveCost = totalTransactions * BASE_FEE;

    // Calculate savings
    const savings = wouldHaveCost - actualCost;
    const savingsPercent = wouldHaveCost > 0
      ? (savings / wouldHaveCost) * 100
      : 0;

    return {
      period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      totalTransactions,
      hederaTransactions,
      baseTransactions,
      actualCost,
      wouldHaveCost,
      savings,
      savingsPercent,
    };
  }

  /**
   * Get network usage statistics
   */
  async getNetworkStats(
    startDate: Date,
    endDate: Date
  ): Promise<NetworkStats[]> {
    const transactions = await prisma.payment_orders.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        network_used: {
          not: null,
        },
      },
      select: {
        network_used: true,
        network_fee: true,
        status: true,
      },
    });

    // Group by network
    const networkGroups = transactions.reduce((acc, tx) => {
      const network = tx.network_used || 'unknown';
      if (!acc[network]) {
        acc[network] = [];
      }
      acc[network].push(tx);
      return acc;
    }, {} as Record<string, typeof transactions>);

    // Calculate stats for each network
    const stats: NetworkStats[] = Object.entries(networkGroups).map(
      ([network, txs]) => {
        const totalFees = txs.reduce((sum, tx) => sum + tx.network_fee, 0);
        const successCount = txs.filter(tx => tx.status === 'completed').length;

        return {
          network,
          transactionCount: txs.length,
          totalFees,
          averageFee: totalFees / txs.length,
          successRate: (successCount / txs.length) * 100,
        };
      }
    );

    return stats.sort((a, b) => b.transactionCount - a.transactionCount);
  }

  /**
   * Get monthly savings trend
   */
  async getMonthlySavingsTrend(months: number = 12): Promise<SavingsReport[]> {
    const reports: SavingsReport[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const endDate = new Date(now.getFullYear(), now.getMonth() - i, 0);
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      const report = await this.calculateSavings(startDate, endDate);
      reports.push(report);
    }

    return reports.reverse();
  }

  /**
   * Project annual savings based on current usage
   */
  async projectAnnualSavings(): Promise<{
    currentMonthly: number;
    projectedAnnual: number;
    transactionsPerMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const report = await this.calculateSavings(startOfMonth, now);
    
    // Days elapsed in current month
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // Project full month
    const projectionFactor = daysInMonth / daysElapsed;
    const projectedMonthlySavings = report.savings * projectionFactor;
    const projectedMonthlyTransactions = report.totalTransactions * projectionFactor;

    return {
      currentMonthly: projectedMonthlySavings,
      projectedAnnual: projectedMonthlySavings * 12,
      transactionsPerMonth: Math.round(projectedMonthlyTransactions),
    };
  }
}

/**
 * Singleton instance
 */
let analyticsInstance: CostSavingsAnalytics | null = null;

export function getCostSavingsAnalytics(): CostSavingsAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new CostSavingsAnalytics();
  }
  return analyticsInstance;
}
