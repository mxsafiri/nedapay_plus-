import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch trading configurations for a user
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

    // Get all tokens with their configurations for this sender
    // Filter by chain_id starting with 8453 (Base mainnet and Base Sepolia)
    const tokens = await prisma.tokens.findMany({
      where: { 
        is_enabled: true,
        networks: {
          OR: [
            { chain_id: 8453 },      // Base mainnet
            { chain_id: 84532 }      // Base Sepolia
          ]
        }
      },
      include: {
        sender_order_tokens: {
          where: { sender_profile_order_tokens: senderProfile.id }
        },
        networks: true
      }
    });

    // Sort by popularity (most to least popular)
    const popularityOrder = ['USDC', 'DAI', 'EURC', 'BRL', 'TRYB', 'ZARP', 'MXNE', 'CADC', 'NZDD', 'IDRX'];
    const sortedTokens = tokens.sort((a, b) => {
      const indexA = popularityOrder.indexOf(a.symbol);
      const indexB = popularityOrder.indexOf(b.symbol);
      // If symbol not in list, put it at the end
      const posA = indexA === -1 ? popularityOrder.length : indexA;
      const posB = indexB === -1 ? popularityOrder.length : indexB;
      return posA - posB;
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedTokens = sortedTokens.map(token => ({
      ...token,
      id: token.id.toString(),
      network_tokens: token.network_tokens.toString(),
      sender_order_tokens: token.sender_order_tokens.map(sot => ({
        ...sot,
        id: sot.id.toString(),
        sender_profile_order_tokens: sot.sender_profile_order_tokens.toString(),
        token_sender_order_tokens: sot.token_sender_order_tokens.toString()
      })),
      networks: token.networks ? {
        ...token.networks,
        id: token.networks.id.toString(),
        chain_id: token.networks.chain_id ? token.networks.chain_id.toString() : null
      } : null
    }));

    return NextResponse.json({ tokens: serializedTokens, senderProfileId: senderProfile.id.toString() });
  } catch (error) {
    console.error('Error fetching trading configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading configurations' },
      { status: 500 }
    );
  }
}

// POST - Create or update trading configuration for a token
export async function POST(request: NextRequest) {
  try {
    const { userId, tokenId, feePercent, feeAddress, refundAddress } = await request.json();

    if (!userId || !tokenId || feePercent === undefined || !feeAddress || !refundAddress) {
      return NextResponse.json(
        { error: 'All fields are required: userId, tokenId, feePercent, feeAddress, refundAddress' },
        { status: 400 }
      );
    }

    // Validate fee percent (0-100)
    if (feePercent < 0 || feePercent > 100) {
      return NextResponse.json(
        { error: 'Fee percent must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Get sender profile for the user
    const senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    if (!senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });
    }

    // Check if configuration already exists
    const existingConfig = await prisma.sender_order_tokens.findFirst({
      where: {
        sender_profile_order_tokens: senderProfile.id,
        token_sender_order_tokens: parseInt(tokenId)
      }
    });

    let config;
    if (existingConfig) {
      // Update existing configuration
      config = await prisma.sender_order_tokens.update({
        where: { id: existingConfig.id },
        data: {
          fee_percent: feePercent,
          fee_address: feeAddress,
          refund_address: refundAddress,
          updated_at: new Date()
        }
      });
    } else {
      // Create new configuration
      config = await prisma.sender_order_tokens.create({
        data: {
          fee_percent: feePercent,
          fee_address: feeAddress,
          refund_address: refundAddress,
          sender_profile_order_tokens: senderProfile.id,
          token_sender_order_tokens: parseInt(tokenId),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error saving trading configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save trading configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Remove trading configuration for a token
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tokenId = searchParams.get('tokenId');

    if (!userId || !tokenId) {
      return NextResponse.json(
        { error: 'User ID and Token ID are required' },
        { status: 400 }
      );
    }

    // Get sender profile for the user
    const senderProfile = await prisma.sender_profiles.findUnique({
      where: { user_sender_profile: userId }
    });

    if (!senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });
    }

    // Delete the configuration
    await prisma.sender_order_tokens.deleteMany({
      where: {
        sender_profile_order_tokens: senderProfile.id,
        token_sender_order_tokens: parseInt(tokenId)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trading configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete trading configuration' },
      { status: 500 }
    );
  }
}
