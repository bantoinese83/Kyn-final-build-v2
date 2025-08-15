// EventCard Component - Displays individual event information
// Extracted from Events.tsx for better modularity and maintainability

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trash2,
  MoreHorizontal,
  Gift,
  Heart,
  Users as UsersIcon,
  PartyPopper,
  Star,
  Calendar as CalendarIcon,
} from "lucide-react";
import { FamilyEvent } from "@/types/events";
import { dateUtils } from "@/lib/utils";

interface EventCardProps {
  event: FamilyEvent;
  onUpdate: (eventId: string, updates: any) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  className?: string;
}

const eventTypeIcons = {
  birthday: Gift,
  anniversary: Heart,
  gathering: UsersIcon,
  holiday: PartyPopper,
  milestone: Star,
  activity: CalendarIcon,
};

const eventTypeColors = {
  birthday: "bg-yellow-100 text-yellow-800 border-yellow-200",
  anniversary: "bg-red-100 text-red-800 border-red-200",
  gathering: "bg-blue-100 text-blue-800 border-blue-200",
  holiday: "bg-green-100 text-green-800 border-green-200",
  milestone: "bg-purple-100 text-purple-800 border-purple-200",
  activity: "bg-orange-100 text-orange-800 border-orange-200",
};

export function EventCard({
  event,
  onDelete,
  className = "",
}: EventCardProps) {
  const [showActions, setShowActions] = useState(false);

  const EventTypeIcon =
    eventTypeIcons[event.type as keyof typeof eventTypeIcons] || Calendar;
  const eventColor =
    eventTypeColors[event.type as keyof typeof eventTypeColors] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      onDelete(event.id);
    }
  };

  const formatEventDate = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

    return dateUtils.formatDate(date);
  };

  const getAttendeeCount = () => {
    if (!event.attendees) return 0;
    return event.attendees.reduce(
      (total, attendee) => total + (attendee.guestCount || 1),
      0,
    );
  };

  const getConfirmedAttendees = () => {
    if (!event.attendees) return 0;
    return event.attendees.filter((attendee) => attendee.status === "going")
      .length;
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${eventColor}`}>
              <EventTypeIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {event.title}
              </h3>
              <Badge variant="outline" className={`text-xs ${eventColor}`}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full justify-start rounded-none rounded-b-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Description */}
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{formatEventDate(event.date)}</span>
            {event.time && (
              <>
                <span>•</span>
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{event.time}</span>
              </>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>
              {getConfirmedAttendees()} of {getAttendeeCount()} attending
            </span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <Avatar className="w-8 h-8">
            <AvatarImage src={event.organizer.avatar} />
            <AvatarFallback className="text-xs">
              {event.organizer.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.organizer.name}
            </p>
            <p className="text-xs text-gray-500">Organizer</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {event.isRecurring && (
            <Badge variant="outline" className="text-xs">
              🔄 Recurring
            </Badge>
          )}
          {event.reminders && (
            <Badge variant="outline" className="text-xs">
              ⏰ Reminders
            </Badge>
          )}
          {event.registryLinks && event.registryLinks.length > 0 && (
            <Badge variant="outline" className="text-xs">
              🎁 Registry
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            RSVP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
