"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { ApiKey } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// Shared components (used by both senders and providers)
import { ApiKeyManager, ProfileSettings } from "./shared";

// Sender-specific components
import { SenderTradingConfigurations, SenderServerConfigurations } from "./sender";

// Provider-specific components
import { ProviderLiquidityConfigurations } from "./provider";
import { 
  User as UserIcon, 
  Key, 
  Bell, 
  Shield,
  TrendingUp,
  Server
} from "lucide-react";

interface SettingsPageProps {
  user: User;
  profile: any | null;
  apiKeys: ApiKey[];
}

export function SettingsPage({ user, profile, apiKeys }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [currentProfile, setCurrentProfile] = useState<"sender" | "provider">("sender");

  useEffect(() => {
    // Get current profile from localStorage or user metadata
    const savedProfile = localStorage.getItem("activeProfile") as "sender" | "provider";
    if (savedProfile) {
      setCurrentProfile(savedProfile);
    }
  }, []);

  useEffect(() => {
    // Handle tab switching when profile changes
    if (currentProfile === "provider") {
      // If provider is on sender-only tabs, redirect to profile
      if (activeTab === "server" || activeTab === "trading") {
        setActiveTab("profile");
      }
    } else if (currentProfile === "sender") {
      // If sender is on provider tab, redirect to trading
      if (activeTab === "provider") {
        setActiveTab("trading");
      }
    }
  }, [currentProfile, activeTab]);

  return (
    <div className="flex-1 p-8 md:p-10">
      <div className="space-y-3 mb-8">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.03em' }}>
          Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your account settings and API configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2 sticky top-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "profile"
                  ? "bg-[#6366F1] text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </button>
            
            {currentProfile === "sender" ? (
              <button
                onClick={() => setActiveTab("trading")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "trading"
                    ? "bg-[#6366F1] text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Trading</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("provider")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "provider"
                    ? "bg-[#6366F1] text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Provider</span>
              </button>
            )}
            
            {currentProfile === "sender" && (
              <button
                onClick={() => setActiveTab("server")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "server"
                    ? "bg-[#6366F1] text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Server className="h-5 w-5" />
                <span className="font-medium">Server</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab("api-keys")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "api-keys"
                  ? "bg-[#6366F1] text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Key className="h-5 w-5" />
              <span className="font-medium">API Keys</span>
            </button>
            
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "notifications"
                  ? "bg-[#6366F1] text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Bell className="h-5 w-5" />
              <span className="font-medium">Notifications</span>
            </button>
            
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "security"
                  ? "bg-[#6366F1] text-white shadow-lg"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Security</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">

        {/* Shared Settings - Available to both senders and providers */}
        <TabsContent value="profile" className="space-y-8 mt-0">
          <ProfileSettings user={user} profile={profile} />
        </TabsContent>

        {/* Sender-Only Settings */}
        {currentProfile === "sender" && (
          <TabsContent value="trading" className="space-y-8 mt-0">
            <SenderTradingConfigurations />
          </TabsContent>
        )}

        {currentProfile === "sender" && (
          <TabsContent value="server" className="space-y-8 mt-0">
            <SenderServerConfigurations userId={user.id} />
          </TabsContent>
        )}

        {/* Provider-Only Settings */}
        {currentProfile === "provider" && (
          <TabsContent value="provider" className="space-y-8 mt-0">
            <ProviderLiquidityConfigurations userId={user.id} />
          </TabsContent>
        )}

        {/* Shared Settings - Available to both senders and providers */}
        <TabsContent value="api-keys" className="space-y-8 mt-0">
          <ApiKeyManager user={user} apiKeys={apiKeys} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-base">Notification settings will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-base">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-base">Password</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Change your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4 rounded-lg">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-base">Login History</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      View recent login activity
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4 rounded-lg">
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
