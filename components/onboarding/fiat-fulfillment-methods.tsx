"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CreditCard, Building2, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface FiatMethod {
  mpesa: {
    enabled: boolean;
    provider: 'vodacom' | 'airtel' | 'tigo' | '';
    businessNumber: string;
    businessName: string;
    dailyLimit: string;
  };
  thunes: {
    enabled: boolean;
    accountId: string;
    apiKey: string;
    environment: 'sandbox' | 'production';
    connectionStatus: 'not_tested' | 'testing' | 'success' | 'failed';
  };
  bank: {
    enabled: boolean;
    bankName: string;
    accountNumber: string;
    accountName: string;
    swiftCode: string;
  };
  other: {
    enabled: boolean;
    methodName: string;
    description: string;
  };
}

interface FiatFulfillmentMethodsProps {
  onSubmit: (methods: FiatMethod) => void;
  onBack: () => void;
  loading?: boolean;
}

export function FiatFulfillmentMethods({ onSubmit, onBack, loading }: FiatFulfillmentMethodsProps) {
  const [methods, setMethods] = useState<FiatMethod>({
    mpesa: {
      enabled: false,
      provider: '',
      businessNumber: '',
      businessName: '',
      dailyLimit: '50000'
    },
    thunes: {
      enabled: false,
      accountId: '',
      apiKey: '',
      environment: 'sandbox',
      connectionStatus: 'not_tested'
    },
    bank: {
      enabled: false,
      bankName: '',
      accountNumber: '',
      accountName: '',
      swiftCode: ''
    },
    other: {
      enabled: false,
      methodName: '',
      description: ''
    }
  });

  const [testingThunes, setTestingThunes] = useState(false);

  const hasAtLeastOneMethod = 
    methods.mpesa.enabled || 
    methods.thunes.enabled || 
    methods.bank.enabled || 
    methods.other.enabled;

  const testThunesConnection = async () => {
    setTestingThunes(true);
    setMethods(prev => ({
      ...prev,
      thunes: { ...prev.thunes, connectionStatus: 'testing' }
    }));

    try {
      const response = await fetch('/api/fiat/thunes/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: methods.thunes.accountId,
          apiKey: methods.thunes.apiKey,
          environment: methods.thunes.environment
        })
      });

      if (response.ok) {
        setMethods(prev => ({
          ...prev,
          thunes: { ...prev.thunes, connectionStatus: 'success' }
        }));
      } else {
        setMethods(prev => ({
          ...prev,
          thunes: { ...prev.thunes, connectionStatus: 'failed' }
        }));
      }
    } catch (_error) {
      setMethods(prev => ({
        ...prev,
        thunes: { ...prev.thunes, connectionStatus: 'failed' }
      }));
    } finally {
      setTestingThunes(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(methods);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Fiat Fulfillment Methods</CardTitle>
              <CardDescription>
                Configure how you&apos;ll send money to recipients (at least one required)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* M-Pesa */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold">M-Pesa</h3>
                  <p className="text-sm text-muted-foreground">
                    Mobile money transfers (Kenya, Tanzania, etc.)
                  </p>
                </div>
              </div>
              <Switch
                checked={methods.mpesa.enabled}
                onCheckedChange={(enabled) => 
                  setMethods(prev => ({
                    ...prev,
                    mpesa: { ...prev.mpesa, enabled }
                  }))
                }
              />
            </div>

            {methods.mpesa.enabled && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <Label htmlFor="mpesa-provider">Provider *</Label>
                  <Select
                    value={methods.mpesa.provider}
                    onValueChange={(value: any) =>
                      setMethods(prev => ({
                        ...prev,
                        mpesa: { ...prev.mpesa, provider: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select M-Pesa provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vodacom">Vodacom (Tanzania)</SelectItem>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                      <SelectItem value="tigo">Tigo Pesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mpesa-number">Business Number *</Label>
                  <Input
                    id="mpesa-number"
                    value={methods.mpesa.businessNumber}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        mpesa: { ...prev.mpesa, businessNumber: e.target.value }
                      }))
                    }
                    placeholder="+255754123456"
                    required={methods.mpesa.enabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your M-Pesa business account number
                  </p>
                </div>

                <div>
                  <Label htmlFor="mpesa-business-name">Business Name *</Label>
                  <Input
                    id="mpesa-business-name"
                    value={methods.mpesa.businessName}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        mpesa: { ...prev.mpesa, businessName: e.target.value }
                      }))
                    }
                    placeholder="Your Business Ltd"
                    required={methods.mpesa.enabled}
                  />
                </div>

                <div>
                  <Label htmlFor="mpesa-limit">Daily Limit (USD)</Label>
                  <Input
                    id="mpesa-limit"
                    type="number"
                    value={methods.mpesa.dailyLimit}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        mpesa: { ...prev.mpesa, dailyLimit: e.target.value }
                      }))
                    }
                    placeholder="50000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum amount you can send per day
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Thunes API */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Thunes API</h3>
                  <p className="text-sm text-muted-foreground">
                    Global payment network (100+ countries)
                  </p>
                </div>
              </div>
              <Switch
                checked={methods.thunes.enabled}
                onCheckedChange={(enabled) =>
                  setMethods(prev => ({
                    ...prev,
                    thunes: { ...prev.thunes, enabled }
                  }))
                }
              />
            </div>

            {methods.thunes.enabled && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <Label htmlFor="thunes-account">Account ID *</Label>
                  <Input
                    id="thunes-account"
                    value={methods.thunes.accountId}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        thunes: { ...prev.thunes, accountId: e.target.value }
                      }))
                    }
                    placeholder="your-thunes-account-id"
                    required={methods.thunes.enabled}
                  />
                </div>

                <div>
                  <Label htmlFor="thunes-key">API Key *</Label>
                  <Input
                    id="thunes-key"
                    type="password"
                    value={methods.thunes.apiKey}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        thunes: { ...prev.thunes, apiKey: e.target.value }
                      }))
                    }
                    placeholder="••••••••••••••••"
                    required={methods.thunes.enabled}
                  />
                </div>

                <div>
                  <Label htmlFor="thunes-env">Environment</Label>
                  <Select
                    value={methods.thunes.environment}
                    onValueChange={(value: any) =>
                      setMethods(prev => ({
                        ...prev,
                        thunes: { ...prev.thunes, environment: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testThunesConnection}
                    disabled={!methods.thunes.accountId || !methods.thunes.apiKey || testingThunes}
                  >
                    {testingThunes ? 'Testing...' : 'Test Connection'}
                  </Button>
                  
                  {methods.thunes.connectionStatus === 'success' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  
                  {methods.thunes.connectionStatus === 'failed' && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bank Transfer */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Bank Transfer</h3>
                  <p className="text-sm text-muted-foreground">
                    Traditional bank account transfers
                  </p>
                </div>
              </div>
              <Switch
                checked={methods.bank.enabled}
                onCheckedChange={(enabled) =>
                  setMethods(prev => ({
                    ...prev,
                    bank: { ...prev.bank, enabled }
                  }))
                }
              />
            </div>

            {methods.bank.enabled && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <Label htmlFor="bank-name">Bank Name *</Label>
                  <Input
                    id="bank-name"
                    value={methods.bank.bankName}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        bank: { ...prev.bank, bankName: e.target.value }
                      }))
                    }
                    placeholder="e.g., CRDB Bank"
                    required={methods.bank.enabled}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="account-number">Account Number *</Label>
                    <Input
                      id="account-number"
                      value={methods.bank.accountNumber}
                      onChange={(e) =>
                        setMethods(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountNumber: e.target.value }
                        }))
                      }
                      placeholder="01234567890"
                      required={methods.bank.enabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="account-name">Account Name *</Label>
                    <Input
                      id="account-name"
                      value={methods.bank.accountName}
                      onChange={(e) =>
                        setMethods(prev => ({
                          ...prev,
                          bank: { ...prev.bank, accountName: e.target.value }
                        }))
                      }
                      placeholder="Business Name"
                      required={methods.bank.enabled}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="swift-code">SWIFT/BIC Code</Label>
                  <Input
                    id="swift-code"
                    value={methods.bank.swiftCode}
                    onChange={(e) =>
                      setMethods(prev => ({
                        ...prev,
                        bank: { ...prev.bank, swiftCode: e.target.value }
                      }))
                    }
                    placeholder="CRDBTZTZ"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  About Fiat Fulfillment
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  These are the methods YOU use to send fiat money to recipients. You&apos;ll be reimbursed in USDC 
                  after fulfilling each order. Enable at least one method to start accepting orders.
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" disabled={!hasAtLeastOneMethod || loading}>
          {loading ? 'Saving...' : 'Continue to Treasury Setup'}
        </Button>
      </div>
    </form>
  );
}
