// FeedItem Component - Displays individual feed posts
// Extracted from MainFeed.tsx for better modularity and maintainability

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Bookmark,
  Flag,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types/posts";

interface FeedItemProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, comment: string) => Promise<void>;
  onShare: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => Promise<void>;
  onReport?: (postId: string, reason: string) => Promise<void>;
  className?: string;
}

export function FeedItem({
  post,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onReport,
  className = "",
}: FeedItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showActions, setShowActions] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user?.id === post.author.id;

  const handleLike = async () => {
    try {
      await onLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await onComment(post.id, commentText.trim());
      setCommentText("");
      setShowCommentInput(false);
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    onShare(post.id);
    toast({
      title: "Post Shared",
      description: "Post has been shared successfully.",
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await onDelete(post.id);
        toast({
          title: "Post Deleted",
          description: "Your post has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReport = async () => {
    if (!onReport) return;

    const reason = prompt("Please provide a reason for reporting this post:");
    if (reason) {
      try {
        await onReport(post.id, reason);
        toast({
          title: "Post Reported",
          description: "Thank you for your report. We'll review it shortly.",
        });
        setShowActions(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to report post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      className={`mb-6 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="text-sm">
                {post.author.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.author.name}
                </h3>
                {post.author.isVerified && (
                  <Badge variant="outline" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formatTimestamp(post.createdAt)}
                {post.location && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{post.location}</span>
                  </>
                )}
              </p>
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
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {isAuthor && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="w-full justify-start rounded-none rounded-t-lg"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Post
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="w-full justify-start rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </Button>
                  </>
                )}
                {!isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReport}
                    className="w-full justify-start rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="space-y-3">
          {post.title && (
            <h4 className="text-lg font-semibold text-gray-900">
              {post.title}
            </h4>
          )}

          {post.content && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span>
              {likeCount} like{likeCount !== 1 ? "s" : ""}
            </span>
            <span>
              {post.commentCount || 0} comment
              {(post.commentCount || 0) !== 1 ? "s" : ""}
            </span>
            <span>
              {post.shareCount || 0} share
              {(post.shareCount || 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {post.viewCount && (
            <span>
              {post.viewCount} view{(post.viewCount || 0) !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 justify-center gap-2 ${
              isLiked
                ? "text-red-600 hover:text-red-700"
                : "text-gray-600 hover:text-gray-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-700"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              <Button
                onClick={handleComment}
                disabled={isSubmitting || !commentText.trim()}
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="space-y-2">
              {post.comments.slice(0, 3).map((comment, index) => (
                <div key={index} className="flex gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      <span className="text-gray-700 ml-2">
                        {comment.content}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {post.comments.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  View all {post.comments.length} comments
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
