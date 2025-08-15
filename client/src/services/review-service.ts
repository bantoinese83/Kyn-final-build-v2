// Review Service - Handles all review and rating-related data operations
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

export interface Review extends FamilyEntity {
  itemId: string;
  itemType:
    | "product"
    | "service"
    | "recipe"
    | "event"
    | "game"
    | "content"
    | "other";
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isHelpful: boolean;
  helpfulCount: number;
  reportCount: number;
  status: "pending" | "approved" | "rejected" | "flagged" | "hidden";
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ReviewWithDetails extends Review {
  item: {
    id: string;
    name: string;
    type: string;
    image?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  family: {
    id: string;
    name: string;
    avatar?: string;
  };
  helpfulVotes: HelpfulVote[];
  reports: ReviewReport[];
  replies: ReviewReply[];
}

export interface HelpfulVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: "inappropriate" | "spam" | "fake" | "offensive" | "other";
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  authorId: string;
  content: string;
  isAuthorReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  familyId: string;
  authorId: string;
  itemId: string;
  itemType:
    | "product"
    | "service"
    | "recipe"
    | "event"
    | "game"
    | "content"
    | "other";
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
  tags?: string[];
  status?: "pending" | "approved" | "rejected" | "flagged" | "hidden";
  moderationNotes?: string;
  metadata?: Record<string, any>;
}

export interface ReviewFilters extends FamilyFilters {
  itemType?:
    | "product"
    | "service"
    | "recipe"
    | "event"
    | "game"
    | "content"
    | "other";
  rating?: number;
  minRating?: number;
  maxRating?: number;
  status?: "pending" | "approved" | "rejected" | "flagged" | "hidden";
  isVerified?: boolean;
  isHelpful?: boolean;
  dateRange?: "all" | "today" | "week" | "month" | "year";
  tags?: string[];
}

export interface ReviewSearchParams {
  query: string;
  filters?: ReviewFilters;
  sortBy?: "recent" | "rating" | "helpful" | "date" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  reviewsByType: Record<string, number>;
  reviewsByStatus: Record<string, number>;
  verifiedReviews: number;
  helpfulReviews: number;
  recentReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
}

class ReviewService extends FamilyService<
  Review,
  CreateReviewData,
  UpdateReviewData
> {
  protected tableName = "reviews";
  protected selectFields = `
    *,
    author:users!reviews_author_id_fkey(
      id,
      name,
      email,
      avatar,
      initials
    ),
    family:families!reviews_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get reviews with full details for an item
   */
  async getItemReviews(
    itemId: string,
    itemType: string,
    filters?: ReviewFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<ReviewWithDetails[]>> {
    const cacheKey = `item_reviews_${itemId}_${itemType}_${page}_${pageSize}`;
    const cached = cacheGet<ReviewWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getItemReviews",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!reviews_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!reviews_family_id_fkey(
            id,
            name,
            avatar
          ),
          helpful_votes:helpful_votes(
            id,
            user_id,
            is_helpful,
            created_at
          ),
          reports:review_reports(
            id,
            reporter_id,
            reason,
            description,
            status,
            created_at
          ),
          replies:review_replies(
            id,
            author_id,
            content,
            is_author_reply,
            created_at,
            updated_at
          )
        `,
          )
          .eq("item_id", itemId)
          .eq("item_type", itemType);

        // Apply filters
        if (filters?.rating) {
          query = query.eq("rating", filters.rating);
        }
        if (filters?.minRating) {
          query = query.gte("rating", filters.minRating);
        }
        if (filters?.maxRating) {
          query = query.lte("rating", filters.maxRating);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.isVerified !== undefined) {
          query = query.eq("is_verified", filters.isVerified);
        }
        if (filters?.isHelpful !== undefined) {
          query = query.eq("is_helpful", filters.isHelpful);
        }
        if (filters?.tags && filters.tags.length > 0) {
          query = query.overlaps("tags", filters.tags);
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte("created_at", startDate.toISOString());
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const reviews = (data || []) as any[];

        // Transform and enrich reviews
        const enrichedReviews = reviews.map((review) => ({
          ...review,
          helpfulVotes: review.helpful_votes || [],
          reports: review.reports || [],
          replies: review.replies || [],
        })) as ReviewWithDetails[];

        cacheSet(cacheKey, enrichedReviews, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedReviews, error: null };
      },
      "custom",
    );
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(
    userId: string,
    familyId: string,
    filters?: ReviewFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<ReviewWithDetails[]>> {
    const cacheKey = `user_reviews_${userId}_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<ReviewWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserReviews",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!reviews_author_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          ),
          family:families!reviews_family_id_fkey(
            id,
            name,
            avatar
          ),
          helpful_votes:helpful_votes(
            id,
            user_id,
            is_helpful,
            created_at
          ),
          reports:review_reports(
            id,
            reporter_id,
            reason,
            description,
            status,
            created_at
          ),
          replies:review_replies(
            id,
            author_id,
            content,
            is_author_reply,
            created_at,
            updated_at
          )
        `,
          )
          .eq("author_id", userId)
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.itemType) {
          query = query.eq("item_type", filters.itemType);
        }
        if (filters?.rating) {
          query = query.eq("rating", filters.rating);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const reviews = (data || []) as any[];

        // Transform and enrich reviews
        const enrichedReviews = reviews.map((review) => ({
          ...review,
          helpfulVotes: review.helpful_votes || [],
          reports: review.reports || [],
          replies: review.replies || [],
        })) as ReviewWithDetails[];

        cacheSet(cacheKey, enrichedReviews, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedReviews, error: null };
      },
      "custom",
    );
  }

  /**
   * Create a new review
   */
  async createReview(
    reviewData: CreateReviewData,
  ): Promise<ServiceResponse<Review>> {
    return measureAsync(
      "createReview",
      async () => {
        // Check if user has already reviewed this item
        const { data: existingReview, error: checkError } = await supabase
          .from(this.tableName)
          .select("id")
          .eq("author_id", reviewData.authorId)
          .eq("item_id", reviewData.itemData)
          .eq("item_type", reviewData.itemType)
          .single();

        if (existingReview) {
          return {
            success: false,
            error: "You have already reviewed this item",
            data: null,
          };
        }

        // Create the review
        const { data: review, error } = await supabase
          .from(this.tableName)
          .insert({
            ...reviewData,
            is_verified: false,
            is_helpful: false,
            helpful_count: 0,
            report_count: 0,
            status: "pending",
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

        return {
          success: true,
          data: review as unknown as Review,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Update review helpful status
   */
  async markReviewHelpful(
    reviewId: string,
    userId: string,
    isHelpful: boolean,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "markReviewHelpful",
      async () => {
        // Check if user has already voted
        const { data: existingVote, error: checkError } = await supabase
          .from("helpful_votes")
          .select("id, is_helpful")
          .eq("review_id", reviewId)
          .eq("user_id", userId)
          .single();

        if (existingVote) {
          if (existingVote.is_helpful === isHelpful) {
            // Remove vote if same status
            const { error: deleteError } = await supabase
              .from("helpful_votes")
              .delete()
              .eq("id", existingVote.id);

            if (deleteError) {
              return { success: false, error: deleteError.message, data: null };
            }

            // Update review helpful count
            const { error: updateError } = await supabase
              .from(this.tableName)
              .update({
                helpful_count: supabase.rpc("decrement", {
                  table_name: this.tableName,
                  column_name: "helpful_count",
                  id: reviewId,
                }),
              })
              .eq("id", reviewId);

            if (updateError) {
              return { success: false, error: updateError.message, data: null };
            }
          } else {
            // Update existing vote
            const { error: updateVoteError } = await supabase
              .from("helpful_votes")
              .update({ is_helpful: isHelpful })
              .eq("id", existingVote.id);

            if (updateVoteError) {
              return {
                success: false,
                error: updateVoteError.message,
                data: null,
              };
            }
          }
        } else {
          // Create new vote
          const { error: createVoteError } = await supabase
            .from("helpful_votes")
            .insert({
              review_id: reviewId,
              user_id: userId,
              is_helpful: isHelpful,
              created_at: new Date().toISOString(),
            });

          if (createVoteError) {
            return {
              success: false,
              error: createVoteError.message,
              data: null,
            };
          }

          // Update review helpful count
          const { error: updateError } = await supabase
            .from(this.tableName)
            .update({
              helpful_count: supabase.rpc("increment", {
                table_name: this.tableName,
                column_name: "helpful_count",
                id: reviewId,
              }),
            })
            .eq("id", reviewId);

          if (updateError) {
            return { success: false, error: updateError.message, data: null };
          }
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Report a review
   */
  async reportReview(
    reviewId: string,
    reporterId: string,
    reason: string,
    description: string,
  ): Promise<ServiceResponse<ReviewReport>> {
    return measureAsync(
      "reportReview",
      async () => {
        // Create report
        const { data: report, error } = await supabase
          .from("review_reports")
          .insert({
            review_id: reviewId,
            reporter_id: reporterId,
            reason: reason as any,
            description,
            status: "pending",
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Update review report count
        await supabase
          .from(this.tableName)
          .update({
            report_count: supabase.rpc("increment", {
              table_name: this.tableName,
              column_name: "report_count",
              id: reviewId,
            }),
          })
          .eq("id", reviewId);

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: report as unknown as ReviewReport,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Add reply to a review
   */
  async addReviewReply(
    reviewId: string,
    authorId: string,
    content: string,
    isAuthorReply: boolean = false,
  ): Promise<ServiceResponse<ReviewReply>> {
    return measureAsync(
      "addReviewReply",
      async () => {
        const { data: reply, error } = await supabase
          .from("review_replies")
          .insert({
            review_id: reviewId,
            author_id: authorId,
            content,
            is_author_reply: isAuthorReply,
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

        return {
          success: true,
          data: reply as unknown as ReviewReply,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Moderate a review
   */
  async moderateReview(
    reviewId: string,
    moderatorId: string,
    status: string,
    notes?: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "moderateReview",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({
            status: status,
            moderation_notes: notes,
            moderated_by: moderatorId,
            moderated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", reviewId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Get review statistics for a family
   */
  async getReviewStats(
    familyId: string,
  ): Promise<ServiceResponse<ReviewStats>> {
    const cacheKey = `review_stats_${familyId}`;
    const cached = cacheGet<ReviewStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getReviewStats",
      async () => {
        const { data: reviews, error } = await supabase
          .from(this.tableName)
          .select(
            "rating, item_type, status, is_verified, is_helpful, created_at",
          )
          .eq("family_id", familyId);

        if (error) {
          return {
            success: false,
            error: error.message,
            data: null,
          };
        }

        const reviewList = reviews || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: ReviewStats = {
          totalReviews: reviewList.length,
          averageRating:
            reviewList.length > 0
              ? reviewList.reduce((sum, r) => sum + r.rating, 0) /
                reviewList.length
              : 0,
          ratingDistribution: reviewList.reduce(
            (acc, r) => {
              const rating = r.rating;
              acc[rating] = (acc[rating] || 0) + 1;
              return acc;
            },
            {} as Record<number, number>,
          ),
          reviewsByType: reviewList.reduce(
            (acc, r) => {
              const type = r.item_type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          reviewsByStatus: reviewList.reduce(
            (acc, r) => {
              const status = r.status || "pending";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          verifiedReviews: reviewList.filter((r) => r.is_verified).length,
          helpfulReviews: reviewList.filter((r) => r.is_helpful).length,
          recentReviews: reviewList.filter(
            (r) => new Date(r.created_at) >= thirtyDaysAgo,
          ).length,
          pendingReviews: reviewList.filter((r) => r.status === "pending")
            .length,
          flaggedReviews: reviewList.filter((r) => r.status === "flagged")
            .length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Search reviews by text content and filters
   */
  async searchReviews(
    familyId: string,
    searchParams: ReviewSearchParams,
  ): Promise<ServiceResponse<Review[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `review_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Review[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchReviews",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

        // Apply filters
        if (filters?.itemType) {
          queryBuilder = queryBuilder.eq("item_type", filters.itemType);
        }
        if (filters?.rating) {
          queryBuilder = queryBuilder.eq("rating", filters.rating);
        }
        if (filters?.minRating) {
          queryBuilder = queryBuilder.gte("rating", filters.minRating);
        }
        if (filters?.maxRating) {
          queryBuilder = queryBuilder.lte("rating", filters.maxRating);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.isVerified !== undefined) {
          queryBuilder = queryBuilder.eq("is_verified", filters.isVerified);
        }
        if (filters?.isHelpful !== undefined) {
          queryBuilder = queryBuilder.eq("is_helpful", filters.isHelpful);
        }
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps("tags", filters.tags);
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          queryBuilder = queryBuilder.gte(
            "created_at",
            startDate.toISOString(),
          );
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "rating":
            orderBy = "rating";
            break;
          case "helpful":
            orderBy = "helpful_count";
            break;
          case "date":
            orderBy = "created_at";
            break;
          case "title":
            orderBy = "title";
            break;
          default:
            orderBy = "created_at";
        }

        const { data, error } = await queryBuilder.order(orderBy, {
          ascending: sortOrder === "asc",
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const reviews = (data || []) as unknown as Review[];
        cacheSet(cacheKey, reviews, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: reviews, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for reviews
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`reviews_family_${familyId}`),
      new RegExp(`item_reviews_`),
      new RegExp(`user_reviews_`),
      new RegExp(`review_stats_${familyId}`),
      new RegExp(`review_search_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const reviewService = new ReviewService();

// Legacy export for backward compatibility
export const reviewsService = reviewService;
