import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import crypto from 'crypto';
import { sendAdminKYBNotification } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// POST - Upload KYB documents
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📤 KYB Upload - User authenticated:', { id: user.id, email: user.email });

    const formData = await request.formData();
    const incorporation = formData.get('incorporation') as File | null;
    const license = formData.get('license') as File | null;
    const shareholderDeclaration = formData.get('shareholderDeclaration') as File | null;
    const amlPolicy = formData.get('amlPolicy') as File | null;
    const dataProtectionPolicy = formData.get('dataProtectionPolicy') as File | null;
    const supportedCountriesStr = formData.get('supportedCountries') as string | null;

    // Only incorporation and license are required, others are optional
    if (!incorporation || !license) {
      return NextResponse.json(
        { error: 'Certificate of Incorporation and Business License are required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role for file uploads
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('📁 Uploading documents to Supabase Storage...');

    const documents: Record<string, string> = {};

    // Helper function to upload file to Supabase Storage
    const uploadFile = async (file: File, docType: string) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${docType}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kyb/${user.id}/${fileName}`;
      
      console.log(`📤 Uploading ${docType}:`, { fileName, filePath, size: file.size, type: file.type });
      
      const fileBuffer = await file.arrayBuffer();
      
      // Check if bucket exists first
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError);
        throw new Error(`Storage error: ${bucketError.message}. Please ensure Supabase Storage is configured.`);
      }
      
      const bucketExists = buckets?.some(b => b.name === 'kyb-documents');
      if (!bucketExists) {
        console.error('❌ Bucket "kyb-documents" does not exist');
        throw new Error('Storage bucket "kyb-documents" not found. Please create it in Supabase Dashboard (see SUPABASE_STORAGE_SETUP.md)');
      }
      
      const { data, error } = await supabase.storage
        .from('kyb-documents')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error(`❌ Error uploading ${docType}:`, error);
        throw new Error(`Failed to upload ${docType}: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyb-documents')
        .getPublicUrl(filePath);

      console.log(`✅ ${docType} uploaded:`, fileName, 'URL:', publicUrl);
      return publicUrl;
    };

    // Upload all documents (only upload if file exists)
    try {
      documents.incorporation = await uploadFile(incorporation, 'incorporation');
      documents.license = await uploadFile(license, 'license');
      
      // Optional documents - only upload if provided
      if (shareholderDeclaration) {
        documents.shareholderDeclaration = await uploadFile(shareholderDeclaration, 'shareholder-declaration');
      }
      if (amlPolicy) {
        documents.amlPolicy = await uploadFile(amlPolicy, 'aml-policy');
      }
      if (dataProtectionPolicy) {
        documents.dataProtectionPolicy = await uploadFile(dataProtectionPolicy, 'data-protection-policy');
      }
    } catch (uploadError) {
      console.error('❌ File upload error:', uploadError);
      throw uploadError;
    }

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
          mobile_number: '',  // Will be updated later
          company_name: '',   // Will be updated later
          registered_business_address: '',  // Will be updated later
          certificate_of_incorporation_url: documents.incorporation || '',
          articles_of_incorporation_url: documents.incorporation || '',  // Same as cert for now
          business_license_url: documents.license || null,
          proof_of_business_address_url: '',  // Will be updated later
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
      // Continue anyway - don't fail the whole upload
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
        console.error('⚠️ Failed to send admin notifications, but KYB submission was successful');
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notifications:', emailError);
      // Don't fail the whole upload if email fails
    }

    // If PSP and supported countries provided, update provider profile
    if (supportedCountriesStr) {
      const supportedCountries = JSON.parse(supportedCountriesStr);
      
      await prisma.provider_profiles.updateMany({
        where: { user_provider_profile: user.id },
        data: {
          supported_countries: supportedCountries,
          updated_at: new Date()
        }
      });
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
    console.error('❌ Error uploading KYB documents:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to upload documents',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

// GET - Get KYB status
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        kyb_verification_status: true,
        kyb_profiles: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: userData.kyb_verification_status,
      profile: userData.kyb_profiles,
      hasDocuments: !!userData.kyb_profiles
    });
  } catch (error) {
    console.error('Error fetching KYB status:', error);
    return NextResponse.json(
      { error: 'Failed to get KYB status' },
      { status: 500 }
    );
  }
}
