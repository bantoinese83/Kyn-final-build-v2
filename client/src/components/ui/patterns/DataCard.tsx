// DataCard Component - Reusable data display card
// Eliminates repeated card layouts and provides consistent styling

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DataCardProps {
  title: string;
  value: string | number | React.ReactNode;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

export function DataCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50",
  trend,
  actions,
  className = "",
  onClick,
  loading = false,
  error,
}: DataCardProps) {
  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-full", iconBgColor)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            {description && (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            )}
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-lg font-semibold text-red-600">Error</div>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{value}</div>

            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {trend && (
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600",
                  )}
                >
                  {trend.isPositive ? (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 13z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {trend.value}
                  {trend.label && <span className="ml-1">{trend.label}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {actions && (
          <div className="pt-4 border-t border-gray-100">{actions}</div>
        )}
      </CardContent>
    </>
  );

  if (onClick) {
    return (
      <Card
        className={cn(
          "hover:shadow-md transition-all duration-200 cursor-pointer",
          "hover:scale-[1.02] active:scale-[0.98]",
          className,
        )}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      {cardContent}
    </Card>
  );
}

// Convenience components for common data card types
export function MetricCard(props: Omit<DataCardProps, "trend" | "actions">) {
  return <DataCard {...props} />;
}

export function TrendCard(props: Omit<DataCardProps, "actions">) {
  return <DataCard {...props} />;
}

export function ActionCard(props: Omit<DataCardProps, "trend">) {
  return <DataCard {...props} />;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  iconColor,
  iconBgColor,
  className = "",
}: Omit<DataCardProps, "trend" | "actions">) {
  return (
    <DataCard
      title={title}
      value={value}
      description={description}
      icon={icon}
      iconColor={iconColor}
      iconBgColor={iconBgColor}
      className={cn("text-center", className)}
    />
  );
}
