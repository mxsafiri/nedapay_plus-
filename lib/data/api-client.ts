/**
 * Advanced API Client with intelligent caching, retry logic, and request deduplication
 * Implements software engineering best practices for data fetching
 */

import { globalCache } from './cache-manager';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  dedupe?: boolean;
}

interface ApiResponse<T> {
  data: T;
  cached: boolean;
  timestamp: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private pendingRequests = new Map<string, Promise<any>>();
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Main request method with caching and deduplication
   */
  async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = method === 'GET',
      cacheTTL,
      retries = 3,
      timeout = 10000,
      dedupe = true
    } = config;

    const cacheKey = this.generateCacheKey(endpoint, method, body);
    
    // Check cache first for GET requests
    if (cache && method === 'GET') {
      const cachedData = globalCache.get<T>(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          cached: true,
          timestamp: Date.now()
        };
      }
    }

    // Request deduplication
    if (dedupe && this.pendingRequests.has(cacheKey)) {
      const data = await this.pendingRequests.get(cacheKey);
      return {
        data,
        cached: false,
        timestamp: Date.now()
      };
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(
      endpoint,
      method,
      { ...this.defaultHeaders, ...headers },
      body,
      retries,
      timeout
    );

    // Store pending request for deduplication
    if (dedupe) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const data = await requestPromise;

      // Cache successful GET requests
      if (cache && method === 'GET' && data) {
        globalCache.set(cacheKey, data, cacheTTL);
      }

      // Invalidate related cache entries for mutations
      if (method !== 'GET') {
        this.invalidateRelatedCache(endpoint);
      }

      return {
        data,
        cached: false,
        timestamp: Date.now()
      };
    } finally {
      // Clean up pending request
      if (dedupe) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    body: any,
    retries: number,
    timeout: number
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        const isLastAttempt = attempt === retries;
        
        if (isLastAttempt) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = this.retryDelays[attempt] || 4000;
        const jitter = Math.random() * 1000;
        await this.sleep(delay + jitter);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Prefetch data for better UX
   */
  async prefetch<T>(endpoint: string, config: RequestConfig = {}): Promise<void> {
    try {
      await this.request<T>(endpoint, { ...config, cache: true });
    } catch (error) {
      // Silently fail prefetch to not affect UX
      console.warn('Prefetch failed:', endpoint, error);
    }
  }

  /**
   * Batch prefetch multiple endpoints
   */
  async batchPrefetch(endpoints: Array<{ endpoint: string; config?: RequestConfig }>): Promise<void> {
    const promises = endpoints.map(({ endpoint, config }) => 
      this.prefetch(endpoint, config)
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * GET request shorthand
   */
  async get<T>(endpoint: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request shorthand
   */
  async post<T>(endpoint: string, data: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  /**
   * PUT request shorthand
   */
  async put<T>(endpoint: string, data: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  /**
   * DELETE request shorthand
   */
  async delete<T>(endpoint: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(endpoint: string, method: string, body?: any): string {
    const bodyHash = body ? btoa(JSON.stringify(body)).slice(0, 8) : '';
    return `${method}:${endpoint}:${bodyHash}`;
  }

  /**
   * Invalidate related cache entries after mutations
   */
  private invalidateRelatedCache(endpoint: string): void {
    // Extract resource from endpoint (e.g., /api/users/123 -> users)
    const resource = endpoint.split('/').filter(Boolean)[1];
    if (resource) {
      globalCache.invalidatePattern(`GET:.*${resource}.*`);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all pending requests
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get request statistics
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      cacheStats: globalCache.getStats()
    };
  }
}

// Global API client instance
export const apiClient = new ApiClient('/api');
