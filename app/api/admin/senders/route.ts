import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const isPartner = searchParams.get('is_partner');
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      // Search by user email or name
      where.users = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    if (isActive !== null && isActive !== 'all') {
      where.is_active = isActive === 'true';
    }
    
    if (isPartner !== null && isPartner !== 'all') {
      where.is_partner = isPartner === 'true';
    }

    // Fetch senders with related data
    const senders = await prisma.sender_profiles.findMany({
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

    return NextResponse.json({
      success: true,
      senders,
      count: senders.length
    });
  } catch (error) {
    console.error('Error fetching senders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch senders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
