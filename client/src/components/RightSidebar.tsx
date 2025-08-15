import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface RightSidebarProps {
  className?: string;
}

const upcomingEvents = [
  {
    id: 1,
    title: "Dad's Birthday",
    date: "Mon 2/1 - 3 days away",
    type: "birthday",
  },
  {
    id: 2,
    title: "Christmas in July",
    date: "Party - July 25",
    location: "Grandma's",
    type: "party",
  },
  {
    id: 3,
    title: "Music Night",
    date: "Tomorrow 8pm",
    type: "event",
  },
];

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        "w-80 p-6 bg-background border-l border-border overflow-y-auto",
        className,
      )}
    >
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            My Profile
          </span>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              L
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search" className="pl-10" />
      </div>

      {/* Upcoming Events */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {event.title}
                </h4>
                <p className="text-sm text-muted-foreground">{event.date}</p>
                {event.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Cousin Joe", initials: "CJ", online: true },
            { name: "Aunt Lynn", initials: "AL", online: false },
            { name: "Dad", initials: "D", online: true },
          ].map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                {member.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {member.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
