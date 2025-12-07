import { NextRequest, NextResponse } from 'next/server';
import { getPaycrestService } from '@/lib/offramp/paycrest-service';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Test endpoint to check Paycrest connection
 * GET /api/v1/test-paycrest?token=USDC&amount=100&currency=NGN
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || 'USDC';
    const amount = searchParams.get('amount') || '100';
    const currency = searchParams.get('currency') || 'NGN';

    console.log('🧪 Testing Paycrest connection...');
    console.log(`   Token: ${token}, Amount: ${amount}, Currency: ${currency}`);

    // Check if env var is set
    const hasSecret = !!(process.env.PAYCREST_CLIENT_SECRET || process.env.PAYCREST_API_KEY);
    console.log(`   PAYCREST_CLIENT_SECRET configured: ${hasSecret}`);

    if (!hasSecret) {
      return NextResponse.json({
        success: false,
        error: 'PAYCREST_CLIENT_SECRET not configured',
        envCheck: {
          PAYCREST_CLIENT_SECRET: !!process.env.PAYCREST_CLIENT_SECRET,
          PAYCREST_API_KEY: !!process.env.PAYCREST_API_KEY,
        }
      }, { status: 500, headers: corsHeaders });
    }

    // Try to initialize service
    let paycrest;
    try {
      paycrest = getPaycrestService();
      console.log('   ✅ Paycrest service initialized');
    } catch (initError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Paycrest service',
        details: initError.message
      }, { status: 500, headers: corsHeaders });
    }

    // Try to get rate
    console.log('   📊 Fetching rate...');
    const rate = await paycrest.getRate(
      token.toUpperCase() as 'USDC' | 'USDT',
      amount,
      currency
    );

    return NextResponse.json({
      success: true,
      message: 'Paycrest connection working!',
      rate: rate,
      envCheck: {
        PAYCREST_CLIENT_SECRET: !!process.env.PAYCREST_CLIENT_SECRET,
        BASE_TREASURY_ADDRESS: !!process.env.BASE_TREASURY_ADDRESS,
        BASE_PRIVATE_KEY: !!process.env.BASE_PRIVATE_KEY,
        BASE_MAINNET_RPC: !!process.env.BASE_MAINNET_RPC,
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Paycrest test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Paycrest test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500, headers: corsHeaders });
  }
}
