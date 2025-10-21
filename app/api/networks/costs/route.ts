/**
 * Transaction Cost Comparison API
 * GET /api/networks/costs?token=USDC&amount=100
 * Returns cost breakdown for all available networks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTransactionCosts } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token') || 'USDC';
    const amount = parseFloat(searchParams.get('amount') || '1');

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount',
          message: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    const costs = await getTransactionCosts(token, amount);

    if (costs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No networks available',
          message: `No networks support token ${token}`,
        },
        { status: 404 }
      );
    }

    // Calculate total savings
    const cheapest = costs.reduce((prev, curr) => 
      prev.totalCost < curr.totalCost ? prev : curr
    );
    const mostExpensive = costs.reduce((prev, curr) => 
      prev.totalCost > curr.totalCost ? prev : curr
    );
    const totalSavings = mostExpensive.totalCost - cheapest.totalCost;
    const savingsPercent = (totalSavings / mostExpensive.totalCost) * 100;

    return NextResponse.json({
      success: true,
      data: {
        token,
        amount,
        costs,
        recommendation: {
          network: cheapest.network,
          totalCost: cheapest.totalCost,
          fee: cheapest.transactionFee,
        },
        savings: {
          amount: totalSavings,
          percent: savingsPercent,
          vs: mostExpensive.network,
        },
      },
    });
  } catch (error: any) {
    console.error('Error calculating costs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate costs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
