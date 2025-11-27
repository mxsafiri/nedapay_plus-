/**
 * Setup Internal Liquidity Provider
 * Alternative to SQL - uses Prisma for setup
 */

import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Setting up NEDAplus Internal Liquidity Provider\n');
  console.log('='.repeat(60));

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-internal-provider.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('\n📂 Reading SQL file...');
    console.log(`   Path: ${sqlPath}`);

    // Execute the SQL (skip comments and split by statement)
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim().length > 0);

    console.log(`\n⚡ Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed || trimmed.startsWith('SELECT')) {
        skipCount++;
        continue;
      }

      try {
        await prisma.$executeRawUnsafe(trimmed);
        successCount++;
        
        // Show progress for major operations
        if (trimmed.includes('CREATE TABLE')) {
          const tableName = trimmed.match(/CREATE TABLE.*?(\w+)/i)?.[1];
          console.log(`  ✅ Created table: ${tableName}`);
        } else if (trimmed.includes('CREATE OR REPLACE FUNCTION')) {
          const funcName = trimmed.match(/FUNCTION\s+(\w+)/i)?.[1];
          console.log(`  ✅ Created function: ${funcName}`);
        } else if (trimmed.includes('INSERT INTO liquidity_reserves')) {
          const currency = trimmed.match(/VALUES\s*\(\s*'(\w+)'/i)?.[1];
          console.log(`  ✅ Added reserve: ${currency}`);
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error(`  ⚠️  Error:`, error.message.substring(0, 100));
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Setup Summary:`);
    console.log(`   Executed: ${successCount} statements`);
    console.log(`   Skipped: ${skipCount} statements`);

    // Verify setup
    console.log('\n🔍 Verifying installation...\n');

    const tables = await prisma.$queryRaw<any[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename LIKE 'liquidity_%' 
      ORDER BY tablename
    `;

    console.log('✅ Liquidity tables created:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));

    const reserves = await prisma.$queryRaw<any[]>`
      SELECT 
        currency,
        total_amount,
        provider_type,
        CASE 
          WHEN provider_type = 'thunes_api' THEN '🌐 API Coverage'
          WHEN provider_type = 'crypto' THEN '⛓️ Blockchain'
          WHEN provider_type = 'bank' THEN '🏦 Bank Account'
          ELSE '💳 ' || provider_type
        END as type_icon
      FROM liquidity_reserves
      ORDER BY 
        CASE currency
          WHEN 'USD' THEN 1
          WHEN 'CNY' THEN 2
          WHEN 'KES' THEN 3
          WHEN 'NGN' THEN 4
          WHEN 'THUNES_NETWORK' THEN 5
          ELSE 6
        END
    `;

    console.log('\n💰 Initial liquidity reserves:');
    reserves.forEach(r => {
      const amount = Number(r.total_amount).toLocaleString();
      console.log(`   ${r.type_icon} ${r.currency}: ${amount}`);
    });

    const functions = await prisma.$queryRaw<any[]>`
      SELECT proname as function_name
      FROM pg_proc
      WHERE proname LIKE '%liquidity%'
      ORDER BY proname
    `;

    console.log('\n🛠️ Helper functions created:');
    functions.forEach(f => console.log(`   - ${f.function_name}()`));

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run liquidity:check');
    console.log('   2. Create "NEDAplus Liquidity Reserve" provider in dashboard');
    console.log('   3. Update order routing to use smart PSP assignment');
    console.log('   4. Test with sandbox orders\n');
    console.log('📖 Read INTERNAL_PROVIDER_SETUP.md for details\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check DATABASE_URL is set correctly');
    console.error('  2. Verify database connection');
    console.error('  3. Ensure you have CREATE TABLE permissions\n');
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
