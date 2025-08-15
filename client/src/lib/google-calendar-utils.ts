// Google Calendar Utility Functions
// Provides helper functions for Google Calendar integration

import {
  GoogleCalendarEvent,
  CreateGoogleCalendarEventData,
  GoogleCalendarListEntry,
} from "../services/google-calendar";

/**
 * Format date for Google Calendar API (RFC3339 format)
 */
export function formatDateForGoogleCalendar(date: Date): string {
  return date.toISOString();
}

/**
 * Parse Google Calendar date/time string to Date object
 */
export function parseGoogleCalendarDateTime(
  dateTime: string | undefined,
  date: string | undefined,
): Date | null {
  if (dateTime) {
    return new Date(dateTime);
  }
  if (date) {
    return new Date(date);
  }
  return null;
}

/**
 * Get event duration in minutes
 */
export function getEventDuration(event: GoogleCalendarEvent): number {
  const start = parseGoogleCalendarDateTime(
    event.start.dateTime,
    event.start.date,
  );
  const end = parseGoogleCalendarDateTime(event.end.dateTime, event.end.date);

  if (!start || !end) return 0;

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Check if event is all-day
 */
export function isAllDayEvent(event: GoogleCalendarEvent): boolean {
  return !event.start.dateTime && !!event.start.date;
}

/**
 * Check if event is happening now
 */
export function isEventHappeningNow(event: GoogleCalendarEvent): boolean {
  const now = new Date();
  const start = parseGoogleCalendarDateTime(
    event.start.dateTime,
    event.start.date,
  );
  const end = parseGoogleCalendarDateTime(event.end.dateTime, event.end.date);

  if (!start || !end) return false;

  return now >= start && now <= end;
}

/**
 * Check if event is upcoming (within next 24 hours)
 */
export function isEventUpcoming(event: GoogleCalendarEvent): boolean {
  const now = new Date();
  const start = parseGoogleCalendarDateTime(
    event.start.dateTime,
    event.start.date,
  );

  if (!start) return false;

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return start >= now && start <= tomorrow;
}

/**
 * Check if event is past
 */
export function isEventPast(event: GoogleCalendarEvent): boolean {
  const now = new Date();
  const end = parseGoogleCalendarDateTime(event.end.dateTime, event.end.date);

  if (!end) return false;

  return end < now;
}

/**
 * Get event status color based on status
 */
export function getEventStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "text-green-600 bg-green-100 border-green-200";
    case "tentative":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "cancelled":
      return "text-red-600 bg-red-100 border-red-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
}

/**
 * Get event status icon
 */
export function getEventStatusIcon(status: string): string {
  switch (status) {
    case "confirmed":
      return "✓";
    case "tentative":
      return "?";
    case "cancelled":
      return "✗";
    default:
      return "○";
  }
}

/**
 * Validate event data before creating/updating
 */
export function validateEventData(eventData: CreateGoogleCalendarEventData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!eventData.summary?.trim()) {
    errors.push("Event summary is required");
  }

  if (!eventData.start?.dateTime) {
    errors.push("Event start time is required");
  }

  if (!eventData.end?.dateTime) {
    errors.push("Event end time is required");
  }

  if (eventData.start?.dateTime && eventData.end?.dateTime) {
    const start = new Date(eventData.start.dateTime);
    const end = new Date(eventData.end.dateTime);

    if (start >= end) {
      errors.push("Event end time must be after start time");
    }
  }

  if (eventData.attendees) {
    eventData.attendees.forEach((attendee, index) => {
      if (!attendee.email?.trim()) {
        errors.push(`Attendee ${index + 1} email is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convert Flare World event to Google Calendar format
 */
export function convertToGoogleCalendarEvent(
  flareEvent: any,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
): CreateGoogleCalendarEventData {
  return {
    summary: flareEvent.title || flareEvent.summary,
    description: flareEvent.description,
    location: flareEvent.location,
    start: {
      dateTime: flareEvent.start?.dateTime || flareEvent.start,
      timeZone,
    },
    end: {
      dateTime: flareEvent.end?.dateTime || flareEvent.end,
      timeZone,
    },
    attendees: flareEvent.attendees?.map((attendee: any) => ({
      email: attendee.email,
      displayName: attendee.name || attendee.displayName,
    })),
    reminders: {
      useDefault: true,
    },
    transparency: "opaque",
    visibility: "default",
  };
}

/**
 * Convert Google Calendar event to Flare World format
 */
export function convertFromGoogleCalendarEvent(
  googleEvent: GoogleCalendarEvent,
): any {
  return {
    id: googleEvent.id,
    title: googleEvent.summary,
    description: googleEvent.description,
    location: googleEvent.location,
    start: googleEvent.start.dateTime || googleEvent.start.date,
    end: googleEvent.end.dateTime || googleEvent.end.date,
    attendees: googleEvent.attendees?.map((attendee) => ({
      email: attendee.email,
      name: attendee.displayName,
      status: attendee.responseStatus,
      isOrganizer: attendee.organizer,
    })),
    status: googleEvent.status,
    isAllDay: isAllDayEvent(googleEvent),
    duration: getEventDuration(googleEvent),
    url: googleEvent.htmlLink,
    createdAt: googleEvent.created,
    updatedAt: googleEvent.updated,
  };
}

/**
 * Get calendar color for display
 */
export function getCalendarColor(calendar: GoogleCalendarListEntry): string {
  if (calendar.backgroundColor) {
    return calendar.backgroundColor;
  }

  // Default colors for common calendar types
  if (calendar.primary) {
    return "#4285f4"; // Google Blue
  }

  if (
    calendar.summary.toLowerCase().includes("work") ||
    calendar.summary.toLowerCase().includes("business")
  ) {
    return "#ea4335"; // Google Red
  }

  if (
    calendar.summary.toLowerCase().includes("personal") ||
    calendar.summary.toLowerCase().includes("family")
  ) {
    return "#34a853"; // Google Green
  }

  return "#fbbc04"; // Google Yellow (default)
}

/**
 * Format event time for display
 */
export function formatEventTime(event: GoogleCalendarEvent): string {
  if (isAllDayEvent(event)) {
    return "All day";
  }

  const start = parseGoogleCalendarDateTime(
    event.start.dateTime,
    event.start.date,
  );
  const end = parseGoogleCalendarDateTime(event.end.dateTime, event.end.date);

  if (!start || !end) return "";

  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${startTime} - ${endTime}`;
}

/**
 * Get event location coordinates (if available)
 */
export function getEventLocationCoordinates(
  location: string,
): { lat: number; lng: number } | null {
  // This would typically integrate with Google Maps Geocoding API
  // For now, return null as placeholder
  return null;
}

/**
 * Check if user has permission to modify calendar
 */
export function canModifyCalendar(calendar: GoogleCalendarListEntry): boolean {
  return ["writer", "owner"].includes(calendar.accessRole);
}

/**
 * Check if user has permission to read calendar
 */
export function canReadCalendar(calendar: GoogleCalendarListEntry): boolean {
  return ["reader", "writer", "owner", "freeBusyReader"].includes(
    calendar.accessRole,
  );
}

/**
 * Get calendar display name
 */
export function getCalendarDisplayName(
  calendar: GoogleCalendarListEntry,
): string {
  if (calendar.primary) {
    return `${calendar.summary} (Primary)`;
  }
  return calendar.summary;
}

/**
 * Sort calendars by priority (primary first, then by name)
 */
export function sortCalendarsByPriority(
  calendars: GoogleCalendarListEntry[],
): GoogleCalendarListEntry[] {
  return calendars.sort((a, b) => {
    // Primary calendar first
    if (a.primary && !b.primary) return -1;
    if (!a.primary && b.primary) return 1;

    // Then by name
    return a.summary.localeCompare(b.summary);
  });
}

/**
 * Filter calendars by access role
 */
export function filterCalendarsByAccess(
  calendars: GoogleCalendarListEntry[],
  minAccessRole: "none" | "freeBusyReader" | "reader" | "writer" | "owner",
): GoogleCalendarListEntry[] {
  const accessLevels = ["none", "freeBusyReader", "reader", "writer", "owner"];
  const minLevel = accessLevels.indexOf(minAccessRole);

  return calendars.filter((calendar) => {
    const calendarLevel = accessLevels.indexOf(calendar.accessRole);
    return calendarLevel >= minLevel;
  });
}
