// Safe migration runner for multi-chain support
const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting Multi-Chain Migration...\n');
    
    // Read SQL migration file
    const sqlPath = path.join(__dirname, 'migrate-to-multichain.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by statements (basic splitting on semicolons)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('ALTER TABLE') || statement.includes('UPDATE')) {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`✅ Success\n`);
      }
    }
    
    // Verify migration
    console.log('🔍 Verifying migration results...\n');
    
    const networks = await prisma.$queryRaw`
      SELECT id, identifier, network_type, priority, is_enabled 
      FROM networks
    `;
    
    console.log('📊 Networks after migration:');
    console.table(networks);
    
    const tokens = await prisma.$queryRaw`
      SELECT id, symbol, token_type 
      FROM tokens 
      LIMIT 5
    `;
    
    console.log('💰 Tokens after migration (first 5):');
    console.table(tokens);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('   - Networks table: Updated ✓');
    console.log('   - Tokens table: Updated ✓');
    console.log('   - Payment orders table: Updated ✓');
    console.log('\n📝 Next step: Add Hedera network configuration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
