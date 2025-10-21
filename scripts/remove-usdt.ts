import { prisma } from '@/lib/prisma';

async function removeUSDT() {
  try {
    console.log('Removing USDT token...\n');
    
    // Find USDT token
    const usdtToken = await prisma.tokens.findFirst({
      where: { 
        symbol: 'USDT',
        networks: {
          OR: [
            { chain_id: 8453 },
            { chain_id: 84532 }
          ]
        }
      }
    });

    if (!usdtToken) {
      console.log('USDT token not found.');
      return;
    }

    console.log(`Found USDT token with ID: ${usdtToken.id}`);

    // Delete any configurations for this token
    const deletedConfigs = await prisma.sender_order_tokens.deleteMany({
      where: {
        token_sender_order_tokens: usdtToken.id
      }
    });

    console.log(`Deleted ${deletedConfigs.count} configurations for USDT`);

    // Delete the token
    await prisma.tokens.delete({
      where: { id: usdtToken.id }
    });

    console.log('✅ USDT token removed successfully!\n');

    // Verify remaining tokens
    const remainingTokens = await prisma.tokens.findMany({
      where: {
        is_enabled: true,
        networks: {
          OR: [
            { chain_id: 8453 },
            { chain_id: 84532 }
          ]
        }
      },
      orderBy: { symbol: 'asc' }
    });

    console.log(`Remaining tokens on Base: ${remainingTokens.length}`);
    remainingTokens.forEach(t => console.log(`  - ${t.symbol}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeUSDT();
