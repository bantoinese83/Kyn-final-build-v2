// Photos Page - Main photos and videos management page
// Refactored to use withDataFetching HOC for better performance and consistency

import { useState } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { familyService, photoService, albumService } from "@/services";
import { dateUtils } from "@/lib/utils";
import { withDataFetching, WithDataFetchingProps } from "@/components/hoc";
import { LoadingState, EmptyState } from "@/components/hoc";
import {
  useMemoizedValue,
  usePerformanceMonitor,
} from "@/hooks/usePerformance";
import {
  PhotoGrid,
  PhotoUploader,
  AlbumManager,
  PhotosHeader,
  PhotosFilters,
  AlbumEditModal,
  AlbumShareDialog,
  Album,
  CreateAlbumData,
} from "@/components/photos";

interface PhotosData {
  albums: Album[];
  currentFamily: any;
  photoStats: {
    totalPhotos: number;
    totalVideos: number;
    totalSize: number;
    albumsCount: number;
    recentUploads: number;
  } | null;
}

function PhotosComponent({
  data,
  isLoading,
  isError,
  error,
  refetch,
}: WithDataFetchingProps<PhotosData>) {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Performance monitoring
  usePerformanceMonitor("Photos");

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "media">("recent");
  const [filterType, setFilterType] = useState<"all" | "photos" | "videos">(
    "all",
  );
  const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
  const [showShareAlbumDialog, setShowShareAlbumDialog] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [sharingAlbum, setSharingAlbum] = useState<Album | null>(null);

  // Memoized filtered and sorted albums
  const processedAlbums = useMemoizedValue(
    () => {
      if (!data?.albums) return [];

      let filtered = data.albums;

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (album) =>
            album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            album.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            album.tags?.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        );
      }

      // Apply type filter
      if (filterType !== "all") {
        // This would need to be implemented based on actual album data structure
        // For now, we'll show all albums
      }

      // Apply sorting
      switch (sortBy) {
        case "recent":
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case "name":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "media":
          // Sort by media count (would need to be implemented)
          break;
      }

      return filtered;
    },
    {
      cacheKey: `photos_albums_${user?.id}_${searchTerm}_${sortBy}_${filterType}`,
      ttl: 2 * 60 * 1000, // 2 minutes
      dependencies: [data?.albums, searchTerm, sortBy, filterType, user?.id],
    },
  );

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Camera />}
        title="Capture & Share Family Memories"
        description="Create beautiful photo and video albums, share precious moments, and build a visual timeline of your family's journey together."
        features={[
          "Upload and organize family photos and videos in albums",
          "Share special moments with family members",
          "Create collaborative albums for events and trips",
          "Tag family members in photos and videos",
          "Safely store and backup precious family memories",
          "Build a visual timeline of your family's story",
        ]}
        accentColor="#8B5A3C"
        bgGradient="from-pink-50 to-rose-50"
      />
    );
  }

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <LoadingState message="Loading family photos..." variant="skeleton" />
      </div>
    );
  }

  // Show error state
  if (isError && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <EmptyState
          title="Failed to load photos"
          description={error}
          actions={
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  // Show empty state
  if (!data?.albums || data.albums.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <EmptyState
          title="No albums yet"
          description="Start creating your first family photo album to capture precious memories!"
          actions={
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create First Album
            </button>
          }
        />
      </div>
    );
  }

  // Handle album creation
  const handleCreateAlbum = async (albumData: CreateAlbumData) => {
    if (!data?.currentFamily) return;

    try {
      const result = await albumService.create({
        ...albumData,
        familyId: data.currentFamily.id,
      });

      if (result.success) {
        toast({
          title: "Album created!",
          description: "Your new album has been created successfully.",
        });
        refetch(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create album",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create album",
        variant: "destructive",
      });
    }
  };

  // Handle album update
  const handleUpdateAlbum = async (
    albumId: string,
    updates: Partial<Album>,
  ) => {
    try {
      const result = await albumService.update(albumId, updates);

      if (result.success) {
        toast({
          title: "Album updated!",
          description: "Your album has been updated successfully.",
        });
        refetch(); // Refresh data
        setShowEditAlbumModal(false);
        setEditingAlbum(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update album",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update album",
        variant: "destructive",
      });
    }
  };

  // Handle album deletion
  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const result = await albumService.delete(albumId);

      if (result.success) {
        toast({
          title: "Album deleted!",
          description: "Your album has been deleted successfully.",
        });
        refetch(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete album",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete album",
        variant: "destructive",
      });
    }
  };

  // Handle album sharing
  const handleShareAlbum = (album: Album) => {
    setSharingAlbum(album);
    setShowShareAlbumDialog(true);
  };

  // Handle album editing
  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setShowEditAlbumModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      {/* Header */}
      <PhotosHeader
        familyName={data?.currentFamily?.name || "Family"}
        photoStats={data?.photoStats}
        onCreateAlbum={handleCreateAlbum}
      />

      {/* Filters and Controls */}
      <PhotosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Photo Grid */}
        <PhotoGrid
          albums={processedAlbums}
          viewMode={viewMode}
          onAlbumClick={(album) => console.log("Album clicked:", album)}
          onAlbumEdit={handleEditAlbum}
          onAlbumDelete={handleDeleteAlbum}
          onAlbumShare={handleShareAlbum}
        />

        {/* Album Manager */}
        <AlbumManager
          albums={processedAlbums}
          onCreateAlbum={handleCreateAlbum}
          onUpdateAlbum={handleUpdateAlbum}
          onDeleteAlbum={handleDeleteAlbum}
        />
      </div>

      {/* Modals and Dialogs */}
      {showEditAlbumModal && editingAlbum && (
        <AlbumEditModal
          album={editingAlbum}
          isOpen={showEditAlbumModal}
          onClose={() => {
            setShowEditAlbumModal(false);
            setEditingAlbum(null);
          }}
          onSave={handleUpdateAlbum}
        />
      )}

      {showShareAlbumDialog && sharingAlbum && (
        <AlbumShareDialog
          album={sharingAlbum}
          isOpen={showShareAlbumDialog}
          onClose={() => {
            setShowShareAlbumDialog(false);
            setSharingAlbum(null);
          }}
        />
      )}
    </div>
  );
}

// Data fetching function for the HOC
const fetchPhotosData = async (): Promise<PhotosData> => {
  // This would be called by the HOC to fetch data
  // For now, return empty data as the HOC will handle the actual fetching
  return {
    albums: [],
    currentFamily: null,
    photoStats: null,
  };
};

// Export the enhanced component with data fetching capabilities
export default withDataFetching(
  PhotosComponent,
  fetchPhotosData,
  [], // dependencies
  {
    displayName: "Photos",
    showLoadingState: true,
    showErrorState: true,
    showEmptyState: false,
  },
);
