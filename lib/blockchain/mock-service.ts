/**
 * Mock Blockchain Service for Sandbox/Test Mode
 * Simulates blockchain operations without making real transactions
 */

import crypto from 'crypto';

export interface MockTransaction {
  txHash: string;
  txId: string;
  from: string;
  to: string;
  amount: number;
  network: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  timestamp: number;
  fee: number;
}

export class MockBlockchainService {
  /**
   * Generate a mock transaction hash for EVM chains
   */
  static generateMockEvmTxHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a mock transaction ID for Hedera
   */
  static generateMockHederaTxId(): string {
    const accountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
    const timestamp = Date.now();
    return `${accountId}@${timestamp}`;
  }

  /**
   * Generate a mock wallet address
   */
  static generateMockAddress(network: 'evm' | 'hedera'): string {
    if (network === 'hedera') {
      return `0.0.${Math.floor(Math.random() * 1000000)}`;
    }
    // EVM address
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  /**
   * Simulate sending a transaction (instant confirmation in test mode)
   */
  static async mockSendTransaction(params: {
    from: string;
    to: string;
    amount: number;
    network: string;
  }): Promise<MockTransaction> {
    // Simulate network delay (50-200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

    const isHedera = params.network.includes('hedera');
    const txHash = isHedera ? this.generateMockHederaTxId() : this.generateMockEvmTxHash();

    return {
      txHash,
      txId: txHash,
      from: params.from,
      to: params.to,
      amount: params.amount,
      network: params.network,
      status: 'confirmed', // Always succeed in test mode
      blockNumber: Math.floor(Math.random() * 10000000),
      timestamp: Date.now(),
      fee: this.calculateMockFee(params.amount, params.network)
    };
  }

  /**
   * Calculate mock network fee
   */
  static calculateMockFee(amount: number, network: string): number {
    const isHedera = network.includes('hedera');
    
    if (isHedera) {
      // Hedera: ultra-low fee ($0.0001)
      return 0.0001;
    }
    
    // EVM chains: ~0.1% of amount as fee
    return amount * 0.001;
  }

  /**
   * Mock transaction status check (always returns confirmed)
   */
  static async mockGetTransactionStatus(_txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'confirmed';
  }

  /**
   * Mock balance check (returns test balance)
   */
  static async mockGetBalance(address: string, isProvider: boolean = false): Promise<number> {
    // Return sandbox test balance
    return isProvider ? 50000 : 10000;
  }

  /**
   * Validate if address format is correct
   */
  static validateAddress(address: string, network: string): boolean {
    const isHedera = network.includes('hedera');
    
    if (isHedera) {
      // Hedera format: 0.0.XXXXX
      return /^0\.0\.\d+$/.test(address);
    }
    
    // EVM format: 0x followed by 40 hex chars
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Generate mock transaction receipt
   */
  static generateMockReceipt(transaction: MockTransaction) {
    return {
      transactionHash: transaction.txHash,
      transactionId: transaction.txId,
      blockNumber: transaction.blockNumber,
      from: transaction.from,
      to: transaction.to,
      value: transaction.amount,
      gasUsed: transaction.fee,
      status: 1, // Success
      timestamp: transaction.timestamp,
      network: transaction.network,
      confirmations: 12, // Instant confirmations in test mode
    };
  }
}

/**
 * Helper to determine if we should use mock service
 */
export function shouldUseMockService(isTestMode: boolean): boolean {
  return isTestMode || process.env.NODE_ENV === 'test';
}
