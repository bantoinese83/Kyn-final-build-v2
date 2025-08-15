import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { familyService, eventService } from "@/services";
import { Link } from "react-router-dom";

interface CalendarEvent {
  id: string;
  date: number;
  title: string;
  type:
    | "birthday"
    | "anniversary"
    | "gathering"
    | "holiday"
    | "milestone"
    | "activity";
  fullDate: Date;
}

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date().getDate();
  const isCurrentMonth =
    currentMonth === new Date().getMonth() &&
    currentYear === new Date().getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [user, currentMonth, currentYear]);

  const loadEvents = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get user's families
      const familiesResult = await familyService.getUserFamilies(user.id);

      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setEvents([]);
        return;
      }

      // Get events from all families (you might want to focus on a primary family)
      const primaryFamily = familiesResult.data[0]; // For now, use the first family
      const eventsResult = await eventService.getFamilyEvents(primaryFamily.id);

      if (!eventsResult.success || !eventsResult.data) {
        setEvents([]);
        return;
      }

      // Filter events for current month and transform them
      const monthEvents = eventsResult.data
        .filter((event: any) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getMonth() === currentMonth &&
            eventDate.getFullYear() === currentYear
          );
        })
        .map((event: any) => {
          const eventDate = new Date(event.date);
          return {
            id: event.id,
            date: eventDate.getDate(),
            title: event.title,
            type: event.type as CalendarEvent["type"],
            fullDate: eventDate,
          };
        });

      setEvents(monthEvents);
    } catch (err) {
      console.error("Error loading calendar events:", err);
      setError("Failed to load events");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getEventsForDay = (day: number) => {
    return events.filter((event) => event.date === day);
  };

  const handleDateClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      const event = dayEvents[0]; // Take the first event
      toast({
        title: `Opening ${event.type}`,
        description: `Viewing details for ${event.title}`,
      });

      // Navigate to event details
      window.location.href = `/events/${event.id}`;
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  if (!user) {
    return (
      <div className="p-3 bg-muted/5 rounded-lg border border-muted/10">
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Please log in to view calendar
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={loadEvents}
            className="text-xs"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="flex gap-1">
            <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-accent flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent/10"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent/10"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={index}
            className="text-sm font-medium text-muted-foreground text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-8"></div>;
          }

          const dayEvents = getEventsForDay(day);
          const isToday = isCurrentMonth && day === today;
          const hasBirthday = dayEvents.some(
            (event) => event.type === "birthday",
          );
          const hasEvent = dayEvents.some((event) => event.type !== "birthday");

          return (
            <div
              key={index}
              className={cn(
                "h-8 flex flex-col items-center justify-center text-xs rounded transition-all cursor-pointer hover:bg-accent/10 relative",
                isToday && "bg-accent text-accent-foreground font-bold",
                !isToday && "text-foreground",
                dayEvents.length > 0 &&
                  "hover:bg-primary/10 hover:scale-105 hover:shadow-sm",
              )}
              title={dayEvents.map((e) => e.title).join(", ")}
              onClick={() => handleDateClick(day)}
            >
              <span className="text-sm">{day}</span>

              {/* Event indicators */}
              {(hasBirthday || hasEvent) && (
                <div className="flex items-center gap-0.5 absolute -bottom-0.5">
                  {hasBirthday && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#f1a805" }}
                      title="Birthday"
                    ></div>
                  )}
                  {hasEvent && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#47622b" }}
                      title="Event"
                    ></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state or legend */}
      {events.length === 0 ? (
        <div className="mt-3 pt-2 border-t border-accent/10 text-center">
          <CalendarPlus className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground mb-2">
            No events this month
          </p>
          <Link to="/events">
            <Button size="sm" variant="outline" className="text-xs">
              Add Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-accent/10">
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#f1a805" }}
              ></div>
              <span className="text-muted-foreground">Birthdays</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#47622b" }}
              ></div>
              <span className="text-muted-foreground">Events</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
