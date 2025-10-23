import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// POST - Save white-label configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const logo = formData.get('logo') as File | null;
    const primaryColor = formData.get('primaryColor') as string;
    const brandName = formData.get('brandName') as string;

    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }

    let logoPath: string | null = null;

    // Save logo if provided
    if (logo) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos', user.id);
      await mkdir(uploadsDir, { recursive: true });

      const logoExt = path.extname(logo.name);
      const logoFilename = `logo-${crypto.randomUUID()}${logoExt}`;
      const logoFullPath = path.join(uploadsDir, logoFilename);
      
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      await writeFile(logoFullPath, logoBuffer);
      
      // Store relative path for web access
      logoPath = `/uploads/logos/${user.id}/${logoFilename}`;
    }

    // Prepare white-label config
    const whiteLabelConfig = {
      brandName,
      primaryColor: primaryColor || '#0066FF',
      logoUrl: logoPath,
      updatedAt: new Date().toISOString()
    };

    // Update sender profile
    const _senderProfile = await prisma.sender_profiles.update({
      where: { user_sender_profile: user.id },
      data: {
        white_label_config: whiteLabelConfig,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      config: whiteLabelConfig,
      message: 'White-label configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving white-label config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get white-label configuration
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: user.id },
      select: { white_label_config: true }
    });

    if (!senderProfile) {
      return NextResponse.json(
        { error: 'Sender profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      config: senderProfile.white_label_config || null
    });
  } catch (error) {
    console.error('Error fetching white-label config:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}
