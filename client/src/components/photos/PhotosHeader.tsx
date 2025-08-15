// PhotosHeader Component - Header section with navigation, title, and search
// Extracted from Photos.tsx for better modularity and maintainability

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search } from "lucide-react";

interface PhotosHeaderProps {
  familyName?: string;
  albumCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateAlbum: () => void;
  className?: string;
}

export function PhotosHeader({
  familyName,
  albumCount,
  searchTerm,
  onSearchChange,
  onCreateAlbum,
  className = "",
}: PhotosHeaderProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Photos & Videos
            </h1>
            {familyName && (
              <p className="text-muted-foreground">
                {familyName} • {albumCount} album{albumCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {familyName && (
          <div className="flex gap-2">
            <Button
              onClick={onCreateAlbum}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search albums by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
