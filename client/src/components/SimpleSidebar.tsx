// SimpleSidebar Component - Main sidebar navigation component
// Refactored to use modular components for better maintainability

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { familyService } from "@/services";
import { NavigationItem } from "./sidebar/NavigationItem";
import { UserSection } from "./sidebar/UserSection";
import { QuickActions } from "./sidebar/QuickActions";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { FamilyMember } from "@/types/sidebar";

interface SimpleSidebarProps {
  className?: string;
}

const mainNavigationItems = [
  { label: "Dashboard", icon: "Home", href: "/" },
  { label: "Family Contacts", icon: "Users", href: "/contacts" },
  { label: "Kynnect Video Chat", icon: "Video", href: "/kynnect" },
  { label: "Events and Calendar", icon: "Calendar", href: "/events" },
  { label: "Media Recommendations", icon: "Monitor", href: "/media" },
  { label: "Polls and Voting", icon: "Vote", href: "/polls" },
  { label: "Recipes", icon: "ChefHat", href: "/recipes" },
  { label: "Playlists", icon: "Music", href: "/playlists" },
  { label: "Games", icon: "Trophy", href: "/games" },
  { label: "Milestones and Achievements", icon: "Trophy", href: "/milestones" },
  { label: "Family History", icon: "BookOpen", href: "/history" },
  { label: "Photos and Videos", icon: "Camera", href: "/photos" },
  { label: "Health History", icon: "Stethoscope", href: "/health" },
  { label: "Fitness Challenge", icon: "Dumbbell", href: "/fitness" },
  { label: "Resources & Trusted Vendors", icon: "Shield", href: "/resources" },
  { label: "Family Mission", icon: "Target", href: "/mission" },
];

const quickLinksItems = [
  { label: "Photos and Videos", icon: "Camera", href: "/photos" },
  { label: "Fitness Challenge", icon: "Dumbbell", href: "/fitness" },
  { label: "Games", icon: "Trophy", href: "/games" },
];

export function SimpleSidebar({ className }: SimpleSidebarProps) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFamilyMembers();
    }
  }, [user]);

  const loadFamilyMembers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's families
      const familiesResult = await familyService.getUserFamilies(user.id);

      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setFamilyMembers([]);
        return;
      }

      // Get members from the primary family
      const primaryFamily = familiesResult.data[0]; // For now, use the first family

      // For now, we don't have detailed family member data, so create an empty list
      // TODO: Implement proper family member fetching when the API is available
      const transformedMembers: FamilyMember[] = [];

      setFamilyMembers(transformedMembers);
    } catch (err) {
      console.error("Error loading family members:", err);
      setError("Failed to load family members");
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Pop-out Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed left-0 top-0 w-80 h-full bg-card border-r border-border shadow-xl z-50 transform transition-transform duration-300">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Navigation
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {mainNavigationItems.map((item) => (
              <NavigationItem
                key={item.href}
                label={item.label}
                icon={item.icon as any}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}

      <aside
        className={cn(
          "hidden lg:flex h-screen w-64 bg-card border-r border-border flex-col shadow-lg min-h-screen",
          className,
        )}
      >
        {/* Header */}
        <SidebarHeader />

        {/* Navigation */}
        <div className="flex-1 flex flex-col h-full">
          <div className="p-4 flex-shrink-0">
            {/* Hamburger Menu */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/10"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
              </Button>
            </div>
          </div>

          <div className="px-4 pb-4 flex-1 flex flex-col space-y-6 overflow-y-auto">
            {/* Who's Around */}
            <UserSection
              user={user}
              familyMembers={familyMembers}
              isLoading={isLoading}
              error={error}
              onRetry={loadFamilyMembers}
            />

            {/* Monthly Calendar */}
            <div className="flex-shrink-0">
              <MonthlyCalendar />
            </div>

            {/* Quick Links - Only show for authenticated users */}
            {user && <QuickActions items={quickLinksItems} />}
          </div>
        </div>
      </aside>
    </>
  );
}
