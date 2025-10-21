import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findFirst({
      where: { 
        email: {
          equals: email,
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

    // Don't reveal if user exists or not (security)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    // Check if already verified
    if (user.is_email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can log in now.'
      });
    }

    // Delete old verification tokens for this user
    await prisma.verification_tokens.deleteMany({
      where: {
        user_verification_token: user.id,
        scope: 'email_verification'
      }
    });

    // Create new verification token
    const token = crypto.randomUUID();
    const expiryAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verification_tokens.create({
      data: {
        id: crypto.randomUUID(),
        user_verification_token: user.id,
        token,
        scope: 'email_verification',
        expiry_at: expiryAt,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Send verification email
    const verificationLink = `${request.nextUrl.origin}/auth/verify-email?token=${token}`;
    
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationLink,
      user.first_name
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Verification email resent to:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
      // Include link in development
      ...(process.env.NODE_ENV === 'development' && { verificationLink })
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
