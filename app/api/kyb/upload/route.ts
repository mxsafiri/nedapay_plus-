import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
    const supportedCountriesStr = formData.get('supportedCountries') as string | null;

    if (!incorporation && !license) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'kyb', user.id);
    await mkdir(uploadsDir, { recursive: true });
    console.log('📁 Upload directory created:', uploadsDir);

    const documents: Record<string, string> = {};

    // Save incorporation certificate
    if (incorporation) {
      const incorporationExt = path.extname(incorporation.name);
      const incorporationFilename = `incorporation-${crypto.randomUUID()}${incorporationExt}`;
      const incorporationPath = path.join(uploadsDir, incorporationFilename);
      
      const incorporationBuffer = Buffer.from(await incorporation.arrayBuffer());
      await writeFile(incorporationPath, incorporationBuffer);
      
      documents.incorporation = incorporationPath;
      console.log('✅ Incorporation certificate saved:', incorporationFilename);
    }

    // Save business license
    if (license) {
      const licenseExt = path.extname(license.name);
      const licenseFilename = `license-${crypto.randomUUID()}${licenseExt}`;
      const licensePath = path.join(uploadsDir, licenseFilename);
      
      const licenseBuffer = Buffer.from(await license.arrayBuffer());
      await writeFile(licensePath, licenseBuffer);
      
      documents.license = licensePath;
      console.log('✅ Business license saved:', licenseFilename);
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
        license: !!documents.license
      },
      message: 'Documents uploaded successfully. KYB verification pending.'
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
