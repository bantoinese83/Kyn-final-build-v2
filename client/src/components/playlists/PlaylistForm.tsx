// PlaylistForm Component - Handles playlist creation and editing
// Extracted from Playlists.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import { X, Save, Music, Users, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Playlist as ServicePlaylist } from "@/services/playlist-service";

interface PlaylistFormProps {
  playlist?: ServicePlaylist | null;
  onSave: (
    playlist: Omit<
      ServicePlaylist,
      "id" | "createdAt" | "creator" | "trackCount" | "tracks" | "updatedAt"
    > & { createdBy?: string },
  ) => void;
  onCancel: () => void;
  isEditing: boolean;
  className?: string;
}

export function PlaylistForm({
  playlist,
  onSave,
  onCancel,
  isEditing,
  className = "",
}: PlaylistFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collaborative: false,
    public: true,
  });

  useEffect(() => {
    if (playlist && isEditing) {
      setFormData({
        name: playlist.name,
        description: playlist.description,
        collaborative: playlist.collaborative,
        public: playlist.public,
      });
    }
  }, [playlist, isEditing]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const playlistData = {
      familyId: "demo-family-id", // This should come from context
      authorId: "demo-user-id", // Add missing authorId field
      name: formData.name,
      description: formData.description,
      isPublic: formData.public, // Add missing isPublic field
      collaborative: formData.collaborative,
      public: formData.public,
      trackCount: 0,
      createdBy: "demo-user-id",
    };

    onSave(playlistData);
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Music className="h-5 w-5" />
          <span>{isEditing ? "Edit Playlist" : "Create New Playlist"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Playlist Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Family Road Trip Mix, Sunday Brunch Vibes"
              required
            />
          </div>

          {/* Description */}
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your playlist, what it's for, or any special memories..."
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collaborative"
                  checked={formData.collaborative}
                  onCheckedChange={(checked) =>
                    handleInputChange("collaborative", checked as boolean)
                  }
                />
                <Label
                  htmlFor="collaborative"
                  className="text-sm font-medium text-gray-700"
                >
                  Collaborative Playlist
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Allow family members to add and remove tracks from this playlist
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={formData.public}
                  onCheckedChange={(checked) =>
                    handleInputChange("public", checked as boolean)
                  }
                />
                <Label
                  htmlFor="public"
                  className="text-sm font-medium text-gray-700"
                >
                  Public Playlist
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Make this playlist visible to other families (private playlists
                are family-only)
              </p>
            </div>
          </div>

          {/* Visibility Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              {formData.public ? (
                <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
              ) : (
                <Lock className="h-4 w-4 text-gray-600 mt-0.5" />
              )}
              <div className="text-sm text-blue-700">
                <p className="font-medium">
                  {formData.public ? "Public Playlist" : "Private Playlist"}
                </p>
                <p>
                  {formData.public
                    ? "This playlist will be visible to other families and can be discovered by the community."
                    : "This playlist is only visible to your family members."}
                </p>
              </div>
            </div>
          </div>

          {/* Collaborative Info */}
          {formData.collaborative && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium">Collaborative Playlist</p>
                  <p>
                    Family members can add, remove, and reorder tracks in this
                    playlist. Perfect for building shared music collections!
                  </p>
                </div>
              </div>
            </div>
          )}

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
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Update" : "Create"} Playlist</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
