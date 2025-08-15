import React, { useState, useCallback, useMemo } from "react";
import { withDataFetching } from "@/components/HOCs/withDataFetching";
import { withFormManagement } from "@/components/HOCs/withFormManagement";
import { withSidebar } from "@/components/HOCs/withSidebar";
import { DataCard } from "@/components/Common/DataCard";
import { LoadingState } from "@/components/Common/LoadingState";
import { EmptyState } from "@/components/Common/EmptyState";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useCacheManager } from "@/hooks/useCacheManager";
import {
  postService,
  eventService,
  recipeService,
  photoService,
  userService,
} from "@/services";
import { Post, Event, Recipe, Photo, User } from "@/types/database";
import {
  CalendarDays,
  UtensilsCrossed,
  Camera,
  MessageSquare,
  Users,
  Plus,
  Filter,
  Search,
} from "lucide-react";

// Enhanced interfaces for the enhanced MainFeed
interface MainFeedData {
  posts: Post[];
  events: Event[];
  recipes: Recipe[];
  photos: Photo[];
  familyMembers: User[];
  recentActivity: Array<{
    id: string;
    type: "post" | "event" | "recipe" | "photo";
    title: string;
    author: string;
    timestamp: string;
    avatar?: string;
  }>;
}

interface MainFeedFilters {
  contentType: "all" | "posts" | "events" | "recipes" | "photos";
  dateRange: "all" | "today" | "week" | "month";
  authorId?: string;
  searchQuery: string;
}

interface MainFeedProps {
  familyId: string;
  userId: string;
  onDataLoaded?: (data: MainFeedData) => void;
  onError?: (error: string) => void;
}

// Enhanced MainFeed component with modern patterns
const MainFeedComponent: React.FC<MainFeedProps> = ({
  familyId,
  userId,
  onDataLoaded,
  onError,
}) => {
  const { measureAsync } = usePerformanceMonitor();
  const { getCache, setCache, invalidateCache } = useCacheManager();

  // Enhanced state management
  const [filters, setFilters] = useState<MainFeedFilters>({
    contentType: "all",
    dateRange: "all",
    searchQuery: "",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">(
    "timeline",
  );
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "alphabetical">(
    "recent",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized data fetching functions
  const fetchMainFeedData = useCallback(async (): Promise<MainFeedData> => {
    return measureAsync(
      "fetchMainFeedData",
      async () => {
        const cacheKey = `main_feed_${familyId}_${JSON.stringify(filters)}_${sortBy}`;
        const cached = getCache(cacheKey);

        if (cached) {
          return cached;
        }

        try {
          // Parallel data fetching for better performance
          const [
            postsResult,
            eventsResult,
            recipesResult,
            photosResult,
            membersResult,
          ] = await Promise.all([
            postService.getFamilyPosts(familyId, { page: 1, pageSize: 20 }),
            eventService.getFamilyEvents(familyId, { page: 1, pageSize: 10 }),
            recipeService.getFamilyRecipes(familyId, { page: 1, pageSize: 15 }),
            photoService.getFamilyPhotos(familyId, { page: 1, pageSize: 25 }),
            userService.getFamilyMembers(familyId),
          ]);

          // Handle errors gracefully
          if (
            !postsResult.success ||
            !eventsResult.success ||
            !recipesResult.success ||
            !photosResult.success ||
            !membersResult.success
          ) {
            throw new Error("Failed to fetch some data");
          }

          // Process and combine data
          const posts = postsResult.data || [];
          const events = eventsResult.data || [];
          const recipes = recipesResult.data || [];
          const photos = photosResult.data || [];
          const familyMembers = membersResult.data || [];

          // Create recent activity feed
          const recentActivity = [
            ...posts.map((post) => ({
              id: post.id,
              type: "post" as const,
              title: post.title || "Untitled Post",
              author: post.author?.name || "Unknown",
              timestamp: post.createdAt,
              avatar: post.author?.avatar,
            })),
            ...events.map((event) => ({
              id: event.id,
              type: "event" as const,
              title: event.title,
              author: event.author?.name || "Unknown",
              timestamp: event.createdAt,
              avatar: event.author?.avatar,
            })),
            ...recipes.map((recipe) => ({
              id: recipe.id,
              type: "recipe" as const,
              title: recipe.title,
              author: recipe.author?.name || "Unknown",
              timestamp: recipe.createdAt,
              avatar: recipe.author?.avatar,
            })),
            ...photos.map((photo) => ({
              id: photo.id,
              type: "photo" as const,
              title: photo.caption || "Untitled Photo",
              author: photo.author?.name || "Unknown",
              timestamp: photo.createdAt,
              avatar: photo.author?.avatar,
            })),
          ]
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )
            .slice(0, 20);

          const data: MainFeedData = {
            posts,
            events,
            recipes,
            photos,
            familyMembers,
            recentActivity,
          };

          // Cache the result
          setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes

          // Notify parent component
          onDataLoaded?.(data);

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          onError?.(errorMessage);
          throw error;
        }
      },
      "custom",
    );
  }, [
    familyId,
    filters,
    sortBy,
    measureAsync,
    getCache,
    setCache,
    onDataLoaded,
    onError,
  ]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof MainFeedFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      // Invalidate cache when filters change
      invalidateCache(`main_feed_${familyId}`);
    },
    [familyId, invalidateCache],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchQuery", query);
    },
    [handleFilterChange],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchMainFeedData();
      // Invalidate all related caches
      invalidateCache(`main_feed_${familyId}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMainFeedData, familyId, invalidateCache]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    // This would be implemented based on the actual data structure
    // For now, return empty arrays as placeholders
    return {
      posts: [],
      events: [],
      recipes: [],
      photos: [],
      familyMembers: [],
      recentActivity: [],
    };
  }, [filters, sortBy]);

  // Enhanced render functions
  const renderContentSection = useCallback(
    (
      title: string,
      icon: React.ReactNode,
      count: number,
      children: React.ReactNode,
    ) => (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        {children}
      </div>
    ),
    [],
  );

  const renderActivityItem = useCallback(
    (activity: MainFeedData["recentActivity"][0]) => (
      <div
        key={activity.id}
        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex-shrink-0">
          {activity.avatar ? (
            <img
              src={activity.avatar}
              alt={activity.author}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">
            <span className="font-medium">{activity.author}</span> added a{" "}
            {activity.type}
          </p>
          <p className="text-sm text-gray-500 truncate">{activity.title}</p>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-400">
          {new Date(activity.timestamp).toLocaleDateString()}
        </div>
      </div>
    ),
    [],
  );

  // Enhanced toolbar
  const renderToolbar = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search family content..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Content Type Filter */}
            <select
              value={filters.contentType}
              onChange={(e) =>
                handleFilterChange("contentType", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Content</option>
              <option value="posts">Posts</option>
              <option value="events">Events</option>
              <option value="recipes">Recipes</option>
              <option value="photos">Photos</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              {(["grid", "list", "timeline"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  } ${mode === "grid" ? "rounded-l-lg" : ""} ${mode === "timeline" ? "rounded-r-lg" : ""}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Add New Content Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Content</span>
            </button>
          </div>
        </div>
      </div>
    ),
    [
      filters,
      viewMode,
      sortBy,
      isRefreshing,
      handleFilterChange,
      handleSearch,
      handleRefresh,
    ],
  );

  // Enhanced content sections
  const renderContentSections = useCallback(
    () => (
      <div className="px-6 py-6 space-y-6">
        {/* Recent Activity */}
        {renderContentSection(
          "Recent Activity",
          <MessageSquare className="w-5 h-5 text-blue-600" />,
          filteredData.recentActivity.length,
          <div className="space-y-2">
            {filteredData.recentActivity.length > 0 ? (
              filteredData.recentActivity.map(renderActivityItem)
            ) : (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
                title="No recent activity"
                description="When family members add content, it will appear here."
              />
            )}
          </div>,
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <DataCard
            title="Total Posts"
            value={filteredData.posts.length}
            icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
            trend="+12%"
            trendDirection="up"
          />
          <DataCard
            title="Upcoming Events"
            value={filteredData.events.length}
            icon={<CalendarDays className="w-6 h-6 text-green-600" />}
            trend="+5%"
            trendDirection="up"
          />
          <DataCard
            title="Family Recipes"
            value={filteredData.recipes.length}
            icon={<UtensilsCrossed className="w-6 h-6 text-orange-600" />}
            trend="+8%"
            trendDirection="up"
          />
          <DataCard
            title="Shared Photos"
            value={filteredData.photos.length}
            icon={<Camera className="w-6 h-6 text-purple-600" />}
            trend="+15%"
            trendDirection="up"
          />
        </div>

        {/* Family Members */}
        {renderContentSection(
          "Family Members",
          <Users className="w-5 h-5 text-green-600" />,
          filteredData.familyMembers.length,
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredData.familyMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-12 h-12 mx-auto mb-2">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {member.initials || member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-900 truncate">{member.name}</p>
              </div>
            ))}
          </div>,
        )}
      </div>
    ),
    [filteredData, renderContentSection, renderActivityItem],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderToolbar()}
      {renderContentSections()}
    </div>
  );
};

// Enhanced MainFeed with HOCs
const MainFeed = withSidebar(
  withFormManagement(
    withDataFetching(MainFeedComponent, {
      dataKey: "mainFeedData",
      fetchFunction: (props: MainFeedProps) => {
        // This will be handled by the withDataFetching HOC
        return Promise.resolve({
          posts: [],
          events: [],
          recipes: [],
          photos: [],
          familyMembers: [],
          recentActivity: [],
        });
      },
      dependencies: ["familyId", "userId"],
      cacheKey: (props: MainFeedProps) => `main_feed_${props.familyId}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load feed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      ),
      loadingFallback: <LoadingState message="Loading your family feed..." />,
    }),
    {
      formConfig: {
        initialValues: {
          contentType: "all",
          dateRange: "all",
          searchQuery: "",
        },
        validationSchema: null, // Add validation if needed
        onSubmit: async (values) => {
          // Handle form submission
          console.log("Form submitted:", values);
        },
      },
    },
  ),
  {
    sidebarConfig: {
      title: "Family Feed",
      description: "Stay connected with your family",
      navigation: [
        { label: "All Content", href: "#", icon: "home" },
        { label: "Posts", href: "#", icon: "message-square" },
        { label: "Events", href: "#", icon: "calendar" },
        { label: "Recipes", href: "#", icon: "utensils" },
        { label: "Photos", href: "#", icon: "camera" },
      ],
    },
  },
);

export default MainFeed;
