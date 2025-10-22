import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/refresh
 * Fetch fresh user data from database (bypasses cache)
 * Used to get latest KYB status after admin changes
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch fresh user data from database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        scope: true,
        kyb_verification_status: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Fresh user data fetched:', {
      email: user.email,
      kybStatus: user.kyb_verification_status
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        scope: user.scope,
        kyb_verification_status: user.kyb_verification_status,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
