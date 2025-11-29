import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/server';
import crypto from 'crypto';

// GET - Get or create sender profile for a user
export async function GET(request: NextRequest) {
  try {
    // Try to get user from authentication
    const authUser = await getUserFromRequest(request);
    
    // Fallback to query param for backwards compatibility
    const { searchParams } = new URL(request.url);
    const userId = authUser?.id || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if sender profile already exists
    let senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    // If no sender profile exists, create one
    if (!senderProfile) {
      senderProfile = await prisma.sender_profiles.create({
        data: {
          id: crypto.randomUUID(),
          user_sender_profile: userId,
          webhook_url: null,
          domain_whitelist: [],
          is_active: true,
          is_partner: false,
          provider_id: null,
          updated_at: new Date()
        }
      });
    }

    // Calculate real-time stats from payment_orders
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get transaction stats
    const orderStats = await prisma.payment_orders.aggregate({
      where: {
        sender_profile_payment_orders: senderProfile.id,
      },
      _count: true,
      _avg: {
        amount: true
      },
      _sum: {
        amount: true
      }
    });

    // Get monthly volume
    const monthlyStats = await prisma.payment_orders.aggregate({
      where: {
        sender_profile_payment_orders: senderProfile.id,
        created_at: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    // Add calculated fields to response
    const enhancedProfile = {
      ...senderProfile,
      transaction_count: orderStats._count || 0,
      avg_transaction_value: orderStats._avg.amount || 0,
      avg_monthly_volume: monthlyStats._sum.amount || 0,
      next_billing_date: null // TODO: Implement billing system
    };

    return NextResponse.json({ senderProfile: enhancedProfile });
  } catch (error) {
    console.error('Error fetching/creating sender profile:', error);
    return NextResponse.json(
      { error: 'Failed to get sender profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update sender profile (supports onboarding)
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = await getUserFromRequest(request);
    
    const body = await request.json();
    const { 
      userId, 
      webhookUrl, 
      domainWhitelist, 
      isActive, 
      isPartner, 
      providerId,
      markupPercentage,  // Revenue settings
      // Onboarding fields
      bankName,
      country,
      _contactName,
      _contactEmail,
      _contactPhone
    } = body;

    // Use authenticated user ID or fallback to body userId
    const finalUserId = authUser?.id || userId;

    if (!finalUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile exists
    const existingProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: finalUserId }
    });

    let senderProfile;

    if (existingProfile) {
      // Update existing profile
      const updateData: any = {
        webhook_url: webhookUrl,
        domain_whitelist: domainWhitelist || [],
        is_active: isActive ?? true,
        is_partner: isPartner ?? false,
        provider_id: providerId,
        updated_at: new Date()
      };

      // Only update markup if provided
      if (markupPercentage !== undefined) {
        updateData.markup_percentage = markupPercentage;
      }

      senderProfile = await prisma.sender_profiles.update({
        where: { user_sender_profile: finalUserId },
        data: updateData
      });
    } else {
      // Create new profile (onboarding)
      senderProfile = await prisma.sender_profiles.create({
        data: {
          id: crypto.randomUUID(),
          user_sender_profile: finalUserId,
          webhook_url: webhookUrl || null,
          domain_whitelist: domainWhitelist || [],
          is_active: isActive ?? true,
          is_partner: isPartner ?? false,
          provider_id: providerId || null,
          updated_at: new Date()
        }
      });

      // If onboarding data provided, update user info
      if (bankName || country) {
        await prisma.users.update({
          where: { id: finalUserId },
          data: {
            updated_at: new Date()
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      senderProfile,
      message: existingProfile ? 'Profile updated' : 'Profile created'
    });
  } catch (error) {
    console.error('Error creating/updating sender profile:', error);
    return NextResponse.json(
      { error: 'Failed to process sender profile' },
      { status: 500 }
    );
  }
}
