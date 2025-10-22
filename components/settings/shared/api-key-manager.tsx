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
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ApiKeyManagerProps {
  user: User;
  apiKeys: ApiKey[];
}

export function ApiKeyManager({ user, apiKeys: initialApiKeys }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<{ key: string; secret: string } | null>(null);
  const supabase = createClient();

  const generateApiKey = () => {
    const prefix = 'neda_';
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomPart;
  };

  const generateApiSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hashSecret = async (secret: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    // Check if user has reached the limit
    if (apiKeys.length >= 10) {
      toast.error("You have reached the maximum limit of 10 API keys");
      return;
    }

    // Check for duplicate names
    if (apiKeys.some(key => (key as any).key_name?.toLowerCase() === newKeyName.trim().toLowerCase())) {
      toast.error("An API key with this name already exists");
      return;
    }

    setIsCreating(true);
    try {
      const apiKey = generateApiKey();
      const apiSecret = generateApiSecret();
      const secretHash = await hashSecret(apiSecret);

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: newKeyName.trim(),
          api_key: apiKey,
          api_secret_hash: secretHash,
          permissions: {
            transactions: { read: true, write: true },
            profile: { read: true, write: false },
            api_keys: { read: true, write: false, delete: false },
            webhooks: { read: true, write: true }
          }
        })
        .select()
        .single();

      if (error) throw error;

      setApiKeys([data, ...apiKeys]);
      setNewApiKey({ key: apiKey, secret: apiSecret });
      setNewKeyName("");
      toast.success("API key created successfully");
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success("API key deleted successfully");
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error("Failed to delete API key");
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

  return (
    <div className="space-y-6">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={apiKeys.length >= 10} className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                  {apiKeys.length >= 8 && (
                    <span className="ml-2 text-xs">
                      ({apiKeys.length}/10)
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to access the NedaPay platform programmatically. You can create multiple keys for different environments (development, staging, production) or applications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
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
              <div>
                <Label>API Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newApiKey.secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newApiKey.secret, "API Secret")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
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
              <Button variant="outline" className="h-10 px-5 rounded-xl border-border/50 hover:bg-muted/40 transition-all" onClick={() => window.location.href = '/protected/docs'}>
                View API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
