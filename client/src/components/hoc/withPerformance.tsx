// withPerformance HOC - Performance optimization and monitoring
// Provides memoization, lazy loading, and performance tracking

import {
  ComponentType,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";

export interface WithPerformanceProps {
  performanceMetrics: {
    renderCount: number;
    lastRenderTime: number;
    averageRenderTime: number;
    isOptimized: boolean;
  };
  memoizeValue: <T>(value: T, dependencies: any[]) => T;
  memoizeCallback: <T extends (...args: any[]) => any>(
    callback: T,
    dependencies: any[],
  ) => T;
  trackRender: () => void;
  trackInteraction: (action: string, data?: any) => void;
}

export interface WithPerformanceOptions {
  displayName?: string;
  enableMemoization?: boolean;
  enableRenderTracking?: boolean;
  enableInteractionTracking?: boolean;
  performanceThreshold?: number;
  memoizationStrategy?: "strict" | "loose" | "custom";
}

export function withPerformance<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: WithPerformanceOptions = {},
) {
  const {
    displayName = "WithPerformance",
    enableMemoization = true,
    enableRenderTracking = true,
    enableInteractionTracking = true,
    performanceThreshold = 16, // 16ms = 60fps
    memoizationStrategy = "strict",
  } = options;

  const EnhancedComponent = (props: T) => {
    const renderCountRef = useRef(0);
    const renderTimesRef = useRef<number[]>([]);
    const lastRenderTimeRef = useRef(0);
    const componentName =
      WrappedComponent.displayName || WrappedComponent.name || "Component";

    // Performance tracking
    const trackRender = useCallback(() => {
      if (!enableRenderTracking) return;

      const startTime = performance.now();
      renderCountRef.current++;

      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        lastRenderTimeRef.current = renderTime;
        renderTimesRef.current.push(renderTime);

        // Keep only last 10 render times for average calculation
        if (renderTimesRef.current.length > 10) {
          renderTimesRef.current.shift();
        }

        // Log slow renders
        if (renderTime > performanceThreshold) {
          console.warn(
            `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
          );
        }
      };
    }, [enableRenderTracking, performanceThreshold, componentName]);

    // Memoization utilities
    const memoizeValue = useCallback(
      (value: any, dependencies: any[]): any => {
        if (!enableMemoization) return value;

        return useMemo(() => value, dependencies);
      },
      [enableMemoization],
    );

    const memoizeCallback = useCallback(
      (callback: any, dependencies: any[]): any => {
        if (!enableMemoization) return callback;

        return useCallback(callback, dependencies);
      },
      [enableMemoization],
    );

    // Interaction tracking
    const trackInteraction = useCallback(
      (action: string, data?: any) => {
        if (!enableInteractionTracking) return;

        console.log(`Interaction tracked: ${action}`, data);
      },
      [enableInteractionTracking],
    );

    // Performance metrics
    const performanceMetrics = useMemo(() => {
      const averageRenderTime =
        renderTimesRef.current.length > 0
          ? renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
            renderTimesRef.current.length
          : 0;

      return {
        renderCount: renderCountRef.current,
        lastRenderTime: lastRenderTimeRef.current,
        averageRenderTime,
        isOptimized: averageRenderTime <= performanceThreshold,
      };
    }, [performanceThreshold]);

    // Track render on mount and updates
    useEffect(() => {
      const cleanup = trackRender();
      return cleanup;
    });

    // Enhanced props
    const enhancedProps = {
      ...props,
      performanceMetrics,
      memoizeValue,
      memoizeCallback,
      trackRender,
      trackInteraction,
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for strict memoization
export function withStrictMemoization(WrappedComponent: ComponentType<any>) {
  return withPerformance(WrappedComponent, {
    enableMemoization: true,
    memoizationStrategy: "strict",
    enableRenderTracking: true,
  });
}

// Convenience HOC for performance monitoring only
export function withPerformanceMonitoring(
  WrappedComponent: ComponentType<any>,
) {
  return withPerformance(WrappedComponent, {
    enableMemoization: false,
    enableRenderTracking: true,
    enableInteractionTracking: true,
  });
}

// Convenience HOC for lazy loading optimization
export function withLazyOptimization(WrappedComponent: ComponentType<any>) {
  return withPerformance(WrappedComponent, {
    enableMemoization: true,
    enableRenderTracking: true,
    enableInteractionTracking: false,
    memoizationStrategy: "loose",
  });
}
