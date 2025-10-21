import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Password reset request for:', email);

    // Find user by email
    const user = await prisma.users.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        is_email_verified: true
      }
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Delete old password reset tokens for this user
    await prisma.verification_tokens.deleteMany({
      where: {
        user_verification_token: user.id,
        scope: 'password_reset'
      }
    });

    // Create password reset token
    const token = crypto.randomUUID();
    const expiryAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log('Creating password reset token:', { token, userId: user.id, expiryAt });

    const createdToken = await prisma.verification_tokens.create({
      data: {
        id: crypto.randomUUID(),
        user_verification_token: user.id,
        token,
        scope: 'password_reset',
        expiry_at: expiryAt,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('Password reset token created successfully:', createdToken.id);

    // Send password reset email
    const resetLink = `${request.nextUrl.origin}/auth/reset-password?token=${token}`;
    
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetLink,
      user.first_name
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    console.log('Password reset email sent to:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent! Please check your email.',
      // Include link in development
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
