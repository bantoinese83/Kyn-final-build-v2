// Lazy Component Wrapper - Code splitting and dynamic imports
// Provides Suspense boundaries and loading states for dynamically imported components

import { Suspense, lazy, ComponentType, ReactNode, useEffect, forwardRef } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingState } from "../ui/patterns/LoadingState";

// Lazy component props interface
export interface LazyComponentProps {
  // Component to lazy load
  component: () => Promise<{ default: ComponentType<any> }>;
  // Props to pass to the component
  props?: Record<string, any>;
  // Loading fallback component
  fallback?: ReactNode;
  // Error fallback component
  errorFallback?: ReactNode;
  // Loading message
  loadingMessage?: string;
  // Error message
  errorMessage?: string;
  // Retry function for errors
  onRetry?: () => void;
  // Component name for debugging
  componentName?: string;
  // Preload the component
  preload?: boolean;
  // Preload delay in milliseconds
  preloadDelay?: number;
  // Chunk name for webpack
  chunkName?: string;
  // Webpack magic comments
  webpackChunkName?: string;
  // Webpack prefetch
  webpackPrefetch?: boolean;
  // Webpack preload
  webpackPreload?: boolean;
}

// Lazy component wrapper
export function LazyComponent({
  component,
  props = {},
  fallback,
  errorFallback,
  loadingMessage = "Loading component...",
  errorMessage = "Failed to load component",
  onRetry,
  componentName = "Component",
  preload = false,
  preloadDelay = 0,
  webpackChunkName,
  webpackPrefetch,
  webpackPreload,
}: LazyComponentProps) {
  // Create lazy component with webpack magic comments
  const LazyComponent = lazy(() => {
    // Add webpack magic comments if provided
    if (webpackChunkName || webpackPrefetch || webpackPreload) {
      const comments = [];
      if (webpackChunkName)
        comments.push(`webpackChunkName: "${webpackChunkName}"`);
      if (webpackPrefetch) comments.push("webpackPrefetch: true");
      if (webpackPreload) comments.push("webpackPreload: true");

      // This is a workaround since we can't add magic comments to dynamic imports
      // In a real implementation, you would use the magic comments in the import statement
      console.log(`Webpack magic comments: ${comments.join(", ")}`);
    }

    return component();
  });

  // Preload component if requested
  useEffect(() => {
    if (preload) {
      const timer = setTimeout(() => {
        component();
      }, preloadDelay);

      return () => clearTimeout(timer);
    }
  }, [preload, preloadDelay, component]);

  // Default loading fallback
  const defaultFallback = fallback || <LoadingState message={loadingMessage} />;

  // Default error fallback
  const defaultErrorFallback = errorFallback || (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading {componentName}
        </h3>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={defaultErrorFallback}>
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Route-based lazy component for React Router
export interface LazyRouteProps extends Omit<LazyComponentProps, "component"> {
  // Route path
  path: string;
  // Component import function
  importComponent: () => Promise<{ default: ComponentType<any> }>;
  // Route props
  routeProps?: Record<string, any>;
}

export function LazyRoute({
  path,
  importComponent,
  routeProps = {},
  ...lazyProps
}: LazyRouteProps) {
  return (
    <LazyComponent
      component={importComponent}
      props={routeProps}
      {...lazyProps}
    />
  );
}

// Page-based lazy component for larger sections
export interface LazyPageProps extends Omit<LazyComponentProps, "component"> {
  // Page import function
  importPage: () => Promise<{ default: ComponentType<any> }>;
  // Page props
  pageProps?: Record<string, any>;
  // Show loading skeleton
  showSkeleton?: boolean;
  // Skeleton component
  skeleton?: ReactNode;
}

export function LazyPage({
  importPage,
  pageProps = {},
  showSkeleton = true,
  skeleton,
  ...lazyProps
}: LazyPageProps) {
  // Enhanced loading fallback with skeleton
  const enhancedFallback = showSkeleton
    ? skeleton || (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      )
    : lazyProps.fallback;

  return (
    <LazyComponent
      component={importPage}
      props={pageProps}
      fallback={enhancedFallback}
      {...lazyProps}
    />
  );
}

// Feature-based lazy component for feature modules
export interface LazyFeatureProps
  extends Omit<LazyComponentProps, "component"> {
  // Feature import function
  importFeature: () => Promise<{ default: ComponentType<any> }>;
  // Feature props
  featureProps?: Record<string, any>;
  // Feature name
  featureName?: string;
  // Show feature loading indicator
  showFeatureLoader?: boolean;
}

export function LazyFeature({
  importFeature,
  featureProps = {},
  featureName = "Feature",
  showFeatureLoader = true,
  ...lazyProps
}: LazyFeatureProps) {
  // Enhanced loading fallback for features
  const enhancedFallback = showFeatureLoader ? (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading {featureName}...</p>
      </div>
    </div>
  ) : (
    lazyProps.fallback
  );

  return (
    <LazyComponent
      component={importFeature}
      props={featureProps}
      fallback={enhancedFallback}
      {...lazyProps}
    />
  );
}

// Utility function to create lazy components with webpack optimization
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
) {
  // Create the lazy component
  const LazyComponent = lazy(importFn);

  // Return a wrapper component
  return forwardRef<any, T>((props, ref) => (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
}

// Utility function to preload components
export function preloadComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  delay: number = 0,
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      importFn().then(() => resolve());
    }, delay);
  });
}

// Utility function to create route-based lazy components
export function createLazyRoute<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
) {
  return createLazyComponent(importFn);
}

// Export the components
export default LazyComponent;
