// EmptyState Component - Reusable empty state UI patterns
// Eliminates repeated empty states and provides consistent UX

import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSize?: "sm" | "md" | "lg" | "xl";
  iconColor?: string;
  iconBgColor?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: "default" | "minimal" | "card" | "fullscreen";
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  iconSize = "lg",
  iconColor = "text-gray-400",
  iconBgColor = "bg-gray-100",
  actions,
  className = "",
  variant = "default",
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      icon: "w-8 h-8",
      title: "text-sm",
      description: "text-xs",
      spacing: "space-y-2",
    },
    md: {
      icon: "w-12 h-12",
      title: "text-base",
      description: "text-sm",
      spacing: "space-y-3",
    },
    lg: {
      icon: "w-16 h-16",
      title: "text-lg",
      description: "text-base",
      spacing: "space-y-4",
    },
  };

  const variantClasses = {
    default: "text-center py-12",
    minimal: "text-center py-6",
    card: "text-center p-8 border border-gray-200 rounded-lg bg-gray-50",
    fullscreen: "min-h-screen flex items-center justify-center text-center",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center",
        sizeClasses[size].spacing,
        variantClasses[variant],
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full",
            iconBgColor,
            sizeClasses[size].icon,
          )}
        >
          <Icon className={cn(iconColor, sizeClasses[size].icon)} />
        </div>
      )}

      <div className="max-w-sm">
        <h3
          className={cn("font-medium text-gray-900", sizeClasses[size].title)}
        >
          {title}
        </h3>

        {description && (
          <p
            className={cn("text-gray-500 mt-1", sizeClasses[size].description)}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-col sm:flex-row gap-3">{actions}</div>
      )}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Common empty state patterns
export function NoDataState({
  title = "No data available",
  description = "There are no items to display at the moment.",
  actions,
  className = "",
  ...props
}: Omit<EmptyStateProps, "icon" | "variant">) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className={className}
      variant="default"
      {...props}
    />
  );
}

export function NoResultsState({
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  actions,
  className = "",
  ...props
}: Omit<EmptyStateProps, "icon" | "variant">) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className={className}
      variant="default"
      {...props}
    />
  );
}

export function EmptyListState({
  title = "List is empty",
  description = "Start by adding your first item.",
  actions,
  className = "",
  ...props
}: Omit<EmptyStateProps, "icon" | "variant">) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className={className}
      variant="card"
      {...props}
    />
  );
}

export function EmptySearchState({
  title = "No search results",
  description = "We couldn't find any matches for your search.",
  actions,
  className = "",
  ...props
}: Omit<EmptyStateProps, "icon" | "variant">) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className={className}
      variant="minimal"
      {...props}
    />
  );
}

export function EmptyPageState({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  actions,
  className = "",
  ...props
}: Omit<EmptyStateProps, "icon" | "variant">) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className={className}
      variant="fullscreen"
      size="lg"
      {...props}
    />
  );
}

// Icon-specific empty states
export function NoPhotosState(
  props: Omit<EmptyStateProps, "icon" | "title" | "description">,
) {
  return (
    <EmptyState
      title="No photos yet"
      description="Start building your photo collection by uploading your first image."
      icon={PhotoIcon}
      {...props}
    />
  );
}

export function NoEventsState(
  props: Omit<EmptyStateProps, "icon" | "title" | "description">,
) {
  return (
    <EmptyState
      title="No events scheduled"
      description="Create your first event to start organizing family activities."
      icon={CalendarIcon}
      {...props}
    />
  );
}

export function NoRecipesState(
  props: Omit<EmptyStateProps, "icon" | "title" | "description">,
) {
  return (
    <EmptyState
      title="No recipes saved"
      description="Add your favorite family recipes to start building your collection."
      icon={ChefHatIcon}
      {...props}
    />
  );
}

// Icon components
function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
