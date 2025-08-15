// Performance Hooks - Memoization, lazy loading, and performance optimization
// Eliminates expensive recalculations and improves application responsiveness

import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  globalCache,
} from "@/lib/cache-manager";

export interface MemoizationOptions {
  cacheKey?: string;
  ttl?: number;
  dependencies?: any[];
  maxCacheSize?: number;
}

export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  fallback?: React.ReactNode;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

/**
 * Enhanced memoization hook with caching
 */
export function useMemoizedValue<T>(
  factory: () => T,
  options: MemoizationOptions = {},
): T {
  const { cacheKey, ttl, dependencies = [], maxCacheSize } = options;
  const cacheRef = useRef(globalCache);

  // Use cache if key is provided
  if (cacheKey) {
    const cached = cacheGet<T>(cacheKey, cacheRef.current);
    if (cached !== null) {
      return cached;
    }
  }

  // Compute value
  const value = useMemo(factory, dependencies);

  // Cache the result if key is provided
  if (cacheKey) {
    cacheSet(cacheKey, value, ttl, cacheRef.current);
  }

  return value;
}

/**
 * Memoized callback with caching
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: MemoizationOptions = {},
): T {
  const { cacheKey, ttl, dependencies = [], maxCacheSize } = options;

  const memoizedCallback = useCallback(callback, dependencies);

  // Cache the callback if key is provided
  if (cacheKey) {
    cacheSet(cacheKey, memoizedCallback, ttl);
  }

  return memoizedCallback;
}

/**
 * Lazy loading hook with intersection observer
 */
export function useLazyLoad<T>(
  dataFetcher: () => Promise<T>,
  options: LazyLoadOptions = {},
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  ref: React.RefObject<HTMLElement>;
} {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    root = null,
    fallback,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin, root },
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, rootMargin, root]);

  useEffect(() => {
    if (isIntersecting && !data && !isLoading) {
      setIsLoading(true);
      setError(null);

      dataFetcher()
        .then(setData)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isIntersecting, data, isLoading, dataFetcher]);

  return { data, isLoading, error, ref };
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100,
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }

      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }

      lastCallTimer.current = setTimeout(
        () => {
          lastCall.current = Date.now();
          callback(...args);
        },
        delay - (now - lastCall.current),
      );
    },
    [callback, delay],
  ) as T;

  return throttledCallback;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(
  componentName: string,
): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
  });

  const renderStart = useRef<number>(0);
  const cacheStats = useRef(globalCache.getStats());

  useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStart.current;
      const newCacheStats = globalCache.getStats();

      setMetrics({
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        cacheHits: newCacheStats.hits - cacheStats.current.hits,
        cacheMisses: newCacheStats.misses - cacheStats.current.misses,
        hitRate: newCacheStats.hitRate,
      });

      cacheStats.current = newCacheStats;
    };
  });

  return metrics;
}

/**
 * Optimized list rendering hook
 */
export function useOptimizedList<T>(
  items: T[],
  options: {
    pageSize?: number;
    virtualScroll?: boolean;
    cacheKey?: string;
    ttl?: number;
  } = {},
): {
  visibleItems: T[];
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  isLoading: boolean;
} {
  const { pageSize = 20, virtualScroll = false, cacheKey, ttl } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const visibleItems = useMemoizedValue(
    () => items.slice(startIndex, endIndex),
    {
      cacheKey: cacheKey ? `${cacheKey}_page_${currentPage}` : undefined,
      ttl,
      dependencies: [items, startIndex, endIndex],
    },
  );

  const setPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  return {
    visibleItems,
    totalPages,
    currentPage,
    setPage,
    isLoading,
  };
}

/**
 * Resource preloading hook
 */
export function useResourcePreloader<T>(
  resources: Array<{ key: string; loader: () => Promise<T> }>,
  options: { preloadOnMount?: boolean; cacheResults?: boolean } = {},
): {
  preloadedResources: Map<string, T>;
  isLoading: boolean;
  preloadResource: (key: string) => Promise<void>;
  preloadAll: () => Promise<void>;
} {
  const { preloadOnMount = true, cacheResults = true } = options;
  const [preloadedResources, setPreloadedResources] = useState<Map<string, T>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  const preloadResource = useCallback(
    async (key: string) => {
      const resource = resources.find((r) => r.key === key);
      if (!resource || preloadedResources.has(key)) return;

      try {
        const result = await resource.loader();
        setPreloadedResources((prev) => new Map(prev).set(key, result));

        if (cacheResults) {
          cacheSet(`preloaded_${key}`, result, 30 * 60 * 1000); // 30 minutes
        }
      } catch (error) {
        console.warn(`Failed to preload resource ${key}:`, error);
      }
    },
    [resources, preloadedResources, cacheResults],
  );

  const preloadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all(resources.map((r) => preloadResource(r.key)));
    } finally {
      setIsLoading(false);
    }
  }, [resources, preloadResource]);

  useEffect(() => {
    if (preloadOnMount) {
      preloadAll();
    }
  }, [preloadOnMount, preloadAll]);

  return {
    preloadedResources,
    isLoading,
    preloadResource,
    preloadAll,
  };
}

/**
 * Concurrent rendering hook for non-blocking updates
 */
export function useConcurrentUpdate<T>(
  updater: (current: T) => T,
  initialValue: T,
): [T, (update: (current: T) => T) => void] {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<T>(initialValue);

  const updateValue = useCallback(
    (update: (current: T) => T) => {
      startTransition(() => {
        setValue(update);
      });
    },
    [startTransition],
  );

  return [value, updateValue];
}

/**
 * Memory optimization hook
 */
export function useMemoryOptimization<T>(
  value: T,
  options: { maxSize?: number; compression?: boolean } = {},
): T {
  const { maxSize = 1024 * 1024, compression = false } = options;
  const valueRef = useRef<T>(value);

  // Check if value size exceeds threshold
  const valueSize = JSON.stringify(value).length;

  if (valueSize > maxSize) {
    // Implement compression or optimization logic here
    console.warn(`Value size (${valueSize}) exceeds threshold (${maxSize})`);
  }

  valueRef.current = value;
  return value;
}

/**
 * Batch updates hook for performance
 */
export function useBatchUpdates<T>(
  initialValue: T,
  batchSize: number = 10,
): [T, (updates: Array<(current: T) => T>) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const updateQueue = useRef<Array<(current: T) => T>>([]);
  const batchTimeout = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updates: Array<(current: T) => T>) => {
    updateQueue.current.push(...updates);

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = setTimeout(() => {
      if (updateQueue.current.length > 0) {
        setValue((current) => {
          let result = current;
          for (const update of updateQueue.current) {
            result = update(result);
          }
          updateQueue.current = [];
          return result;
        });
      }
    }, 16); // One frame at 60fps
  }, []);

  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  return [value, batchUpdate];
}
