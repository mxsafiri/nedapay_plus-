"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessTypes, setBusinessTypes] = useState<("sender" | "provider")[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email address is required");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (businessTypes.length === 0) {
      setError("Please select at least one business type");
      setIsLoading(false);
      return;
    }

    if (!consentChecked) {
      setError("You must agree to the terms of use and privacy policy");
      setIsLoading(false);
      return;
    }

    try {
      console.log('=== Starting sign-up process ===');
      console.log('Form data:', { firstName, lastName, email, businessTypes });
      
      // Call server-side API to create user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          businessTypes
        }),
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = 'Failed to create account';
        try {
          const errorData = JSON.parse(responseText);
          console.log('Parsed error data:', errorData);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error('Error details:', errorData.details);
          }
          if (errorData.stack) {
            console.error('Error stack:', errorData.stack);
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed success data:', data);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        console.error('Response text was:', responseText);
        throw new Error('Invalid response from server');
      }

      // Log verification link for development
      if (data.verificationLink) {
        console.log('Email verification link:', data.verificationLink);
      }
      
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      console.error('Sign-up error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred while creating your account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-lg", className)} {...props}>
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-12 max-h-[90vh] overflow-y-auto">
        {/* Depth glow effects - top right and bottom left */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-radial from-blue-400/30 via-cyan-400/15 to-transparent rounded-full blur-2xl animate-glow-pulse pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-radial from-indigo-400/30 via-blue-400/15 to-transparent rounded-full blur-2xl animate-glow-pulse-delayed pointer-events-none"></div>
        
        {/* Content wrapper */}
        <div className="relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.02em' }}>
            Create account
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Join NedaPay and start your journey. Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline underline-offset-2">
              Log in here
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-900 dark:text-white">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 px-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-900 dark:text-white">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 px-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-white">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-900 dark:text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 pr-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Must be at least 8 characters long</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-900 dark:text-white">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 px-4 pr-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Business Type */}
              <div className="grid gap-4">
                <Label className="text-sm font-semibold text-slate-900 dark:text-white">Type of business (select one or both)</Label>
                <div className="space-y-3">
                  {/* Sender Option */}
                  <div 
                    className={cn(
                      "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                      businessTypes.includes("sender") ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    onClick={() => {
                      const newChecked = !businessTypes.includes("sender");
                      if (newChecked) {
                        setBusinessTypes([...businessTypes, "sender"]);
                      } else {
                        setBusinessTypes(businessTypes.filter(type => type !== "sender"));
                      }
                    }}
                  >
                    <div className="mt-1">
                      <div className={cn(
                        "h-4 w-4 shrink-0 rounded-sm border border-primary shadow flex items-center justify-center",
                        businessTypes.includes("sender") ? "bg-primary text-primary-foreground" : "bg-background"
                      )}>
                        {businessTypes.includes("sender") && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">S</span>
                        </div>
                        <span className="font-medium">Sender</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Enable your merchants and customers access fast, secure and reliable cross-border payments that fit into any use cases.
                      </p>
                    </div>
                  </div>

                  {/* Provider Option */}
                  <div 
                    className={cn(
                      "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                      businessTypes.includes("provider") ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                    onClick={() => {
                      const newChecked = !businessTypes.includes("provider");
                      if (newChecked) {
                        setBusinessTypes([...businessTypes, "provider"]);
                      } else {
                        setBusinessTypes(businessTypes.filter(type => type !== "provider"));
                      }
                    }}
                  >
                    <div className="mt-1">
                      <div className={cn(
                        "h-4 w-4 shrink-0 rounded-sm border border-primary shadow flex items-center justify-center",
                        businessTypes.includes("provider") ? "bg-primary text-primary-foreground" : "bg-background"
                      )}>
                        {businessTypes.includes("provider") && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">P</span>
                        </div>
                        <span className="font-medium">Provider</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Set up a node, fund your position and earn on every transaction on a completely transparent, fair and market-neutral platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I certify that I am 18 years of age or older, I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Use
                  </Link>
                  , and I have read the{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              {/* CAPTCHA Placeholder */}
              <div className="flex items-center justify-center p-4 border border-gray-300 rounded bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <span className="text-sm">Verify you are human</span>
                  <div className="ml-4 text-xs text-gray-500">reCAPTCHA</div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </div>
        {/* End content wrapper */}
        </div>
      </div>
    );
  }
