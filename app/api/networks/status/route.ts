/**
 * Network Status API
 * GET /api/networks/status
 * Returns status of all configured blockchain networks
 */

import { NextResponse } from 'next/server';
import { getNetworkStatus } from '@/lib/blockchain';

export async function GET() {
  try {
    const networks = await getNetworkStatus();

    return NextResponse.json({
      success: true,
      data: {
        networks,
        count: networks.length,
        primary: networks.find(n => n.priority === 1),
      },
    });
  } catch (error: any) {
    console.error('Error getting network status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get network status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
