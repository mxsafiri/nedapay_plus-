/**
 * Hedera Transaction Service
 * Handles token transfers and transaction operations
 */

import {
  TransferTransaction,
  TokenId,
  AccountId,
  Hbar,
  TransactionReceipt,
  Status,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface TokenTransferParams {
  tokenId: string;
  from: string;
  to: string;
  amount: number;
  memo?: string;
}

export interface HbarTransferParams {
  from: string;
  to: string;
  amount: number; // in HBAR
  memo?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  status: string;
  timestamp: Date;
  fee?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export class HederaTransactionService {
  private client: HederaClient;

  constructor(client: HederaClient) {
    this.client = client;
  }

  /**
   * Transfer tokens (e.g., USDC via Hedera Token Service)
   */
  async transferToken(params: TokenTransferParams): Promise<TransactionResult> {
    try {
      const client = this.client.getClient();
      const tokenId = TokenId.fromString(params.tokenId);
      const fromAccount = AccountId.fromString(params.from);
      const toAccount = AccountId.fromString(params.to);

      console.log(`🔄 Transferring ${params.amount} tokens (${params.tokenId})`);
      console.log(`   From: ${params.from}`);
      console.log(`   To: ${params.to}`);

      // Create transfer transaction
      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccount, -params.amount)
        .addTokenTransfer(tokenId, toAccount, params.amount);

      // Add memo if provided
      if (params.memo) {
        transaction.setTransactionMemo(params.memo);
      }

      // Freeze and sign transaction
      const frozenTx = await transaction.freezeWith(client);
      
      // Sign with operator key (assuming operator is the sender)
      const operatorKey = this.client.getOperatorKey();
      if (!operatorKey) {
        throw new Error('Operator key not configured');
      }
      
      const signedTx = await frozenTx.sign(operatorKey);

      // Execute transaction
      const txResponse = await signedTx.execute(client);
      
      // Get receipt to confirm
      const receipt = await txResponse.getReceipt(client);
      
      // Get transaction record for fee info
      const record = await txResponse.getRecord(client);

      const result: TransactionResult = {
        success: receipt.status === Status.Success,
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
        timestamp: new Date(record.consensusTimestamp.toDate()),
        fee: record.transactionFee.toString(),
        receipt,
      };

      console.log(`✅ Token transfer successful!`);
      console.log(`   Transaction ID: ${result.transactionId}`);
      console.log(`   Fee: ${result.fee}`);

      return result;
    } catch (error: any) {
      console.error('❌ Token transfer failed:', error.message);
      
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Transfer HBAR (native token)
   */
  async transferHbar(params: HbarTransferParams): Promise<TransactionResult> {
    try {
      const client = this.client.getClient();
      const fromAccount = AccountId.fromString(params.from);
      const toAccount = AccountId.fromString(params.to);

      console.log(`🔄 Transferring ${params.amount} HBAR`);
      console.log(`   From: ${params.from}`);
      console.log(`   To: ${params.to}`);

      // Create HBAR transfer transaction
      const transaction = new TransferTransaction()
        .addHbarTransfer(fromAccount, new Hbar(-params.amount))
        .addHbarTransfer(toAccount, new Hbar(params.amount));

      // Add memo if provided
      if (params.memo) {
        transaction.setTransactionMemo(params.memo);
      }

      // Execute transaction
      const txResponse = await transaction.execute(client);
      
      // Get receipt
      const receipt = await txResponse.getReceipt(client);
      
      // Get record for fee info
      const record = await txResponse.getRecord(client);

      const result: TransactionResult = {
        success: receipt.status === Status.Success,
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString(),
        timestamp: new Date(record.consensusTimestamp.toDate()),
        fee: record.transactionFee.toString(),
        receipt,
      };

      console.log(`✅ HBAR transfer successful!`);
      console.log(`   Transaction ID: ${result.transactionId}`);

      return result;
    } catch (error: any) {
      console.error('❌ HBAR transfer failed:', error.message);
      
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Transfer token with retry logic
   */
  async transferTokenWithRetry(
    params: TokenTransferParams,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<TransactionResult> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);

      const result = await this.transferToken(params);

      if (result.success) {
        return result;
      }

      lastError = result.error || 'Unknown error';
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }

    return {
      success: false,
      transactionId: '',
      status: 'FAILED_AFTER_RETRIES',
      timestamp: new Date(),
      error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
    };
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(_transactionId: string): Promise<{
    status: string;
    timestamp?: Date;
    fee?: string;
  }> {
    try {
      const _client = this.client.getClient();
      
      // Query transaction receipt
      // Note: This requires the transaction ID format
      // For now, return a placeholder
      
      return {
        status: 'PENDING',
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Error getting transaction status:', error.message);
      throw error;
    }
  }
}

/**
 * Create transaction service from Hedera client
 */
export function createTransactionService(client: HederaClient): HederaTransactionService {
  return new HederaTransactionService(client);
}
