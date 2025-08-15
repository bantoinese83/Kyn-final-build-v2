// withSidebar Composition Utility - Consistent sidebar layouts
// Eliminates repeated sidebar wrapper code across components

import { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { SimpleSidebar } from "@/components/SimpleSidebar";
import { SimpleRightSidebar } from "@/components/SimpleRightSidebar";
import { MobileNav } from "@/components/MobileNav";

export interface WithSidebarProps {
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  showMobileNav?: boolean;
  sidebarClassName?: string;
  mainContentClassName?: string;
  rightSidebarClassName?: string;
  layout?: "default" | "centered" | "full-width";
}

export interface WithSidebarOptions extends WithSidebarProps {
  displayName?: string;
  sidebarProps?: any;
  rightSidebarProps?: any;
  mobileNavProps?: any;
}

export function withSidebar<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: WithSidebarOptions = {},
) {
  const {
    displayName = "WithSidebar",
    showLeftSidebar = true,
    showRightSidebar = true,
    showMobileNav = true,
    sidebarClassName = "",
    mainContentClassName = "",
    rightSidebarClassName = "",
    layout = "default",
    sidebarProps = {},
    rightSidebarProps = {},
    mobileNavProps = {},
  } = options;

  const EnhancedComponent = (props: T) => {
    const layoutClasses = {
      default: "max-w-7xl mx-auto",
      centered: "max-w-4xl mx-auto",
      "full-width": "w-full",
    };

    const content = (
      <div className="flex bg-background min-h-screen">
        {/* Left Sidebar */}
        {showLeftSidebar && (
          <div className={cn("flex-shrink-0", sidebarClassName)}>
            <SimpleSidebar {...sidebarProps} />
          </div>
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 flex flex-col",
            layoutClasses[layout],
            mainContentClassName,
          )}
        >
          <WrappedComponent {...props} />
        </main>

        {/* Right Sidebar */}
        {showRightSidebar && (
          <div className={cn("flex-shrink-0", rightSidebarClassName)}>
            <SimpleRightSidebar {...rightSidebarProps} />
          </div>
        )}

        {/* Mobile Navigation */}
        {showMobileNav && <MobileNav {...mobileNavProps} />}
      </div>
    );

    return content;
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `${displayName}(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return EnhancedComponent;
}

// Convenience compositions for common layouts
export function withLeftSidebar<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: Omit<WithSidebarOptions, "showRightSidebar"> = {},
) {
  return withSidebar(WrappedComponent, {
    ...options,
    showLeftSidebar: true,
    showRightSidebar: false,
  });
}

export function withRightSidebar<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: Omit<WithSidebarOptions, "showLeftSidebar"> = {},
) {
  return withSidebar(WrappedComponent, {
    ...options,
    showLeftSidebar: false,
    showRightSidebar: true,
  });
}

export function withBothSidebars<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: Omit<
    WithSidebarOptions,
    "showLeftSidebar" | "showRightSidebar"
  > = {},
) {
  return withSidebar(WrappedComponent, {
    ...options,
    showLeftSidebar: true,
    showRightSidebar: true,
  });
}

export function withCenteredLayout<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: Omit<WithSidebarOptions, "layout"> = {},
) {
  return withSidebar(WrappedComponent, {
    ...options,
    layout: "centered",
  });
}

export function withFullWidthLayout<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  options: Omit<WithSidebarOptions, "layout"> = {},
) {
  return withSidebar(WrappedComponent, {
    ...options,
    layout: "full-width",
  });
}
