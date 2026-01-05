import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const scope = searchParams.get('scope');
    const isVerified = searchParams.get('is_verified');
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (scope && scope !== 'all') {
      where.scope = scope;
    }
    
    if (isVerified !== null && isVerified !== 'all') {
      where.is_email_verified = isVerified === 'true';
    }

    // Fetch users with related data
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        scope: true,
        is_email_verified: true,
        has_early_access: true,
        kyb_verification_status: true,
        created_at: true,
        updated_at: true,
        provider_profiles: {
          select: {
            id: true,
            trading_name: true,
            is_active: true,
            is_kyb_verified: true
          }
        },
        sender_profiles: {
          select: {
            id: true,
            is_active: true,
            is_partner: true
          }
        },
        kyb_profiles: {
          select: {
            id: true,
            certificate_of_incorporation_url: true,
            business_license_url: true,
            shareholder_declaration_url: true,
            aml_policy_url: true,
            data_protection_policy_url: true,
            kyb_rejection_comment: true,
            document_notes: true,
            created_at: true,
            updated_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 100 // Limit for performance
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
