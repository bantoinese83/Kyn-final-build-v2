// AlbumCard Component - Displays individual family photo/video albums
// Extracted from Photos.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Camera,
  Video,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Eye,
  Calendar,
  Users,
  Edit3,
  Trash2,
  MoreHorizontal,
  Tag,
  Star,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhoto: string;
  mediaCount: number;
  photoCount: number;
  videoCount: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: string;
  media: MediaItem[];
  isPublic: boolean;
  tags: string[];
}

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  caption: string;
  duration?: number;
  likes: number;
  comments: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: string;
  tags: string[];
  location?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

interface AlbumCardProps {
  album: Album;
  onEdit: (album: Album) => void;
  onDelete: (albumId: string) => void;
  onShare: (album: Album) => void;
  onView: (album: Album) => void;
  onDownload: (album: Album) => void;
  isAuthor: boolean;
  className?: string;
}

export function AlbumCard({
  album,
  onEdit,
  onDelete,
  onShare,
  onView,
  onDownload,
  isAuthor,
  className = "",
}: AlbumCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMediaPreview = () => {
    if (album.media.length === 0) {
      return (
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <Camera className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    const firstMedia = album.media[0];
    if (firstMedia.type === "video") {
      return (
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={firstMedia.thumbnailUrl || firstMedia.url}
            alt={firstMedia.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-black bg-opacity-50 text-white"
            >
              <Video className="w-3 h-3 mr-1" />
              Video
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={firstMedia.url}
          alt={firstMedia.caption}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-black bg-opacity-50 text-white"
          >
            <Camera className="w-3 h-3 mr-1" />
            Photo
          </Badge>
        </div>
      </div>
    );
  };

  const getMediaTypeIcon = () => {
    if (album.videoCount > 0 && album.photoCount > 0) {
      return (
        <div className="flex gap-1">
          <Camera className="w-4 h-4" />
          <Video className="w-4 h-4" />
        </div>
      );
    } else if (album.videoCount > 0) {
      return <Video className="w-4 h-4" />;
    } else {
      return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-dark-blue">
                {album.title}
              </CardTitle>
              {album.isPublic && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Public
                </Badge>
              )}
            </div>

            {album.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {album.description}
              </p>
            )}
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Album Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(album)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Album
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onView(album)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Album
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(album)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Album
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(album)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(album.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Album Cover */}
        {getMediaPreview()}

        {/* Album Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {getMediaTypeIcon()}
            <span>{album.mediaCount} items</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(album.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{album.author.name}</span>
          </div>
        </div>

        {/* Media Breakdown */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {album.photoCount > 0 && (
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">{album.photoCount} photos</span>
              </div>
            )}
            {album.videoCount > 0 && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">{album.videoCount} videos</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onView(album)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </div>

        {/* Tags */}
        {album.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {album.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {album.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                +{album.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Author Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Created by:</span>
            <Avatar className="w-6 h-6">
              <AvatarImage src={album.author.avatar} />
              <AvatarFallback className="text-xs">
                {album.author.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">
              {album.author.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
