// AlbumForm Component - Handles album creation and editing
// Extracted from Photos.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import { X, Save, Plus, Tag, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface CreateAlbumData {
  title: string;
  description: string;
  isPublic: boolean;
  tags: string[];
}

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
  media: any[];
  isPublic: boolean;
  tags: string[];
}

interface AlbumFormProps {
  album?: CreateAlbumData | Album | null;
  isEditMode: boolean;
  onSubmit: (albumData: CreateAlbumData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function AlbumForm({
  album,
  isEditMode,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}: AlbumFormProps) {
  const [formData, setFormData] = useState<CreateAlbumData>({
    title: "",
    description: "",
    isPublic: false,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (album) {
      if ("id" in album) {
        // It's an Album, convert to CreateAlbumData
        setFormData({
          title: album.title,
          description: album.description || "",
          isPublic: album.isPublic,
          tags: album.tags,
        });
      } else {
        // It's already CreateAlbumData
        setFormData(album);
      }
    }
  }, [album]);

  const handleInputChange = (
    field: keyof CreateAlbumData,
    value: string | boolean | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return formData.title.trim();
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-dark-blue">
          {isEditMode ? "Edit Album" : "Create New Album"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Update your family album details"
            : "Create a new album to organize and share family photos and videos"}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Album Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Summer Vacation 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what this album contains..."
                rows={3}
              />
            </div>
          </div>

          {/* Album Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Album Settings</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Public Album
                </Label>
                <p className="text-xs text-gray-500">
                  Allow non-family members to view this album
                </p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Album" : "Create Album"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
