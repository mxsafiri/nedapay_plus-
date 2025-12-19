import { NextRequest, NextResponse } from 'next/server';
import { getPaycrestService } from '@/lib/offramp/paycrest-service';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type RatesTickerResponse = {
  success: boolean;
  token: 'USDC' | 'USDT';
  amount: string;
  updatedAt: string;
  rates: Array<{
    currency: string;
    rate: string;
    estimatedPayout: string;
  }>;
  failed?: Array<{ currency: string; error: string }>;
};

let tickerCache: { key: string; updatedAtMs: number; payload: RatesTickerResponse } | null = null;
const TICKER_CACHE_TTL_MS = 60_000;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/v1/rates?token=USDC&amount=100&currency=NGN
 * GET /api/v1/rates?token=USDC&amount=1
 * GET /api/v1/rates?token=USDC&amount=1&currencies=NGN,KES,TZS
 * Get real-time exchange rate(s) for stablecoin → fiat conversion
 * 
 * Query Parameters:
 * - token: USDC or USDT (default: USDC)
 * - amount: Amount to convert (required)
 * - currency: Destination fiat currency (optional for ticker mode)
 * - currencies: Comma-separated list of destination currencies (optional for ticker mode)
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
    const currenciesParam = searchParams.get('currencies');

    // Validate required parameters
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: amount' },
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

    // Ticker mode: currency omitted OR currencies=CSV provided
    if (!currency || currenciesParam) {
      const requestedCurrencies = (currenciesParam || '')
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(Boolean);

      const supportedCurrencies = paycrest.getSupportedCurrencies();
      const targetCurrencies = (requestedCurrencies.length ? requestedCurrencies : supportedCurrencies)
        .filter(code => paycrest.isCurrencySupported(code));

      const cacheKey = `${token}:${amount}:${targetCurrencies.join(',')}`;
      const now = Date.now();
      if (tickerCache && tickerCache.key === cacheKey && now - tickerCache.updatedAtMs < TICKER_CACHE_TTL_MS) {
        return NextResponse.json(tickerCache.payload, { headers: corsHeaders });
      }

      const settled = await Promise.allSettled(
        targetCurrencies.map(async (code) => {
          const r = await paycrest.getRate(token, amount, code);
          return {
            currency: r.currency,
            rate: r.rate,
            estimatedPayout: r.estimatedPayout,
          };
        })
      );

      const rateResults: RatesTickerResponse['rates'] = [];
      const failed: Array<{ currency: string; error: string }> = [];

      settled.forEach((item, idx) => {
        const currencyCode = targetCurrencies[idx] || 'UNKNOWN';
        if (item.status === 'fulfilled') {
          rateResults.push(item.value);
        } else {
          failed.push({
            currency: currencyCode,
            error: (item.reason as any)?.message || String(item.reason),
          });
        }
      });

      if (rateResults.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: failed[0]?.error || 'Failed to fetch rates',
            failed,
          },
          { status: 502, headers: corsHeaders }
        );
      }

      const payload: RatesTickerResponse = {
        success: true,
        token,
        amount,
        updatedAt: new Date().toISOString(),
        rates: rateResults,
        failed: failed.length ? failed : undefined,
      };

      tickerCache = { key: cacheKey, updatedAtMs: now, payload };
      return NextResponse.json(payload, { headers: corsHeaders });
    }

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
