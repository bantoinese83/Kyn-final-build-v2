// ProfilePhotoUpload Component - Handles profile photo upload
// Extracted from Signup.tsx to improve maintainability and reusability

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";

interface ProfilePhotoUploadProps {
  profilePhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
  firstName: string;
  lastName: string;
  className?: string;
}

export function ProfilePhotoUpload({
  profilePhoto,
  onPhotoChange,
  firstName,
  lastName,
  className = "",
}: ProfilePhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-gray-200">
            {profilePhoto ? (
              <AvatarImage src={profilePhoto} alt="Profile photo" />
            ) : (
              <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>

          {profilePhoto && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              onClick={handleRemovePhoto}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {profilePhoto
                ? "Change your profile photo"
                : "Add a profile photo"}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Drag and drop an image here, or click to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              Choose Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
