"use client";

import { SettingsPage } from "@/components/settings";
import { getCurrentUser, type User } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Layout will handle redirect
  }

  // Create a simple settings user object
  const settingsUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      first_name: user.first_name,
      last_name: user.last_name
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
