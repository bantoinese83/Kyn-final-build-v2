// Sidebar Components Index - Centralized exports for all sidebar components
// Refactored from monolithic SimpleSidebar.tsx and SimpleRightSidebar.tsx to modular components

// Left Sidebar Components
export { NavigationItem } from "./NavigationItem";
export { UserSection } from "./UserSection";
export { QuickActions } from "./QuickActions";
export { SidebarHeader } from "./SidebarHeader";

// Right Sidebar Components
export { EventWidget } from "./EventWidget";
export { NotificationList } from "./NotificationList";
export { ActivityFeed } from "./ActivityFeed";
export { ErrorDisplay } from "./ErrorDisplay";

// Export types
export type {
  FamilyMember,
  NavigationItem as NavigationItemType,
  QuickActionItem,
  SidebarState,
  SidebarActions,
  SidebarContext,
  SidebarConfig,
  SidebarTheme,
  SidebarAccessibility,
  SidebarResponsiveness,
  SidebarAnimation,
  SidebarLocalization,
  SidebarAnalytics,
  SidebarSecurity,
  SidebarIntegration,
  SidebarCustomization,
} from "@/types/sidebar";
