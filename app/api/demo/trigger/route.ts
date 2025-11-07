import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import * as crypto from 'crypto';

/**
 * POST /api/demo/trigger
 * Trigger an instant demo transaction flow
 * 
 * This creates a demo order and returns it immediately.
 * The Virtual PSP Bot will automatically process it.
 * 
 * Use Cases:
 * - "Run Demo" button in UI
 * - Live presentations
 * - Trade shows
 * - Investor demos
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Demo trigger requested...');

    // Optional: Authenticate (or allow public demo)
    const user = await getUserFromRequest(request);

    // Parse request body
    const body = await request.json();
    const {
      amount = 1000000, // Default: 1M TZS
      toCurrency = 'CNY',
      _scenario = 'default', // default, large, small (reserved for future use)
    } = body;

    // Get demo bank (or use current user if they're a bank)
    let bankProfile;
    
    if (user && user.scope.toLowerCase() === 'bank') {
      // User is a bank, use their profile
      bankProfile = await prisma.sender_profiles.findUnique({
        where: { user_sender_profile: user.id },
      });
    } else {
      // No user or not a bank, use first demo bank
      const demoUser = await prisma.users.findFirst({
        where: { email: { contains: 'demo@crdb' } },
      });

      if (!demoUser) {
        return NextResponse.json(
          { success: false, error: 'Demo ecosystem not seeded. Run: npm run demo:seed' },
          { status: 400 }
        );
      }

      bankProfile = await prisma.sender_profiles.findUnique({
        where: { user_sender_profile: demoUser.id },
      });
    }

    if (!bankProfile) {
      return NextResponse.json(
        { success: false, error: 'Bank profile not found' },
        { status: 400 }
      );
    }

    // Get USDC token
    const usdcToken = await prisma.tokens.findFirst({
      where: { symbol: 'USDC' },
    });

    if (!usdcToken) {
      return NextResponse.json(
        { success: false, error: 'USDC token not found in database' },
        { status: 500 }
      );
    }

    // Calculate conversion
    const exchangeRate = toCurrency === 'CNY' ? 0.00245 : 0.025; // TZS to CNY or KES
    const toAmount = amount * exchangeRate;

    // Calculate fees
    const markupPercentage = bankProfile.markup_percentage || 0.002;
    const bankMarkup = toAmount * markupPercentage;
    const platformFee = 0.50;
    const pspCommissionRate = 0.003;
    const pspCommission = toAmount * pspCommissionRate;

    // Create demo order (will be picked up by Virtual PSP Bot)
    const orderId = crypto.randomUUID();

    const order = await prisma.payment_orders.create({
      data: {
        id: orderId,
        amount: amount,
        amount_paid: toAmount,
        amount_returned: 0,
        amount_in_usd: toAmount,
        sender_fee: 0,
        rate: exchangeRate,
        receive_address_text: 'demo_recipient@example.com',
        status: 'pending', // Virtual bot will process this
        sender_profile_payment_orders: bankProfile.id,
        token_payment_orders: usdcToken.id,
        network_fee: 0.02,
        fee_percent: markupPercentage,
        percent_settled: 0,
        protocol_fee: platformFee,
        reference: `DEMO-LIVE-${Date.now()}`,
        is_test_mode: true,
        bank_markup: bankMarkup,
        psp_commission: pspCommission,
        platform_fee: platformFee,
        assigned_psp_id: null, // Will be assigned by bot
        settlement_status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Demo order created:', orderId);
    console.log('   Amount:', amount, 'TZS →', toAmount, toCurrency);
    console.log('   Bank Markup:', bankMarkup);
    console.log('   PSP Commission:', pspCommission);
    console.log('   Waiting for Virtual PSP Bot...\n');

    return NextResponse.json({
      success: true,
      message: 'Demo order created! Virtual PSP Bot will process it in 30-90 seconds.',
      order: {
        orderId,
        status: order.status,
        fromAmount: amount,
        fromCurrency: 'TZS',
        toAmount: toAmount,
        toCurrency,
        bankMarkup,
        pspCommission,
        createdAt: order.created_at,
        estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // ~1 minute
        reference: `DEMO-PAY-${orderId.substring(0, 8).toUpperCase()}`,
        recipient: {
          accountNumber: '6217003820001234567',
          accountName: 'Beijing Trading Co., Ltd',
          institution: 'Bank of China (BOC)',
          branch: 'Beijing Central Branch',
        },
        fulfillment: {
          pspName: 'Pending assignment...',
          method: 'International Wire Transfer',
        },
        platformFee: bankMarkup + pspCommission,
      },
      instructions: {
        watchStatus: `/api/v1/payment-orders/${orderId}`,
        expectedFlow: [
          '1. Order created (status: pending)',
          '2. Virtual PSP Bot assigns PSP (status: processing)',
          '3. Processing delay: 30-90 seconds',
          '4. Order completed (status: completed)',
          '5. Settlement recorded on Hedera testnet',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Error triggering demo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger demo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/demo/trigger
 * Get demo ecosystem status
 */
export async function GET(_request: NextRequest) {
  try {
    // Count demo accounts
    const demoUsers = await prisma.users.count({
      where: { email: { contains: 'demo@' } },
    });

    const demoBanks = await prisma.sender_profiles.count({
      where: { users: { email: { contains: 'demo@' } } },
    });

    const demoPSPs = await prisma.provider_profiles.count({
      where: { users: { email: { contains: 'demo@' } } },
    });

    const demoTransactions = await prisma.payment_orders.count({
      where: { is_test_mode: true },
    });

    const pendingOrders = await prisma.payment_orders.count({
      where: {
        is_test_mode: true,
        status: { in: ['pending', 'processing'] },
      },
    });

    const isSeeded = demoUsers > 0;
    const botProcessing = pendingOrders > 0;

    return NextResponse.json({
      success: true,
      ecosystem: {
        seeded: isSeeded,
        users: demoUsers,
        banks: demoBanks,
        psps: demoPSPs,
        totalTransactions: demoTransactions,
        pendingOrders: pendingOrders,
        botProcessing: botProcessing,
      },
      actions: isSeeded
        ? {
            createDemoOrder: 'POST /api/demo/trigger',
            startBot: 'npm run demo:bot',
          }
        : {
            seedEcosystem: 'npm run demo:seed',
          },
    });

  } catch (error) {
    console.error('❌ Error checking demo status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check demo status',
      },
      { status: 500 }
    );
  }
}
