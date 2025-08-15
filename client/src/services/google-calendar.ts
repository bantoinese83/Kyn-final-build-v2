// Google Calendar Service - Integrates with Google Calendar API
// Provides calendar functionality for family events and scheduling

import { logServiceError } from "../lib/logger";

// Google Calendar API configuration
const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/auth/google/callback`;

// Google Calendar API scopes
const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

// Google Calendar API endpoints
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

// Types for Google Calendar integration
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
    organizer?: boolean;
    self?: boolean;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  colorId?: string;
  created: string;
  updated: string;
  htmlLink: string;
  status: "confirmed" | "tentative" | "cancelled";
  transparency?: "opaque" | "transparent";
  visibility?: "default" | "public" | "private" | "confidential";
}

export interface CreateGoogleCalendarEventData {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  colorId?: string;
  transparency?: "opaque" | "transparent";
  visibility?: "default" | "public" | "private" | "confidential";
}

export interface UpdateGoogleCalendarEventData
  extends Partial<CreateGoogleCalendarEventData> {
  id: string;
}

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  timeZone?: string;
}

export interface GoogleCalendarServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.loadStoredTokens();
  }

  /**
   * Load stored authentication tokens from localStorage
   */
  private loadStoredTokens(): void {
    try {
      this.accessToken = localStorage.getItem("google_calendar_access_token");
      this.refreshToken = localStorage.getItem("google_calendar_refresh_token");
      const expiry = localStorage.getItem("google_calendar_token_expiry");
      this.tokenExpiry = expiry ? parseInt(expiry) : null;
    } catch (error) {
      logServiceError(
        "GoogleCalendarService",
        "loadStoredTokens",
        error as Error,
      );
    }
  }

  /**
   * Store authentication tokens in localStorage
   */
  private storeTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): void {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      localStorage.setItem("google_calendar_access_token", accessToken);
      localStorage.setItem("google_calendar_refresh_token", refreshToken);
      localStorage.setItem(
        "google_calendar_token_expiry",
        this.tokenExpiry.toString(),
      );
    } catch (error) {
      logServiceError("GoogleCalendarService", "storeTokens", error as Error);
    }
  }

  /**
   * Check if user is authenticated with Google Calendar
   */
  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return Date.now() < this.tokenExpiry;
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: GOOGLE_CALENDAR_SCOPES,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      state: this.generateState(),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate random state parameter for OAuth security
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleAuthCallback(
    code: string,
  ): Promise<GoogleCalendarServiceResponse<boolean>> {
    try {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Google Calendar credentials not configured");
      }

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth token exchange failed: ${response.status}`);
      }

      const tokenData = await response.json();
      this.storeTokens(
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in,
      );

      return {
        success: true,
        data: true,
        message: "Successfully authenticated with Google Calendar",
      };
    } catch (error) {
      const errorMessage = "Failed to authenticate with Google Calendar";
      logServiceError(
        "GoogleCalendarService",
        "handleAuthCallback",
        error as Error,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return false;
      }

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        return false;
      }

      const tokenData = await response.json();
      this.storeTokens(
        tokenData.access_token,
        this.refreshToken,
        tokenData.expires_in,
      );
      return true;
    } catch (error) {
      logServiceError(
        "GoogleCalendarService",
        "refreshAccessToken",
        error as Error,
      );
      return false;
    }
  }

  /**
   * Make authenticated request to Google Calendar API
   */
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<GoogleCalendarServiceResponse<T>> {
    try {
      if (!this.isAuthenticated()) {
        if (!(await this.refreshAccessToken())) {
          return {
            success: false,
            error:
              "Authentication required. Please sign in to Google Calendar.",
          };
        }
      }

      const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          if (await this.refreshAccessToken()) {
            // Retry the request
            const retryResponse = await fetch(
              `${GOOGLE_CALENDAR_API_BASE}${endpoint}`,
              {
                ...options,
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  "Content-Type": "application/json",
                  ...options.headers,
                },
              },
            );

            if (!retryResponse.ok) {
              throw new Error(
                `Google Calendar API error: ${retryResponse.status}`,
              );
            }

            const data = await retryResponse.json();
            return { success: true, data };
          } else {
            return {
              success: false,
              error: "Authentication failed. Please sign in again.",
            };
          }
        }

        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const errorMessage = "Failed to make Google Calendar API request";
      logServiceError(
        "GoogleCalendarService",
        "makeAuthenticatedRequest",
        error as Error,
        { endpoint },
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get list of user's calendars
   */
  async getCalendarList(): Promise<
    GoogleCalendarServiceResponse<GoogleCalendarListEntry[]>
  > {
    const result = await this.makeAuthenticatedRequest<{
      items: GoogleCalendarListEntry[];
    }>("/users/me/calendarList");
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.items || [],
      };
    }
    return result as unknown as GoogleCalendarServiceResponse<
      GoogleCalendarListEntry[]
    >;
  }

  /**
   * Get events from a specific calendar
   */
  async getEvents(
    calendarId: string = "primary",
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
      orderBy?: "startTime" | "updated";
      q?: string;
    } = {},
  ): Promise<GoogleCalendarServiceResponse<GoogleCalendarEvent[]>> {
    const params = new URLSearchParams();

    if (options.timeMin) params.append("timeMin", options.timeMin);
    if (options.timeMax) params.append("timeMax", options.timeMax);
    if (options.maxResults)
      params.append("maxResults", options.maxResults.toString());
    if (options.singleEvents !== undefined)
      params.append("singleEvents", options.singleEvents.toString());
    if (options.orderBy) params.append("orderBy", options.orderBy);
    if (options.q) params.append("q", options.q);

    const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

    const result = await this.makeAuthenticatedRequest<{
      items: GoogleCalendarEvent[];
    }>(endpoint);
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.items || [],
      };
    }
    return result as unknown as GoogleCalendarServiceResponse<
      GoogleCalendarEvent[]
    >;
  }

  /**
   * Create a new calendar event
   */
  async createEvent(
    calendarId: string = "primary",
    eventData: CreateGoogleCalendarEventData,
  ): Promise<GoogleCalendarServiceResponse<GoogleCalendarEvent>> {
    const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events`;

    return this.makeAuthenticatedRequest<GoogleCalendarEvent>(endpoint, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    calendarId: string = "primary",
    eventId: string,
    eventData: UpdateGoogleCalendarEventData,
  ): Promise<GoogleCalendarServiceResponse<GoogleCalendarEvent>> {
    const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    return this.makeAuthenticatedRequest<GoogleCalendarEvent>(endpoint, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    calendarId: string = "primary",
    eventId: string,
  ): Promise<GoogleCalendarServiceResponse<boolean>> {
    const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    const result = await this.makeAuthenticatedRequest(endpoint, {
      method: "DELETE",
    });

    if (result.success) {
      return {
        success: true,
        data: true,
        message: "Event deleted successfully",
      };
    }

    return result as GoogleCalendarServiceResponse<boolean>;
  }

  /**
   * Get a specific calendar event
   */
  async getEvent(
    calendarId: string = "primary",
    eventId: string,
  ): Promise<GoogleCalendarServiceResponse<GoogleCalendarEvent>> {
    const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

    return this.makeAuthenticatedRequest<GoogleCalendarEvent>(endpoint);
  }

  /**
   * Get free/busy information for calendar
   */
  async getFreeBusy(
    timeMin: string,
    timeMax: string,
    calendarIds: string[] = ["primary"],
  ): Promise<GoogleCalendarServiceResponse<any>> {
    const endpoint = "/freeBusy";

    return this.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: calendarIds.map((id) => ({ id })),
      }),
    });
  }

  /**
   * Sign out and clear stored tokens
   */
  signOut(): void {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;

      localStorage.removeItem("google_calendar_access_token");
      localStorage.removeItem("google_calendar_refresh_token");
      localStorage.removeItem("google_calendar_token_expiry");
    } catch (error) {
      logServiceError("GoogleCalendarService", "signOut", error as Error);
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    isConfigured: boolean;
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasApiKey: boolean;
  } {
    return {
      isConfigured: this.isConfigured(),
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      hasApiKey: !!GOOGLE_CALENDAR_API_KEY,
    };
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export types for external use
export type {
  GoogleCalendarEvent,
  CreateGoogleCalendarEventData,
  UpdateGoogleCalendarEventData,
  GoogleCalendarListEntry,
  GoogleCalendarServiceResponse,
};
