import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET - Get or create sender profile for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if sender profile already exists
    let senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    // If no sender profile exists, create one
    if (!senderProfile) {
      senderProfile = await prisma.sender_profiles.create({
        data: {
          id: crypto.randomUUID(),
          user_sender_profile: userId,
          webhook_url: null,
          domain_whitelist: [],
          is_active: true,
          is_partner: false,
          provider_id: null,
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({ senderProfile });
  } catch (error) {
    console.error('Error fetching/creating sender profile:', error);
    return NextResponse.json(
      { error: 'Failed to get sender profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update sender profile (supports onboarding)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      webhookUrl, 
      domainWhitelist, 
      isActive, 
      isPartner, 
      providerId,
      // Onboarding fields
      bankName,
      country,
      contactName,
      contactEmail,
      contactPhone
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    let senderProfile;

    if (existingProfile) {
      // Update existing profile
      senderProfile = await prisma.sender_profiles.update({
        where: { user_sender_profile: userId },
        data: {
          webhook_url: webhookUrl,
          domain_whitelist: domainWhitelist || [],
          is_active: isActive ?? true,
          is_partner: isPartner ?? false,
          provider_id: providerId,
          updated_at: new Date()
        }
      });
    } else {
      // Create new profile (onboarding)
      senderProfile = await prisma.sender_profiles.create({
        data: {
          id: crypto.randomUUID(),
          user_sender_profile: userId,
          webhook_url: webhookUrl || null,
          domain_whitelist: domainWhitelist || [],
          is_active: isActive ?? true,
          is_partner: isPartner ?? false,
          provider_id: providerId || null,
          updated_at: new Date()
        }
      });

      // If onboarding data provided, update user info
      if (bankName || country) {
        await prisma.users.update({
          where: { id: userId },
          data: {
            updated_at: new Date()
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      senderProfile,
      message: existingProfile ? 'Profile updated' : 'Profile created'
    });
  } catch (error) {
    console.error('Error creating/updating sender profile:', error);
    return NextResponse.json(
      { error: 'Failed to process sender profile' },
      { status: 500 }
    );
  }
}
