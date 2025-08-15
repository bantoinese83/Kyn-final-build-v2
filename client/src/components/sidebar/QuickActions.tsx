// QuickActions Component - Quick links section for authenticated users
// Extracted from SimpleSidebar.tsx for better modularity and maintainability

import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface QuickActionItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface QuickActionsProps {
  items: QuickActionItem[];
  className?: string;
}

export function QuickActions({ items, className = "" }: QuickActionsProps) {
  return (
    <div
      className={`space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/10 flex-shrink-0 w-full flex flex-col justify-center items-start ${className}`}
    >
      <h3 className="text-xs font-medium text-primary uppercase tracking-wide">
        Quick Links
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-md shadow-sm text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
