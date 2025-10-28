"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  TrendingUp
} from 'lucide-react';

interface SettlementStatus {
  summary: {
    pendingCount: number;
    pendingAmount: number;
    failedCount: number;
    todayCount: number;
    todayAmount: number;
    successRate: number;
    needsAttention: boolean;
  };
  pendingByProvider: Array<{
    providerId: string;
    providerName: string;
    orderCount: number;
    totalAmount: number;
    orders: Array<{
      orderId: string;
      amount: number;
      updatedAt: string;
    }>;
  }>;
  failedSettlements: Array<{
    orderId: string;
    providerName: string;
    amount: number;
    failedAt: string;
  }>;
  recentSettlements: Array<{
    orderId: string;
    providerName: string;
    amount: number;
    txHash: string | null;
    settledAt: string | null;
  }>;
}

export default function SettlementsPage() {
  const [status, setStatus] = useState<SettlementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/settlements/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      } else {
        toast.error('Failed to fetch settlement status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Error loading settlement data');
    } finally {
      setLoading(false);
    }
  };

  const retrySettlement = async (orderId: string) => {
    setRetrying(orderId);
    try {
      const response = await fetch('/api/admin/settlements/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Settlement completed: ${data.data.amount} USDC`);
        fetchStatus(); // Refresh data
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry settlement');
    } finally {
      setRetrying(null);
    }
  };

  const retryAll = async () => {
    setRetrying('all');
    try {
      const response = await fetch('/api/admin/settlements/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retryAll: true })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Batch complete: ${data.results.succeeded} succeeded, ${data.results.failed} failed`);
        fetchStatus(); // Refresh data
      } else {
        toast.error('Batch settlement failed');
      }
    } catch (error) {
      console.error('Batch retry error:', error);
      toast.error('Failed to run batch settlement');
    } finally {
      setRetrying(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settlement status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load settlement data</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settlement Operations</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage USDC settlements to providers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {status.summary.pendingCount > 0 && (
            <Button 
              onClick={retryAll}
              disabled={retrying === 'all'}
            >
              {retrying === 'all' ? 'Processing...' : 'Run Settlements'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {status.summary.needsAttention && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Attention Required
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                  {status.summary.failedCount > 0 && (
                    <span>{status.summary.failedCount} failed settlements need retry. </span>
                  )}
                  {status.summary.pendingCount > 10 && (
                    <span>{status.summary.pendingCount} pending settlements (high volume).</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Settlements
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${status.summary.pendingAmount.toFixed(2)} USDC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Settlements
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {status.summary.failedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need manual review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Settlements
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.todayCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${status.summary.todayAmount.toFixed(2)} USDC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate (7d)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.summary.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending by Provider */}
      {status.pendingByProvider.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending by Provider</CardTitle>
            <CardDescription>
              Settlements waiting to be processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status.pendingByProvider.map((provider) => (
                <div key={provider.providerId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{provider.providerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.orderCount} orders • ${provider.totalAmount.toFixed(2)} USDC
                    </p>
                  </div>
                  <Badge variant="outline">{provider.orderCount} pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Settlements */}
      {status.failedSettlements.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Failed Settlements
            </CardTitle>
            <CardDescription>
              Require manual intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.failedSettlements.map((settlement) => (
                <div key={settlement.orderId} className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{settlement.providerName}</h3>
                      <Badge variant="destructive">Failed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Order: {settlement.orderId.substring(0, 8)}... • 
                      ${settlement.amount.toFixed(2)} USDC • 
                      Failed: {new Date(settlement.failedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retrySettlement(settlement.orderId)}
                    disabled={retrying === settlement.orderId}
                  >
                    {retrying === settlement.orderId ? 'Retrying...' : 'Retry'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Settlements</CardTitle>
          <CardDescription>
            Last 10 completed settlements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.recentSettlements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No settlements yet today
              </p>
            ) : (
              status.recentSettlements.map((settlement) => (
                <div key={settlement.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{settlement.providerName}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Settled
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${settlement.amount.toFixed(2)} USDC •
                      {settlement.settledAt && ` ${new Date(settlement.settledAt).toLocaleString()}`}
                    </p>
                  </div>
                  {settlement.txHash && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`https://hashscan.io/testnet/transaction/${settlement.txHash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
