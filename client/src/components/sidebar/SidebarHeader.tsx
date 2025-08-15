// SidebarHeader Component - Sidebar header with logo and title
// Extracted from SimpleSidebar.tsx for better modularity and maintainability

import { Link } from "react-router-dom";

interface SidebarHeaderProps {
  className?: string;
}

export function SidebarHeader({ className = "" }: SidebarHeaderProps) {
  return (
    <div className={`p-4 border-b border-border flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-3">
        <Link
          to="/about"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
            alt="Kyn Logo"
            className="w-14 h-14 object-contain"
          />
          <h1 className="text-2xl font-tenor font-normal text-foreground">
            Kyn
          </h1>
        </Link>
      </div>
    </div>
  );
}
