const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🔍 Step 1: Checking for duplicate addresses...\n');
  
  try {
    // Find duplicates
    const duplicates = await prisma.$queryRaw`
      SELECT address, COUNT(*) as count 
      FROM receive_addresses 
      GROUP BY address 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found! Database is clean.\n');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`⚠️  Found ${duplicates.length} duplicate addresses:\n`);
    duplicates.forEach(dup => {
      console.log(`   - ${dup.address}: ${dup.count} copies`);
    });
    
    console.log('\n🧹 Step 2: Deleting duplicates (keeping oldest)...\n');
    
    // Delete duplicates, keep oldest
    const result = await prisma.$executeRaw`
      DELETE FROM receive_addresses
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id, 
                 ROW_NUMBER() OVER (PARTITION BY address ORDER BY created_at ASC) as rn
          FROM receive_addresses
        ) t
        WHERE rn > 1
      )
    `;
    
    console.log(`✅ Deleted ${result} duplicate records\n`);
    
    // Verify
    console.log('🔍 Step 3: Verifying cleanup...\n');
    const remaining = await prisma.$queryRaw`
      SELECT address, COUNT(*) as count 
      FROM receive_addresses 
      GROUP BY address 
      HAVING COUNT(*) > 1
    `;
    
    if (remaining.length === 0) {
      console.log('✅ SUCCESS! All duplicates removed.\n');
      console.log('📝 You can now run: npm run prisma:push\n');
    } else {
      console.log('⚠️  Warning: Some duplicates still remain:\n');
      remaining.forEach(dup => {
        console.log(`   - ${dup.address}: ${dup.count} copies`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
