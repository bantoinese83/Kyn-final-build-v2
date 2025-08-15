// PhotoUploader Component - Handles file selection, upload, and database integration
// Updated with image optimization, thumbnail generation, and database integration

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Image, Video } from "lucide-react";
import { storageService } from "@/services";
import { photoService } from "@/services";
import { Album } from "@/types/photos";
import { useAuth } from "@/contexts/AuthContext";

interface PhotoUploaderProps {
  album: Album;
  onUploadComplete: () => void;
  className?: string;
}

interface ProcessedFile {
  file: File;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export function PhotoUploader({
  album,
  onUploadComplete,
  className = "",
}: PhotoUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);

  // Image optimization and thumbnail generation
  const processImage = useCallback(
    async (file: File): Promise<ProcessedFile> => {
      return new Promise((resolve) => {
        if (file.type.startsWith("image/")) {
          const img = document.createElement("img");
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          img.onload = () => {
            // Generate thumbnail (300x300 max)
            const maxSize = 300;
            let { width, height } = img;

            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);

            // Generate thumbnail as data URL
            const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

            resolve({
              file,
              thumbnail,
              width: img.naturalWidth,
              height: img.naturalHeight,
              metadata: {
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight,
              },
            });
          };

          img.src = URL.createObjectURL(file);
        } else if (file.type.startsWith("video/")) {
          // Video processing
          const video = document.createElement("video");
          video.onloadedmetadata = () => {
            resolve({
              file,
              width: video.videoWidth,
              height: video.videoHeight,
              duration: Math.round(video.duration),
              metadata: {
                originalWidth: video.videoWidth,
                originalHeight: video.videoHeight,
                duration: video.duration,
                aspectRatio: video.videoWidth / video.videoHeight,
              },
            });
          };
          video.src = URL.createObjectURL(file);
        } else {
          resolve({ file });
        }
      });
    },
    [],
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    if (validFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please select only image or video files.",
        variant: "destructive",
      });
      return;
    }

    // Process files for optimization and metadata
    const processedFiles: ProcessedFile[] = [];
    for (const file of validFiles) {
      try {
        const processed = await processImage(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        processedFiles.push({ file });
      }
    }

    setSelectedFiles(processedFiles);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !user) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadResults = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const processedFile = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        setUploadProgress(progress);

        try {
          // Upload file to Supabase Storage
          const storageResult = await storageService.uploadPhoto(
            processedFile.file,
            album.id,
          );

          if (storageResult.success && storageResult.url) {
            // Save to database via photoService
            const photoData = {
              familyId: album.familyId || "",
              authorId: user.id,
              title: processedFile.file.name,
              description: "",
              fileUrl: storageResult.url,
              thumbnailUrl: processedFile.thumbnail,
              fileSize: processedFile.file.size,
              fileType: processedFile.file.type,
              albumId: album.id,
              tags: [],
              location: "",
              isPublic: false,
              width: processedFile.width,
              height: processedFile.height,
              duration: processedFile.duration,
              metadata: processedFile.metadata,
            };

            const dbResult = await photoService.uploadPhoto(photoData);

            if (dbResult.success) {
              uploadResults.push({
                success: true,
                fileName: processedFile.file.name,
                photoId: dbResult.data?.id,
              });
            } else {
              throw new Error(dbResult.error || "Database save failed");
            }
          } else {
            throw new Error(storageResult.error || "Storage upload failed");
          }
        } catch (uploadError) {
          console.error(
            `Failed to upload ${processedFile.file.name}:`,
            uploadError,
          );
          uploadResults.push({
            success: false,
            fileName: processedFile.file.name,
            error:
              uploadError instanceof Error
                ? uploadError.message
                : "Upload failed",
          });
        }
      }

      // Show results
      const successCount = uploadResults.filter((r) => r.success).length;
      const failureCount = uploadResults.length - successCount;

      if (successCount > 0) {
        toast({
          title: "Upload Complete!",
          description: `${successCount} files uploaded successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}.`,
        });
      }

      if (failureCount > 0) {
        toast({
          title: "Some Uploads Failed",
          description: `${failureCount} files failed to upload. Please check the console for details.`,
          variant: "destructive",
        });
      }

      setSelectedFiles([]);
      setUploadProgress(0);
      onUploadComplete();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <Button
        onClick={openFileSelector}
        variant="outline"
        className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        disabled={isUploading}
      >
        <div className="text-center">
          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isUploading ? "Uploading..." : "Click to select photos & videos"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports JPG, PNG, GIF, MP4, MOV • Auto-optimized
          </p>
        </div>
      </Button>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFiles}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((processedFile, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    {processedFile.file.type.startsWith("image/") ? (
                      <Image className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Video className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {processedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(processedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      {processedFile.width && processedFile.height && (
                        <span className="ml-2">
                          • {processedFile.width}×{processedFile.height}
                        </span>
                      )}
                      {processedFile.duration && (
                        <span className="ml-2">
                          • {Math.round(processedFile.duration)}s
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Uploading to {album.title}...
                </span>
                <span className="text-sm text-blue-600">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
