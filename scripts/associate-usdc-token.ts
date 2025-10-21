/**
 * Associate USDC Token
 * Associates the USDC token with your operator account
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { getHederaService } from '../lib/hedera';

async function associateUSDC() {
  console.log('🔗 Associating USDC Token with Operator Account...\n');
  
  const hedera = getHederaService();

  try {
    const operatorId = hedera.client.getOperatorId();
    if (!operatorId) {
      throw new Error('No operator configured. Set HEDERA_OPERATOR_ID in .env');
    }

    const usdcTokenId = process.env.HEDERA_USDC_TOKEN_ID || '0.0.429274';

    console.log(`   Operator Account: ${operatorId.toString()}`);
    console.log(`   USDC Token ID: ${usdcTokenId}`);
    console.log('');

    // Check if already associated
    console.log('🔍 Checking if already associated...');
    const isAssociated = await hedera.accounts.isTokenAssociated(
      operatorId.toString(),
      usdcTokenId
    );

    if (isAssociated) {
      console.log('✅ Token is already associated!');
      
      const balance = await hedera.client.getBalance(operatorId.toString());
      const usdcBalance = balance.tokens[usdcTokenId] || 0;
      console.log(`   Current USDC Balance: ${usdcBalance / 1_000_000} USDC\n`);
      
      return;
    }

    console.log('⏳ Token not associated yet. Associating...\n');

    // Associate token
    const result = await hedera.accounts.associateToken(
      operatorId.toString(),
      usdcTokenId
    );

    if (result.success) {
      console.log('✅ USDC Token Associated Successfully!');
      console.log(`   Transaction ID: ${result.transactionId}`);
      console.log(`   View on HashScan: https://hashscan.io/testnet/transaction/${result.transactionId}`);
      console.log('');
      console.log('💡 You can now receive USDC on Hedera!');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Get testnet USDC from faucet (if available)');
      console.log('   2. Test a transfer: npm run hedera:test-transfer');
      console.log('');
    } else {
      throw new Error(result.error || 'Association failed');
    }

  } catch (error: any) {
    console.error('\n❌ Token Association Failed!');
    console.error('\nError:', error.message);
    console.error('\n💡 Common issues:');
    console.error('   - Insufficient HBAR balance (need ~$0.05 worth)');
    console.error('   - Invalid token ID');
    console.error('   - Network connectivity issues');
    console.error('');
    process.exit(1);
  } finally {
    await hedera.close();
  }
}

associateUSDC();
