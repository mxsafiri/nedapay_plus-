/**
 * React hooks for enhanced authentication with zero-loading UX
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedAuth } from './enhanced-auth';
import { dataStore } from '../data/data-store';

interface UseAuthResult {
  user: any | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchProfile: (profile: 'sender' | 'provider') => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Main authentication hook with intelligent data management
 */
export function useAuth(): UseAuthResult {
  const [state, setState] = useState(() => enhancedAuth.getState());

  useEffect(() => {
    const unsubscribe = enhancedAuth.subscribe(setState);
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await enhancedAuth.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    await enhancedAuth.logout();
  }, []);

  const switchProfile = useCallback(async (profile: 'sender' | 'provider') => {
    await enhancedAuth.switchProfile(profile);
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    switchProfile,
    isAuthenticated: !!state.user
  };
}

/**
 * Hook for current user profile with automatic switching
 */
export function useCurrentProfile() {
  const [currentProfile, setCurrentProfile] = useState<'sender' | 'provider'>(() => {
    if (typeof window === 'undefined') return 'sender';
    return (localStorage.getItem('activeProfile') as 'sender' | 'provider') || 'sender';
  });

  const switchProfile = useCallback(async (profile: 'sender' | 'provider') => {
    setCurrentProfile(profile);
    await enhancedAuth.switchProfile(profile);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const profile = (localStorage.getItem('activeProfile') as 'sender' | 'provider') || 'sender';
      setCurrentProfile(profile);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    currentProfile,
    switchProfile,
    isSender: currentProfile === 'sender',
    isProvider: currentProfile === 'provider'
  };
}

/**
 * Hook for authentication guard with automatic redirects
 */
export function useAuthGuard(redirectTo: string = '/auth/login') {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    } else {
      setShouldRedirect(false);
    }
  }, [user, loading]);

  return {
    isAuthenticated: !!user,
    loading,
    shouldRedirect,
    redirectTo
  };
}

/**
 * Hook for role-based access control
 */
export function useRoleGuard(requiredRole: 'admin' | 'sender' | 'provider' | 'both') {
  const { user } = useAuth();
  const { currentProfile } = useCurrentProfile();

  const hasAccess = useCallback(() => {
    if (!user) return false;

    switch (requiredRole) {
      case 'admin':
        return user.role === 'admin';
      case 'sender':
        return currentProfile === 'sender' || user.scope === 'both';
      case 'provider':
        return currentProfile === 'provider' || user.scope === 'both';
      case 'both':
        return user.scope === 'both';
      default:
        return false;
    }
  }, [user, currentProfile, requiredRole]);

  return {
    hasAccess: hasAccess(),
    user,
    currentProfile,
    requiredRole
  };
}

/**
 * Hook for session management with automatic refresh
 */
export function useSessionManager() {
  const { user, isAuthenticated } = useAuth();

  // Auto-refresh session every 30 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await enhancedAuth.refreshSession();
      } catch (error) {
        console.warn('Session refresh failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Refresh on window focus
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = async () => {
      try {
        await enhancedAuth.refreshSession();
      } catch (error) {
        console.warn('Session refresh on focus failed:', error);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    refreshSession: enhancedAuth.refreshSession.bind(enhancedAuth)
  };
}

/**
 * Hook for data prefetching based on user actions
 */
export function useDataPrefetching() {
  const { user } = useAuth();
  const { currentProfile } = useCurrentProfile();

  const prefetchForRoute = useCallback(async (_route: string) => {
    if (!user) return;

    const prefetchMap: Record<string, string[]> = {
      '/protected/settings': [
        `/user-profile?userId=${user.id}`,
        `/api-keys?userId=${user.id}`,
        ...(currentProfile === 'sender' ? [
          `/trading-configurations?userId=${user.id}`,
          `/server-configurations?userId=${user.id}`
        ] : []),
        ...(currentProfile === 'provider' ? [
          `/provider-configurations?userId=${user.id}`
        ] : [])
      ],
      '/protected/dashboard': [
        `/user-profile?userId=${user.id}`,
        '/networks'
      ]
    };

    const endpoints = prefetchMap[_route] || [];
    await Promise.allSettled(
      endpoints.map(_endpoint => dataStore.prefetchForProfile(currentProfile, user.id))
    );
  }, [user, currentProfile]);

  const prefetchOnHover = useCallback((route: string) => {
    // Debounced prefetch on hover
    const timeoutId = setTimeout(() => {
      prefetchForRoute(route);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [prefetchForRoute]);

  return {
    prefetchForRoute,
    prefetchOnHover
  };
}
