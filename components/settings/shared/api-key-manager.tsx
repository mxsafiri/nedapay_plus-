"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { ApiKey } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2,
  Calendar,
  Activity,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface ApiKeyManagerProps {
  user: User;
  apiKeys: ApiKey[];
  kybStatus: string;
}

export function ApiKeyManager({ user, apiKeys: initialApiKeys, kybStatus }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isTestMode, setIsTestMode] = useState(true); // Default to test mode
  const [newApiKey, setNewApiKey] = useState<{ key: string; type: string } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating API key:', { keyName: newKeyName, isTest: isTestMode });
      
      const response = await fetch('/api/generate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          keyName: newKeyName.trim(),
          isTest: isTestMode,
          regenerate: true, // Allow regeneration if key exists
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API key creation failed:', error);
        throw new Error(error.error || 'Failed to create API key');
      }

      const data = await response.json();
      
      // Refresh API keys list
      const refreshResponse = await fetch('/api/generate-api-key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.hasApiKey) {
          // Add the new key to the list (we won't show the actual key value again)
          setApiKeys([...apiKeys, refreshData.keyInfo]);
        }
      }

      setNewApiKey({ key: data.apiKey, type: data.type });
      setNewKeyName("");
      setCreateDialogOpen(false); // Close create dialog
      toast.success("API key created successfully! Make sure to copy it now.");
      console.log('API key created:', { orderId: data.keyId, type: data.type });
    } catch (error) {
      console.error('Error creating API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create API key';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/generate-api-key', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete API key');
      }

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success("API key deleted successfully");
    } catch (error) {
      console.error('Error deleting API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete API key';
      toast.error(errorMessage);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isVerified = kybStatus === 'verified';
  const isPending = kybStatus === 'pending';

  const getStatusBanner = () => {
    if (isVerified) return null;

    const statusConfig = {
      'not_started': {
        title: 'KYB Verification Required',
        message: 'Please submit your KYB documents to create API keys.',
        color: 'amber',
        link: '/protected/settings'
      },
      'pending': {
        title: 'KYB Verification Pending',
        message: 'Your documents are under review. API key creation will be enabled once approved.',
        color: 'blue',
        link: null
      },
      'rejected': {
        title: 'KYB Verification Rejected',
        message: 'Please resubmit your documents or contact support.',
        color: 'red',
        link: '/protected/settings'
      }
    };

    const config = statusConfig[kybStatus as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <div className={`mb-6 p-4 bg-${config.color}-50 dark:bg-${config.color}-950/20 border border-${config.color}-200 dark:border-${config.color}-800 rounded-xl`}>
        <div className="flex items-start gap-3">
          <Shield className={`h-5 w-5 text-${config.color}-600 mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <h4 className={`font-semibold text-${config.color}-900 dark:text-${config.color}-100`}>{config.title}</h4>
            <p className={`text-sm text-${config.color}-700 dark:text-${config.color}-300 mt-1`}>{config.message}</p>
            {config.link && (
              <a href={config.link} className={`text-sm font-medium text-${config.color}-600 hover:underline mt-2 inline-block`}>
                {kybStatus === 'not_started' ? 'Submit Documents →' : 'Resubmit Documents →'}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {getStatusBanner()}
      
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  API Keys
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your API keys for accessing the NedaPay platform programmatically. You can create multiple API keys for different environments or applications.
                </p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!isVerified}
                  className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isVerified ? 'KYB verification required' : undefined}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to access the NedaPay platform programmatically. Use test keys for development and live keys for production.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Development Test Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose a descriptive name to identify this key
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="testMode"
                      checked={isTestMode}
                      onChange={(e) => setIsTestMode(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor="testMode" className="text-sm font-medium cursor-pointer">
                        Test Mode (Sandbox)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isTestMode ? 'Creates np_test_* key for safe testing' : 'Creates np_live_* key for production'}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createApiKey}
                    disabled={isCreating || !newKeyName.trim()}
                  >
                    {isCreating ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">No API keys yet</p>
              <p className="text-base mb-6">
                Create your first API key to start integrating with the NedaPay platform.
              </p>
              <div className="max-w-xl mx-auto p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                <h4 className="font-bold text-base mb-3">Getting Started</h4>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Create separate API keys for different environments</li>
                  <li>• Use descriptive names like &quot;Production&quot;, &quot;Development&quot;, &quot;Mobile App&quot;</li>
                  <li>• Store your API secret securely - it won&apos;t be shown again</li>
                  <li>• You can create multiple API keys as needed</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-muted/40 border border-border/30 rounded-xl p-5 space-y-4 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                      <div>
                        <p className="font-semibold text-base">{(apiKey as any).key_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {formatDate((apiKey as any).created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={(apiKey as any).is_active ? "default" : "secondary"} className="rounded-lg">
                        {(apiKey as any).is_active ? "Active" : "Inactive"}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API Key</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={(apiKey as any).api_key}
                          readOnly
                          className="font-mono text-sm bg-background/50 rounded-lg h-11"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard((apiKey as any).api_key, "API Key")}
                          className="h-11 px-4 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Last used: {(apiKey as any).last_used_at ? formatDate((apiKey as any).last_used_at) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New API Key Dialog */}
      {newApiKey && (
        <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Created Successfully</DialogTitle>
              <DialogDescription>
                Please copy and store these credentials securely. The secret will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newApiKey.key}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newApiKey.key, "API Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Important: This API key will only be shown once. Make sure to copy and store it securely.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewApiKey(null)}>
                I&apos;ve Saved These Credentials
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* API Usage Information */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">
              API Usage & Limits
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-base mb-4">Current Plan Limits</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground">API Keys</span>
                  <span className="font-semibold">{apiKeys.length}/10</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground">Requests per month</span>
                  <span className="font-semibold text-muted-foreground">Coming Soon</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                  <span className="text-muted-foreground">Rate limit</span>
                  <span className="font-semibold text-muted-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Quick Start</h4>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <p>1. Create an API key with a descriptive name</p>
                <p>2. Copy both the API key and secret</p>
                <p>3. Store them securely in your application</p>
                <p>4. Use them to authenticate API requests</p>
              </div>
              <Button variant="outline" className="h-10 px-5 rounded-xl border-border/50 hover:bg-muted/40 transition-all" onClick={() => window.location.href = '/protected/docs-v2'}>
                View API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
