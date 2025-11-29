"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { ApiKey } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// Shared components (used by both senders and providers)
import { ApiKeyManager, ProfileSettings } from "./shared";
import { ChangePasswordDialog } from "./shared/change-password-dialog";
import { LoginHistoryDialog } from "./shared/login-history-dialog";

// Sender-specific components
import { SenderServerConfigurations, RevenueSettings } from "./sender";

// Provider-specific components
import { ProviderLiquidityConfigurations } from "./provider";
import { 
  User as UserIcon, 
  Key, 
  Bell, 
  Shield,
  TrendingUp,
  Server,
  DollarSign
} from "lucide-react";

interface SettingsPageProps {
  user: User;
  profile: any | null;
  apiKeys: ApiKey[];
  kybStatus: string;
}

export function SettingsPage({ user, profile, apiKeys, kybStatus }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  // Get user role from profile, metadata, or scope field (single role now)
  const userRole = user.user_metadata?.role || profile?.role || (user as any).scope?.toLowerCase() || 'sender';
  const isSender = userRole === 'sender' || userRole === 'bank';
  const isProvider = userRole === 'provider' || userRole === 'psp';
  
  // Debug log
  console.log('Settings Page - User Role:', userRole, 'isSender:', isSender, 'isProvider:', isProvider);

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
            
            {isSender ? (
              <button
                onClick={() => setActiveTab("revenue")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "revenue"
                    ? "bg-[#6366F1] text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Revenue</span>
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
            
            {isSender && (
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
        {isSender && (
          <TabsContent value="revenue" className="space-y-8 mt-0">
            <RevenueSettings userId={user.id} />
          </TabsContent>
        )}

        {isSender && (
          <TabsContent value="server" className="space-y-8 mt-0">
            <SenderServerConfigurations userId={user.id} />
          </TabsContent>
        )}

        {/* Provider-Only Settings */}
        {isProvider && (
          <TabsContent value="provider" className="space-y-8 mt-0">
            <ProviderLiquidityConfigurations userId={user.id} />
          </TabsContent>
        )}

        {/* Shared Settings - Available to both senders and providers */}
        <TabsContent value="api-keys" className="space-y-8 mt-0">
          <ApiKeyManager user={user} apiKeys={apiKeys} kybStatus={kybStatus} />
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4 rounded-lg"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4 rounded-lg"
                    onClick={() => setIsHistoryDialogOpen(true)}
                  >
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>

      {/* Security Dialogs */}
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        userId={user.id}
      />
      
      <LoginHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        userId={user.id}
      />
    </div>
  );
}
