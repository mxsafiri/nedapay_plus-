"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { RoleSelectionModal } from "@/components/role-selection-modal";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userScope, setUserScope] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 Protected Layout: Checking authentication...');
      console.log('🔍 Window location:', window.location.href);
      
      const authenticated = isAuthenticated();
      const user = getCurrentUser();
      
      console.log('🔍 Is authenticated:', authenticated);
      console.log('🔍 Current user:', user);
      console.log('🔍 localStorage.user:', localStorage.getItem('user') ? 'EXISTS' : 'NULL');
      console.log('🔍 sessionStorage.user:', sessionStorage.getItem('user') ? 'EXISTS' : 'NULL');
      
      if (!authenticated) {
        console.log('❌ Not authenticated, redirecting to login');
        console.log('❌ Redirect happening from:', window.location.pathname);
        router.push('/auth/login');
        return;
      }
      
      console.log('✅ User authenticated, showing protected content');
      setIsAuthed(true);
      setIsLoading(false);
      
      // Check if user has both roles and hasn't selected one yet
      if (user && user.scope === 'both') {
        const activeRole = localStorage.getItem('activeRole');
        if (!activeRole) {
          setUserScope(user.scope);
          setShowRoleModal(true);
        }
      }
    };

    // Add a small delay to ensure localStorage is ready after navigation
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthed) {
    return null;
  }
  return (
    <>
      <main className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient - blue/cyan theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/60 dark:to-slate-900"></div>
          
          {/* Animated mesh gradient orbs - blue/cyan palette */}
          <div className="absolute top-0 -left-40 w-[650px] h-[650px] bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-20 right-0 w-[550px] h-[550px] bg-gradient-to-br from-indigo-400 to-blue-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-cyan-300 to-blue-200 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-35 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-blue-300 to-indigo-200 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-slate-300 dark:bg-grid-slate-700/40 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
          
          {/* Noise texture overlay for extra depth */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}></div>
        </div>

        <DashboardNavbar />
        <div className="flex-1 relative z-10">
          {children}
        </div>
        <footer className="relative z-10 w-full flex items-center justify-center border-t border-border/50 backdrop-blur-sm bg-background/80 mx-auto text-center text-xs gap-8 py-8">
          <p>
            Powered by{" "}
            <a
              href="https://nedapay.xyz"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              NedaPay Protocol
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </main>
      
      <RoleSelectionModal 
        open={showRoleModal} 
        onClose={() => setShowRoleModal(false)}
        userScope={userScope}
      />
    </>
  );
}
