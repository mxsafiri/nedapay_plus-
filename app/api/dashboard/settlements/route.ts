import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import { getProviderSettlementStats } from '@/lib/settlements/settlement-service';

/**
 * GET /api/dashboard/settlements
 * Get settlement history and stats for provider
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.scope.toLowerCase();

    // Only providers can view settlements
    if (userRole !== 'provider' && userRole !== 'psp') {
      return NextResponse.json(
        { error: 'Only providers can view settlements' },
        { status: 403 }
      );
    }

    // Get provider profile
    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id },
      select: { id: true }
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Get settlement stats
    const stats = await getProviderSettlementStats(providerProfile.id);

    // Get recent settlements (last 20)
    const recentSettlements = await prisma.payment_orders.findMany({
      where: {
        assigned_psp_id: providerProfile.id,
        settlement_status: 'completed',
        settled_at: { not: null }
      },
      select: {
        id: true,
        amount_paid: true,
        psp_commission: true,
        settlement_tx_hash: true,
        settlement_network: true,
        settled_at: true,
        fulfillment_method: true,
        tx_hash: true
      },
      orderBy: { settled_at: 'desc' },
      take: 20
    });

    // Format settlements with total amounts
    const settlements = recentSettlements.map(order => ({
      orderId: order.id,
      settlementAmount: Number(order.amount_paid) + Number(order.psp_commission),
      reimbursement: Number(order.amount_paid),
      commission: Number(order.psp_commission),
      settlementTxHash: order.settlement_tx_hash,
      settlementNetwork: order.settlement_network,
      settledAt: order.settled_at,
      fulfillmentMethod: order.fulfillment_method || order.tx_hash,
      blockExplorerUrl: getBlockExplorerUrl(order.settlement_network, order.settlement_tx_hash)
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        settlements
      }
    });

  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch settlements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get block explorer URL for settlement transaction
 */
function getBlockExplorerUrl(network: string | null, txHash: string | null): string | null {
  if (!network || !txHash) return null;

  const explorers: Record<string, string> = {
    'hedera-testnet': 'https://hashscan.io/testnet/transaction',
    'hedera-mainnet': 'https://hashscan.io/mainnet/transaction',
    'base-sepolia': 'https://sepolia.basescan.org/tx',
    'base': 'https://basescan.org/tx'
  };

  const baseUrl = explorers[network];
  if (!baseUrl) return null;

  return `${baseUrl}/${txHash}`;
}
