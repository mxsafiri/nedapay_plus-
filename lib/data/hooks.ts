/**
 * React hooks for seamless data fetching with caching and optimistic updates
 * Provides zero-loading-state UX through intelligent data management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from './api-client';
import { dataStore } from './data-store';

interface UseDataOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

/**
 * Main data fetching hook with intelligent caching
 */
export function useData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseDataOptions = {}
): UseDataResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    refetchInterval
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const fetcherRef = useRef(fetcher);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update fetcher ref
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Main data fetching effect
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const loadData = async () => {
      try {
        // Try to get cached data first
        const cachedData = await dataStore.get<T>(key);
        
        if (cachedData && mounted) {
          setState(prev => ({ ...prev, data: cachedData, loading: false }));
        } else {
          setState(prev => ({ ...prev, loading: true }));
        }

        // Fetch fresh data
        const freshData = await dataStore.fetch(key, fetcherRef.current);
        
        if (mounted) {
          setState({
            data: freshData,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error))
          }));
        }
      }
    };

    loadData();

    // Subscribe to data changes
    const unsubscribe = dataStore.subscribe<T>(key, (data) => {
      if (mounted) {
        setState(prev => ({ ...prev, data, loading: false, error: null }));
      }
    });

    // Subscribe to errors
    const unsubscribeError = dataStore.subscribeError(key, (error) => {
      if (mounted) {
        setState(prev => ({ ...prev, error, loading: false }));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      unsubscribeError();
    };
  }, [key, enabled]);

  // Refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    intervalRef.current = setInterval(async () => {
      try {
        await dataStore.fetch(key, fetcherRef.current);
      } catch (_error) {
        // Silently fail interval refetch
      }
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, enabled, refetchInterval]);

  // Refetch on window focus
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = async () => {
      try {
        await dataStore.fetch(key, fetcherRef.current);
      } catch (_error) {
        // Silently fail focus refetch
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, enabled, refetchOnWindowFocus]);

  // Refetch function
  const refetch = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await dataStore.fetch(key, fetcherRef.current);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [key]);

  // Optimistic update function
  const mutate = useCallback((data: T) => {
    dataStore.set(key, data);
  }, [key]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
    mutate
  };
}

/**
 * Hook for API mutations with optimistic updates
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateKeys?: string[];
    optimisticUpdate?: (variables: TVariables) => { key: string; data: any }[];
  } = {}
) {
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | null;
  }>({
    loading: false,
    error: null
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState({ loading: true, error: null });

    // Apply optimistic updates
    const rollbacks: Array<() => void> = [];
    if (options.optimisticUpdate) {
      const updates = options.optimisticUpdate(variables);
      updates.forEach(({ key, data }) => {
        const currentData = dataStore.get(key);
        rollbacks.push(() => {
          if (currentData) {
            dataStore.set(key, currentData);
          } else {
            dataStore.invalidate(key);
          }
        });
        dataStore.set(key, data);
      });
    }

    try {
      const data = await mutationFn(variables);
      
      setState({ loading: false, error: null });
      
      // Invalidate related keys
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          dataStore.invalidate(key);
        });
      }
      
      options.onSuccess?.(data, variables);
      return data;
    } catch (error) {
      // Rollback optimistic updates
      rollbacks.forEach(rollback => rollback());
      
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ loading: false, error: err });
      
      options.onError?.(err, variables);
      throw err;
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading: state.loading,
    error: state.error
  };
}

/**
 * Hook for user profile data with automatic prefetching
 */
export function useUserProfile(userId: string) {
  return useData(
    `user-profile-${userId}`,
    () => apiClient.get(`/user-profile?userId=${userId}`).then(res => res.data),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
}

/**
 * Hook for sender trading configurations
 */
export function useSenderTradingConfigurations(userId: string) {
  return useData(
    `sender-trading-${userId}`,
    () => apiClient.get(`/trading-configurations?userId=${userId}`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook for sender server configurations
 */
export function useSenderServerConfigurations(userId: string) {
  return useData(
    `sender-server-${userId}`,
    () => apiClient.get(`/server-configurations?userId=${userId}`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook for provider configurations
 */
export function useProviderConfigurations(userId: string) {
  return useData(
    `provider-config-${userId}`,
    () => apiClient.get(`/provider-configurations?userId=${userId}`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook for networks data
 */
export function useNetworks() {
  return useData(
    'networks',
    () => apiClient.get('/networks').then(res => res.data),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes (networks don't change often)
      refetchOnWindowFocus: false
    }
  );
}

/**
 * Hook for API keys
 */
export function useApiKeys(userId: string) {
  return useData(
    `api-keys-${userId}`,
    () => apiClient.get(`/api-keys?userId=${userId}`).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000
    }
  );
}

/**
 * Hook for prefetching data on profile switch
 */
export function usePrefetchOnProfileSwitch() {
  return useCallback(async (profileType: 'sender' | 'provider', userId: string) => {
    await dataStore.prefetchForProfile(profileType, userId);
  }, []);
}
