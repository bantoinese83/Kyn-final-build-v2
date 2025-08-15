// Google Calendar Widget - Example component demonstrating Google Calendar integration
// This component shows how to use the useGoogleCalendar hook for basic calendar operations

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  RefreshCw,
  LogIn,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import {
  formatEventTime,
  getEventStatusColor,
  getEventStatusIcon,
} from "@/lib/google-calendar-utils";

interface GoogleCalendarWidgetProps {
  className?: string;
  maxEvents?: number;
}

export function GoogleCalendarWidget({
  className = "",
  maxEvents = 5,
}: GoogleCalendarWidgetProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    isAuthenticated,
    isConfigured,
    isLoading,
    calendars,
    events,
    signIn,
    signOut,
    createEvent,
    refreshEvents,
    error,
    clearError,
  } = useGoogleCalendar({
    autoLoadCalendars: true,
    autoLoadEvents: true,
    defaultCalendarId: "primary",
    eventOptions: {
      timeMin: new Date().toISOString(),
      maxResults: maxEvents,
      singleEvents: true,
      orderBy: "startTime",
    },
  });

  const handleCreateEvent = async (eventData: any) => {
    const newEvent = await createEvent("primary", eventData);
    if (newEvent) {
      setShowCreateForm(false);
    }
  };

  const handleRefresh = () => {
    refreshEvents();
  };

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm text-muted-foreground">
              Google Calendar integration is not configured.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please check your environment variables and Google Cloud Console
              setup.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Connect your Google Calendar to view and manage events
            </p>
            <Button onClick={signIn} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 px-2 text-red-500 hover:text-red-700"
            >
              ×
            </Button>
          </div>
        )}

        {/* Calendar Selection */}
        {calendars.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Calendars
            </h4>
            <div className="flex flex-wrap gap-2">
              {calendars.slice(0, 3).map((calendar) => (
                <Badge
                  key={calendar.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: calendar.backgroundColor || "#e5e7eb",
                    color: calendar.foregroundColor || "#374151",
                    borderColor: calendar.backgroundColor || "#d1d5db",
                  }}
                >
                  {calendar.summary}
                  {calendar.primary && " (Primary)"}
                </Badge>
              ))}
              {calendars.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{calendars.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Upcoming Events
          </h4>

          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-2">
                Loading events...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                No upcoming events
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, maxEvents).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.start.dateTime ? "bg-blue-500" : "bg-green-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-medium truncate">
                        {event.summary}
                      </h5>
                      <Badge
                        variant="outline"
                        size="sm"
                        className={`text-xs ${getEventStatusColor(event.status)}`}
                      >
                        {getEventStatusIcon(event.status)}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatEventTime(event)}
                      </div>

                      {event.location && (
                        <div className="truncate">📍 {event.location}</div>
                      )}

                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span className="truncate">
                            {event.attendees.length} attendee
                            {event.attendees.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {events.length > maxEvents && (
                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View {events.length - maxEvents} more events
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() =>
                window.open("https://calendar.google.com", "_blank")
              }
            >
              Open Google Calendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              Create Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
