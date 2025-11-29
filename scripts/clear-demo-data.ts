/**
 * Clear Demo Data Script
 * Removes all demo/seed data from the database
 * Keeps only real production data
 * 
 * Usage: npm run demo:clear
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function clearDemoData() {
  console.log('🧹 Starting demo data cleanup...\n');

  try {
    // Get current counts
    const beforeCounts = {
      users: await prisma.users.count(),
      paymentOrders: await prisma.payment_orders.count(),
      transactionLogs: await prisma.transaction_logs.count(),
      apiKeys: await prisma.api_keys.count(),
      senderProfiles: await prisma.sender_profiles.count(),
      providerProfiles: await prisma.provider_profiles.count(),
    };

    console.log('📊 Current database state:');
    console.log(`  Users: ${beforeCounts.users}`);
    console.log(`  Payment Orders: ${beforeCounts.paymentOrders}`);
    console.log(`  Transaction Logs: ${beforeCounts.transactionLogs}`);
    console.log(`  API Keys: ${beforeCounts.apiKeys}`);
    console.log(`  Sender Profiles: ${beforeCounts.senderProfiles}`);
    console.log(`  Provider Profiles: ${beforeCounts.providerProfiles}\n`);

    // Identify demo users by email pattern
    const demoUserEmails = [
      'demo@crdbbank.co.tz',
      'demo@nmbbank.co.tz',
      'demo@mufindibank.co.tz',
      'demo@thunes.com',
      'demo@mpesa.co.tz',
      'demo@tigopesamobility.com'
    ];

    // Find demo users
    const demoUsers = await prisma.users.findMany({
      where: {
        OR: [
          { email: { in: demoUserEmails } },
          { email: { contains: 'demo@' } }
        ]
      },
      select: { id: true, email: true }
    });

    if (demoUsers.length === 0) {
      console.log('✅ No demo users found. Database is clean!\n');
      return;
    }

    console.log(`🎯 Found ${demoUsers.length} demo users:\n`);
    demoUsers.forEach(user => console.log(`  - ${user.email}`));
    console.log('');

    const demoUserIds = demoUsers.map(u => u.id);

    // Delete in correct order (respecting foreign keys)
    console.log('🗑️  Deleting demo data...\n');

    // Get demo sender profile IDs
    const demoSenderProfiles = await prisma.sender_profiles.findMany({
      where: { user_sender_profile: { in: demoUserIds } },
      select: { id: true }
    });
    const demoSenderProfileIds = demoSenderProfiles.map(p => p.id);

    // Get demo provider profile IDs
    const demoProviderProfiles = await prisma.provider_profiles.findMany({
      where: { user_provider_profile: { in: demoUserIds } },
      select: { id: true }
    });
    const demoProviderProfileIds = demoProviderProfiles.map(p => p.id);

    // 1. Delete payment orders (and their related transaction logs will cascade)
    const deletedOrders = await prisma.payment_orders.deleteMany({
      where: {
        OR: [
          { sender_profile_payment_orders: { in: demoSenderProfileIds } },
          { assigned_psp_id: { in: demoProviderProfileIds } }
        ]
      }
    });
    console.log(`  ✓ Deleted ${deletedOrders.count} payment orders (and related transaction logs)`);

    // 2. Delete API keys (using profile IDs)
    const deletedApiKeys = await prisma.api_keys.deleteMany({
      where: {
        OR: [
          { sender_profile_api_key: { in: demoSenderProfileIds } },
          { provider_profile_api_key: { in: demoProviderProfileIds } }
        ]
      }
    });
    console.log(`  ✓ Deleted ${deletedApiKeys.count} API keys`);

    // 3. Delete KYB profiles
    const deletedKybProfiles = await prisma.kyb_profiles.deleteMany({
      where: {
        user_kyb_profile: { in: demoUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedKybProfiles.count} KYB profiles`);

    // 5. Delete sender profiles
    const deletedSenderProfiles = await prisma.sender_profiles.deleteMany({
      where: {
        user_sender_profile: { in: demoUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedSenderProfiles.count} sender profiles`);

    // 6. Delete provider profiles
    const deletedProviderProfiles = await prisma.provider_profiles.deleteMany({
      where: {
        user_provider_profile: { in: demoUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedProviderProfiles.count} provider profiles`);

    // 7. Finally, delete demo users
    const deletedUsers = await prisma.users.deleteMany({
      where: {
        id: { in: demoUserIds }
      }
    });
    console.log(`  ✓ Deleted ${deletedUsers.count} demo users\n`);

    // Get new counts
    const afterCounts = {
      users: await prisma.users.count(),
      paymentOrders: await prisma.payment_orders.count(),
      transactionLogs: await prisma.transaction_logs.count(),
      apiKeys: await prisma.api_keys.count(),
      senderProfiles: await prisma.sender_profiles.count(),
      providerProfiles: await prisma.provider_profiles.count(),
    };

    console.log('📊 Updated database state:');
    console.log(`  Users: ${afterCounts.users} (was ${beforeCounts.users})`);
    console.log(`  Payment Orders: ${afterCounts.paymentOrders} (was ${beforeCounts.paymentOrders})`);
    console.log(`  Transaction Logs: ${afterCounts.transactionLogs} (was ${beforeCounts.transactionLogs})`);
    console.log(`  API Keys: ${afterCounts.apiKeys} (was ${beforeCounts.apiKeys})`);
    console.log(`  Sender Profiles: ${afterCounts.senderProfiles} (was ${beforeCounts.senderProfiles})`);
    console.log(`  Provider Profiles: ${afterCounts.providerProfiles} (was ${beforeCounts.providerProfiles})\n`);

    console.log('✅ Demo data cleanup complete!\n');

    // Show remaining real data summary
    if (afterCounts.paymentOrders > 0) {
      const totalVolume = await prisma.payment_orders.aggregate({
        _sum: { amount: true }
      });

      console.log('💰 Real production data:');
      console.log(`  Payment Orders: ${afterCounts.paymentOrders}`);
      console.log(`  Total Volume: $${(totalVolume._sum.amount || 0).toFixed(2)}\n`);
    } else {
      console.log('💡 No production orders yet. All demo data removed.\n');
    }

  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDemoData()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
