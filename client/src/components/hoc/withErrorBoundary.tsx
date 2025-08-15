// withErrorBoundary HOC - Consistent error handling and fallback UI
// Provides error boundaries, error reporting, and graceful degradation

import React, { ComponentType, Component, ReactNode, ErrorInfo } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export interface WithErrorBoundaryProps {
  errorBoundary: {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
    resetError: () => void;
    reportError: (error: Error, errorInfo?: ErrorInfo) => void;
  };
}

export interface WithErrorBoundaryOptions {
  displayName?: string;
  fallbackUI?:
    | ReactNode
    | ((
        error: Error,
        errorInfo: ErrorInfo,
        resetError: () => void,
      ) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorReporting?: boolean;
  autoRecovery?: boolean;
  recoveryDelay?: number;
  maxRetries?: number;
}

interface ErrorBoundaryComponentProps {
  children: ReactNode;
  fallbackUI?:
    | ReactNode
    | ((
        error: Error,
        errorInfo: ErrorInfo,
        resetError: () => void,
      ) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorReporting?: boolean;
  autoRecovery?: boolean;
  recoveryDelay?: number;
  maxRetries?: number;
}

interface ErrorBoundaryComponentState extends ErrorBoundaryState {
  retryCount: number;
}

class ErrorBoundaryComponent extends Component<
  ErrorBoundaryComponentProps,
  ErrorBoundaryComponentState
> {
  constructor(props: ErrorBoundaryComponentProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ErrorBoundaryComponentState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-recovery logic
    if (
      this.props.autoRecovery &&
      this.state.retryCount < (this.props.maxRetries || 3)
    ) {
      setTimeout(() => {
        this.setState((prevState) => ({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: "",
          retryCount: prevState.retryCount + 1,
        }));
      }, this.props.recoveryDelay || 5000);
    }

    // Error reporting (could be sent to external service)
    if (this.props.errorReporting) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, this would send to an error reporting service
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Example: Send to analytics or error tracking service
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
      });
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallbackUI } = this.props;
      const { error, errorInfo } = this.state;

      if (fallbackUI) {
        if (typeof fallbackUI === "function") {
          return fallbackUI(error!, errorInfo!, this.resetError);
        }
        return fallbackUI;
      }

      // Default error fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
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

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div>
                    <strong>Error:</strong> {error?.message}
                  </div>
                  <div>
                    <strong>Stack:</strong> {error?.stack}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>{" "}
                    {errorInfo?.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: WithErrorBoundaryOptions = {},
) {
  const {
    displayName = "WithErrorBoundary",
    fallbackUI,
    onError,
    errorReporting = true,
    autoRecovery = false,
    recoveryDelay = 5000,
    maxRetries = 3,
  } = options;

  const EnhancedComponent = (props: T) => {
    const { toast } = useToast();

    // Error boundary state
    const [errorState, setErrorState] = React.useState<ErrorBoundaryState>({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });

    // Error handling functions
    const resetError = React.useCallback(() => {
      setErrorState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: "",
      });
    }, []);

    const reportError = React.useCallback(
      (error: Error, errorInfo?: ErrorInfo) => {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        setErrorState({
          hasError: true,
          error,
          errorInfo: errorInfo || null,
          errorId,
        });

        // Show error toast
        toast({
          title: "Error Occurred",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });

        // Log error
        console.error("Component error:", error, errorInfo);
      },
      [toast],
    );

    // Enhanced props
    const enhancedProps = {
      ...props,
      errorBoundary: {
        ...errorState,
        resetError,
        reportError,
      },
    };

    return (
      <ErrorBoundaryComponent
        fallbackUI={fallbackUI}
        onError={onError}
        errorReporting={errorReporting}
        autoRecovery={autoRecovery}
        recoveryDelay={recoveryDelay}
        maxRetries={maxRetries}
      >
        <WrappedComponent {...enhancedProps} />
      </ErrorBoundaryComponent>
    );
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for simple error boundaries
export function withSimpleErrorBoundary<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
) {
  return withErrorBoundary(WrappedComponent, {
    errorReporting: true,
    autoRecovery: false,
  });
}

// Convenience HOC for auto-recovery error boundaries
export function withAutoRecoveryErrorBoundary<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  recoveryDelay: number = 5000,
) {
  return withErrorBoundary(WrappedComponent, {
    errorReporting: true,
    autoRecovery: true,
    recoveryDelay,
    maxRetries: 3,
  });
}

// Convenience HOC for custom error UI
export function withCustomErrorBoundary<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  fallbackUI:
    | ReactNode
    | ((
        error: Error,
        errorInfo: ErrorInfo,
        resetError: () => void,
      ) => ReactNode),
) {
  return withErrorBoundary(WrappedComponent, {
    fallbackUI,
    errorReporting: true,
    autoRecovery: false,
  });
}
