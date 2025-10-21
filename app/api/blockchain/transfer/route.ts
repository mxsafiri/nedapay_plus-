/**
 * Multi-Chain Transfer API
 * POST /api/blockchain/transfer
 * 
 * Executes a token transfer with automatic network selection and failover
 * 
 * Request Body:
 * {
 *   from: string (Hedera account ID or EVM address)
 *   to: string (recipient account ID or address)
 *   tokenSymbol: string (e.g., "USDC")
 *   amount: number (in token's standard unit, e.g., $100)
 *   memo?: string (optional transaction memo)
 *   orderId?: string (optional payment order ID to track)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeTransfer, type TransactionParams } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { from, to, tokenSymbol, amount } = body;

    if (!from || !to || !tokenSymbol || amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Required fields: from, to, tokenSymbol, amount',
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount',
          message: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    // Prepare transaction parameters
    const params: TransactionParams = {
      from,
      to,
      tokenSymbol,
      amount,
      memo: body.memo,
      orderId: body.orderId,
    };

    console.log('🔀 Executing multi-chain transfer:', params);

    // Execute transfer with automatic network selection
    const result = await executeTransfer(params);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          transactionHash: result.transactionHash,
          networkUsed: result.networkUsed,
          networkType: result.networkType,
          fee: result.fee,
          timestamp: result.timestamp,
          attemptedNetworks: result.attemptedNetworks,
        },
        message: `Transfer completed successfully on ${result.networkUsed}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Transfer failed',
          message: result.error,
          attemptedNetworks: result.attemptedNetworks,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error executing transfer:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check API status
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Multi-chain transfer API is operational',
    usage: {
      method: 'POST',
      endpoint: '/api/blockchain/transfer',
      body: {
        from: 'string (required)',
        to: 'string (required)',
        tokenSymbol: 'string (required)',
        amount: 'number (required)',
        memo: 'string (optional)',
        orderId: 'string (optional)',
      },
    },
  });
}
