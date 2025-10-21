/**
 * Hedera Integration - Main Export
 * 
 * Provides a unified interface for all Hedera services
 */

export {
  HederaClient,
  createHederaClient,
  getHederaClient,
  type HederaNetworkType,
  type HederaClientConfig,
} from './client';

export {
  HederaTransactionService,
  createTransactionService,
  type TokenTransferParams,
  type HbarTransferParams,
  type TransactionResult,
} from './transactions';

export {
  HederaAccountService,
  createAccountService,
  type CreateAccountResult,
  type AssociateTokenResult,
} from './accounts';

/**
 * Convenience class that combines all Hedera services
 */
import { HederaClient, createHederaClient } from './client';
import { HederaTransactionService } from './transactions';
import { HederaAccountService } from './accounts';

export class HederaService {
  public client: HederaClient;
  public transactions: HederaTransactionService;
  public accounts: HederaAccountService;

  constructor(client?: HederaClient) {
    this.client = client || createHederaClient();
    this.transactions = new HederaTransactionService(this.client);
    this.accounts = new HederaAccountService(this.client);
  }

  /**
   * Ping Hedera network to check connectivity
   */
  async ping(): Promise<boolean> {
    return await this.client.ping();
  }

  /**
   * Get operator account balance
   */
  async getOperatorBalance() {
    const operatorId = this.client.getOperatorId();
    if (!operatorId) {
      throw new Error('No operator configured');
    }
    return await this.client.getBalance(operatorId.toString());
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.client.close();
  }
}

/**
 * Create a fully configured Hedera service
 */
export function createHederaService(): HederaService {
  return new HederaService();
}

/**
 * Singleton instance
 */
let hederaServiceInstance: HederaService | null = null;

export function getHederaService(): HederaService {
  if (!hederaServiceInstance) {
    hederaServiceInstance = createHederaService();
  }
  return hederaServiceInstance;
}
