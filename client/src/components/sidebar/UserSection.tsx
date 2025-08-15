// UserSection Component - Handles user-related functionality and family members display
// Extracted from SimpleSidebar.tsx for better modularity and maintainability

import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UserListSkeleton } from "@/components/ui/skeleton";

interface FamilyMember {
  id: string;
  name: string;
  initials?: string;
  avatar?: string;
  isOnline: boolean;
  role?: string;
  awayMessage?: string;
}

interface UserSectionProps {
  user: any;
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

export function UserSection({
  user,
  familyMembers,
  isLoading,
  error,
  onRetry,
  className = "",
}: UserSectionProps) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMemberAction = async (action: string, memberName: string) => {
    try {
      switch (action) {
        case "message":
          toast({
            title: "Chat started",
            description: `Opening private chat with ${memberName}`,
          });
          break;
        case "video":
          toast({
            title: "Video call starting",
            description: `Connecting to ${memberName} via Kynnect`,
          });
          break;
        case "group":
          toast({
            title: "Added to group",
            description: `${memberName} has been added to the group chat`,
          });
          break;
        case "profile":
          // Navigate to profile or open profile modal
          break;
      }
      setSelectedPerson(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const EmptyState = () => (
    <div className="space-y-3 p-3 bg-accent/5 rounded-lg border border-accent/10 flex-shrink-0">
      <h3 className="text-xs font-medium text-accent uppercase tracking-wide">
        Who's Around
      </h3>
      <div className="text-center py-6">
        <UserPlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          No family members yet
        </p>
        <Link to="/contacts">
          <Button size="sm" variant="outline" className="text-xs">
            Invite Family
          </Button>
        </Link>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="space-y-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10 flex-shrink-0">
      <h3 className="text-xs font-medium text-destructive uppercase tracking-wide">
        Who's Around
      </h3>
      <div className="text-center py-6">
        <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="text-xs"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="space-y-3 p-3 bg-accent/5 rounded-lg border border-accent/10 flex-shrink-0">
      <h3 className="text-xs font-medium text-accent uppercase tracking-wide">
        Who's Around
      </h3>
      <UserListSkeleton />
    </div>
  );

  if (!user) {
    return (
      <div
        className={`space-y-3 p-3 bg-muted/5 rounded-lg border border-muted/10 flex-shrink-0 ${className}`}
      >
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Who's Around
        </h3>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Please log in to see family members
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (familyMembers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={`space-y-3 p-3 bg-accent/5 rounded-lg border border-accent/10 flex-shrink-0 ${className}`}
    >
      <h3 className="text-xs font-medium text-accent uppercase tracking-wide">
        Who's Around
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
        {familyMembers.map((person) => (
          <div className="relative" key={person.id}>
            <div
              className="flex items-center gap-3 text-sm hover:bg-accent/10 p-2 rounded transition-all cursor-pointer"
              onClick={() =>
                setSelectedPerson(
                  selectedPerson === person.name ? null : person.name,
                )
              }
            >
              <div className="relative">
                <Avatar className="w-6 h-6 shadow-sm">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      person.isOnline
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                {person.isOnline ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-card shadow-sm animate-pulse"></div>
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full border border-card shadow-sm"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{person.name}</div>
                {!person.isOnline && person.awayMessage && (
                  <div className="text-xs text-muted-foreground italic mt-0.5">
                    {person.awayMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Messaging Options Dropdown */}
            {selectedPerson === person.name && (
              <div className="absolute left-0 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1 text-xs"
                    onClick={() => handleMemberAction("message", person.name)}
                  >
                    💬 Message privately
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1 text-xs"
                    onClick={() => handleMemberAction("video", person.name)}
                  >
                    📹 Video call
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1 text-xs"
                    onClick={() => handleMemberAction("group", person.name)}
                  >
                    👥 Add to group chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => handleMemberAction("profile", person.name)}
                  >
                    👤 View profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
