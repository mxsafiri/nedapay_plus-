import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    console.log('Password reset attempt with token:', token);

    // Find the password reset token
    const tokenData = await prisma.verification_tokens.findFirst({
      where: {
        token,
        scope: 'password_reset'
      }
    });

    console.log('Token search result:', tokenData ? 'Found' : 'Not found');
    
    if (!tokenData) {
      // Debug: Check if any password reset tokens exist
      const allResetTokens = await prisma.verification_tokens.findMany({
        where: { scope: 'password_reset' },
        select: { token: true, created_at: true, expiry_at: true }
      });
      console.log('All password reset tokens in DB:', allResetTokens.length);
      console.log('Recent tokens:', allResetTokens.slice(-3));
      console.log('Token being searched:', token);
      
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expiry_at) < new Date()) {
      console.log('Password reset token expired:', tokenData.expiry_at);
      return NextResponse.json(
        { 
          error: 'Reset link has expired. Please request a new one.',
          expired: true
        },
        { status: 400 }
      );
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    const updatedUser = await prisma.users.update({
      where: { id: tokenData.user_verification_token },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        first_name: true
      }
    });

    console.log('Password reset successful for user:', updatedUser.email);

    // Delete the used token
    await prisma.verification_tokens.delete({
      where: { id: tokenData.id }
    });

    // Delete all other password reset tokens for this user
    await prisma.verification_tokens.deleteMany({
      where: {
        user_verification_token: updatedUser.id,
        scope: 'password_reset'
      }
    });

    console.log('Password reset tokens deleted');

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
