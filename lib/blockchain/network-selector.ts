/**
 * Network Selector Service
 * Intelligently selects the best network for transactions based on priority, availability, and cost
 */

import { prisma } from '@/lib/prisma';

export interface NetworkInfo {
  id: bigint;
  identifier: string;
  networkType: 'evm' | 'hedera';
  priority: number;
  fee: number;
  isEnabled: boolean;
  isTestnet: boolean;
  
  // EVM-specific
  chainId?: bigint | null;
  rpcEndpoint?: string | null;
  
  // Hedera-specific
  hederaNetworkId?: string | null;
  mirrorNodeUrl?: string | null;
}

export interface TokenInfo {
  id: bigint;
  symbol: string;
  contractAddress: string;
  tokenType: 'erc20' | 'hts' | 'native';
  decimals: number;
  networkId: bigint;
}

export class NetworkSelector {
  /**
   * Get all available networks ordered by priority
   */
  async getAvailableNetworks(): Promise<NetworkInfo[]> {
    const networks = await prisma.networks.findMany({
      where: { is_enabled: true },
      orderBy: { priority: 'asc' }, // Lower priority number = higher priority
      select: {
        id: true,
        identifier: true,
        network_type: true,
        priority: true,
        fee: true,
        is_enabled: true,
        is_testnet: true,
        chain_id: true,
        rpc_endpoint: true,
        hedera_network_id: true,
        mirror_node_url: true,
      },
    });

    return networks.map(n => ({
      id: n.id,
      identifier: n.identifier,
      networkType: n.network_type as 'evm' | 'hedera',
      priority: n.priority,
      fee: n.fee,
      isEnabled: n.is_enabled,
      isTestnet: n.is_testnet,
      chainId: n.chain_id,
      rpcEndpoint: n.rpc_endpoint,
      hederaNetworkId: n.hedera_network_id,
      mirrorNodeUrl: n.mirror_node_url,
    }));
  }

  /**
   * Get the primary network (highest priority)
   */
  async getPrimaryNetwork(): Promise<NetworkInfo | null> {
    const networks = await this.getAvailableNetworks();
    return networks[0] || null;
  }

  /**
   * Get network by identifier
   */
  async getNetworkByIdentifier(identifier: string): Promise<NetworkInfo | null> {
    const network = await prisma.networks.findUnique({
      where: { identifier },
      select: {
        id: true,
        identifier: true,
        network_type: true,
        priority: true,
        fee: true,
        is_enabled: true,
        is_testnet: true,
        chain_id: true,
        rpc_endpoint: true,
        hedera_network_id: true,
        mirror_node_url: true,
      },
    });

    if (!network) return null;

    return {
      id: network.id,
      identifier: network.identifier,
      networkType: network.network_type as 'evm' | 'hedera',
      priority: network.priority,
      fee: network.fee,
      isEnabled: network.is_enabled,
      isTestnet: network.is_testnet,
      chainId: network.chain_id,
      rpcEndpoint: network.rpc_endpoint,
      hederaNetworkId: network.hedera_network_id,
      mirrorNodeUrl: network.mirror_node_url,
    };
  }

  /**
   * Get token by symbol and network
   */
  async getTokenBySymbol(symbol: string, networkId: bigint): Promise<TokenInfo | null> {
    const token = await prisma.tokens.findFirst({
      where: {
        symbol: symbol.toUpperCase(),
        network_tokens: networkId,
        is_enabled: true,
      },
      select: {
        id: true,
        symbol: true,
        contract_address: true,
        token_type: true,
        decimals: true,
        network_tokens: true,
      },
    });

    if (!token) return null;

    return {
      id: token.id,
      symbol: token.symbol,
      contractAddress: token.contract_address,
      tokenType: token.token_type as 'erc20' | 'hts' | 'native',
      decimals: token.decimals,
      networkId: token.network_tokens,
    };
  }

  /**
   * Get all tokens for a specific network
   */
  async getTokensForNetwork(networkId: bigint): Promise<TokenInfo[]> {
    const tokens = await prisma.tokens.findMany({
      where: {
        network_tokens: networkId,
        is_enabled: true,
      },
      select: {
        id: true,
        symbol: true,
        contract_address: true,
        token_type: true,
        decimals: true,
        network_tokens: true,
      },
    });

    return tokens.map(t => ({
      id: t.id,
      symbol: t.symbol,
      contractAddress: t.contract_address,
      tokenType: t.token_type as 'erc20' | 'hts' | 'native',
      decimals: t.decimals,
      networkId: t.network_tokens,
    }));
  }

  /**
   * Select best network for a transaction
   * Returns networks in priority order for fallback
   */
  async selectNetworksForTransaction(
    tokenSymbol: string,
    _amount: number
  ): Promise<Array<{ network: NetworkInfo; token: TokenInfo }>> {
    const networks = await this.getAvailableNetworks();
    const result: Array<{ network: NetworkInfo; token: TokenInfo }> = [];

    for (const network of networks) {
      // Check if token is available on this network
      const token = await this.getTokenBySymbol(tokenSymbol, network.id);
      
      if (token) {
        result.push({ network, token });
      }
    }

    return result;
  }

  /**
   * Calculate cost for transaction on each network
   */
  async calculateTransactionCosts(
    tokenSymbol: string,
    amount: number
  ): Promise<Array<{ networkIdentifier: string; fee: number; total: number }>> {
    const options = await this.selectNetworksForTransaction(tokenSymbol, amount);
    
    return options.map(({ network }) => ({
      networkIdentifier: network.identifier,
      fee: network.fee,
      total: amount + network.fee,
    }));
  }
}

/**
 * Singleton instance
 */
let networkSelectorInstance: NetworkSelector | null = null;

export function getNetworkSelector(): NetworkSelector {
  if (!networkSelectorInstance) {
    networkSelectorInstance = new NetworkSelector();
  }
  return networkSelectorInstance;
}
