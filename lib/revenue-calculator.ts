/**
 * Revenue Calculator for NedaPay Plus B2B2C Platform
 * Calculates fee splits between Banks, PSPs, and Platform
 */

export interface RevenueBreakdown {
  totalAmount: number;           // Original transfer amount in USD
  platformFee: number;          // Base platform fee (e.g., $0.50)
  bankMarkup: number;           // Bank's markup earnings
  pspCommission: number;        // PSP's commission earnings
  totalFees: number;            // Total fees charged to customer
  netAmount: number;            // Amount after all fees
  bankMarkupPercent: number;    // Bank's markup percentage
  pspCommissionPercent: number; // PSP's commission percentage
}

export interface RevenueConfig {
  platformFee?: number;         // Base platform fee (default $0.50)
  bankMarkupPercent?: number;   // Bank markup % (default 0.2%)
  pspCommissionPercent?: number; // PSP commission % (default 0.3%)
}

/**
 * Calculate revenue split for a cross-border payment
 * 
 * @param amount - Transfer amount in USD
 * @param config - Revenue configuration (optional)
 * @returns Detailed revenue breakdown
 * 
 * Example:
 * ```ts
 * const breakdown = calculateRevenue(1000, {
 *   platformFee: 0.50,
 *   bankMarkupPercent: 0.002,  // 0.2%
 *   pspCommissionPercent: 0.003 // 0.3%
 * });
 * // Result: bank=$2, PSP=$3, platform=$0.50
 * ```
 */
export function calculateRevenue(
  amount: number,
  config: RevenueConfig = {}
): RevenueBreakdown {
  const platformFee = config.platformFee ?? 0.50;
  const bankMarkupPercent = config.bankMarkupPercent ?? 0.002;  // 0.2%
  const pspCommissionPercent = config.pspCommissionPercent ?? 0.003;  // 0.3%

  // Calculate individual fees
  const bankMarkup = amount * bankMarkupPercent;
  const pspCommission = amount * pspCommissionPercent;
  const totalFees = platformFee + bankMarkup + pspCommission;
  const netAmount = amount - totalFees;

  return {
    totalAmount: amount,
    platformFee,
    bankMarkup,
    pspCommission,
    totalFees,
    netAmount,
    bankMarkupPercent,
    pspCommissionPercent,
  };
}

/**
 * Calculate bank's monthly earnings from transactions
 * 
 * @param transactions - Array of transaction amounts
 * @param markupPercent - Bank's markup percentage (default 0.2%)
 * @returns Total monthly earnings
 */
export function calculateBankMonthlyEarnings(
  transactions: number[],
  markupPercent: number = 0.002
): number {
  return transactions.reduce((total, amount) => {
    return total + (amount * markupPercent);
  }, 0);
}

/**
 * Calculate PSP's monthly commissions from fulfillments
 * 
 * @param fulfillments - Array of fulfilled order amounts
 * @param commissionPercent - PSP's commission percentage (default 0.3%)
 * @returns Total monthly commissions
 */
export function calculatePspMonthlyCommissions(
  fulfillments: number[],
  commissionPercent: number = 0.003
): number {
  return fulfillments.reduce((total, amount) => {
    return total + (amount * commissionPercent);
  }, 0);
}

/**
 * Project annual earnings based on current month's performance
 * 
 * @param monthlyEarnings - Current month's earnings
 * @param transactionCount - Number of transactions this month
 * @returns Annual projection
 */
export function projectAnnualRevenue(
  monthlyEarnings: number,
  transactionCount: number
): {
  projectedAnnual: number;
  averagePerTransaction: number;
  projectedMonthly: number;
} {
  const averagePerTransaction = transactionCount > 0 
    ? monthlyEarnings / transactionCount 
    : 0;
  const projectedMonthly = monthlyEarnings;
  const projectedAnnual = monthlyEarnings * 12;

  return {
    projectedAnnual,
    averagePerTransaction,
    projectedMonthly,
  };
}

/**
 * Calculate subscription tier pricing for banks
 * 
 * @param tier - Subscription tier ("free", "basic", "premium")
 * @returns Monthly subscription cost
 */
export function getSubscriptionCost(tier: string): number {
  const pricing: Record<string, number> = {
    free: 0,
    basic: 50,     // $50/month
    premium: 100,  // $100/month
  };
  
  return pricing[tier] ?? 0;
}

/**
 * Calculate volume bonus for PSPs
 * Volume tiers:
 * - 10K+ txs/month: 0.05% bonus
 * - 50K+ txs/month: 0.1% bonus
 * - 100K+ txs/month: 0.2% bonus
 * 
 * @param transactionCount - Number of transactions fulfilled
 * @param totalVolume - Total USD volume fulfilled
 * @returns Bonus amount
 */
export function calculateVolumeBonus(
  transactionCount: number,
  totalVolume: number
): { bonus: number; bonusPercent: number; tier: string } {
  let bonusPercent = 0;
  let tier = "none";

  if (transactionCount >= 100000) {
    bonusPercent = 0.002;  // 0.2%
    tier = "platinum";
  } else if (transactionCount >= 50000) {
    bonusPercent = 0.001;  // 0.1%
    tier = "gold";
  } else if (transactionCount >= 10000) {
    bonusPercent = 0.0005;  // 0.05%
    tier = "silver";
  }

  const bonus = totalVolume * bonusPercent;

  return { bonus, bonusPercent, tier };
}

/**
 * Format currency for display
 * 
 * @param amount - Amount in USD
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 * 
 * @param percent - Percentage as decimal (e.g., 0.002 for 0.2%)
 * @returns Formatted string (e.g., "0.2%")
 */
export function formatPercent(percent: number): string {
  return `${(percent * 100).toFixed(2)}%`;
}
