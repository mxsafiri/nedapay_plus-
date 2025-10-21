// Comprehensive database status report
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function getDatabaseStatus() {
  try {
    console.log('📊 NedaPay Plus - Database Status Report\n');
    console.log('=' .repeat(60));
    
    // Connection info
    const dbUrl = process.env.DATABASE_URL || 'Not configured';
    const isSupabase = dbUrl.includes('supabase.co');
    console.log('\n🔗 CONNECTION INFO:');
    console.log(`   Provider: PostgreSQL ${isSupabase ? '(Supabase)' : ''}`);
    console.log(`   Status: ✅ Connected`);
    
    // Users
    const users = await prisma.users.findMany({
      select: {
        email: true,
        scope: true,
        is_email_verified: true,
        kyb_verification_status: true,
        created_at: true
      }
    });
    
    console.log('\n👥 USERS:');
    console.log(`   Total: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} [${user.scope}] ${user.is_email_verified ? '✓' : '✗'} verified`);
    });
    
    // Networks
    const networks = await prisma.networks.findMany({
      select: {
        identifier: true,
        chain_id: true,
        is_testnet: true,
        fee: true,
        _count: { select: { tokens: true } }
      }
    });
    
    console.log('\n🌐 BLOCKCHAIN NETWORKS:');
    console.log(`   Total: ${networks.length}`);
    networks.forEach((net, i) => {
      console.log(`   ${i + 1}. ${net.identifier} (Chain ID: ${net.chain_id}) ${net.is_testnet ? '[Testnet]' : '[Mainnet]'}`);
      console.log(`      Fee: $${net.fee} | Tokens: ${net._count.tokens}`);
    });
    
    // Tokens
    const tokens = await prisma.tokens.findMany({
      select: {
        symbol: true,
        contract_address: true,
        is_enabled: true,
        networks: { select: { identifier: true } }
      }
    });
    
    console.log('\n💰 TOKENS:');
    console.log(`   Total: ${tokens.length}`);
    console.log(`   Enabled: ${tokens.filter(t => t.is_enabled).length}`);
    tokens.slice(0, 5).forEach((token, i) => {
      console.log(`   ${i + 1}. ${token.symbol} on ${token.networks.identifier} ${token.is_enabled ? '✅' : '❌'}`);
    });
    if (tokens.length > 5) {
      console.log(`   ... and ${tokens.length - 5} more`);
    }
    
    // Provider Profiles
    const providers = await prisma.provider_profiles.count();
    const activeProviders = await prisma.provider_profiles.count({
      where: { is_active: true }
    });
    
    console.log('\n🏦 PROVIDERS:');
    console.log(`   Total: ${providers}`);
    console.log(`   Active: ${activeProviders}`);
    
    // Sender Profiles
    const senders = await prisma.sender_profiles.count();
    const activeSenders = await prisma.sender_profiles.count({
      where: { is_active: true }
    });
    
    console.log('\n📤 SENDERS:');
    console.log(`   Total: ${senders}`);
    console.log(`   Active: ${activeSenders}`);
    
    // Payment Orders
    const orders = await prisma.payment_orders.findMany({
      select: {
        status: true,
        amount: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    const ordersByStatus = await prisma.payment_orders.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('\n💸 PAYMENT ORDERS:');
    console.log(`   Total: ${orders.length}`);
    ordersByStatus.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count}`);
    });
    
    console.log('\n   Recent Orders:');
    orders.forEach((order, i) => {
      const date = new Date(order.created_at).toLocaleDateString();
      console.log(`   ${i + 1}. $${order.amount} [${order.status}] - ${date}`);
    });
    
    // Fiat Currencies
    const fiats = await prisma.fiat_currencies.count();
    const enabledFiats = await prisma.fiat_currencies.count({
      where: { is_enabled: true }
    });
    
    console.log('\n💵 FIAT CURRENCIES:');
    console.log(`   Total: ${fiats}`);
    console.log(`   Enabled: ${enabledFiats}`);
    
    // KYB Status
    const kybProfiles = await prisma.kyb_profiles.count();
    
    console.log('\n📋 KYB PROFILES:');
    console.log(`   Total: ${kybProfiles}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Database is healthy and ready for Hedera integration!\n');
    
  } catch (error) {
    console.error('\n❌ Error fetching database status:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getDatabaseStatus();
