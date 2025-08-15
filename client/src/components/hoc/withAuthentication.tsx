// withAuthentication HOC - Authentication and authorization
// Provides route protection, user context, and permission-based rendering

import React, { ComponentType, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface WithAuthenticationProps {
  auth: {
    user: any;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    requireAuth: () => boolean;
    requirePermission: (permission: string) => boolean;
    requireRole: (role: string) => boolean;
  };
}

export interface WithAuthenticationOptions {
  displayName?: string;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  redirectTo?: string;
  fallbackUI?:
    | ReactNode
    | ((props: { isLoading: boolean; isAuthenticated: boolean }) => ReactNode);
  onUnauthorized?: () => void;
  showUnauthorizedMessage?: boolean;
}

export function withAuthentication<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: WithAuthenticationOptions = {},
) {
  const {
    displayName = "WithAuthentication",
    requireAuth = false,
    requiredPermissions = [],
    requiredRoles = [],
    redirectTo = "/login",
    fallbackUI,
    onUnauthorized,
    showUnauthorizedMessage = true,
  } = options;

  const EnhancedComponent = (props: T) => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Authentication state
    const isAuthenticated = !!user;
    const isLoading = authLoading;

    // Permission checking
    const hasPermission = React.useCallback(
      (permission: string): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },
      [user],
    );

    const hasRole = React.useCallback(
      (role: string): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
      },
      [user],
    );

    // Authorization requirements
    const requireAuthCheck = React.useCallback((): boolean => {
      if (!requireAuth) return true;
      return isAuthenticated;
    }, [requireAuth, isAuthenticated]);

    const requirePermissionCheck = React.useCallback(
      (permission: string): boolean => {
        if (!requireAuth) return true;
        if (!isAuthenticated) return false;
        return hasPermission(permission);
      },
      [requireAuth, isAuthenticated, hasPermission],
    );

    const requireRoleCheck = React.useCallback(
      (role: string): boolean => {
        if (!requireAuth) return true;
        if (!isAuthenticated) return false;
        return hasRole(role);
      },
      [requireAuth, isAuthenticated, hasRole],
    );

    // Check all requirements
    const meetsRequirements = React.useMemo(() => {
      if (!requireAuth) return true;
      if (!isAuthenticated) return false;

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every((permission) =>
          hasPermission(permission),
        );
        if (!hasAllPermissions) return false;
      }

      // Check roles
      if (requiredRoles.length > 0) {
        const hasAnyRole = requiredRoles.some((role) => hasRole(role));
        if (!hasAnyRole) return false;
      }

      return true;
    }, [
      requireAuth,
      isAuthenticated,
      requiredPermissions,
      requiredRoles,
      hasPermission,
      hasRole,
    ]);

    // Handle unauthorized access
    React.useEffect(() => {
      if (!isLoading && !meetsRequirements) {
        if (onUnauthorized) {
          onUnauthorized();
        } else if (redirectTo) {
          navigate(redirectTo);
        }

        if (showUnauthorizedMessage) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this resource.",
            variant: "destructive",
          });
        }
      }
    }, [
      isLoading,
      meetsRequirements,
      onUnauthorized,
      redirectTo,
      navigate,
      showUnauthorizedMessage,
      toast,
    ]);

    // Show loading state
    if (isLoading) {
      if (fallbackUI && typeof fallbackUI === "function") {
        return <>{fallbackUI({ isLoading: true, isAuthenticated: false })}</>;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }

    // Show unauthorized state
    if (!meetsRequirements) {
      if (fallbackUI && typeof fallbackUI === "function") {
        return <>{fallbackUI({ isLoading: false, isAuthenticated: false })}</>;
      }

      if (fallbackUI) {
        return <>{fallbackUI}</>;
      }

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
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V4a3 3 0 00-3-3H6a3 3 0 00-3 3v2m9 0V4a3 3 0 00-3-3H6a3 3 0 00-3 3v2m9 0V4a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this resource. Please contact
              an administrator if you believe this is an error.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Enhanced props
    const enhancedProps = {
      ...props,
      auth: {
        user,
        isAuthenticated,
        isLoading,
        hasPermission,
        hasRole,
        requireAuth: requireAuthCheck,
        requirePermission: requirePermissionCheck,
        requireRole: requireRoleCheck,
      },
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience HOC for public routes (no auth required)
export function withPublicRoute<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: false,
  });
}

// Convenience HOC for protected routes (auth required)
export function withProtectedRoute<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  redirectTo: string = "/login",
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: true,
    redirectTo,
  });
}

// Convenience HOC for role-based access
export function withRoleAccess<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  requiredRoles: string[],
  redirectTo: string = "/login",
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: true,
    requiredRoles,
    redirectTo,
  });
}

// Convenience HOC for permission-based access
export function withPermissionAccess<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  requiredPermissions: string[],
  redirectTo: string = "/login",
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: true,
    requiredPermissions,
    redirectTo,
  });
}

// Convenience HOC for admin-only access
export function withAdminAccess<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  redirectTo: string = "/login",
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: true,
    requiredRoles: ["admin"],
    redirectTo,
  });
}

// Convenience HOC for family member access
export function withFamilyMemberAccess<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  redirectTo: string = "/login",
) {
  return withAuthentication(WrappedComponent, {
    requireAuth: true,
    requiredRoles: ["admin", "member"],
    redirectTo,
  });
}
