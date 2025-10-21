import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check against environment variable
    const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_ACCESS_PASSWORD not set in environment variables');
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      // Log failed attempt
      console.warn('Failed admin login attempt at:', new Date().toISOString());
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });

    console.log('Successful admin login at:', new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
