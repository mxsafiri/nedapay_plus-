import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    console.log('Verifying email with token:', token);

    // Find the verification token
    const tokenData = await prisma.verification_tokens.findFirst({
      where: {
        token,
        scope: 'email_verification'
      }
    });

    console.log('Token search result:', tokenData ? 'Found' : 'Not found');
    
    if (!tokenData) {
      // Debug: Check if any tokens exist for this scope
      const allTokens = await prisma.verification_tokens.findMany({
        where: { scope: 'email_verification' },
        select: { token: true, created_at: true, expiry_at: true }
      });
      console.log('All verification tokens in DB:', allTokens.length);
      console.log('Recent tokens:', allTokens.slice(-3));
      
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expiry_at) < new Date()) {
      console.log('Token expired:', tokenData.expiry_at);
      
      // Get user email for resend functionality
      const user = await prisma.users.findUnique({
        where: { id: tokenData.user_verification_token },
        select: { email: true }
      });

      return NextResponse.json(
        { 
          error: 'Verification link has expired',
          expired: true,
          email: user?.email
        },
        { status: 400 }
      );
    }

    // Update user's email verification status
    const updatedUser = await prisma.users.update({
      where: { id: tokenData.user_verification_token },
      data: {
        is_email_verified: true,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        first_name: true
      }
    });

    console.log('User email verified:', updatedUser.email);

    // Delete the used token
    await prisma.verification_tokens.delete({
      where: { id: tokenData.id }
    });

    console.log('Verification token deleted');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      user: {
        email: updatedUser.email,
        firstName: updatedUser.first_name
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying your email' },
      { status: 500 }
    );
  }
}
