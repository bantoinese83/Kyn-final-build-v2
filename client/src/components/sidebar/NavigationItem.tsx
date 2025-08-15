// NavigationItem Component - Individual navigation item with icon and label
// Extracted from SimpleSidebar.tsx for better modularity and maintainability

import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  onClick?: () => void;
  className?: string;
}

export function NavigationItem({
  label,
  icon: Icon,
  href,
  onClick,
  className = "",
}: NavigationItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm transition-all rounded-md",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground hover:bg-accent/10 hover:text-accent",
        className,
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}
