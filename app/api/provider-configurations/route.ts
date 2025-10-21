import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch provider configurations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get provider profile for the user
    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: userId },
      include: {
        provider_currencies: {
          include: {
            fiat_currencies: true
          }
        },
        provider_order_tokens: {
          include: {
            tokens: true,
            fiat_currencies: true
          }
        }
      }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const configurations = {
      goLive: providerProfile.is_active,
      visibility: providerProfile.visibility_mode,
      hostIdentifier: providerProfile.host_identifier || '',
      provisionMode: providerProfile.provision_mode,
      isKybVerified: providerProfile.is_kyb_verified,
      currencies: providerProfile.provider_currencies.map(pc => ({
        id: pc.fiat_currency_provider_currencies,
        code: pc.fiat_currencies.code,
        name: pc.fiat_currencies.name,
        symbol: pc.fiat_currencies.symbol,
        availableBalance: parseFloat(pc.available_balance.toString()),
        totalBalance: parseFloat(pc.total_balance.toString()),
        reservedBalance: parseFloat(pc.reserved_balance.toString()),
        isAvailable: pc.is_available
      })),
      orderTokens: providerProfile.provider_order_tokens.map(pot => ({
        id: pot.id,
        tokenId: pot.token_provider_order_tokens,
        currencyId: pot.fiat_currency_provider_order_tokens,
        network: pot.network,
        fixedConversionRate: parseFloat(pot.fixed_conversion_rate.toString()),
        floatingConversionRate: parseFloat(pot.floating_conversion_rate.toString()),
        conversionRateType: pot.conversion_rate_type,
        maxOrderAmount: parseFloat(pot.max_order_amount.toString()),
        minOrderAmount: parseFloat(pot.min_order_amount.toString()),
        rateSlippage: parseFloat(pot.rate_slippage.toString()),
        address: pot.address
      }))
    };

    return NextResponse.json(configurations);
  } catch (error) {
    console.error('Error fetching provider configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider configurations' },
      { status: 500 }
    );
  }
}

// PUT - Update provider configurations for a user
export async function PUT(request: NextRequest) {
  try {
    const { 
      userId, 
      goLive, 
      visibility, 
      hostIdentifier,
      provisionMode
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (goLive && !hostIdentifier) {
      return NextResponse.json(
        { error: 'Host identifier is required when going live' },
        { status: 400 }
      );
    }

    // Get provider profile for the user
    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_provider_profile: userId }
    });

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    // Update provider profile
    const updatedProfile = await prisma.provider_profiles.update({
      where: { id: providerProfile.id },
      data: {
        is_active: goLive,
        visibility_mode: visibility,
        host_identifier: hostIdentifier,
        provision_mode: provisionMode || 'auto',
        updated_at: new Date()
      }
    });

    // TODO: Update provider order tokens and wallet addresses
    // This would involve more complex logic to handle the currency configurations
    // and wallet addresses for different networks

    return NextResponse.json({
      success: true,
      goLive: updatedProfile.is_active,
      visibility: updatedProfile.visibility_mode,
      hostIdentifier: updatedProfile.host_identifier,
      provisionMode: updatedProfile.provision_mode
    });
  } catch (error) {
    console.error('Error updating provider configurations:', error);
    return NextResponse.json(
      { error: 'Failed to update provider configurations' },
      { status: 500 }
    );
  }
}
