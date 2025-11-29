"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle,
  Zap,
  Key,
  Webhook,
  Send,
  Shield,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Globe,
  Network,
  Layers
} from "lucide-react";
import { ApiPlayground } from "@/components/docs/api-playground";

export default function DocsV2Page() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: "Generate API Key",
      icon: Key,
      description: "Create your API credentials to authenticate requests",
      color: "text-blue-600"
    },
    {
      id: 2,
      title: "Configure Webhooks",
      icon: Webhook,
      description: "Set up webhook endpoints for real-time updates",
      color: "text-purple-600"
    },
    {
      id: 3,
      title: "Make Test Request",
      icon: Send,
      description: "Test payment order creation in sandbox mode",
      color: "text-green-600"
    },
    {
      id: 4,
      title: "Go Live",
      icon: CheckCircle,
      description: "Switch to production and start processing payments",
      color: "text-emerald-600"
    }
  ];

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                API Documentation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Complete guide to integrating NedaPay payment infrastructure
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/protected/settings">
                <Key className="h-4 w-4 mr-2" />
                Get API Key
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Steps Navigation */}
          <div className="lg:col-span-3">
            <Card className="sticky top-24 border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Integration Steps</span>
                </div>
                <nav className="space-y-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                          isCurrent 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : isCurrent 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-xs text-white font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{step.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {step.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{completedSteps.length}/{steps.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Omni-Channel Infrastructure Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 shadow-lg">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                  {/* Icon Grid */}
                  <div className="flex-shrink-0 relative">
                    <div className="p-3.5 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-xl">
                      <Layers className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                        Omni-Channel Payment Infrastructure
                      </h3>
                    </div>
                    <p className="text-base text-blue-900 dark:text-blue-200 font-medium mb-4">
                      Pay anywhere, settle everywhere
                    </p>
                    <p className="text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed max-w-2xl">
                      Connect banks, PSPs, and payment networks through a single API. Support crypto, fiat, and mobile money across 9+ countries with real-time settlement and compliance built-in.
                    </p>
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="group flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md group-hover:scale-110 transition-transform">
                      <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-blue-900 dark:text-blue-300">Global Reach</div>
                      <div className="text-[10px] text-blue-700/70 dark:text-blue-400/70">9+ Countries</div>
                    </div>
                  </div>

                  <div className="group flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-md">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md group-hover:scale-110 transition-transform">
                      <Network className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Multi-Channel</div>
                      <div className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70">Crypto, Fiat, Mobile</div>
                    </div>
                  </div>

                  <div className="group flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-md">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-md group-hover:scale-110 transition-transform">
                      <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-purple-900 dark:text-purple-300">Instant Settlement</div>
                      <div className="text-[10px] text-purple-700/70 dark:text-purple-400/70">Real-time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Step 1: Generate API Key</h2>
                        <p className="text-sm text-muted-foreground">Get your credentials to start making API requests</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          NedaPay uses API keys to authenticate requests. Include your API key in the Authorization header of all requests.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-background rounded border">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-600">1</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">Go to Settings</div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Navigate to Settings → API Keys in your dashboard
                              </p>
                              <Button size="sm" variant="outline" asChild>
                                <a href="/protected/settings">
                                  <Key className="h-3 w-3 mr-1.5" />
                                  Open Settings
                                </a>
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-background rounded border">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-600">2</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">Generate Key</div>
                              <p className="text-xs text-muted-foreground">
                                Click "Create API Key" and choose between Test (sandbox) or Live (production) mode
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-background rounded border">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-600">3</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">Save Securely</div>
                              <p className="text-xs text-muted-foreground">
                                Copy and store your API key securely. You won't be able to see it again!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-1">Pro Tip</div>
                            <p className="text-xs text-blue-800 dark:text-blue-400">
                              Start with a Test API key (np_test_*) to safely experiment without affecting real transactions. Switch to Live keys (np_live_*) when you're ready for production.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          onClick={() => {
                            markStepComplete(1);
                            setCurrentStep(2);
                          }}
                          className="bg-primary"
                        >
                          Next: Configure Webhooks
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Webhook className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Step 2: Configure Webhooks</h2>
                      <p className="text-sm text-muted-foreground">Receive real-time updates about payment status</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h3 className="font-semibold mb-3">Webhook Events</h3>
                      <div className="space-y-2">
                        {[
                          { event: "order.initiated", desc: "Payment order created, awaiting USDC deposit" },
                          { event: "order.processing", desc: "USDC received, converting to fiat" },
                          { event: "order.completed", desc: "Fiat delivered to recipient's account" },
                          { event: "order.failed", desc: "Payment failed (invalid account, timeout, etc.)" },
                          { event: "order.refunded", desc: "Order cancelled, USDC refunded" }
                        ].map((item) => (
                          <div key={item.event} className="flex items-start gap-3 p-2 rounded hover:bg-background transition-colors">
                            <Circle className="h-3 w-3 text-purple-500 mt-1" />
                            <div>
                              <code className="text-xs font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">{item.event}</code>
                              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => {
                          markStepComplete(2);
                          setCurrentStep(3);
                        }}
                        className="bg-primary flex-1"
                      >
                        Next: Test Request
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Step 3: Make Test Request</h2>
                      <p className="text-sm text-muted-foreground">Try creating a payment order in sandbox mode</p>
                    </div>
                  </div>

                  <ApiPlayground
                    endpoint="/api/v1/payment-orders"
                    method="POST"
                    title="Create Payment Order"
                    description="Initiate a new stablecoin off-ramp payment order"
                    bodyExample={{
                      token: "USDC",
                      amount: "100",
                      toCurrency: "NGN",
                      network: "base",
                      recipientDetails: {
                        institution: "ABNGNGLA",
                        accountNumber: "0123456789",
                        accountName: "John Doe",
                        memo: "Payment for services"
                      },
                      reference: "ORD-2024-001"
                    }}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        markStepComplete(3);
                        setCurrentStep(4);
                      }}
                      className="bg-primary flex-1"
                    >
                      Next: Go Live
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Step 4: Go Live</h2>
                      <p className="text-sm text-muted-foreground">Switch to production and start processing real payments</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Ready for Production</h3>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>API Key Generated</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Webhooks Configured</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Test Request Successful</span>
                        </div>
                      </div>

                      <p className="text-sm text-emerald-800 dark:text-emerald-400 mb-4">
                        You're all set! Generate a Live API key (np_live_*) and start processing real payments.
                      </p>

                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                        <a href="/protected/settings">
                          <Key className="h-4 w-4 mr-2" />
                          Generate Live API Key
                        </a>
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="w-full"
                    >
                      Previous
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
