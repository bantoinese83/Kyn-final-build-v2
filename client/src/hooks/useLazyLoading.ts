// Lazy Loading Hook - Intelligent preloading and performance optimization
// Provides intersection observer integration, preloading strategies, and performance monitoring

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

// Lazy loading configuration interface
export interface LazyLoadingConfig {
  // Threshold for intersection observer
  threshold?: number;
  // Root margin for intersection observer
  rootMargin?: string;
  // Whether to trigger once
  triggerOnce?: boolean;
  // Preload delay in milliseconds
  preloadDelay?: number;
  // Preload on hover
  preloadOnHover?: boolean;
  // Preload on focus
  preloadOnFocus?: boolean;
  // Priority level for preloading
  priority?: "high" | "medium" | "low";
  // Cache the loaded component
  cache?: boolean;
  // Retry attempts on failure
  retryAttempts?: number;
  // Retry delay in milliseconds
  retryDelay?: number;
}

// Lazy loading state interface
export interface LazyLoadingState {
  // Whether the component is in view
  isInView: boolean;
  // Whether the component is loaded
  isLoaded: boolean;
  // Whether the component is loading
  isLoading: boolean;
  // Whether there was an error
  hasError: boolean;
  // Error message if any
  error: string | null;
  // Load the component
  load: () => Promise<void>;
  // Retry loading on error
  retry: () => Promise<void>;
  // Preload the component
  preload: () => Promise<void>;
  // Reset the loading state
  reset: () => void;
}

// Lazy loading hook for components
export function useLazyComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  config: LazyLoadingConfig = {},
): LazyLoadingState {
  const { measureAsync } = usePerformanceMonitor();

  // Configuration with defaults
  const {
    threshold = 0.1,
    rootMargin = "50px",
    triggerOnce = true,
    preloadDelay = 0,
    preloadOnHover = false,
    preloadOnFocus = false,
    priority = "medium",
    cache = true,
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  // State management
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const componentRef = useRef<React.ComponentType<T> | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const preloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection observer hook
  const { ref: intersectionRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  });

  // Load component function
  const loadComponent = useCallback(async (): Promise<void> => {
    if (isLoaded || isLoading || componentRef.current) return;

    setIsLoading(true);
    setHasError(false);
    setError(null);

    try {
      const result = await measureAsync(
        "lazyComponentLoad",
        async () => {
          return importFn();
        },
        "custom",
      );

      componentRef.current = result.default;
      setIsLoaded(true);

      // Cache the component if enabled
      if (cache) {
        // Store in memory cache
        (window as any).__lazyComponentCache =
          (window as any).__lazyComponentCache || {};
        (window as any).__lazyComponentCache[importFn.toString()] =
          result.default;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load component";
      setError(errorMessage);
      setHasError(true);

      // Retry logic
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          loadComponent();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    importFn,
    isLoaded,
    isLoading,
    cache,
    retryCount,
    retryAttempts,
    retryDelay,
    measureAsync,
  ]);

  // Preload component function
  const preloadComponent = useCallback(async (): Promise<void> => {
    if (isLoaded || isLoading || componentRef.current) return;

    // Clear existing preload timer
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current);
    }

    // Set preload delay
    preloadTimerRef.current = setTimeout(() => {
      loadComponent();
    }, preloadDelay);
  }, [isLoaded, isLoading, preloadDelay, loadComponent]);

  // Retry loading function
  const retry = useCallback(async (): Promise<void> => {
    setRetryCount(0);
    setHasError(false);
    setError(null);
    await loadComponent();
  }, [loadComponent]);

  // Reset function
  const reset = useCallback(() => {
    setIsLoaded(false);
    setIsLoading(false);
    setHasError(false);
    setError(null);
    setRetryCount(0);
    componentRef.current = null;
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current);
    }
  }, []);

  // Handle intersection
  useEffect(() => {
    if (inView && !isLoaded && !isLoading) {
      loadComponent();
    }
  }, [inView, isLoaded, isLoading, loadComponent]);

  // Handle hover preloading
  useEffect(() => {
    if (!preloadOnHover) return;

    const handleMouseEnter = () => {
      preloadComponent();
    };

    const element = intersectionRef.current;
    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      return () => element.removeEventListener("mouseenter", handleMouseEnter);
    }
  }, [preloadOnHover, preloadComponent, intersectionRef]);

  // Handle focus preloading
  useEffect(() => {
    if (!preloadOnFocus) return;

    const handleFocus = () => {
      preloadComponent();
    };

    const element = intersectionRef.current;
    if (element) {
      element.addEventListener("focus", handleFocus);
      return () => element.removeEventListener("focus", handleFocus);
    }
  }, [preloadOnFocus, preloadComponent, intersectionRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current);
      }
    };
  }, []);

  return {
    isInView: inView,
    isLoaded,
    isLoading,
    hasError,
    error,
    load: loadComponent,
    retry,
    preload: preloadComponent,
    reset,
  };
}

// Lazy loading hook for images
export function useLazyImage(
  src: string,
  config: LazyLoadingConfig = {},
): LazyLoadingState {
  const { measureAsync } = usePerformanceMonitor();

  // Configuration with defaults
  const {
    threshold = 0.1,
    rootMargin = "50px",
    triggerOnce = true,
    preloadDelay = 0,
    preloadOnHover = true,
    preloadOnFocus = false,
    priority = "medium",
    cache = true,
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  // State management
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const preloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection observer hook
  const { ref: intersectionRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  });

  // Load image function
  const loadImage = useCallback(async (): Promise<void> => {
    if (isLoaded || isLoading || !src) return;

    setIsLoading(true);
    setHasError(false);
    setError(null);

    try {
      await measureAsync(
        "lazyImageLoad",
        async () => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
              setIsLoaded(true);
              resolve();
            };

            img.onerror = () => {
              reject(new Error(`Failed to load image: ${src}`));
            };

            img.src = src;
          });
        },
        "custom",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load image";
      setError(errorMessage);
      setHasError(true);

      // Retry logic
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          loadImage();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    src,
    isLoaded,
    isLoading,
    retryCount,
    retryAttempts,
    retryDelay,
    measureAsync,
  ]);

  // Preload image function
  const preloadImage = useCallback(async (): Promise<void> => {
    if (isLoaded || isLoading || !src) return;

    // Clear existing preload timer
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current);
    }

    // Set preload delay
    preloadTimerRef.current = setTimeout(() => {
      loadImage();
    }, preloadDelay);
  }, [src, isLoaded, isLoading, preloadDelay, loadImage]);

  // Retry loading function
  const retry = useCallback(async (): Promise<void> => {
    setRetryCount(0);
    setHasError(false);
    setError(null);
    await loadImage();
  }, [loadImage]);

  // Reset function
  const reset = useCallback(() => {
    setIsLoaded(false);
    setIsLoading(false);
    setHasError(false);
    setError(null);
    setRetryCount(0);
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current);
    }
  }, []);

  // Handle intersection
  useEffect(() => {
    if (inView && !isLoaded && !isLoading) {
      loadImage();
    }
  }, [inView, isLoaded, isLoading, loadImage]);

  // Handle hover preloading
  useEffect(() => {
    if (!preloadOnHover) return;

    const handleMouseEnter = () => {
      preloadImage();
    };

    const element = intersectionRef.current;
    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      return () => element.removeEventListener("mouseenter", handleMouseEnter);
    }
  }, [preloadOnHover, preloadImage, intersectionRef]);

  // Handle focus preloading
  useEffect(() => {
    if (!preloadOnFocus) return;

    const handleFocus = () => {
      preloadImage();
    };

    const element = intersectionRef.current;
    if (element) {
      element.addEventListener("focus", handleFocus);
      return () => element.removeEventListener("focus", handleFocus);
    }
  }, [preloadOnFocus, preloadImage, intersectionRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current);
      }
    };
  }, []);

  return {
    isInView: inView,
    isLoaded,
    isLoading,
    hasError,
    error,
    load: loadImage,
    retry,
    preload: preloadImage,
    reset,
  };
}

// Utility hook for managing multiple lazy components
export function useLazyComponents<T extends Record<string, () => Promise<any>>>(
  components: T,
  config: LazyLoadingConfig = {},
): Record<keyof T, LazyLoadingState> {
  const states: Partial<Record<keyof T, LazyLoadingState>> = {};

  Object.keys(components).forEach((key) => {
    states[key as keyof T] = useLazyComponent(components[key], config);
  });

  return states as Record<keyof T, LazyLoadingState>;
}

// Utility hook for preloading strategies
export function usePreloadStrategy() {
  const preloadHighPriority = useCallback(() => {
    // Preload high-priority components
    const highPriorityComponents = [
      () => import("@/components/MainFeed/MainFeed"),
      () => import("@/components/Photos/Photos"),
      () => import("@/components/Recipes/Recipes"),
    ];

    highPriorityComponents.forEach((importFn, index) => {
      setTimeout(() => importFn(), index * 1000);
    });
  }, []);

  const preloadMediumPriority = useCallback(() => {
    // Preload medium-priority components
    const mediumPriorityComponents = [
      () => import("@/components/Events/Events"),
      () => import("@/components/Posts/Posts"),
      () => import("@/components/Chat/Chat"),
    ];

    mediumPriorityComponents.forEach((importFn, index) => {
      setTimeout(() => importFn(), index * 1500);
    });
  }, []);

  const preloadLowPriority = useCallback(() => {
    // Preload low-priority components
    const lowPriorityComponents = [
      () => import("@/components/Settings/Settings"),
      () => import("@/components/UserProfile/UserProfile"),
      () => import("@/components/FamilyManagement/FamilyManagement"),
    ];

    lowPriorityComponents.forEach((importFn, index) => {
      setTimeout(() => importFn(), index * 2000);
    });
  }, []);

  return {
    preloadHighPriority,
    preloadMediumPriority,
    preloadLowPriority,
  };
}

// Export the hooks
export {
  useLazyComponent,
  useLazyImage,
  useLazyComponents,
  usePreloadStrategy,
};


