// Events Page - Main events management page
// Refactored to use modular components for better maintainability

import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { eventService, familyService } from "@/services";
import { EventList } from "@/components/events";
import { FamilyEvent } from "@/types/events";

export default function Events() {
  const { user, loading } = useAuth();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Calendar />}
        title="Never Miss Family Moments"
        description="Plan celebrations, coordinate gatherings, and create lasting memories with your family's private event calendar."
        features={[
          "Plan birthdays, anniversaries, and special celebrations",
          "Coordinate family gatherings and reunions",
          "Share event details and get RSVPs from everyone",
          "Add gift registries and wish lists to events",
          "Create recurring events for traditions and holidays",
          "Send automatic reminders to all family members",
        ]}
        accentColor="#BD692B"
        bgGradient="from-orange-50 to-amber-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // State management
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load user's current family
      const familyResult = await familyService.getUserFamilies(user.id);
      if (
        familyResult.success &&
        familyResult.data &&
        familyResult.data.length > 0
      ) {
        const currentFamilyData = familyResult.data[0];
        setCurrentFamily(currentFamilyData);

        // Load events for the family
        await loadFamilyEvents(currentFamilyData.id);
      } else {
        setError("No family found. Please create or join a family.");
      }
    } catch (error) {
      const errorMessage = "Failed to load family data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load family events
  const loadFamilyEvents = async (familyId: string) => {
    try {
      const eventsResult = await eventService.getFamilyEvents(familyId);
      if (eventsResult.success && eventsResult.data) {
        setEvents(eventsResult.data);
      } else {
        setError(eventsResult.error || "Failed to load events");
      }
    } catch (error) {
      setError("Failed to load events");
    }
  };

  // Event handlers
  const handleEventCreate = async (eventData: any) => {
    if (!currentFamily) return;

    try {
      const result = await eventService.createEvent({
        ...eventData,
        familyId: currentFamily.id,
        organizerId: user!.id,
      });

      if (result.success && result.data) {
        setEvents((prev) => [result.data!, ...prev]);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create event");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEventUpdate = async (eventId: string, updates: any) => {
    try {
      const result = await eventService.updateEvent(eventId, updates);
      if (result.success && result.data) {
        setEvents((prev) =>
          prev.map((event) => (event.id === eventId ? result.data! : event)),
        );
        return result.data;
      } else {
        throw new Error(result.error || "Failed to update event");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const result = await eventService.deleteEvent(eventId);
      if (result.success) {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        return true;
      } else {
        throw new Error(result.error || "Failed to delete event");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = () => {
    if (currentFamily) {
      loadFamilyEvents(currentFamily.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-warm-brown/10 rounded-full">
              <Calendar className="w-8 h-8 text-warm-brown" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">
                Family Events
              </h1>
              <p className="text-light-blue-gray">
                Plan, organize, and celebrate together
              </p>
            </div>
          </div>
        </div>

        {/* Events List Component */}
        <EventList
          events={events}
          isLoading={isLoading}
          error={error}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
