"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApiPlaygroundProps {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  title: string;
  description: string;
  bodyExample?: object;
  requiresAuth?: boolean;
}

export function ApiPlayground({
  endpoint,
  method,
  title,
  description,
  bodyExample,
  requiresAuth = true
}: ApiPlaygroundProps) {
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState(
    bodyExample ? JSON.stringify(bodyExample, null, 2) : ""
  );
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : "https://api.nedapay.com";

  const generateCurl = () => {
    const headers = requiresAuth 
      ? `-H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\\n  -H "Content-Type: application/json"`
      : `-H "Content-Type: application/json"`;
    
    if (method === "GET") {
      return `curl -X ${method} \\\n  ${apiBaseUrl}${endpoint} \\\n  ${headers}`;
    }
    
    return `curl -X ${method} \\\n  ${apiBaseUrl}${endpoint} \\\n  ${headers} \\\n  -d '${requestBody || JSON.stringify(bodyExample, null, 2)}'`;
  };

  const handleTryIt = async () => {
    if (requiresAuth && !apiKey) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(`${apiBaseUrl}${endpoint}`, options);
      const data = await res.json();
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (error) {
      setResponse({
        status: 500,
        statusText: "Error",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge 
              variant={method === "GET" ? "outline" : "default"}
              className={`font-mono text-xs ${
                method === "GET" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700" :
                method === "POST" ? "bg-blue-600" :
                method === "PUT" ? "bg-orange-600" :
                "bg-red-600"
              }`}
            >
              {method}
            </Badge>
            <code className="text-sm text-muted-foreground">{endpoint}</code>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {/* Request Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Parameters */}
        <div className="space-y-4">
          {requiresAuth && (
            <div>
              <Label htmlFor="api-key" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                Authorization
                <Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge>
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from <a href="/protected/settings" className="text-primary hover:underline">Settings</a>
              </p>
            </div>
          )}

          {method !== "GET" && bodyExample && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                Request Body
                <Badge variant="outline" className="text-[10px] px-1 py-0">application/json</Badge>
              </Label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs border border-slate-700 focus:border-primary focus:outline-none"
                placeholder="Request body"
              />
            </div>
          )}

          <Button
            onClick={handleTryIt}
            disabled={isLoading || (requiresAuth && !apiKey)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Try It
              </>
            )}
          </Button>
        </div>

        {/* Right: Response & cURL */}
        <div className="space-y-4">
          {/* cURL Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                cURL Command
              </Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(generateCurl())}
                className="h-7 px-2"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs border border-slate-700">
              <code>{generateCurl()}</code>
            </pre>
          </div>

          {/* Response */}
          {response && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Response
                </Label>
                <Badge
                  variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {response.status} {response.statusText}
                </Badge>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs border border-slate-700 max-h-96">
                <code>{JSON.stringify(response.data, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
