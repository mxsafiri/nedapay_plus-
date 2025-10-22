/**
 * Test Suite for Phase 6 Part 1: B2B2C Foundation
 * Tests: Revenue Calculator, Database Schema, Role System
 */

import { PrismaClient, UserRole } from '@/lib/generated/prisma';
import {
  calculateRevenue,
  calculateBankMonthlyEarnings,
  calculatePspMonthlyCommissions,
  calculateVolumeBonus,
  projectAnnualRevenue,
  getSubscriptionCost,
  formatCurrency,
  formatPercent,
} from '@/lib/revenue-calculator';

const prisma = new PrismaClient();

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testPass(name: string) {
  log(`  ✅ ${name}`, colors.green);
}

function testFail(name: string, error: string) {
  log(`  ❌ ${name}: ${error}`, colors.red);
}

function section(title: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

// Test counters
let passed = 0;
let failed = 0;

async function runTests() {
  log('\n🧪 Phase 6 Part 1 Test Suite\n', colors.blue);
  
  // ==========================================
  // Test 1: Revenue Calculator
  // ==========================================
  section('Test 1: Revenue Calculator');
  
  try {
    // Test basic revenue calculation
    const breakdown = calculateRevenue(1000, {
      platformFee: 0.50,
      bankMarkupPercent: 0.002,
      pspCommissionPercent: 0.003,
    });
    
    if (breakdown.bankMarkup === 2.00 &&
        breakdown.pspCommission === 3.00 &&
        breakdown.platformFee === 0.50 &&
        breakdown.totalFees === 5.50) {
      testPass('calculateRevenue() - Basic calculation');
      passed++;
    } else {
      testFail('calculateRevenue()', 'Incorrect calculations');
      failed++;
    }
    
    // Test bank monthly earnings
    const bankEarnings = calculateBankMonthlyEarnings([1000, 2000, 1500], 0.002);
    if (bankEarnings === 9.00) {
      testPass('calculateBankMonthlyEarnings() - Multiple transactions');
      passed++;
    } else {
      testFail('calculateBankMonthlyEarnings()', `Expected 9.00, got ${bankEarnings}`);
      failed++;
    }
    
    // Test PSP commissions
    const pspCommissions = calculatePspMonthlyCommissions([1000, 2000, 1500], 0.003);
    if (pspCommissions === 13.50) {
      testPass('calculatePspMonthlyCommissions() - Multiple fulfillments');
      passed++;
    } else {
      testFail('calculatePspMonthlyCommissions()', `Expected 13.50, got ${pspCommissions}`);
      failed++;
    }
    
    // Test volume bonus - Silver tier
    const silverBonus = calculateVolumeBonus(15000, 500000);
    if (silverBonus.tier === 'silver' && silverBonus.bonus === 250) {
      testPass('calculateVolumeBonus() - Silver tier (10K+ txs)');
      passed++;
    } else {
      testFail('calculateVolumeBonus() - Silver', `Expected silver/250, got ${silverBonus.tier}/${silverBonus.bonus}`);
      failed++;
    }
    
    // Test volume bonus - Gold tier
    const goldBonus = calculateVolumeBonus(50000, 500000);
    if (goldBonus.tier === 'gold' && goldBonus.bonus === 500) {
      testPass('calculateVolumeBonus() - Gold tier (50K+ txs)');
      passed++;
    } else {
      testFail('calculateVolumeBonus() - Gold', `Expected gold/500, got ${goldBonus.tier}/${goldBonus.bonus}`);
      failed++;
    }
    
    // Test volume bonus - Platinum tier
    const platinumBonus = calculateVolumeBonus(100000, 500000);
    if (platinumBonus.tier === 'platinum' && platinumBonus.bonus === 1000) {
      testPass('calculateVolumeBonus() - Platinum tier (100K+ txs)');
      passed++;
    } else {
      testFail('calculateVolumeBonus() - Platinum', `Expected platinum/1000, got ${platinumBonus.tier}/${platinumBonus.bonus}`);
      failed++;
    }
    
    // Test annual projection
    const projection = projectAnnualRevenue(5000, 10000);
    if (projection.projectedAnnual === 60000 &&
        projection.projectedMonthly === 5000 &&
        projection.averagePerTransaction === 0.5) {
      testPass('projectAnnualRevenue() - Annual calculations');
      passed++;
    } else {
      testFail('projectAnnualRevenue()', 'Incorrect projections');
      failed++;
    }
    
    // Test subscription costs
    const freeCost = getSubscriptionCost('free');
    const basicCost = getSubscriptionCost('basic');
    const premiumCost = getSubscriptionCost('premium');
    
    if (freeCost === 0 && basicCost === 50 && premiumCost === 100) {
      testPass('getSubscriptionCost() - All tiers');
      passed++;
    } else {
      testFail('getSubscriptionCost()', 'Incorrect pricing');
      failed++;
    }
    
    // Test formatters
    const formatted = formatCurrency(1234.56);
    const percent = formatPercent(0.002);
    
    if (formatted === '$1,234.56' && percent === '0.20%') {
      testPass('formatCurrency() & formatPercent() - Formatting');
      passed++;
    } else {
      testFail('Formatters', `Expected $1,234.56 and 0.20%, got ${formatted} and ${percent}`);
      failed++;
    }
    
  } catch (error: any) {
    testFail('Revenue Calculator', error.message);
    failed++;
  }
  
  // ==========================================
  // Test 2: Database Schema
  // ==========================================
  section('Test 2: Database Schema Verification');
  
  try {
    // Test UserRole enum exists
    const roles: UserRole[] = ['BANK', 'PSP', 'ADMIN'];
    testPass('UserRole enum - BANK, PSP, ADMIN defined');
    passed++;
    
    // Test users table has role field
    const userSchema = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role'
    `;
    
    if (userSchema.length > 0) {
      testPass('users.role field - Added successfully');
      passed++;
    } else {
      testFail('users.role field', 'Not found in database');
      failed++;
    }
    
    // Test sender_profiles new fields
    const senderSchema = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'sender_profiles' 
      AND column_name IN ('markup_percentage', 'subscription_tier', 'monthly_earnings', 'total_earnings', 'white_label_config')
    `;
    
    if (senderSchema.length === 5) {
      testPass('sender_profiles - 5 new fields added');
      passed++;
    } else {
      testFail('sender_profiles', `Expected 5 fields, found ${senderSchema.length}`);
      failed++;
    }
    
    // Test provider_profiles new fields
    const providerSchema = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'provider_profiles' 
      AND column_name IN ('commission_rate', 'supported_countries', 'monthly_commissions', 'total_commissions', 'fulfillment_count', 'treasury_accounts')
    `;
    
    if (providerSchema.length === 6) {
      testPass('provider_profiles - 6 new fields added');
      passed++;
    } else {
      testFail('provider_profiles', `Expected 6 fields, found ${providerSchema.length}`);
      failed++;
    }
    
    // Test payment_orders new fields
    const orderSchema = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'payment_orders' 
      AND column_name IN ('bank_markup', 'psp_commission', 'platform_fee', 'assigned_psp_id')
    `;
    
    if (orderSchema.length === 4) {
      testPass('payment_orders - 4 new fields added');
      passed++;
    } else {
      testFail('payment_orders', `Expected 4 fields, found ${orderSchema.length}`);
      failed++;
    }
    
    // Test no duplicate addresses
    const duplicates = await prisma.$queryRaw<any[]>`
      SELECT address, COUNT(*) as count
      FROM receive_addresses
      GROUP BY address
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.length === 0) {
      testPass('receive_addresses - No duplicates');
      passed++;
    } else {
      testFail('receive_addresses', `Found ${duplicates.length} duplicate addresses`);
      failed++;
    }
    
  } catch (error: any) {
    testFail('Database Schema', error.message);
    failed++;
  }
  
  // ==========================================
  // Test 3: Default Values
  // ==========================================
  section('Test 3: Default Values Verification');
  
  try {
    // Check default values for sender_profiles
    const senderDefaults = await prisma.$queryRaw<any[]>`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'sender_profiles' 
      AND column_name IN ('markup_percentage', 'subscription_tier', 'monthly_earnings', 'total_earnings')
    `;
    
    const markupDefault = senderDefaults.find(c => c.column_name === 'markup_percentage')?.column_default;
    const tierDefault = senderDefaults.find(c => c.column_name === 'subscription_tier')?.column_default;
    
    if (markupDefault?.includes('0.002')) {
      testPass('sender_profiles.markup_percentage - Default 0.002 (0.2%)');
      passed++;
    } else {
      testFail('sender_profiles.markup_percentage', `Expected 0.002, got ${markupDefault}`);
      failed++;
    }
    
    if (tierDefault?.includes('free')) {
      testPass('sender_profiles.subscription_tier - Default "free"');
      passed++;
    } else {
      testFail('sender_profiles.subscription_tier', `Expected "free", got ${tierDefault}`);
      failed++;
    }
    
    // Check default values for provider_profiles
    const providerDefaults = await prisma.$queryRaw<any[]>`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'provider_profiles' 
      AND column_name IN ('commission_rate', 'monthly_commissions', 'fulfillment_count')
    `;
    
    const commissionDefault = providerDefaults.find(c => c.column_name === 'commission_rate')?.column_default;
    
    if (commissionDefault?.includes('0.003')) {
      testPass('provider_profiles.commission_rate - Default 0.003 (0.3%)');
      passed++;
    } else {
      testFail('provider_profiles.commission_rate', `Expected 0.003, got ${commissionDefault}`);
      failed++;
    }
    
  } catch (error: any) {
    testFail('Default Values', error.message);
    failed++;
  }
  
  // ==========================================
  // Test Results Summary
  // ==========================================
  section('Test Results Summary');
  
  const total = passed + failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
  
  log(`\n  Total Tests: ${total}`, colors.blue);
  log(`  ✅ Passed: ${passed}`, colors.green);
  log(`  ❌ Failed: ${failed}`, colors.red);
  log(`  📊 Success Rate: ${percentage}%\n`, colors.cyan);
  
  if (failed === 0) {
    log('🎉 All tests passed! Phase 6 Part 1 is working correctly.\n', colors.green);
  } else {
    log('⚠️  Some tests failed. Please review the errors above.\n', colors.yellow);
  }
  
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
