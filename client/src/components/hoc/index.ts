// HOC Index - Centralized exports for all Higher-Order Components
// Provides a single import point for all HOC functionality

// Data Fetching HOCs
export {
  withDataFetching,
  withSimpleDataFetching,
  withCachedDataFetching,
  type WithDataFetchingProps,
  type WithDataFetchingOptions,
} from "./withDataFetching";

// Form Management HOCs
export {
  withFormManagement,
  withSimpleForm,
  withValidatedForm,
  withFormLogic,
  type WithFormManagementProps,
  type WithFormManagementOptions,
} from "./withFormManagement";

// Performance HOCs
export {
  withPerformance,
  withStrictMemoization,
  withPerformanceMonitoring,
  withLazyOptimization,
  type WithPerformanceProps,
  type WithPerformanceOptions,
} from "./withPerformance";

// Error Boundary HOCs
export {
  withErrorBoundary,
  withSimpleErrorBoundary,
  withAutoRecoveryErrorBoundary,
  withCustomErrorBoundary,
  type WithErrorBoundaryProps,
  type WithErrorBoundaryOptions,
  type ErrorBoundaryState,
} from "./withErrorBoundary";

// Authentication HOCs
export {
  withAuthentication,
  withPublicRoute,
  withProtectedRoute,
  withRoleAccess,
  withPermissionAccess,
  withAdminAccess,
  withFamilyMemberAccess,
  type WithAuthenticationProps,
  type WithAuthenticationOptions,
} from "./withAuthentication";

// Validation HOCs
export {
  withValidation,
  withSimpleValidation,
  withStrictValidation,
  withLazyValidation,
  withAsyncValidation,
  type WithValidationProps,
  type WithValidationOptions,
  type ValidationRule,
  type ValidationSchema,
  type ValidationState,
} from "./withValidation";

// Composition utilities
export {
  withSidebar,
  withLeftSidebar,
  withRightSidebar,
  withBothSidebars,
  withCenteredLayout,
  withFullWidthLayout,
  type WithSidebarProps,
  type WithSidebarOptions,
} from "../composition/withSidebar";

// Re-export common patterns for convenience
export {
  DataCard,
  MetricCard,
  TrendCard,
  ActionCard,
  StatCard,
} from "../ui/patterns/DataCard";
export {
  LoadingState,
  PageLoading,
  SectionLoading,
  InlineLoading,
  ButtonLoading,
  TableLoading,
  CardLoading,
} from "../ui/patterns/LoadingState";
export {
  EmptyState,
  NoDataState,
  NoResultsState,
  EmptyListState,
  EmptySearchState,
  EmptyPageState,
  NoPhotosState,
  NoEventsState,
  NoRecipesState,
} from "../ui/patterns/EmptyState";

// Utility types for HOC composition
export interface HOCComposer<T> {
  (Component: React.ComponentType<T>): React.ComponentType<T>;
}

export interface HOCWithOptions<T, O> {
  (Component: React.ComponentType<T>, options?: O): React.ComponentType<T>;
}

// Common HOC patterns
export function composeHOCs<T>(...hocs: HOCComposer<T>[]): HOCComposer<T> {
  return (Component: React.ComponentType<T>) => {
    return hocs.reduce(
      (WrappedComponent, hoc) => hoc(WrappedComponent),
      Component,
    );
  };
}

// Enhanced convenience function for common HOC combinations
export function withCommonPatterns<T>(
  Component: React.ComponentType<T>,
  options: {
    withDataFetching?: boolean;
    withFormManagement?: boolean;
    withSidebar?: boolean;
    withPerformance?: boolean;
    withErrorBoundary?: boolean;
    withAuthentication?: boolean;
    withValidation?: boolean;
    dataFetcher?: () => Promise<any>;
    initialValues?: any;
    validationSchema?: any;
    onSubmit?: (values: any) => Promise<void>;
    requireAuth?: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    redirectTo?: string;
    performanceOptions?: any;
    errorBoundaryOptions?: any;
    validationOptions?: any;
  } = {},
) {
  const {
    withDataFetching: enableDataFetching = false,
    withFormManagement: enableFormManagement = false,
    withSidebar: enableSidebar = false,
    withPerformance: enablePerformance = false,
    withErrorBoundary: enableErrorBoundary = false,
    withAuthentication: enableAuthentication = false,
    withValidation: enableValidation = false,
    dataFetcher,
    initialValues,
    validationSchema,
    onSubmit,
    requireAuth = false,
    requiredPermissions = [],
    requiredRoles = [],
    redirectTo = "/login",
    performanceOptions = {},
    errorBoundaryOptions = {},
    validationOptions = {},
  } = options;

  let EnhancedComponent = Component;

  // Apply performance HOC first (for monitoring)
  if (enablePerformance === true) {
    EnhancedComponent = withPerformance(EnhancedComponent, performanceOptions);
  }

  // Apply error boundary HOC early (for error catching)
  if (enableErrorBoundary === true) {
    EnhancedComponent = withErrorBoundary(
      EnhancedComponent,
      errorBoundaryOptions,
    );
  }

  // Apply authentication HOC
  if (enableAuthentication === true) {
    EnhancedComponent = withAuthentication(EnhancedComponent, {
      requireAuth,
      requiredPermissions,
      requiredRoles,
      redirectTo,
    });
  }

  // Apply data fetching HOC
  if (enableDataFetching === true && dataFetcher) {
    EnhancedComponent = withDataFetching(EnhancedComponent, dataFetcher);
  }

  // Apply validation HOC
  if (enableValidation === true && initialValues) {
    EnhancedComponent = withValidation(EnhancedComponent, {
      initialValues,
      validationSchema,
      ...validationOptions,
    });
  }

  // Apply form management HOC
  if (enableFormManagement === true && initialValues) {
    EnhancedComponent = withFormManagement(
      EnhancedComponent,
      initialValues,
      validationSchema,
      { onSubmit },
    );
  }

  // Apply sidebar HOC last (for layout)
  if (enableSidebar === true) {
    EnhancedComponent = withSidebar(EnhancedComponent);
  }

  return EnhancedComponent;
}

// Pre-configured HOC combinations for common use cases
export function withFamilyAppPatterns<T>(
  Component: React.ComponentType<T>,
  options: {
    requireAuth?: boolean;
    requireFamilyMember?: boolean;
    withDataFetching?: boolean;
    withFormManagement?: boolean;
    withValidation?: boolean;
    dataFetcher?: () => Promise<any>;
    initialValues?: any;
    validationSchema?: any;
    onSubmit?: (values: any) => Promise<void>;
  } = {},
) {
  const {
    requireAuth = true,
    requireFamilyMember = true,
    withDataFetching = true,
    withFormManagement = false,
    withValidation = false,
    dataFetcher,
    initialValues,
    validationSchema,
    onSubmit,
  } = options;

  return withCommonPatterns(Component, {
    withPerformance: true,
    withErrorBoundary: true,
    withAuthentication: true,
    withDataFetching,
    withFormManagement,
    withValidation,
    withSidebar: true,
    requireAuth,
    requiredRoles: requireFamilyMember ? ["admin", "member"] : undefined,
    redirectTo: "/login",
    dataFetcher,
    initialValues,
    validationSchema,
    onSubmit,
    performanceOptions: {
      enableMemoization: true,
      enableRenderTracking: true,
      performanceThreshold: 16,
    },
    errorBoundaryOptions: {
      errorReporting: true,
      autoRecovery: true,
      recoveryDelay: 5000,
    },
  });
}

export function withFormPatterns<T>(
  Component: React.ComponentType<T>,
  options: {
    initialValues: any;
    validationSchema?: any;
    onSubmit?: (values: any) => Promise<void>;
    requireAuth?: boolean;
    withDataFetching?: boolean;
    dataFetcher?: () => Promise<any>;
  } = {},
) {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    requireAuth = false,
    withDataFetching = false,
    dataFetcher,
  } = options;

  return withCommonPatterns(Component, {
    withPerformance: true,
    withErrorBoundary: true,
    withAuthentication: requireAuth,
    withDataFetching,
    withFormManagement: true,
    withValidation: true,
    withSidebar: false,
    requireAuth,
    redirectTo: "/login",
    dataFetcher,
    initialValues,
    validationSchema,
    onSubmit,
    performanceOptions: {
      enableMemoization: true,
      enableRenderTracking: false,
    },
    errorBoundaryOptions: {
      errorReporting: true,
      autoRecovery: false,
    },
    validationOptions: {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
    },
  });
}

export function withPagePatterns<T>(
  Component: React.ComponentType<T>,
  options: {
    requireAuth?: boolean;
    requireFamilyMember?: boolean;
    withDataFetching?: boolean;
    withSidebar?: boolean;
    dataFetcher?: () => Promise<any>;
  } = {},
) {
  const {
    requireAuth = true,
    requireFamilyMember = true,
    withDataFetching = true,
    withSidebar = true,
    dataFetcher,
  } = options;

  return withCommonPatterns(Component, {
    withPerformance: true,
    withErrorBoundary: true,
    withAuthentication: true,
    withDataFetching,
    withFormManagement: false,
    withValidation: false,
    withSidebar,
    requireAuth,
    requiredRoles: requireFamilyMember ? ["admin", "member"] : undefined,
    redirectTo: "/login",
    dataFetcher,
    performanceOptions: {
      enableMemoization: true,
      enableRenderTracking: true,
    },
    errorBoundaryOptions: {
      errorReporting: true,
      autoRecovery: true,
    },
  });
}
