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
    const { isTest = false, regenerate = false, keyName } = body;

    // Check if user has a profile (bank or PSP)
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      include: {
        sender_profiles: true,
        provider_profiles: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasSenderProfile = !!userData.sender_profiles;
    const hasProviderProfile = !!userData.provider_profiles;

    if (!hasSenderProfile && !hasProviderProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile setup first' },
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

    // If key exists and not regenerating, return error
    if (existingKey && !regenerate) {
      return NextResponse.json(
        { 
          error: 'API key already exists. Set regenerate=true to create a new one.',
          hasExistingKey: true
        },
        { status: 409 }
      );
    }

    // Delete existing key if regenerating
    if (existingKey && regenerate) {
      await prisma.api_keys.delete({
        where: { id: existingKey.id }
      });
    }

    // Generate new API key
    const apiKey = generateApiKey(isTest);
    const hashedKey = hashApiKey(apiKey);

    // Create API key record
    const apiKeyRecord = await prisma.api_keys.create({
      data: {
        id: crypto.randomUUID(),
        secret: hashedKey,
        is_test: isTest,
        ...(hasSenderProfile && { sender_profile_api_key: profileId }),
        ...(hasProviderProfile && { provider_profile_api_key: profileId })
      }
    });

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
    return NextResponse.json(
      { 
        error: 'Failed to generate API key',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKey = userData.sender_profiles?.api_keys || userData.provider_profiles?.api_keys;

    return NextResponse.json({
      hasApiKey: !!apiKey,
      keyInfo: apiKey ? {
        id: apiKey.id,
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
