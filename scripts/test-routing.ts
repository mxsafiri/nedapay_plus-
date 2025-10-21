/**
 * Test Multi-Chain Routing Logic
 * Demonstrates network selection and cost comparison
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { getNetworkStatus, getTransactionCosts, getNetworkSelector } from '../lib/blockchain';

async function testRouting() {
  console.log('🔀 Testing Multi-Chain Routing Logic\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Get network status
    console.log('\n📊 Step 1: Network Status\n');
    
    const status = await getNetworkStatus();
    
    console.log('Available Networks:');
    status.forEach((network, i) => {
      const priorityLabel = network.priority === 1 ? '(PRIMARY)' : '(FALLBACK)';
      console.log(`   ${i + 1}. ${network.network.toUpperCase()} ${priorityLabel}`);
      console.log(`      Type: ${network.type}`);
      console.log(`      Priority: ${network.priority}`);
      console.log(`      Fee: $${network.fee.toFixed(4)}`);
      console.log(`      Status: ${network.available ? '✅ Available' : '❌ Unavailable'}`);
      console.log('');
    });

    // Test 2: Get available tokens
    console.log('💰 Step 2: Available Tokens\n');
    
    const selector = getNetworkSelector();
    const networks = await selector.getAvailableNetworks();
    
    for (const network of networks) {
      const tokens = await selector.getTokensForNetwork(network.id);
      console.log(`${network.identifier}:`);
      tokens.forEach(token => {
        console.log(`   ✅ ${token.symbol} (${token.tokenType}) - ${token.contractAddress}`);
      });
      console.log('');
    }

    // Test 3: Cost comparison
    console.log('💵 Step 3: Transaction Cost Comparison\n');
    
    const testAmount = 100; // $100
    const testToken = 'USDC';
    
    console.log(`Scenario: Transfer ${testAmount} ${testToken}\n`);
    
    const costs = await getTransactionCosts(testToken, testAmount);
    
    if (costs.length === 0) {
      console.log(`❌ No networks available for ${testToken}`);
    } else {
      console.log('Cost Breakdown:');
      costs.forEach((cost, i) => {
        const savingsText = cost.savings ? ` (Save $${cost.savings.toFixed(4)})` : '';
        console.log(`   ${i + 1}. ${cost.network.toUpperCase()}`);
        console.log(`      Amount: $${testAmount.toFixed(2)}`);
        console.log(`      Network Fee: $${cost.transactionFee.toFixed(4)}`);
        console.log(`      Total Cost: $${cost.totalCost.toFixed(4)}${savingsText}`);
        console.log('');
      });

      // Show savings summary
      if (costs.length > 1) {
        const cheapest = costs.reduce((prev, curr) => 
          prev.totalCost < curr.totalCost ? prev : curr
        );
        const mostExpensive = costs.reduce((prev, curr) => 
          prev.totalCost > curr.totalCost ? prev : curr
        );
        
        const savings = mostExpensive.totalCost - cheapest.totalCost;
        const savingsPercent = (savings / mostExpensive.totalCost) * 100;
        
        console.log('💰 Savings Summary:');
        console.log(`   Cheapest: ${cheapest.network} ($${cheapest.totalCost.toFixed(4)})`);
        console.log(`   Most Expensive: ${mostExpensive.network} ($${mostExpensive.totalCost.toFixed(4)})`);
        console.log(`   You Save: $${savings.toFixed(4)} (${savingsPercent.toFixed(2)}%)`);
        console.log('');
      }
    }

    // Test 4: Routing decision
    console.log('🎯 Step 4: Routing Decision\n');
    
    const primaryNetwork = await selector.getPrimaryNetwork();
    
    if (primaryNetwork) {
      console.log(`Primary Network: ${primaryNetwork.identifier.toUpperCase()}`);
      console.log(`   Type: ${primaryNetwork.networkType}`);
      console.log(`   Priority: ${primaryNetwork.priority}`);
      console.log(`   Fee: $${primaryNetwork.fee.toFixed(4)}`);
      console.log('');
      console.log('📋 Transaction Flow:');
      console.log(`   1️⃣  Try ${primaryNetwork.identifier} first`);
      console.log('       └─ If successful → DONE ✅');
      console.log('       └─ If failed → Try next network');
      
      const networks = await selector.getAvailableNetworks();
      if (networks.length > 1) {
        networks.slice(1).forEach((network, i) => {
          console.log(`   ${i + 2}️⃣  Fallback to ${network.identifier}`);
          console.log('       └─ If successful → DONE ✅');
          if (i < networks.length - 2) {
            console.log('       └─ If failed → Try next network');
          }
        });
      }
    }

    // Test 5: Volume-based savings
    console.log('\n\n📈 Step 5: Volume-Based Savings\n');
    
    const volumes = [100, 1000, 10000, 100000];
    
    console.log('Monthly Cost Comparison:');
    console.log('');
    
    for (const volume of volumes) {
      const costs = await getTransactionCosts('USDC', 1); // $1 per transaction
      
      if (costs.length >= 2) {
        const hedera = costs.find(c => c.networkType === 'hedera');
        const base = costs.find(c => c.networkType === 'evm');
        
        if (hedera && base) {
          const hederaMonthlyCost = hedera.transactionFee * volume;
          const baseMonthlyCost = base.transactionFee * volume;
          const monthlySavings = baseMonthlyCost - hederaMonthlyCost;
          
          console.log(`   ${volume.toLocaleString()} transactions/month:`);
          console.log(`      Hedera: $${hederaMonthlyCost.toFixed(2)}`);
          console.log(`      Base: $${baseMonthlyCost.toFixed(2)}`);
          console.log(`      💰 Savings: $${monthlySavings.toFixed(2)}/month ($${(monthlySavings * 12).toFixed(2)}/year)`);
          console.log('');
        }
      }
    }

    console.log('='.repeat(70));
    console.log('\n✅ Routing Test Complete!\n');
    
    console.log('📝 Summary:');
    console.log(`   - ${status.length} networks configured`);
    console.log(`   - Priority-based routing ready`);
    console.log(`   - Automatic failover enabled`);
    console.log(`   - Cost optimization active`);
    console.log('');
    
    console.log('🚀 Next Steps:');
    console.log('   1. Ready to integrate with payment APIs');
    console.log('   2. Test real transaction (Phase 4)');
    console.log('   3. Monitor cost savings dashboard');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testRouting();
