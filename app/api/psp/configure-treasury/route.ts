import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// POST - Configure PSP treasury and commission rate
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { commissionRate, treasuryConfig } = body;

    // Validate commission rate
    if (commissionRate !== undefined) {
      if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1) {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 1 (0% to 100%)' },
          { status: 400 }
        );
      }
    }

    // Validate treasury config
    if (treasuryConfig && typeof treasuryConfig !== 'object') {
      return NextResponse.json(
        { error: 'Treasury config must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Update provider profile
    const providerProfile = await prisma.provider_profiles.update({
      where: { user_provider_profile: user.id },
      data: {
        ...(commissionRate !== undefined && { commission_rate: commissionRate }),
        ...(treasuryConfig && { treasury_accounts: treasuryConfig }),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      providerProfile: {
        commission_rate: providerProfile.commission_rate,
        treasury_accounts: providerProfile.treasury_accounts
      },
      message: 'Treasury configuration saved successfully'
    });
  } catch (error) {
    console.error('Error configuring treasury:', error);
    
    // Handle case where provider profile doesn't exist
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Provider profile not found. Please complete Step 1 first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to save treasury configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get treasury configuration
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id },
      select: {
        commission_rate: true,
        treasury_accounts: true
      }
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      commissionRate: providerProfile.commission_rate,
      treasuryConfig: providerProfile.treasury_accounts
    });
  } catch (error) {
    console.error('Error fetching treasury config:', error);
    return NextResponse.json(
      { error: 'Failed to get treasury configuration' },
      { status: 500 }
    );
  }
}
