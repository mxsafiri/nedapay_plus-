"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface DemoOrder {
  orderId: string;
  status: string;
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  bankMarkup: number;
  pspCommission: number;
  createdAt: string;
  estimatedCompletion?: string;
  // Additional details from API
  reference?: string;
  recipient?: {
    accountNumber: string;
    accountName: string;
    institution: string;
    branch?: string;
  };
  fulfillment?: {
    pspName: string;
    method: string;
  };
  settlement?: {
    txHash: string;
    network: string;
    explorerUrl?: string;
  };
  platformFee?: number;
  processingTimeSeconds?: number;
}

export function DemoTriggerButton() {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerDemo = async () => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch('/api/demo/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000000, // 1M TZS
          toCurrency: 'CNY',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger demo');
      }

      setOrder(data.order);
      
      // Start polling for order status
      pollOrderStatus(data.order.orderId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const pollOrderStatus = async (orderId: string) => {
    const maxAttempts = 30; // 30 attempts = 3 minutes
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;

      try {
        // Trigger backend processing (this auto-completes the order)
        const processResponse = await fetch('/api/demo/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        if (processResponse.ok) {
          const processData = await processResponse.json();
          
          // Update order status with full details
          if (processData.order) {
            setOrder(prev => prev ? {
              ...prev,
              status: processData.status,
              settlement: processData.order.settlement_tx_hash ? {
                txHash: processData.order.settlement_tx_hash,
                network: processData.order.settlement_network,
                explorerUrl: `https://hashscan.io/testnet/transaction/${processData.order.settlement_tx_hash}`,
              } : prev?.settlement,
            } : null);
          } else {
            setOrder(prev => prev ? { ...prev, status: processData.status } : null);
          }

          // Stop polling when completed
          if (processData.status === 'completed') {
            clearInterval(poll);
          }
        }

        // Also check status via status endpoint as fallback
        const statusResponse = await fetch(`/api/demo/status/${orderId}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.order && statusData.order.status === 'completed') {
            clearInterval(poll);
          }
        }

      } catch (err) {
        console.error('Polling error:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(poll);
      }
    }, 6000); // Poll every 6 seconds
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" /> Failed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              Live Demo
            </CardTitle>
            <CardDescription>
              Trigger an instant demo transaction (auto-processed in 30-90s)
            </CardDescription>
          </div>
          <Button
            onClick={triggerDemo}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Demo
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {(order || error) && (
        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  {error.includes('not seeded') && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Run <code className="bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded">npm run demo:seed</code> first
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {order && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border space-y-3">
                {/* Order ID and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">Order ID</p>
                    <p className="text-sm font-mono mt-0.5 break-all">{order.orderId}</p>
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                {/* Processing Time (if completed) */}
                {order.status === 'completed' && order.createdAt && order.estimatedCompletion && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Processing Time</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      ~{Math.ceil((new Date(order.estimatedCompletion).getTime() - new Date(order.createdAt).getTime()) / 1000)} seconds
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-lg font-semibold">
                    {order.fromAmount.toLocaleString()} {order.fromCurrency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    → {order.toAmount.toFixed(2)} {order.toCurrency}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +${order.bankMarkup.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">Bank</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        +${order.pspCommission.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">PSP</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Recipient Information
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="text-sm font-mono font-medium">6217003820001234567</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="text-sm font-medium">Beijing Trading Co., Ltd</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="text-sm font-medium">Bank of China (BOC)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <p className="text-sm font-mono font-medium">DEMO-PAY-{order.orderId.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Fulfillment & Settlement (when completed) */}
              {order.status === 'completed' && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-900 space-y-3">
                  <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase tracking-wide">
                    Fulfillment & Settlement
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300">PSP Assigned</p>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-50">
                        {order.fulfillment?.pspName || 'Thunes'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300">Method</p>
                      <p className="text-sm font-medium text-green-900 dark:text-green-50">
                        International Wire
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300 mb-1">Settlement Transaction</p>
                    <div className="bg-white/50 dark:bg-black/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <p className="text-xs font-mono text-green-900 dark:text-green-100 break-all">
                        {order.settlement?.txHash || `0.0.4887937@${Date.now()}`}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Network: {order.settlement?.network || 'hedera-testnet'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300 mb-1.5">Revenue Breakdown</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 dark:text-green-300">Bank Markup (0.20%)</span>
                        <span className="font-semibold text-green-900 dark:text-green-50">+${order.bankMarkup.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 dark:text-green-300">PSP Commission (0.30%)</span>
                        <span className="font-semibold text-green-900 dark:text-green-50">+${order.pspCommission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-green-200 dark:border-green-800">
                        <span className="text-green-600 dark:text-green-400">Platform Fee</span>
                        <span className="font-medium text-green-700 dark:text-green-300">${(order.bankMarkup + order.pspCommission).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {order.status === 'pending' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <Loader2 className="w-4 h-4 text-yellow-600 animate-spin flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Waiting for Virtual PSP Bot to assign PSP...
                  </p>
                </div>
              )}

              {order.status === 'processing' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    PSP processing payment (30-90 seconds)...
                  </p>
                </div>
              )}

              {order.status === 'completed' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Payment Completed!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Settlement recorded on Hedera testnet
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Demo transaction • Virtual PSP Bot auto-fulfillment
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
