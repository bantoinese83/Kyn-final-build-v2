// Google Calendar Hook - Provides easy access to Google Calendar functionality
// Integrates with the GoogleCalendarService for seamless calendar operations

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  googleCalendarService,
  GoogleCalendarEvent,
  CreateGoogleCalendarEventData,
  UpdateGoogleCalendarEventData,
  GoogleCalendarListEntry,
} from "../services/google-calendar";
import {
  validateEventData,
  convertToGoogleCalendarEvent,
  convertFromGoogleCalendarEvent,
} from "../lib/google-calendar-utils";

interface UseGoogleCalendarReturn {
  // Authentication state
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;

  // Calendar operations
  calendars: GoogleCalendarListEntry[];
  events: GoogleCalendarEvent[];

  // Authentication methods
  signIn: () => void;
  signOut: () => void;
  handleAuthCallback: (code: string) => Promise<boolean>;

  // Calendar methods
  refreshCalendars: () => Promise<void>;
  refreshEvents: (calendarId?: string, options?: any) => Promise<void>;

  // Event methods
  createEvent: (
    calendarId: string,
    eventData: CreateGoogleCalendarEventData,
  ) => Promise<GoogleCalendarEvent | null>;
  updateEvent: (
    calendarId: string,
    eventId: string,
    eventData: UpdateGoogleCalendarEventData,
  ) => Promise<GoogleCalendarEvent | null>;
  deleteEvent: (calendarId: string, eventId: string) => Promise<boolean>;

  // Utility methods
  getEvent: (
    calendarId: string,
    eventId: string,
  ) => Promise<GoogleCalendarEvent | null>;
  getFreeBusy: (
    timeMin: string,
    timeMax: string,
    calendarIds?: string[],
  ) => Promise<any>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

interface UseGoogleCalendarOptions {
  autoLoadCalendars?: boolean;
  autoLoadEvents?: boolean;
  defaultCalendarId?: string;
  eventOptions?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: "startTime" | "updated";
    q?: string;
  };
}

export function useGoogleCalendar(
  options: UseGoogleCalendarOptions = {},
): UseGoogleCalendarReturn {
  const {
    autoLoadCalendars = true,
    autoLoadEvents = true,
    defaultCalendarId = "primary",
    eventOptions = {},
  } = options;

  const { toast } = useToast();

  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendarListEntry[]>([]);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = googleCalendarService.isAuthenticated();
      setIsAuthenticated(authStatus);

      if (authStatus && autoLoadCalendars) {
        refreshCalendars();
      }
    };

    checkAuth();

    // Check auth status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoLoadCalendars]);

  // Load events when calendars are available
  useEffect(() => {
    if (isAuthenticated && calendars.length > 0 && autoLoadEvents) {
      refreshEvents(defaultCalendarId, eventOptions);
    }
  }, [
    isAuthenticated,
    calendars,
    autoLoadEvents,
    defaultCalendarId,
    eventOptions,
  ]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Authentication methods
  const signIn = useCallback(() => {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      const errorMessage = "Failed to initiate Google Calendar sign-in";
      setError(errorMessage);
      toast({
        title: "Sign-in Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const signOut = useCallback(() => {
    try {
      googleCalendarService.signOut();
      setIsAuthenticated(false);
      setCalendars([]);
      setEvents([]);
      setError(null);

      toast({
        title: "Signed Out",
        description: "Successfully signed out of Google Calendar",
      });
    } catch (error) {
      const errorMessage = "Failed to sign out of Google Calendar";
      setError(errorMessage);
      toast({
        title: "Sign-out Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAuthCallback = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await googleCalendarService.handleAuthCallback(code);

        if (result.success) {
          setIsAuthenticated(true);
          toast({
            title: "Success",
            description: "Successfully connected to Google Calendar",
          });

          // Load calendars after successful authentication
          await refreshCalendars();
          return true;
        } else {
          setError(result.error || "Authentication failed");
          toast({
            title: "Authentication Failed",
            description: result.error || "Failed to connect to Google Calendar",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          "Failed to complete Google Calendar authentication";
        setError(errorMessage);
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Calendar methods
  const refreshCalendars = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await googleCalendarService.getCalendarList();

      if (result.success && result.data) {
        setCalendars(result.data);
      } else {
        setError(result.error || "Failed to load calendars");
        toast({
          title: "Calendar Error",
          description: result.error || "Failed to load Google Calendars",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "Failed to refresh calendars";
      setError(errorMessage);
      toast({
        title: "Calendar Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshEvents = useCallback(
    async (
      calendarId: string = defaultCalendarId,
      options: any = eventOptions,
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await googleCalendarService.getEvents(
          calendarId,
          options,
        );

        if (result.success && result.data) {
          setEvents(result.data);
        } else {
          setError(result.error || "Failed to load events");
          toast({
            title: "Event Error",
            description:
              result.error || "Failed to load Google Calendar events",
            variant: "destructive",
          });
        }
      } catch (error) {
        const errorMessage = "Failed to refresh events";
        setError(errorMessage);
        toast({
          title: "Event Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [defaultCalendarId, eventOptions, toast],
  );

  // Event methods
  const createEvent = useCallback(
    async (
      calendarId: string,
      eventData: CreateGoogleCalendarEventData,
    ): Promise<GoogleCalendarEvent | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate event data
        const validation = validateEventData(eventData);
        if (!validation.isValid) {
          const errorMessage = `Event validation failed: ${validation.errors.join(", ")}`;
          setError(errorMessage);
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          });
          return null;
        }

        const result = await googleCalendarService.createEvent(
          calendarId,
          eventData,
        );

        if (result.success && result.data) {
          // Add new event to local state
          setEvents((prev) => [result.data!, ...prev]);

          toast({
            title: "Event Created",
            description: "Successfully created Google Calendar event",
          });

          return result.data;
        } else {
          setError(result.error || "Failed to create event");
          toast({
            title: "Creation Failed",
            description:
              result.error || "Failed to create Google Calendar event",
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        const errorMessage = "Failed to create event";
        setError(errorMessage);
        toast({
          title: "Creation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const updateEvent = useCallback(
    async (
      calendarId: string,
      eventId: string,
      eventData: UpdateGoogleCalendarEventData,
    ): Promise<GoogleCalendarEvent | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await googleCalendarService.updateEvent(
          calendarId,
          eventId,
          eventData,
        );

        if (result.success && result.data) {
          // Update event in local state
          setEvents((prev) =>
            prev.map((event) => (event.id === eventId ? result.data! : event)),
          );

          toast({
            title: "Event Updated",
            description: "Successfully updated Google Calendar event",
          });

          return result.data;
        } else {
          setError(result.error || "Failed to update event");
          toast({
            title: "Update Failed",
            description:
              result.error || "Failed to update Google Calendar event",
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        const errorMessage = "Failed to update event";
        setError(errorMessage);
        toast({
          title: "Update Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const deleteEvent = useCallback(
    async (calendarId: string, eventId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await googleCalendarService.deleteEvent(
          calendarId,
          eventId,
        );

        if (result.success) {
          // Remove event from local state
          setEvents((prev) => prev.filter((event) => event.id !== eventId));

          toast({
            title: "Event Deleted",
            description: "Successfully deleted Google Calendar event",
          });

          return true;
        } else {
          setError(result.error || "Failed to delete event");
          toast({
            title: "Deletion Failed",
            description:
              result.error || "Failed to delete Google Calendar event",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        const errorMessage = "Failed to delete event";
        setError(errorMessage);
        toast({
          title: "Deletion Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const getEvent = useCallback(
    async (
      calendarId: string,
      eventId: string,
    ): Promise<GoogleCalendarEvent | null> => {
      try {
        setError(null);

        const result = await googleCalendarService.getEvent(
          calendarId,
          eventId,
        );

        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to get event");
          return null;
        }
      } catch (error) {
        const errorMessage = "Failed to get event";
        setError(errorMessage);
        return null;
      }
    },
    [],
  );

  const getFreeBusy = useCallback(
    async (
      timeMin: string,
      timeMax: string,
      calendarIds: string[] = [defaultCalendarId],
    ): Promise<any> => {
      try {
        setError(null);

        const result = await googleCalendarService.getFreeBusy(
          timeMin,
          timeMax,
          calendarIds,
        );

        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to get free/busy information");
          return null;
        }
      } catch (error) {
        const errorMessage = "Failed to get free/busy information";
        setError(errorMessage);
        return null;
      }
    },
    [defaultCalendarId],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Authentication state
    isAuthenticated,
    isConfigured: googleCalendarService.isConfigured(),
    isLoading,

    // Calendar operations
    calendars,
    events,

    // Authentication methods
    signIn,
    signOut,
    handleAuthCallback,

    // Calendar methods
    refreshCalendars,
    refreshEvents,

    // Event methods
    createEvent,
    updateEvent,
    deleteEvent,

    // Utility methods
    getEvent,
    getFreeBusy,

    // Error handling
    error,
    clearError,
  };
}
