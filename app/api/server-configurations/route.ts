import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch server configurations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get sender profile for the user
    const senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    if (!senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      webhookEnabled: !!senderProfile.webhook_url,
      webhookUrl: senderProfile.webhook_url || '',
      domainWhitelist: Array.isArray(senderProfile.domain_whitelist) ? senderProfile.domain_whitelist : [],
      senderProfileId: senderProfile.id
    });
  } catch (error) {
    console.error('Error fetching server configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server configurations' },
      { status: 500 }
    );
  }
}

// PUT - Update server configurations for a user
export async function PUT(request: NextRequest) {
  try {
    const { userId, webhookEnabled, webhookUrl, domainWhitelist } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate webhook URL if webhook is enabled
    if (webhookEnabled && (!webhookUrl || !webhookUrl.trim())) {
      return NextResponse.json(
        { error: 'Webhook URL is required when webhook notifications are enabled' },
        { status: 400 }
      );
    }

    // Validate webhook URL format if provided
    if (webhookUrl && webhookUrl.trim()) {
      try {
        new URL(webhookUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid webhook URL format' },
          { status: 400 }
        );
      }
    }

    // Validate domain whitelist format
    if (domainWhitelist && !Array.isArray(domainWhitelist)) {
      return NextResponse.json(
        { error: 'Domain whitelist must be an array' },
        { status: 400 }
      );
    }

    // Clean and validate domains
    const cleanDomains = domainWhitelist
      ?.filter((domain: string) => domain && domain.trim())
      .map((domain: string) => domain.trim().toLowerCase())
      .filter((domain: string) => {
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain);
      }) || [];

    // Get sender profile for the user
    const senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    if (!senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });
    }

    // Update sender profile
    const updatedProfile = await prisma.sender_profiles.update({
      where: { id: senderProfile.id },
      data: {
        webhook_url: webhookEnabled ? webhookUrl?.trim() || null : null,
        domain_whitelist: cleanDomains,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      webhookEnabled: !!updatedProfile.webhook_url,
      webhookUrl: updatedProfile.webhook_url || '',
      domainWhitelist: Array.isArray(updatedProfile.domain_whitelist) ? updatedProfile.domain_whitelist : []
    });
  } catch (error) {
    console.error('Error updating server configurations:', error);
    return NextResponse.json(
      { error: 'Failed to update server configurations' },
      { status: 500 }
    );
  }
}
