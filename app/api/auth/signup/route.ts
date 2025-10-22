import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function POST(request: NextRequest) {
  console.log('=== Sign-up API Route Called ===');
  
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
      console.log('Body keys:', Object.keys(body));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, businessTypes } = body;
    console.log('Extracted fields:', { 
      firstName: firstName ? '✓' : '✗', 
      lastName: lastName ? '✓' : '✗', 
      email: email ? '✓' : '✗',
      password: password ? '✓' : '✗',
      businessTypes: businessTypes 
    });

    // Validation
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!businessTypes || !Array.isArray(businessTypes) || businessTypes.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one business type' },
        { status: 400 }
      );
    }

    // Determine scope and role (single selection now)
    const businessType = businessTypes[0]; // Get first (and only) selection
    const scope = businessType; // 'sender' or 'provider'
    
    // Map business type to user role (B2B2C)
    // sender → BANK, provider → PSP
    const role: 'BANK' | 'PSP' = businessType === 'provider' ? 'PSP' : 'BANK';
    
    console.log('Determined scope:', scope);
    console.log('Determined role:', role);

    // Hash password with error handling
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      return NextResponse.json(
        { error: 'Failed to process password' },
        { status: 500 }
      );
    }

    // Check if user already exists using Prisma
    console.log('Checking if user exists with email:', email.toLowerCase().trim());
    
    try {
      const existingUser = await prisma.users.findUnique({
        where: { 
          email: email.toLowerCase().trim()
        },
        select: { id: true }
      });
      
      console.log('Existing user check result:', { existingUser: !!existingUser });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    } catch (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { 
          error: 'Database error while checking email',
          details: process.env.NODE_ENV === 'development' ? String(checkError) : undefined
        },
        { status: 500 }
      );
    }

    // Create user using Prisma
    console.log('Creating new user...');
    const userId = crypto.randomUUID();
    console.log('Generated user ID:', userId);
    
    let newUser;
    try {
      newUser = await prisma.users.create({
        data: {
          id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          scope: scope,
          role: role, // B2B2C role mapping
          is_email_verified: false,
          has_early_access: true,
          kyb_verification_status: 'not_started',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log('User creation result:', { success: true, userId: newUser.id });
    } catch (createError: any) {
      console.error('Error creating user:', createError);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create user account';
      if (createError.code === 'P2002') {
        errorMessage = 'An account with this email already exists';
      } else if (createError.message) {
        errorMessage = `Database error: ${createError.message}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Create verification token
    const token = crypto.randomUUID();
    const expiryAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('Creating verification token:', { token, userId: newUser.id, expiryAt });

    try {
      const createdToken = await prisma.verification_tokens.create({
        data: {
          id: crypto.randomUUID(),
          user_verification_token: newUser.id,
          token,
          scope: 'email_verification',
          expiry_at: expiryAt,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('Verification token created successfully:', createdToken.id);
    } catch (tokenError) {
      console.error('Error creating verification token:', tokenError);
      console.error('Token creation failed for user:', newUser.id);
      // Don't fail the signup, just log the error
      // User can request a new verification email later
    }

    // Send verification email
    const verificationLink = `${request.nextUrl.origin}/auth/verify-email?token=${token}`;
    
    console.log('Sending verification email to:', newUser.email);
    console.log('Verification link:', verificationLink);
    const emailResult = await sendVerificationEmail(
      newUser.email,
      verificationLink,
      newUser.first_name
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail the signup - user was created successfully
      // They can request a new verification email later
    } else {
      console.log('Verification email sent successfully');
    }
    
    console.log('Sign-up successful for user:', newUser.email);

    const response = {
      success: true,
      userId: newUser.id,
      email: newUser.email,
      message: 'Account created successfully. Please check your email to verify your account.',
      // Include verification link in development for testing
      ...(process.env.NODE_ENV === 'development' && { verificationLink })
    };
    
    console.log('Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== UNEXPECTED SIGN-UP ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    // Provide more helpful error message
    let errorMessage = 'An unexpected error occurred while creating your account';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    const errorResponse = { 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    };
    
    console.log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
