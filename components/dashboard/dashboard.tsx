"use client";

import { useState } from "react";
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
  BarChart3
} from "lucide-react";

interface DashboardProps {
  user: User;
  profile: any | null;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const userName = user?.email?.split('@')[0] || 'User';

  const stats = [
    {
      title: "Total Transactions",
      value: "0",
      subtitle: "All time",
      icon: BarChart3,
      color: "bg-muted/50",
      iconColor: "text-muted-foreground"
    },
    {
      title: "Total Volume",
      value: "$0.00",
      subtitle: "All time",
      icon: Wallet,
      color: "bg-muted/50",
      iconColor: "text-muted-foreground"
    },
    {
      title: "Success Rate",
      value: "0%",
      subtitle: "Last 30 days",
      icon: ArrowUpRight,
      color: "bg-muted/50",
      iconColor: "text-muted-foreground"
    }
  ];

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
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              onClick={() => window.location.href = '/protected/settings'}
            >
              <Zap className="w-4 h-4 mr-2" />
              Manage API Keys
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

            {/* Coming Soon Section */}
            <Card className="border border-border/50 shadow-xl backdrop-blur-sm bg-background/95 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 bg-muted/20 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">API Services</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors">
                    See all <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">API Services Coming Soon</h3>
                  <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                    We&apos;re working hard to bring you powerful payment APIs. 
                    Stay tuned for onramp and offramp transaction capabilities.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                      Get Notified
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-11 px-6 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                      onClick={() => window.open('https://apinedapay.vercel.app/', '_blank')}
                    >
                      View Documentation
                    </Button>
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
