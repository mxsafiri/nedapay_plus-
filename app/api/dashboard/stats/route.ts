import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';

/**
 * GET /api/dashboard/stats
 * Fetch role-specific dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching dashboard stats...');
    const user = await getUserFromRequest(request);

    if (!user) {
      console.error('❌ Unauthorized - no user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id, 'Role:', user.scope);

    const userRole = user.scope.toLowerCase();

    if (userRole === 'provider' || userRole === 'psp') {
      // Provider stats
      const providerProfile = await prisma.provider_profiles.findUnique({
        where: { user_provider_profile: user.id },
        select: {
          id: true,
          total_commissions: true,
          monthly_commissions: true,
          fulfillment_count: true,
          commission_rate: true,
          pending_settlement_amount: true,
          total_settlements: true,
          last_settlement_date: true,
        }
      });

      // Count orders fulfilled this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersThisMonth = await prisma.payment_orders.count({
        where: {
          assigned_psp_id: providerProfile?.id || '',
          status: 'completed',
          updated_at: {
            gte: startOfMonth
          }
        }
      });

      // Calculate total liquidity (placeholder - would sum treasury accounts)
      const totalLiquidity = 0; // TODO: Calculate from treasury_accounts JSON

      return NextResponse.json({
        success: true,
        data: {
          role: 'provider',
          liquidity: totalLiquidity,
          earnings: providerProfile?.total_commissions || 0,
          monthlyEarnings: providerProfile?.monthly_commissions || 0,
          ordersFulfilled: providerProfile?.fulfillment_count || 0,
          ordersThisMonth: ordersThisMonth,
          commissionRate: providerProfile?.commission_rate || 0.003,
          // Settlement info
          pendingSettlement: providerProfile?.pending_settlement_amount || 0,
          totalSettled: providerProfile?.total_settlements || 0,
          lastSettlementDate: providerProfile?.last_settlement_date || null,
        }
      });

    } else if (userRole === 'sender' || userRole === 'bank') {
      // Sender stats
      const senderProfile = await prisma.sender_profiles.findUnique({
        where: { user_sender_profile: user.id },
        select: {
          id: true,
          total_earnings: true,
          monthly_earnings: true,
          markup_percentage: true,
        }
      });

      // Get payment orders statistics
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersStats = await prisma.payment_orders.aggregate({
        where: {
          sender_profile_payment_orders: senderProfile?.id || '',
          created_at: {
            gte: startOfMonth
          }
        },
        _count: true,
        _sum: {
          amount_in_usd: true,
        }
      });

      const activeOrders = await prisma.payment_orders.count({
        where: {
          sender_profile_payment_orders: senderProfile?.id || '',
          status: {
            in: ['pending', 'processing', 'initiated']
          }
        }
      });

      // Paycrest off-ramp stats
      const paycrestOrders = await prisma.payment_orders.count({
        where: {
          sender_profile_payment_orders: senderProfile?.id || '',
          paycrest_order_id: {
            not: null
          }
        }
      });

      const paycrestCompleted = await prisma.payment_orders.count({
        where: {
          sender_profile_payment_orders: senderProfile?.id || '',
          paycrest_order_id: {
            not: null
          },
          status: 'completed'
        }
      });

      const paycrestVolume = await prisma.payment_orders.aggregate({
        where: {
          sender_profile_payment_orders: senderProfile?.id || '',
          paycrest_order_id: {
            not: null
          }
        },
        _sum: {
          amount: true
        }
      });

      const successRate = paycrestOrders > 0 
        ? Math.round((paycrestCompleted / paycrestOrders) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          role: 'sender',
          totalSent: ordersStats._sum?.amount_in_usd || 0,
          monthlyVolume: ordersStats._sum?.amount_in_usd || 0,
          activeOrders: activeOrders,
          revenue: senderProfile?.total_earnings || 0,
          monthlyRevenue: senderProfile?.monthly_earnings || 0,
          markupRate: senderProfile?.markup_percentage || 0.002,
          ordersThisMonth: ordersStats._count || 0,
          // Paycrest off-ramp data
          paycrestOrders: paycrestOrders,
          totalVolume: paycrestVolume._sum.amount || 0,
          successRate: successRate,
        }
      });

    } else {
      // Admin or other roles - generic stats
      return NextResponse.json({
        success: true,
        data: {
          role: 'generic',
          message: 'Generic dashboard view'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
