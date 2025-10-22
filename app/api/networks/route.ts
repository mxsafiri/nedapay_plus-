import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch available networks (Hedera + Base networks)
export async function GET(_request: NextRequest) {
  try {
    // Get all enabled networks (including Hedera and Base)
    const networks = await prisma.networks.findMany({
      where: {
        is_enabled: true  // Only fetch enabled networks
      },
      orderBy: { priority: 'asc' }  // Order by priority (Hedera first, then Base)
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedNetworks = networks.map(network => ({
      id: network.id.toString(),
      chain_id: network.chain_id?.toString() || null,  // Hedera doesn't have chain_id
      identifier: network.identifier,
      network_type: network.network_type,  // 'evm' or 'hedera'
      priority: network.priority,
      rpc_endpoint: network.rpc_endpoint,
      is_testnet: network.is_testnet,
      is_enabled: network.is_enabled,
      fee: network.fee,
      gateway_contract_address: network.gateway_contract_address,
      bundler_url: network.bundler_url,
      paymaster_url: network.paymaster_url,
      block_time: network.block_time,
      // Hedera-specific fields
      hedera_network_id: network.hedera_network_id,
      mirror_node_url: network.mirror_node_url,
      created_at: network.created_at,
      updated_at: network.updated_at
    }));

    return NextResponse.json({ networks: serializedNetworks });
  } catch (error) {
    console.error('Error fetching networks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networks' },
      { status: 500 }
    );
  }
}
