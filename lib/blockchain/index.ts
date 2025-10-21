/**
 * Blockchain Module - Multi-Chain Transaction Router
 * 
 * Provides unified interface for multi-chain transactions with automatic
 * network selection, failover, and cost optimization.
 */

export {
  NetworkSelector,
  getNetworkSelector,
  type NetworkInfo,
  type TokenInfo,
} from './network-selector';

export {
  TransactionRouter,
  getTransactionRouter,
  type TransactionParams,
  type TransactionResult,
  type TransactionAttempt,
} from './transaction-router';

/**
 * Convenience function to execute a multi-chain transfer
 */
import { getTransactionRouter, type TransactionParams } from './transaction-router';

export async function executeTransfer(params: TransactionParams) {
  const router = getTransactionRouter();
  return await router.transfer(params);
}

/**
 * Get cost comparison across all available networks
 */
export async function getTransactionCosts(tokenSymbol: string, amount: number) {
  const router = getTransactionRouter();
  return await router.getTransactionCosts(tokenSymbol, amount);
}

/**
 * Get status of all available networks
 */
export async function getNetworkStatus() {
  const router = getTransactionRouter();
  return await router.getNetworkStatus();
}
