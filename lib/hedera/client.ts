/**
 * Hedera Client Service
 * Core client for interacting with Hedera network
 */

import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
  AccountInfoQuery,
  Hbar,
} from '@hashgraph/sdk';

export type HederaNetworkType = 'mainnet' | 'testnet' | 'previewnet';

export interface HederaClientConfig {
  network: HederaNetworkType;
  operatorId?: string;
  operatorKey?: string;
}

export class HederaClient {
  private client: Client;
  private operatorId?: AccountId;
  private operatorKey?: PrivateKey;
  private networkType: HederaNetworkType;

  constructor(config: HederaClientConfig) {
    this.networkType = config.network;

    // Initialize client based on network
    switch (config.network) {
      case 'mainnet':
        this.client = Client.forMainnet();
        break;
      case 'testnet':
        this.client = Client.forTestnet();
        break;
      case 'previewnet':
        this.client = Client.forPreviewnet();
        break;
      default:
        throw new Error(`Unsupported network: ${config.network}`);
    }

    // Set operator if credentials provided
    if (config.operatorId && config.operatorKey) {
      this.operatorId = AccountId.fromString(config.operatorId);
      this.operatorKey = PrivateKey.fromString(config.operatorKey);
      this.client.setOperator(this.operatorId, this.operatorKey);
    }

    // Configure client settings
    this.client.setMaxQueryPayment(new Hbar(1)); // Max 1 HBAR per query
    this.client.setMaxTransactionFee(new Hbar(2)); // Max 2 HBAR per transaction
  }

  /**
   * Get the underlying Hedera client
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Get operator account ID
   */
  getOperatorId(): AccountId | undefined {
    return this.operatorId;
  }

  /**
   * Get operator private key
   */
  getOperatorKey(): PrivateKey | undefined {
    return this.operatorKey;
  }

  /**
   * Get network type
   */
  getNetworkType(): HederaNetworkType {
    return this.networkType;
  }

  /**
   * Check if client has operator configured
   */
  hasOperator(): boolean {
    return !!(this.operatorId && this.operatorKey);
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<{
    hbar: string;
    tokens: Record<string, number>;
  }> {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this.client);

    // Convert token balances to object
    const tokens: Record<string, number> = {};
    if (balance.tokens) {
      // Iterate through token balance map
      for (const [tokenId, amount] of balance.tokens) {
        tokens[tokenId.toString()] = amount.toNumber();
      }
    }

    return {
      hbar: balance.hbars.toString(),
      tokens,
    };
  }

  /**
   * Get account information
   */
  async getAccountInfo(accountId: string) {
    const info = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(this.client);

    return {
      accountId: info.accountId.toString(),
      balance: info.balance.toString(),
      key: info.key.toString(),
      isDeleted: info.isDeleted,
      memo: info.accountMemo,
    };
  }

  /**
   * Ping network to check connectivity
   */
  async ping(): Promise<boolean> {
    try {
      if (!this.operatorId) {
        throw new Error('No operator configured');
      }
      
      await this.getBalance(this.operatorId.toString());
      return true;
    } catch (error) {
      console.error('Hedera ping failed:', error);
      return false;
    }
  }

  /**
   * Close client connection
   */
  async close(): Promise<void> {
    await this.client.close();
  }
}

/**
 * Create a Hedera client from environment variables
 */
export function createHederaClient(): HederaClient {
  const network = (process.env.HEDERA_NETWORK || 'testnet') as HederaNetworkType;
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    console.warn('Hedera operator credentials not found in environment');
  }

  return new HederaClient({
    network,
    operatorId,
    operatorKey,
  });
}

/**
 * Singleton Hedera client instance
 */
let hederaClientInstance: HederaClient | null = null;

export function getHederaClient(): HederaClient {
  if (!hederaClientInstance) {
    hederaClientInstance = createHederaClient();
  }
  return hederaClientInstance;
}
