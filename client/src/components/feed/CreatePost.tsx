// CreatePost Component - Handles post creation in the feed
// Extracted from MainFeed.tsx for better modularity

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Video, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePostProps {
  onPostCreated: (content: string) => void;
  className?: string;
}

export function CreatePost({ onPostCreated, className }: CreatePostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      await onPostCreated(newPost);
      setNewPost("");
      toast({
        title: "Post created",
        description: "Your post has been shared with the family.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreatePost();
    }
  };

  if (!user) return null;

  return (
    <Card className={cn("mb-4", className)}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                (user as any).avatar ||
                (user as any).user_metadata?.avatar ||
                undefined
              }
            />
            <AvatarFallback>
              {(
                (user as any).name ||
                (user as any).user_metadata?.name ||
                "U"
              ).charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <Input
              placeholder="What's happening in your family today?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={isCreatingPost}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  disabled={isCreatingPost}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  disabled={isCreatingPost}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={!newPost.trim() || isCreatingPost}
                className="h-8 px-4"
              >
                {isCreatingPost ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
