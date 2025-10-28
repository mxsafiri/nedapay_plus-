import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';

/**
 * POST /api/provider-profile/fiat-methods
 * Save provider's fiat fulfillment methods configuration
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fiatMethods } = body;

    // Get provider profile
    const profile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Provider profile not found. Please complete Step 1 first.' },
        { status: 404 }
      );
    }

    // Clean up the data - only save enabled methods with sensitive data encrypted
    const cleanedMethods: any = {};

    if (fiatMethods.mpesa?.enabled) {
      cleanedMethods.mpesa = {
        enabled: true,
        provider: fiatMethods.mpesa.provider,
        businessNumber: fiatMethods.mpesa.businessNumber,
        businessName: fiatMethods.mpesa.businessName,
        dailyLimit: parseFloat(fiatMethods.mpesa.dailyLimit) || 50000
      };
    }

    if (fiatMethods.thunes?.enabled) {
      cleanedMethods.thunes = {
        enabled: true,
        accountId: fiatMethods.thunes.accountId,
        // In production, encrypt the API key
        apiKey: fiatMethods.thunes.apiKey, // TODO: Encrypt this
        environment: fiatMethods.thunes.environment,
        verified: fiatMethods.thunes.connectionStatus === 'success'
      };
    }

    if (fiatMethods.bank?.enabled) {
      cleanedMethods.bank = {
        enabled: true,
        bankName: fiatMethods.bank.bankName,
        accountNumber: fiatMethods.bank.accountNumber,
        accountName: fiatMethods.bank.accountName,
        swiftCode: fiatMethods.bank.swiftCode || null
      };
    }

    if (fiatMethods.other?.enabled) {
      cleanedMethods.other = {
        enabled: true,
        methodName: fiatMethods.other.methodName,
        description: fiatMethods.other.description
      };
    }

    // Update provider profile with fiat infrastructure
    await prisma.provider_profiles.update({
      where: { id: profile.id },
      data: {
        fiat_infrastructure: cleanedMethods,
        updated_at: new Date()
      }
    });

    console.log(`✅ Fiat methods saved for provider ${profile.id}`);

    return NextResponse.json({
      success: true,
      message: 'Fiat fulfillment methods saved successfully',
      data: {
        methodsConfigured: Object.keys(cleanedMethods).length
      }
    });

  } catch (error) {
    console.error('Error saving fiat methods:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save fiat methods',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/provider-profile/fiat-methods
 * Get provider's current fiat methods configuration
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: user.id },
      select: {
        fiat_infrastructure: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile.fiat_infrastructure || {}
    });

  } catch (error) {
    console.error('Error fetching fiat methods:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch fiat methods',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
