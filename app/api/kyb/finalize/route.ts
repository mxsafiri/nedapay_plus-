import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendAdminKYBNotification } from '@/lib/email';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Finalize KYB submission after direct uploads complete
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    let user: { id: string; email: string; first_name: string | null; last_name: string | null; scope: string | null } | null = null;
    
    const authUser = await getUserFromRequest(request);
    if (authUser) {
      user = {
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.first_name,
        last_name: authUser.last_name,
        scope: authUser.scope
      };
    }
    
    if (!user) {
      try {
        const supabaseAuth = await createSupabaseServerClient();
        const { data: { user: supabaseUser } } = await supabaseAuth.auth.getUser();
        
        if (supabaseUser) {
          const dbUser = await prisma.users.findFirst({
            where: { 
              OR: [
                { id: supabaseUser.id },
                { email: supabaseUser.email }
              ]
            },
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              scope: true,
            }
          });
          if (dbUser) {
            user = dbUser;
          }
        }
      } catch (sessionError) {
        console.error('Session check error:', sessionError);
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const body = await request.json();
    const { filePaths } = body;
    // filePaths: { incorporation: string, license: string, shareholderDeclaration?: string, ... }

    if (!filePaths || !filePaths.incorporation || !filePaths.license) {
      return NextResponse.json({ 
        error: 'Certificate of Incorporation and Business License are required' 
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate public URLs for all uploaded files
    const documents: Record<string, string> = {};
    
    for (const [docType, filePath] of Object.entries(filePaths)) {
      if (filePath) {
        const { data: { publicUrl } } = supabase.storage
          .from('kyb-documents')
          .getPublicUrl(filePath as string);
        documents[docType] = publicUrl;
      }
    }

    console.log('📁 KYB documents uploaded:', Object.keys(documents));

    // Check if KYB profile exists
    const existingKYB = await prisma.kyb_profiles.findUnique({
      where: { user_kyb_profile: user.id }
    });

    let kybProfile;

    if (existingKYB) {
      // Update existing KYB profile
      console.log('🔄 Updating existing KYB profile for user:', user.id);
      kybProfile = await prisma.kyb_profiles.update({
        where: { user_kyb_profile: user.id },
        data: {
          certificate_of_incorporation_url: documents.incorporation || existingKYB.certificate_of_incorporation_url,
          business_license_url: documents.license || existingKYB.business_license_url,
          shareholder_declaration_url: documents.shareholderDeclaration || (existingKYB as any).shareholder_declaration_url,
          aml_policy_url: documents.amlPolicy || (existingKYB as any).aml_policy_url,
          data_protection_policy_url: documents.dataProtectionPolicy || (existingKYB as any).data_protection_policy_url,
          updated_at: new Date()
        }
      });
      console.log('✅ KYB profile updated');
    } else {
      // Create new KYB profile
      console.log('➕ Creating new KYB profile for user:', user.id);
      kybProfile = await prisma.kyb_profiles.create({
        data: {
          id: crypto.randomUUID(),
          user_kyb_profile: user.id,
          mobile_number: '',
          company_name: '',
          registered_business_address: '',
          certificate_of_incorporation_url: documents.incorporation || '',
          articles_of_incorporation_url: documents.incorporation || '',
          business_license_url: documents.license || null,
          proof_of_business_address_url: '',
          shareholder_declaration_url: documents.shareholderDeclaration || null,
          aml_policy_url: documents.amlPolicy || null,
          data_protection_policy_url: documents.dataProtectionPolicy || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ KYB profile created');
    }

    // Update user KYB status
    try {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          kyb_verification_status: 'pending',
          updated_at: new Date()
        }
      });
      console.log('✅ KYB status updated to pending for user:', user.id);
    } catch (updateError) {
      console.error('❌ Failed to update KYB status:', updateError);
    }

    // Send admin notification emails
    try {
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
      const userRole = user.scope || 'Unknown';
      const adminPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://nedapay.xyz'}/admin`;
      
      console.log('📧 Sending admin KYB notification...');
      const emailResult = await sendAdminKYBNotification(
        user.email,
        userName,
        userRole,
        adminPortalUrl
      );
      
      if (emailResult.success) {
        console.log('✅ Admin notification emails sent successfully');
      } else {
        console.error('⚠️ Failed to send admin notifications');
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notifications:', emailError);
    }

    return NextResponse.json({
      success: true,
      kybProfile,
      documents: {
        incorporation: !!documents.incorporation,
        license: !!documents.license,
        shareholderDeclaration: !!documents.shareholderDeclaration,
        amlPolicy: !!documents.amlPolicy,
        dataProtectionPolicy: !!documents.dataProtectionPolicy
      },
      message: 'Documents uploaded successfully. KYB verification pending. Admin team has been notified.'
    });

  } catch (error) {
    console.error('❌ Error finalizing KYB submission:', error);
    return NextResponse.json(
      { 
        error: 'Failed to finalize KYB submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
