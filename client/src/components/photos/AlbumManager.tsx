// AlbumManager Component - Handles album creation, editing, and management
// Extracted from Photos.tsx for better modularity and maintainability

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Share2, Eye, Download } from "lucide-react";
import { Album, CreateAlbumData } from "@/types/photos";
import { AlbumForm } from "./AlbumForm";
import { photoService } from "@/services";

interface AlbumManagerProps {
  albums: Album[];
  onCreateAlbum: (albumData: CreateAlbumData) => Promise<void>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
  onEditAlbum: (album: Album) => void;
  onShareAlbum: (album: Album) => void;
  onViewAlbum: (album: Album) => void;
  onDownloadAlbum: (album: Album) => void;
  isAuthor: (albumId: string) => boolean;
  className?: string;
}

export function AlbumManager({
  albums,
  onCreateAlbum,
  onDeleteAlbum,
  onEditAlbum,
  onShareAlbum,
  onViewAlbum,
  onDownloadAlbum,
  isAuthor,
  className = "",
}: AlbumManagerProps) {
  const { toast } = useToast();
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const handleCreateAlbum = async (albumData: CreateAlbumData) => {
    try {
      setIsCreatingAlbum(true);
      await onCreateAlbum(albumData);

      toast({
        title: "Album Created!",
        description: "Your new album has been created successfully.",
      });

      setIsCreateAlbumOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setIsEditMode(true);
    setIsCreateAlbumOpen(true);
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this album? This action cannot be undone.",
      )
    ) {
      try {
        await onDeleteAlbum(albumId);
        toast({
          title: "Album Deleted",
          description: "Album has been removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete album. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitAlbum = async (albumData: CreateAlbumData) => {
    if (isEditMode && editingAlbum) {
      try {
        // Update existing album
        const updateData = {
          name: albumData.title,
          description: albumData.description,
          isPrivate: !albumData.isPublic,
          tags: albumData.tags || [],
        };

        const result = await photoService.updateAlbum(
          editingAlbum.id,
          updateData,
        );

        if (result.success) {
          toast({
            title: "Album Updated!",
            description: "Your album has been updated successfully.",
          });

          // Refresh albums list
          if (onCreateAlbum) {
            // Trigger a refresh by calling the parent's load function
            // This is a bit of a workaround - ideally we'd have a refresh callback
            window.location.reload(); // Simple refresh for now
          }
        } else {
          throw new Error(result.error || "Failed to update album");
        }
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Failed to update album. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Create new album
      await handleCreateAlbum(albumData);
    }
  };

  const closeAlbumDialog = () => {
    setIsCreateAlbumOpen(false);
    setEditingAlbum(null);
    setIsEditMode(false);
  };

  return (
    <div className={className}>
      {/* Create Album Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setIsCreateAlbumOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Album
        </Button>
      </div>

      {/* Albums List */}
      <div className="space-y-4">
        {albums.map((album) => (
          <div
            key={album.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Album Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                {album.coverPhoto ? (
                  <img
                    src={album.coverPhoto}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {album.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{album.mediaCount} items</span>
                  <span>•</span>
                  <span>{album.photoCount} photos</span>
                  <span>•</span>
                  <span>{album.videoCount} videos</span>
                  <span>•</span>
                  <span>Created {album.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Album Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewAlbum(album)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShareAlbum(album)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadAlbum(album)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>

              {isAuthor(album.id) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAlbum(album)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Album Dialog */}
      {isCreateAlbumOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AlbumForm
                album={editingAlbum}
                isEditMode={isEditMode}
                onSubmit={handleSubmitAlbum}
                onCancel={closeAlbumDialog}
                loading={isCreatingAlbum}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
