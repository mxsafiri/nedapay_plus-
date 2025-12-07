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
 * GET /api/v1/institutions?currency=NGN
 * List supported banks/mobile money providers for a currency
 * 
 * Query Parameters:
 * - currency: Fiat currency code (required, e.g., NGN, KES, TZS)
 * 
 * Response:
 * {
 *   success: true,
 *   currency: "NGN",
 *   institutions: [
 *     { code: "GTB", name: "Guaranty Trust Bank", type: "bank" },
 *     { code: "FCMB", name: "First City Monument Bank", type: "bank" },
 *     ...
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency')?.toUpperCase();

    // Validate required parameter
    if (!currency) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: currency',
          example: '/api/v1/institutions?currency=NGN'
        },
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

    // Get institutions from Paycrest
    const institutions = await paycrest.getSupportedInstitutions(currency);

    return NextResponse.json({
      success: true,
      currency,
      institutions: institutions.map(inst => ({
        code: inst.code,
        name: inst.name,
        type: inst.type
      })),
      count: institutions.length
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Error fetching institutions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch institutions' },
      { status: 500, headers: corsHeaders }
    );
  }
}
