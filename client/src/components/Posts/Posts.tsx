import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/HOCs/withDataFetching";
import { withFormManagement } from "@/components/HOCs/withFormManagement";
import { withSidebar } from "@/components/HOCs/withSidebar";
import { DataCard } from "@/components/Common/DataCard";
import { LoadingState } from "@/components/Common/LoadingState";
import { EmptyState } from "@/components/Common/EmptyState";
import { VirtualList } from "@/components/Common/VirtualList";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useCacheManager } from "@/hooks/useCacheManager";
import { postService, userService, photoService } from "@/services";
import { Post, User, PostFilters, PostCategory } from "@/types/database";
import {
  FileText,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  Bookmark,
  Tag,
  User as UserIcon,
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  Clock,
} from "lucide-react";

// Enhanced interfaces for the Posts component
interface PostsData {
  posts: Post[];
  totalPosts: number;
  totalCategories: number;
  totalLikes: number;
  recentPosts: Post[];
  popularPosts: Post[];
  familyMembers: User[];
  categories: PostCategory[];
  postStats: {
    totalViews: number;
    averageRating: number;
    totalComments: number;
    mostEngagedPost: string;
  };
}

interface PostsFilters extends PostFilters {
  viewMode: "grid" | "list" | "masonry";
  sortBy: "recent" | "oldest" | "popular" | "trending" | "rating";
  sortOrder: "asc" | "desc";
  dateRange: "all" | "today" | "week" | "month" | "year";
  category: string | "all";
  author: string | "all";
  tags: string[];
  hasMedia: boolean | "all";
  engagement: "high" | "medium" | "low" | "all";
}

interface PostsProps {
  familyId: string;
  userId: string;
  onPostSelect?: (post: Post) => void;
  onPostCreate?: (post: Partial<Post>) => void;
  onPostUpdate?: (postId: string, updates: Partial<Post>) => void;
  onPostDelete?: (postId: string) => void;
  onPostLike?: (postId: string) => void;
  onPostComment?: (postId: string, comment: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Posts component with modern patterns
const PostsComponent: React.FC<PostsProps> = ({
  familyId,
  userId,
  onPostSelect,
  onPostCreate,
  onPostUpdate,
  onPostDelete,
  onPostLike,
  onPostComment,
  onError,
}) => {
  const { measureAsync } = usePerformanceMonitor();
  const { getCache, setCache, invalidateCache } = useCacheManager();

  // Enhanced state management
  const [filters, setFilters] = useState<PostsFilters>({
    viewMode: "grid",
    sortBy: "recent",
    sortOrder: "desc",
    dateRange: "all",
    searchQuery: "",
    authorId: undefined,
    categoryId: undefined,
    category: "all",
    author: "all",
    tags: [],
    hasMedia: "all",
    engagement: "all",
    isPublic: false,
    isPinned: false,
  });

  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [commentText, setCommentText] = useState("");

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Memoized data fetching functions
  const fetchPostsData = useCallback(async (): Promise<PostsData> => {
    return measureAsync(
      "fetchPostsData",
      async () => {
        const cacheKey = `posts_data_${familyId}_${JSON.stringify(filters)}_${currentPage}`;
        const cached = getCache(cacheKey);

        if (cached) return cached;

        try {
          const [postsResult, membersResult, categoriesResult] =
            await Promise.all([
              postService.getFamilyPosts(familyId, {
                page: currentPage,
                pageSize,
                filters: {
                  searchQuery: filters.searchQuery,
                  authorId: filters.authorId,
                  categoryId: filters.categoryId,
                  isPublic: filters.isPublic,
                  isPinned: filters.isPinned,
                },
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
              }),
              userService.getFamilyMembers(familyId),
              postService.getPostCategories(familyId),
            ]);

          if (
            !postsResult.success ||
            !membersResult.success ||
            !categoriesResult.success
          ) {
            throw new Error("Failed to fetch posts data");
          }

          const posts = postsResult.data || [];
          const familyMembers = membersResult.data || [];
          const categories = categoriesResult.data || [];

          // Calculate post statistics
          const totalViews = posts.reduce(
            (sum, post) => sum + (post.views || 0),
            0,
          );
          const averageRating =
            posts.length > 0
              ? posts.reduce((sum, post) => sum + (post.rating || 0), 0) /
                posts.length
              : 0;
          const totalComments = posts.reduce(
            (sum, post) => sum + (post.comments?.length || 0),
            0,
          );

          // Find most engaged post
          const mostEngagedPost =
            posts.sort((a, b) => {
              const engagementA =
                (a.likes || 0) + (a.comments?.length || 0) + (a.views || 0);
              const engagementB =
                (b.likes || 0) + (b.comments?.length || 0) + (b.views || 0);
              return engagementB - engagementA;
            })[0]?.title || "None";

          // Get recent and popular posts
          const recentPosts = posts
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 8);

          const popularPosts = posts
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 8);

          const data: PostsData = {
            posts,
            totalPosts: posts.length,
            totalCategories: categories.length,
            totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
            recentPosts,
            popularPosts,
            familyMembers,
            categories,
            postStats: {
              totalViews,
              averageRating: Math.round(averageRating * 10) / 10,
              totalComments,
              mostEngagedPost,
            },
          };

          setCache(cacheKey, data, 5 * 60 * 1000);
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
    currentPage,
    pageSize,
    measureAsync,
    getCache,
    setCache,
    onError,
  ]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof PostsFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
      invalidateCache(`posts_data_${familyId}`);
    },
    [familyId, invalidateCache],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchQuery", query);
    },
    [handleFilterChange],
  );

  const handleViewModeChange = useCallback(
    (mode: "grid" | "list" | "masonry") => {
      handleFilterChange("viewMode", mode);
    },
    [handleFilterChange],
  );

  // Post action handlers
  const handlePostLike = useCallback(
    async (postId: string) => {
      try {
        await postService.likePost(postId, userId);
        onPostLike?.(postId);
        invalidateCache(`posts_data_${familyId}`);
      } catch (error) {
        onError?.("Failed to like post");
      }
    },
    [
      postId,
      userId,
      postService,
      onPostLike,
      familyId,
      invalidateCache,
      onError,
    ],
  );

  const handlePostComment = useCallback(
    async (postId: string) => {
      if (!commentText.trim()) return;

      try {
        await postService.commentOnPost(postId, userId, commentText);
        onPostComment?.(postId, commentText);
        setCommentText("");
        invalidateCache(`posts_data_${familyId}`);
      } catch (error) {
        onError?.("Failed to comment on post");
      }
    },
    [
      postId,
      userId,
      commentText,
      postService,
      onPostComment,
      familyId,
      invalidateCache,
      onError,
    ],
  );

  const handlePostShare = useCallback((post: Post) => {
    console.log("Sharing post:", post);
  }, []);

  const handlePostEdit = useCallback((post: Post) => {
    console.log("Editing post:", post);
  }, []);

  const handlePostDelete = useCallback(
    async (postId: string) => {
      if (!confirm("Are you sure you want to delete this post?")) return;

      setIsDeleting(true);
      try {
        await postService.deletePost(postId);
        onPostDelete?.(postId);
        invalidateCache(`posts_data_${familyId}`);
      } catch (error) {
        onError?.("Failed to delete post");
      } finally {
        setIsDeleting(false);
      }
    },
    [postId, postService, onPostDelete, familyId, invalidateCache, onError],
  );

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return {
      posts: [],
      totalPosts: 0,
      totalCategories: 0,
      totalLikes: 0,
      recentPosts: [],
      popularPosts: [],
      familyMembers: [],
      categories: [],
      postStats: {
        totalViews: 0,
        averageRating: 0,
        totalComments: 0,
        mostEngagedPost: "None",
      },
    };
  }, [filters, currentPage]);

  // Enhanced render functions
  const renderPostCard = useCallback(
    (post: Post) => (
      <div
        key={post.id}
        className="relative group cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200"
        onClick={() => onPostSelect?.(post)}
      >
        {/* Post Image */}
        {post.imageUrl && (
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
              {post.title}
            </h3>

            {/* Post Status Badge */}
            {post.isPinned && (
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Pinned
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {post.content}
          </p>

          {/* Post metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Author info */}
          <div className="flex items-center space-x-2 mb-3">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs font-medium">
                  {post.author?.initials || post.author?.name?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">
              {post.author?.name || "Unknown"}
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{post.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>

            {post.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{post.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePostLike(post.id);
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${post.isLiked ? "text-red-500 fill-current" : ""}`}
              />
              <span>{post.isLiked ? "Liked" : "Like"}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Focus comment input
                commentInputRef.current?.focus();
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comment</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePostShare(post);
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Comment input */}
          <div className="mt-3">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePostComment(post.id);
              }}
              disabled={!commentText.trim()}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm py-2 px-3 rounded-md transition-colors"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    ),
    [
      onPostSelect,
      handlePostLike,
      handlePostComment,
      handlePostShare,
      commentText,
    ],
  );

  const renderToolbar = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search posts..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {filteredData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Author Filter */}
            <select
              value={filters.author}
              onChange={(e) => handleFilterChange("author", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Authors</option>
              {filteredData.familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              {(["grid", "list", "masonry"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  className={`p-2 ${
                    filters.viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  } ${mode === "grid" ? "rounded-l-lg" : ""} ${mode === "masonry" ? "rounded-r-lg" : ""}`}
                >
                  {mode === "grid" && <Grid3X3 className="w-4 h-4" />}
                  {mode === "list" && <List className="w-4 h-4" />}
                  {mode === "masonry" && <FileText className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </div>
    ),
    [
      filters,
      filteredData.categories,
      filteredData.familyMembers,
      handleSearch,
      handleFilterChange,
      handleViewModeChange,
    ],
  );

  const renderStats = useCallback(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <DataCard
          title="Total Posts"
          value={filteredData.totalPosts}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          trend="+15%"
          trendDirection="up"
        />
        <DataCard
          title="Categories"
          value={filteredData.totalCategories}
          icon={<Tag className="w-6 h-6 text-green-600" />}
          trend="+8%"
          trendDirection="up"
        />
        <DataCard
          title="Total Likes"
          value={filteredData.totalLikes}
          icon={<Heart className="w-6 h-6 text-red-600" />}
          trend="+22%"
          trendDirection="up"
        />
        <DataCard
          title="Avg Rating"
          value={filteredData.postStats.averageRating}
          icon={<Star className="w-6 h-6 text-yellow-600" />}
          trend="+12%"
          trendDirection="up"
        />
      </div>
    ),
    [filteredData],
  );

  const renderPostGrid = useCallback(() => {
    if (filteredData.posts.length === 0) {
      return (
        <EmptyState
          icon={<FileText className="w-16 h-16 text-gray-400" />}
          title="No posts found"
          description="Try adjusting your filters or create some new posts."
        />
      );
    }

    const gridCols =
      filters.viewMode === "grid"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1";

    return (
      <div className={`grid ${gridCols} gap-6 p-6`}>
        {filteredData.posts.map(renderPostCard)}
      </div>
    );
  }, [filteredData.posts, filters.viewMode, renderPostCard]);

  return (
    <div className="min-h-screen bg-gray-50">
      {renderToolbar()}
      {renderStats()}
      {renderPostGrid()}
    </div>
  );
};

// Enhanced Posts with HOCs
const Posts = withSidebar(
  withFormManagement(
    withDataFetching(PostsComponent, {
      dataKey: "postsData",
      fetchFunction: (props: PostsProps) => {
        return Promise.resolve({
          posts: [],
          totalPosts: 0,
          totalCategories: 0,
          totalLikes: 0,
          recentPosts: [],
          popularPosts: [],
          familyMembers: [],
          categories: [],
          postStats: {
            totalViews: 0,
            averageRating: 0,
            totalComments: 0,
            mostEngagedPost: "None",
          },
        });
      },
      dependencies: ["familyId", "userId"],
      cacheKey: (props: PostsProps) => `posts_data_${props.familyId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load posts
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
      loadingFallback: <LoadingState message="Loading your family posts..." />,
    }),
    {
      formConfig: {
        initialValues: {
          searchQuery: "",
          category: "all",
          author: "all",
          tags: [],
          hasMedia: "all",
          engagement: "all",
        },
        validationSchema: null,
        onSubmit: async (values) => {
          console.log("Form submitted:", values);
        },
      },
    },
  ),
  {
    sidebarConfig: {
      title: "Family Posts",
      description: "Share thoughts, stories, and updates with your family",
      navigation: [
        { label: "All Posts", href: "#", icon: "file-text" },
        { label: "Recent", href: "#", icon: "clock" },
        { label: "Popular", href: "#", icon: "trending-up" },
        { label: "My Posts", href: "#", icon: "user" },
        { label: "Create", href: "#", icon: "plus" },
      ],
    },
  },
);

export default Posts;
