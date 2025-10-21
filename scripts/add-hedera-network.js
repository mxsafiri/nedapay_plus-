// Add Hedera Testnet and USDC token configuration
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function addHederaNetwork() {
  try {
    console.log('🌐 Adding Hedera Testnet Configuration...\n');
    
    // Step 1: Add Hedera Testnet Network
    console.log('📡 Creating Hedera Testnet network...');
    const hederaNetwork = await prisma.networks.create({
      data: {
        identifier: 'hedera-testnet',
        network_type: 'hedera',
        is_testnet: true,
        fee: 0.0001,  // $0.0001 per transaction
        block_time: 3,  // 3-5 seconds consensus time
        priority: 1,  // Highest priority (use first)
        is_enabled: true,
        
        // Hedera-specific fields
        hedera_network_id: 'testnet',
        mirror_node_url: 'https://testnet.mirrornode.hedera.com',
        
        // SDK configuration
        sdk_config: {
          network: 'testnet',
          nodes: {
            '0.0.3': '0.testnet.hedera.com:50211',
            '0.0.4': '1.testnet.hedera.com:50211',
            '0.0.5': '2.testnet.hedera.com:50211',
            '0.0.6': '3.testnet.hedera.com:50211'
          }
        },
        
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Hedera Testnet created with ID: ${hederaNetwork.id}\n`);
    
    // Step 2: Add USDC on Hedera Testnet
    console.log('💰 Adding USDC token on Hedera Testnet...');
    const usdcHedera = await prisma.tokens.create({
      data: {
        symbol: 'USDC',
        contract_address: '0.0.429274',  // Hedera testnet USDC token ID
        token_type: 'hts',  // Hedera Token Service
        decimals: 6,
        is_enabled: true,
        network_tokens: hederaNetwork.id,
        base_currency: 'USD',
        token_metadata: {
          token_name: 'USD Coin',
          treasury_account: '0.0.429274',
          supply_type: 'FINITE',
          max_supply: '1000000000000000',  // 1 trillion
          network: 'hedera-testnet'
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ USDC token created with ID: ${usdcHedera.id}\n`);
    
    // Step 3: Add HBAR (native token) for gas
    console.log('💎 Adding HBAR (native token)...');
    const hbar = await prisma.tokens.create({
      data: {
        symbol: 'HBAR',
        contract_address: '0.0.0',  // Native token
        token_type: 'native',
        decimals: 8,
        is_enabled: true,
        network_tokens: hederaNetwork.id,
        base_currency: 'USD',
        token_metadata: {
          token_name: 'Hedera Hashgraph',
          is_native: true,
          network: 'hedera-testnet'
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ HBAR token created with ID: ${hbar.id}\n`);
    
    // Step 4: Verify configuration
    console.log('🔍 Verifying multi-chain setup...\n');
    
    const allNetworks = await prisma.networks.findMany({
      select: {
        id: true,
        identifier: true,
        network_type: true,
        fee: true,
        priority: true,
        is_enabled: true,
        _count: { select: { tokens: true } }
      },
      orderBy: { priority: 'asc' }
    });
    
    console.log('📊 NETWORKS (ordered by priority):');
    console.table(allNetworks);
    
    const hederaTokens = await prisma.tokens.findMany({
      where: { network_tokens: hederaNetwork.id },
      select: {
        symbol: true,
        contract_address: true,
        token_type: true,
        is_enabled: true
      }
    });
    
    console.log('\n💰 HEDERA TESTNET TOKENS:');
    console.table(hederaTokens);
    
    // Cost comparison
    const baseNetwork = allNetworks.find(n => n.identifier === 'base-sepolia');
    const hederaNet = allNetworks.find(n => n.identifier === 'hedera-testnet');
    
    console.log('\n💵 COST COMPARISON (per transaction):');
    console.log(`   Base Sepolia:    $${baseNetwork.fee.toFixed(4)}`);
    console.log(`   Hedera Testnet:  $${hederaNet.fee.toFixed(4)}`);
    console.log(`   Savings:         ${((1 - hederaNet.fee / baseNetwork.fee) * 100).toFixed(1)}% cheaper! 🎉`);
    
    console.log('\n✅ Multi-chain setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Networks: ${allNetworks.length} (${allNetworks.filter(n => n.is_enabled).length} enabled)`);
    console.log(`   - Priority 1: ${hederaNet.identifier} (use first)`);
    console.log(`   - Priority 2: ${baseNetwork.identifier} (fallback)`);
    console.log(`   - Hedera tokens: ${hederaTokens.length}`);
    console.log('\n🚀 Ready for Hedera transactions!');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Hedera network already exists!');
      console.log('\n💡 To re-run this script, first delete the existing Hedera network:');
      console.log('   DELETE FROM networks WHERE identifier = \'hedera-testnet\';');
    } else {
      console.error('❌ Error adding Hedera configuration:', error.message);
      console.error('\nFull error:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addHederaNetwork();
