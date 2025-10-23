/**
 * Transaction Router
 * Routes transactions to the best available network with automatic failover
 */

import { getNetworkSelector, type NetworkInfo, type TokenInfo } from './network-selector';
import { getHederaService } from '@/lib/hedera';
import { prisma } from '@/lib/prisma';

export interface TransactionParams {
  from: string;
  to: string;
  tokenSymbol: string;
  amount: number;
  memo?: string;
  orderId?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  transactionHash?: string;
  networkUsed: string;
  networkType: 'evm' | 'hedera';
  fee: number;
  timestamp: Date;
  attemptedNetworks: string[];
  error?: string;
}

export interface TransactionAttempt {
  network: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export class TransactionRouter {
  private networkSelector = getNetworkSelector();
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  /**
   * Execute a token transfer with automatic network selection and failover
   */
  async transfer(params: TransactionParams): Promise<TransactionResult> {
    console.log(`🔀 Routing transaction: ${params.amount} ${params.tokenSymbol}`);
    console.log(`   From: ${params.from}`);
    console.log(`   To: ${params.to}`);

    // Get available networks for this token (ordered by priority)
    const networkOptions = await this.networkSelector.selectNetworksForTransaction(
      params.tokenSymbol,
      params.amount
    );

    if (networkOptions.length === 0) {
      throw new Error(`No networks available for token ${params.tokenSymbol}`);
    }

    console.log(`\n📊 Found ${networkOptions.length} network(s) available:`);
    networkOptions.forEach(({ network }, i) => {
      console.log(`   ${i + 1}. ${network.identifier} (${network.networkType}) - Priority ${network.priority} - Fee: $${network.fee}`);
    });

    const attemptedNetworks: string[] = [];
    let lastError: string = '';

    // Try each network in priority order
    for (const { network, token } of networkOptions) {
      try {
        console.log(`\n🎯 Attempting transaction on ${network.identifier}...`);
        attemptedNetworks.push(network.identifier);

        const result = await this.executeOnNetwork(
          network,
          token,
          params
        );

        if (result.success) {
          console.log(`✅ Transaction successful on ${network.identifier}!`);
          
          // Update payment order with network used (if orderId provided)
          if (params.orderId) {
            await this.updatePaymentOrder(
              params.orderId,
              network.identifier,
              result.transactionId,
              result.transactionHash
            );
          }

          return {
            ...result,
            networkUsed: network.identifier,
            networkType: network.networkType,
            fee: network.fee,
            attemptedNetworks,
          };
        }

        lastError = result.error || 'Unknown error';
        console.log(`❌ Failed on ${network.identifier}: ${lastError}`);

      } catch (error: any) {
        lastError = error.message;
        console.log(`❌ Exception on ${network.identifier}: ${lastError}`);
      }
    }

    // All networks failed
    console.log(`\n❌ Transaction failed on all ${attemptedNetworks.length} networks!`);
    
    return {
      success: false,
      transactionId: '',
      networkUsed: '',
      networkType: 'hedera',
      fee: 0,
      timestamp: new Date(),
      attemptedNetworks,
      error: `All networks failed. Last error: ${lastError}`,
    };
  }

  /**
   * Execute transaction on a specific network
   */
  private async executeOnNetwork(
    network: NetworkInfo,
    token: TokenInfo,
    params: TransactionParams
  ): Promise<TransactionResult> {
    if (network.networkType === 'hedera') {
      return this.executeOnHedera(network, token, params);
    } else if (network.networkType === 'evm') {
      return this.executeOnEVM(network, token, params);
    } else {
      throw new Error(`Unsupported network type: ${network.networkType}`);
    }
  }

  /**
   * Execute transaction on Hedera
   */
  private async executeOnHedera(
    network: NetworkInfo,
    token: TokenInfo,
    params: TransactionParams
  ): Promise<TransactionResult> {
    const hedera = getHederaService();

    try {
      // Convert amount to token's smallest unit
      const amountInSmallestUnit = Math.floor(params.amount * Math.pow(10, token.decimals));

      const result = await hedera.transactions.transferToken({
        tokenId: token.contractAddress, // e.g., "0.0.429274"
        from: params.from,
        to: params.to,
        amount: amountInSmallestUnit,
        memo: params.memo,
      });

      return {
        success: result.success,
        transactionId: result.transactionId,
        transactionHash: result.transactionId, // Hedera uses same ID format
        networkUsed: network.identifier,
        networkType: 'hedera',
        fee: parseFloat(result.fee || '0'),
        timestamp: result.timestamp,
        attemptedNetworks: [],
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        networkUsed: network.identifier,
        networkType: 'hedera',
        fee: 0,
        timestamp: new Date(),
        attemptedNetworks: [],
        error: error.message,
      };
    }
  }

  /**
   * Execute transaction on EVM network (placeholder)
   */
  private async executeOnEVM(
    network: NetworkInfo,
    _token: TokenInfo,
    _params: TransactionParams
  ): Promise<TransactionResult> {
    // TODO: Implement EVM transaction logic
    // This would use ethers.js or viem to execute ERC-20 transfers
    
    console.log(`⚠️  EVM transaction not implemented yet for ${network.identifier}`);
    
    return {
      success: false,
      transactionId: '',
      networkUsed: network.identifier,
      networkType: 'evm',
      fee: 0,
      timestamp: new Date(),
      attemptedNetworks: [],
      error: 'EVM transactions not yet implemented',
    };
  }

  /**
   * Update payment order with transaction details
   */
  private async updatePaymentOrder(
    orderId: string,
    networkUsed: string,
    transactionId: string,
    txHash?: string
  ): Promise<void> {
    try {
      await prisma.payment_orders.update({
        where: { id: orderId },
        data: {
          network_used: networkUsed,
          tx_id: transactionId,
          tx_hash: txHash,
          status: 'completed',
          updated_at: new Date(),
        },
      });
      
      console.log(`📝 Updated payment order ${orderId} with transaction details`);
    } catch (error: any) {
      console.error(`Failed to update payment order: ${error.message}`);
    }
  }

  /**
   * Get transaction cost breakdown for all available networks
   */
  async getTransactionCosts(
    tokenSymbol: string,
    amount: number
  ): Promise<Array<{
    network: string;
    networkType: 'evm' | 'hedera';
    transactionFee: number;
    totalCost: number;
    savings?: number;
  }>> {
    const options = await this.networkSelector.selectNetworksForTransaction(
      tokenSymbol,
      amount
    );

    const costs = options.map(({ network }) => ({
      network: network.identifier,
      networkType: network.networkType,
      transactionFee: network.fee,
      totalCost: amount + network.fee,
      savings: undefined as number | undefined,
    }));

    // Calculate savings compared to most expensive
    if (costs.length > 1) {
      const maxCost = Math.max(...costs.map(c => c.totalCost));
      costs.forEach(c => {
        c.savings = maxCost - c.totalCost;
      });
    }

    return costs;
  }

  /**
   * Get network status and availability
   */
  async getNetworkStatus(): Promise<Array<{
    network: string;
    type: string;
    priority: number;
    available: boolean;
    fee: number;
  }>> {
    const networks = await this.networkSelector.getAvailableNetworks();
    
    return networks.map(network => ({
      network: network.identifier,
      type: network.networkType,
      priority: network.priority,
      available: network.isEnabled,
      fee: network.fee,
    }));
  }
}

/**
 * Singleton instance
 */
let transactionRouterInstance: TransactionRouter | null = null;

export function getTransactionRouter(): TransactionRouter {
  if (!transactionRouterInstance) {
    transactionRouterInstance = new TransactionRouter();
  }
  return transactionRouterInstance;
}
