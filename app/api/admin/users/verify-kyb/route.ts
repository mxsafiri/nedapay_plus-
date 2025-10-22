import { NextRequest, NextResponse } from 'next/server';
import { updateUserVerificationStatus } from '@/lib/database/admin-operations';

export async function POST(request: NextRequest) {
  try {
    const { userId, status, reason } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['not_started', 'pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // For now, use a placeholder admin ID
    // In production, get this from session/auth
    const adminId = 'admin';

    await updateUserVerificationStatus(userId, status, adminId, reason);

    return NextResponse.json({
      success: true,
      message: `KYB status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating KYB status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update KYB status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
