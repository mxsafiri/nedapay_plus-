/**
 * Data Management System - Main Exports
 * Comprehensive solution for efficient data fetching, caching, and state management
 */

// Core data management
export { CacheManager, globalCache } from './cache-manager';
export { apiClient } from './api-client';
export { dataStore } from './data-store';

// React hooks
export {
  useData,
  useMutation,
  useUserProfile,
  useSenderTradingConfigurations,
  useSenderServerConfigurations,
  useProviderConfigurations,
  useNetworks,
  useApiKeys,
  usePrefetchOnProfileSwitch
} from './hooks';

// Enhanced authentication
export { enhancedAuth } from '../auth/enhanced-auth';
export {
  useAuth,
  useCurrentProfile,
  useAuthGuard,
  useRoleGuard,
  useSessionManager,
  useDataPrefetching
} from '../auth/auth-hooks';

// Types
export interface ApiResponse<T> {
  data: T;
  cached: boolean;
  timestamp: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  entries: Array<{
    key: string;
    size: number;
    age: number;
    accessCount: number;
  }>;
}

export interface DataStoreStats {
  storeCount: number;
  listenerCount: number;
  stores: Array<{
    key: string;
    hasData: boolean;
    loading: boolean;
    error: boolean;
    age: number;
  }>;
}
