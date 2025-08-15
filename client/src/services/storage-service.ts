// Storage Service - Handles file uploads, downloads, and management
// Integrates with Supabase Storage buckets for comprehensive file handling

import { supabase } from "./supabase";

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  metadata?: Record<string, any>;
  cacheControl?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  fileId?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

export const storageService = {
  /**
   * Get available storage buckets
   */
  async getBuckets(): Promise<StorageBucket[]> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;

      return data.map((bucket) => ({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public || false,
        fileSizeLimit: bucket.file_size_limit || 52428800, // 50MB default
        allowedMimeTypes: bucket.allowed_mime_types || [],
      }));
    } catch (error) {
      console.error("Failed to get storage buckets:", error);
      return [];
    }
  },

  /**
   * Upload a file to a storage bucket
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    try {
      const { bucket, path, file, metadata, cacheControl } = options;

      // Validate file size
      const bucketInfo = await this.getBucketInfo(bucket);
      if (bucketInfo && file.size > bucketInfo.fileSizeLimit) {
        return {
          success: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${(bucketInfo.fileSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      // Validate file type
      if (bucketInfo && bucketInfo.allowedMimeTypes.length > 0) {
        if (!bucketInfo.allowedMimeTypes.includes(file.type)) {
          return {
            success: false,
            error: `File type ${file.type} not allowed. Allowed types: ${bucketInfo.allowedMimeTypes.join(", ")}`,
          };
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop();
      const uniqueFilename = `${timestamp}-${randomId}.${fileExtension}`;
      const fullPath = `${path}/${uniqueFilename}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: cacheControl || "3600",
          upsert: false,
          metadata: metadata || {},
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: fullPath,
        fileId: uniqueFilename,
      };
    } catch (error) {
      console.error("File upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  },

  /**
   * Upload multiple files to a storage bucket
   */
  async uploadMultipleFiles(
    bucket: string,
    path: string,
    files: File[],
    metadata?: Record<string, any>,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile({ bucket, path, file, metadata }),
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Multiple file upload failed:", error);
      return files.map(() => ({
        success: false,
        error: "Upload failed",
      }));
    }
  },

  /**
   * Download a file from storage
   */
  async downloadFile(bucket: string, path: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("File download failed:", error);
      return null;
    }
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * List files in a bucket/folder
   */
  async listFiles(bucket: string, path: string = ""): Promise<FileInfo[]> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path);

      if (error) throw error;

      return data.map((file) => ({
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "unknown",
        url: this.getPublicUrl(bucket, `${path}/${file.name}`),
        path: `${path}/${file.name}`,
        metadata: file.metadata,
        createdAt: file.created_at || new Date().toISOString(),
        updatedAt: file.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to list files:", error);
      return [];
    }
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("File deletion failed:", error);
      return false;
    }
  },

  /**
   * Delete multiple files from storage
   */
  async deleteMultipleFiles(bucket: string, paths: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Multiple file deletion failed:", error);
      return false;
    }
  },

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    bucket: string,
    path: string,
    metadata: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Note: Supabase Storage doesn't support metadata updates directly
      // This would require re-uploading the file or using a custom solution
      console.warn(
        "Metadata updates not directly supported by Supabase Storage",
      );
      return false;
    } catch (error) {
      console.error("Metadata update failed:", error);
      return false;
    }
  },

  /**
   * Get bucket information
   */
  async getBucketInfo(bucketId: string): Promise<StorageBucket | null> {
    try {
      const buckets = await this.getBuckets();
      return buckets.find((b) => b.id === bucketId) || null;
    } catch (error) {
      console.error("Failed to get bucket info:", error);
      return null;
    }
  },

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split("/").slice(0, -1).join("/"));

      if (error) throw error;

      const fileName = path.split("/").pop();
      return data.some((file) => file.name === fileName);
    } catch (error) {
      console.error("File existence check failed:", error);
      return false;
    }
  },

  /**
   * Get file size
   */
  async getFileSize(bucket: string, path: string): Promise<number> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split("/").slice(0, -1).join("/"));

      if (error) throw error;

      const fileName = path.split("/").pop();
      const file = data.find((f) => f.name === fileName);
      return file?.metadata?.size || 0;
    } catch (error) {
      console.error("Failed to get file size:", error);
      return 0;
    }
  },

  /**
   * Create a signed URL for private files
   */
  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Failed to create signed URL:", error);
      return null;
    }
  },

  /**
   * Upload photo to photos bucket
   */
  async uploadPhoto(
    file: File,
    albumPath: string = "general",
  ): Promise<UploadResult> {
    return this.uploadFile({
      bucket: "photos",
      path: albumPath,
      file,
      metadata: {
        type: "photo",
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Upload post image to post-images bucket
   */
  async uploadPostImage(file: File, postId: string): Promise<UploadResult> {
    return this.uploadFile({
      bucket: "post-images",
      path: postId,
      file,
      metadata: {
        type: "post-image",
        postId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Upload album cover to album-covers bucket
   */
  async uploadAlbumCover(file: File, albumId: string): Promise<UploadResult> {
    return this.uploadFile({
      bucket: "album-covers",
      path: albumId,
      file,
      metadata: {
        type: "album-cover",
        albumId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Upload story media to story-media bucket
   */
  async uploadStoryMedia(file: File, storyId: string): Promise<UploadResult> {
    return this.uploadFile({
      bucket: "story-media",
      path: storyId,
      file,
      metadata: {
        type: "story-media",
        storyId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Upload document to documents bucket
   */
  async uploadDocument(
    file: File,
    category: string = "general",
  ): Promise<UploadResult> {
    return this.uploadFile({
      bucket: "documents",
      path: category,
      file,
      metadata: {
        type: "document",
        category,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  },
};
