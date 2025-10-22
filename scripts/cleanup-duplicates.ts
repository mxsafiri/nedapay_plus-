import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🔍 Checking for duplicate addresses...');
  
  try {
    // Find duplicate addresses
    const duplicates = await prisma.$queryRaw<Array<{ address: string; count: bigint }>>`
      SELECT address, COUNT(*) as count 
      FROM receive_addresses 
      GROUP BY address 
      HAVING COUNT(*) > 1
    `;
    
    console.log(`Found ${duplicates.length} duplicate addresses`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // For each duplicate, keep the oldest one and delete the rest
    for (const dup of duplicates) {
      const records = await prisma.receive_addresses.findMany({
        where: { address: dup.address },
        orderBy: { created_at: 'asc' }
      });
      
      // Keep first, delete rest
      const toDelete = records.slice(1);
      
      console.log(`  - Address ${dup.address}: Keeping 1, deleting ${toDelete.length}`);
      
      for (const record of toDelete) {
        await prisma.receive_addresses.delete({
          where: { id: record.id }
        });
      }
    }
    
    console.log('✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
