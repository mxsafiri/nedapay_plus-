/**
 * Complete System Test
 * End-to-end test of entire multi-chain platform
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { getHederaService } from '../lib/hedera';
import { getNetworkSelector, getTransactionRouter } from '../lib/blockchain';
import { getCostSavingsAnalytics } from '../lib/analytics/cost-savings';

async function runCompleteSystemTest() {
  console.log('🧪 Complete Multi-Chain System Test\n');
  console.log('='.repeat(70));

  let passedTests = 0;
  let failedTests = 0;

  const test = async (name: string, fn: () => Promise<boolean>) => {
    try {
      console.log(`\n📋 Test: ${name}`);
      const result = await fn();
      if (result) {
        console.log('   ✅ PASSED');
        passedTests++;
      } else {
        console.log('   ❌ FAILED');
        failedTests++;
      }
      return result;
    } catch (error: any) {
      console.log(`   ❌ FAILED: ${error.message}`);
      failedTests++;
      return false;
    }
  };

  // Test Suite
  console.log('\n🔍 Running Test Suite...\n');

  // Test 1: Hedera Connection
  await test('Hedera Network Connectivity', async () => {
    const hedera = getHederaService();
    const operatorId = hedera.client.getOperatorId();
    
    if (!operatorId) {
      console.log('   No operator configured');
      return false;
    }

    const canPing = await hedera.ping();
    console.log(`   Operator: ${operatorId.toString()}`);
    console.log(`   Reachable: ${canPing}`);
    
    return canPing;
  });

  // Test 2: Operator Balance
  await test('Hedera Operator Balance', async () => {
    const hedera = getHederaService();
    const balance = await hedera.getOperatorBalance();
    
    const hbarAmount = parseFloat(balance.hbar.split(' ')[0]);
    console.log(`   HBAR: ${balance.hbar}`);
    console.log(`   Sufficient: ${hbarAmount >= 1 ? 'Yes' : 'No (low balance)'}`);
    
    return hbarAmount >= 0.1; // At least 0.1 HBAR
  });

  // Test 3: Token Association
  await test('USDC Token Association', async () => {
    const hedera = getHederaService();
    const operatorId = hedera.client.getOperatorId();
    
    if (!operatorId) return false;

    const usdcTokenId = process.env.HEDERA_USDC_TOKEN_ID || '0.0.429274';
    const isAssociated = await hedera.accounts.isTokenAssociated(
      operatorId.toString(),
      usdcTokenId
    );

    console.log(`   Token ID: ${usdcTokenId}`);
    console.log(`   Associated: ${isAssociated ? 'Yes' : 'No'}`);

    return isAssociated;
  });

  // Test 4: Database Networks
  await test('Database Network Configuration', async () => {
    const selector = getNetworkSelector();
    const networks = await selector.getAvailableNetworks();

    console.log(`   Networks configured: ${networks.length}`);
    networks.forEach(n => {
      console.log(`   - ${n.identifier} (Priority ${n.priority})`);
    });

    return networks.length >= 2;
  });

  // Test 5: Primary Network
  await test('Primary Network Selection', async () => {
    const selector = getNetworkSelector();
    const primary = await selector.getPrimaryNetwork();

    if (!primary) return false;

    console.log(`   Primary: ${primary.identifier}`);
    console.log(`   Type: ${primary.networkType}`);
    console.log(`   Fee: $${primary.fee}`);

    return primary.networkType === 'hedera' && primary.priority === 1;
  });

  // Test 6: Token Availability
  await test('Token Availability on Networks', async () => {
    const selector = getNetworkSelector();
    const options = await selector.selectNetworksForTransaction('USDC', 100);

    console.log(`   Networks with USDC: ${options.length}`);
    options.forEach(opt => {
      console.log(`   - ${opt.network.identifier}: ${opt.token.contractAddress}`);
    });

    return options.length >= 1;
  });

  // Test 7: Cost Calculation
  await test('Transaction Cost Calculation', async () => {
    const router = getTransactionRouter();
    const costs = await router.getTransactionCosts('USDC', 100);

    if (costs.length === 0) return false;

    const cheapest = costs.reduce((prev, curr) => 
      prev.totalCost < curr.totalCost ? prev : curr
    );

    console.log(`   Options: ${costs.length}`);
    console.log(`   Cheapest: ${cheapest.network} ($${cheapest.totalCost.toFixed(4)})`);

    return cheapest.network.includes('hedera');
  });

  // Test 8: Network Status
  await test('Network Status Retrieval', async () => {
    const router = getTransactionRouter();
    const status = await router.getNetworkStatus();

    console.log(`   Available networks: ${status.length}`);
    status.forEach(s => {
      console.log(`   - ${s.network}: ${s.available ? 'Available' : 'Unavailable'}`);
    });

    return status.every(s => s.available);
  });

  // Test 9: Analytics (Basic)
  await test('Cost Savings Analytics', async () => {
    const analytics = getCostSavingsAnalytics();
    
    // Calculate savings for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const savings = await analytics.calculateSavings(startDate, endDate);

    console.log(`   Transactions: ${savings.totalTransactions}`);
    console.log(`   Hedera: ${savings.hederaTransactions}`);
    console.log(`   Base: ${savings.baseTransactions}`);
    
    if (savings.totalTransactions > 0) {
      console.log(`   Savings: $${savings.savings.toFixed(2)}`);
    }

    return true; // Analytics always works, even with 0 transactions
  });

  // Test 10: Routing Logic
  await test('Multi-Chain Routing Logic', async () => {
    const selector = getNetworkSelector();
    const networks = await selector.getAvailableNetworks();

    // Verify priority order
    for (let i = 0; i < networks.length - 1; i++) {
      if (networks[i].priority > networks[i + 1].priority) {
        console.log('   Priority order incorrect');
        return false;
      }
    }

    console.log('   Priority order: Correct');
    console.log(`   ${networks.map(n => `${n.identifier} (${n.priority})`).join(' → ')}`);

    return true;
  });

  // Results Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Results Summary\n');
  
  const totalTests = passedTests + failedTests;
  const successRate = (passedTests / totalTests) * 100;

  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ Your multi-chain platform is fully operational!');
    console.log('');
    console.log('🚀 Ready for:');
    console.log('   - Production deployment');
    console.log('   - Real transaction processing');
    console.log('   - Cost savings tracking');
    console.log('');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED\n');
    console.log('Please review the failed tests above and fix any issues.');
    console.log('');
  }

  console.log('📝 Next Steps:');
  console.log('   1. Review PRODUCTION_CHECKLIST.md');
  console.log('   2. Test actual transactions on testnet');
  console.log('   3. Monitor cost savings dashboard');
  console.log('   4. Deploy to production when ready');
  console.log('');

  await getHederaService().close();

  process.exit(failedTests > 0 ? 1 : 0);
}

runCompleteSystemTest().catch(console.error);
