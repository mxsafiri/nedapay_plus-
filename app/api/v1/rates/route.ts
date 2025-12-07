import { NextRequest, NextResponse } from 'next/server';
import { getPaycrestService } from '@/lib/offramp/paycrest-service';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/v1/rates?token=USDC&amount=100&currency=NGN
 * Get real-time exchange rate for stablecoin → fiat conversion
 * 
 * Query Parameters:
 * - token: USDC or USDT (default: USDC)
 * - amount: Amount to convert (required)
 * - currency: Destination fiat currency (required, e.g., NGN, KES, TZS)
 * 
 * Response:
 * {
 *   success: true,
 *   rate: "1580.50",
 *   token: "USDC",
 *   currency: "NGN",
 *   amount: "100",
 *   estimatedPayout: "158050.00",
 *   fees: {
 *     senderFee: 0.25,
 *     transactionFee: 0.10
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get('token') || 'USDC').toUpperCase() as 'USDC' | 'USDT';
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency')?.toUpperCase();

    // Validate required parameters
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: amount' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: currency' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!['USDC', 'USDT'].includes(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token. Supported: USDC, USDT' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get Paycrest service
    const paycrest = getPaycrestService();

    // Check if currency is supported
    if (!paycrest.isCurrencySupported(currency)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Currency ${currency} not supported`,
          supportedCurrencies: paycrest.getSupportedCurrencies()
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get rate from Paycrest
    const rate = await paycrest.getRate(token, amount, currency);

    return NextResponse.json({
      success: true,
      rate: rate.rate,
      token: rate.token,
      currency: rate.currency,
      amount: rate.amount,
      estimatedPayout: rate.estimatedPayout,
      fees: {
        senderFee: rate.fees.senderFee,
        transactionFee: rate.fees.transactionFee
      },
      network: 'base'
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Error fetching rate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rate' },
      { status: 500, headers: corsHeaders }
    );
  }
}
