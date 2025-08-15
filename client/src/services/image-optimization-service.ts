// Image Optimization Service - Handles advanced image processing, compression, and thumbnail generation
// Provides client-side image optimization before upload to reduce bandwidth and improve performance

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: "jpeg" | "png" | "webp";
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  preserveAspectRatio?: boolean;
}

export interface OptimizedImage {
  originalFile: File;
  optimizedFile: File;
  thumbnail?: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  metadata: {
    format: string;
    quality: number;
    processingTime: number;
  };
}

export interface VideoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxDuration?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedVideo {
  originalFile: File;
  optimizedFile: File;
  thumbnail?: string;
  width: number;
  height: number;
  duration: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  metadata: {
    format: string;
    processingTime: number;
  };
}

class ImageOptimizationService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Optimize an image file with compression and resizing
   */
  async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImage> {
    const startTime = performance.now();

    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = "jpeg",
      generateThumbnail = true,
      thumbnailSize = 300,
      preserveAspectRatio = true,
    } = options;

    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => {
        try {
          const { width, height } = this.calculateDimensions(
            img.naturalWidth,
            img.naturalHeight,
            maxWidth,
            maxHeight,
            preserveAspectRatio,
          );

          // Set canvas dimensions
          this.canvas.width = width;
          this.canvas.height = height;

          // Clear canvas and draw optimized image
          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(img, 0, 0, width, height);

          // Generate optimized file
          const mimeType = `image/${format}`;
          const optimizedBlob = this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate optimized image"));
                return;
              }

              const optimizedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              // Generate thumbnail if requested
              let thumbnail: string | undefined;
              if (generateThumbnail) {
                thumbnail = this.generateThumbnail(img, thumbnailSize);
              }

              const processingTime = performance.now() - startTime;
              const compressionRatio =
                (1 - optimizedFile.size / file.size) * 100;

              resolve({
                originalFile: file,
                optimizedFile,
                thumbnail,
                width,
                height,
                originalSize: file.size,
                optimizedSize: optimizedFile.size,
                compressionRatio,
                metadata: {
                  format,
                  quality,
                  processingTime,
                },
              });
            },
            mimeType,
            quality,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process a video file and extract metadata
   */
  async processVideo(
    file: File,
    options: VideoOptimizationOptions = {},
  ): Promise<OptimizedVideo> {
    const startTime = performance.now();

    const { generateThumbnail = true, thumbnailSize = 300 } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        try {
          // Generate thumbnail if requested
          let thumbnail: string | undefined;
          if (generateThumbnail) {
            thumbnail = this.generateVideoThumbnail(video, thumbnailSize);
          }

          const processingTime = performance.now() - startTime;

          resolve({
            originalFile: file,
            optimizedFile: file, // For now, return original file
            thumbnail,
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            metadata: {
              format: file.type,
              processingTime,
            },
          });
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error("Failed to load video"));
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate a thumbnail from an image
   */
  private generateThumbnail(img: HTMLImageElement, size: number): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const { width, height } = this.calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      size,
      size,
      true,
    );

    canvas.width = width;
    canvas.height = height;

    // Use high quality rendering for thumbnails
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.9);
  }

  /**
   * Generate a thumbnail from a video
   */
  private generateVideoThumbnail(
    video: HTMLVideoElement,
    size: number,
  ): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const { width, height } = this.calculateDimensions(
      video.videoWidth,
      video.videoHeight,
      size,
      size,
      true,
    );

    canvas.width = width;
    canvas.height = height;

    // Seek to 1 second or middle of video for thumbnail
    const seekTime = Math.min(1, video.duration / 2);
    video.currentTime = seekTime;

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, width, height);
    };

    return canvas.toDataURL("image/jpeg", 0.9);
  }

  /**
   * Calculate optimal dimensions while preserving aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    preserveAspectRatio: boolean,
  ): { width: number; height: number } {
    if (!preserveAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    if (maxWidth / maxHeight > aspectRatio) {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight,
      };
    } else {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    }
  }

  /**
   * Batch optimize multiple images
   */
  async optimizeImages(
    files: File[],
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];

    for (const file of files) {
      try {
        if (file.type.startsWith("image/")) {
          const optimized = await this.optimizeImage(file, options);
          results.push(optimized);
        } else {
          // For non-image files, create a placeholder result
          results.push({
            originalFile: file,
            optimizedFile: file,
            width: 0,
            height: 0,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            metadata: {
              format: file.type,
              quality: 1,
              processingTime: 0,
            },
          });
        }
      } catch (error) {
        console.error(`Failed to optimize ${file.name}:`, error);
        // Add original file as fallback
        results.push({
          originalFile: file,
          optimizedFile: file,
          width: 0,
          height: 0,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0,
          metadata: {
            format: file.type,
            quality: 1,
            processingTime: 0,
          },
        });
      }
    }

    return results;
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(optimizedFiles: OptimizedImage[]) {
    const totalOriginalSize = optimizedFiles.reduce(
      (sum, file) => sum + file.originalSize,
      0,
    );
    const totalOptimizedSize = optimizedFiles.reduce(
      (sum, file) => sum + file.optimizedSize,
      0,
    );
    const totalCompressionRatio = optimizedFiles.reduce(
      (sum, file) => sum + file.compressionRatio,
      0,
    );
    const averageCompressionRatio =
      totalCompressionRatio / optimizedFiles.length;

    return {
      totalFiles: optimizedFiles.length,
      totalOriginalSize,
      totalOptimizedSize,
      totalBytesSaved: totalOriginalSize - totalOptimizedSize,
      averageCompressionRatio,
      totalProcessingTime: optimizedFiles.reduce(
        (sum, file) => sum + file.metadata.processingTime,
        0,
      ),
    };
  }
}

// Export singleton instance
export const imageOptimizationService = new ImageOptimizationService();
