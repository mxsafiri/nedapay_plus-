import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch available networks (Base and Base Sepolia)
export async function GET(_request: NextRequest) {
  try {
    // Get networks with chain_id starting with 8453 (Base mainnet and Base Sepolia)
    const networks = await prisma.networks.findMany({
      where: {
        OR: [
          { chain_id: 8453 },      // Base mainnet
          { chain_id: 84532 }      // Base Sepolia
        ]
      },
      orderBy: { chain_id: 'asc' }
    });

    // Convert BigInt values to strings for JSON serialization
    const serializedNetworks = networks.map(network => ({
      id: network.id.toString(),
      chain_id: network.chain_id.toString(),
      identifier: network.identifier,
      rpc_endpoint: network.rpc_endpoint,
      is_testnet: network.is_testnet,
      fee: network.fee,
      gateway_contract_address: network.gateway_contract_address,
      bundler_url: network.bundler_url,
      paymaster_url: network.paymaster_url,
      block_time: network.block_time,
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
