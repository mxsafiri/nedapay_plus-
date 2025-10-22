"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, CheckCircle, AlertCircle, Plus, Minus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { WalletSetupWizard } from "@/components/onboarding/wallet-setup-wizard";

interface ProviderConfigurationsProps {
  userId?: string;
}

interface Network {
  id: string;
  chain_id: string | null;
  identifier: string;
  network_type: string;  // 'evm' or 'hedera'
  priority: number;
  hedera_network_id?: string | null;
}

interface ProviderConfig {
  goLive: boolean;
  visibility: "public" | "private";
  selectedCurrency: "USDC" | "USDT" | "CUSD";
  rateType: "fixed" | "floating";
  fixedRate: number;
  slippageTolerance: number;
  minOrderAmount: number;
  maxOrderAmount: number;
  walletAddresses: Record<string, string>;
  hostIdentifier: string;
  provisionMode: "auto" | "manual";
}

export function ProviderLiquidityConfigurations({ userId }: ProviderConfigurationsProps) {
  const [config, setConfig] = useState<ProviderConfig>({
    goLive: false,
    visibility: "private",
    selectedCurrency: "USDC",
    rateType: "fixed",
    fixedRate: 0,
    slippageTolerance: 0,
    minOrderAmount: 0,
    maxOrderAmount: 0,
    walletAddresses: {},
    hostIdentifier: "",
    provisionMode: "auto"
  });
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const currentUser = getCurrentUser();
  const effectiveUserId = userId || currentUser?.id;

  // Mock market rates for display
  const marketRates = {
    current: 2445.38,
    min: 2408.70,
    max: 2482.06
  };

  useEffect(() => {
    if (effectiveUserId) {
      fetchConfigurations();
      fetchNetworks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  useEffect(() => {
    if (effectiveUserId && networks.length > 0) {
      fetchConfigurations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId, networks]);

  const fetchNetworks = async () => {
    try {
      // Fetch available networks (Base and Base Sepolia)
      const response = await fetch('/api/networks');
      if (response.ok) {
        const data = await response.json();
        setNetworks(data.networks || []);
      }
    } catch (_error) {
      console.error('Error fetching networks:', _error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/provider-configurations?userId=${effectiveUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        // Initialize wallet addresses based on available networks
        const walletAddresses: Record<string, string> = {};
        networks.forEach(network => {
          walletAddresses[network.identifier] = data.walletAddresses?.[network.identifier] || "";
        });

        setConfig({
          goLive: data.goLive || false,
          visibility: data.visibility || "private",
          selectedCurrency: "USDC", // Default for now
          rateType: "fixed", // Default for now
          fixedRate: data.orderTokens?.[0]?.fixedConversionRate || 2445.38,
          slippageTolerance: data.orderTokens?.[0]?.rateSlippage || 0,
          minOrderAmount: data.orderTokens?.[0]?.minOrderAmount || 0,
          maxOrderAmount: data.orderTokens?.[0]?.maxOrderAmount || 0,
          walletAddresses,
          hostIdentifier: data.hostIdentifier || "",
          provisionMode: data.provisionMode || "auto"
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to fetch configurations' });
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Failed to fetch provider configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/provider-configurations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          goLive: config.goLive,
          visibility: config.visibility,
          selectedCurrency: config.selectedCurrency,
          rateType: config.rateType,
          fixedRate: config.fixedRate,
          slippageTolerance: config.slippageTolerance,
          minOrderAmount: config.minOrderAmount,
          maxOrderAmount: config.maxOrderAmount,
          walletAddresses: config.walletAddresses,
          hostIdentifier: config.hostIdentifier,
          provisionMode: config.provisionMode
        })
      });

      if (response.ok) {
        await response.json();
        setMessage({ type: 'success', text: 'Provider configurations updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update configurations' });
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Failed to update provider configurations' });
    } finally {
      setSaving(false);
    }
  };

  const adjustSlippage = (delta: number) => {
    setConfig(prev => ({
      ...prev,
      slippageTolerance: Math.max(0, prev.slippageTolerance + delta)
    }));
  };

  const calculateRateRange = () => {
    const rate = config.fixedRate;
    const tolerance = config.slippageTolerance;
    return {
      min: rate - tolerance,
      max: rate + tolerance
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Provider Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if wallet addresses are configured
  const hasWalletsConfigured = networks.length > 0 && networks.every(
    network => config.walletAddresses[network.identifier]?.trim().length > 0
  );

  // Show wallet setup wizard if wallets are not configured OR user clicks "Setup Guide"
  if ((!hasWalletsConfigured || showWizard) && effectiveUserId) {
    return (
      <WalletSetupWizard 
        userId={effectiveUserId}
        onComplete={() => {
          // Refresh configurations after wallet setup
          setShowWizard(false);
          fetchConfigurations();
        }}
      />
    );
  }

  const rateRange = calculateRateRange();

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Building2 className="h-5 w-5" />
            Provider Liquidity Configurations
          </CardTitle>
          <p className="text-xs text-muted-foreground md:text-sm">
            Configure rates, slippage, wallet addresses, and provision mode for your provider profile.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Go Live */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="go-live" className="text-base font-medium">
                Go live
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose if you want to go live and start receiving orders.
              </p>
            </div>
            <Switch
              id="go-live"
              checked={config.goLive}
              onCheckedChange={(checked: boolean) => 
                setConfig(prev => ({ ...prev, goLive: checked }))
              }
            />
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Choose your visibility mode
              </p>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={config.visibility === "public"}
                  onChange={(e) => setConfig(prev => ({ ...prev, visibility: e.target.value as "public" | "private" }))}
                  className="text-primary"
                />
                <span>Public</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={config.visibility === "private"}
                  onChange={(e) => setConfig(prev => ({ ...prev, visibility: e.target.value as "public" | "private" }))}
                  className="text-primary"
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Currency</Label>
            <div className="flex flex-wrap gap-2">
              {(["USDC", "USDT", "CUSD"] as const).map((currency) => (
                <Button
                  key={currency}
                  variant={config.selectedCurrency === currency ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, selectedCurrency: currency }))}
                  className="flex items-center gap-2"
                >
                  <div className={`h-2 w-2 rounded-full ${
                    currency === "USDC" ? "bg-blue-500" : 
                    currency === "USDT" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  {currency}
                </Button>
              ))}
            </div>
          </div>

          {/* Rate Type */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Rate type</Label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rateType"
                  value="fixed"
                  checked={config.rateType === "fixed"}
                  onChange={(e) => setConfig(prev => ({ ...prev, rateType: e.target.value as "fixed" | "floating" }))}
                  className="text-primary"
                />
                <span>Fixed</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rateType"
                  value="floating"
                  checked={config.rateType === "floating"}
                  onChange={(e) => setConfig(prev => ({ ...prev, rateType: e.target.value as "fixed" | "floating" }))}
                  className="text-primary"
                />
                <span>Floating</span>
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Current market rate is TSh {marketRates.current.toLocaleString()}, minimum rate is TSh {marketRates.min.toLocaleString()}, and maximum rate is TSh {marketRates.max.toLocaleString()}.
            </p>
          </div>

          {/* Fixed Rate Input */}
          {config.rateType === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="fixed-rate">Fixed Rate (TSh)</Label>
              <Input
                id="fixed-rate"
                type="number"
                value={config.fixedRate}
                onChange={(e) => setConfig(prev => ({ ...prev, fixedRate: parseFloat(e.target.value) || 0 }))}
                placeholder="TSh0"
              />
            </div>
          )}

          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Slippage Tolerance</Label>
              <p className="text-sm text-muted-foreground">
                Set slippage tolerance to determine the rate range within which your node can be selected for backup order fulfillment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustSlippage(-1)}
                disabled={config.slippageTolerance <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                ± TSh {config.slippageTolerance.toFixed(2)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustSlippage(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your node will be eligible for orders within the TSh {rateRange.min.toLocaleString()} to TSh {rateRange.max.toLocaleString()} rate range.
            </p>
          </div>

          {/* Order Amount Limits */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Minimum order amount (USD)</Label>
              <Input
                id="min-amount"
                type="number"
                value={config.minOrderAmount}
                onChange={(e) => setConfig(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Maximum order amount (USD)</Label>
              <Input
                id="max-amount"
                type="number"
                value={config.maxOrderAmount}
                onChange={(e) => setConfig(prev => ({ ...prev, maxOrderAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configure Provision Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Provision Mode</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your node to start providing liquidity.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Host Identifier */}
          <div className="space-y-2">
            <Label htmlFor="host-identifier">Host Identifier</Label>
            <Input
              id="host-identifier"
              value={config.hostIdentifier}
              onChange={(e) => setConfig(prev => ({ ...prev, hostIdentifier: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button 
              variant="outline" 
              onClick={fetchConfigurations} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>USDC Wallet Addresses</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your wallet addresses to receive USDC settlements on each network
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWizard(true)}
              className="flex-shrink-0"
            >
              Setup Guide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {networks.length > 0 ? (
            networks.map((network) => (
              <div key={network.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={network.identifier} className="text-base font-semibold capitalize">
                      {network.identifier.replace('-', ' ')}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Priority {network.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {network.network_type === 'hedera' ? 'Hedera' : 'EVM'}
                      </span>
                    </div>
                  </div>
                  {network.priority === 1 && (
                    <span className="text-xs font-medium text-green-600">PRIMARY</span>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {network.network_type === 'hedera' ? (
                    <>
                      <p>• Network: {network.hedera_network_id || 'testnet'}</p>
                      <p>• Format: Hedera Account ID (e.g., 0.0.7099609)</p>
                      <p className="text-orange-600 font-medium">⚠️ Use your Hedera account ID, NOT an EVM address</p>
                    </>
                  ) : (
                    <>
                      <p>• Chain ID: {network.chain_id}</p>
                      <p>• Format: EVM Address (e.g., 0x742d35...)</p>
                    </>
                  )}
                </div>
                
                <Input
                  id={network.identifier}
                  value={config.walletAddresses[network.identifier] || ""}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    walletAddresses: {
                      ...prev.walletAddresses,
                      [network.identifier]: e.target.value
                    }
                  }))}
                  placeholder={
                    network.network_type === 'hedera' 
                      ? "0.0.7099609" 
                      : "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  }
                  className="font-mono text-sm"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading available networks...
            </div>
          )}

          {/* Unsaved Changes Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Please click &quot;Update&quot; to save your provider preferences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
