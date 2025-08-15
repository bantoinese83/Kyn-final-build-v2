// withDataFetching HOC - Eliminates repeated data fetching logic
// Provides consistent loading, error, and data state management

import { ComponentType, useState, useEffect } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { FetchOptions } from "@/hooks/useDataFetching";

export interface WithDataFetchingProps<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isFetching: boolean;
  isStale: boolean;
  lastFetched: Date | null;
  refetch: () => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
}

export interface WithDataFetchingOptions extends FetchOptions {
  displayName?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
}

export function withDataFetching<T>(
  WrappedComponent: ComponentType<any>,
  dataFetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: WithDataFetchingOptions = {},
) {
  const {
    displayName = "WithDataFetching",
    showLoadingState = true,
    showErrorState = true,
    showEmptyState = true,
    emptyStateMessage = "No data available",
    ...fetchOptions
  } = options;

  const EnhancedComponent = (props: any) => {
    const {
      data,
      isLoading,
      isError,
      error,
      isFetching,
      isStale,
      lastFetched,
      refetch,
      reset,
      setData,
      setError,
    } = useDataFetching(dataFetcher, dependencies, fetchOptions);

    // Pass data fetching props to wrapped component
    const enhancedProps = {
      ...props,
      data,
      isLoading,
      isError,
      error,
      isFetching,
      isStale,
      lastFetched,
      refetch,
      reset,
      setData,
      setError,
    };

    // Show loading state if enabled and loading
    if (showLoadingState && isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show error state if enabled and error exists
    if (showErrorState && isError && error) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Show empty state if enabled and no data
    if (showEmptyState && !isLoading && !isError && !data) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600">{emptyStateMessage}</p>
          </div>
        </div>
      );
    }

    // Render wrapped component with enhanced props
    return <WrappedComponent {...enhancedProps} />;
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for simple data fetching
export function withSimpleDataFetching<T>(
  WrappedComponent: ComponentType<any>,
  dataFetcher: () => Promise<T>,
  dependencies: any[] = [],
) {
  return withDataFetching(WrappedComponent, dataFetcher, dependencies, {
    showLoadingState: true,
    showErrorState: true,
    showEmptyState: false,
  });
}

// Convenience HOC for cached data fetching
export function withCachedDataFetching<T>(
  WrappedComponent: ComponentType<any>,
  dataFetcher: () => Promise<T>,
  dependencies: any[] = [],
  cacheTime: number = 5 * 60 * 1000,
) {
  return withDataFetching(WrappedComponent, dataFetcher, dependencies, {
    showLoadingState: true,
    showErrorState: true,
    showEmptyState: false,
    cacheTime,
    staleTime: cacheTime / 2,
  });
}
