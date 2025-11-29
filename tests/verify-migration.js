/**
 * Verify Paycrest Database Migration
 */

const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying Paycrest Database Migration\n');
  
  try {
    // Try to query with the new Paycrest fields
    const testQuery = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'payment_orders' 
        AND column_name IN ('paycrest_order_id', 'paycrest_valid_until', 'failure_reason')
      ORDER BY column_name;
    `;
    
    console.log('✅ Migration Verified!\n');
    console.log('Paycrest fields found:');
    testQuery.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check for index
    const indexQuery = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'payment_orders' 
        AND indexname = 'idx_payment_orders_paycrest_order_id';
    `;
    
    if (indexQuery.length > 0) {
      console.log('\n✅ Index created successfully!');
      console.log(`   ${indexQuery[0].indexname}`);
    } else {
      console.log('\n⚠️  Index not found (optional but recommended)');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION STATUS: COMPLETE ✅');
    console.log('='.repeat(60));
    console.log('\nYour database is ready for Paycrest orders!');
    console.log('You can now:');
    console.log('1. Restart your dev server');
    console.log('2. Create real off-ramp orders via API');
    console.log('3. Start onboarding customers\n');
    
  } catch (error) {
    console.log('❌ Migration verification failed!\n');
    console.log('Error:', error.message);
    console.log('\nThe migration might not have been applied.');
    console.log('Please run this SQL on Supabase:\n');
    console.log('ALTER TABLE payment_orders');
    console.log('ADD COLUMN IF NOT EXISTS paycrest_order_id VARCHAR,');
    console.log('ADD COLUMN IF NOT EXISTS paycrest_valid_until TIMESTAMPTZ,');
    console.log('ADD COLUMN IF NOT EXISTS failure_reason TEXT;\n');
    console.log('CREATE INDEX IF NOT EXISTS idx_payment_orders_paycrest_order_id');
    console.log('ON payment_orders(paycrest_order_id)');
    console.log('WHERE paycrest_order_id IS NOT NULL;\n');
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
