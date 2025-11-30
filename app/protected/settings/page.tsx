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
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [kybStatus, setKybStatus] = useState<string>('not_started');

  useEffect(() => {
    const currentUser = getCurrentUser();

    // If no user, stop loading and let layout handle redirect
    if (!currentUser) {
      setLoading(false);
      setCheckingProfile(false);
      return;
    }

    setUser(currentUser);

    // Fetch API keys
    fetchApiKeys(currentUser.id);

    // Fetch KYB status
    fetchKYBStatus(currentUser.id);

    // Add visibility change listener to refresh status when user comes back
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible again, refreshing KYB status...');
        fetchKYBStatus(currentUser.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check if provider/sender has completed onboarding
    if (currentUser.scope?.toLowerCase() === 'provider' || currentUser.scope?.toLowerCase() === 'psp') {
      checkProviderProfile(currentUser.id);
    } else if (currentUser.scope?.toLowerCase() === 'sender' || currentUser.scope?.toLowerCase() === 'bank') {
      checkSenderProfile(currentUser.id);
    } else {
      setCheckingProfile(false);
    }

    // We can stop the main loading spinner; profile checks manage their own state
    setLoading(false);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApiKeys = async (userId: string) => {
    try {
      const response = await fetch('/api/generate-api-key', {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasApiKey && data.keyInfo) {
          setApiKeys([data.keyInfo]);
        }
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchKYBStatus = async (userId: string) => {
    try {
      const response = await fetch('/api/kyb/upload', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('KYB Status Response:', data);
        setKybStatus(data.status || 'not_started');
      } else {
        console.error('Failed to fetch KYB status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching KYB status:', error);
    }
  };

  const checkProviderProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/provider-profile', {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        // No profile found - redirect to onboarding
        router.push('/onboarding/psp');
        return;
      }
      setCheckingProfile(false);
    } catch (error) {
      console.error('Error checking provider profile:', error);
      setCheckingProfile(false);
    }
  };

  const checkSenderProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/sender-profile', {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        // No profile found - redirect to onboarding
        router.push('/onboarding/sender');
        return;
      }
      setCheckingProfile(false);
    } catch (error) {
      console.error('Error checking sender profile:', error);
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
      profile={profile} 
      apiKeys={apiKeys}
      kybStatus={kybStatus}
    />
  );
}
