// PostCard Component - Displays individual posts in the feed
// Extracted from MainFeed.tsx for better modularity

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PostWithAuthor } from "@/services";
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Bookmark,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostWithAuthor;
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, content: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  className?: string;
}

export function PostCard({
  post,
  onDelete,
  onUpdate,
  onLike,
  onComment,
  className,
}: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedChimes, setExpandedChimes] = useState(false);

  const isAuthor = user?.id === post.authorId;
  const isLiked = post.likes > 0; // Simplified like logic

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
  };

  const handleSave = () => {
    if (editContent.trim() && editContent !== post.content) {
      onUpdate(post.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id);
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    }
  };

  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment("");
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleChimes = () => {
    setExpandedChimes(!expandedChimes);
  };

  return (
    <Card className={cn("mb-4", className)}>
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback>
                {post.author?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {post.author?.name || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Post Actions Dropdown */}
          {isAuthor && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDropdown}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 top-8 z-10 w-32 bg-white border rounded-md shadow-lg">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        {isEditing ? (
          <div className="mb-3">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-sm leading-relaxed">{post.content}</p>
            {post.hasImage && post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post content"
                className="mt-3 rounded-lg max-w-full h-auto"
              />
            )}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn("h-8 px-2", isLiked && "text-blue-600 bg-blue-50")}
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              {post.likes || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleComments}
              className="h-8 px-2"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments || 0}
            </Button>

            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Bookmark className="h-4 w-4 mr-1" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleComment}>
                Post
              </Button>
            </div>

            {/* Comments would be rendered here */}
            <div className="text-sm text-muted-foreground">
              Comments feature coming soon...
            </div>
          </div>
        )}

        {/* Chimes Section */}
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChimes}
            className="h-8 px-2 w-full justify-between"
          >
            <span>Family Chimes</span>
            {expandedChimes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {expandedChimes && (
            <div className="mt-2 text-sm text-muted-foreground">
              Chimes feature coming soon...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
