/**
 * Complete Demo System Test
 * Tests all demo components end-to-end
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDemoSystem() {
  console.log('\n🧪 Testing Complete Demo System...\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Verify Demo Users Exist
    console.log('\n✅ Test 1: Demo Users');
    const demoUsers = await prisma.users.findMany({
      where: { email: { contains: 'demo@' } },
      include: {
        sender_profiles: true,
        provider_profiles: true,
      }
    });

    const banks = demoUsers.filter(u => u.scope === 'BANK');
    const psps = demoUsers.filter(u => u.scope === 'PSP');

    console.log(`   ✓ Found ${banks.length} demo banks`);
    console.log(`   ✓ Found ${psps.length} demo PSPs`);

    if (banks.length === 0 || psps.length === 0) {
      console.error('   ❌ FAIL: Missing demo accounts');
      return false;
    }

    // Test 2: Verify Historical Data
    console.log('\n✅ Test 2: Historical Transactions');
    const bankProfileIds = banks.map(b => b.sender_profiles?.id).filter(Boolean);
    
    const totalOrders = await prisma.payment_orders.count({
      where: {
        sender_profile_payment_orders: { in: bankProfileIds as string[] }
      }
    });

    console.log(`   ✓ Found ${totalOrders} payment orders`);
    
    if (totalOrders < 50) {
      console.warn(`   ⚠️  WARNING: Only ${totalOrders} orders (expected 100+)`);
    } else {
      console.log(`   ✓ Good transaction volume for demos`);
    }

    // Test 3: Verify Revenue Tracking
    console.log('\n✅ Test 3: Revenue Tracking');
    let totalBankRevenue = 0;
    let totalPspRevenue = 0;

    banks.forEach(b => {
      if (b.sender_profiles) {
        totalBankRevenue += Number(b.sender_profiles.total_earnings || 0);
      }
    });

    psps.forEach(p => {
      if (p.provider_profiles) {
        totalPspRevenue += Number(p.provider_profiles.total_commissions || 0);
      }
    });

    console.log(`   ✓ Total bank revenue: $${totalBankRevenue.toFixed(2)}`);
    console.log(`   ✓ Total PSP commissions: $${totalPspRevenue.toFixed(2)}`);

    if (totalBankRevenue === 0 && totalPspRevenue === 0) {
      console.warn('   ⚠️  WARNING: No revenue tracked');
    }

    // Test 4: Verify API Keys
    console.log('\n✅ Test 4: API Keys');
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

    console.log(`   ✓ Found ${apiKeys.length} API keys`);
    
    if (apiKeys.length < 6) {
      console.error(`   ❌ FAIL: Expected 6 API keys, found ${apiKeys.length}`);
      return false;
    }

    // Test 5: Check Pending Orders (for bot testing)
    console.log('\n✅ Test 5: Pending Orders (Bot Queue)');
    const pendingOrders = await prisma.payment_orders.findMany({
      where: {
        status: 'pending',
        sender_profile_payment_orders: { in: bankProfileIds as string[] }
      }
    });

    console.log(`   ✓ Found ${pendingOrders.length} pending orders`);
    
    if (pendingOrders.length > 0) {
      console.log('   ℹ️  These will be processed if Virtual PSP Bot is running');
    }

    // Test 6: Verify Transaction Logs
    console.log('\n✅ Test 6: Settlement Logs');
    const completedOrders = await prisma.payment_orders.findMany({
      where: {
        status: 'completed',
        sender_profile_payment_orders: { in: bankProfileIds as string[] }
      },
      take: 5
    });

    const orderIds = completedOrders.map(o => o.id);
    const logs = await prisma.transaction_logs.findMany({
      where: {
        payment_order_transactions: { in: orderIds }
      }
    });

    console.log(`   ✓ Found ${logs.length} settlement logs for recent orders`);

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEMO ECOSYSTEM STATUS');
    console.log('='.repeat(70));
    console.log(`✅ Demo Accounts: ${demoUsers.length} (${banks.length} banks, ${psps.length} PSPs)`);
    console.log(`✅ Payment Orders: ${totalOrders}`);
    console.log(`✅ Pending Orders: ${pendingOrders.length}`);
    console.log(`✅ Bank Revenue: $${totalBankRevenue.toFixed(2)}`);
    console.log(`✅ PSP Revenue: $${totalPspRevenue.toFixed(2)}`);
    console.log(`✅ API Keys: ${apiKeys.length}`);
    console.log(`✅ Transaction Logs: ${logs.length} (sample)`);
    console.log('='.repeat(70));

    // Check if ready for demos
    const isReady = (
      banks.length === 3 &&
      psps.length === 3 &&
      totalOrders >= 50 &&
      apiKeys.length === 6 &&
      (totalBankRevenue > 0 || totalPspRevenue > 0)
    );

    if (isReady) {
      console.log('\n🎉 DEMO ECOSYSTEM IS READY!');
      console.log('\n✅ You can now:');
      console.log('   1. Login to demo accounts (demo@crdbbank.co.tz / Demo2025!)');
      console.log('   2. View populated dashboards with real data');
      console.log('   3. Click "Run Demo" button to create live orders');
      console.log('   4. Start Virtual Bot (npm run demo:bot) for auto-fulfillment');
      console.log('   5. Use API keys for programmatic testing');
      console.log('\n💡 Demo Credentials:');
      console.log('   Banks: demo@crdbbank.co.tz, demo@nmbbank.co.tz, demo@mufindibank.co.tz');
      console.log('   PSPs: demo@thunes.com, demo@mpesa.com, demo@tigopesa.com');
      console.log('   Password: Demo2025!');
    } else {
      console.log('\n⚠️  DEMO ECOSYSTEM HAS ISSUES');
      console.log('   Please review the test results above');
      if (totalOrders < 50) {
        console.log('   → Run: npm run demo:seed (to add more transactions)');
      }
    }

    console.log('\n');
    return isReady;

  } catch (error) {
    console.error('\n❌ Error testing demo system:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testDemoSystem().then(success => {
  process.exit(success ? 0 : 1);
});
