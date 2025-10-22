import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// GET - Get provider profile for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    return NextResponse.json({ providerProfile });
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return NextResponse.json(
      { error: 'Failed to get provider profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update provider profile (supports onboarding)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pspName,
      tradingName,
      contactEmail,
      contactPhone,
      address,
      mobileNumber,
      businessName,
      provisionMode,
      visibilityMode,
      isActive
    } = body;

    // Check if profile exists
    const existingProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id }
    });

    let providerProfile;

    if (existingProfile) {
      // Update existing profile
      providerProfile = await prisma.provider_profiles.update({
        where: { user_provider_profile: user.id },
        data: {
          trading_name: tradingName || existingProfile.trading_name,
          business_name: businessName || pspName || existingProfile.business_name,
          mobile_number: contactPhone || mobileNumber || existingProfile.mobile_number,
          address: address || existingProfile.address,
          provision_mode: provisionMode || existingProfile.provision_mode,
          visibility_mode: visibilityMode || existingProfile.visibility_mode,
          is_active: isActive ?? existingProfile.is_active,
          updated_at: new Date()
        }
      });
    } else {
      // Create new profile (onboarding)
      const profileId = crypto.randomUUID();
      
      providerProfile = await prisma.provider_profiles.create({
        data: {
          id: profileId,
          user_provider_profile: user.id,
          trading_name: tradingName || null,
          business_name: businessName || pspName,
          mobile_number: contactPhone || mobileNumber || null,
          address: address || null,
          provision_mode: provisionMode || 'auto',
          visibility_mode: visibilityMode || 'public',
          is_active: isActive ?? true,
          is_available: true,
          is_kyb_verified: false,
          // B2B2C fields with defaults
          commission_rate: 0.003, // 0.3% default
          monthly_commissions: 0,
          total_commissions: 0,
          fulfillment_count: 0,
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      providerProfile,
      message: existingProfile ? 'Profile updated' : 'Profile created'
    });
  } catch (error) {
    console.error('Error creating/updating provider profile:', error);
    return NextResponse.json(
      { error: 'Failed to process provider profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific fields (for onboarding steps)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      supportedCountries,
      commissionRate,
      treasuryAccounts
    } = body;

    const providerProfile = await prisma.provider_profiles.update({
      where: { user_provider_profile: user.id },
      data: {
        ...(supportedCountries !== undefined && { supported_countries: supportedCountries }),
        ...(commissionRate !== undefined && { commission_rate: commissionRate }),
        ...(treasuryAccounts !== undefined && { treasury_accounts: treasuryAccounts }),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      providerProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    return NextResponse.json(
      { error: 'Failed to update provider profile' },
      { status: 500 }
    );
  }
}
