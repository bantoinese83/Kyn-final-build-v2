// LoadingState Component - Reusable loading UI patterns
// Eliminates repeated loading states and provides consistent UX

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "bars" | "pulse" | "skeleton";
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  showMessage?: boolean;
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  variant = "spinner",
  className = "",
  fullScreen = false,
  overlay = false,
  showMessage = true,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const messageSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const renderSpinner = () => (
    <Loader2 className={cn("animate-spin", sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-current rounded-full animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3",
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-current animate-pulse",
            size === "sm" ? "w-1 h-4" : size === "md" ? "w-2 h-6" : "w-3 h-8",
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn("bg-current rounded-full animate-pulse", sizeClasses[size])}
    />
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div
        className={cn(
          "bg-gray-200 rounded animate-pulse",
          size === "sm" ? "h-4" : size === "md" ? "h-6" : "h-8",
        )}
      ></div>
      <div
        className={cn(
          "bg-gray-200 rounded animate-pulse w-3/4",
          size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-5",
        )}
      ></div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "bars":
        return renderBars();
      case "pulse":
        return renderPulse();
      case "skeleton":
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className,
      )}
    >
      <div className="text-gray-600 mb-3">{renderLoader()}</div>
      {showMessage && (
        <p className={cn("text-gray-600 font-medium", messageSizes[size])}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// Convenience components for common loading states
export function PageLoading({
  message = "Loading page...",
  className = "",
}: Omit<LoadingStateProps, "fullScreen">) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message={message} size="lg" className={className} />
    </div>
  );
}

export function SectionLoading({
  message = "Loading...",
  className = "",
}: Omit<LoadingStateProps, "fullScreen" | "overlay">) {
  return (
    <div className="py-12 flex items-center justify-center">
      <LoadingState message={message} size="md" className={className} />
    </div>
  );
}

export function InlineLoading({
  message = "Loading...",
  className = "",
}: Omit<LoadingStateProps, "fullScreen" | "overlay">) {
  return (
    <div className="py-4 flex items-center justify-center">
      <LoadingState message={message} size="sm" className={className} />
    </div>
  );
}

export function ButtonLoading({
  size = "sm",
  className = "",
}: Omit<
  LoadingStateProps,
  "message" | "variant" | "fullScreen" | "overlay" | "showMessage"
>) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingState size={size} variant="spinner" showMessage={false} />
      <span>Loading...</span>
    </div>
  );
}

export function TableLoading({
  rows = 5,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="bg-gray-200 rounded animate-pulse h-4 w-1/4"></div>
          <div className="bg-gray-200 rounded animate-pulse h-4 w-1/3"></div>
          <div className="bg-gray-200 rounded animate-pulse h-4 w-1/4"></div>
          <div className="bg-gray-200 rounded animate-pulse h-4 w-1/6"></div>
        </div>
      ))}
    </div>
  );
}

export function CardLoading({ className = "" }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="bg-gray-200 rounded animate-pulse h-4 w-1/3"></div>
        <div className="bg-gray-200 rounded animate-pulse h-8 w-8"></div>
      </div>
      <div className="space-y-2">
        <div className="bg-gray-200 rounded animate-pulse h-8 w-1/2"></div>
        <div className="bg-gray-200 rounded animate-pulse h-4 w-3/4"></div>
      </div>
    </div>
  );
}
