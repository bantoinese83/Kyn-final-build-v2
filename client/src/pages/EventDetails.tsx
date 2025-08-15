import { useParams, useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabaseDataService } from "@/services";
import { useToast } from "@/hooks/use-toast";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  type: string;
  organizerId: string;
  familyId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Attendee {
  id: string;
  userId: string;
  eventId: string;
  status: "attending" | "not-attending" | "maybe";
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  message?: string;
}

export function EventDetails() {
  const { day } = useParams();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [userRsvp, setUserRsvp] = useState<
    "attending" | "not-attending" | "maybe" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const { toast } = useToast();

  // For URL compatibility, we need to map the day param to event ID
  // This is a temporary solution - ideally the URL should use the actual event ID
  const eventId = day; // Assuming day parameter is actually the event ID

  useEffect(() => {
    const loadEventDetails = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        // TODO: Implement event detail methods in supabaseData service
        // For now, we'll use placeholder data
        const eventData: any = null;
        const attendeesData: any[] = [];

        setEvent(eventData);
        setAttendees(attendeesData);

        // Get current user's RSVP status
        const currentUserId = localStorage.getItem("userId");
        if (currentUserId) {
          const userAttendee = attendeesData.find(
            (a: Attendee) => a.userId === currentUserId,
          );
          setUserRsvp(userAttendee?.status || null);
        }
      } catch (error) {
        console.error("Error loading event details:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [eventId, toast]);

  const handleRsvp = async (
    status: "attending" | "not-attending" | "maybe",
  ) => {
    if (!eventId) return;

    try {
      setRsvpLoading(true);
      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Please log in to RSVP to events.",
          variant: "destructive",
        });
        return;
      }

      await supabaseDataService.rsvpEvent(eventId, currentUserId, status);
      setUserRsvp(status);

      // Refresh attendees list
      const updatedAttendeesResult =
        await supabaseDataService.getEventAttendees(eventId);
      if (updatedAttendeesResult.success && updatedAttendeesResult.data) {
        setAttendees(updatedAttendeesResult.data);
      }

      toast({
        title: "RSVP Updated",
        description: `You are now marked as ${status.replace("-", " ")}.`,
      });
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-dark-blue mb-2">
                Event Not Found
              </h1>
              <Link to="/" className="text-olive-green hover:text-warm-brown">
                Back to Dash
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Group attendees by status
  const goingAttendees = attendees.filter((a) => a.status === "attending");
  const maybeAttendees = attendees.filter((a) => a.status === "maybe");
  const notGoingAttendees = attendees.filter(
    (a) => a.status === "not-attending",
  );
  const totalResponses = attendees.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <main className="flex-1 flex flex-col max-w-4xl mx-auto p-6 overflow-y-auto">
          <div className="mb-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>

          <div className="space-y-6">
            {/* Event Header */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                <p className="text-muted-foreground text-lg">
                  {event.description}
                </p>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Event Date
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium">
                          {event.time}
                          {event.endTime ? ` - ${event.endTime}` : ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Duration
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium">
                          {event.location || "Location TBD"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.location
                            ? "Event Location"
                            : "Location will be shared closer to the event"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-accent" />
                      <div>
                        <div className="font-medium">
                          Organized by {event.organizer?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Event Organizer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex gap-3">
                  <Button
                    className="flex-1"
                    size="lg"
                    variant={userRsvp === "attending" ? "default" : "outline"}
                    onClick={() => handleRsvp("attending")}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading && userRsvp !== "attending" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    I'm Going
                  </Button>
                  <Button
                    variant={userRsvp === "maybe" ? "default" : "outline"}
                    className="flex-1"
                    size="lg"
                    onClick={() => handleRsvp("maybe")}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading && userRsvp !== "maybe" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <HelpCircle className="w-4 h-4 mr-2" />
                    )}
                    Maybe
                  </Button>
                  <Button
                    variant={
                      userRsvp === "not-attending" ? "default" : "outline"
                    }
                    className="flex-1"
                    size="lg"
                    onClick={() => handleRsvp("not-attending")}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading && userRsvp !== "not-attending" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Can't Make It
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  RSVP Status ({totalResponses} responses)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Going */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium">
                      Going ({goingAttendees.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {goingAttendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={attendee.user.avatar} />
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                            {attendee.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {attendee.user.name}
                          </div>
                          {attendee.message && (
                            <div className="text-sm text-muted-foreground italic">
                              "{attendee.message}"
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maybe */}
                {maybeAttendees.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-medium">
                        Maybe ({maybeAttendees.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {maybeAttendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={attendee.user.avatar} />
                            <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xs">
                              {attendee.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {attendee.user.name}
                            </div>
                            {attendee.message && (
                              <div className="text-sm text-muted-foreground italic">
                                "{attendee.message}"
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Going */}
                {notGoingAttendees.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-medium">
                        Can't Make It ({notGoingAttendees.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {notGoingAttendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={attendee.user.avatar} />
                            <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                              {attendee.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {attendee.user.name}
                            </div>
                            {attendee.message && (
                              <div className="text-sm text-muted-foreground italic">
                                "{attendee.message}"
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
