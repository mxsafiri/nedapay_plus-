import { NextResponse } from 'next/server';
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
 * GET /api/v1/currencies
 * List all supported fiat currencies for off-ramp
 * 
 * Response:
 * {
 *   success: true,
 *   currencies: [
 *     { code: "NGN", name: "Nigerian Naira", country: "Nigeria", flag: "🇳🇬" },
 *     { code: "KES", name: "Kenyan Shilling", country: "Kenya", flag: "🇰🇪" },
 *     ...
 *   ]
 * }
 */
export async function GET() {
  try {
    const paycrest = getPaycrestService();
    const supportedCodes = paycrest.getSupportedCurrencies();

    // Currency metadata
    const currencyMetadata: Record<string, { name: string; country: string; flag: string }> = {
      'NGN': { name: 'Nigerian Naira', country: 'Nigeria', flag: '🇳🇬' },
      'KES': { name: 'Kenyan Shilling', country: 'Kenya', flag: '🇰🇪' },
      'UGX': { name: 'Ugandan Shilling', country: 'Uganda', flag: '🇺🇬' },
      'TZS': { name: 'Tanzanian Shilling', country: 'Tanzania', flag: '🇹🇿' },
      'GHS': { name: 'Ghanaian Cedi', country: 'Ghana', flag: '🇬🇭' },
      'MWK': { name: 'Malawian Kwacha', country: 'Malawi', flag: '🇲🇼' },
      'XOF': { name: 'West African CFA Franc', country: 'West Africa (8 countries)', flag: '🌍' },
      'INR': { name: 'Indian Rupee', country: 'India', flag: '🇮🇳' },
      'BRL': { name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷' },
    };

    const currencies = supportedCodes.map(code => ({
      code,
      ...currencyMetadata[code] || { name: code, country: 'Unknown', flag: '🌐' }
    }));

    return NextResponse.json({
      success: true,
      currencies,
      count: currencies.length
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Error fetching currencies:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch currencies' },
      { status: 500, headers: corsHeaders }
    );
  }
}
