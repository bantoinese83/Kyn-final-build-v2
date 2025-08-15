// Photo Service - Handles all photo and album-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface Photo extends FamilyEntity {
  title?: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  fileType: string;
  albumId?: string;
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface Album extends FamilyEntity {
  name: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  coverPhotoId?: string;
}

export interface CreatePhotoData {
  familyId: string;
  authorId: string;
  title?: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  fileType: string;
  albumId?: string;
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface UpdatePhotoData {
  title?: string;
  description?: string;
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  albumId?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface CreateAlbumData {
  familyId: string;
  authorId: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  coverPhotoId?: string;
}

export interface UpdateAlbumData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  coverPhotoId?: string;
}

export interface PhotoFilters extends FamilyFilters {
  albumId?: string;
  type?: "photo" | "video";
}

export interface AlbumFilters extends FamilyFilters {
  isPrivate?: boolean;
}

class PhotoService extends FamilyService<
  Photo,
  CreatePhotoData,
  UpdatePhotoData
> {
  protected tableName = "enhanced_photos";
  protected selectFields = `
    *,
    author:users!enhanced_photos_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    album:photo_albums!enhanced_photos_album_id_fkey(
      id,
      name,
      description
    )
  `;

  /**
   * Get photos by album ID
   */
  async getPhotosByAlbum(
    albumId: string,
    filters?: Omit<PhotoFilters, "albumId">,
  ): Promise<ServiceResponse<Photo[]>> {
    const cacheKey = `photos_album_${albumId}`;
    const cached = cacheGet<Photo[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPhotosByAlbum",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("album_id", albumId)
          .order("created_at", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const photos = (data || []) as unknown as Photo[];
        cacheSet(cacheKey, photos, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: photos, error: null };
      },
      "custom",
    );
  }

  /**
   * Get photos by type (photo/video)
   */
  async getPhotosByType(
    familyId: string,
    type: "photo" | "video",
    filters?: Omit<PhotoFilters, "type">,
  ): Promise<ServiceResponse<Photo[]>> {
    const cacheKey = `photos_type_${familyId}_${type}`;
    const cached = cacheGet<Photo[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPhotosByType",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("file_type", type === "photo" ? "image" : "video");

        // Apply additional filters
        if (filters?.authorId) {
          query = query.eq("author_id", filters.authorId);
        }
        if (filters?.isPublic !== undefined) {
          query = query.eq("is_public", filters.isPublic);
        }
        if (filters?.tags && filters.tags.length > 0) {
          query = query.overlaps("tags", filters.tags);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const photos = data || [];
        cacheSet(cacheKey, photos, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: photos, error: null };
      },
      "custom",
    );
  }

  /**
   * Search photos by text
   */
  async searchPhotos(
    familyId: string,
    searchTerm: string,
    filters?: PhotoFilters,
  ): Promise<ServiceResponse<Photo[]>> {
    const cacheKey = `photos_search_${familyId}_${searchTerm}`;
    const cached = cacheGet<Photo[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchPhotos",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`,
          )
          .order("created_at", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const photos = data || [];
        cacheSet(cacheKey, photos, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: photos, error: null };
      },
      "custom",
    );
  }

  /**
   * Get photo statistics for a family
   */
  async getPhotoStats(familyId: string): Promise<
    ServiceResponse<{
      totalPhotos: number;
      totalVideos: number;
      totalSize: number;
      albumsCount: number;
      recentUploads: number;
    }>
  > {
    const cacheKey = `photo_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPhotoStats",
      async () => {
        const [photosResult, albumsResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select("file_size, file_type, created_at")
            .eq("family_id", familyId),
          supabase.from("photo_albums").select("id").eq("family_id", familyId),
        ]);

        if (photosResult.error || albumsResult.error) {
          return {
            success: false,
            error:
              photosResult.error?.message ||
              albumsResult.error?.message ||
              "Failed to fetch stats",
            data: null,
          };
        }

        const photos = photosResult.data || [];
        const albums = albumsResult.data || [];

        const stats = {
          totalPhotos: photos.filter((p) => p.file_type === "image").length,
          totalVideos: photos.filter((p) => p.file_type === "video").length,
          totalSize: photos.reduce((sum, p) => sum + (p.file_size || 0), 0),
          albumsCount: albums.length,
          recentUploads: photos.filter((p) => {
            const uploadDate = new Date(p.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return uploadDate > weekAgo;
          }).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for photos
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`photos_family_${familyId}`),
      new RegExp(`photos_album_`),
      new RegExp(`photos_type_${familyId}`),
      new RegExp(`photos_search_${familyId}`),
      new RegExp(`photo_stats_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

class AlbumService extends FamilyService<
  Album,
  CreateAlbumData,
  UpdateAlbumData
> {
  protected tableName = "photo_albums";
  protected selectFields = `
    *,
    author:users!photo_albums_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    photos:enhanced_photos(count),
    cover_photo:enhanced_photos!photo_albums_cover_photo_id_fkey(
      id,
      thumbnail_url,
      file_url
    )
  `;

  /**
   * Get album with photo count and cover photo
   */
  async getAlbumWithDetails(
    albumId: string,
  ): Promise<
    ServiceResponse<Album & { photoCount: number; coverPhoto?: any }>
  > {
    const cacheKey = `album_details_${albumId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getAlbumWithDetails",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("id", albumId)
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const album = data;
        cacheSet(cacheKey, album, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: album, error: null };
      },
      "custom",
    );
  }

  /**
   * Get albums with photo counts
   */
  async getAlbumsWithCounts(
    familyId: string,
    filters?: AlbumFilters,
  ): Promise<ServiceResponse<Array<Album & { photoCount: number }>>> {
    const cacheKey = `albums_counts_${familyId}`;
    const cached = cacheGet<any[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getAlbumsWithCounts",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("created_at", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const albums = data || [];
        cacheSet(cacheKey, albums, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: albums, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for albums
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`albums_counts_${familyId}`),
      new RegExp(`album_details_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instances
export const photoService = new PhotoService();
export const albumService = new AlbumService();

// Legacy export for backward compatibility
export const photoServiceLegacy = {
  // ... existing methods for backward compatibility
  async getFamilyAlbums(
    familyId: string,
    filters?: AlbumFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<any[]>> {
    return albumService.getByFamilyId(familyId, { page, pageSize, ...filters });
  },

  async getFamilyPhotos(
    familyId: string,
    filters?: PhotoFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<any[]>> {
    return photoService.getByFamilyId(familyId, { page, pageSize, ...filters });
  },

  async createPhoto(
    photoData: CreatePhotoData,
  ): Promise<ServiceResponse<Photo>> {
    return photoService.create(photoData);
  },

  async createAlbum(
    albumData: CreateAlbumData,
  ): Promise<ServiceResponse<Album>> {
    return albumService.create(albumData);
  },

  async updatePhoto(
    photoId: string,
    updates: UpdatePhotoData,
  ): Promise<ServiceResponse<Photo>> {
    return photoService.update(photoId, updates);
  },

  async updateAlbum(
    albumId: string,
    updates: UpdateAlbumData,
  ): Promise<ServiceResponse<Album>> {
    return albumService.update(albumId, updates);
  },

  async deletePhoto(photoId: string): Promise<ServiceResponse<boolean>> {
    const result = await photoService.delete(photoId);
    if (result.success) {
      // Invalidate related caches
      await photoService.invalidateCache("*");
    }
    return result;
  },

  async deleteAlbum(albumId: string): Promise<ServiceResponse<boolean>> {
    const result = await albumService.delete(albumId);
    if (result.success) {
      // Invalidate related caches
      await albumService.invalidateCache("*");
    }
    return result;
  },
};
