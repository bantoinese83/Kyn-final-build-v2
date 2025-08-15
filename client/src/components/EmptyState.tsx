import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "gentle" | "encouraging";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const variants = {
    default: "text-muted-foreground",
    gentle: "text-light-blue-gray",
    encouraging: "text-accent",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 space-y-4",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full bg-accent/10",
            variants[variant],
          )}
        >
          {icon}
        </div>
      )}

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className={cn("text-sm", variants[variant])}>{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant={variant === "encouraging" ? "default" : "outline"}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoPostsEmptyState({
  onCreatePost,
}: {
  onCreatePost?: () => void;
}) {
  return (
    <EmptyState
      icon={<span className="text-2xl">📝</span>}
      title="No posts yet"
      description="Be the first to share a memory, update, or just say hello to your family!"
      actionLabel="Create your first post"
      onAction={onCreatePost}
      variant="encouraging"
    />
  );
}

export function NoEventsEmptyState({
  onCreateEvent,
}: {
  onCreateEvent?: () => void;
}) {
  return (
    <EmptyState
      icon={<span className="text-2xl">📅</span>}
      title="No upcoming events"
      description="Plan your next family gathering, celebration, or get-together."
      actionLabel="Create an event"
      onAction={onCreateEvent}
      variant="encouraging"
    />
  );
}

export function NoPhotosEmptyState({
  onUploadPhoto,
}: {
  onUploadPhoto?: () => void;
}) {
  return (
    <EmptyState
      icon={<span className="text-2xl">📸</span>}
      title="No photos shared yet"
      description="Start building your family's digital album by sharing your favorite moments."
      actionLabel="Upload photos"
      onAction={onUploadPhoto}
      variant="encouraging"
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={<span className="text-2xl">💬</span>}
      title="No messages yet"
      description="Start a conversation with your family members. They'll be happy to hear from you!"
      variant="gentle"
    />
  );
}
