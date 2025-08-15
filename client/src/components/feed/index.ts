// Feed Components Index
// Centralized exports for all feed-related components

export { FeedItem } from "./FeedItem";
export { FeedActions } from "./FeedActions";
export { FeedFilters } from "./FeedFilters";

// Export types
export type {
  Post,
  PostAuthor,
  PostComment,
  PostDocument,
  PostMetadata,
  CreatePostData,
  UpdatePostData,
  PostFilters,
  PostSortOption,
  PostStats,
  PostReaction,
  PostShare,
  PostReport,
  PostTemplate,
  PostCollection,
  PostAnalytics,
  PostNotification,
  PostSearchResult,
  PostModeration,
  PostCollaboration,
  PostSchedule,
  PostEngagement,
  PostAccessibility,
} from "@/types/posts";

// Export feed-specific types
export type {
  FeedFilters as FeedFiltersType,
  FeedSortOption,
} from "./FeedActions";
