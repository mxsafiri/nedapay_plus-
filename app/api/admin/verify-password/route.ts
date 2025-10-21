import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const ADMIN_PASSWORD = process.env.ADMIN_ACCESS_PASSWORD;
const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    // Verify admin password
    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_ACCESS_PASSWORD not configured in environment variables');
      return NextResponse.json(
        { success: false, error: 'Admin access not configured' },
        { status: 500 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      // Create admin session cookie
      const cookieStore = await cookies();
      const sessionData = {
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
      };

      cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000, // Convert to seconds
        path: '/protected/admin',
      });

      return NextResponse.json({ success: true });
    } else {
      // Log failed attempt
      console.warn(`Failed admin login attempt for user: ${user.email}`);
      
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin password verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
