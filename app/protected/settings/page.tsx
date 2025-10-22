"use client";

import { SettingsPage } from "@/components/settings";
import { getCurrentUser, type User } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Check if provider has completed onboarding
      if (currentUser.scope?.toLowerCase() === 'provider' || currentUser.scope?.toLowerCase() === 'psp') {
        checkProviderProfile();
      } else {
        setCheckingProfile(false);
      }
    }
    setLoading(false);
  }, []);

  const checkProviderProfile = async () => {
    try {
      const response = await fetch('/api/provider-profile');
      if (response.status === 404) {
        // No profile found - redirect to onboarding
        router.push('/onboarding/psp');
        return;
      }
      setCheckingProfile(false);
    } catch (error) {
      console.error('Error checking profile:', error);
      setCheckingProfile(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Layout will handle redirect
  }

  // Create a simple settings user object with role/scope info
  const settingsUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.scope?.toLowerCase() // Map scope to role
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  return (
    <SettingsPage 
      user={settingsUser as any} 
      profile={null} 
      apiKeys={[]} 
    />
  );
}
