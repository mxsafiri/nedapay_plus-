import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';

/**
 * GET /api/admin/settlements/status
 * Admin endpoint to monitor settlement system health
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can access
    if (user.scope?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get pending settlements
    const pendingSettlements = await prisma.payment_orders.findMany({
      where: {
        status: 'completed',
        settlement_status: 'pending'
      },
      select: {
        id: true,
        amount_paid: true,
        psp_commission: true,
        assigned_psp_id: true,
        updated_at: true,
        provider_profiles: {
          select: {
            trading_name: true
          }
        }
      },
      orderBy: { updated_at: 'asc' }
    });

    // Get failed settlements
    const failedSettlements = await prisma.payment_orders.findMany({
      where: {
        status: 'completed',
        settlement_status: 'failed'
      },
      select: {
        id: true,
        amount_paid: true,
        psp_commission: true,
        assigned_psp_id: true,
        updated_at: true,
        provider_profiles: {
          select: {
            trading_name: true
          }
        }
      },
      orderBy: { updated_at: 'desc' },
      take: 20
    });

    // Get today's settlements
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySettlements = await prisma.payment_orders.findMany({
      where: {
        settlement_status: 'completed',
        settled_at: { gte: startOfDay }
      },
      select: {
        id: true,
        amount_paid: true,
        psp_commission: true,
        settlement_tx_hash: true,
        settled_at: true,
        provider_profiles: {
          select: {
            trading_name: true
          }
        }
      }
    });

    // Calculate stats
    const pendingAmount = pendingSettlements.reduce(
      (sum, order) => sum + Number(order.amount_paid) + Number(order.psp_commission),
      0
    );

    const todayAmount = todaySettlements.reduce(
      (sum, order) => sum + Number(order.amount_paid) + Number(order.psp_commission),
      0
    );

    // Group by provider
    const pendingByProvider = pendingSettlements.reduce((acc, order) => {
      const providerId = order.assigned_psp_id || 'unassigned';
      const providerName = order.provider_profiles?.trading_name || 'Unknown';
      
      if (!acc[providerId]) {
        acc[providerId] = {
          providerId,
          providerName,
          orderCount: 0,
          totalAmount: 0,
          orders: []
        };
      }
      
      acc[providerId].orderCount++;
      acc[providerId].totalAmount += Number(order.amount_paid) + Number(order.psp_commission);
      acc[providerId].orders.push({
        orderId: order.id,
        amount: Number(order.amount_paid) + Number(order.psp_commission),
        updatedAt: order.updated_at
      });
      
      return acc;
    }, {} as Record<string, any>);

    // Get settlement success rate (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [completedCount, failedCount] = await Promise.all([
      prisma.payment_orders.count({
        where: {
          settlement_status: 'completed',
          settled_at: { gte: sevenDaysAgo }
        }
      }),
      prisma.payment_orders.count({
        where: {
          settlement_status: 'failed',
          updated_at: { gte: sevenDaysAgo }
        }
      })
    ]);

    const totalAttempts = completedCount + failedCount;
    const successRate = totalAttempts > 0 ? (completedCount / totalAttempts) * 100 : 100;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          pendingCount: pendingSettlements.length,
          pendingAmount: pendingAmount,
          failedCount: failedSettlements.length,
          todayCount: todaySettlements.length,
          todayAmount: todayAmount,
          successRate: successRate,
          needsAttention: failedSettlements.length > 0 || pendingSettlements.length > 10
        },
        pendingByProvider: Object.values(pendingByProvider),
        failedSettlements: failedSettlements.map(order => ({
          orderId: order.id,
          providerName: order.provider_profiles?.trading_name || 'Unknown',
          amount: Number(order.amount_paid) + Number(order.psp_commission),
          failedAt: order.updated_at
        })),
        recentSettlements: todaySettlements.slice(0, 10).map(order => ({
          orderId: order.id,
          providerName: order.provider_profiles?.trading_name || 'Unknown',
          amount: Number(order.amount_paid) + Number(order.psp_commission),
          txHash: order.settlement_tx_hash,
          settledAt: order.settled_at
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching settlement status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch settlement status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
