// FeedFilters Component - Handles advanced filtering options for the feed
// Extracted from MainFeed.tsx for better modularity and maintainability

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Plus,
  Tag,
  Calendar,
  MapPin,
  Users,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { FeedFilters as FeedFiltersType, FeedSortOption } from "./FeedActions";

interface FeedFiltersProps {
  filters: FeedFiltersType;
  sortBy: FeedSortOption;
  onFiltersChange: (filters: FeedFiltersType) => void;
  onSortChange: (sort: FeedSortOption) => void;
  onReset: () => void;
  className?: string;
}

export function FeedFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onReset,
  className = "",
}: FeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleFilterChange = (key: keyof FeedFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !filters.tags?.includes(tag.trim())) {
      const updatedTags = [...(filters.tags || []), tag.trim()];
      handleFilterChange("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags =
      filters.tags?.filter((tag) => tag !== tagToRemove) || [];
    handleFilterChange("tags", updatedTags);
  };

  const handleReset = () => {
    onReset();
    setIsExpanded(false);
  };

  const hasActiveFilters = () => {
    return (
      filters.contentType !== "all" ||
      filters.dateRange !== "all" ||
      filters.author ||
      filters.location ||
      (filters.tags && filters.tags.length > 0)
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters & Sorting</h3>
            {hasActiveFilters() && (
              <Badge variant="secondary" className="text-xs">
                {Object.values(filters).filter((v) => v && v !== "all").length}{" "}
                active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Content Type */}
          <div className="space-y-2">
            <Label
              htmlFor="contentType"
              className="text-sm font-medium text-gray-700"
            >
              Content Type
            </Label>
            <Select
              value={filters.contentType || "all"}
              onValueChange={(value) =>
                handleFilterChange("contentType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All content" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="image">Photos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label
              htmlFor="dateRange"
              className="text-sm font-medium text-gray-700"
            >
              Time Period
            </Label>
            <Select
              value={filters.dateRange || "all"}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label
              htmlFor="sortBy"
              className="text-sm font-medium text-gray-700"
            >
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
                <SelectItem value="most-commented">Most Commented</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Author Filter */}
          <div className="space-y-2">
            <Label
              htmlFor="author"
              className="text-sm font-medium text-gray-700"
            >
              Author
            </Label>
            <Input
              id="author"
              placeholder="Filter by author name..."
              value={filters.author || ""}
              onChange={(e) => handleFilterChange("author", e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-sm font-medium text-gray-700"
            >
              Location
            </Label>
            <Input
              id="location"
              placeholder="Filter by location..."
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tags</Label>
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Add tag filter..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag(newTag)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Engagement
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasLikes"
                  checked={filters.hasLikes || false}
                  onCheckedChange={(checked) =>
                    handleFilterChange("hasLikes", checked)
                  }
                />
                <Label
                  htmlFor="hasLikes"
                  className="text-sm text-gray-600 flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  Has likes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasComments"
                  checked={filters.hasComments || false}
                  onCheckedChange={(checked) =>
                    handleFilterChange("hasComments", checked)
                  }
                />
                <Label
                  htmlFor="hasComments"
                  className="text-sm text-gray-600 flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Has comments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasViews"
                  checked={filters.hasViews || false}
                  onCheckedChange={(checked) =>
                    handleFilterChange("hasViews", checked)
                  }
                />
                <Label
                  htmlFor="hasViews"
                  className="text-sm text-gray-600 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Has views
                </Label>
              </div>
            </div>
          </div>

          {/* Family Member Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Family Members
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "Mom",
                "Dad",
                "Sister",
                "Brother",
                "Grandma",
                "Grandpa",
                "Aunt",
                "Uncle",
              ].map((member) => (
                <div key={member} className="flex items-center space-x-2">
                  <Checkbox
                    id={member}
                    checked={filters.familyMembers?.includes(member) || false}
                    onCheckedChange={(checked) => {
                      const currentMembers = filters.familyMembers || [];
                      const updatedMembers = checked
                        ? [...currentMembers, member]
                        : currentMembers.filter((m) => m !== member);
                      handleFilterChange("familyMembers", updatedMembers);
                    }}
                  />
                  <Label htmlFor={member} className="text-sm text-gray-600">
                    {member}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              Active Filters:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.contentType !== "all" && (
              <Badge variant="outline" className="text-xs">
                Content: {filters.contentType}
              </Badge>
            )}
            {filters.dateRange !== "all" && (
              <Badge variant="outline" className="text-xs">
                Time: {filters.dateRange}
              </Badge>
            )}
            {filters.author && (
              <Badge variant="outline" className="text-xs">
                Author: {filters.author}
              </Badge>
            )}
            {filters.location && (
              <Badge variant="outline" className="text-xs">
                Location: {filters.location}
              </Badge>
            )}
            {filters.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                Tag: {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
