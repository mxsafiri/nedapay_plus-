import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server';
import { settleProviderOrder, settlePendingOrders } from '@/lib/settlements/settlement-service';

/**
 * POST /api/admin/settlements/retry
 * Retry failed or pending settlements
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can retry settlements
    if (user.scope?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, retryAll } = body;

    if (retryAll) {
      // Retry all pending/failed settlements
      console.log('🔄 Admin triggered batch settlement retry...');
      const results = await settlePendingOrders();
      
      return NextResponse.json({
        success: true,
        message: 'Batch settlement completed',
        results: {
          total: results.total,
          succeeded: results.succeeded,
          failed: results.failed,
          errors: results.errors
        }
      });
    } else if (orderId) {
      // Retry single order
      console.log(`🔄 Admin retrying settlement for order ${orderId}...`);
      const result = await settleProviderOrder(orderId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Settlement completed successfully',
          data: {
            transactionId: result.transactionId,
            networkUsed: result.networkUsed,
            amount: result.amount
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: 'Either orderId or retryAll must be provided' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error retrying settlement:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retry settlement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
