import React, { useState, useCallback, useMemo, useRef } from "react";
import { withFamilyAppPatterns } from "@/components/hoc";
import { DataCard } from "@/components/ui/patterns/DataCard";
import { LoadingState } from "@/components/ui/patterns/LoadingState";
import { EmptyState } from "@/components/ui/patterns/EmptyState";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
import { photoService, userService } from "@/services";
import { Photo, User } from "@/types/database";
import {
  Camera,
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  User as UserIcon,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

// Enhanced interfaces for the Photos component
interface PhotosData {
  photos: Photo[];
  totalPhotos: number;
  totalAlbums: number;
  totalStorage: number;
  storageUnit: string;
  recentUploads: Photo[];
  popularPhotos: Photo[];
  familyMembers: User[];
}

interface PhotosFilters {
  viewMode: "grid" | "list" | "masonry";
  sortBy: "recent" | "oldest" | "name" | "size" | "popular";
  sortOrder: "asc" | "desc";
  dateRange: "all" | "today" | "week" | "month" | "year";
  albumId?: string;
  tags?: string[];
  searchQuery: string;
  authorId?: string;
}

interface PhotosProps {
  familyId?: string;
  userId?: string;
  onPhotoSelect?: (photo: Photo) => void;
  onPhotoUpload?: (photos: File[]) => void;
  onPhotoDelete?: (photoId: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Photos component with modern patterns
const PhotosComponent: React.FC<PhotosProps> = ({
  familyId = "",
  userId = "",
  onPhotoSelect,
  onPhotoUpload,
  onPhotoDelete,
  onError,
}) => {
  const { renderTime } = usePerformanceMonitor("Photos");

  // Enhanced state management
  const [filters, setFilters] = useState<PhotosFilters>({
    viewMode: "grid",
    sortBy: "recent",
    sortOrder: "desc",
    dateRange: "all",
    searchQuery: "",
    authorId: undefined,
    tags: [],
  });

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [photosData, setPhotosData] = useState<PhotosData>({
    photos: [],
    totalPhotos: 0,
    totalAlbums: 0,
    totalStorage: 0,
    storageUnit: "MB",
    recentUploads: [],
    popularPhotos: [],
    familyMembers: [],
  });

  // Refs for file input and drag & drop
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDropRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchPhotosData = useCallback(async (): Promise<PhotosData> => {
    try {
      // Fetch photos data
      const photosResult = await photoService.getFamilyPhotos(familyId, {
        page: currentPage,
        limit: pageSize,
        ...filters,
      });

      if (!photosResult.success) {
        throw new Error(photosResult.error || "Failed to fetch photos");
      }

      const photos = photosResult.data || [];

      // Calculate statistics
      const totalPhotos = photos.length;
      const recentUploads = photos
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10);

      const data: PhotosData = {
        photos,
        totalPhotos,
        totalAlbums: 0, // Will be implemented when album system is available
        totalStorage: photos.reduce(
          (sum, photo) => sum + (photo.fileSize || 0),
          0,
        ),
        storageUnit: "MB",
        recentUploads,
        popularPhotos: [], // Will be implemented when popularity system is available
        familyMembers: [], // Will be fetched separately if needed
      };

      setPhotosData(data);
      return data;
    } catch (error) {
      console.error("Error fetching photos data:", error);
      throw error;
    }
  }, [familyId, currentPage, pageSize, filters]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof PhotosFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    [],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchQuery", query);
    },
    [handleFilterChange],
  );

  // Photo action handlers
  const handlePhotoSelect = useCallback(
    (photo: Photo) => {
      onPhotoSelect?.(photo);
    },
    [onPhotoSelect],
  );

  const handlePhotoUpload = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      try {
        onPhotoUpload?.(files);
        // Refresh data after upload
        await fetchPhotosData();
      } catch (error) {
        console.error("Error uploading photos:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to upload photos",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onPhotoUpload, onError, fetchPhotosData],
  );

  const handlePhotoDelete = useCallback(
    async (photoId: string) => {
      if (!confirm("Are you sure you want to delete this photo?")) return;

      setIsDeleting(true);
      try {
        onPhotoDelete?.(photoId);
        // Refresh data after deletion
        await fetchPhotosData();
      } catch (error) {
        console.error("Error deleting photo:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to delete photo",
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [onPhotoDelete, onError, fetchPhotosData],
  );

  // Memoized filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = photosData.photos || [];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (photo) =>
          photo.title?.toLowerCase().includes(query) ||
          photo.description?.toLowerCase().includes(query) ||
          photo.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply author filter
    if (filters.authorId) {
      filtered = filtered.filter(
        (photo) => photo.authorId === filters.authorId,
      );
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (photo) => new Date(photo.createdAt) >= filterDate,
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (photo) => new Date(photo.createdAt) >= filterDate,
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (photo) => new Date(photo.createdAt) >= filterDate,
          );
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter(
            (photo) => new Date(photo.createdAt) >= filterDate,
          );
          break;
      }
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (filters.sortBy) {
      case "recent":
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
      case "name":
        sorted.sort((a, b) => {
          const nameA = (a.title || "").toLowerCase();
          const nameB = (b.title || "").toLowerCase();
          return filters.sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
        break;
      case "size":
        sorted.sort((a, b) => {
          const sizeA = a.fileSize || 0;
          const sizeB = b.fileSize || 0;
          return filters.sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
        });
        break;
      case "popular":
        // For now, sort by date since we don't have popularity metrics
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
    }

    return {
      photos: sorted,
      totalPhotos: sorted.length,
    };
  }, [photosData.photos, filters]);

  // Render functions
  const renderToolbar = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search photos..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  viewMode: prev.viewMode === "grid" ? "list" : "grid",
                }))
              }
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={
                filters.viewMode === "grid"
                  ? "Switch to List View"
                  : "Switch to Grid View"
              }
            >
              {filters.viewMode === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid3X3 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handlePhotoUpload(files);
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>
    ),
    [filters, handleSearch, handleFilterChange, isUploading, handlePhotoUpload],
  );

  const renderStats = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataCard
            title="Total Photos"
            value={filteredData.totalPhotos}
            icon={Camera}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <DataCard
            title="Total Albums"
            value={photosData.totalAlbums}
            icon={ImageIcon}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <DataCard
            title="Storage Used"
            value={`${(photosData.totalStorage / 1024 / 1024).toFixed(1)} ${photosData.storageUnit}`}
            icon={Download}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          <DataCard
            title="Recent Uploads"
            value={photosData.recentUploads.length}
            icon={Calendar}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
        </div>
      </div>
    ),
    [filteredData, photosData],
  );

  const renderPhotoCard = useCallback(
    (photo: Photo) => (
      <div
        key={photo.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => handlePhotoSelect(photo)}
      >
        <div className="aspect-square overflow-hidden rounded-t-lg">
          {photo.url ? (
            <img
              src={photo.url}
              alt={photo.title || "Photo"}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Photo overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoSelect(photo);
                }}
                className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors"
                title="View Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download functionality will be implemented
                }}
                className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoDelete(photo.id);
                }}
                className="p-2 bg-white bg-opacity-90 text-red-600 rounded-full hover:bg-opacity-100 transition-colors"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {photo.title || "Untitled Photo"}
          </h3>

          {photo.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {photo.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>{photo.authorName || "Unknown"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {photo.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {photo.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{photo.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    [handlePhotoSelect, handlePhotoDelete],
  );

  const renderPhotoGrid = useCallback(() => {
    if (filteredData.photos.length === 0) {
      return (
        <EmptyState
          icon={<Camera className="w-16 h-16 text-gray-400" />}
          title="No photos found"
          description="Try adjusting your filters or upload some new photos."
        />
      );
    }

    const gridCols =
      filters.viewMode === "grid"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1";

    return (
      <div className={`grid ${gridCols} gap-6 p-6`}>
        {filteredData.photos.map(renderPhotoCard)}
      </div>
    );
  }, [filteredData.photos, filters.viewMode, renderPhotoCard]);

  // Load data on mount
  React.useEffect(() => {
    fetchPhotosData();
  }, [fetchPhotosData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {renderToolbar()}
      {renderStats()}
      {renderPhotoGrid()}
    </div>
  );
};

// Enhanced Photos with comprehensive HOCs
const Photos = withFamilyAppPatterns(PhotosComponent, {
  requireAuth: true,
  requireFamilyMember: true,
  withDataFetching: false, // We're handling data fetching manually for now
  withFormManagement: false,
  withValidation: false,
});

export default Photos;
