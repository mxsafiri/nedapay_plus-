/**
 * Cost Savings Analytics API
 * GET /api/analytics/savings?period=30d
 * Returns cost savings data for specified period
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCostSavingsAnalytics } from '@/lib/analytics/cost-savings';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    const analytics = getCostSavingsAnalytics();

    let startDate: Date;
    const endDate = new Date();

    // Parse period (30d, 7d, 90d, etc.)
    const match = period.match(/^(\d+)([dmyDMY])$/);
    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period format',
          message: 'Period must be in format like "30d", "7d", "90d"',
        },
        { status: 400 }
      );
    }

    const [, amount, unit] = match;
    const value = parseInt(amount);

    switch (unit.toLowerCase()) {
      case 'd':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - value);
        break;
      case 'm':
        startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - value);
        break;
      case 'y':
        startDate = new Date(endDate);
        startDate.setFullYear(startDate.getFullYear() - value);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid period unit' },
          { status: 400 }
        );
    }

    // Calculate savings
    const savings = await analytics.calculateSavings(startDate, endDate);
    const networkStats = await analytics.getNetworkStats(startDate, endDate);
    const projection = await analytics.projectAnnualSavings();

    return NextResponse.json({
      success: true,
      data: {
        savings,
        networkStats,
        projection,
      },
    });
  } catch (error: any) {
    console.error('Error calculating savings:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate savings',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
