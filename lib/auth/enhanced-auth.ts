/**
 * Enhanced Authentication with intelligent data prefetching and caching
 * Eliminates loading states through proactive data management
 */

import { dataStore } from '../data/data-store';
import { apiClient } from '../data/api-client';
import { globalCache } from '../data/cache-manager';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  scope?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

class EnhancedAuth {
  private state: AuthState = {
    user: null,
    loading: false,
    error: null
  };

  private listeners = new Set<(state: AuthState) => void>();
  private initialized = false;

  /**
   * Initialize auth system with data prefetching
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.setState({ loading: true, error: null });

    try {
      // Check for existing session
      const user = this.getCurrentUser();
      
      if (user) {
        this.setState({ user, loading: false, error: null });
        
        // Prefetch user data in background
        await this.prefetchUserData(user);
      } else {
        this.setState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      this.setState({ 
        user: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    }

    this.initialized = true;
  }

  /**
   * Login with comprehensive data prefetching
   */
  async login(email: string, password: string): Promise<User> {
    this.setState({ loading: true, error: null });

    try {
      // Authenticate user
      const response = await apiClient.post('/auth/login', { email, password });
      const user = response.data as User;

      // Store user session
      localStorage.setItem('user', JSON.stringify(user));
      this.setState({ user, loading: false, error: null });

      // Prefetch all user data immediately after login
      await this.comprehensivePrefetch(user);

      return user;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Login failed');
      this.setState({ user: null, loading: false, error: err });
      throw err;
    }
  }

  /**
   * Logout with cleanup
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }

    // Clear all data
    localStorage.removeItem('user');
    localStorage.removeItem('activeProfile');
    sessionStorage.clear();
    globalCache.clear();
    dataStore.clear();
    
    this.setState({ user: null, loading: false, error: null });
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Switch profile with data prefetching
   */
  async switchProfile(profileType: 'sender' | 'provider'): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    // Store profile preference
    localStorage.setItem('activeProfile', profileType);

    // Prefetch profile-specific data
    await dataStore.prefetchForProfile(profileType, user.id);
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Comprehensive data prefetching after login
   */
  private async comprehensivePrefetch(user: User): Promise<void> {
    const prefetchPromises: Promise<void>[] = [];

    // 1. Prefetch user profile data
    prefetchPromises.push(
      apiClient.prefetch(`/user-profile?userId=${user.id}`),
      apiClient.prefetch(`/api-keys?userId=${user.id}`)
    );

    // 2. Prefetch networks (common to both profiles)
    prefetchPromises.push(
      apiClient.prefetch('/networks')
    );

    // 3. Prefetch based on user scope or default to sender
    const activeProfile = localStorage.getItem('activeProfile') as 'sender' | 'provider' || 'sender';
    
    if (activeProfile === 'sender' || user.scope === 'both') {
      prefetchPromises.push(
        apiClient.prefetch(`/trading-configurations?userId=${user.id}`),
        apiClient.prefetch(`/server-configurations?userId=${user.id}`)
      );
    }

    if (activeProfile === 'provider' || user.scope === 'both') {
      prefetchPromises.push(
        apiClient.prefetch(`/provider-configurations?userId=${user.id}`)
      );
    }

    // 4. Execute all prefetch operations
    await Promise.allSettled(prefetchPromises);

    // 5. Prefetch through data store for reactive updates
    await dataStore.prefetchOnLogin(user);
  }

  /**
   * Prefetch user-specific data
   */
  private async prefetchUserData(user: User): Promise<void> {
    try {
      await this.comprehensivePrefetch(user);
    } catch (error) {
      console.warn('Failed to prefetch user data:', error);
    }
  }

  /**
   * Update auth state and notify listeners
   */
  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Refresh user session with data sync
   */
  async refreshSession(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    try {
      // Verify session is still valid
      const response = await apiClient.get('/auth/verify');
      const updatedUser = response.data as User;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.setState({ user: updatedUser });

      // Refresh cached data
      await this.prefetchUserData(updatedUser);
    } catch (_error) {
      // Session invalid, logout
      await this.logout();
    }
  }

  /**
   * Get auth statistics
   */
  getStats() {
    return {
      authenticated: this.isAuthenticated(),
      user: this.state.user?.id || null,
      listeners: this.listeners.size,
      initialized: this.initialized,
      dataStore: dataStore.getStats(),
      cache: globalCache.getStats()
    };
  }
}

// Global enhanced auth instance
export const enhancedAuth = new EnhancedAuth();

// Initialize on module load
if (typeof window !== 'undefined') {
  enhancedAuth.initialize();
}
