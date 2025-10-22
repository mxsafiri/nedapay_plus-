import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';

/**
 * GET /api/dashboard/transactions
 * Fetch user's transaction history
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching transaction history...');
    const user = await getUserFromRequest(request);

    if (!user) {
      console.error('❌ Unauthorized - no user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id, 'Role:', user.scope);

    const userRole = user.scope.toLowerCase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (userRole === 'provider' || userRole === 'psp') {
      // Provider - orders they fulfilled
      const providerProfile = await prisma.provider_profiles.findUnique({
        where: { user_provider_profile: user.id },
        select: { id: true }
      });

      const orders = await prisma.payment_orders.findMany({
        where: {
          assigned_psp_id: providerProfile?.id || ''
        },
        include: {
          tokens: {
            select: {
              symbol: true,
              contract_address: true
            }
          },
          sender_profiles: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit
      });

      return NextResponse.json({
        success: true,
        data: {
          role: 'provider',
          transactions: orders.map(order => ({
            id: order.id,
            amount: order.amount,
            amountUsd: order.amount_in_usd,
            status: order.status,
            commission: order.psp_commission,
            token: order.tokens.symbol,
            txHash: order.tx_hash,
            createdAt: order.created_at,
            updatedAt: order.updated_at
          }))
        }
      });

    } else if (userRole === 'sender' || userRole === 'bank') {
      // Sender - orders they created
      const senderProfile = await prisma.sender_profiles.findUnique({
        where: { user_sender_profile: user.id },
        select: { id: true }
      });

      const orders = await prisma.payment_orders.findMany({
        where: {
          sender_profile_payment_orders: senderProfile?.id || ''
        },
        include: {
          tokens: {
            select: {
              symbol: true,
              contract_address: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit
      });

      return NextResponse.json({
        success: true,
        data: {
          role: 'sender',
          transactions: orders.map(order => ({
            id: order.id,
            amount: order.amount,
            amountUsd: order.amount_in_usd,
            status: order.status,
            markup: order.bank_markup,
            token: order.tokens.symbol,
            txHash: order.tx_hash,
            receiveAddress: order.receive_address_text,
            createdAt: order.created_at,
            updatedAt: order.updated_at
          }))
        }
      });

    } else {
      return NextResponse.json({
        success: true,
        data: {
          role: 'generic',
          transactions: []
        }
      });
    }

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
