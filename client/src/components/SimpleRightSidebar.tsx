// SimpleRightSidebar Component - Right sidebar with events, notifications, and family links
// Refactored to use modular components for better maintainability

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";
import { EventWidget } from "./sidebar/EventWidget";
import { NotificationList } from "./sidebar/NotificationList";
import { ActivityFeed } from "./sidebar/ActivityFeed";
import { ErrorDisplay } from "./sidebar/ErrorDisplay";
import { UpcomingEvent, Notification } from "@/types/sidebar";

interface SimpleRightSidebarProps {
  className?: string;
}

const familyQuickLinks = [
  { label: "Family Contacts", icon: "Users", href: "/contacts" },
  { label: "Photo Albums", icon: "Calendar", href: "/photos" },
  { label: "Family Recipes", icon: "Calendar", href: "/recipes" },
  { label: "Video Chat", icon: "MessageCircle", href: "/kynnect" },
];

export function SimpleRightSidebar({ className }: SimpleRightSidebarProps) {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentFamily, setCurrentFamily] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSidebarData();
    } else {
      setUpcomingEvents([]);
      setNotifications([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadSidebarData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's families
      const familiesResult = await supabaseDataService.getUserFamilies(user.id);

      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setUpcomingEvents([]);
        return;
      }

      // Get events from all families (you might want to focus on a primary family)
      const primaryFamily = familiesResult.data[0]; // For now, use the first family
      setCurrentFamily(primaryFamily);

      const eventsResult = await supabaseDataService.getFamilyEvents(
        primaryFamily.id,
      );

      if (!eventsResult.success || !eventsResult.data) {
        setUpcomingEvents([]);
        return;
      }

      const transformedEvents: UpcomingEvent[] = eventsResult.data.map(
        (event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          time: event.time,
          location: event.location,
          type: event.type,
          organizer: {
            name: event.organizer?.name || "Unknown",
            avatar: event.organizer?.avatar || "",
          },
        }),
      );

      setUpcomingEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading sidebar data:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <aside
        className={cn(
          "hidden lg:flex w-80 bg-card border-l border-border flex-col shadow-lg min-h-screen",
          className,
        )}
      >
        <div className="p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Please log in to see family updates
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex w-80 bg-card border-l border-border flex-col shadow-lg min-h-screen",
        className,
      )}
    >
      <div className="p-6 space-y-6 flex-1">
        {/* Upcoming Events */}
        <EventWidget
          events={upcomingEvents}
          isLoading={isLoading}
          hasFamily={!!currentFamily}
        />

        {/* Family Quick Links */}
        <ActivityFeed
          familyName={currentFamily?.familyName}
          quickLinks={familyQuickLinks}
        />

        {/* Notifications */}
        <NotificationList notifications={notifications} />

        {/* Error Display */}
        <ErrorDisplay error={error || ""} onRetry={loadSidebarData} />
      </div>
    </aside>
  );
}
