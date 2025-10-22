import { NextRequest, NextResponse } from 'next/server';
import { updateUserVerificationStatus } from '@/lib/database/admin-operations';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received KYB verification request');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { userId, status, reason } = body;

    if (!userId || !status) {
      console.error('❌ Missing required fields:', { userId: !!userId, status: !!status });
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['not_started', 'pending', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // For now, use a placeholder admin ID
    // In production, get this from session/auth
    const adminId = 'admin';

    console.log('✅ Calling updateUserVerificationStatus...');
    await updateUserVerificationStatus(userId, status, adminId, reason);

    console.log('✅ KYB status update complete');
    return NextResponse.json({
      success: true,
      message: `KYB status updated to ${status}`
    });
  } catch (error) {
    console.error('❌ Error in verify-kyb route:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to update KYB status',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
