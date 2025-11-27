import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const isVerified = searchParams.get('is_verified');
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { trading_name: { contains: search, mode: 'insensitive' } },
        { host_identifier: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== null && isActive !== 'all') {
      where.is_active = isActive === 'true';
    }
    
    if (isVerified !== null && isVerified !== 'all') {
      where.is_kyb_verified = isVerified === 'true';
    }

    // Fetch providers with related data
    const providers = await prisma.provider_profiles.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            kyb_verification_status: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 100
    });

    // Convert BigInt values to numbers for JSON serialization
    const serializedProviders = providers.map(provider => ({
      ...provider,
      fulfillment_count: provider.fulfillment_count ? Number(provider.fulfillment_count) : 0
    }));

    return NextResponse.json({
      success: true,
      providers: serializedProviders,
      count: serializedProviders.length
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch providers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
