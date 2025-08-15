// MediaCard Component - Displays individual media items
// Extracted from Media.tsx to improve maintainability and reusability

import {
  Star,
  Heart,
  Eye,
  Clock,
  ThumbsUp,
  MessageCircle,
  Share2,
  BookOpen,
  Film,
  Headphones,
  Monitor,
  Music,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MediaType = "all" | "books" | "movies" | "tv" | "podcasts" | "music";

interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  genre: string[];
  rating: number;
  year?: number;
  author?: string;
  artist?: string;
  director?: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}

interface MediaCardProps {
  media: MediaItem;
  onLike: (mediaId: string) => void;
  onComment: (mediaId: string) => void;
  onShare: (media: MediaItem) => void;
  onView: (media: MediaItem) => void;
  className?: string;
}

export function MediaCard({
  media,
  onLike,
  onComment,
  onShare,
  onView,
  className = "",
}: MediaCardProps) {
  const getMediaIcon = (type: MediaType) => {
    const iconMap: { [key in MediaType]: any } = {
      all: Film,
      books: BookOpen,
      movies: Film,
      tv: Monitor,
      podcasts: Headphones,
      music: Music,
    };
    return iconMap[type] || Film;
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getCreatorInfo = () => {
    if (media.author) return { label: "Author", value: media.author };
    if (media.artist) return { label: "Artist", value: media.artist };
    if (media.director) return { label: "Director", value: media.director };
    return null;
  };

  const MediaIcon = getMediaIcon(media.type);
  const creatorInfo = getCreatorInfo();

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Media Image */}
          <div className="flex-shrink-0">
            {media.imageUrl ? (
              <img
                src={media.imageUrl}
                alt={media.title}
                className="w-24 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <MediaIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Media Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {media.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                  </Badge>
                  {media.year && (
                    <>
                      <span>•</span>
                      <span>{media.year}</span>
                    </>
                  )}
                  {creatorInfo && (
                    <>
                      <span>•</span>
                      <span>
                        {creatorInfo.label}: {creatorInfo.value}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 ml-2">
                {getRatingStars(media.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {media.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {truncateText(media.description)}
            </p>

            {/* Genres and Tags */}
            <div className="space-y-2 mb-4">
              {media.genre.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {media.genre.map((genre, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {media.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {media.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-600"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{media._count.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{media._count.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(media.createdAt)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(media)}
                  className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLike(media.id)}
                  className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Like
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComment(media.id)}
                  className="text-xs text-green-600 border-green-300 hover:bg-green-50"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Comment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(media)}
                  className="text-xs text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  {media.user.avatar ? (
                    <AvatarImage
                      src={media.user.avatar}
                      alt={media.user.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {media.user.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-xs text-gray-600">
                  Recommended by {media.user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
