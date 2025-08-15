// Lazy Routes Configuration - Code splitting and dynamic imports for routes
// Implements route-based code splitting with webpack optimization

import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoadingState } from "@/components/Common/LoadingState";
import { ErrorBoundary } from "@/components/Common/ErrorBoundary";

// Lazy load main pages with webpack chunk names
const MainFeed = lazy(() =>
  import("@/components/MainFeed/MainFeed").then((module) => ({
    default: module.default,
  })),
);

const Photos = lazy(() =>
  import("@/components/photos/Photos").then((module) => ({
    default: module.default,
  })),
);

const Recipes = lazy(() =>
  import("@/components/recipes/Recipes").then((module) => ({
    default: module.default,
  })),
);

const Events = lazy(() =>
  import("@/components/events/Events").then((module) => ({
    default: module.default,
  })),
);

const Posts = lazy(() =>
  import("@/components/Posts/Posts").then((module) => ({
    default: module.default,
  })),
);

const Chat = lazy(() =>
  import("@/components/Chat/Chat").then((module) => ({
    default: module.default,
  })),
);

const Games = lazy(() =>
  import("@/components/games/Games").then((module) => ({
    default: module.default,
  })),
);

const Polls = lazy(() =>
  import("@/components/polls/Polls").then((module) => ({
    default: module.default,
  })),
);

const Health = lazy(() =>
  import("@/components/Health/Health").then((module) => ({
    default: module.default,
  })),
);

const Settings = lazy(() =>
  import("@/components/Settings/Settings").then((module) => ({
    default: module.default,
  })),
);

// Lazy load feature components
const UserProfile = lazy(() =>
  import("@/components/UserProfile/UserProfile").then((module) => ({
    default: module.default,
  })),
);

const FamilyManagement = lazy(() =>
  import("@/components/FamilyManagement/FamilyManagement").then((module) => ({
    default: module.default,
  })),
);

const Analytics = lazy(() =>
  import("@/components/Analytics/Analytics").then((module) => ({
    default: module.default,
  })),
);

const Notifications = lazy(() =>
  import("@/components/Notifications/Notifications").then((module) => ({
    default: module.default,
  })),
);

// Lazy load utility components
const Backup = lazy(() =>
  import("@/components/Backup/Backup").then((module) => ({
    default: module.default,
  })),
);

const Reviews = lazy(() =>
  import("@/components/Reviews/Reviews").then((module) => ({
    default: module.default,
  })),
);

// Lazy load admin components
const Admin = lazy(() =>
  import("@/components/Admin/Admin").then((module) => ({
    default: module.default,
  })),
);

const UserManagement = lazy(() =>
  import("@/components/Admin/UserManagement").then((module) => ({
    default: module.default,
  })),
);

const SystemSettings = lazy(() =>
  import("@/components/Admin/SystemSettings").then((module) => ({
    default: module.default,
  })),
);

// Loading fallback components
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingState message="Loading page..." />
  </div>
);

const FeatureLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingState message="Loading feature..." />
  </div>
);

const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingState message="Loading admin panel..." />
  </div>
);

// Error fallback components
const PageErrorFallback = ({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Failed to load page
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Retry
      </button>
    </div>
  </div>
);

// Main application routes with code splitting
export function AppRoutes() {
  return (
    <ErrorBoundary
      fallback={
        <PageErrorFallback
          error={new Error("Page failed to load")}
          retry={() => window.location.reload()}
        />
      }
    >
      <Routes>
        {/* Main family routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <MainFeed />
            </Suspense>
          }
        />

        <Route
          path="/photos"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Photos />
            </Suspense>
          }
        />

        <Route
          path="/recipes"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Recipes />
            </Suspense>
          }
        />

        <Route
          path="/events"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Events />
            </Suspense>
          }
        />

        <Route
          path="/posts"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Posts />
            </Suspense>
          }
        />

        <Route
          path="/chat"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Chat />
            </Suspense>
          }
        />

        <Route
          path="/games"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Games />
            </Suspense>
          }
        />

        <Route
          path="/polls"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Polls />
            </Suspense>
          }
        />

        <Route
          path="/health"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Health />
            </Suspense>
          }
        />

        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Settings />
            </Suspense>
          }
        />

        {/* User and family management routes */}
        <Route
          path="/profile"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <UserProfile />
            </Suspense>
          }
        />

        <Route
          path="/family"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <FamilyManagement />
            </Suspense>
          }
        />

        <Route
          path="/analytics"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Analytics />
            </Suspense>
          }
        />

        <Route
          path="/notifications"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Notifications />
            </Suspense>
          }
        />

        {/* Utility routes */}
        <Route
          path="/backup"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Backup />
            </Suspense>
          }
        />

        <Route
          path="/reviews"
          element={
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Reviews />
            </Suspense>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Admin />
            </Suspense>
          }
        />

        <Route
          path="/admin/users"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <UserManagement />
            </Suspense>
          }
        />

        <Route
          path="/admin/system"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <SystemSettings />
            </Suspense>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

// Route-based code splitting with webpack optimization
export const lazyRoutes = {
  // Main pages with high priority
  mainFeed: () => import("@/components/MainFeed/MainFeed"),
  photos: () => import("@/components/photos/Photos"),
  recipes: () => import("@/components/recipes/Recipes"),
  events: () => import("@/components/events/Events"),
  posts: () => import("@/components/Posts/Posts"),

  // Feature components with medium priority
  chat: () => import("@/components/Chat/Chat"),
  games: () => import("@/components/games/Games"),
  polls: () => import("@/components/polls/Polls"),
  health: () => import("@/components/Health/Health"),
  settings: () => import("@/components/Settings/Settings"),

  // Utility components with lower priority
  userProfile: () => import("@/components/UserProfile/UserProfile"),
  familyManagement: () =>
    import("@/components/FamilyManagement/FamilyManagement"),
  analytics: () => import("@/components/Analytics/Analytics"),
  notifications: () => import("@/components/Notifications/Notifications"),
  backup: () => import("@/components/Backup/Backup"),
  reviews: () => import("@/components/Reviews/Reviews"),

  // Admin components with lowest priority
  admin: () => import("@/components/Admin/Admin"),
  userManagement: () => import("@/components/Admin/UserManagement"),
  systemSettings: () => import("@/components/Admin/SystemSettings"),
};

// Preload strategies for different route types
export const preloadStrategies = {
  // Preload main navigation routes
  preloadMainRoutes: () => {
    // Preload the most commonly accessed routes
    setTimeout(() => lazyRoutes.photos(), 1000);
    setTimeout(() => lazyRoutes.recipes(), 2000);
    setTimeout(() => lazyRoutes.events(), 3000);
  },

  // Preload feature routes on user interaction
  preloadFeatureRoutes: () => {
    // Preload feature routes when user shows interest
    setTimeout(() => lazyRoutes.chat(), 500);
    setTimeout(() => lazyRoutes.games(), 1000);
    setTimeout(() => lazyRoutes.polls(), 1500);
  },

  // Preload utility routes on demand
  preloadUtilityRoutes: () => {
    // Preload utility routes when needed
    setTimeout(() => lazyRoutes.userProfile(), 500);
    setTimeout(() => lazyRoutes.familyManagement(), 1000);
  },

  // Preload admin routes only for admin users
  preloadAdminRoutes: () => {
    // Preload admin routes for admin users
    setTimeout(() => lazyRoutes.admin(), 1000);
    setTimeout(() => lazyRoutes.userManagement(), 2000);
  },
};

// Route priority configuration for webpack optimization
export const routePriorities = {
  high: ["mainFeed", "photos", "recipes", "events", "posts"],
  medium: ["chat", "games", "polls", "health", "settings"],
  low: ["userProfile", "familyManagement", "analytics", "notifications"],
  admin: ["admin", "userManagement", "systemSettings"],
};

// Export the main routes component
export default AppRoutes;
