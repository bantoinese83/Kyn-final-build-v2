// Post Types - Centralized type definitions for posts and feed
// Provides consistent interfaces across all post-related components

export interface Post {
  id: string;
  title?: string;
  content: string;
  author: PostAuthor;
  images?: string[];
  videos?: string[];
  documents?: PostDocument[];
  tags?: string[];
  location?: string;
  isPublic: boolean;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: PostComment[];
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: PostMetadata;
}

export interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  isVerified: boolean;
  role?: "admin" | "moderator" | "member";
}

export interface PostComment {
  id: string;
  content: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked?: boolean;
  replies?: PostComment[];
  parentId?: string;
}

export interface PostDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  thumbnail?: string;
}

export interface PostMetadata {
  contentType: "text" | "image" | "video" | "document" | "mixed";
  language?: string;
  sentiment?: "positive" | "negative" | "neutral";
  category?: string;
  priority?: "low" | "medium" | "high";
  familyEvent?: string;
  weather?: string;
  mood?: string;
}

export interface CreatePostData {
  title?: string;
  content: string;
  images?: File[];
  videos?: File[];
  documents?: File[];
  tags?: string[];
  location?: string;
  isPublic: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Partial<PostMetadata>;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface PostFilters {
  contentType?: "all" | "text" | "image" | "video" | "document";
  author?: string;
  tags?: string[];
  dateRange?: "all" | "today" | "week" | "month" | "year";
  location?: string;
  hasLikes?: boolean;
  hasComments?: boolean;
  hasViews?: boolean;
  familyMembers?: string[];
  isPinned?: boolean;
  isPublic?: boolean;
}

export type PostSortOption =
  | "recent"
  | "popular"
  | "trending"
  | "most-liked"
  | "most-commented"
  | "most-viewed";

export interface PostStats {
  totalPosts: number;
  postsByType: Record<string, number>;
  postsByAuthor: Record<string, number>;
  postsByDate: Record<string, number>;
  averageEngagement: number;
  topTags: Array<{ tag: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  createdAt: string;
  user: PostAuthor;
}

export interface PostShare {
  id: string;
  postId: string;
  userId: string;
  platform: "family" | "external" | "copy-link";
  createdAt: string;
  user: PostAuthor;
}

export interface PostReport {
  id: string;
  postId: string;
  userId: string;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user: PostAuthor;
}

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostCollection {
  id: string;
  name: string;
  description?: string;
  posts: Post[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostAnalytics {
  postId: string;
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  engagementRate: number;
  reach: number;
  impressions: number;
  timeSpent: number;
  bounceRate: number;
  date: string;
}

export interface PostNotification {
  id: string;
  postId: string;
  userId: string;
  type: "like" | "comment" | "share" | "mention" | "reply";
  message: string;
  isRead: boolean;
  createdAt: string;
  post: Post;
}

export interface PostSearchResult {
  post: Post;
  relevance: number;
  matchedFields: string[];
  highlights: string[];
}

export interface PostModeration {
  id: string;
  postId: string;
  moderatorId: string;
  action: "approve" | "reject" | "flag" | "delete";
  reason?: string;
  notes?: string;
  createdAt: string;
  moderator: PostAuthor;
}

export interface PostCollaboration {
  id: string;
  postId: string;
  collaborators: Array<{
    userId: string;
    role: "author" | "editor" | "reviewer";
    permissions: string[];
  }>;
  sharedWith: Array<{
    userId: string;
    accessLevel: "view" | "edit" | "manage";
  }>;
}

export interface PostSchedule {
  id: string;
  postId: string;
  scheduledAt: string;
  timezone: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  endDate?: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface PostEngagement {
  postId: string;
  totalEngagement: number;
  engagementRate: number;
  topEngagers: PostAuthor[];
  engagementTrend: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  peakEngagementTime: string;
  averageEngagementTime: number;
}

export interface PostAccessibility {
  postId: string;
  hasAltText: boolean;
  hasCaptions: boolean;
  hasTranscript: boolean;
  isScreenReaderFriendly: boolean;
  language: string;
  readingLevel: "basic" | "intermediate" | "advanced";
  contentWarnings?: string[];
}
