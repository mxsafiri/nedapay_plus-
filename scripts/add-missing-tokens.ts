import { prisma } from '@/lib/prisma';

async function addMissingTokens() {
  try {
    console.log('Checking networks...\n');
    
    // Get Base networks
    const networks = await prisma.networks.findMany({
      where: {
        OR: [
          { chain_id: 8453 },   // Base mainnet
          { chain_id: 84532 }   // Base Sepolia
        ]
      }
    });

    console.log('Available Base networks:');
    networks.forEach(net => {
      console.log(`  ${net.identifier} - Chain ID: ${net.chain_id} (ID: ${net.id})`);
    });

    if (networks.length === 0) {
      console.error('\n❌ No Base networks found! Please add Base chain to networks table first.');
      return;
    }

    // Use Base Sepolia for now (84532) - change to mainnet (8453) when ready
    const baseNetwork = networks.find(n => n.chain_id === BigInt(84532)) || networks[0];
    console.log(`\nUsing network: ${baseNetwork.identifier} (Chain ID: ${baseNetwork.chain_id})\n`);

    // Token data - These are placeholder addresses, replace with real contract addresses
    const tokensToAdd = [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        contract_address: '0x0000000000000000000000000000000000000001', // TODO: Add real USDT contract
      },
      {
        symbol: 'EURC',
        name: 'Euro Coin',
        decimals: 6,
        contract_address: '0x0000000000000000000000000000000000000002', // TODO: Add real EURC contract
      },
      {
        symbol: 'BRL',
        name: 'Brazilian Real',
        decimals: 6,
        contract_address: '0x0000000000000000000000000000000000000003', // TODO: Add real BRL contract
      },
      {
        symbol: 'CADC',
        name: 'Canadian Dollar Coin',
        decimals: 6,
        contract_address: '0x0000000000000000000000000000000000000004', // TODO: Add real CADC contract
      },
      {
        symbol: 'IDRX',
        name: 'Indonesian Rupiah',
        decimals: 6,
        contract_address: '0x000000000000000000000000000000000000000A', // TODO: Add real IDRX contract
      },
      {
        symbol: 'MXNE',
        name: 'Mexican Peso',
        decimals: 6,
        contract_address: '0x000000000000000000000000000000000000000B', // TODO: Add real MXNE contract
      },
      {
        symbol: 'NZDD',
        name: 'New Zealand Dollar',
        decimals: 6,
        contract_address: '0x000000000000000000000000000000000000000C', // TODO: Add real NZDD contract
      },
      {
        symbol: 'TRYB',
        name: 'Turkish Lira',
        decimals: 6,
        contract_address: '0x000000000000000000000000000000000000000D', // TODO: Add real TRYB contract
      },
      {
        symbol: 'ZARP',
        name: 'South African Rand',
        decimals: 6,
        contract_address: '0x000000000000000000000000000000000000000E', // TODO: Add real ZARP contract
      }
    ];

    console.log('Adding tokens to database...\n');

    for (const tokenData of tokensToAdd) {
      // Check if token already exists
      const existing = await prisma.tokens.findFirst({
        where: { 
          symbol: tokenData.symbol,
          network_tokens: baseNetwork.id
        }
      });

      if (existing) {
        console.log(`⏭️  ${tokenData.symbol} already exists, skipping...`);
        continue;
      }

      // Create the token
      const token = await prisma.tokens.create({
        data: {
          symbol: tokenData.symbol,
          contract_address: tokenData.contract_address,
          decimals: tokenData.decimals,
          is_enabled: true,
          network_tokens: baseNetwork.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ Added ${tokenData.symbol} (${tokenData.name}) - ID: ${token.id}`);
    }

    console.log('\n✨ Done! Verifying all tokens...\n');

    // Verify
    const allTokens = await prisma.tokens.findMany({
      where: {
        is_enabled: true,
        network_tokens: baseNetwork.id
      },
      orderBy: { symbol: 'asc' }
    });

    console.log(`Total enabled tokens on Base: ${allTokens.length}`);
    allTokens.forEach(t => console.log(`  - ${t.symbol}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingTokens();
