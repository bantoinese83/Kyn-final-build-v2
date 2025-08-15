// FamilyStoryCard Component - Displays individual family stories
// Extracted from FamilyHistory.tsx to improve maintainability and reusability

import { Heart, MessageCircle, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FamilyStory {
  id: string;
  title: string;
  category: "wisdom" | "childhood" | "love" | "adventure";
  content: string;
  era: string;
  type: "story" | "photo" | "video" | "voice";
  loves: number;
  comments: number;
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface FamilyStoryCardProps {
  story: FamilyStory;
  onLove: (storyId: string) => void;
  onComment: (storyId: string) => void;
  onEdit?: (story: FamilyStory) => void;
  onDelete?: (storyId: string) => void;
  className?: string;
}

export function FamilyStoryCard({
  story,
  onLove,
  onComment,
  onEdit,
  onDelete,
  className = "",
}: FamilyStoryCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wisdom":
        return "🧠";
      case "childhood":
        return "👶";
      case "love":
        return "💕";
      case "adventure":
        return "🗺️";
      default:
        return "📖";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "wisdom":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "childhood":
        return "bg-green-100 text-green-800 border-green-200";
      case "love":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "adventure":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return "📷";
      case "video":
        return "🎥";
      case "voice":
        return "🎤";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {story.author.avatar ? (
                <AvatarImage
                  src={story.author.avatar}
                  alt={story.author.name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {story.author.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {story.author.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(story.createdAt)}</span>
                <span>•</span>
                <span>{story.era}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${getCategoryColor(story.category)}`}>
              {getCategoryIcon(story.category)} {story.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getTypeIcon(story.type)} {story.type}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {story.title}
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {truncateContent(story.content)}
          </p>
        </div>

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {story.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLove(story.id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
              <span>{story.loves}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(story.id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{story.comments}</span>
            </Button>
          </div>

          {/* Edit/Delete Actions */}
          {(onEdit || onDelete) && (
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(story)}
                  className="text-xs"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(story.id)}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
