"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import { Settings, ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Token {
  id: number;
  symbol: string;
  contract_address: string;
  decimals: number;
  networks: {
    name?: string;
    identifier?: string;
  };
  sender_order_tokens: Array<{
    id: number;
    fee_percent: number;
    fee_address: string;
    refund_address: string;
  }>;
}

interface TokenConfig {
  feePercent: number;
  feeAddress: string;
  refundAddress: string;
}

export function TradingConfigurations() {
  const user = getCurrentUser();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [expandedTokenId, setExpandedTokenId] = useState<number | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [configs, setConfigs] = useState<Record<number, TokenConfig>>({});
  const [defaultConfig, setDefaultConfig] = useState<TokenConfig>({
    feePercent: 0,
    feeAddress: '',
    refundAddress: ''
  });

  const effectiveUserId = user?.id;

  const fetchTradingConfigurations = async () => {
    try {
      const profileResponse = await fetch(`/api/sender-profile?userId=${effectiveUserId}`);
      if (!profileResponse.ok) {
        toast.error('Failed to initialize sender profile');
        return;
      }

      const response = await fetch(`/api/trading-configurations?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTokens(data.tokens || []);
      } else {
        toast.error(data.error || 'Failed to fetch trading configurations');
      }
    } catch (_error) {
      toast.error('Failed to fetch trading configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveUserId) {
      fetchTradingConfigurations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const handleToggleExpand = (tokenId: number) => {
    setExpandedTokenId(expandedTokenId === tokenId ? null : tokenId);
  };

  const getTokenConfig = (token: Token): TokenConfig => {
    if (configs[token.id]) {
      return configs[token.id];
    }
    const existingConfig = token.sender_order_tokens[0];
    if (existingConfig) {
      return {
        feePercent: existingConfig.fee_percent,
        feeAddress: existingConfig.fee_address,
        refundAddress: existingConfig.refund_address
      };
    }
    return { ...defaultConfig };
  };

  const updateTokenConfig = (tokenId: number, field: keyof TokenConfig, value: string | number) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;
    
    setConfigs(prev => ({
      ...prev,
      [tokenId]: {
        ...getTokenConfig(token),
        [field]: value
      }
    }));
  };

  const handleSaveConfiguration = async (token: Token) => {
    if (!user) return;

    const config = getTokenConfig(token);

    if (!config.feeAddress || !config.refundAddress) {
      toast.error('Fee address and refund address are required');
      return;
    }

    if (config.feePercent < 0 || config.feePercent > 100) {
      toast.error('Fee percent must be between 0 and 100');
      return;
    }

    setSaving(token.id);

    try {
      const response = await fetch('/api/trading-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tokenId: token.id,
          feePercent: config.feePercent,
          feeAddress: config.feeAddress,
          refundAddress: config.refundAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${token.symbol} configuration saved successfully`);
        await fetchTradingConfigurations();
        setExpandedTokenId(null);
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(null);
    }
  };

  const handleApplyToAll = async () => {
    if (!user || !defaultConfig.feeAddress || !defaultConfig.refundAddress) {
      toast.error('Please set default fee and refund addresses');
      return;
    }

    const filteredTokens = selectedChain === 'all' 
      ? tokens 
      : tokens.filter(t => t.networks.name === selectedChain);

    try {
      setSaving(-1);
      for (const token of filteredTokens) {
        await fetch('/api/trading-configurations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            tokenId: token.id,
            feePercent: defaultConfig.feePercent,
            feeAddress: defaultConfig.feeAddress,
          })
        }).finally(() => {
          setSaving(null);
        });
      }
      toast.success(`Configuration applied to ${filteredTokens.length} tokens`);
      await fetchTradingConfigurations();
    } catch (_error) {
      toast.error('Failed to apply configuration to all tokens');
    } finally {
      setSaving(null);
    }
  };

  const handleCopyConfig = (token: Token) => {
    const config = getTokenConfig(token);
    setDefaultConfig(config);
    toast.success(`Copied ${token.symbol} settings to default`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTokenIcon = (symbol: string) => {
    const iconMap: Record<string, string> = {
      'DAI': '/logo.svg',
      'USDC': '/usdc-logo.svg',
      'EURC': '/eurc-coin.png',
      'BRL': '/brl-coin.png',
      'CADC': '/cadc-coin.png',
      'IDRX': '/idrx-coin.png',
      'MXNE': '/mxne-coin.png',
      'NZDD': '/nzdd-icon.png',
      'TRYB': '/tryb-icon.png',
      'ZARP': '/zarp-coin.png'
    };
    return iconMap[symbol.toUpperCase()] || '/logo.svg';
  };

  const chains = ['all', ...Array.from(new Set(tokens.map(t => t.networks?.identifier || t.networks?.name || 'Unknown').filter(Boolean)))];
  const filteredTokens = selectedChain === 'all' 
    ? tokens 
    : tokens.filter(t => (t.networks?.identifier || t.networks?.name || 'Unknown') === selectedChain);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.02em' }}>Trading Configurations</h2>
        <p className="text-base text-muted-foreground mt-2">
          Configure fees and wallet addresses for each token. Click any token to expand and configure.
        </p>
      </div>

      {/* Quick Setup Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set default values and apply to all tokens at once
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultFee" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Fee %</Label>
                  <Input
                    id="defaultFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={defaultConfig.feePercent}
                    onChange={(e) => setDefaultConfig(prev => ({ ...prev, feePercent: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.5"
                    className="h-11 px-4 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultFeeAddr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Address</Label>
                  <Input
                    id="defaultFeeAddr"
                    value={defaultConfig.feeAddress}
                    onChange={(e) => setDefaultConfig(prev => ({ ...prev, feeAddress: e.target.value }))}
                    placeholder="0x..."
                    className="h-11 px-4 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultRefundAddr" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Refund Address</Label>
                  <Input
                    id="defaultRefundAddr"
                    value={defaultConfig.refundAddress}
                    onChange={(e) => setDefaultConfig(prev => ({ ...prev, refundAddress: e.target.value }))}
                    placeholder="0x..."
                    className="h-11 px-4 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleApplyToAll}
              disabled={saving === -1 || !defaultConfig.feeAddress || !defaultConfig.refundAddress}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap w-full lg:w-auto"
            >
              {saving === -1 ? 'Applying...' : 'Apply to All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chain Filter & Token List */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Token Configurations</CardTitle>
                <CardDescription className="mt-1">
                  Click to expand and configure each token
                </CardDescription>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/40 border-border/50">
                  <SelectValue placeholder="Filter by chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  {chains.filter(c => c !== 'all').map(chain => (
                    <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            {filteredTokens.map((token) => {
              const hasConfig = token.sender_order_tokens.length > 0;
              const isExpanded = expandedTokenId === token.id;
              const config = getTokenConfig(token);
              
              return (
                <div
                  key={token.id}
                  className="border border-border/30 bg-muted/40 rounded-xl overflow-hidden transition-all"
                >
                  {/* Token Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/60 transition-colors"
                    onClick={() => handleToggleExpand(token.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-border/50 flex items-center justify-center p-1.5 shadow-sm">
                          <Image 
                            src={getTokenIcon(token.symbol)} 
                            alt={token.symbol}
                            width={32}
                            height={32}
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {token.networks.name} • Chain ID: 8453
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasConfig && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600 hidden sm:inline">Configured</span>
                          </div>
                        )}
                        {hasConfig && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyConfig(token);
                            }}
                            className="h-8 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Configuration */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-background/50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`fee-${token.id}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee %</Label>
                            <Input
                              id={`fee-${token.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={config.feePercent}
                              onChange={(e) => updateTokenConfig(token.id, 'feePercent', parseFloat(e.target.value) || 0)}
                              placeholder="0.5"
                              className="h-11 px-4 text-base rounded-lg bg-background border-border/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`feeAddr-${token.id}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Address</Label>
                            <Input
                              id={`feeAddr-${token.id}`}
                              value={config.feeAddress}
                              onChange={(e) => updateTokenConfig(token.id, 'feeAddress', e.target.value)}
                              placeholder="0x..."
                              className="h-11 px-4 text-sm rounded-lg bg-background border-border/50 font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`refundAddr-${token.id}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Refund Address</Label>
                            <Input
                              id={`refundAddr-${token.id}`}
                              value={config.refundAddress}
                              onChange={(e) => updateTokenConfig(token.id, 'refundAddress', e.target.value)}
                              placeholder="0x..."
                              className="h-11 px-4 text-sm rounded-lg bg-background border-border/50 font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setExpandedTokenId(null)}
                            className="h-10 px-5 rounded-lg"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveConfiguration(token)}
                            disabled={saving === token.id}
                            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                          >
                            {saving === token.id ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
