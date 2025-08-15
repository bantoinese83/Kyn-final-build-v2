// Advanced Cache Manager with Redis-like persistence and clustering
// Provides enterprise-grade caching with persistence, clustering, and advanced features

import { EventEmitter } from "events";
import { compress, decompress } from "lz4-js";

// Advanced cache entry with metadata
interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  compressed: boolean;
  metadata?: Record<string, any>;
}

// Cache statistics
interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
  compressionRatio: number;
  memoryUsage: number;
  clusterNodes: number;
  lastCleanup: number;
}

// Cluster node information
interface ClusterNode {
  id: string;
  host: string;
  port: number;
  status: "online" | "offline" | "syncing";
  lastSeen: number;
  dataSize: number;
  entryCount: number;
}

// Cache configuration
interface CacheConfig {
  maxSize: number; // Maximum memory usage in bytes
  maxEntries: number; // Maximum number of entries
  defaultTTL: number; // Default time-to-live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionThreshold: number; // Minimum size to compress (bytes)
  persistenceEnabled: boolean; // Enable persistence to localStorage/IndexedDB
  clusteringEnabled: boolean; // Enable clustering across multiple tabs/windows
  clusterSyncInterval: number; // Cluster sync interval in milliseconds
  evictionPolicy: "lru" | "lfu" | "ttl" | "random";
  enableCompression: boolean; // Enable LZ4 compression
  enableEncryption: boolean; // Enable encryption (requires crypto key)
  encryptionKey?: string; // Encryption key for sensitive data
}

// Cache event types
type CacheEvent =
  | "set"
  | "get"
  | "delete"
  | "expire"
  | "evict"
  | "cleanup"
  | "cluster_sync"
  | "persistence_save"
  | "persistence_load"
  | "compression"
  | "decompression";

// Advanced Cache Manager Class
class AdvancedCacheManager extends EventEmitter {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private clusterNodes: Map<string, ClusterNode> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private clusterSyncTimer?: NodeJS.Timeout;
  private persistenceTimer?: NodeJS.Timeout;
  private clusterId: string;
  private isLeader: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    super();

    // Default configuration
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      compressionThreshold: 1024, // 1KB
      persistenceEnabled: true,
      clusteringEnabled: true,
      clusterSyncInterval: 5000, // 5 seconds
      evictionPolicy: "lru",
      enableCompression: true,
      enableEncryption: false,
      ...config,
    };

    // Initialize statistics
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
      compressionRatio: 1.0,
      memoryUsage: 0,
      clusterNodes: 1,
      lastCleanup: Date.now(),
    };

    // Generate unique cluster ID
    this.clusterId = this.generateClusterId();

    // Initialize the cache manager
    this.initialize();
  }

  /**
   * Initialize the cache manager
   */
  private async initialize(): Promise<void> {
    try {
      // Load persisted data if enabled
      if (this.config.persistenceEnabled) {
        await this.loadFromPersistence();
      }

      // Initialize clustering if enabled
      if (this.config.clusteringEnabled) {
        this.initializeClustering();
      }

      // Start cleanup timer
      this.startCleanupTimer();

      // Start persistence timer
      if (this.config.persistenceEnabled) {
        this.startPersistenceTimer();
      }

      console.log("Advanced Cache Manager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Advanced Cache Manager:", error);
    }
  }

  /**
   * Set a value in the cache
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size: this.calculateSize(value),
        compressed: false,
        metadata,
      };

      // Check if compression is needed
      if (
        this.config.enableCompression &&
        entry.size > this.config.compressionThreshold
      ) {
        entry.value = (await this.compressValue(value)) as T;
        entry.compressed = true;
        entry.size = this.calculateSize(entry.value);
      }

      // Check if encryption is needed
      if (this.config.enableEncryption && this.config.encryptionKey) {
        entry.value = (await this.encryptValue(entry.value)) as T;
      }

      // Check capacity and evict if necessary
      await this.ensureCapacity(entry.size);

      // Store the entry
      this.cache.set(key, entry);
      this.stats.totalEntries++;
      this.stats.totalSize += entry.size;

      // Emit set event
      this.emit("set", key, entry);

      // Sync with cluster if enabled
      if (this.config.clusteringEnabled) {
        this.syncToCluster("set", key, entry);
      }
    } catch (error) {
      console.error("Failed to set cache entry:", error);
      throw error;
    }
  }

  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.stats.missCount++;
        this.emit("get", key, null);
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        await this.delete(key);
        this.stats.missCount++;
        this.emit("get", key, null);
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      // Decompress if necessary
      let value = entry.value;
      if (entry.compressed) {
        value = (await this.decompressValue(value)) as T;
      }

      // Decrypt if necessary
      if (this.config.enableEncryption && this.config.encryptionKey) {
        value = (await this.decryptValue(value)) as T;
      }

      this.stats.hitCount++;
      this.emit("get", key, value);
      return value;
    } catch (error) {
      console.error("Failed to get cache entry:", error);
      this.stats.missCount++;
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        return false;
      }

      // Update statistics
      this.stats.totalEntries--;
      this.stats.totalSize -= entry.size;

      // Remove from cache
      this.cache.delete(key);

      // Emit delete event
      this.emit("delete", key, entry);

      // Sync with cluster if enabled
      if (this.config.clusteringEnabled) {
        this.syncToCluster("delete", key, entry);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete cache entry:", error);
      return false;
    }
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cluster information
   */
  getClusterInfo(): ClusterNode[] {
    return Array.from(this.clusterNodes.values());
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      this.stats.totalEntries = 0;
      this.stats.totalSize = 0;
      this.stats.evictionCount = 0;

      // Emit clear event
      this.emit("clear");

      // Sync with cluster if enabled
      if (this.config.clusteringEnabled) {
        this.syncToCluster("clear", null, null);
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      throw error;
    }
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size information
   */
  size(): { entries: number; bytes: number } {
    return {
      entries: this.stats.totalEntries,
      bytes: this.stats.totalSize,
    };
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: RegExp): Promise<number> {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      if (await this.delete(key)) {
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Set multiple values at once
   */
  async setMultiple(
    entries: Array<{
      key: string;
      value: any;
      ttl?: number;
      metadata?: Record<string, any>;
    }>,
  ): Promise<void> {
    const promises = entries.map(({ key, value, ttl, metadata }) =>
      this.set(key, value, ttl, metadata),
    );
    await Promise.all(promises);
  }

  /**
   * Get multiple values at once
   */
  async getMultiple<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    const promises = keys.map(async (key) => {
      const value = await this.get<T>(key);
      result.set(key, value);
    });
    await Promise.all(promises);
    return result;
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.ttl = ttl;
    entry.timestamp = Date.now();
    return true;
  }

  /**
   * Get time to live for a key
   */
  getTTL(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -1;

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if an entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Calculate size of a value
   */
  private calculateSize(value: any): number {
    try {
      const serialized = JSON.stringify(value);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Ensure cache capacity
   */
  private async ensureCapacity(requiredSize: number): Promise<void> {
    while (
      this.stats.totalSize + requiredSize > this.config.maxSize ||
      this.stats.totalEntries >= this.config.maxEntries
    ) {
      await this.evictEntry();
    }
  }

  /**
   * Evict an entry based on eviction policy
   */
  private async evictEntry(): Promise<void> {
    let keyToEvict: string | null = null;

    switch (this.config.evictionPolicy) {
      case "lru":
        keyToEvict = this.findLRUKey();
        break;
      case "lfu":
        keyToEvict = this.findLFUKey();
        break;
      case "ttl":
        keyToEvict = this.findExpiredKey();
        break;
      case "random":
        keyToEvict = this.findRandomKey();
        break;
    }

    if (keyToEvict) {
      await this.delete(keyToEvict);
      this.stats.evictionCount++;
      this.emit("evict", keyToEvict);
    }
  }

  /**
   * Find least recently used key
   */
  private findLRUKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Find least frequently used key
   */
  private findLFUKey(): string | null {
    let leastUsedKey: string | null = null;
    let leastUsedCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastUsedCount) {
        leastUsedCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  /**
   * Find expired key
   */
  private findExpiredKey(): string | null {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        return key;
      }
    }
    return null;
  }

  /**
   * Find random key
   */
  private findRandomKey(): string | null {
    const keys = Array.from(this.cache.keys());
    if (keys.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  /**
   * Compress value using LZ4
   */
  private async compressValue<T>(value: T): Promise<T> {
    try {
      const serialized = JSON.stringify(value);
      const compressed = compress(serialized);
      return compressed as T;
    } catch (error) {
      console.warn("Compression failed, using original value:", error);
      return value;
    }
  }

  /**
   * Decompress value using LZ4
   */
  private async decompressValue<T>(value: T): Promise<T> {
    try {
      const decompressed = decompress(value as any);
      return JSON.parse(decompressed) as T;
    } catch (error) {
      console.warn("Decompression failed, using compressed value:", error);
      return value;
    }
  }

  /**
   * Encrypt value
   */
  private async encryptValue<T>(value: T): Promise<T> {
    // This is a placeholder for encryption implementation
    // In a real implementation, you would use Web Crypto API
    return value;
  }

  /**
   * Decrypt value
   */
  private async decryptValue<T>(value: T): Promise<T> {
    // This is a placeholder for decryption implementation
    // In a real implementation, you would use Web Crypto API
    return value;
  }

  /**
   * Initialize clustering
   */
  private initializeClustering(): void {
    // Register this node
    this.clusterNodes.set(this.clusterId, {
      id: this.clusterId,
      host: window.location.hostname,
      port: window.location.port ? parseInt(window.location.port) : 80,
      status: "online",
      lastSeen: Date.now(),
      dataSize: this.stats.totalSize,
      entryCount: this.stats.totalEntries,
    });

    // Listen for cluster messages
    window.addEventListener("storage", this.handleClusterMessage.bind(this));
    window.addEventListener("message", this.handleClusterMessage.bind(this));

    // Start cluster sync timer
    this.startClusterSyncTimer();

    // Try to become leader
    this.tryBecomeLeader();
  }

  /**
   * Handle cluster messages
   */
  private handleClusterMessage(event: StorageEvent | MessageEvent): void {
    try {
      let data: any;

      if (event instanceof StorageEvent) {
        if (event.key?.startsWith("cache_cluster_")) {
          data = JSON.parse(event.newValue || "{}");
        }
      } else if (event instanceof MessageEvent) {
        if (event.data?.type === "cache_cluster") {
          data = event.data;
        }
      }

      if (data && data.source !== this.clusterId) {
        this.processClusterMessage(data);
      }
    } catch (error) {
      console.error("Failed to process cluster message:", error);
    }
  }

  /**
   * Process cluster message
   */
  private processClusterMessage(message: any): void {
    switch (message.action) {
      case "set":
        this.cache.set(message.key, message.entry);
        break;
      case "delete":
        this.cache.delete(message.key);
        break;
      case "clear":
        this.cache.clear();
        break;
      case "sync_request":
        this.sendClusterSync();
        break;
    }
  }

  /**
   * Sync to cluster
   */
  private syncToCluster(action: string, key: string | null, entry: any): void {
    const message = {
      type: "cache_cluster",
      source: this.clusterId,
      action,
      key,
      entry,
      timestamp: Date.now(),
    };

    // Broadcast to other tabs via localStorage
    try {
      localStorage.setItem(
        `cache_cluster_${Date.now()}`,
        JSON.stringify(message),
      );
    } catch (error) {
      console.warn("Failed to sync to cluster via localStorage:", error);
    }

    // Broadcast to other windows via postMessage
    try {
      window.postMessage(message, "*");
    } catch (error) {
      console.warn("Failed to sync to cluster via postMessage:", error);
    }
  }

  /**
   * Send cluster sync
   */
  private sendClusterSync(): void {
    const syncData = {
      type: "cache_cluster",
      source: this.clusterId,
      action: "sync_data",
      data: Array.from(this.cache.entries()),
      timestamp: Date.now(),
    };

    this.syncToCluster("sync_data", null, syncData);
  }

  /**
   * Try to become cluster leader
   */
  private tryBecomeLeader(): void {
    // Simple leader election based on timestamp
    const leaderKey = "cache_cluster_leader";
    const now = Date.now();

    try {
      const currentLeader = localStorage.getItem(leaderKey);
      if (!currentLeader || now - parseInt(currentLeader) > 30000) {
        localStorage.setItem(leaderKey, now.toString());
        this.isLeader = true;
        console.log("Became cluster leader");
      }
    } catch (error) {
      console.warn("Failed to become cluster leader:", error);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Start cluster sync timer
   */
  private startClusterSyncTimer(): void {
    this.clusterSyncTimer = setInterval(() => {
      if (this.isLeader) {
        this.syncToCluster("sync_request", null, null);
      }
    }, this.config.clusterSyncInterval);
  }

  /**
   * Start persistence timer
   */
  private startPersistenceTimer(): void {
    this.persistenceTimer = setInterval(() => {
      this.saveToPersistence();
    }, 30000); // Save every 30 seconds
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    let cleanedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      this.emit("cleanup", cleanedCount);
    }

    this.stats.lastCleanup = Date.now();
  }

  /**
   * Save cache to persistence
   */
  private async saveToPersistence(): Promise<void> {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now(),
      };

      localStorage.setItem("advanced_cache_data", JSON.stringify(data));
      this.emit("persistence_save", data);
    } catch (error) {
      console.error("Failed to save cache to persistence:", error);
    }
  }

  /**
   * Load cache from persistence
   */
  private async loadFromPersistence(): Promise<void> {
    try {
      const data = localStorage.getItem("advanced_cache_data");
      if (!data) return;

      const parsed = JSON.parse(data);

      // Check if data is not too old (24 hours)
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("advanced_cache_data");
        return;
      }

      // Restore cache entries
      for (const [key, entry] of parsed.entries) {
        this.cache.set(key, entry);
      }

      // Restore statistics
      this.stats = { ...parsed.stats };

      this.emit("persistence_load", parsed);
      console.log("Cache restored from persistence");
    } catch (error) {
      console.error("Failed to load cache from persistence:", error);
      localStorage.removeItem("advanced_cache_data");
    }
  }

  /**
   * Generate unique cluster ID
   */
  private generateClusterId(): string {
    return `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy the cache manager
   */
  destroy(): void {
    // Clear timers
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.clusterSyncTimer) {
      clearInterval(this.clusterSyncTimer);
    }
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }

    // Save final state
    if (this.config.persistenceEnabled) {
      this.saveToPersistence();
    }

    // Clear cache
    this.cache.clear();

    // Remove event listeners
    this.removeAllListeners();

    console.log("Advanced Cache Manager destroyed");
  }
}

// Create and export singleton instance
export const advancedCacheManager = new AdvancedCacheManager();

// Export the class for custom instances
export { AdvancedCacheManager };

// Export types
export type { CacheConfig, CacheStats, ClusterNode, CacheEvent };
