// Posts Service - Handles all post-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface Post extends FamilyEntity {
  content: string;
  title?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments?: any[];
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
    isVerified?: boolean;
    role?: string;
  };
}

export interface CreatePostData {
  content: string;
  title?: string;
  familyId: string;
  authorId: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePostData {
  content?: string;
  title?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  tags?: string[];
  location?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface PostFilters extends FamilyFilters {
  contentType?: "all" | "text" | "image" | "video" | "document";
  isPinned?: boolean;
  hasComments?: boolean;
  dateRange?: "all" | "today" | "week" | "month";
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCommentData {
  content?: string;
  metadata?: Record<string, any>;
}

class PostsService extends FamilyService<Post, CreatePostData, UpdatePostData> {
  protected tableName = "posts";
  protected selectFields = `
    *,
    author:users!posts_authorId_fkey(
      id,
      name,
      avatar,
      initials,
      isVerified,
      role
    ),
    comments:post_comments(
      id,
      content,
      author_id,
      created_at,
      updated_at
    )
  `;

  /**
   * Get posts with author information for a family
   */
  async getPostsWithAuthor(
    familyId: string,
    filters?: PostFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<PostWithAuthor[]>> {
    const cacheKey = `posts_with_author_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<PostWithAuthor[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPostsWithAuthor",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("familyId", familyId)
          .order("createdAt", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const posts = (data || []) as unknown as PostWithAuthor[];
        cacheSet(cacheKey, posts, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: posts, error: null };
      },
      "custom",
    );
  }

  /**
   * Get a single post by ID with author information
   */
  async getPostById(id: string): Promise<ServiceResponse<PostWithAuthor>> {
    const cacheKey = `post_${id}`;
    const cached = cacheGet<PostWithAuthor>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPostById",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("id", id)
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const post = data as unknown as PostWithAuthor;
        cacheSet(cacheKey, post, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: post, error: null };
      },
      "custom",
    );
  }

  /**
   * Get posts by content type
   */
  async getPostsByType(
    familyId: string,
    contentType: "text" | "image" | "video" | "document",
    filters?: Omit<PostFilters, "contentType">,
  ): Promise<ServiceResponse<Post[]>> {
    const cacheKey = `posts_type_${familyId}_${contentType}`;
    const cached = cacheGet<Post[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPostsByType",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("familyId", familyId);

        // Apply content type filter
        switch (contentType) {
          case "text":
            query = query
              .is("images", null)
              .is("videos", null)
              .is("documents", null);
            break;
          case "image":
            query = query.not("images", "is", null);
            break;
          case "video":
            query = query.not("videos", "is", null);
            break;
          case "document":
            query = query.not("documents", "is", null);
            break;
        }

        // Apply additional filters
        if (filters?.authorId) {
          query = query.eq("authorId", filters.authorId);
        }
        if (filters?.isPublic !== undefined) {
          query = query.eq("isPublic", filters.isPublic);
        }
        if (filters?.tags && filters.tags.length > 0) {
          query = query.overlaps("tags", filters.tags);
        }

        const { data, error } = await query.order("createdAt", {
          ascending: false,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const posts = (data || []) as unknown as Post[];
        cacheSet(cacheKey, posts, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: posts, error: null };
      },
      "custom",
    );
  }

  /**
   * Search posts by text content
   */
  async searchPosts(
    familyId: string,
    searchTerm: string,
    filters?: PostFilters,
  ): Promise<ServiceResponse<Post[]>> {
    const cacheKey = `posts_search_${familyId}_${searchTerm}`;
    const cached = cacheGet<Post[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchPosts",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("familyId", familyId)
          .or(
            `content.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`,
          )
          .order("createdAt", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const posts = (data || []) as unknown as Post[];
        cacheSet(cacheKey, posts, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: posts, error: null };
      },
      "custom",
    );
  }

  /**
   * Get pinned posts for a family
   */
  async getPinnedPosts(familyId: string): Promise<ServiceResponse<Post[]>> {
    const cacheKey = `pinned_posts_${familyId}`;
    const cached = cacheGet<Post[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPinnedPosts",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("familyId", familyId)
          .eq("isPinned", true)
          .order("createdAt", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const posts = (data || []) as unknown as Post[];
        cacheSet(cacheKey, posts, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: posts, error: null };
      },
      "custom",
    );
  }

  /**
   * Get post statistics for a family
   */
  async getPostStats(familyId: string): Promise<
    ServiceResponse<{
      totalPosts: number;
      totalComments: number;
      totalLikes: number;
      postsByType: Record<string, number>;
      recentActivity: number;
    }>
  > {
    const cacheKey = `post_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPostStats",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            "images, videos, documents, likeCount, commentCount, createdAt",
          )
          .eq("familyId", familyId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const posts = data || [];

        const stats = {
          totalPosts: posts.length,
          totalComments: posts.reduce(
            (sum, p) => sum + (p.commentCount || 0),
            0,
          ),
          totalLikes: posts.reduce((sum, p) => sum + (p.likeCount || 0), 0),
          postsByType: {
            text: posts.filter(
              (p) =>
                !p.images?.length && !p.videos?.length && !p.documents?.length,
            ).length,
            image: posts.filter((p) => p.images?.length > 0).length,
            video: posts.filter((p) => p.videos?.length > 0).length,
            document: posts.filter((p) => p.documents?.length > 0).length,
          },
          recentActivity: posts.filter((p) => {
            const postDate = new Date(p.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return postDate > weekAgo;
          }).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Like or unlike a post
   */
  async likePost(
    postId: string,
    userId: string,
  ): Promise<ServiceResponse<{ liked: boolean; likeCount: number }>> {
    return measureAsync(
      "likePost",
      async () => {
        // This would typically involve a separate likes table
        // For now, we'll simulate the functionality
        const post = await this.getById(postId);
        if (!post.success || !post.data) {
          return { success: false, error: "Post not found", data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: { liked: true, likeCount: (post.data.likeCount || 0) + 1 },
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string,
    commentData: CreateCommentData,
  ): Promise<ServiceResponse<any>> {
    return measureAsync(
      "addComment",
      async () => {
        const { data, error } = await supabase
          .from("post_comments")
          .insert({
            post_id: postId,
            content: commentData.content,
            author_id: commentData.authorId,
            parent_id: commentData.parentId,
            metadata: commentData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for posts
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`posts_family_${familyId}`),
      new RegExp(`posts_with_author_${familyId}`),
      new RegExp(`posts_type_${familyId}`),
      new RegExp(`posts_search_${familyId}`),
      new RegExp(`pinned_posts_${familyId}`),
      new RegExp(`post_stats_${familyId}`),
      new RegExp(`post_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const postService = new PostsService();

// Legacy export for backward compatibility
export const postsService = postService;
