// PhotosFilters Component - Handles filtering, sorting, and view mode toggles
// Extracted from Photos.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

interface PhotosFiltersProps {
  sortBy: "recent" | "name" | "media";
  filterType: "all" | "photos" | "videos";
  viewMode: "grid" | "list";
  onSortChange: (sort: "recent" | "name" | "media") => void;
  onFilterChange: (filter: "all" | "photos" | "videos") => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
}

export function PhotosFilters({
  sortBy,
  filterType,
  viewMode,
  onSortChange,
  onFilterChange,
  onViewModeChange,
  className = "",
}: PhotosFiltersProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* Sort and Filter Controls */}
      <div className="flex gap-2">
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as "recent" | "name" | "media")
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="recent">Most Recent</option>
          <option value="name">Alphabetical</option>
          <option value="media">Most Media</option>
        </select>

        <select
          value={filterType}
          onChange={(e) =>
            onFilterChange(e.target.value as "all" | "photos" | "videos")
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Media</option>
          <option value="photos">Photos Only</option>
          <option value="videos">Videos Only</option>
        </select>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-none border-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-none border-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
