/**
 * Global Data Store with reactive state management and intelligent prefetching
 * Implements Observer pattern and optimistic updates for seamless UX
 */

import { apiClient } from './api-client';
import { globalCache } from './cache-manager';

type Listener<T> = (data: T) => void;
type ErrorListener = (error: Error) => void;

interface StoreState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: number;
}

interface PrefetchStrategy {
  userProfile: string[];
  senderSettings: string[];
  providerSettings: string[];
  networks: string[];
}

class DataStore {
  private stores = new Map<string, StoreState<any>>();
  private listeners = new Map<string, Set<Listener<any>>>();
  private errorListeners = new Map<string, Set<ErrorListener>>();
  private prefetchStrategies: PrefetchStrategy;

  constructor() {
    this.prefetchStrategies = {
      userProfile: [
        '/user-profile',
        '/api-keys'
      ],
      senderSettings: [
        '/trading-configurations',
        '/server-configurations',
        '/networks'
      ],
      providerSettings: [
        '/provider-configurations',
        '/networks'
      ],
      networks: [
        '/networks'
      ]
    };
  }

  /**
   * Get data from store with automatic fetching
   */
  async get<T>(key: string, fetcher?: () => Promise<T>): Promise<T | null> {
    const store = this.getStore<T>(key);

    // Return cached data if available and fresh
    if (store.data && !store.loading && Date.now() - store.lastUpdated < 5 * 60 * 1000) {
      return store.data;
    }

    // Return cached data immediately while fetching in background
    if (store.data && !store.loading) {
      this.backgroundRefresh(key, fetcher);
      return store.data;
    }

    // Fetch data if not available
    if (fetcher && !store.loading) {
      return this.fetch(key, fetcher);
    }

    return store.data;
  }

  /**
   * Fetch data and update store
   */
  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const store = this.getStore<T>(key);
    
    // Prevent duplicate requests
    if (store.loading) {
      return new Promise<T>((resolve, reject) => {
        const unsubscribe = this.subscribe(key, (data) => {
          unsubscribe();
          resolve(data as T);
        });
        
        const unsubscribeError = this.subscribeError(key, (error) => {
          unsubscribeError();
          reject(error);
        });
      });
    }

    this.updateStore(key, { loading: true, error: null });

    try {
      const data = await fetcher();
      this.updateStore(key, {
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      });
      
      this.notifyListeners(key, data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.updateStore(key, { loading: false, error: err });
      this.notifyErrorListeners(key, err);
      throw err;
    }
  }

  /**
   * Set data directly in store (for optimistic updates)
   */
  set<T>(key: string, data: T): void {
    this.updateStore(key, {
      data,
      loading: false,
      error: null,
      lastUpdated: Date.now()
    });
    
    this.notifyListeners(key, data);
  }

  /**
   * Subscribe to data changes
   */
  subscribe<T>(key: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  /**
   * Subscribe to errors
   */
  subscribeError(key: string, listener: ErrorListener): () => void {
    if (!this.errorListeners.has(key)) {
      this.errorListeners.set(key, new Set());
    }
    
    this.errorListeners.get(key)!.add(listener);
    
    return () => {
      this.errorListeners.get(key)?.delete(listener);
    };
  }

  /**
   * Invalidate store data
   */
  invalidate(key: string): void {
    this.updateStore(key, {
      data: null,
      loading: false,
      error: null,
      lastUpdated: 0
    });
    
    // Also invalidate related cache
    globalCache.invalidatePattern(key);
  }

  /**
   * Prefetch data based on user profile
   */
  async prefetchForProfile(profileType: 'sender' | 'provider', userId: string): Promise<void> {
    const strategies = profileType === 'sender' 
      ? this.prefetchStrategies.senderSettings 
      : this.prefetchStrategies.providerSettings;

    const prefetchPromises = strategies.map(endpoint => {
      const fullEndpoint = endpoint.includes('userId') 
        ? endpoint 
        : `${endpoint}?userId=${userId}`;
      
      return apiClient.prefetch(fullEndpoint);
    });

    // Also prefetch common data
    prefetchPromises.push(
      ...this.prefetchStrategies.userProfile.map(endpoint => 
        apiClient.prefetch(`${endpoint}?userId=${userId}`)
      )
    );

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Prefetch on login
   */
  async prefetchOnLogin(user: any): Promise<void> {
    // Prefetch user profile data
    await this.prefetchForProfile('sender', user.id);
    
    // Prefetch networks (common to both)
    await apiClient.prefetch('/networks');
    
    // Prefetch based on user's active profile
    const activeProfile = localStorage.getItem('activeProfile') as 'sender' | 'provider';
    if (activeProfile && activeProfile !== 'sender') {
      await this.prefetchForProfile(activeProfile, user.id);
    }
  }

  /**
   * Background refresh without affecting UI
   */
  private async backgroundRefresh<T>(key: string, fetcher?: () => Promise<T>): Promise<void> {
    if (!fetcher) return;

    try {
      const data = await fetcher();
      this.updateStore(key, {
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      });
      
      this.notifyListeners(key, data);
    } catch (error) {
      // Silently fail background refresh
      console.warn('Background refresh failed:', key, error);
    }
  }

  /**
   * Get or create store
   */
  private getStore<T>(key: string): StoreState<T> {
    if (!this.stores.has(key)) {
      this.stores.set(key, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: 0
      });
    }
    
    return this.stores.get(key)!;
  }

  /**
   * Update store state
   */
  private updateStore<T>(key: string, updates: Partial<StoreState<T>>): void {
    const store = this.getStore<T>(key);
    Object.assign(store, updates);
  }

  /**
   * Notify data listeners
   */
  private notifyListeners<T>(key: string, data: T): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Notify error listeners
   */
  private notifyErrorListeners(key: string, error: Error): void {
    const listeners = this.errorListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(error));
    }
  }

  /**
   * Get store statistics
   */
  getStats() {
    return {
      storeCount: this.stores.size,
      listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      stores: Array.from(this.stores.entries()).map(([key, store]) => ({
        key,
        hasData: !!store.data,
        loading: store.loading,
        error: !!store.error,
        age: Date.now() - store.lastUpdated
      }))
    };
  }

  /**
   * Clear all stores
   */
  clear(): void {
    this.stores.clear();
    this.listeners.clear();
    this.errorListeners.clear();
  }
}

// Global data store instance
export const dataStore = new DataStore();
