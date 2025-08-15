// Data Fetching Hook - Unified data fetching patterns
// Eliminates repeated data fetching logic and provides consistent patterns

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "./use-toast";

export interface FetchOptions {
  immediate?: boolean;
  refetchOnMount?: boolean;
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
  retryCount?: number;
  retryDelay?: number;
  cacheTime?: number;
  staleTime?: number;
}

export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isFetching: boolean;
  isStale: boolean;
  lastFetched: Date | null;
}

export interface FetchActions<T> {
  refetch: () => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
}

export function useDataFetching<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: FetchOptions = {},
) {
  const {
    immediate = true,
    refetchOnMount = true,
    refetchOnFocus = false,
    refetchOnReconnect = false,
    retryCount = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000, // 1 minute
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    isStale: false,
    lastFetched: null,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const staleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    if (!state.lastFetched) return true;
    return Date.now() - state.lastFetched.getTime() > staleTime;
  }, [state.lastFetched, staleTime]);

  // Set stale state
  const setStaleState = useCallback(() => {
    if (state.data && !state.isStale && isDataStale()) {
      setState((prev) => ({ ...prev, isStale: true }));
    }
  }, [state.data, state.isStale, isDataStale]);

  // Clear stale timeout
  const clearStaleTimeout = useCallback(() => {
    if (staleTimeoutRef.current) {
      clearTimeout(staleTimeoutRef.current);
      staleTimeoutRef.current = null;
    }
  }, []);

  // Set stale timeout
  const setStaleTimeout = useCallback(() => {
    clearStaleTimeout();
    if (staleTime > 0) {
      staleTimeoutRef.current = setTimeout(setStaleState, staleTime);
    }
  }, [clearStaleTimeout, setStaleState, staleTime]);

  // Clear cache timeout
  const clearCacheTimeout = useCallback(() => {
    if (cacheTimeoutRef.current) {
      clearTimeout(cacheTimeoutRef.current);
      cacheTimeoutRef.current = null;
    }
  }, []);

  // Set cache timeout
  const setCacheTimeout = useCallback(() => {
    clearCacheTimeout();
    if (cacheTime > 0) {
      cacheTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, data: null, lastFetched: null }));
      }, cacheTime);
    }
  }, [clearCacheTimeout, cacheTime]);

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (isRetry = false): Promise<void> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setState((prev) => ({
          ...prev,
          isLoading: !isRetry,
          isFetching: true,
          isError: false,
          error: null,
        }));

        const result = await fetcher();

        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          data: result,
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
          isStale: false,
          lastFetched: new Date(),
        }));

        // Reset retry count on success
        retryCountRef.current = 0;

        // Set timeouts
        setStaleTimeout();
        setCacheTimeout();
      } catch (error) {
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";

        // Handle retry logic
        if (!isRetry && retryCountRef.current < retryCount) {
          retryCountRef.current++;

          setTimeout(() => {
            fetchData(true);
          }, retryDelay * retryCountRef.current);

          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isFetching: false,
          isError: true,
          error: errorMessage,
        }));

        // Show error toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [fetcher, retryCount, retryDelay, toast, setStaleTimeout, setCacheTimeout],
  );

  // Refetch data
  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      isStale: false,
      lastFetched: null,
    });
    retryCountRef.current = 0;
    clearStaleTimeout();
    clearCacheTimeout();
  }, [clearStaleTimeout, clearCacheTimeout]);

  // Set data manually
  const setData = useCallback(
    (data: T) => {
      setState((prev) => ({
        ...prev,
        data,
        isStale: false,
        lastFetched: new Date(),
      }));
      setStaleTimeout();
      setCacheTimeout();
    },
    [setStaleTimeout, setCacheTimeout],
  );

  // Set error manually
  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      isError: true,
      error,
      isLoading: false,
      isFetching: false,
    }));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // Refetch on dependencies change
  useEffect(() => {
    if (refetchOnMount && dependencies.length > 0) {
      fetchData();
    }
  }, dependencies);

  // Refetch on focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      if (isDataStale()) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnFocus, isDataStale, fetchData]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      if (isDataStale()) {
        fetchData();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [refetchOnReconnect, isDataStale, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearStaleTimeout();
      clearCacheTimeout();
    };
  }, [clearStaleTimeout, clearCacheTimeout]);

  return {
    ...state,
    refetch,
    reset,
    setData,
    setError,
  };
}

// Convenience hook for simple data fetching
export function useSimpleDataFetching<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
) {
  return useDataFetching(fetcher, dependencies, {
    immediate: true,
    refetchOnMount: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    retryCount: 1,
    cacheTime: 0,
    staleTime: 0,
  });
}

// Convenience hook for cached data fetching
export function useCachedDataFetching<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  cacheTime: number = 5 * 60 * 1000,
) {
  return useDataFetching(fetcher, dependencies, {
    immediate: true,
    refetchOnMount: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    retryCount: 3,
    cacheTime,
    staleTime: cacheTime / 2,
  });
}

// Convenience hook for real-time data fetching
export function useRealTimeDataFetching<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  interval: number = 30000,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval
    if (interval > 0) {
      intervalId = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, dependencies);

  return { data, isLoading, error, refetch: () => fetchData() };
}
