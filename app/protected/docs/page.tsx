"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Send, 
  CheckCircle,
  Copy,
  Book,
  Zap,
  Shield
} from "lucide-react";
import { toast } from "sonner";

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_API_URL || "https://api.nedapay.com";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete guide to integrating NedaPay cross-border payment infrastructure
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="payment-orders">Payment Orders</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* Quick Start */}
          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Integration Steps</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Generate API Key</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Go to Settings → API Keys and generate your API credentials
                        </p>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = '/protected/settings'}>
                          <Key className="h-4 w-4 mr-2" />
                          Go to Settings
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Configure Webhooks</h4>
                        <p className="text-sm text-muted-foreground">
                          Set up webhook endpoints to receive real-time payment status updates
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Make Test Request</h4>
                        <p className="text-sm text-muted-foreground">
                          Use sandbox mode to test payment order creation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Go Live</h4>
                        <p className="text-sm text-muted-foreground">
                          Switch to production keys and start processing real payments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Start with sandbox mode (test API keys) to familiarize yourself with the API before processing real transactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">API Key Authentication</h3>
                  <p className="text-muted-foreground mb-4">
                    All API requests must include your API key in the Authorization header:
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                    >
                      {copiedCode === 'auth-header' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Environment</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Sandbox (Testing)</span>
                        <Badge variant="outline">Test Mode</Badge>
                      </div>
                      <code className="text-sm text-muted-foreground">sk_test_...</code>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Production (Live)</span>
                        <Badge className="bg-green-600">Live Mode</Badge>
                      </div>
                      <code className="text-sm text-muted-foreground">sk_live_...</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Orders */}
          <TabsContent value="payment-orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-600" />
                  Payment Orders API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Create Payment Order</h3>
                  <div className="mb-4">
                    <Badge variant="outline" className="font-mono">POST</Badge>
                    <code className="ml-2 text-sm">/api/v1/payment-orders</code>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    Create a new cross-border payment order (e.g., TZS → CNY)
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Request Body</h4>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{`{
  "fromCurrency": "TZS",
  "toCurrency": "CNY",
  "amount": 50000,
  "recipientDetails": {
    "name": "Beijing Trading Co",
    "accountNumber": "6214********1234",
    "bankCode": "ICBCCNBJ",
    "address": "Beijing, China"
  },
  "reference": "INV-2024-001",
  "webhookUrl": "https://yourbank.com/nedapay/webhook"
}`}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(`{
  "fromCurrency": "TZS",
  "toCurrency": "CNY",
  "amount": 50000,
  "recipientDetails": {
    "name": "Beijing Trading Co",
    "accountNumber": "6214********1234",
    "bankCode": "ICBCCNBJ"
  },
  "reference": "INV-2024-001"
}`, 'create-order')}
                        >
                          {copiedCode === 'create-order' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{`{
  "success": true,
  "orderId": "order_abc123xyz",
  "status": "pending",
  "fromAmount": 50000,
  "fromCurrency": "TZS",
  "toAmount": 122.50,
  "toCurrency": "CNY",
  "exchangeRate": 0.00245,
  "bankMarkup": 0.25,
  "estimatedCompletion": "2025-10-22T15:30:00Z",
  "createdAt": "2025-10-22T14:00:00Z"
}`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Example Code (Node.js)</h4>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{`const response = await fetch('${apiBaseUrl}/api/v1/payment-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromCurrency: 'TZS',
    toCurrency: 'CNY',
    amount: 50000,
    recipientDetails: { /* ... */ },
    reference: 'INV-2024-001'
  })
});

const order = await response.json();
console.log('Order created:', order.orderId);`}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(`const response = await fetch('${apiBaseUrl}/api/v1/payment-orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromCurrency: 'TZS',
    toCurrency: 'CNY',
    amount: 50000,
    recipientDetails: { /* ... */ },
    reference: 'INV-2024-001'
  })
});`, 'nodejs-example')}
                        >
                          {copiedCode === 'nodejs-example' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Get Order Status</h3>
                  <div className="mb-4">
                    <Badge variant="outline" className="font-mono">GET</Badge>
                    <code className="ml-2 text-sm">/api/v1/payment-orders/:orderId</code>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    Retrieve the current status of a payment order
                  </p>

                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`GET ${apiBaseUrl}/api/v1/payment-orders/order_abc123xyz
Authorization: Bearer YOUR_API_KEY

Response:
{
  "orderId": "order_abc123xyz",
  "status": "completed",
  "completedAt": "2025-10-22T15:25:00Z",
  "txHash": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Webhook Events</h3>
                  <p className="text-muted-foreground mb-4">
                    NedaPay sends webhook events to your server when payment status changes:
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <code className="text-sm font-semibold">payment.pending</code>
                      <p className="text-sm text-muted-foreground mt-1">Payment order created and awaiting PSP fulfillment</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <code className="text-sm font-semibold">payment.processing</code>
                      <p className="text-sm text-muted-foreground mt-1">PSP is processing the payment</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <code className="text-sm font-semibold">payment.completed</code>
                      <p className="text-sm text-muted-foreground mt-1">Payment successfully delivered to recipient</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <code className="text-sm font-semibold">payment.failed</code>
                      <p className="text-sm text-muted-foreground mt-1">Payment failed and requires attention</p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">Webhook Payload Example</h4>
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`POST https://yourbank.com/nedapay/webhook
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "payment.completed",
  "orderId": "order_abc123xyz",
  "status": "completed",
  "fromAmount": 50000,
  "fromCurrency": "TZS",
  "toAmount": 122.50,
  "toCurrency": "CNY",
  "bankMarkup": 0.25,
  "txHash": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "completedAt": "2025-10-22T15:25:00Z",
  "reference": "INV-2024-001"
}`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Webhook Security</h3>
                  <p className="text-muted-foreground mb-4">
                    Verify webhook signatures to ensure requests are from NedaPay:
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// In your webhook handler
app.post('/nedapay/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.NEDAPAY_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});`}</code>
                    </pre>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">⚠️ Important</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    Always return a 200 status code quickly. Process webhooks asynchronously to avoid timeouts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Need help? Contact our integration support team
            </p>
            <Button variant="outline">
              <Book className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
