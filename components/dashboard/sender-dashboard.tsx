'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoTriggerButton } from "@/components/demo/demo-trigger-button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  TrendingUp,
  Users,
  Globe,
  CreditCard,
  Zap
} from "lucide-react";


interface SenderDashboardProps {
  user?: any; // Pass user from parent to check if demo account
}

interface DashboardStats {
  totalVolume: { formatted: string; change: string; changeType: string };
  transactions: { formatted: string; last30Days: number; change: string; changeType: string };
  activeRoutes: { formatted: string; paycrestOrders: number; change: string; changeType: string };
  successRate: { formatted: string; completed: number; total: number; change: string; changeType: string };
}

export function SenderDashboard({ user }: SenderDashboardProps = {}) {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/v1/sender/stats');
        const result = await response.json();
        if (result.success) {
          setStatsData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Volume",
      value: loading ? "Loading..." : (statsData?.totalVolume.formatted || "$0.00"),
      change: statsData?.totalVolume.change || "+0%",
      changeType: statsData?.totalVolume.changeType || "positive",
      icon: DollarSign,
    },
    {
      title: "Transactions",
      value: loading ? "..." : (statsData?.transactions.formatted || "0"),
      change: statsData?.transactions.change || "+0",
      changeType: statsData?.transactions.changeType || "positive",
      icon: TrendingUp,
      subtitle: statsData ? `${statsData.transactions.last30Days} in last 30 days` : undefined,
    },
    {
      title: "Active Networks",
      value: loading ? "..." : (statsData?.activeRoutes.formatted || "0"),
      change: statsData?.activeRoutes.change || "+0",
      changeType: statsData?.activeRoutes.changeType || "positive",
      icon: Globe,
      subtitle: statsData && statsData.activeRoutes.paycrestOrders > 0 
        ? `${statsData.activeRoutes.paycrestOrders} Paycrest orders` 
        : undefined,
    },
    {
      title: "Success Rate",
      value: loading ? "..." : (statsData?.successRate.formatted || "0%"),
      change: statsData?.successRate.change || "+0%",
      changeType: statsData?.successRate.changeType || "positive",
      icon: Users,
      subtitle: statsData ? `${statsData.successRate.completed} / ${statsData.successRate.total} completed` : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Trigger Button - Only for Demo Accounts */}
      {user?.email?.includes('demo@') && (
        <DemoTriggerButton />
      )}
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtitle ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
              Stablecoin Off-Ramp ✨
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              NOW AVAILABLE
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Convert USDC/USDT to local fiat currency instantly. 
              Automated settlement in 1-2 minutes to 9 currencies.
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">NGN</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">KES</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">UGX</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">TZS</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">GHS</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">+4 more</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Create Off-Ramp Order
              </Button>
              <Button variant="outline" className="w-full" size="sm" asChild>
                <a href="/docs/api" target="_blank">
                  View API Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />
              Cross-Border Payments
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              COMING SOON WITH THUNES
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Traditional fiat-to-fiat corridors for banks. 
              Access 130+ countries with our Thunes partnership.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm" disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                Join Waitlist
              </Button>
              <Button variant="outline" className="w-full" size="sm" disabled>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Generate your API keys to start integrating
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate Keys
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Webhook Configuration</p>
                  <p className="text-sm text-muted-foreground">
                    Set up webhooks to receive transaction updates
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium">Test Transaction</p>
                  <p className="text-sm text-muted-foreground">
                    Run a test transaction to verify your integration
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Stablecoin Off-Ramp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Launch your stablecoin-to-fiat service in minutes. Perfect for crypto exchanges, 
              Web3 companies, and fintech platforms.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                ✨ What You Can Do
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Accept USDC/USDT from your users</li>
                <li>• Deliver fiat to bank accounts in 1-2 minutes</li>
                <li>• Support 9 African & global currencies</li>
                <li>• Earn revenue on every transaction</li>
              </ul>
            </div>
            
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Complete KYB verification (if not done)</li>
              <li>Generate your API keys in Settings → API Keys</li>
              <li>Review <a href="/docs/api" className="text-blue-600 underline">API documentation</a></li>
              <li>Add your webhook URL for status updates</li>
              <li>Test with sandbox environment (test API keys)</li>
              <li>Go live with production keys</li>
            </ol>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-800">
                <strong>Need Help?</strong> Check our <a href="/docs/quick-start" className="underline">Quick Start Guide</a> 
                or reach out to support@nedapay.com
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button asChild>
                <a href="/docs/api" target="_blank">
                  API Documentation
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/settings/api-keys">
                  Generate API Keys
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
