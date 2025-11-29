import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        kyb_verification_status: true,
        created_at: true,
        kyb_profiles: {
          select: {
            id: true,
            certificate_of_incorporation_url: true,
            business_license_url: true,
            shareholder_declaration_url: true,
            aml_policy_url: true,
            data_protection_policy_url: true,
            created_at: true,
            updated_at: true
          }
        },
        provider_profiles: {
          select: {
            id: true,
            trading_name: true
          }
        },
        sender_profiles: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
      hasKybProfile: !!user.kyb_profiles,
      documentUrls: user.kyb_profiles ? {
        incorporation: user.kyb_profiles.certificate_of_incorporation_url,
        license: user.kyb_profiles.business_license_url,
        shareholderDeclaration: user.kyb_profiles.shareholder_declaration_url,
        amlPolicy: user.kyb_profiles.aml_policy_url,
        dataProtectionPolicy: user.kyb_profiles.data_protection_policy_url
      } : null
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
