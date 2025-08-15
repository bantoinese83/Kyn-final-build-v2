// MediaForm Component - Handles media creation and editing
// Extracted from Media.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import {
  X,
  Save,
  BookOpen,
  Film,
  Headphones,
  Monitor,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface MediaFormProps {
  media?: MediaItem | null;
  onSave: (
    media: Omit<MediaItem, "id" | "createdAt" | "user" | "_count" | "rating">,
  ) => void;
  onCancel: () => void;
  isEditing: boolean;
  className?: string;
}

export function MediaForm({
  media,
  onSave,
  onCancel,
  isEditing,
  className = "",
}: MediaFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "books" as MediaType,
    genre: "",
    year: "",
    author: "",
    artist: "",
    director: "",
    description: "",
    imageUrl: "",
    tags: "",
  });

  useEffect(() => {
    if (media && isEditing) {
      setFormData({
        title: media.title,
        type: media.type,
        genre: media.genre.join(", "),
        year: media.year?.toString() || "",
        author: media.author || "",
        artist: media.artist || "",
        director: media.director || "",
        description: media.description,
        imageUrl: media.imageUrl || "",
        tags: media.tags.join(", "),
      });
    }
  }, [media, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mediaData = {
      title: formData.title,
      type: formData.type,
      genre: formData.genre
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0),
      year: formData.year ? parseInt(formData.year) : undefined,
      author: formData.author || undefined,
      artist: formData.artist || undefined,
      director: formData.director || undefined,
      description: formData.description,
      imageUrl: formData.imageUrl || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    onSave(mediaData);
  };

  const isFormValid = () => {
    return formData.title.trim() && formData.description.trim();
  };

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

  const getCreatorField = () => {
    switch (formData.type) {
      case "books":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="author"
              className="text-sm font-medium text-gray-700"
            >
              Author
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange("author", e.target.value)}
              placeholder="e.g., J.K. Rowling, Stephen King"
            />
          </div>
        );
      case "movies":
      case "tv":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="director"
              className="text-sm font-medium text-gray-700"
            >
              Director
            </Label>
            <Input
              id="director"
              value={formData.director}
              onChange={(e) => handleInputChange("director", e.target.value)}
              placeholder="e.g., Christopher Nolan, Steven Spielberg"
            />
          </div>
        );
      case "music":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="artist"
              className="text-sm font-medium text-gray-700"
            >
              Artist
            </Label>
            <Input
              id="artist"
              value={formData.artist}
              onChange={(e) => handleInputChange("artist", e.target.value)}
              placeholder="e.g., Taylor Swift, The Beatles"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const MediaIcon = getMediaIcon(formData.type);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MediaIcon className="h-5 w-5" />
          <span>{isEditing ? "Edit Media" : "Add New Media"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Media Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                handleInputChange("type", value as MediaType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="books">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Books</span>
                  </div>
                </SelectItem>
                <SelectItem value="movies">
                  <div className="flex items-center space-x-2">
                    <Film className="h-4 w-4" />
                    <span>Movies</span>
                  </div>
                </SelectItem>
                <SelectItem value="tv">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>TV Shows</span>
                  </div>
                </SelectItem>
                <SelectItem value="podcasts">
                  <div className="flex items-center space-x-2">
                    <Headphones className="h-4 w-4" />
                    <span>Podcasts</span>
                  </div>
                </SelectItem>
                <SelectItem value="music">
                  <div className="flex items-center space-x-2">
                    <Music className="h-4 w-4" />
                    <span>Music</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter the title..."
              required
            />
          </div>

          {/* Creator Field (Author/Artist/Director) */}
          {getCreatorField()}

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-gray-700">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              placeholder="e.g., 2023"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe why you recommend this media..."
              rows={4}
              required
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label
              htmlFor="genre"
              className="text-sm font-medium text-gray-700"
            >
              Genre
            </Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => handleInputChange("genre", e.target.value)}
              placeholder="e.g., Fantasy, Action, Comedy (separate with commas)"
            />
            <p className="text-xs text-gray-500">
              Add genres to help categorize this media
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="e.g., family-friendly, must-watch, classic (separate with commas)"
            />
            <p className="text-xs text-gray-500">
              Add tags to help organize and find this media later
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label
              htmlFor="imageUrl"
              className="text-sm font-medium text-gray-700"
            >
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            <p className="text-xs text-gray-500">
              Optional: Add a cover image or poster for this media
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Update" : "Add"} Media</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
