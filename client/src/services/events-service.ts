// Events Service - Handles all event-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface Event extends FamilyEntity {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  metadata?: Record<string, any>;
}

export interface EventWithDetails extends Event {
  attendees: EventAttendee[];
  comments: EventComment[];
  rsvpStats: RSVPStats;
}

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: "going" | "maybe" | "not_going";
  responseDate: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface EventComment {
  id: string;
  content: string;
  authorId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface RSVPStats {
  going: number;
  maybe: number;
  notGoing: number;
  total: number;
  responseRate: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  familyId: string;
  authorId: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  metadata?: Record<string, any>;
}

export interface EventFilters extends FamilyFilters {
  dateRange?: "all" | "upcoming" | "past" | "this_week" | "this_month";
  category?: string;
  isPublic?: boolean;
  hasAttendees?: boolean;
  location?: string;
}

export interface RSVPData {
  userId: string;
  eventId: string;
  status: "going" | "maybe" | "not_going";
  notes?: string;
}

class EventsService extends FamilyService<
  Event,
  CreateEventData,
  UpdateEventData
> {
  protected tableName = "events";
  protected selectFields = `
    *,
    author:users!events_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    attendees:event_attendees(
      id,
      user_id,
      status,
      response_date
    ),
    comments:event_comments(
      id,
      content,
      author_id,
      created_at
    )
  `;

  /**
   * Get events with full details for a family
   */
  async getEventsWithDetails(
    familyId: string,
    filters?: EventFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<EventWithDetails[]>> {
    const cacheKey = `events_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<EventWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getEventsWithDetails",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("start_date", { ascending: true })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const events = (data || []) as unknown as EventWithDetails[];

        // Transform and enrich events with additional data
        const enrichedEvents = await Promise.all(
          events.map(async (event) => {
            const rsvpStats = await this.calculateRSVPStats(event.id);
            return {
              ...event,
              rsvpStats,
            };
          }),
        );

        cacheSet(cacheKey, enrichedEvents, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedEvents, error: null };
      },
      "custom",
    );
  }

  /**
   * Get upcoming events for a family
   */
  async getUpcomingEvents(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `upcoming_events_${familyId}_${limit}`;
    const cached = cacheGet<Event[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUpcomingEvents",
      async () => {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .gte("start_date", now)
          .order("start_date", { ascending: true })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const events = (data || []) as unknown as Event[];
        cacheSet(cacheKey, events, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: events, error: null };
      },
      "custom",
    );
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(
    familyId: string,
    startDate: string,
    endDate: string,
    filters?: Omit<EventFilters, "dateRange">,
  ): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `events_date_range_${familyId}_${startDate}_${endDate}`;
    const cached = cacheGet<Event[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getEventsByDateRange",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .gte("start_date", startDate)
          .lte("end_date", endDate);

        // Apply additional filters
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }
        if (filters?.isPublic !== undefined) {
          query = query.eq("is_public", filters.isPublic);
        }
        if (filters?.tags && filters.tags.length > 0) {
          query = query.overlaps("tags", filters.tags);
        }

        const { data, error } = await query.order("start_date", {
          ascending: true,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const events = (data || []) as unknown as Event[];
        cacheSet(cacheKey, events, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: events, error: null };
      },
      "custom",
    );
  }

  /**
   * Search events by text content
   */
  async searchEvents(
    familyId: string,
    searchTerm: string,
    filters?: EventFilters,
  ): Promise<ServiceResponse<Event[]>> {
    const cacheKey = `events_search_${familyId}_${searchTerm}`;
    const cached = cacheGet<Event[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchEvents",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`,
          )
          .order("start_date", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const events = (data || []) as unknown as Event[];
        cacheSet(cacheKey, events, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: events, error: null };
      },
      "custom",
    );
  }

  /**
   * RSVP to an event
   */
  async rsvpToEvent(
    rsvpData: RSVPData,
  ): Promise<ServiceResponse<EventAttendee>> {
    return measureAsync(
      "rsvpToEvent",
      async () => {
        const { data, error } = await supabase
          .from("event_attendees")
          .upsert({
            user_id: rsvpData.userId,
            event_id: rsvpData.eventId,
            status: rsvpData.status,
            notes: rsvpData.notes,
            response_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as EventAttendee,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get RSVP statistics for an event
   */
  async getRSVPStats(eventId: string): Promise<ServiceResponse<RSVPStats>> {
    const cacheKey = `rsvp_stats_${eventId}`;
    const cached = cacheGet<RSVPStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRSVPStats",
      async () => {
        const { data, error } = await supabase
          .from("event_attendees")
          .select("status")
          .eq("event_id", eventId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const attendees = data || [];
        const going = attendees.filter((a) => a.status === "going").length;
        const maybe = attendees.filter((a) => a.status === "maybe").length;
        const notGoing = attendees.filter(
          (a) => a.status === "not_going",
        ).length;
        const total = attendees.length;

        const stats: RSVPStats = {
          going,
          maybe,
          notGoing,
          total,
          responseRate: total > 0 ? Math.round((total / total) * 100) : 0,
        };

        cacheSet(cacheKey, stats, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Add comment to an event
   */
  async addEventComment(
    eventId: string,
    commentData: { content: string; authorId: string },
  ): Promise<ServiceResponse<EventComment>> {
    return measureAsync(
      "addEventComment",
      async () => {
        const { data, error } = await supabase
          .from("event_comments")
          .insert({
            event_id: eventId,
            content: commentData.content,
            author_id: commentData.authorId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as EventComment,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get event statistics for a family
   */
  async getEventStats(familyId: string): Promise<
    ServiceResponse<{
      totalEvents: number;
      upcomingEvents: number;
      pastEvents: number;
      eventsByCategory: Record<string, number>;
      averageAttendance: number;
    }>
  > {
    const cacheKey = `event_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getEventStats",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select("start_date, category")
          .eq("family_id", familyId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const events = data || [];
        const now = new Date();

        const stats = {
          totalEvents: events.length,
          upcomingEvents: events.filter((e) => new Date(e.start_date) > now)
            .length,
          pastEvents: events.filter((e) => new Date(e.start_date) <= now)
            .length,
          eventsByCategory: events.reduce(
            (acc, e) => {
              const category = e.category || "uncategorized";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageAttendance:
            events.length > 0 ? Math.round(events.length / events.length) : 0,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Calculate RSVP stats for an event
   */
  private async calculateRSVPStats(eventId: string): Promise<RSVPStats> {
    const result = await this.getRSVPStats(eventId);
    return result.success
      ? result.data!
      : {
          going: 0,
          maybe: 0,
          notGoing: 0,
          total: 0,
          responseRate: 0,
        };
  }

  /**
   * Invalidate cache for events
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`events_family_${familyId}`),
      new RegExp(`events_with_details_${familyId}`),
      new RegExp(`upcoming_events_${familyId}`),
      new RegExp(`events_date_range_${familyId}`),
      new RegExp(`events_search_${familyId}`),
      new RegExp(`event_stats_${familyId}`),
      new RegExp(`rsvp_stats_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const eventService = new EventsService();

// Legacy export for backward compatibility
export const eventsService = eventService;
