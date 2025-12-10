import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Generate signed upload URLs for KYB documents
// This allows direct uploads to Supabase Storage, bypassing Vercel's 4.5MB limit
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    let userId: string | null = null;
    
    const authUser = await getUserFromRequest(request);
    if (authUser) {
      userId = authUser.id;
    }
    
    if (!userId) {
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
            }
          });
          userId = dbUser?.id || null;
        }
      } catch (sessionError) {
        console.error('Session check error:', sessionError);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const body = await request.json();
    const { documents } = body; // Array of { type: string, fileName: string, contentType: string }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: 'No documents specified' }, { status: 400 });
    }

    // Initialize Supabase client with service role for signed URLs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return NextResponse.json({ error: 'Storage error' }, { status: 500 });
    }
    
    const bucketExists = buckets?.some(b => b.name === 'kyb-documents');
    if (!bucketExists) {
      return NextResponse.json({ 
        error: 'Storage bucket "kyb-documents" not found. Please contact support.' 
      }, { status: 500 });
    }

    // Generate signed upload URLs for each document
    const uploadUrls: Record<string, { uploadUrl: string; filePath: string }> = {};

    for (const doc of documents) {
      const { type, fileName, contentType } = doc;
      const fileExt = fileName.split('.').pop() || 'pdf';
      const uniqueFileName = `${type}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kyb/${userId}/${uniqueFileName}`;

      // Generate signed URL for upload (valid for 10 minutes)
      const { data, error } = await supabase.storage
        .from('kyb-documents')
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error(`Error creating signed URL for ${type}:`, error);
        return NextResponse.json({ 
          error: `Failed to create upload URL for ${type}` 
        }, { status: 500 });
      }

      uploadUrls[type] = {
        uploadUrl: data.signedUrl,
        filePath: filePath
      };
    }

    console.log('📤 Generated signed upload URLs for user:', userId);

    return NextResponse.json({
      success: true,
      uploadUrls,
      userId
    });

  } catch (error) {
    console.error('Error generating upload URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500 }
    );
  }
}
