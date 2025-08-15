// EventWidget Component - Displays upcoming events in the sidebar
// Extracted from SimpleRightSidebar.tsx for better modularity and maintainability

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CalendarPlus,
  Plus,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location?: string;
  type: string;
  organizer: {
    name: string;
    avatar?: string;
  };
}

interface EventWidgetProps {
  events: UpcomingEvent[];
  isLoading: boolean;
  hasFamily: boolean;
  className?: string;
}

export function EventWidget({
  events,
  isLoading,
  hasFamily,
  className = "",
}: EventWidgetProps) {
  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-yellow-100 text-yellow-800";
      case "anniversary":
        return "bg-red-100 text-red-800";
      case "gathering":
        return "bg-blue-100 text-blue-800";
      case "holiday":
        return "bg-green-100 text-green-800";
      case "milestone":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !hasFamily ? (
          <div className="text-center py-6">
            <UserPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Join a family to see events
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "/family-management")}
            >
              Join Family
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <CalendarPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No upcoming events
            </p>
            <Link to="/events">
              <Button size="sm" variant="outline">
                <Plus className="w-3 h-3 mr-1" />
                Add Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={cn("text-xs", getEventTypeColor(event.type))}
                      >
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {event.time}
                      {event.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </Link>
            ))}

            {events.length >= 3 && (
              <Link to="/events">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Events
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
