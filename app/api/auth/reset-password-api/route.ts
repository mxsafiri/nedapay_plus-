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

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    console.log('Password reset attempt with token:', token);

    const tokenData = await prisma.verification_tokens.findFirst({
      where: {
        token,
        scope: 'password_reset'
      }
    });

    if (!tokenData) {
      console.log('Password reset token not found');
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    if (new Date(tokenData.expiry_at) < new Date()) {
      console.log('Password reset token expired:', tokenData.expiry_at);
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.', expired: true },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.users.update({
      where: { id: tokenData.user_verification_token },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true
      }
    });

    console.log('Password reset successful for user:', updatedUser.email);

    await prisma.verification_tokens.deleteMany({
      where: {
        user_verification_token: updatedUser.id,
        scope: 'password_reset'
      }
    });

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
