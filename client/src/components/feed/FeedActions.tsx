// FeedActions Component - Handles feed-level actions and controls
// Extracted from MainFeed.tsx for better modularity and maintainability

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  Users,
  Image,
  Video,
  FileText,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreatePost } from "./CreatePost";

interface FeedActionsProps {
  onRefresh: () => void;
  onFilterChange: (filters: FeedFilters) => void;
  onSortChange: (sort: FeedSortOption) => void;
  onCreatePost: (postData: any) => Promise<any>;
  className?: string;
}

export interface FeedFilters {
  contentType?: "all" | "text" | "image" | "video" | "document";
  author?: string;
  tags?: string[];
  dateRange?: "all" | "today" | "week" | "month";
  location?: string;
}

export type FeedSortOption =
  | "recent"
  | "popular"
  | "trending"
  | "most-liked"
  | "most-commented";

export function FeedActions({
  onRefresh,
  onFilterChange,
  onSortChange,
  onCreatePost,
  className = "",
}: FeedActionsProps) {
  const { user } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FeedFilters>({
    contentType: "all",
    dateRange: "all",
  });
  const [sortBy, setSortBy] = useState<FeedSortOption>("recent");

  const handleFilterChange = (key: keyof FeedFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: FeedSortOption) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implement search logic here
  };

  const handleCreatePost = async (postData: any) => {
    try {
      await onCreatePost(postData);
      setIsCreatePostOpen(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const getSortIcon = (sortType: FeedSortOption) => {
    switch (sortType) {
      case "recent":
        return <Clock className="w-4 h-4" />;
      case "popular":
        return <TrendingUp className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      case "most-liked":
        return <Users className="w-4 h-4" />;
      case "most-commented":
        return <Users className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sortType: FeedSortOption) => {
    switch (sortType) {
      case "recent":
        return "Most Recent";
      case "popular":
        return "Most Popular";
      case "trending":
        return "Trending";
      case "most-liked":
        return "Most Liked";
      case "most-commented":
        return "Most Commented";
      default:
        return "Most Recent";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Create Post Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.user_metadata?.name?.charAt(0) || "U"}
            </span>
          </div>
          <Button
            variant="outline"
            className="flex-1 justify-start text-gray-500 hover:text-gray-700"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            What's on your mind?
          </Button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Image className="w-4 h-4" />
            Photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Video className="w-4 h-4" />
            Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <FileText className="w-4 h-4" />
            Document
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatePostOpen(true)}
            className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <MapPin className="w-4 h-4" />
            Location
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts, people, or topics..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.contentType}
              onValueChange={(value) =>
                handleFilterChange("contentType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Content type" />
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

          {/* Date Range Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="w-full lg:w-48">
            <Select value={sortBy} onValueChange={handleSortChange}>
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

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="w-full lg:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Filters Display */}
        {(filters.contentType !== "all" ||
          filters.dateRange !== "all" ||
          searchTerm) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.contentType !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {filters.contentType}
                <button
                  onClick={() => handleFilterChange("contentType", "all")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.dateRange !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {filters.dateRange}
                <button
                  onClick={() => handleFilterChange("dateRange", "all")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ contentType: "all", dateRange: "all" });
                setSearchTerm("");
                onFilterChange({ contentType: "all", dateRange: "all" });
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePost
          onSubmit={handleCreatePost}
          onCancel={() => setIsCreatePostOpen(false)}
        />
      )}
    </div>
  );
}
