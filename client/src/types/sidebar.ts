// Sidebar Types - Centralized type definitions for sidebar functionality
// Extracted from SimpleSidebar.tsx for better type safety and consistency

export interface FamilyMember {
  id: string;
  name: string;
  initials?: string;
  avatar?: string;
  isOnline: boolean;
  role?: string;
  awayMessage?: string;
}

export interface NavigationItem {
  label: string;
  icon: any; // LucideIcon type
  href: string;
}

export interface QuickActionItem {
  label: string;
  icon: any; // LucideIcon type
  href: string;
}

export interface SidebarState {
  isMenuOpen: boolean;
  selectedPerson: string | null;
  isLoading: boolean;
  familyMembers: FamilyMember[];
  error: string | null;
}

export interface SidebarActions {
  onMenuToggle: (isOpen: boolean) => void;
  onPersonSelect: (personName: string | null) => void;
  onMemberAction: (action: string, memberName: string) => Promise<void>;
  onRetry: () => void;
}

export interface SidebarContext {
  state: SidebarState;
  actions: SidebarActions;
}

export interface SidebarConfig {
  mainNavigationItems: NavigationItem[];
  quickLinksItems: QuickActionItem[];
  showQuickLinks: boolean;
  showCalendar: boolean;
  showUserSection: boolean;
}

export interface SidebarTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
}

export interface SidebarAccessibility {
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
}

export interface SidebarResponsiveness {
  mobileBreakpoint: number;
  tabletBreakpoint: number;
  desktopBreakpoint: number;
  collapsible: boolean;
  autoCollapse: boolean;
}

export interface SidebarAnimation {
  transitionDuration: number;
  transitionEasing: string;
  enableHoverEffects: boolean;
  enableFocusEffects: boolean;
}

export interface SidebarLocalization {
  language: string;
  translations: Record<string, string>;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

export interface SidebarAnalytics {
  trackNavigation: boolean;
  trackUserActions: boolean;
  trackPerformance: boolean;
  customEvents: string[];
}

export interface SidebarSecurity {
  enableRoleBasedAccess: boolean;
  enableAuditLogging: boolean;
  enableDataEncryption: boolean;
  allowedDomains: string[];
}

export interface SidebarIntegration {
  enableExternalAPIs: boolean;
  enableWebhooks: boolean;
  enableSSO: boolean;
  enableOAuth: boolean;
  externalServices: string[];
}

export interface SidebarCustomization {
  enableCustomThemes: boolean;
  enableCustomLayouts: boolean;
  enableCustomComponents: boolean;
  enableCustomAnimations: boolean;
  userPreferences: Record<string, any>;
}
