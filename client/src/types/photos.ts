// Photos Types - Centralized type definitions for photo functionality
// Provides consistent interfaces across all photo-related components

export interface Album {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  coverPhoto?: string;
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

export interface MediaItem {
  id: string;
  title?: string;
  description?: string;
  url: string;
  thumbnail?: string;
  type: "photo" | "video";
  size: number;
  width?: number;
  height?: number;
  duration?: number; // for videos
  uploadedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  tags: string[];
  location?: string;
  isPublic: boolean;
  likes: number;
  comments: number;
}

export interface CreateAlbumData {
  title: string;
  description?: string;
  isPublic: boolean;
  tags?: string[];
}

export interface UpdateAlbumData {
  title?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface PhotoFilters {
  albumId?: string;
  authorId?: string;
  tags?: string[];
  dateRange?: string;
  isPublic?: boolean;
  type?: "photo" | "video";
}

export interface AlbumFilters {
  authorId?: string;
  tags?: string[];
  isPublic?: boolean;
  dateRange?: string;
}

export interface PhotoUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export interface PhotoUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

export interface PhotoComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: string;
  updatedAt?: string;
  likes: number;
  replies?: PhotoComment[];
}

export interface PhotoLike {
  id: string;
  userId: string;
  photoId: string;
  createdAt: string;
}

export interface PhotoShare {
  id: string;
  photoId: string;
  sharedBy: string;
  sharedWith: string[];
  message?: string;
  createdAt: string;
}

export interface PhotoTag {
  id: string;
  name: string;
  count: number;
  color?: string;
}

export interface PhotoLocation {
  id: string;
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  city?: string;
  country?: string;
}

export interface PhotoMetadata {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  focalLength?: number;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  dateTaken?: string;
  software?: string;
}

export interface PhotoCollection {
  id: string;
  name: string;
  description?: string;
  photos: MediaItem[];
  coverPhoto?: MediaItem;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
}

export interface PhotoAlbumStats {
  totalPhotos: number;
  totalVideos: number;
  totalSize: number;
  photosByMonth: Array<{ month: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  mostLikedPhotos: MediaItem[];
  recentUploads: MediaItem[];
}
