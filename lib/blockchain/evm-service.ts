/**
 * EVM Service - Base Chain Implementation
 * Handles USDC transfers on Base and other EVM-compatible chains
 */

import { ethers } from 'ethers';
import type { NetworkInfo, TokenInfo } from './network-selector';

// Standard ERC-20 ABI (minimal, just what we need)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export interface EVMTransferParams {
  tokenAddress: string;
  from: string;
  to: string;
  amount: bigint; // Amount in smallest unit (e.g., USDC has 6 decimals)
  memo?: string;
}

export interface EVMTransferResult {
  success: boolean;
  transactionHash?: string;
  transactionId?: string;
  fee?: string;
  timestamp: Date;
  error?: string;
}

export class EVMService {
  private provider: ethers.JsonRpcProvider;
  private network: NetworkInfo;

  constructor(network: NetworkInfo) {
    if (!network.rpcEndpoint) {
      throw new Error(`No RPC endpoint configured for network ${network.identifier}`);
    }

    this.network = network;
    this.provider = new ethers.JsonRpcProvider(network.rpcEndpoint);
  }

  /**
   * Transfer ERC-20 tokens (e.g., USDC on Base)
   */
  async transferToken(params: EVMTransferParams): Promise<EVMTransferResult> {
    try {
      console.log(`🔗 Initiating EVM transfer on ${this.network.identifier}`);
      console.log(`   Token: ${params.tokenAddress}`);
      console.log(`   From: ${params.from}`);
      console.log(`   To: ${params.to}`);
      console.log(`   Amount: ${params.amount.toString()}`);

      // Get wallet from private key (from environment)
      const privateKey = this.getPrivateKey();
      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Create contract instance
      const tokenContract = new ethers.Contract(
        params.tokenAddress,
        ERC20_ABI,
        wallet
      );

      // Check balance before transfer
      const balance = await tokenContract.balanceOf(wallet.address);
      console.log(`   Wallet balance: ${balance.toString()}`);

      if (balance < params.amount) {
        throw new Error(`Insufficient balance. Have: ${balance}, Need: ${params.amount}`);
      }

      // Execute transfer
      console.log(`   Sending transaction...`);
      const tx = await tokenContract.transfer(params.to, params.amount);
      
      console.log(`   Transaction submitted: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`   ✅ Transaction confirmed!`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

        // Calculate fee (gasUsed * gasPrice)
        const fee = receipt.gasUsed * receipt.gasPrice;
        const feeInEther = ethers.formatEther(fee);

        return {
          success: true,
          transactionHash: receipt.hash,
          transactionId: receipt.hash,
          fee: feeInEther,
          timestamp: new Date(),
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error(`   ❌ EVM transfer failed:`, error.message);
      
      return {
        success: false,
        timestamp: new Date(),
        error: error.message || 'Unknown EVM error',
      };
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<bigint> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.provider
    );

    const balance = await tokenContract.balanceOf(accountAddress);
    return balance;
  }

  /**
   * Validate if address is a valid EVM address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get private key from environment
   */
  private getPrivateKey(): string {
    // For production, use environment-specific keys
    const key = process.env.EVM_PRIVATE_KEY || process.env.BASE_PRIVATE_KEY;
    
    if (!key) {
      throw new Error('EVM_PRIVATE_KEY not configured in environment');
    }

    return key;
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Estimate gas for a transfer
   */
  async estimateTransferGas(
    tokenAddress: string,
    to: string,
    amount: bigint
  ): Promise<bigint> {
    try {
      const privateKey = this.getPrivateKey();
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        wallet
      );

      const gasEstimate = await tokenContract.transfer.estimateGas(to, amount);
      return gasEstimate;
    } catch (error: any) {
      console.error('Gas estimation failed:', error.message);
      // Return a conservative estimate if estimation fails
      return BigInt(100000); // 100k gas units (typical for ERC-20 transfer)
    }
  }
}

/**
 * Factory function to create EVM service for a network
 */
export function createEVMService(network: NetworkInfo): EVMService {
  return new EVMService(network);
}
