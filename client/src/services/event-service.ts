// Event Service - Handles all event-related operations
// Implements consistent error handling and service response patterns

import { supabase } from "./supabase";
import { logServiceError } from "../lib/logger";
import { handleSupabaseError } from "../lib/error-handler";
import {
  Event,
  EventWithDetails,
  EventAttendee,
  User,
} from "../types/database";
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../lib/constants";

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  type: string;
  isRecurring?: boolean;
  reminders?: boolean;
  tags?: string[];
  registryLinks?: string[];
  familyId: string;
  organizerId: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  date?: string;
  time?: string;
  endTime?: string;
}

export interface EventRSVPData {
  eventId: string;
  userId: string;
  status: "going" | "maybe" | "not-going";
  guestCount?: number;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class EventService {
  /**
   * Get family events with pagination
   */
  async getFamilyEvents(
    familyId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    try {
      const offset = (page - 1) * limit;

      const { data: events, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizerId_fkey(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .order("date", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const eventsWithDetails =
        events?.map((event) => ({
          ...event,
          organizer: event.organizer,
          attendees: [],
        })) || [];

      return {
        data: eventsWithDetails,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "getFamilyEvents",
        familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get event by ID with full details
   */
  async getEventById(
    eventId: string,
  ): Promise<ServiceResponse<EventWithDetails>> {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizerId_fkey(id, name, avatar, initials)
        `,
        )
        .eq("id", eventId)
        .single();

      if (error) throw error;

      // Get attendees for this event
      const { data: attendees, error: attendeesError } = await supabase
        .from("event_attendees")
        .select(
          `
          *,
          user:users(id, name, avatar)
        `,
        )
        .eq("eventId", eventId);

      if (attendeesError) throw attendeesError;

      const eventWithDetails: EventWithDetails = {
        ...event,
        organizer: event.organizer,
        attendees: attendees || [],
      };

      return {
        data: eventWithDetails,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "getEventById",
        eventId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    eventData: CreateEventData,
  ): Promise<ServiceResponse<Event>> {
    try {
      // Validate required fields
      if (
        !eventData.title ||
        eventData.title.length < VALIDATION.EVENT.MIN_TITLE_LENGTH
      ) {
        throw new Error(ERROR_MESSAGES.COMMON.VALIDATION_FAILED);
      }

      if (!eventData.description || eventData.description.length < 10) {
        throw new Error(
          "Event description must be at least 10 characters long",
        );
      }

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          tags: eventData.tags || [],
          registryLinks: eventData.registryLinks || [],
          isRecurring: eventData.isRecurring || false,
          reminders: eventData.reminders !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: event,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "createEvent",
        familyId: eventData.familyId,
        organizerId: eventData.organizerId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Update an event
   */
  async updateEvent(
    eventId: string,
    updates: UpdateEventData,
  ): Promise<ServiceResponse<Event>> {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: event,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "updateEvent",
        eventId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<ServiceResponse<void>> {
    try {
      // First delete all attendees for this event
      const { error: attendeesError } = await supabase
        .from("event_attendees")
        .delete()
        .eq("eventId", eventId);

      if (attendeesError) throw attendeesError;

      // Then delete the event
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (eventError) throw eventError;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "deleteEvent",
        eventId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * RSVP to an event
   */
  async rsvpToEvent(
    rsvpData: EventRSVPData,
  ): Promise<ServiceResponse<EventAttendee>> {
    try {
      // Check if user already RSVP'd
      const { data: existingRSVP, error: checkError } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("eventId", rsvpData.eventId)
        .eq("userId", rsvpData.userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      let rsvp: EventAttendee;

      if (existingRSVP) {
        // Update existing RSVP
        const { data: updatedRSVP, error: updateError } = await supabase
          .from("event_attendees")
          .update({
            status: rsvpData.status,
            guestCount: rsvpData.guestCount || 1,
            respondedAt: new Date().toISOString(),
          })
          .eq("id", existingRSVP.id)
          .select()
          .single();

        if (updateError) throw updateError;
        rsvp = updatedRSVP;
      } else {
        // Create new RSVP
        const { data: newRSVP, error: insertError } = await supabase
          .from("event_attendees")
          .insert({
            eventId: rsvpData.eventId,
            userId: rsvpData.userId,
            status: rsvpData.status,
            guestCount: rsvpData.guestCount || 1,
            respondedAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        rsvp = newRSVP;
      }

      return {
        data: rsvp,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "rsvpToEvent",
        eventId: rsvpData.eventId,
        userId: rsvpData.userId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get upcoming events for a family
   */
  async getUpcomingEvents(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: events, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizerId_fkey(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(limit);

      if (error) throw error;

      const eventsWithDetails =
        events?.map((event) => ({
          ...event,
          organizer: event.organizer,
          attendees: [],
        })) || [];

      return {
        data: eventsWithDetails,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "getUpcomingEvents",
        familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Search events by title or description
   */
  async searchEvents(
    query: string,
    familyId: string,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizerId_fkey(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order("date", { ascending: true })
        .limit(20);

      if (error) throw error;

      const eventsWithDetails =
        events?.map((event) => ({
          ...event,
          organizer: event.organizer,
          attendees: [],
        })) || [];

      return {
        data: eventsWithDetails,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "searchEvents",
        familyId,
        query,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    familyId: string,
    type: string,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:users!events_organizerId_fkey(id, name, avatar, initials)
        `,
        )
        .eq("familyId", familyId)
        .eq("type", type)
        .order("date", { ascending: true });

      if (error) throw error;

      const eventsWithDetails =
        events?.map((event) => ({
          ...event,
          organizer: event.organizer,
          attendees: [],
        })) || [];

      return {
        data: eventsWithDetails,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "EventService",
        action: "getEventsByType",
        familyId,
        type,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }
}

// Export singleton instance
export const eventService = new EventService();
