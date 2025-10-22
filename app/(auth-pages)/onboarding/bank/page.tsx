"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Building2, FileText, Key, Check, ArrowRight, Upload } from 'lucide-react';
import { calculateRevenue, formatCurrency } from '@/lib/revenue-calculator';

export default function BankOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Bank Details
  const [bankName, setBankName] = useState('');
  const [country, setCountry] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2: KYB Documents
  const [incorporationCert, setIncorporationCert] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);

  // Step 3: White-label & API
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0066FF');
  const [brandName, setBrandName] = useState('');

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Revenue projection for motivation
  const monthlyTransactions = 10000;
  const avgTransactionSize = 1000;
  const { bankMarkup } = calculateRevenue(avgTransactionSize);
  const projectedMonthly = bankMarkup * monthlyTransactions;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get current user
      const userResponse = await fetch('/api/auth/user');
      const { user } = await userResponse.json();
      
      if (!user) throw new Error('Not authenticated');

      // Create bank profile
      const response = await fetch('/api/sender-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bankName,
          country,
          contactName,
          contactEmail,
          contactPhone,
        }),
      });

      if (!response.ok) throw new Error('Failed to create profile');
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (incorporationCert) formData.append('incorporation', incorporationCert);
      if (businessLicense) formData.append('license', businessLicense);

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
      // Generate API key
      const apiResponse = await fetch('/api/generate-api-key', {
        method: 'POST',
      });
      if (!apiResponse.ok) throw new Error('Failed to generate API key');

      // Save white-label config
      const formData = new FormData();
      if (logoFile) formData.append('logo', logoFile);
      formData.append('primaryColor', primaryColor);
      formData.append('brandName', brandName);

      const configResponse = await fetch('/api/white-label/config', {
        method: 'POST',
        body: formData,
      });

      if (!configResponse.ok) throw new Error('Failed to save branding');

      // Redirect to dashboard
      router.push('/protected');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏦 Bank Onboarding</h1>
          <p className="text-muted-foreground">
            Complete your setup to start earning from cross-border payments
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
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Projected Monthly Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(projectedMonthly)}</p>
                <p className="text-xs opacity-75 mt-1">
                  At {monthlyTransactions.toLocaleString()} transactions/month
                </p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Bank Details</CardTitle>
                  <CardDescription>Tell us about your bank</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., CRDB Bank"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Tanzania"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
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
                      placeholder="+255..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@bank.com"
                    required
                  />
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
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>KYB Documents</CardTitle>
                  <CardDescription>Upload required business documents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2Submit} className="space-y-6">
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
                      {incorporationCert ? incorporationCert.name : 'Click to upload (PDF, JPG, PNG)'}
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
                      {businessLicense ? businessLicense.name : 'Click to upload (PDF, JPG, PNG)'}
                    </p>
                  </Label>
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
                  <Button type="submit" className="flex-1" disabled={loading}>
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
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>API & White-Label Setup</CardTitle>
                  <CardDescription>Configure your brand and get API access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div>
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your Bank Name"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be shown to your customers
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#0066FF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {logoFile ? logoFile.name : 'Optional: Upload logo'}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">API Key Generation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll generate a secure API key for you to integrate NedaPay into your systems.
                        You can regenerate it anytime from your dashboard.
                      </p>
                    </div>
                  </div>
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
                    {loading ? 'Setting up...' : (
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
