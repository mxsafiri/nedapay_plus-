/**
 * Test Script: Base/EVM Transfers
 * Tests the new Base blockchain integration
 */

import { executeTransfer, getNetworkStatus, getTransactionCosts } from '@/lib/blockchain';

async function main() {
  console.log('🧪 Testing Base/EVM Integration\n');

  try {
    // Step 1: Check network status
    console.log('📊 Step 1: Checking network status...');
    const networks = await getNetworkStatus();
    
    console.log('\nAvailable networks:');
    networks.forEach(network => {
      console.log(`  ${network.priority === 1 ? '🥇' : '🥈'} ${network.network} (${network.type})`);
      console.log(`     Priority: ${network.priority}`);
      console.log(`     Fee: $${network.fee}`);
      console.log(`     Available: ${network.available ? '✅' : '❌'}`);
    });

    // Step 2: Compare costs
    console.log('\n📈 Step 2: Comparing transaction costs...');
    const costs = await getTransactionCosts('USDC', 1000);
    
    console.log('\nCost comparison for $1,000 USDC transfer:');
    costs.forEach(cost => {
      console.log(`  ${cost.network} (${cost.networkType}):`);
      console.log(`     Transaction fee: $${cost.transactionFee}`);
      console.log(`     Total cost: $${cost.totalCost}`);
      if (cost.savings !== undefined) {
        console.log(`     Savings: $${cost.savings} vs most expensive`);
      }
    });

    // Step 3: Test transfer (dry run)
    console.log('\n🔄 Step 3: Simulating transfer...');
    console.log('\nℹ️  This will attempt a real transfer if you have:');
    console.log('   - EVM_PRIVATE_KEY configured in .env');
    console.log('   - Test USDC in your wallet');
    console.log('   - Valid recipient address');
    console.log('\n⚠️  Skipping actual transfer for safety');
    console.log('   To test, uncomment the transfer code below\n');

    /*
    // UNCOMMENT TO TEST ACTUAL TRANSFER
    const result = await executeTransfer({
      from: '0xYourWalletAddress',
      to: '0xRecipientAddress',
      tokenSymbol: 'USDC',
      amount: 0.01, // $0.01 test amount
      memo: 'Test transfer',
    });

    if (result.success) {
      console.log('✅ Transfer successful!');
      console.log(`   Network used: ${result.networkUsed}`);
      console.log(`   Transaction: ${result.transactionHash}`);
      console.log(`   Fee: $${result.fee}`);
    } else {
      console.log('❌ Transfer failed:', result.error);
    }
    */

    console.log('\n✅ Test complete!\n');
    console.log('📖 Next steps:');
    console.log('   1. Configure EVM_PRIVATE_KEY in .env');
    console.log('   2. Get test USDC from Base Sepolia faucet');
    console.log('   3. Uncomment transfer code above and test');
    console.log('   4. When Thunes launches: run switch-to-base-priority.sql');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Check DATABASE_URL is set');
    console.error('  - Verify networks exist in database');
    console.error('  - Run: psql $DATABASE_URL < scripts/migrate-to-multichain.sql');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
