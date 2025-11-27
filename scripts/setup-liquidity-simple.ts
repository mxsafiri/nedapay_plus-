/**
 * Simple Liquidity Setup
 * Creates tables and initial data without complex SQL parsing
 */

import { prisma } from '@/lib/prisma';

async function main() {
  console.log('🚀 Setting up NEDAplus Internal Liquidity Provider\n');
  console.log('='.repeat(60));

  try {
    // Step 0: Check if table exists with old schema and drop it
    console.log('\n🔧 Checking for existing tables...');
    try {
      const existingTable = await prisma.$queryRaw<any[]>`
        SELECT column_name, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'liquidity_reserves' AND column_name = 'currency'
      `;
      
      if (existingTable.length > 0 && existingTable[0].character_maximum_length === 3) {
        console.log('   ⚠️  Found old schema with VARCHAR(3), dropping tables...');
        await prisma.$executeRaw`DROP TABLE IF EXISTS liquidity_alerts CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS liquidity_transactions CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS liquidity_reserves CASCADE`;
        console.log('   ✅ Old tables dropped');
      }
    } catch (e) {
      // Tables don't exist yet, that's fine
    }

    // Step 1: Create liquidity_reserves table
    console.log('\n📊 Creating liquidity_reserves table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS liquidity_reserves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        currency VARCHAR(50) NOT NULL,
        total_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
        available_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
        reserved_amount DECIMAL(20, 2) NOT NULL DEFAULT 0,
        provider_type VARCHAR(50),
        provider_details JSONB,
        minimum_threshold DECIMAL(20, 2) DEFAULT 10000,
        optimal_balance DECIMAL(20, 2) DEFAULT 100000,
        last_rebalanced_at TIMESTAMP,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(currency)
      )
    `;
    console.log('   ✅ liquidity_reserves table created');

    // Step 2: Create liquidity_transactions table
    console.log('\n📝 Creating liquidity_transactions table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS liquidity_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reserve_id UUID REFERENCES liquidity_reserves(id),
        transaction_type VARCHAR(20) NOT NULL,
        amount DECIMAL(20, 2) NOT NULL,
        balance_before DECIMAL(20, 2),
        balance_after DECIMAL(20, 2),
        payment_order_id UUID,
        notes TEXT,
        executed_by VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ liquidity_transactions table created');

    // Step 3: Create liquidity_alerts table
    console.log('\n🚨 Creating liquidity_alerts table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS liquidity_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        currency VARCHAR(50) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        threshold_amount DECIMAL(20, 2),
        current_amount DECIMAL(20, 2),
        recommended_action TEXT,
        severity VARCHAR(20) DEFAULT 'info',
        notified_at TIMESTAMP,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ liquidity_alerts table created');

    // Step 4: Create indexes
    console.log('\n🔍 Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_liquidity_reserves_currency 
        ON liquidity_reserves(currency)
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_liquidity_transactions_reserve 
        ON liquidity_transactions(reserve_id)
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_liquidity_transactions_order 
        ON liquidity_transactions(payment_order_id)
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_liquidity_alerts_unresolved 
        ON liquidity_alerts(currency, resolved_at) 
        WHERE resolved_at IS NULL
    `;
    console.log('   ✅ Indexes created');

    // Step 5: Insert initial reserves
    console.log('\n💰 Adding initial liquidity reserves...');

    // CNY - Chinese Yuan
    await prisma.$executeRaw`
      INSERT INTO liquidity_reserves (
        currency, total_amount, available_amount, provider_type, provider_details, 
        minimum_threshold, optimal_balance
      ) VALUES (
        'CNY', 1000000, 1000000, 'bank', 
        '{"bank": "ICBC Beijing", "account": "6214********1234", "swift": "ICBKCNBJ"}'::jsonb,
        100000, 1000000
      ) ON CONFLICT (currency) DO NOTHING
    `;
    console.log('   ✅ CNY reserve added (¥1M)');

    // KES - Kenyan Shilling
    await prisma.$executeRaw`
      INSERT INTO liquidity_reserves (
        currency, total_amount, available_amount, provider_type, provider_details,
        minimum_threshold, optimal_balance
      ) VALUES (
        'KES', 5000000, 5000000, 'bank',
        '{"bank": "Equity Bank Kenya", "account": "0123456789", "swift": "EQBLKENA"}'::jsonb,
        500000, 5000000
      ) ON CONFLICT (currency) DO NOTHING
    `;
    console.log('   ✅ KES reserve added (5M KES)');

    // NGN - Nigerian Naira
    await prisma.$executeRaw`
      INSERT INTO liquidity_reserves (
        currency, total_amount, available_amount, provider_type, provider_details,
        minimum_threshold, optimal_balance
      ) VALUES (
        'NGN', 50000000, 50000000, 'mobile_money',
        '{"provider": "Flutterwave", "account": "merchant@nedaplus.com"}'::jsonb,
        5000000, 50000000
      ) ON CONFLICT (currency) DO NOTHING
    `;
    console.log('   ✅ NGN reserve added (₦50M)');

    // USD - USDC on blockchain
    await prisma.$executeRaw`
      INSERT INTO liquidity_reserves (
        currency, total_amount, available_amount, provider_type, provider_details,
        minimum_threshold, optimal_balance
      ) VALUES (
        'USD', 100000, 100000, 'crypto',
        '{"network": "base-sepolia", "wallet": "0x742d35Cc6634C0532925a3b8", "token": "USDC"}'::jsonb,
        10000, 100000
      ) ON CONFLICT (currency) DO NOTHING
    `;
    console.log('   ✅ USD reserve added ($100K USDC)');

    // Thunes Network (virtual)
    await prisma.$executeRaw`
      INSERT INTO liquidity_reserves (
        currency, total_amount, available_amount, provider_type, provider_details,
        minimum_threshold, optimal_balance
      ) VALUES (
        'THUNES_API', 999999999, 999999999, 'thunes_api',
        '{"api_url": "https://api.thunes.com", "coverage": "130 countries"}'::jsonb,
        0, 999999999
      ) ON CONFLICT (currency) DO NOTHING
    `;
    console.log('   ✅ Thunes API coverage added (130 countries)');

    // Verify setup
    console.log('\n' + '='.repeat(60));
    console.log('\n🔍 Verifying installation...\n');

    const reserves = await prisma.$queryRaw<any[]>`
      SELECT 
        currency,
        total_amount,
        available_amount,
        provider_type
      FROM liquidity_reserves
      ORDER BY 
        CASE currency
          WHEN 'USD' THEN 1
          WHEN 'CNY' THEN 2
          WHEN 'KES' THEN 3
          WHEN 'NGN' THEN 4
          ELSE 5
        END
    `;

    console.log('✅ Liquidity reserves configured:\n');
    reserves.forEach(r => {
      const icon = r.provider_type === 'thunes_api' ? '🌐' :
                   r.provider_type === 'crypto' ? '⛓️' :
                   r.provider_type === 'bank' ? '🏦' : '💳';
      
      const amount = Number(r.total_amount).toLocaleString();
      console.log(`   ${icon} ${r.currency}: ${amount} (${r.provider_type})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Setup complete!\n');
    console.log('📋 Next steps:\n');
    console.log('   1. Run: npm run liquidity:check');
    console.log('   2. Create NEDAplus provider profile:');
    console.log('      - Login as admin');
    console.log('      - Go to provider management');
    console.log('      - Create "NEDAplus Liquidity Reserve"');
    console.log('   3. Update order routing in:');
    console.log('      app/api/v1/payment-orders/route.ts');
    console.log('   4. Test with sandbox orders\n');
    console.log('📖 Read: INTERNAL_PROVIDER_SETUP.md\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Tables already exist. This is fine!');
      console.log('   Run: npm run liquidity:check to view status\n');
      process.exit(0);
    } else {
      console.error('\nTroubleshooting:');
      console.error('  1. Check DATABASE_URL is set');
      console.error('  2. Verify database connection');
      console.error('  3. Ensure CREATE TABLE permissions\n');
      process.exit(1);
    }
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
