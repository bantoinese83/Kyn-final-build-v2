// Cache Manager - Comprehensive caching system for performance optimization
// Implements in-memory caching with TTL, LRU eviction, and intelligent cache invalidation

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  enableCompression?: boolean; // Enable data compression for large objects
  enablePersistent?: boolean; // Enable persistent storage (localStorage)
  namespace?: string; // Cache namespace for organization
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated memory size
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalItems: number;
  totalSize: number;
  evictions: number;
  namespace: string;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats;
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // 1000 items default
      enableCompression: false,
      enablePersistent: false,
      namespace: "default",
      ...options,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalItems: 0,
      totalSize: 0,
      evictions: 0,
      namespace: this.options.namespace,
    };

    this.initializeCache();
    this.startCleanupInterval();
  }

  /**
   * Initialize cache from persistent storage if enabled
   */
  private initializeCache(): void {
    if (this.options.enablePersistent) {
      try {
        const stored = localStorage.getItem(`cache_${this.options.namespace}`);
        if (stored) {
          const data = JSON.parse(stored);
          this.cache = new Map(data);
          this.updateStats();
        }
      } catch (error) {
        console.warn("Failed to restore cache from persistent storage:", error);
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.options.ttl);
    const size = this.estimateSize(value);

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      expiresAt,
      accessCount: 1,
      lastAccessed: now,
      size,
    };

    this.cache.set(key, entry);
    this.updateStats();
    this.persistCache();
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateStats();

    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      this.persistCache();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.updateStats();
    this.persistCache();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Set multiple values at once
   */
  setMultiple<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  /**
   * Get multiple values at once
   */
  getMultiple<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach((key) => {
      result.set(key, this.get<T>(key));
    });
    return result;
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.updateStats();
      this.persistCache();
    }
    return count;
  }

  /**
   * Invalidate cache by namespace
   */
  invalidateNamespace(namespace: string): number {
    return this.invalidatePattern(new RegExp(`^${namespace}:`));
  }

  /**
   * Refresh TTL for a key
   */
  refresh(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.expiresAt = Date.now() + (ttl || this.options.ttl);
    entry.lastAccessed = Date.now();
    this.persistCache();
    return true;
  }

  /**
   * Get cache entry metadata
   */
  getEntry(key: string): CacheEntry<any> | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    return { ...entry };
  }

  /**
   * Estimate memory size of a value
   */
  private estimateSize(value: any): number {
    try {
      const serialized = JSON.stringify(value);
      return new Blob([serialized]).size;
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  /**
   * Evict least recently used items
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const toEvict = Math.ceil(this.options.maxSize * 0.1); // Evict 10%
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.updateStats();
      this.persistCache();
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalItems = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values()).reduce(
      (total, entry) => total + entry.size,
      0,
    );
    this.stats.hitRate =
      this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
  }

  /**
   * Persist cache to localStorage if enabled
   */
  private persistCache(): void {
    if (this.options.enablePersistent) {
      try {
        const data = Array.from(this.cache.entries());
        localStorage.setItem(
          `cache_${this.options.namespace}`,
          JSON.stringify(data),
        );
      } catch (error) {
        console.warn("Failed to persist cache:", error);
      }
    }
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Global cache instances for different use cases
export const globalCache = new CacheManager({
  namespace: "global",
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 2000,
  enablePersistent: true,
});

export const userCache = new CacheManager({
  namespace: "user",
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 1000,
  enablePersistent: true,
});

export const apiCache = new CacheManager({
  namespace: "api",
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 500,
  enablePersistent: false,
});

// Convenience functions for common cache operations
export const cacheGet = <T>(
  key: string,
  cache: CacheManager = globalCache,
): T | null => {
  return cache.get<T>(key);
};

export const cacheSet = <T>(
  key: string,
  value: T,
  ttl?: number,
  cache: CacheManager = globalCache,
): void => {
  cache.set(key, value, ttl);
};

export const cacheDelete = (
  key: string,
  cache: CacheManager = globalCache,
): boolean => {
  return cache.delete(key);
};

export const cacheClear = (cache: CacheManager = globalCache): void => {
  cache.clear();
};
