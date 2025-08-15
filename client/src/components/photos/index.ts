// Photos Components Index - Centralized exports for all photo-related components
// Refactored from monolithic Photos.tsx to modular components

// Core components
export { PhotoGrid } from "./PhotoGrid";
export { PhotoUploader } from "./PhotoUploader";
export { AlbumManager } from "./AlbumManager";
export { PhotosHeader } from "./PhotosHeader";
export { PhotosFilters } from "./PhotosFilters";

// Modal and Dialog components
export { AlbumEditModal } from "./AlbumEditModal";
export { AlbumShareDialog } from "./AlbumShareDialog";

// Existing components (keep for backward compatibility)
export { AlbumCard } from "./AlbumCard";
export { AlbumForm } from "./AlbumForm";

// Export types
export type {
  Album,
  MediaItem,
  CreateAlbumData,
  UpdateAlbumData,
  AlbumFilters,
  AlbumSortOption,
  AlbumStats,
  PhotoUploadProgress,
  PhotoUploadOptions,
  MediaComment,
  MediaLike,
  PhotoShare,
  PhotoCollection,
  PhotoAnalytics,
  PhotoNotification,
  PhotoModeration,
  PhotoCollaboration,
  PhotoSchedule,
  PhotoEngagement,
  PhotoAccessibility,
} from "@/types/photos";
