"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Wallet, DollarSign, Key, Check, ArrowRight, Upload, Globe } from 'lucide-react';
import { calculatePspMonthlyCommissions, formatCurrency } from '@/lib/revenue-calculator';

const COUNTRIES = [
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
];

export default function PSPOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: PSP Details
  const [pspName, setPspName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2: KYB & Countries
  const [incorporationCert, setIncorporationCert] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Step 3: Treasury & Rates
  const [commissionRate, setCommissionRate] = useState(0.003); // 0.3% default
  const [treasuryConfig, setTreasuryConfig] = useState('');

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Revenue projection
  const monthlyVolume = 100000;
  const avgTransactionSize = 1000;
  const transactions = Array(monthlyVolume / avgTransactionSize).fill(avgTransactionSize);
  const projectedMonthly = calculatePspMonthlyCommissions(transactions, commissionRate);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/provider-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pspName,
          tradingName,
          contactEmail,
          contactPhone,
        }),
      });

      if (!response.ok) throw new Error('Failed to create profile');

      setCurrentStep(2);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save PSP details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload documents
      const formData = new FormData();
      if (incorporationCert) formData.append('incorporation', incorporationCert);
      if (businessLicense) formData.append('license', businessLicense);
      formData.append('supportedCountries', JSON.stringify(selectedCountries));

      const response = await fetch('/api/kyb/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload documents');

      setCurrentStep(3);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/psp/configure-treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate,
          treasuryConfig: JSON.parse(treasuryConfig || '{}'),
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      setCurrentStep(4);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save treasury configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate API key
      const response = await fetch('/api/generate-api-key', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate API key');

      // Redirect to dashboard
      router.push('/protected');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">💸 PSP Onboarding</h1>
          <p className="text-muted-foreground">
            Set up your provider account and start earning commissions
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Revenue Projection Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Projected Monthly Commissions</p>
                <p className="text-3xl font-bold">{formatCurrency(projectedMonthly)}</p>
                <p className="text-xs opacity-75 mt-1">
                  At {(monthlyVolume).toLocaleString()} transactions/month @ {(commissionRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-5xl opacity-20">💎</div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>PSP Details</CardTitle>
                  <CardDescription>Tell us about your payment service</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <Label htmlFor="pspName">Legal Business Name *</Label>
                  <Input
                    id="pspName"
                    value={pspName}
                    onChange={(e) => setPspName(e.target.value)}
                    placeholder="e.g., Thunes Ltd"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tradingName">Trading Name</Label>
                  <Input
                    id="tradingName"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    placeholder="e.g., Thunes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@psp.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1..."
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : (
                    <>
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>KYB & Supported Countries</CardTitle>
                  <CardDescription>Upload documents and select service regions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* Document Upload */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Business Documents</Label>
                  
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Label htmlFor="incorporation" className="cursor-pointer">
                      <span className="text-sm font-medium">Certificate of Incorporation *</span>
                      <Input
                        id="incorporation"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setIncorporationCert(e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {incorporationCert ? incorporationCert.name : 'Click to upload'}
                      </p>
                    </Label>
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Label htmlFor="license" className="cursor-pointer">
                      <span className="text-sm font-medium">Business License *</span>
                      <Input
                        id="license"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {businessLicense ? businessLicense.name : 'Click to upload'}
                      </p>
                    </Label>
                  </div>
                </div>

                {/* Country Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Supported Countries * <span className="text-sm font-normal text-muted-foreground">({selectedCountries.length} selected)</span>
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {COUNTRIES.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => toggleCountry(country.code)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedCountries.includes(country.code)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <Checkbox
                          checked={selectedCountries.includes(country.code)}
                          onCheckedChange={() => toggleCountry(country.code)}
                        />
                        <span className="text-2xl">{country.flag}</span>
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || selectedCountries.length === 0}
                  >
                    {loading ? 'Uploading...' : (
                      <>
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Treasury & Commission Rates</CardTitle>
                  <CardDescription>Configure your fiat accounts and rates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%) *</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    value={commissionRate * 100}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) / 100)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 0.3% | Your earnings: {formatCurrency(avgTransactionSize * commissionRate)} per ${avgTransactionSize} transaction
                  </p>
                </div>

                <div>
                  <Label htmlFor="treasuryConfig">Treasury Accounts Configuration</Label>
                  <textarea
                    id="treasuryConfig"
                    value={treasuryConfig}
                    onChange={(e) => setTreasuryConfig(e.target.value)}
                    placeholder='{"CNY": {"bank": "ICBC", "account": "123456"}, "KES": {"bank": "Equity", "account": "789012"}}'
                    className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JSON format: Specify your fiat treasury accounts per currency
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium">💡 Pro Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower commission rates help you win more orders. You can adjust rates anytime from your dashboard.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : (
                      <>
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle>API Access & Testing</CardTitle>
                  <CardDescription>Get your API key and test the platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep4Submit} className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="font-semibold">API Key Generation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We&apos;ll generate a secure API key that allows you to:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Receive payment order notifications</li>
                        <li>• Confirm order fulfillment</li>
                        <li>• Access real-time commission data</li>
                        <li>• Test in sandbox environment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    Ready to go!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your profile is complete. Click below to generate your API key and access your dashboard.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Generating...' : (
                      <>
                        Complete Setup <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
