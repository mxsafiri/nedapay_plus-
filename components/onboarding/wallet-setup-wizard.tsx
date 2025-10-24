"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Copy,
  CheckCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";

interface WalletSetupWizardProps {
  userId: string;
  onComplete: () => void;
}

export function WalletSetupWizard({ userId, onComplete }: WalletSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hederaAccountId, setHederaAccountId] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [copiedHedera, setCopiedHedera] = useState(false);
  const [copiedBase, setCopiedBase] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const copyToClipboard = (text: string, type: 'hedera' | 'base') => {
    navigator.clipboard.writeText(text);
    if (type === 'hedera') {
      setCopiedHedera(true);
      setTimeout(() => setCopiedHedera(false), 2000);
    } else {
      setCopiedBase(true);
      setTimeout(() => setCopiedBase(false), 2000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/provider-configurations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          walletAddresses: {
            'hedera-testnet': hederaAccountId,
            'base-sepolia': baseAddress
          }
        })
      });

      if (response.ok) {
        onComplete();
      } else {
        alert('Failed to save wallet addresses. Please try again.');
      }
    } catch (error) {
      console.error('Error saving wallets:', error);
      alert('Error saving wallets. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isHederaValid = /^0\.0\.\d+$/.test(hederaAccountId);
  const isBaseValid = /^0x[a-fA-F0-9]{40}$/.test(baseAddress);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to NedaPay
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Let&apos;s set up your settlement wallets in just 3 steps
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-2 ${step < currentStep ? 'text-green-600' : step === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
              {step < currentStep ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className={`h-6 w-6 ${step === currentStep ? 'fill-current' : ''}`} />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {step === 1 ? 'Hedera Wallet' : step === 2 ? 'Base Wallet' : 'Confirm'}
              </span>
            </div>
            {step < 3 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep === 1 && 'Set Up Hedera Wallet (Primary)'}
            {currentStep === 2 && 'Set Up Base Wallet (Backup)'}
            {currentStep === 3 && 'Review & Confirm'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Receives 95% of your payments with ultra-low fees ($0.0001/tx)'}
            {currentStep === 2 && 'Receives 5% of payments as backup (only when Hedera unavailable)'}
            {currentStep === 3 && 'Verify your wallet addresses before saving'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Hedera Setup */}
          {currentStep === 1 && (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Don&apos;t have a Hedera account?</strong> It takes 5 minutes to create one.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                    Visit Hedera Portal
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                      https://portal.hedera.com/
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('https://portal.hedera.com/', 'hedera')}
                    >
                      {copiedHedera ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://portal.hedera.com/', '_blank')}
                    >
                      Open <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                    Create Account
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                    <li>• Click &quot;Create Account&quot; → Select &quot;Testnet&quot;</li>
                    <li>• Enter your email and create password</li>
                    <li>• Verify your email</li>
                    <li>• Get free HBAR from the faucet (for fees)</li>
                  </ul>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                    Copy Your Account ID
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    You&apos;ll see something like: <code className="bg-muted px-1">0.0.7099612</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hedera-account">
                    Paste Your Hedera Account ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hedera-account"
                    value={hederaAccountId}
                    onChange={(e) => setHederaAccountId(e.target.value)}
                    placeholder="0.0.7099612"
                    className={`font-mono ${isHederaValid ? 'border-green-500' : ''}`}
                  />
                  {hederaAccountId && !isHederaValid && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Invalid format. Should look like: 0.0.7099612
                    </p>
                  )}
                  {isHederaValid && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Valid Hedera Account ID!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Base Setup */}
          {currentStep === 2 && (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Don&apos;t have MetaMask?</strong> It takes 3 minutes to install.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                    Install MetaMask
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                      https://metamask.io/download/
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('https://metamask.io/download/', 'base')}
                    >
                      {copiedBase ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://metamask.io/download/', '_blank')}
                    >
                      Open <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                    Create Wallet
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                    <li>• Click &quot;Create a new wallet&quot;</li>
                    <li>• Set a password</li>
                    <li>• SAVE your 12-word recovery phrase</li>
                    <li>• Complete setup</li>
                  </ul>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                    Copy Your Address
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Click your account name to copy address. Starts with: <code className="bg-muted px-1">0x...</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-address">
                    Paste Your Base Wallet Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="base-address"
                    value={baseAddress}
                    onChange={(e) => setBaseAddress(e.target.value)}
                    placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                    className={`font-mono ${isBaseValid ? 'border-green-500' : ''}`}
                  />
                  {baseAddress && !isBaseValid && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Invalid format. Should start with 0x and be 42 characters
                    </p>
                  )}
                  {isBaseValid && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Valid EVM Address!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Please double-check your addresses before saving. Incorrect addresses mean you won&apos;t receive payments!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-6 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        Hedera Testnet
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Primary</span>
                      </h4>
                      <p className="text-sm text-muted-foreground">Receives ~95% of settlements</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                    {hederaAccountId}
                  </div>
                </div>

                <div className="p-6 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        Base Sepolia
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Backup</span>
                      </h4>
                      <p className="text-sm text-muted-foreground">Receives ~5% of settlements</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                    {baseAddress}
                  </div>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>Security Reminder:</strong> Keep your recovery phrases safe! Write them on paper and store in a secure location. NedaPay will never ask for your recovery phrases.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || saving}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 ? !isHederaValid : !isBaseValid}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving || !isHederaValid || !isBaseValid}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Saving...' : 'Save & Complete Setup'}
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Help Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{' '}
          <a
            href="mailto:support@nedapay.com"
            className="text-primary hover:underline"
          >
            Contact Support
          </a>
          {' '}or{' '}
          <a
            href="/PSP_ONBOARDING_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Full Guide
          </a>
        </p>
      </div>
    </div>
  );
}
