// MainFeed Component - Main feed container using modular components
// Refactored to use withFamilyAppPatterns HOC for better performance and consistency

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { postService, familyService } from "@/services";
import { Post } from "@/types/posts";
import { FeedItem, FeedActions, FeedFilters } from "./index";
import { FeedFilters as FeedFiltersType, FeedSortOption } from "./FeedActions";
import { withFamilyAppPatterns } from "@/components/hoc";
import { LoadingState } from "@/components/ui/patterns/LoadingState";
import { EmptyState } from "@/components/ui/patterns/EmptyState";
import {
  useMemoizedValue,
  usePerformanceMonitor,
} from "@/hooks/usePerformance";

interface MainFeedProps {
  className?: string;
}

interface FeedData {
  posts: Post[];
  currentFamily: any;
  hasMorePosts: boolean;
}

function MainFeedComponent({
  className = "",
  data,
  isLoading,
  isError,
  error,
  refetch,
}: MainFeedProps & any) {
  const { user } = useAuth();

  // Performance monitoring
  usePerformanceMonitor("MainFeed");

  // State management
  const [filters, setFilters] = useState<FeedFiltersType>({
    contentType: "all",
    dateRange: "all",
  });
  const [sortBy, setSortBy] = useState<FeedSortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filtered and sorted posts
  const processedPosts = useMemoizedValue(
    () => {
      if (!data?.posts) return [];

      let filtered = data.posts;

      // Apply content type filter
      if (filters.contentType !== "all") {
        filtered = filtered.filter((post) => {
          if (
            filters.contentType === "image" &&
            post.images &&
            post.images.length > 0
          )
            return true;
          if (
            filters.contentType === "video" &&
            post.videos &&
            post.videos.length > 0
          )
            return true;
          if (
            filters.contentType === "text" &&
            !post.images?.length &&
            !post.videos?.length
          )
            return true;
          return false;
        });
      }

      // Apply date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (filters.dateRange) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        filtered = filtered.filter(
          (post) => new Date(post.createdAt) >= filterDate,
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "recent":
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case "popular":
          filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
          break;
        case "trending":
          filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case "most-liked":
          filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
          break;
        case "most-commented":
          filtered.sort(
            (a, b) => (b.commentCount || 0) - (a.commentCount || 0),
          );
          break;
      }

      return filtered;
    },
    {
      cacheKey: `feed_posts_${user?.id}_${JSON.stringify(filters)}_${sortBy}`,
      ttl: 2 * 60 * 1000, // 2 minutes
      dependencies: [data?.posts, filters, sortBy, user?.id],
    },
  );

  // Handle filter changes
  const handleFilterChange = (newFilters: FeedFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSortChange = (newSortBy: FeedSortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle pagination
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch?.();
  };

  // Handle create post
  const handleCreatePost = async (postData: any) => {
    // TODO: Implement post creation
    console.log("Creating post:", postData);
    return Promise.resolve();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <LoadingState message="Loading your family feed..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <EmptyState
          title="Failed to load feed"
          description={error || "Something went wrong while loading your feed."}
          actions={
            <button
              onClick={() => refetch?.()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!processedPosts || processedPosts.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <EmptyState
          title="No posts yet"
          description="Be the first to share something with your family!"
          actions={
            <button
              onClick={() => {
                /* TODO: Open create post modal */
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Post
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Feed Header with Filters and Actions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <FeedFilters
              filters={filters}
              sortBy={sortBy}
              onFiltersChange={handleFilterChange}
              onSortChange={handleSortChange}
              onReset={() => {
                setFilters({ contentType: "all", dateRange: "all" });
                setSortBy("recent");
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <FeedActions
              onRefresh={handleRefresh}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onCreatePost={handleCreatePost}
            />
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {processedPosts.map((post) => (
          <FeedItem
            key={post.id}
            post={post}
            onLike={async (postId: string) => {
              // TODO: Handle like
              console.log("Liking post:", postId);
            }}
            onComment={async (postId: string, comment: string) => {
              // TODO: Handle comment
              console.log("Commenting on post:", postId, comment);
            }}
            onShare={async (postId: string) => {
              // TODO: Handle share
              console.log("Sharing post:", postId);
            }}
            onDelete={async (postId: string) => {
              // TODO: Handle delete
              console.log("Deleting post:", postId);
            }}
          />
        ))}
      </div>

      {/* Load More Button */}
      {data?.hasMorePosts && (
        <div className="flex justify-center p-4">
          <button
            onClick={handleLoadMore}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}

// Temporarily disabled HOC usage to resolve runtime errors
// TODO: Fix HOC composition system
const MainFeed = MainFeedComponent;

export default MainFeed;
