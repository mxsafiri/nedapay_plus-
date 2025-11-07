/**
 * Test Demo Data
 * Verifies that the demo ecosystem was seeded correctly
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function testDemoData() {
  console.log('\n🔍 Testing Demo Ecosystem Data...\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Check Demo Users
    console.log('\n1️⃣ Checking Demo Users...');
    const demoUsers = await prisma.users.findMany({
      where: {
        email: { contains: 'demo@' }
      },
      include: {
        sender_profiles: true,
        provider_profiles: true,
      }
    });

    console.log(`   Found ${demoUsers.length} demo users`);
    
    const banks = demoUsers.filter(u => u.scope === 'BANK');
    const psps = demoUsers.filter(u => u.scope === 'PSP');
    
    console.log(`   • Banks: ${banks.length}`);
    banks.forEach(b => {
      console.log(`     - ${b.email} (${b.first_name})`);
    });
    
    console.log(`   • PSPs: ${psps.length}`);
    psps.forEach(p => {
      console.log(`     - ${p.email} (${p.first_name})`);
    });

    // Test 2: Check Payment Orders
    console.log('\n2️⃣ Checking Payment Orders...');
    const bankProfileIds = banks.map(b => b.sender_profiles?.id).filter(Boolean);
    
    const totalOrders = await prisma.payment_orders.count({
      where: {
        sender_profile_payment_orders: { in: bankProfileIds as string[] }
      }
    });
    
    const orders = await prisma.payment_orders.findMany({
      where: {
        sender_profile_payment_orders: { in: bankProfileIds as string[] }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    console.log(`   Found ${totalOrders} TOTAL orders from demo banks`);
    if (orders.length > 0) {
      console.log('   Latest orders:');
      orders.slice(0, 5).forEach((o, i) => {
        console.log(`     ${i+1}. Amount: ${o.amount}, Status: ${o.status}, Network: ${o.network_used || 'N/A'}`);
      });
    }

    // Test 3: Check Transaction Logs
    console.log('\n3️⃣ Checking Transaction Logs...');
    const orderIds = orders.map(o => o.id);
    
    const logs = await prisma.transaction_logs.findMany({
      where: {
        payment_order_transactions: { in: orderIds }
      },
      take: 5
    });

    console.log(`   Found ${logs.length} transaction logs`);
    if (logs.length > 0) {
      logs.forEach((l, i) => {
        console.log(`     ${i+1}. Status: ${l.status}, Network: ${l.network}`);
      });
    }

    // Test 4: Check API Keys
    console.log('\n4️⃣ Checking API Keys...');
    const bankProfileIds2 = banks.map(b => b.sender_profiles?.id).filter(Boolean) as string[];
    const pspProfileIds = psps.map(p => p.provider_profiles?.id).filter(Boolean) as string[];
    
    const apiKeys = await prisma.api_keys.findMany({
      where: {
        OR: [
          { sender_profile_api_key: { in: bankProfileIds2 } },
          { provider_profile_api_key: { in: pspProfileIds } }
        ]
      }
    });

    console.log(`   Found ${apiKeys.length} API keys`);
    apiKeys.forEach(key => {
      const bankProfile = banks.find(b => b.sender_profiles?.id === key.sender_profile_api_key);
      const pspProfile = psps.find(p => p.provider_profiles?.id === key.provider_profile_api_key);
      const email = bankProfile?.email || pspProfile?.email || 'Unknown';
      console.log(`     - ${email}: ${key.id.substring(0, 20)}...`);
    });

    // Test 5: Check Revenue Data
    console.log('\n5️⃣ Checking Revenue Data...');
    
    for (const bank of banks) {
      const profile = bank.sender_profiles;
      if (profile) {
        console.log(`   ${bank.email}:`);
        console.log(`     • Total Earnings: $${profile.total_earnings || 0}`);
        console.log(`     • Monthly Earnings: $${profile.monthly_earnings || 0}`);
        console.log(`     • Markup: ${((profile.markup_percentage || 0) * 100).toFixed(2)}%`);
      }
    }

    for (const psp of psps) {
      const profile = psp.provider_profiles;
      if (profile) {
        console.log(`   ${psp.email}:`);
        console.log(`     • Total Commissions: $${profile.total_commissions || 0}`);
        console.log(`     • Fulfillment Count: ${profile.fulfillment_count || 0}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Demo Users: ${demoUsers.length} (${banks.length} banks, ${psps.length} PSPs)`);
    console.log(`✅ Payment Orders: ${orders.length > 0 ? orders.length + ' found' : '❌ NONE FOUND'}`);
    console.log(`✅ Transaction Logs: ${logs.length > 0 ? logs.length + ' found' : '❌ NONE FOUND'}`);
    console.log(`✅ API Keys: ${apiKeys.length}`);
    console.log('='.repeat(60));

    if (orders.length === 0) {
      console.log('\n⚠️  WARNING: No payment orders found!');
      console.log('   Run: npm run demo:seed');
    } else {
      console.log('\n✅ Demo ecosystem looks good!');
    }

  } catch (error) {
    console.error('❌ Error testing demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDemoData();
