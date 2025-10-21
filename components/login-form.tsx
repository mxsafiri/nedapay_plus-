"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from 'sonner';
import { setCurrentUser } from '@/lib/auth';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call server-side login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      console.log('Login response:', data);

      if (!data.success) {
        // Check if email needs verification
        if (data.needsVerification) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store user info using auth utility
      setCurrentUser(data.user);
      
      toast.success('Login successful!');
      console.log('🚀 Redirecting user with scope:', data.user.scope);
      
      // Redirect immediately - don't set loading to false
      if (data.user.scope === 'admin') {
        router.push('/protected/admin');
      } else {
        router.push('/protected');
      }
      // Keep loading state true during redirect
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false); // Only stop loading on error
    }
  };

  return (
    <div className={cn("w-full max-w-lg", className)} {...props}>
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-12 overflow-visible">
        {/* Depth glow effects - top right and bottom left */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-radial from-blue-400/30 via-cyan-400/15 to-transparent rounded-full blur-2xl animate-glow-pulse pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-radial from-indigo-400/30 via-blue-400/15 to-transparent rounded-full blur-2xl animate-glow-pulse-delayed pointer-events-none"></div>
        
        {/* Content wrapper */}
        <div className="relative z-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif', letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Enter your credentials to access your account.{" "}
            <Link href="/auth/sign-up" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline underline-offset-2">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-white">
              Email address
            </Label>
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

          {/* Password Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-900 dark:text-white">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 px-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        </div>
        {/* End content wrapper */}
      </div>
    </div>
  );
}
