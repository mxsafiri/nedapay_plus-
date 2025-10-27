import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import crypto from 'crypto';

/**
 * Generate a secure API key
 * Format: np_live_xxxxxxxxxxxxxxxxxxxx or np_test_xxxxxxxxxxxxxxxxxxxx
 */
function generateApiKey(isTest: boolean = false): string {
  const prefix = isTest ? 'np_test_' : 'np_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return prefix + randomBytes;
}

/**
 * Hash API key for secure storage
 */
function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

// POST - Generate API key for user
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { isTest = false, regenerate = false } = body;

    // Check if user has a profile (bank or PSP)
    console.log('Looking up user:', user.id);
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        sender_profiles: true,
        provider_profiles: true
      }
    });

    if (!userData) {
      console.error('User not found in database:', user.id);
      return NextResponse.json({ 
        error: 'User not found',
        details: 'Your user account does not exist in the database'
      }, { status: 404 });
    }

    console.log('User found:', {
      id: userData.id,
      email: userData.email,
      hasSenderProfile: !!userData.sender_profiles,
      hasProviderProfile: !!userData.provider_profiles
    });

    const hasSenderProfile = !!userData.sender_profiles;
    const hasProviderProfile = !!userData.provider_profiles;

    if (!hasSenderProfile && !hasProviderProfile) {
      console.warn('User has no profiles:', user.id);
      return NextResponse.json(
        { 
          error: 'Please complete your profile setup first',
          details: 'You need to complete either sender (bank) or provider (PSP) onboarding before creating API keys',
          actions: {
            senderOnboarding: '/onboarding/sender',
            providerOnboarding: '/onboarding/psp'
          }
        },
        { status: 400 }
      );
    }

    // Check for existing API key
    const profileId = hasSenderProfile 
      ? userData.sender_profiles!.id 
      : userData.provider_profiles!.id;

    const existingKey = await prisma.api_keys.findFirst({
      where: {
        OR: [
          { sender_profile_api_key: profileId },
          { provider_profile_api_key: profileId }
        ]
      }
    });

    console.log('Existing key check:', {
      profileId,
      hasExistingKey: !!existingKey,
      existingKeyId: existingKey?.id,
      regenerate
    });

    // If key exists and not regenerating, return error
    if (existingKey && !regenerate) {
      return NextResponse.json(
        { 
          error: 'API key already exists. Set regenerate=true to create a new one.',
          hasExistingKey: true,
          existingKeyId: existingKey.id
        },
        { status: 409 }
      );
    }

    // Delete existing key if regenerating
    if (existingKey && regenerate) {
      console.log('Attempting to delete existing key:', {
        keyId: existingKey.id,
        profileId,
        hasSenderProfile,
        hasProviderProfile
      });
      
      try {
        // Delete using deleteMany with profile ID to handle edge cases
        const deleteResult = hasSenderProfile
          ? await prisma.api_keys.deleteMany({
              where: { sender_profile_api_key: profileId }
            })
          : await prisma.api_keys.deleteMany({
              where: { provider_profile_api_key: profileId }
            });
        
        console.log('✅ Delete query executed, deleted count:', deleteResult.count);
        
        if (deleteResult.count === 0) {
          console.warn('⚠️ No keys were deleted - key might not exist');
        }
        
        // Wait for database to commit
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify deletion by checking the profile relationship
        const checkStillExists = await prisma.api_keys.findFirst({
          where: hasSenderProfile
            ? { sender_profile_api_key: profileId }
            : { provider_profile_api_key: profileId }
        });
        
        if (checkStillExists) {
          console.error('❌ Key still exists after deletion!', {
            keyId: checkStillExists.id,
            profileId,
            deleteCount: deleteResult.count
          });
          return NextResponse.json(
            { 
              error: 'Failed to delete existing key',
              details: 'Key still exists in database after deletion attempt. Please try again or contact support.',
              keyId: checkStillExists.id,
              deleteCount: deleteResult.count
            },
            { status: 500 }
          );
        }
        
        console.log('✅ Deletion verified - no keys exist for profile');
      } catch (deleteError) {
        console.error('Error deleting existing key:', deleteError);
        return NextResponse.json(
          { 
            error: 'Failed to delete existing key',
            details: deleteError instanceof Error ? deleteError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Generate new API key
    const apiKey = generateApiKey(isTest);
    const hashedKey = hashApiKey(apiKey);

    console.log('Creating API key:', {
      isTest,
      profileId,
      hasSenderProfile,
      hasProviderProfile,
      keyPrefix: apiKey.substring(0, 8)
    });

    // Create API key record
    // Use upsert as fallback if deletion didn't work
    let apiKeyRecord;
    try {
      apiKeyRecord = await prisma.api_keys.create({
        data: {
          id: crypto.randomUUID(),
          secret: hashedKey,
          is_test: isTest,
          ...(hasSenderProfile && { sender_profile_api_key: profileId }),
          ...(hasProviderProfile && { provider_profile_api_key: profileId })
        }
      });
      console.log('✅ API key created successfully:', apiKeyRecord.id);
    } catch (createError: any) {
      // If create fails due to unique constraint, try updating the existing key
      if (createError?.code === 'P2002') {
        console.warn('⚠️ Unique constraint violation - attempting upsert');
        
        // Find and update the existing key
        const existingToUpdate = await prisma.api_keys.findFirst({
          where: hasSenderProfile
            ? { sender_profile_api_key: profileId }
            : { provider_profile_api_key: profileId }
        });
        
        if (existingToUpdate) {
          apiKeyRecord = await prisma.api_keys.update({
            where: { id: existingToUpdate.id },
            data: {
              secret: hashedKey,
              is_test: isTest
            }
          });
          console.log('✅ API key updated (upsert):', apiKeyRecord.id);
        } else {
          throw createError;
        }
      } else {
        throw createError;
      }
    }

    // Mark profile as having API key
    if (hasSenderProfile) {
      await prisma.sender_profiles.update({
        where: { id: profileId },
        data: { updated_at: new Date() }
      });
    } else {
      await prisma.provider_profiles.update({
        where: { id: profileId },
        data: { updated_at: new Date() }
      });
    }

    return NextResponse.json({
      success: true,
      apiKey, // Return plain key only once - user must save it
      keyId: apiKeyRecord.id,
      type: isTest ? 'test' : 'live',
      message: 'API key generated successfully. Please save it securely - you won\'t be able to see it again.',
      warning: 'Store this key securely. It grants access to your account.',
      regenerated: regenerate
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to generate API key',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
      },
      { status: 500 }
    );
  }
}

// GET - Check if user has API key (doesn't return the key)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET API keys for user:', user.id);

    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        sender_profiles: {
          include: { api_keys: true }
        },
        provider_profiles: {
          include: { api_keys: true }
        }
      }
    });

    if (!userData) {
      console.error('User not found:', user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKey = userData.sender_profiles?.api_keys || userData.provider_profiles?.api_keys;
    
    console.log('Found API key:', {
      hasKey: !!apiKey,
      keyId: apiKey?.id,
      isTest: apiKey?.is_test,
      hasSenderProfile: !!userData.sender_profiles,
      hasProviderProfile: !!userData.provider_profiles
    });

    return NextResponse.json({
      hasApiKey: !!apiKey,
      keyInfo: apiKey ? {
        id: apiKey.id,
        created_at: new Date().toISOString(), // Placeholder
        is_test: apiKey.is_test,
        key_name: apiKey.is_test ? 'Test Key' : 'Live Key', // We don't store key_name yet
        secret: '***' // Never return the actual key
      } : null
    });
  } catch (error) {
    console.error('Error checking API key status:', error);
    return NextResponse.json(
      { error: 'Failed to check API key status' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        sender_profiles: { include: { api_keys: true } },
        provider_profiles: { include: { api_keys: true } }
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKey = userData.sender_profiles?.api_keys || userData.provider_profiles?.api_keys;

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Delete the API key
    await prisma.api_keys.delete({
      where: { id: apiKey.id }
    });

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
