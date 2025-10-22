"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  ArrowRight,
  Clock,
  Zap,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Network,
  TrendingDown,
  CircleCheck,
  Coins,
  Plus
} from "lucide-react";

interface DashboardProps {
  user: User;
  profile: any | null;
  userRole?: string;
}

export function Dashboard({ user, userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const userName = user?.email?.split('@')[0] || 'User';
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [savingsData, setSavingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);

  // GIF rotation - str2 plays first, then loops through all
  const gifs = [
    "/str2.gif",
    "/str1.gif",
    "/NEDA pay stry.gif"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex((prev) => (prev + 1) % gifs.length);
    }, 5000); // Change GIF every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch multi-chain data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch network status
        const statusRes = await fetch('/api/networks/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setNetworkStatus(statusData.data);
        }

        // Fetch savings data
        const savingsRes = await fetch('/api/analytics/savings?period=30d');
        if (savingsRes.ok) {
          const savingsData = await savingsRes.json();
          setSavingsData(savingsData.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Role-specific stats
  const getStatsForRole = () => {
    if (userRole === 'provider' || userRole === 'psp') {
      return [
        {
          title: "Total Liquidity",
          value: "$0.00",
          subtitle: "Available funds",
          icon: Wallet,
          color: "bg-purple-50 dark:bg-purple-950/20",
          iconColor: "text-purple-600 dark:text-purple-400"
        },
        {
          title: "Earnings",
          value: "$0.00",
          subtitle: "Commission earned",
          icon: TrendingDown,
          color: "bg-green-50 dark:bg-green-950/20",
          iconColor: "text-green-600 dark:text-green-400"
        },
        {
          title: "Orders Fulfilled",
          value: "0",
          subtitle: "Last 30 days",
          icon: Activity,
          color: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "text-blue-600 dark:text-blue-400"
        }
      ];
    } else if (userRole === 'sender' || userRole === 'bank') {
      return [
        {
          title: "Total Sent",
          value: "$0.00",
          subtitle: "Last 30 days",
          icon: ArrowUpRight,
          color: "bg-orange-50 dark:bg-orange-950/20",
          iconColor: "text-orange-600 dark:text-orange-400"
        },
        {
          title: "Active Orders",
          value: "0",
          subtitle: "Pending payments",
          icon: Clock,
          color: "bg-yellow-50 dark:bg-yellow-950/20",
          iconColor: "text-yellow-600 dark:text-yellow-400"
        },
        {
          title: "Revenue",
          value: "$0.00",
          subtitle: "Markup earned",
          icon: TrendingDown,
          color: "bg-green-50 dark:bg-green-950/20",
          iconColor: "text-green-600 dark:text-green-400"
        }
      ];
    }
    // Default stats for generic users
    return [
      {
        title: "Total Transactions",
        value: savingsData?.savings?.totalTransactions?.toString() || "0",
        subtitle: "Last 30 days",
        icon: BarChart3,
        color: "bg-muted/50",
        iconColor: "text-muted-foreground"
      },
      {
        title: "Cost Savings",
        value: savingsData?.savings?.savings ? `$${savingsData.savings.savings.toFixed(2)}` : "$0.00",
        subtitle: "Last 30 days",
        icon: TrendingDown,
        color: "bg-green-50 dark:bg-green-950/20",
        iconColor: "text-green-600 dark:text-green-400"
      },
      {
        title: "Networks Active",
        value: networkStatus?.count?.toString() || "0",
        subtitle: "Multi-chain ready",
        icon: Network,
        color: "bg-blue-50 dark:bg-blue-950/20",
        iconColor: "text-blue-600 dark:text-blue-400"
      }
    ];
  };

  const stats = getStatsForRole();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.02em' }}>
                Hello, {userName}
              </h1>
              <p className="text-base text-muted-foreground mt-2">
                Welcome to your dashboard
              </p>
            </div>
            <Button 
              className="h-12 px-7 text-sm font-bold rounded-xl shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 relative overflow-hidden group"
              onClick={() => window.location.href = '/protected/settings'}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Zap className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Manage API Keys</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-muted/50 dark:bg-muted/20 p-1.5 rounded-xl border border-border/50 inline-flex">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all px-6"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="transactions"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all px-6"
              >
                Transaction History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Multi-Chain Status Banner */}
            {networkStatus && (
              <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                        <CircleCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Multi-Chain Active</h3>
                        <p className="text-sm text-muted-foreground">Hedera + Base networks operational</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {networkStatus.networks?.map((network: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${network.available ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                          <span className="text-sm font-medium text-foreground capitalize">{network.network.replace('-', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Section */}
            <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">Stats</CardTitle>
                  <p className="text-sm text-muted-foreground">Real-time overview</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="group relative">
                      {/* Separator line (not on last item) */}
                      {index < stats.length - 1 && (
                        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-20 w-px bg-border/50"></div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center border border-border/50 flex-shrink-0`}>
                          <stat.icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{stat.title}</p>
                          <p className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Savings Breakdown */}
            {savingsData && savingsData.savings.totalTransactions > 0 && (
              <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Cost Savings (30 Days)</CardTitle>
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">99.67% cheaper</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Hedera Transactions</p>
                      <p className="text-2xl font-black text-foreground">{savingsData.savings.hederaTransactions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Base Transactions</p>
                      <p className="text-2xl font-black text-foreground">{savingsData.savings.baseTransactions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Actual Cost</p>
                      <p className="text-2xl font-black text-foreground">${savingsData.savings.actualCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">You Saved</p>
                      <p className="text-2xl font-black text-green-600 dark:text-green-400">${savingsData.savings.savings.toFixed(2)}</p>
                    </div>
                  </div>
                  {savingsData.projection && (
                    <div className="mt-6 pt-6 border-t border-border/30">
                      <p className="text-sm text-muted-foreground mb-2">Projected annual savings: <span className="font-semibold text-green-600 dark:text-green-400">${savingsData.projection.projectedAnnual.toFixed(2)}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Network Performance */}
            {savingsData && savingsData.networkStats && savingsData.networkStats.length > 0 && (
              <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Network Performance</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors">
                      See details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {savingsData.networkStats.map((stat: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground capitalize">{stat.network.replace('-', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{stat.transactionCount} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">${stat.averageFee.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">avg fee</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multi-Chain APIs - Simplified */}
            <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Visual */}
                  <div className="w-full md:w-2/5">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2 border border-white/20 dark:border-white/10 shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/10">
                      <img 
                        src={gifs[currentGifIndex]} 
                        alt="Multi-chain payments" 
                        className="w-full h-full object-contain transition-opacity duration-500"
                      />
                    </div>
                  </div>
                  
                  {/* Content - Role Specific */}
                  <div className="flex-1 text-center md:text-left">
                    {(userRole === 'provider' || userRole === 'psp') ? (
                      // Provider view
                      <>
                        <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
                          Provide Liquidity, Earn Fees
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-lg md:mx-0 mx-auto">
                          Deposit funds to fulfill cross-border payments. Earn commission on every transaction you facilitate.
                        </p>
                        
                        {/* Quick Features */}
                        <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Multi-Currency Support</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Automated Fulfillment</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Earn APY</span>
                          </div>
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white border-0 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.location.href = '/protected/settings'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Plus className="w-5 h-5 mr-2.5 relative z-10" strokeWidth={3} />
                            <span className="relative z-10">Add Liquidity</span>
                          </Button>
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 hover:from-slate-700/90 hover:via-slate-800/90 hover:to-black/90 text-white border border-white/20 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.location.href = '/protected/settings'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Network className="w-5 h-5 mr-2.5 relative z-10" />
                            <span className="relative z-10">Configure Node</span>
                          </Button>
                        </div>
                      </>
                    ) : (userRole === 'sender' || userRole === 'bank') ? (
                      // Sender view
                      <>
                        <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
                          Send Cross-Border Payments
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-lg md:mx-0 mx-auto">
                          Submit payment orders instantly. Earn markup on every transaction your customers make.
                        </p>
                        
                        {/* Quick Features */}
                        <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Instant Settlement</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Competitive Rates</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">White-Label Ready</span>
                          </div>
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 text-white border-0 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.location.href = '/protected/settings'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <ArrowUpRight className="w-5 h-5 mr-2.5 relative z-10" />
                            <span className="relative z-10">Send Payment</span>
                          </Button>
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 hover:from-slate-700/90 hover:via-slate-800/90 hover:to-black/90 text-white border border-white/20 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.location.href = '/protected/settings'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Activity className="w-5 h-5 mr-2.5 relative z-10" />
                            <span className="relative z-10">View Orders</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Generic view (for non-role users)
                      <>
                        <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
                          Multi-Chain Payment APIs
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-lg md:mx-0 mx-auto">
                          Send payments across Hedera and Base networks. Automatic routing saves you 99.67% on fees.
                        </p>
                        
                        {/* Quick Features */}
                        <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Auto Network Selection</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Cost Optimization</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs text-foreground">Real-time Analytics</span>
                          </div>
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white border-0 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.location.href = '/protected/settings'}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Zap className="w-5 h-5 mr-2.5 relative z-10" />
                            <span className="relative z-10">Start Building</span>
                          </Button>
                          <Button 
                            className="h-14 px-8 text-base font-bold rounded-2xl shadow-2xl hover:shadow-slate-500/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 hover:from-slate-700/90 hover:via-slate-800/90 hover:to-black/90 text-white border border-white/20 backdrop-blur-xl relative overflow-hidden group"
                            onClick={() => window.open('https://apinedapay.vercel.app/', '_blank')}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10">Documentation</span>
                            <ArrowRight className="w-5 h-5 ml-2.5 relative z-10" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">No Transactions Yet</h3>
                  <p className="text-base text-muted-foreground">
                    Your transaction history will appear here once you start using our API services.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                <CardTitle className="text-xl font-semibold">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Documentation Available</h3>
                  <p className="text-base text-muted-foreground mb-8">
                    Explore our comprehensive API documentation and integration guides.
                  </p>
                  <Button 
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={() => window.open('https://apinedapay.vercel.app/', '_blank')}
                  >
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
