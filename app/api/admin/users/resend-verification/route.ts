import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        is_email_verified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.is_email_verified) {
      return NextResponse.json(
        { error: 'User email is already verified' },
        { status: 400 }
      );
    }

    // Delete old verification tokens for this user
    await prisma.verification_tokens.deleteMany({
      where: {
        user_verification_token: userId,
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
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
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
