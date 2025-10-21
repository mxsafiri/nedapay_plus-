/**
 * Test Hedera Connection
 * Verifies Hedera SDK setup and network connectivity
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { getHederaService } from '../lib/hedera';

async function testHederaConnection() {
  console.log('🌐 Testing Hedera Connection...\n');
  console.log('='.repeat(70));

  const hedera = getHederaService();

  try {
    // Test 1: Check configuration
    console.log('\n📋 Step 1: Checking Configuration...');
    
    const networkType = hedera.client.getNetworkType();
    const hasOperator = hedera.client.hasOperator();
    const operatorId = hedera.client.getOperatorId();

    console.log(`   Network: ${networkType}`);
    console.log(`   Operator configured: ${hasOperator ? '✅ Yes' : '❌ No'}`);
    
    if (operatorId) {
      console.log(`   Operator ID: ${operatorId.toString()}`);
    } else {
      console.log('\n⚠️  No operator configured!');
      console.log('   Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in .env');
      console.log('   Get testnet credentials: https://portal.hedera.com/\n');
      process.exit(1);
    }

    // Test 2: Ping network
    console.log('\n🏓 Step 2: Pinging Hedera Network...');
    
    const pingSuccess = await hedera.ping();
    
    if (pingSuccess) {
      console.log('   ✅ Network is reachable!');
    } else {
      throw new Error('Network ping failed');
    }

    // Test 3: Get operator balance
    console.log('\n💰 Step 3: Checking Operator Balance...');
    
    const balance = await hedera.getOperatorBalance();
    
    console.log(`   HBAR Balance: ${balance.hbar}`);
    
    if (Object.keys(balance.tokens).length > 0) {
      console.log('   Token Balances:');
      Object.entries(balance.tokens).forEach(([tokenId, amount]) => {
        console.log(`      ${tokenId}: ${amount}`);
      });
    } else {
      console.log('   No tokens associated yet');
    }

    // Parse HBAR balance
    const hbarAmount = parseFloat(balance.hbar.split(' ')[0]);
    
    if (hbarAmount < 1) {
      console.log('\n⚠️  Low HBAR balance!');
      console.log('   Get free testnet HBAR: https://portal.hedera.com/');
    }

    // Test 4: Get account info
    console.log('\n📊 Step 4: Getting Account Info...');
    
    const accountInfo = await hedera.client.getAccountInfo(operatorId.toString());
    
    console.log(`   Account ID: ${accountInfo.accountId}`);
    console.log(`   Balance: ${accountInfo.balance}`);
    console.log(`   Deleted: ${accountInfo.isDeleted ? '❌ Yes' : '✅ No'}`);
    if (accountInfo.memo) {
      console.log(`   Memo: ${accountInfo.memo}`);
    }

    // Test 5: Check token association
    console.log('\n🔗 Step 5: Checking USDC Token Association...');
    
    const usdcTokenId = process.env.HEDERA_USDC_TOKEN_ID || '0.0.429274';
    console.log(`   Token ID: ${usdcTokenId}`);
    
    const isAssociated = await hedera.accounts.isTokenAssociated(
      operatorId.toString(),
      usdcTokenId
    );
    
    if (isAssociated) {
      console.log('   ✅ USDC token is associated!');
      const usdcBalance = balance.tokens[usdcTokenId] || 0;
      console.log(`   USDC Balance: ${usdcBalance / 1_000_000} USDC`);
    } else {
      console.log('   ⚠️  USDC token not associated');
      console.log('   To associate, run: npm run hedera:associate-usdc');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📋 Summary:');
    console.log(`   - Network: ${networkType}`);
    console.log(`   - Operator: ${operatorId.toString()}`);
    console.log(`   - HBAR Balance: ${balance.hbar}`);
    console.log(`   - USDC Associated: ${isAssociated ? 'Yes' : 'No'}`);
    console.log('\n🚀 Hedera integration is ready!\n');

    // Next steps
    console.log('📝 Next Steps:');
    if (!isAssociated) {
      console.log('   1. Associate USDC token: npm run hedera:associate-usdc');
    }
    console.log('   2. Test transaction: npm run hedera:test-transfer');
    console.log('   3. View on explorer: https://hashscan.io/testnet/account/' + operatorId.toString());
    console.log('');

  } catch (error: any) {
    console.log('\n' + '='.repeat(70));
    console.error('\n❌ TEST FAILED!');
    console.error('\nError:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env file has HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY');
    console.error('   2. Verify your credentials at: https://portal.hedera.com/');
    console.error('   3. Ensure you have testnet HBAR in your account');
    console.error('   4. Check network connectivity');
    console.error('');
    process.exit(1);
  } finally {
    await hedera.close();
  }
}

testHederaConnection();
