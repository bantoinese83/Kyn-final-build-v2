// Polls Service - Handles all poll-related data operations
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

export interface Poll extends FamilyEntity {
  question: string;
  description?: string;
  options: PollOption[];
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  allowComments?: boolean;
  endDate?: string;
  isActive?: boolean;
  totalVotes?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  description?: string;
  imageUrl?: string;
  voteCount?: number;
  percentage?: number;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface PollWithStats extends Poll {
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  userVote?: PollVote;
  totalVotes: number;
  optionsWithStats: (PollOption & { percentage: number; isWinning: boolean })[];
  isExpired: boolean;
  timeRemaining?: string;
}

export interface CreatePollData {
  question: string;
  description?: string;
  familyId: string;
  authorId: string;
  options: Omit<PollOption, "id" | "pollId" | "voteCount" | "percentage">[];
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  allowComments?: boolean;
  endDate?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePollData {
  question?: string;
  description?: string;
  options?: PollOption[];
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  allowComments?: boolean;
  endDate?: string;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

export interface PollFilters extends FamilyFilters {
  category?: string;
  isActive?: boolean;
  hasEnded?: boolean;
  allowComments?: boolean;
  tags?: string[];
  dateRange?: "all" | "today" | "week" | "month";
}

export interface PollSearchParams {
  query: string;
  filters?: PollFilters;
  sortBy?: "recent" | "popular" | "ending_soon" | "most_voted";
  sortOrder?: "asc" | "desc";
}

class PollsService extends FamilyService<Poll, CreatePollData, UpdatePollData> {
  protected tableName = "polls";
  protected selectFields = `
    *,
    author:users!polls_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    options:poll_options(
      id,
      text,
      description,
      image_url,
      vote_count
    )
  `;

  /**
   * Get polls with full details and statistics for a family
   */
  async getPollsWithStats(
    familyId: string,
    filters?: PollFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<PollWithStats[]>> {
    const cacheKey = `polls_with_stats_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<PollWithStats[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPollsWithStats",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const polls = (data || []) as unknown as PollWithStats[];

        // Transform and enrich polls with additional data
        const enrichedPolls = await Promise.all(
          polls.map(async (poll) => {
            const totalVotes =
              poll.options?.reduce(
                (sum, option) => sum + (option.voteCount || 0),
                0,
              ) || 0;
            const optionsWithStats = this.calculateOptionStats(
              poll.options || [],
              totalVotes,
            );
            const isExpired = poll.endDate
              ? new Date(poll.endDate) < new Date()
              : false;
            const timeRemaining = this.calculateTimeRemaining(poll.endDate);

            return {
              ...poll,
              totalVotes,
              optionsWithStats,
              isExpired,
              timeRemaining,
            };
          }),
        );

        cacheSet(cacheKey, enrichedPolls, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedPolls, error: null };
      },
      "custom",
    );
  }

  /**
   * Get active polls for a family
   */
  async getActivePolls(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<PollWithStats[]>> {
    const cacheKey = `active_polls_${familyId}_${limit}`;
    const cached = cacheGet<PollWithStats[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getActivePolls",
      async () => {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("is_active", true)
          .or(`end_date.is.null,end_date.gt.${now}`)
          .order("end_date", { ascending: true })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const polls = (data || []) as unknown as PollWithStats[];

        // Transform and enrich polls
        const enrichedPolls = polls.map((poll) => {
          const totalVotes =
            poll.options?.reduce(
              (sum, option) => sum + (option.voteCount || 0),
              0,
            ) || 0;
          const optionsWithStats = this.calculateOptionStats(
            poll.options || [],
            totalVotes,
          );
          const timeRemaining = this.calculateTimeRemaining(poll.endDate);

          return {
            ...poll,
            totalVotes,
            optionsWithStats,
            isExpired: false,
            timeRemaining,
          };
        });

        cacheSet(cacheKey, enrichedPolls, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: enrichedPolls, error: null };
      },
      "custom",
    );
  }

  /**
   * Search polls by text content and filters
   */
  async searchPolls(
    familyId: string,
    searchParams: PollSearchParams,
  ): Promise<ServiceResponse<Poll[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `polls_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Poll[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchPolls",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `question.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`,
          );

        // Apply filters
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.isActive !== undefined) {
          queryBuilder = queryBuilder.eq("is_active", filters.isActive);
        }
        if (filters?.allowComments !== undefined) {
          queryBuilder = queryBuilder.eq(
            "allow_comments",
            filters.allowComments,
          );
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
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
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
          case "popular":
            orderBy = "total_votes";
            break;
          case "ending_soon":
            orderBy = "end_date";
            break;
          case "most_voted":
            orderBy = "total_votes";
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

        const polls = (data || []) as unknown as Poll[];
        cacheSet(cacheKey, polls, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: polls, error: null };
      },
      "custom",
    );
  }

  /**
   * Get polls by category
   */
  async getPollsByCategory(
    familyId: string,
    category: string,
    filters?: Omit<PollFilters, "category">,
  ): Promise<ServiceResponse<Poll[]>> {
    const cacheKey = `polls_category_${familyId}_${category}`;
    const cached = cacheGet<Poll[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPollsByCategory",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("category", category);

        // Apply additional filters
        if (filters?.isActive !== undefined) {
          query = query.eq("is_active", filters.isActive);
        }
        if (filters?.allowComments !== undefined) {
          query = query.eq("allow_comments", filters.allowComments);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const polls = (data || []) as unknown as Poll[];
        cacheSet(cacheKey, polls, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: polls, error: null };
      },
      "custom",
    );
  }

  /**
   * Vote on a poll
   */
  async voteOnPoll(
    pollId: string,
    optionId: string,
    userId: string,
  ): Promise<ServiceResponse<PollVote>> {
    return measureAsync(
      "voteOnPoll",
      async () => {
        // Check if user already voted on this poll
        const existingVote = await this.getUserVote(pollId, userId);
        if (existingVote.success && existingVote.data) {
          return {
            success: false,
            error: "User has already voted on this poll",
            data: null,
          };
        }

        const { data, error } = await supabase
          .from("poll_votes")
          .insert({
            poll_id: pollId,
            option_id: optionId,
            user_id: userId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Update option vote count
        await this.updateOptionVoteCount(optionId);

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as PollVote,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get user's vote on a specific poll
   */
  async getUserVote(
    pollId: string,
    userId: string,
  ): Promise<ServiceResponse<PollVote | null>> {
    const cacheKey = `user_vote_${pollId}_${userId}`;
    const cached = cacheGet<PollVote | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserVote",
      async () => {
        const { data, error } = await supabase
          .from("poll_votes")
          .select(
            `
          *,
          user:users!poll_votes_user_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("poll_id", pollId)
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          return { success: false, error: error.message, data: null };
        }

        const vote = data ? (data as unknown as PollVote) : null;
        cacheSet(cacheKey, vote, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: vote, error: null };
      },
      "custom",
    );
  }

  /**
   * Get poll results with detailed statistics
   */
  async getPollResults(pollId: string): Promise<
    ServiceResponse<{
      poll: Poll;
      totalVotes: number;
      optionsWithStats: (PollOption & {
        percentage: number;
        isWinning: boolean;
      })[];
      participationRate: number;
      timeRemaining?: string;
    }>
  > {
    const cacheKey = `poll_results_${pollId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPollResults",
      async () => {
        const poll = await this.getById(pollId);
        if (!poll.success || !poll.data) {
          return { success: false, error: "Poll not found", data: null };
        }

        const pollData = poll.data;
        const totalVotes =
          pollData.options?.reduce(
            (sum, option) => sum + (option.voteCount || 0),
            0,
          ) || 0;
        const optionsWithStats = this.calculateOptionStats(
          pollData.options || [],
          totalVotes,
        );
        const timeRemaining = this.calculateTimeRemaining(pollData.endDate);

        // Calculate participation rate (this would need family member count)
        const participationRate = 0; // Placeholder

        const results = {
          poll: pollData,
          totalVotes,
          optionsWithStats,
          participationRate,
          timeRemaining,
        };

        cacheSet(cacheKey, results, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: results, error: null };
      },
      "custom",
    );
  }

  /**
   * Get polls ending soon
   */
  async getPollsEndingSoon(
    familyId: string,
    hours: number = 24,
  ): Promise<ServiceResponse<Poll[]>> {
    const cacheKey = `polls_ending_soon_${familyId}_${hours}`;
    const cached = cacheGet<Poll[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPollsEndingSoon",
      async () => {
        const now = new Date();
        const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("is_active", true)
          .not("end_date", "is", null)
          .gte("end_date", now.toISOString())
          .lte("end_date", endTime.toISOString())
          .order("end_date", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const polls = (data || []) as unknown as Poll[];
        cacheSet(cacheKey, polls, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: polls, error: null };
      },
      "custom",
    );
  }

  /**
   * Get poll statistics for a family
   */
  async getPollStats(familyId: string): Promise<
    ServiceResponse<{
      totalPolls: number;
      activePolls: number;
      completedPolls: number;
      pollsByCategory: Record<string, number>;
      totalVotes: number;
      averageParticipation: number;
      mostPopularCategory: string;
    }>
  > {
    const cacheKey = `poll_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPollStats",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select("category, is_active, end_date, total_votes")
          .eq("family_id", familyId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const polls = data || [];
        const now = new Date();

        const stats = {
          totalPolls: polls.length,
          activePolls: polls.filter(
            (p) => p.is_active && (!p.end_date || new Date(p.end_date) > now),
          ).length,
          completedPolls: polls.filter(
            (p) => p.end_date && new Date(p.end_date) <= now,
          ).length,
          pollsByCategory: polls.reduce(
            (acc, p) => {
              const category = p.category || "uncategorized";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          totalVotes: polls.reduce((sum, p) => sum + (p.total_votes || 0), 0),
          averageParticipation:
            polls.length > 0
              ? polls.reduce((sum, p) => sum + (p.total_votes || 0), 0) /
                polls.length
              : 0,
          mostPopularCategory: this.getMostPopularCategory(polls),
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Calculate option statistics
   */
  private calculateOptionStats(
    options: PollOption[],
    totalVotes: number,
  ): (PollOption & { percentage: number; isWinning: boolean })[] {
    if (totalVotes === 0) {
      return options.map((option) => ({
        ...option,
        percentage: 0,
        isWinning: false,
      }));
    }

    const maxVotes = Math.max(...options.map((o) => o.voteCount || 0));

    return options.map((option) => ({
      ...option,
      percentage: Math.round(((option.voteCount || 0) / totalVotes) * 100),
      isWinning: (option.voteCount || 0) === maxVotes,
    }));
  }

  /**
   * Calculate time remaining until poll ends
   */
  private calculateTimeRemaining(endDate?: string): string | undefined {
    if (!endDate) return undefined;

    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Less than 1h remaining";
  }

  /**
   * Get most popular category
   */
  private getMostPopularCategory(polls: any[]): string {
    const categoryCounts: Record<string, number> = {};

    polls.forEach((poll) => {
      const category = poll.category || "uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    let mostPopular = "uncategorized";
    let maxCount = 0;

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostPopular = category;
      }
    });

    return mostPopular;
  }

  /**
   * Update option vote count
   */
  private async updateOptionVoteCount(optionId: string): Promise<void> {
    const { data: votes } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("option_id", optionId);

    const voteCount = votes?.length || 0;

    await supabase
      .from("poll_options")
      .update({ vote_count: voteCount })
      .eq("id", optionId);
  }

  /**
   * Invalidate cache for polls
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`polls_family_${familyId}`),
      new RegExp(`polls_with_stats_${familyId}`),
      new RegExp(`active_polls_${familyId}`),
      new RegExp(`polls_search_${familyId}`),
      new RegExp(`polls_category_${familyId}`),
      new RegExp(`polls_ending_soon_${familyId}`),
      new RegExp(`poll_stats_${familyId}`),
      new RegExp(`poll_results_`),
      new RegExp(`user_vote_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const pollService = new PollsService();

// Legacy export for backward compatibility
export const pollsService = pollService;
