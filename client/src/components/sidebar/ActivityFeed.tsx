// ActivityFeed Component - Displays family quick links and activity feed
// Extracted from SimpleRightSidebar.tsx for better modularity and maintainability

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageCircle } from "lucide-react";

interface FamilyQuickLink {
  label: string;
  icon: any; // LucideIcon type
  href: string;
}

interface ActivityFeedProps {
  familyName?: string;
  quickLinks: FamilyQuickLink[];
  className?: string;
}

export function ActivityFeed({
  familyName,
  quickLinks,
  className = "",
}: ActivityFeedProps) {
  if (!familyName) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {familyName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  <Icon className="w-3 h-3 mr-2" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
