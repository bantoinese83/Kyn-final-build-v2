import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MessageCircle,
  Image,
  Trophy,
  Heart,
  Users,
  Clock,
  ChevronRight,
  Activity,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { familyService, postService, eventService } from "@/services";
import { dateUtils } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

interface RecentActivityItem {
  id: string;
  type: "event" | "post" | "photo" | "milestone" | "recipe" | "poll";
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  timestamp: string;
  relativeTime: string;
  metadata?: {
    eventType?: string;
    likes?: number;
    comments?: number;
    attendees?: number;
  };
}

const activityIcons = {
  event: Calendar,
  post: MessageCircle,
  photo: Image,
  milestone: Trophy,
  recipe: Heart,
  poll: Users,
};

const activityColors = {
  event: "text-blue-600",
  post: "text-green-600",
  photo: "text-purple-600",
  milestone: "text-yellow-600",
  recipe: "text-red-600",
  poll: "text-indigo-600",
};

export function RecentActivity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const notifications = useNotifications();
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's families
      const familiesResult = await familyService.getUserFamilies(user.id);

      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      ) {
        setActivities([]);
        setCurrentFamily(null);
        return;
      }

      // Get recent activity from all families (you might want to focus on a primary family)
      const primaryFamily = familiesResult.data[0]; // For now, use the first family
      const postsResult = await postService.getFamilyPosts(primaryFamily.id);
      const eventsResult = await eventService.getFamilyEvents(primaryFamily.id);

      // Aggregate recent activity from multiple sources
      const recentActivities: RecentActivityItem[] = [];

      try {
        // Get recent posts
        if (postsResult.success && postsResult.data) {
          postsResult.data.forEach((post: any) => {
            recentActivities.push({
              id: `post-${post.id}`,
              type: "post",
              title: "shared a post",
              description:
                post.content.substring(0, 100) +
                (post.content.length > 100 ? "..." : ""),
              user: {
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.avatar,
                initials: post.author.initials,
              },
              timestamp: post.createdAt,
              relativeTime: dateUtils.formatRelativeTime(post.createdAt),
              metadata: {
                likes: post.likes,
                comments: post.comments,
              },
            });
          });
        }
      } catch (err) {
        console.error("Error loading posts for activity:", err);
      }

      try {
        // Get recent events
        if (eventsResult.success && eventsResult.data) {
          eventsResult.data.forEach((event: any) => {
            recentActivities.push({
              id: `event-${event.id}`,
              type: "event",
              title: "created an event",
              description: event.title,
              user: {
                id: event.organizer.id,
                name: event.organizer.name,
                avatar: event.organizer.avatar,
                initials: event.organizer.initials,
              },
              timestamp: event.createdAt,
              relativeTime: dateUtils.formatRelativeTime(event.createdAt),
              metadata: {
                eventType: event.type,
                attendees: event._count?.attendees || 0,
              },
            });
          });
        }
      } catch (err) {
        console.error("Error loading events for activity:", err);
      }

      // Sort activities by timestamp (most recent first)
      recentActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // Take only the most recent 8 activities
      setActivities(recentActivities.slice(0, 8));
    } catch (err) {
      console.error("Error loading recent activity:", err);
      setError("Failed to load recent activity");
    } finally {
      setIsLoading(false);
    }
  };

  // Using centralized date utility instead of duplicate function

  const getActivityLink = (activity: RecentActivityItem) => {
    switch (activity.type) {
      case "event":
        return `/events/${activity.id.replace("event-", "")}`;
      case "post":
        return `/posts/${activity.id.replace("post-", "")}`;
      case "photo":
        return `/photos/${activity.id.replace("photo-", "")}`;
      case "milestone":
        return `/milestones/${activity.id.replace("milestone-", "")}`;
      case "recipe":
        return `/recipes/${activity.id.replace("recipe-", "")}`;
      case "poll":
        return `/polls/${activity.id.replace("poll-", "")}`;
      default:
        return "#";
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <UserPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Please log in to see family activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
          {currentFamily && (
            <span className="text-sm font-normal text-muted-foreground">
              • {currentFamily.familyName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button size="sm" variant="outline" onClick={loadRecentActivity}>
              Try Again
            </Button>
          </div>
        ) : !currentFamily ? (
          <div className="text-center py-6">
            <UserPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Join a family to see recent activity
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "/family-management")}
            >
              Join Family
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Start sharing posts and creating events to see activity here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <Link
                  key={activity.id}
                  to={getActivityLink(activity)}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={activity.user.avatar}
                        alt={activity.user.name}
                      />
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border`}
                    >
                      <Icon className={`w-2.5 h-2.5 ${colorClass}`} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {activity.user.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {activity.title}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{activity.relativeTime}</span>

                      {activity.metadata && (
                        <>
                          {activity.metadata.likes !== undefined && (
                            <>
                              <span>•</span>
                              <span>{activity.metadata.likes} likes</span>
                            </>
                          )}
                          {activity.metadata.comments !== undefined && (
                            <>
                              <span>•</span>
                              <span>{activity.metadata.comments} comments</span>
                            </>
                          )}
                          {activity.metadata.attendees !== undefined && (
                            <>
                              <span>•</span>
                              <span>
                                {activity.metadata.attendees} attending
                              </span>
                            </>
                          )}
                          {activity.metadata.eventType && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs py-0">
                                {activity.metadata.eventType}
                              </Badge>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </Link>
              );
            })}

            {activities.length > 0 && (
              <div className="pt-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Activity
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
