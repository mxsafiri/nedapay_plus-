import { prisma } from '@/lib/prisma';

async function checkTokens() {
  try {
    console.log('Fetching all tokens from database...\n');
    
    const tokens = await prisma.tokens.findMany({
      include: {
        networks: true
      },
      orderBy: { symbol: 'asc' }
    });

    console.log(`Total tokens in database: ${tokens.length}\n`);
    
    tokens.forEach((token) => {
      console.log(`Symbol: ${token.symbol}`);
      console.log(`  ID: ${token.id}`);
      console.log(`  Enabled: ${token.is_enabled}`);
      console.log(`  Chain: ${token.networks?.identifier || 'N/A'} (Chain ID: ${token.networks?.chain_id})`);
      console.log(`  Contract: ${token.contract_address}`);
      console.log('---');
    });

    // Check which tokens have icons but aren't in database
    const tokenSymbols = tokens.map(t => t.symbol.toUpperCase());
    const iconsAvailable = ['DAI', 'USDC', 'EURC', 'BRL', 'CADC', 'IDRX', 'MXNE', 'NZDD', 'TRYB', 'ZARP'];
    
    const missingFromDB = iconsAvailable.filter(symbol => !tokenSymbols.includes(symbol));
    
    console.log('\n=== TOKENS WITH ICONS BUT NOT IN DATABASE ===');
    console.log(missingFromDB.length > 0 ? missingFromDB.join(', ') : 'None - all icons have database entries');
    
    console.log('\n=== TOKENS IN DATABASE BUT DISABLED ===');
    const disabledTokens = tokens.filter(t => !t.is_enabled);
    console.log(disabledTokens.length > 0 ? disabledTokens.map(t => t.symbol).join(', ') : 'None - all are enabled');
    
    console.log('\n=== TOKENS NOT ON BASE CHAIN (8453/84532) ===');
    const nonBaseTokens = tokens.filter(t => 
      t.networks?.chain_id !== BigInt(8453) && t.networks?.chain_id !== BigInt(84532)
    );
    console.log(nonBaseTokens.length > 0 ? nonBaseTokens.map(t => `${t.symbol} (Chain: ${t.networks?.chain_id})`).join(', ') : 'None - all are on Base');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();
