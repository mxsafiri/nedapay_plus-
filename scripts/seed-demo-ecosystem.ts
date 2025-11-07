/**
 * Demo Ecosystem Seeder
 * Creates realistic demo data to showcase platform capabilities
 * 
 * Creates:
 * - 3 Demo Banks with API keys
 * - 3 Demo PSPs with API keys
 * - 500+ historical transactions (completed)
 * - Revenue analytics data
 * 
 * Usage: npm run demo:seed
 */

import { PrismaClient } from '../lib/generated/prisma';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Use direct connection for bulk operations (not pooler)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

// Utility: Hash API key
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Utility: Generate API key
function generateApiKey(prefix: string): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `${prefix}_live_${random}`;
}

// Demo Banks Configuration
const DEMO_BANKS = [
  {
    email: 'demo@crdbbank.co.tz',
    name: 'CRDB Bank Tanzania',
    tradingName: 'CRDB Bank',
    country: 'Tanzania',
    markup: 0.002, // 0.2%
  },
  {
    email: 'demo@nmbbank.co.tz',
    name: 'NMB Bank Tanzania',
    tradingName: 'NMB Bank',
    country: 'Tanzania',
    markup: 0.0025, // 0.25%
  },
  {
    email: 'demo@mufindibank.co.tz',
    name: 'Mufindi Community Bank',
    tradingName: 'Mufindi Bank',
    country: 'Tanzania',
    markup: 0.003, // 0.3%
  },
];

// Demo PSPs Configuration
const DEMO_PSPS = [
  {
    email: 'demo@thunes.com',
    name: 'Thunes Global',
    tradingName: 'Thunes',
    countries: ['China', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda'],
    commission: 0.003, // 0.3%
    treasuryAccounts: {
      'hedera-testnet': '0.0.12345678',
      'hedera-mainnet': '0.0.87654321',
    },
  },
  {
    email: 'demo@mpesa.com',
    name: 'M-Pesa Tanzania',
    tradingName: 'M-Pesa TZ',
    countries: ['Tanzania', 'Kenya'],
    commission: 0.0025, // 0.25%
    treasuryAccounts: {
      'hedera-testnet': '0.0.23456789',
    },
  },
  {
    email: 'demo@tigopesa.com',
    name: 'Tigo Pesa',
    tradingName: 'Tigo Pesa',
    countries: ['Tanzania'],
    commission: 0.0028, // 0.28%
    treasuryAccounts: {
      'hedera-testnet': '0.0.34567890',
    },
  },
];

// Transaction templates for variety
const TRANSACTION_TEMPLATES = [
  { fromAmount: 1000000, toCurrency: 'CNY', corridor: 'TZS → CNY', rate: 0.00245 },
  { fromAmount: 500000, toCurrency: 'CNY', corridor: 'TZS → CNY', rate: 0.00245 },
  { fromAmount: 2500000, toCurrency: 'CNY', corridor: 'TZS → CNY', rate: 0.00245 },
  { fromAmount: 750000, toCurrency: 'KES', corridor: 'TZS → KES', rate: 0.025 },
  { fromAmount: 1200000, toCurrency: 'UGX', corridor: 'TZS → UGX', rate: 1.45 },
  { fromAmount: 300000, toCurrency: 'CNY', corridor: 'TZS → CNY', rate: 0.00245 },
];

async function clearDemoData() {
  console.log('🧹 Cleaning existing demo data...\n');
  
  // Delete in correct order (respect foreign keys)
  await prisma.transaction_logs.deleteMany({
    where: { status: 'demo_transaction' }
  });
  
  await prisma.payment_orders.deleteMany({
    where: { is_test_mode: true }
  });
  
  // Delete demo users and their related data
  const demoUsers = await prisma.users.findMany({
    where: { email: { contains: 'demo@' } },
    select: { id: true }
  });
  
  const demoUserIds = demoUsers.map(u => u.id);
  
  if (demoUserIds.length > 0) {
    await prisma.api_keys.deleteMany({
      where: {
        OR: [
          { sender_profiles: { user_sender_profile: { in: demoUserIds } } },
          { provider_profiles: { user_provider_profile: { in: demoUserIds } } },
        ]
      }
    });
    
    await prisma.sender_profiles.deleteMany({
      where: { user_sender_profile: { in: demoUserIds } }
    });
    
    await prisma.provider_profiles.deleteMany({
      where: { user_provider_profile: { in: demoUserIds } }
    });
  }
  
  await prisma.users.deleteMany({
    where: { email: { contains: 'demo@' } }
  });
  
  console.log('✅ Cleanup complete\n');
}

async function createDemoBanks() {
  console.log('🏦 Creating demo banks...\n');
  const banks = [];
  
  for (const bank of DEMO_BANKS) {
    const password = await bcrypt.hash('Demo2025!', 10);
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    
    // Create user
    const user = await prisma.users.create({
      data: {
        id: userId,
        email: bank.email,
        password: password,
        first_name: bank.name.split(' ')[0],
        last_name: 'Demo',
        scope: 'BANK',
        role: 'BANK',
        is_email_verified: true,
        kyb_verification_status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // Create sender profile
    const profile = await prisma.sender_profiles.create({
      data: {
        id: profileId,
        user_sender_profile: user.id,
        webhook_url: `https://demo.nedapay.com/webhooks/${bank.tradingName.toLowerCase().replace(/\s+/g, '-')}`,
        domain_whitelist: ['*'],
        is_active: true,
        is_partner: true,
        markup_percentage: bank.markup,
        subscription_tier: 'premium',
        monthly_earnings: 0,
        total_earnings: 0,
        test_balance: 50000, // $50k test balance
        white_label_config: {
          name: bank.tradingName,
          logo: `https://logo.clearbit.com/${bank.email.split('@')[1]}`,
          primaryColor: '#0066cc',
        },
        updated_at: new Date(),
      },
    });
    
    // Create API key
    const apiKey = generateApiKey('bank');
    const hashedKey = hashApiKey(apiKey);
    
    await prisma.api_keys.create({
      data: {
        id: crypto.randomUUID(),
        secret: hashedKey,
        sender_profile_api_key: profile.id,
        is_test: false, // Live keys for demo
      },
    });
    
    banks.push({ user, profile, apiKey, config: bank });
    
    console.log(`✅ ${bank.tradingName}`);
    console.log(`   Email: ${bank.email}`);
    console.log(`   Password: Demo2025!`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   Markup: ${(bank.markup * 100).toFixed(2)}%\n`);
  }
  
  return banks;
}

async function createDemoPSPs() {
  console.log('💼 Creating demo PSPs...\n');
  const psps = [];
  
  for (const psp of DEMO_PSPS) {
    const password = await bcrypt.hash('Demo2025!', 10);
    const userId = crypto.randomUUID();
    const profileId = `psp-${crypto.randomUUID().substring(0, 8)}`; // Keep short format for profileId (VarChar, not UUID type)
    
    // Create user
    const user = await prisma.users.create({
      data: {
        id: userId,
        email: psp.email,
        password: password,
        first_name: psp.name.split(' ')[0],
        last_name: 'Demo',
        scope: 'PSP',
        role: 'PSP',
        is_email_verified: true,
        kyb_verification_status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // Create provider profile
    const profile = await prisma.provider_profiles.create({
      data: {
        id: profileId,
        user_provider_profile: user.id,
        trading_name: psp.tradingName,
        is_active: true,
        is_available: true,
        is_kyb_verified: true,
        commission_rate: psp.commission,
        monthly_commissions: 0,
        total_commissions: 0,
        fulfillment_count: BigInt(0),
        supported_countries: psp.countries,
        treasury_accounts: psp.treasuryAccounts,
        fiat_infrastructure: {
          mpesa: { enabled: true, provider: 'vodacom' },
          thunes: { enabled: true, environment: 'production' },
        },
        test_balance: 100000, // $100k test balance
        updated_at: new Date(),
      },
    });
    
    // Create API key
    const apiKey = generateApiKey('psp');
    const hashedKey = hashApiKey(apiKey);
    
    await prisma.api_keys.create({
      data: {
        id: crypto.randomUUID(),
        secret: hashedKey,
        provider_profile_api_key: profile.id,
        is_test: false,
      },
    });
    
    psps.push({ user, profile, apiKey, config: psp });
    
    console.log(`✅ ${psp.tradingName}`);
    console.log(`   Email: ${psp.email}`);
    console.log(`   Password: Demo2025!`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   Commission: ${(psp.commission * 100).toFixed(2)}%`);
    console.log(`   Countries: ${psp.countries.join(', ')}\n`);
  }
  
  return psps;
}

async function createHistoricalTransactions(banks: any[], psps: any[]) {
  console.log('📊 Creating historical transactions...\n');
  
  const TRANSACTION_COUNT = 100; // Reduced for faster seeding
  const DAYS_BACK = 30;
  
  // Get default token (USDC)
  const usdcToken = await prisma.tokens.findFirst({
    where: { symbol: 'USDC' }
  });
  
  if (!usdcToken) {
    console.error('❌ USDC token not found. Run migrations first.');
    return;
  }
  
  let completed = 0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_BACK);
  
  for (let i = 0; i < TRANSACTION_COUNT; i++) {
    // Random bank and PSP
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const psp = psps[Math.floor(Math.random() * psps.length)];
    
    // Random transaction template
    const template = TRANSACTION_TEMPLATES[Math.floor(Math.random() * TRANSACTION_TEMPLATES.length)];
    
    // Random timestamp within last 30 days
    const randomDays = Math.random() * DAYS_BACK;
    const createdAt = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
    const completedAt = new Date(createdAt.getTime() + (30 + Math.random() * 120) * 1000); // 30-150 seconds later
    
    // Calculate amounts
    const fromAmount = template.fromAmount;
    const toAmount = fromAmount * template.rate;
    const bankMarkup = toAmount * bank.config.markup;
    const pspCommission = toAmount * psp.config.commission;
    const platformFee = 0.50;
    
    // Generate realistic tx hashes
    const txHash = `0.0.${Math.floor(Math.random() * 10000000)}@${createdAt.getTime() / 1000}`;
    const settlementHash = `0.0.${Math.floor(Math.random() * 10000000)}@${completedAt.getTime() / 1000}`;
    
    // Create payment order (must be valid UUID)
    const orderId = crypto.randomUUID();
    
    await prisma.payment_orders.create({
      data: {
        id: orderId,
        amount: fromAmount,
        amount_paid: toAmount,
        amount_returned: 0,
        amount_in_usd: toAmount,
        sender_fee: 0,
        rate: template.rate,
        receive_address_text: `demo_recipient_${i}@example.com`,
        status: 'completed',
        sender_profile_payment_orders: bank.profile.id,
        token_payment_orders: usdcToken.id,
        network_fee: 0.02,
        fee_percent: bank.config.markup,
        percent_settled: 100,
        protocol_fee: platformFee,
        reference: `DEMO-${i.toString().padStart(6, '0')}`,
        is_test_mode: true,
        tx_hash: txHash,
        tx_id: txHash,
        network_used: 'hedera-testnet',
        block_number: BigInt(Math.floor(Math.random() * 1000000)),
        bank_markup: bankMarkup,
        psp_commission: pspCommission,
        platform_fee: platformFee,
        assigned_psp_id: psp.profile.id,
        settlement_tx_hash: settlementHash,
        settlement_network: 'hedera-testnet',
        settlement_status: 'completed',
        settled_at: completedAt,
        fulfillment_method: 'mpesa',
        created_at: createdAt,
        updated_at: completedAt,
      },
    });
    
    // Update bank earnings
    await prisma.sender_profiles.update({
      where: { id: bank.profile.id },
      data: {
        total_earnings: { increment: bankMarkup },
        monthly_earnings: { increment: bankMarkup },
      },
    });
    
    // Update PSP earnings
    await prisma.provider_profiles.update({
      where: { id: psp.profile.id },
      data: {
        total_commissions: { increment: pspCommission },
        monthly_commissions: { increment: pspCommission },
        fulfillment_count: { increment: 1 },
      },
    });
    
    // Create transaction log
    await prisma.transaction_logs.create({
      data: {
        id: crypto.randomUUID(),
        payment_order_transactions: orderId,
        tx_hash: settlementHash,
        network: 'hedera-testnet',
        status: 'demo_transaction',
        metadata: {
          type: 'demo_settlement',
          bank: bank.config.tradingName,
          psp: psp.config.tradingName,
          corridor: template.corridor,
        },
        created_at: completedAt,
      },
    });
    
    completed++;
    if (completed % 25 === 0) {
      console.log(`   ✓ Created ${completed} transactions...`);
    }
  }
  
  console.log(`\n✅ Created ${TRANSACTION_COUNT} historical transactions\n`);
}

async function printSummary(banks: any[], psps: any[]) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 DEMO ECOSYSTEM READY!');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📊 STATS:');
  console.log(`   Banks: ${banks.length}`);
  console.log(`   PSPs: ${psps.length}`);
  console.log(`   Transactions: 100`);
  console.log(`   Total Volume: ~$100,000 USD\n`);
  
  console.log('🔑 LOGIN CREDENTIALS (all users):');
  console.log('   Password: Demo2025!\n');
  
  console.log('🏦 BANKS:');
  banks.forEach(bank => {
    console.log(`   • ${bank.config.tradingName}: ${bank.user.email}`);
  });
  
  console.log('\n💼 PSPs:');
  psps.forEach(psp => {
    console.log(`   • ${psp.config.tradingName}: ${psp.user.email}`);
  });
  
  console.log('\n📡 API KEYS (saved to .env.demo):');
  console.log('   Check .env.demo for all API keys\n');
  
  console.log('🚀 NEXT STEPS:');
  console.log('   1. Login with any demo account');
  console.log('   2. View populated dashboards');
  console.log('   3. Test API with provided keys');
  console.log('   4. Run Virtual PSP Bot for live demos\n');
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Save credentials to file
  let envContent = '# DEMO ECOSYSTEM CREDENTIALS\n';
  envContent += '# Generated: ' + new Date().toISOString() + '\n\n';
  
  envContent += '# All passwords: Demo2025!\n\n';
  
  envContent += '# BANK API KEYS\n';
  banks.forEach((bank, i) => {
    envContent += `DEMO_BANK_${i + 1}_NAME="${bank.config.tradingName}"\n`;
    envContent += `DEMO_BANK_${i + 1}_EMAIL="${bank.user.email}"\n`;
    envContent += `DEMO_BANK_${i + 1}_API_KEY="${bank.apiKey}"\n\n`;
  });
  
  envContent += '# PSP API KEYS\n';
  psps.forEach((psp, i) => {
    envContent += `DEMO_PSP_${i + 1}_NAME="${psp.config.tradingName}"\n`;
    envContent += `DEMO_PSP_${i + 1}_EMAIL="${psp.user.email}"\n`;
    envContent += `DEMO_PSP_${i + 1}_API_KEY="${psp.apiKey}"\n\n`;
  });
  
  const fs = require('fs');
  fs.writeFileSync('.env.demo', envContent);
  console.log('✅ Credentials saved to .env.demo\n');
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       NEDAPAY+ DEMO ECOSYSTEM SEEDER v1.0            ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n');
  
  try {
    // Skip cleanup to avoid connection issues - demo accounts already exist
    console.log('⏭️  Skipping cleanup (accounts already exist)\n');
    
    // Just create transactions for existing demo accounts
    console.log('📊 Creating historical transactions for existing demo accounts...\n');
    
    // Get existing demo banks
    const demoUsers = await prisma.users.findMany({
      where: { 
        email: { contains: 'demo@' },
        scope: { in: ['BANK', 'PSP'] }
      },
      include: {
        sender_profiles: true,
        provider_profiles: true,
      }
    });
    
    const banks = demoUsers
      .filter(u => u.scope === 'BANK' && u.sender_profiles)
      .map(u => ({
        user: u,
        profile: u.sender_profiles!,
        config: { tradingName: u.first_name, markup: u.sender_profiles!.markup_percentage || 0.002 }
      }));
      
    const psps = demoUsers
      .filter(u => u.scope === 'PSP' && u.provider_profiles)
      .map(u => ({
        user: u,
        profile: u.provider_profiles!,
        config: { tradingName: u.provider_profiles!.trading_name, commission: u.provider_profiles!.commission_rate || 0.003 }
      }));
    
    if (banks.length === 0 || psps.length === 0) {
      console.error('❌ No demo accounts found. Run full seeder first.');
      return;
    }
    
    console.log(`✅ Found ${banks.length} banks and ${psps.length} PSPs\n`);
    
    await createHistoricalTransactions(banks, psps);
    
    console.log('✅ Transactions created successfully!\n');
  } catch (error) {
    console.error('❌ Error creating demo ecosystem:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
