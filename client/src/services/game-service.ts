// Games Service - Handles all game-related data operations
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

export interface FamilyGame extends FamilyEntity {
  title: string;
  description?: string;
  gameType:
    | "board"
    | "card"
    | "puzzle"
    | "trivia"
    | "physical"
    | "digital"
    | "other";
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in minutes
  difficulty: "easy" | "medium" | "hard";
  ageRange: string;
  category?: string;
  tags?: string[];
  images?: string[];
  rules?: string;
  materials?: string[];
  isActive?: boolean;
  playCount?: number;
  averageRating?: number;
  metadata?: Record<string, any>;
}

export interface GamePlay extends FamilyEntity {
  gameId: string;
  players: GamePlayer[];
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  winner?: string;
  scores?: Record<string, number>;
  notes?: string;
  photos?: string[];
  metadata?: Record<string, any>;
}

export interface GamePlayer {
  id: string;
  userId: string;
  gamePlayId: string;
  playerName: string;
  score?: number;
  rank?: number;
  isWinner?: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface GameWithAuthor extends FamilyGame {
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  recentPlays: GamePlay[];
  totalPlays: number;
  averageDuration: number;
}

export interface GameStats {
  totalGames: number;
  totalPlays: number;
  gamesByType: Record<string, number>;
  gamesByDifficulty: Record<string, number>;
  mostPlayedGames: Array<{ title: string; playCount: number }>;
  averagePlayDuration: number;
  totalPlayers: number;
}

export interface CreateGameData {
  title: string;
  description?: string;
  familyId: string;
  authorId: string;
  gameType:
    | "board"
    | "card"
    | "puzzle"
    | "trivia"
    | "physical"
    | "digital"
    | "other";
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number;
  difficulty: "easy" | "medium" | "hard";
  ageRange: string;
  category?: string;
  tags?: string[];
  images?: string[];
  rules?: string;
  materials?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateGameData {
  title?: string;
  description?: string;
  gameType?:
    | "board"
    | "card"
    | "puzzle"
    | "trivia"
    | "physical"
    | "digital"
    | "other";
  minPlayers?: number;
  maxPlayers?: number;
  estimatedDuration?: number;
  difficulty?: "easy" | "medium" | "hard";
  ageRange?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  rules?: string;
  materials?: string[];
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateGamePlayData {
  gameId: string;
  familyId: string;
  authorId: string;
  players: Omit<GamePlayer, "id" | "gamePlayId">[];
  startTime: string;
  notes?: string;
  photos?: string[];
  metadata?: Record<string, any>;
}

export interface GameFilters extends FamilyFilters {
  gameType?:
    | "board"
    | "card"
    | "puzzle"
    | "trivia"
    | "physical"
    | "digital"
    | "other";
  difficulty?: "easy" | "medium" | "hard";
  minPlayers?: number;
  maxPlayers?: number;
  maxDuration?: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface GameSearchParams {
  query: string;
  filters?: GameFilters;
  sortBy?: "recent" | "popular" | "rating" | "duration" | "name";
  sortOrder?: "asc" | "desc";
}

class GamesService extends FamilyService<
  FamilyGame,
  CreateGameData,
  UpdateGameData
> {
  protected tableName = "family_games";
  protected selectFields = `
    *,
    author:users!family_games_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    plays:game_plays(
      id,
      start_time,
      end_time,
      duration,
      winner
    )
  `;

  /**
   * Get games with full details and author information for a family
   */
  async getGamesWithAuthor(
    familyId: string,
    filters?: GameFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<GameWithAuthor[]>> {
    const cacheKey = `games_with_author_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<GameWithAuthor[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getGamesWithAuthor",
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

        const games = (data || []) as unknown as GameWithAuthor[];

        // Transform and enrich games with additional data
        const enrichedGames = await Promise.all(
          games.map(async (game) => {
            const recentPlays = await this.getRecentGamePlays(game.id, 5);
            const totalPlays = await this.getGamePlayCount(game.id);
            const averageDuration = await this.getAverageGameDuration(game.id);

            return {
              ...game,
              recentPlays: recentPlays.success ? recentPlays.data || [] : [],
              totalPlays: totalPlays.success ? totalPlays.data || 0 : 0,
              averageDuration: averageDuration.success
                ? averageDuration.data || 0
                : 0,
            };
          }),
        );

        cacheSet(cacheKey, enrichedGames, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedGames, error: null };
      },
      "custom",
    );
  }

  /**
   * Search games by text content and filters
   */
  async searchGames(
    familyId: string,
    searchParams: GameSearchParams,
  ): Promise<ServiceResponse<FamilyGame[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `games_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<FamilyGame[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchGames",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`,
          );

        // Apply filters
        if (filters?.gameType) {
          queryBuilder = queryBuilder.eq("game_type", filters.gameType);
        }
        if (filters?.difficulty) {
          queryBuilder = queryBuilder.eq("difficulty", filters.difficulty);
        }
        if (filters?.minPlayers) {
          queryBuilder = queryBuilder.gte("min_players", filters.minPlayers);
        }
        if (filters?.maxPlayers) {
          queryBuilder = queryBuilder.lte("max_players", filters.maxPlayers);
        }
        if (filters?.maxDuration) {
          queryBuilder = queryBuilder.lte(
            "estimated_duration",
            filters.maxDuration,
          );
        }
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.isActive !== undefined) {
          queryBuilder = queryBuilder.eq("is_active", filters.isActive);
        }
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps("tags", filters.tags);
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "popular":
            orderBy = "play_count";
            break;
          case "rating":
            orderBy = "average_rating";
            break;
          case "duration":
            orderBy = "estimated_duration";
            break;
          case "name":
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

        const games = (data || []) as unknown as FamilyGame[];
        cacheSet(cacheKey, games, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: games, error: null };
      },
      "custom",
    );
  }

  /**
   * Get games by type
   */
  async getGamesByType(
    familyId: string,
    gameType:
      | "board"
      | "card"
      | "puzzle"
      | "trivia"
      | "physical"
      | "digital"
      | "other",
    filters?: Omit<GameFilters, "gameType">,
  ): Promise<ServiceResponse<FamilyGame[]>> {
    const cacheKey = `games_type_${familyId}_${gameType}`;
    const cached = cacheGet<FamilyGame[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getGamesByType",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("game_type", gameType);

        // Apply additional filters
        if (filters?.difficulty) {
          query = query.eq("difficulty", filters.difficulty);
        }
        if (filters?.minPlayers) {
          query = query.gte("min_players", filters.minPlayers);
        }
        if (filters?.maxPlayers) {
          query = query.lte("max_players", filters.maxPlayers);
        }
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }

        const { data, error } = await query.order("title", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const games = (data || []) as unknown as FamilyGame[];
        cacheSet(cacheKey, games, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: games, error: null };
      },
      "custom",
    );
  }

  /**
   * Get games suitable for a specific number of players
   */
  async getGamesForPlayerCount(
    familyId: string,
    playerCount: number,
    filters?: Omit<GameFilters, "minPlayers" | "maxPlayers">,
  ): Promise<ServiceResponse<FamilyGame[]>> {
    const cacheKey = `games_players_${familyId}_${playerCount}`;
    const cached = cacheGet<FamilyGame[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getGamesForPlayerCount",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .lte("min_players", playerCount)
          .gte("max_players", playerCount)
          .eq("is_active", true)
          .order("title", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const games = (data || []) as unknown as FamilyGame[];
        cacheSet(cacheKey, games, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: games, error: null };
      },
      "custom",
    );
  }

  /**
   * Get quick games (under 30 minutes)
   */
  async getQuickGames(
    familyId: string,
    maxDuration: number = 30,
  ): Promise<ServiceResponse<FamilyGame[]>> {
    const cacheKey = `quick_games_${familyId}_${maxDuration}`;
    const cached = cacheGet<FamilyGame[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getQuickGames",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("is_active", true)
          .lte("estimated_duration", maxDuration)
          .order("estimated_duration", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const games = (data || []) as unknown as FamilyGame[];
        cacheSet(cacheKey, games, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: games, error: null };
      },
      "custom",
    );
  }

  /**
   * Get popular games (by play count)
   */
  async getPopularGames(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<FamilyGame[]>> {
    const cacheKey = `popular_games_${familyId}_${limit}`;
    const cached = cacheGet<FamilyGame[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPopularGames",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("is_active", true)
          .order("play_count", { ascending: false })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const games = (data || []) as unknown as FamilyGame[];
        cacheSet(cacheKey, games, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: games, error: null };
      },
      "custom",
    );
  }

  /**
   * Start a new game play session
   */
  async startGamePlay(
    gamePlayData: CreateGamePlayData,
  ): Promise<ServiceResponse<GamePlay>> {
    return measureAsync(
      "startGamePlay",
      async () => {
        const { data, error } = await supabase
          .from("game_plays")
          .insert({
            game_id: gamePlayData.gameId,
            family_id: gamePlayData.familyId,
            author_id: gamePlayData.authorId,
            start_time: gamePlayData.startTime,
            notes: gamePlayData.notes,
            photos: gamePlayData.photos,
            metadata: gamePlayData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Create player records
        const playerPromises = gamePlayData.players.map((player) =>
          supabase.from("game_players").insert({
            game_play_id: data.id,
            user_id: player.userId,
            player_name: player.playerName,
            created_at: new Date().toISOString(),
          }),
        );

        await Promise.all(playerPromises);

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as GamePlay,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * End a game play session
   */
  async endGamePlay(
    gamePlayId: string,
    endData: {
      endTime: string;
      winner?: string;
      scores?: Record<string, number>;
      notes?: string;
    },
  ): Promise<ServiceResponse<GamePlay>> {
    return measureAsync(
      "endGamePlay",
      async () => {
        const endTime = new Date(endData.endTime);
        const startTime = new Date(); // This should come from the existing game play
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        );

        const { data, error } = await supabase
          .from("game_plays")
          .update({
            end_time: endData.endTime,
            duration,
            winner: endData.winner,
            notes: endData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", gamePlayId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Update player scores if provided
        if (endData.scores) {
          const scorePromises = Object.entries(endData.scores).map(
            ([userId, score]) =>
              supabase
                .from("game_players")
                .update({ score })
                .eq("game_play_id", gamePlayId)
                .eq("user_id", userId),
          );
          await Promise.all(scorePromises);
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: data as unknown as GamePlay,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get recent game plays for a specific game
   */
  async getRecentGamePlays(
    gameId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<GamePlay[]>> {
    const cacheKey = `recent_game_plays_${gameId}_${limit}`;
    const cached = cacheGet<GamePlay[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecentGamePlays",
      async () => {
        const { data, error } = await supabase
          .from("game_plays")
          .select(
            `
          *,
          players:game_players(
            id,
            user_id,
            player_name,
            score,
            rank,
            is_winner,
            user:users!game_players_user_id_fkey(
              id,
              name,
              avatar,
              initials
            )
          )
        `,
          )
          .eq("game_id", gameId)
          .order("start_time", { ascending: false })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const plays = (data || []) as unknown as GamePlay[];
        cacheSet(cacheKey, plays, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: plays, error: null };
      },
      "custom",
    );
  }

  /**
   * Get game play count for a specific game
   */
  async getGamePlayCount(gameId: string): Promise<ServiceResponse<number>> {
    const cacheKey = `game_play_count_${gameId}`;
    const cached = cacheGet<number>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getGamePlayCount",
      async () => {
        const { count, error } = await supabase
          .from("game_plays")
          .select("*", { count: "exact", head: true })
          .eq("game_id", gameId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const playCount = count || 0;
        cacheSet(cacheKey, playCount, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: playCount, error: null };
      },
      "custom",
    );
  }

  /**
   * Get average game duration for a specific game
   */
  async getAverageGameDuration(
    gameId: string,
  ): Promise<ServiceResponse<number>> {
    const cacheKey = `game_avg_duration_${gameId}`;
    const cached = cacheGet<number>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getAverageGameDuration",
      async () => {
        const { data, error } = await supabase
          .from("game_plays")
          .select("duration")
          .eq("game_id", gameId)
          .not("duration", "is", null);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const plays = data || [];
        const averageDuration =
          plays.length > 0
            ? plays.reduce((sum, play) => sum + (play.duration || 0), 0) /
              plays.length
            : 0;

        cacheSet(cacheKey, averageDuration, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: averageDuration, error: null };
      },
      "custom",
    );
  }

  /**
   * Get game statistics for a family
   */
  async getGameStats(familyId: string): Promise<ServiceResponse<GameStats>> {
    const cacheKey = `game_stats_${familyId}`;
    const cached = cacheGet<GameStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getGameStats",
      async () => {
        const [gamesResult, playsResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select(
              "title, game_type, difficulty, play_count, estimated_duration",
            )
            .eq("family_id", familyId),
          supabase
            .from("game_plays")
            .select("duration, players:game_players(user_id)")
            .eq("family_id", familyId),
        ]);

        if (gamesResult.error || playsResult.error) {
          return {
            success: false,
            error:
              gamesResult.error?.message ||
              playsResult.error?.message ||
              "Failed to fetch stats",
            data: null,
          };
        }

        const games = gamesResult.data || [];
        const plays = playsResult.data || [];

        const stats: GameStats = {
          totalGames: games.length,
          totalPlays: plays.length,
          gamesByType: games.reduce(
            (acc, g) => {
              const type = g.game_type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          gamesByDifficulty: games.reduce(
            (acc, g) => {
              const difficulty = g.difficulty || "medium";
              acc[difficulty] = (acc[difficulty] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          mostPlayedGames: games
            .filter((g) => g.play_count && g.play_count > 0)
            .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
            .slice(0, 5)
            .map((g) => ({
              title: g.title || "Unknown",
              playCount: g.play_count || 0,
            })),
          averagePlayDuration:
            plays.length > 0
              ? plays.reduce((sum, p) => sum + (p.duration || 0), 0) /
                plays.length
              : 0,
          totalPlayers: new Set(
            plays.flatMap(
              (p) => p.players?.map((player) => player.user_id) || [],
            ),
          ).size,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for games
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`games_family_${familyId}`),
      new RegExp(`games_with_author_${familyId}`),
      new RegExp(`games_search_${familyId}`),
      new RegExp(`games_type_${familyId}`),
      new RegExp(`games_players_${familyId}`),
      new RegExp(`quick_games_${familyId}`),
      new RegExp(`popular_games_${familyId}`),
      new RegExp(`game_stats_${familyId}`),
      new RegExp(`recent_game_plays_`),
      new RegExp(`game_play_count_`),
      new RegExp(`game_avg_duration_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const gameService = new GamesService();

// Legacy export for backward compatibility
export const gamesService = gameService;
