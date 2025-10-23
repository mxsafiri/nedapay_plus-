"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  ArrowUpRight,
  Download,
  Settings,
  Sparkles,
  Clock,
  Activity
} from "lucide-react";
import { useAuth } from "@/lib/data";
import { toast } from "sonner";

interface RevenueSettingsProps {
  userId?: string;
}

export function RevenueSettings({ userId }: RevenueSettingsProps) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [markupPercentage, setMarkupPercentage] = useState(0.2); // 0.2%
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  useEffect(() => {
    if (effectiveUserId) {
      fetchRevenueData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  useEffect(() => {
    // Calculate estimated monthly earnings based on markup
    if (revenueData?.avgMonthlyVolume) {
      const estimated = (revenueData.avgMonthlyVolume * markupPercentage) / 100;
      setEstimatedEarnings(estimated);
    }
  }, [markupPercentage, revenueData]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sender-profile?userId=${effectiveUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.senderProfile;
        
        setRevenueData({
          monthlyEarnings: profile?.monthly_earnings || 0,
          totalEarnings: profile?.total_earnings || 0,
          transactionCount: profile?.transaction_count || 0,
          avgTransactionValue: profile?.avg_transaction_value || 0,
          avgMonthlyVolume: profile?.avg_monthly_volume || 50000, // Default estimate
          currentMarkup: profile?.markup_percentage || 0.002,
          subscriptionTier: profile?.subscription_tier || 'free',
          nextBilling: profile?.next_billing_date,
        });
        
        setMarkupPercentage((profile?.markup_percentage || 0.002) * 100); // Convert to percentage
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarkup = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/sender-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          markupPercentage: markupPercentage / 100, // Convert back to decimal
        }),
      });

      if (response.ok) {
        toast.success('Markup percentage updated successfully!');
        await fetchRevenueData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update markup');
      }
    } catch (error) {
      console.error('Error updating markup:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update markup');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, any> = {
      free: { 
        name: 'Free', 
        cost: 0, 
        maxMarkup: 0.2,
        color: 'bg-gray-100 text-gray-800'
      },
      basic: { 
        name: 'Basic', 
        cost: 50, 
        maxMarkup: 0.3,
        color: 'bg-blue-100 text-blue-800'
      },
      premium: { 
        name: 'Premium', 
        cost: 100, 
        maxMarkup: 0.5,
        color: 'bg-purple-100 text-purple-800'
      },
      enterprise: { 
        name: 'Enterprise', 
        cost: 250, 
        maxMarkup: 1.0,
        color: 'bg-amber-100 text-amber-800'
      },
    };
    return tiers[tier] || tiers.free;
  };

  const currentTier = getTierInfo(revenueData?.subscriptionTier || 'free');
  const maxMarkup = currentTier.maxMarkup;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15%
              </Badge>
            </div>
            <p className="text-sm text-white/80 mb-1">Monthly Earnings</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(revenueData?.monthlyEarnings || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/80 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(revenueData?.totalEarnings || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/80 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-white">
              {(revenueData?.transactionCount || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/80 mb-1">Avg Transaction</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(revenueData?.avgTransactionValue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Markup Configuration */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Markup Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Your Markup Percentage</Label>
              <Badge className={currentTier.color}>
                {currentTier.name} Plan
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  {markupPercentage.toFixed(2)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Max: {maxMarkup}%
                </span>
              </div>
              
              <Slider
                value={[markupPercentage]}
                onValueChange={(value: number[]) => setMarkupPercentage(value[0])}
                min={0.1}
                max={maxMarkup}
                step={0.05}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1%</span>
                <span>{maxMarkup}%</span>
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Estimated Monthly Earnings at {markupPercentage.toFixed(2)}%:</strong>
                <span className="block text-2xl font-bold text-primary mt-2">
                  {formatCurrency(estimatedEarnings)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Based on average monthly volume of {formatCurrency(revenueData?.avgMonthlyVolume || 0)}
                </span>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleUpdateMarkup} 
              disabled={saving || markupPercentage === (revenueData?.currentMarkup * 100)}
              className="w-full"
            >
              {saving ? 'Updating...' : 'Update Markup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            Subscription & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <p className="text-xl font-bold">{currentTier.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
              <p className="text-xl font-bold">{formatCurrency(currentTier.cost)}</p>
            </div>
          </div>

          {revenueData?.nextBilling && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Next billing: {new Date(revenueData.nextBilling).toLocaleDateString()}</span>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Plan Benefits:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="p-0.5 bg-green-100 dark:bg-green-900 rounded-full mt-0.5">
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full" />
                </div>
                <span className="text-sm">Higher markup limit ({maxMarkup}%)</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-0.5 bg-green-100 dark:bg-green-900 rounded-full mt-0.5">
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full" />
                </div>
                <span className="text-sm">Priority customer support</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-0.5 bg-green-100 dark:bg-green-900 rounded-full mt-0.5">
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full" />
                </div>
                <span className="text-sm">Advanced webhook configurations</span>
              </div>
              {currentTier.name !== 'Free' && (
                <div className="flex items-start gap-2">
                  <div className="p-0.5 bg-green-100 dark:bg-green-900 rounded-full mt-0.5">
                    <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full" />
                  </div>
                  <span className="text-sm">Dedicated account manager</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Billing History
            </Button>
            {currentTier.name !== 'Enterprise' && (
              <Button className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
