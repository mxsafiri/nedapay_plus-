/**
 * Hedera Account Management Service
 * Handles account creation and token associations
 */

import {
  AccountCreateTransaction,
  TokenAssociateTransaction,
  PrivateKey,
  TokenId,
  Hbar,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateAccountResult {
  success: boolean;
  accountId?: string;
  publicKey?: string;
  privateKey?: string; // Should be encrypted before storing!
  error?: string;
}

export interface AssociateTokenResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class HederaAccountService {
  private client: HederaClient;

  constructor(client: HederaClient) {
    this.client = client;
  }

  /**
   * Create a new Hedera account
   */
  async createAccount(initialBalance: number = 1): Promise<CreateAccountResult> {
    try {
      const client = this.client.getClient();

      console.log('🔑 Generating new account keys...');
      
      // Generate new key pair
      const newAccountPrivateKey = PrivateKey.generateED25519();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;

      console.log('📝 Creating new account...');

      // Create account transaction
      const transaction = new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(initialBalance * 100_000_000)); // Convert HBAR to tinybars

      // Execute transaction
      const txResponse = await transaction.execute(client);
      
      // Get receipt with new account ID
      const receipt = await txResponse.getReceipt(client);
      const newAccountId = receipt.accountId;

      if (!newAccountId) {
        throw new Error('Failed to create account - no account ID returned');
      }

      console.log(`✅ Account created: ${newAccountId.toString()}`);

      return {
        success: true,
        accountId: newAccountId.toString(),
        publicKey: newAccountPublicKey.toString(),
        privateKey: newAccountPrivateKey.toString(), // ⚠️ ENCRYPT THIS BEFORE STORING!
      };
    } catch (error: any) {
      console.error('❌ Account creation failed:', error.message);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Associate a token with an account
   * Required before an account can receive a specific token
   */
  async associateToken(
    accountId: string,
    tokenId: string,
    accountPrivateKey?: string
  ): Promise<AssociateTokenResult> {
    try {
      const client = this.client.getClient();

      console.log(`🔗 Associating token ${tokenId} with account ${accountId}...`);

      // Create association transaction
      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([TokenId.fromString(tokenId)]);

      // Freeze transaction
      const frozenTx = await transaction.freezeWith(client);

      // Sign with account's private key (if provided) or operator key
      let signedTx;
      if (accountPrivateKey) {
        const privateKey = PrivateKey.fromString(accountPrivateKey);
        signedTx = await frozenTx.sign(privateKey);
      } else {
        const operatorKey = this.client.getOperatorKey();
        if (!operatorKey) {
          throw new Error('No private key provided and operator key not configured');
        }
        signedTx = await frozenTx.sign(operatorKey);
      }

      // Execute transaction
      const txResponse = await signedTx.execute(client);
      
      // Get receipt
      const _receipt = await txResponse.getReceipt(client);

      console.log(`✅ Token associated successfully!`);
      console.log(`   Transaction ID: ${txResponse.transactionId.toString()}`);

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      console.error('❌ Token association failed:', error.message);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Associate multiple tokens with an account
   */
  async associateMultipleTokens(
    accountId: string,
    tokenIds: string[],
    accountPrivateKey?: string
  ): Promise<AssociateTokenResult> {
    try {
      const client = this.client.getClient();

      console.log(`🔗 Associating ${tokenIds.length} tokens with account ${accountId}...`);

      // Convert token IDs
      const tokens = tokenIds.map(id => TokenId.fromString(id));

      // Create association transaction
      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds(tokens);

      // Freeze transaction
      const frozenTx = await transaction.freezeWith(client);

      // Sign with account's private key or operator key
      let signedTx;
      if (accountPrivateKey) {
        const privateKey = PrivateKey.fromString(accountPrivateKey);
        signedTx = await frozenTx.sign(privateKey);
      } else {
        const operatorKey = this.client.getOperatorKey();
        if (!operatorKey) {
          throw new Error('No private key provided and operator key not configured');
        }
        signedTx = await frozenTx.sign(operatorKey);
      }

      // Execute transaction
      const txResponse = await signedTx.execute(client);
      
      // Get receipt
      await txResponse.getReceipt(client);

      console.log(`✅ All tokens associated successfully!`);

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      console.error('❌ Token association failed:', error.message);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if an account is associated with a token
   */
  async isTokenAssociated(accountId: string, tokenId: string): Promise<boolean> {
    try {
      const balance = await this.client.getBalance(accountId);
      
      // Check if token exists in balance (even with 0 amount)
      return tokenId in balance.tokens;
    } catch (error: any) {
      console.error('Error checking token association:', error.message);
      return false;
    }
  }
}

/**
 * Create account service from Hedera client
 */
export function createAccountService(client: HederaClient): HederaAccountService {
  return new HederaAccountService(client);
}
