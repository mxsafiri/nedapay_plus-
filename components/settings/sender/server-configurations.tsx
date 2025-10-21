"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Server, Webhook, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { useSenderServerConfigurations, useMutation, useAuth } from "@/lib/data";

interface ServerConfigurationsProps {
  userId?: string;
}

interface ServerConfig {
  webhookEnabled: boolean;
  webhookUrl: string;
  domainWhitelist: string[];
}

export function SenderServerConfigurations({ userId }: ServerConfigurationsProps) {
  const [domainInput, setDomainInput] = useState("");
  const [localConfig, setLocalConfig] = useState<ServerConfig>({
    webhookEnabled: false,
    webhookUrl: "",
    domainWhitelist: []
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user } = useAuth();
  const effectiveUserId = userId || user?.id || '';

  // Use the new data management system
  const { data: serverConfig, loading, error, refetch } = useSenderServerConfigurations(effectiveUserId);

  // Update local state when server data changes
  useEffect(() => {
    if (serverConfig) {
      const config = serverConfig as any;
      setLocalConfig({
        webhookEnabled: config.webhookEnabled || false,
        webhookUrl: config.webhookUrl || "",
        domainWhitelist: config.domainWhitelist || []
      });
      setDomainInput((config.domainWhitelist || []).join('\n'));
    }
  }, [serverConfig]);

  // Mutation for updating server configurations
  const { mutate: updateConfig, loading: saving } = useMutation(
    async (configData: any) => {
      const response = await fetch('/api/server-configurations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update configurations');
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Server configurations updated successfully!' });
        refetch(); // Refresh data
      },
      onError: (error) => {
        setMessage({ type: 'error', text: error.message });
      },
      invalidateKeys: [`sender-server-${effectiveUserId}`]
    }
  );

  const handleSave = async () => {
    try {
      setMessage(null);

      // Parse domain whitelist
      const domains = domainInput
        .split('\n')
        .map(domain => domain.trim())
        .filter(domain => domain.length > 0);

      await updateConfig({
        userId: effectiveUserId,
        webhookEnabled: localConfig.webhookEnabled,
        webhookUrl: localConfig.webhookUrl,
        domainWhitelist: domains
      });
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    if (serverConfig) {
      const config = serverConfig as any;
      setLocalConfig({
        webhookEnabled: config.webhookEnabled || false,
        webhookUrl: config.webhookUrl || "",
        domainWhitelist: config.domainWhitelist || []
      });
      setDomainInput((config.domainWhitelist || []).join('\n'));
    }
    setMessage(null);
  };

  if (loading && !serverConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Sender Server Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Server className="h-5 w-5" />
          Sender Server Configurations
        </CardTitle>
        <p className="text-xs text-muted-foreground md:text-sm">
          Configure webhook notifications and domain whitelist for your sender profile.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load server configurations</AlertDescription>
          </Alert>
        )}

        {/* Webhook Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                <Label htmlFor="webhook-enabled" className="text-base font-medium">
                  Enable webhook notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Webhook is retried exponentially within 24 hours.
              </p>
            </div>
            <Switch
              id="webhook-enabled"
              checked={localConfig.webhookEnabled}
              onCheckedChange={(checked: boolean) => 
                setLocalConfig(prev => ({ ...prev, webhookEnabled: checked }))
              }
            />
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook URL
            </Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://nedapay.xyz/api/paycrest/webhook"
              value={localConfig.webhookUrl}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              disabled={!localConfig.webhookEnabled}
              className={!localConfig.webhookEnabled ? "opacity-50" : ""}
            />
          </div>
        </div>

        {/* Domain Whitelist */}
        <div className="space-y-2">
          <Label htmlFor="domain-whitelist" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domain whitelist
          </Label>
          <Textarea
            id="domain-whitelist"
            placeholder="example.com&#10;another-example.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Enter one domain name per line.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
