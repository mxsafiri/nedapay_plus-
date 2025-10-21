import { NextRequest, NextResponse } from 'next/server';

/**
 * Logout endpoint - clears user session
 */
export async function POST(_request: NextRequest) {
  try {
    // Clear any server-side session data if needed
    // For now, we're using localStorage on client side
    
    return NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
