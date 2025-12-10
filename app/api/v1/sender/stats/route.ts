import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * GET /api/v1/sender/stats
 * Get sender dashboard statistics
 */
export async function GET(_request: NextRequest) {
  try {
    // Get user from session (you'll need to add auth here)
    // For now, get stats for all orders
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Fetch aggregated stats
    const [
      totalOrders,
      last30DaysOrders,
      completedOrders,
      totalVolume,
      last30DaysVolume
    ] = await Promise.all([
      // Total orders count
      prisma.payment_orders.count(),
      
      // Last 30 days orders
      prisma.payment_orders.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Completed orders
      prisma.payment_orders.count({
        where: {
          status: 'completed'
        }
      }),
      
      // Total volume (sum of amounts)
      prisma.payment_orders.aggregate({
        _sum: {
          amount: true
        }
      }),
      
      // Last 30 days volume
      prisma.payment_orders.aggregate({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);
    
    // Count Paycrest off-ramp orders (orders with paycrest_order_id)
    const paycrestOrders = await prisma.payment_orders.count({
      where: {
        paycrest_order_id: {
          not: null
        }
      }
    });
    
    // Calculate success rate
    const successRate = totalOrders > 0 
      ? Math.round((completedOrders / totalOrders) * 100) 
      : 0;
    
    // Calculate volume in USD (approximate - using amount field)
    const totalVolumeUSD = totalVolume._sum.amount || 0;
    const last30DaysVolumeUSD = last30DaysVolume._sum.amount || 0;
    
    // Calculate change percentages
    const previousPeriodStart = new Date(thirtyDaysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    
    const previousPeriodOrders = await prisma.payment_orders.count({
      where: {
        created_at: {
          gte: previousPeriodStart,
          lt: thirtyDaysAgo
        }
      }
    });
    
    const ordersChange = previousPeriodOrders > 0
      ? Math.round(((last30DaysOrders - previousPeriodOrders) / previousPeriodOrders) * 100)
      : last30DaysOrders > 0 ? 100 : 0;
    
    // Active payment methods (Hedera, Base, etc.)
    const networkCounts = await prisma.payment_orders.groupBy({
      by: ['network_used'],
      _count: true,
      where: {
        network_used: {
          not: null
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalVolume: {
          value: totalVolumeUSD,
          formatted: `$${totalVolumeUSD.toFixed(2)}`,
          change: '+0%',
          changeType: 'positive'
        },
        transactions: {
          value: totalOrders,
          formatted: totalOrders.toString(),
          last30Days: last30DaysOrders,
          change: ordersChange >= 0 ? `+${ordersChange}%` : `${ordersChange}%`,
          changeType: ordersChange >= 0 ? 'positive' : 'negative'
        },
        activeRoutes: {
          value: networkCounts.length,
          formatted: networkCounts.length.toString(),
          networks: networkCounts.map((n: any) => ({ network: n.network_used, count: n._count })),
          paycrestOrders: paycrestOrders,
          change: networkCounts.length > 0 ? `+${networkCounts.length}` : '0',
          changeType: 'positive'
        },
        successRate: {
          value: successRate,
          formatted: `${successRate}%`,
          completed: completedOrders,
          total: totalOrders,
          change: '+0%',
          changeType: 'positive'
        },
        recentActivity: {
          last30Days: last30DaysOrders,
          volume30Days: last30DaysVolumeUSD
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching sender stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
