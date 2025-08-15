// Recipes Service - Handles all recipe-related data operations
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

export interface Recipe extends FamilyEntity {
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  isPublic?: boolean;
  rating?: number;
  reviewCount?: number;
  favoriteCount?: number;
  metadata?: Record<string, any>;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

export interface RecipeInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  time?: number;
  tips?: string;
}

export interface RecipeWithDetails extends Recipe {
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  reviews: RecipeReview[];
  averageRating: number;
  isFavorited?: boolean;
}

export interface RecipeReview {
  id: string;
  recipeId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
}

export interface CreateRecipeData {
  title: string;
  description?: string;
  familyId: string;
  authorId: string;
  ingredients: Omit<RecipeIngredient, "id">[];
  instructions: Omit<RecipeInstruction, "id">[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateRecipeData {
  title?: string;
  description?: string;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstruction[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface RecipeFilters extends FamilyFilters {
  cuisine?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  maxTime?: number;
  hasImages?: boolean;
  rating?: number;
  tags?: string[];
}

export interface RecipeSearchParams {
  query: string;
  filters?: RecipeFilters;
  sortBy?: "recent" | "popular" | "rating" | "time" | "name";
  sortOrder?: "asc" | "desc";
}

class RecipesService extends FamilyService<
  Recipe,
  CreateRecipeData,
  UpdateRecipeData
> {
  protected tableName = "recipes";
  protected selectFields = `
    *,
    author:users!recipes_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    ingredients:recipe_ingredients(
      id,
      name,
      amount,
      unit,
      notes,
      optional
    ),
    instructions:recipe_instructions(
      id,
      step_number,
      instruction,
      time,
      tips
    )
  `;

  /**
   * Get recipes with full details for a family
   */
  async getRecipesWithDetails(
    familyId: string,
    filters?: RecipeFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<RecipeWithDetails[]>> {
    const cacheKey = `recipes_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<RecipeWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecipesWithDetails",
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

        const recipes = (data || []) as unknown as RecipeWithDetails[];

        // Transform and enrich recipes with additional data
        const enrichedRecipes = await Promise.all(
          recipes.map(async (recipe) => {
            const reviews = await this.getRecipeReviews(recipe.id);
            const averageRating = this.calculateAverageRating(reviews);
            return {
              ...recipe,
              reviews: reviews.success ? reviews.data || [] : [],
              averageRating,
            };
          }),
        );

        cacheSet(cacheKey, enrichedRecipes, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedRecipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Search recipes by text content and filters
   */
  async searchRecipes(
    familyId: string,
    searchParams: RecipeSearchParams,
  ): Promise<ServiceResponse<Recipe[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `recipes_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Recipe[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchRecipes",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,ingredients.name.ilike.%${query}%,tags.cs.{${query}}`,
          );

        // Apply filters
        if (filters?.cuisine) {
          queryBuilder = queryBuilder.eq("cuisine", filters.cuisine);
        }
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.difficulty) {
          queryBuilder = queryBuilder.eq("difficulty", filters.difficulty);
        }
        if (filters?.maxTime) {
          queryBuilder = queryBuilder.lte("total_time", filters.maxTime);
        }
        if (filters?.hasImages) {
          queryBuilder = queryBuilder.not("images", "is", null);
        }
        if (filters?.rating) {
          queryBuilder = queryBuilder.gte("rating", filters.rating);
        }
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps("tags", filters.tags);
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "popular":
            orderBy = "favorite_count";
            break;
          case "rating":
            orderBy = "rating";
            break;
          case "time":
            orderBy = "total_time";
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

        const recipes = (data || []) as unknown as Recipe[];
        cacheSet(cacheKey, recipes, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: recipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(
    familyId: string,
    category: string,
    filters?: Omit<RecipeFilters, "category">,
  ): Promise<ServiceResponse<Recipe[]>> {
    const cacheKey = `recipes_category_${familyId}_${category}`;
    const cached = cacheGet<Recipe[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecipesByCategory",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("category", category);

        // Apply additional filters
        if (filters?.difficulty) {
          query = query.eq("difficulty", filters.difficulty);
        }
        if (filters?.maxTime) {
          query = query.lte("total_time", filters.maxTime);
        }
        if (filters?.cuisine) {
          query = query.eq("cuisine", filters.cuisine);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const recipes = (data || []) as unknown as Recipe[];
        cacheSet(cacheKey, recipes, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: recipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(
    familyId: string,
    cuisine: string,
    filters?: Omit<RecipeFilters, "cuisine">,
  ): Promise<ServiceResponse<Recipe[]>> {
    const cacheKey = `recipes_cuisine_${familyId}_${cuisine}`;
    const cached = cacheGet<Recipe[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecipesByCuisine",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("cuisine", cuisine);

        // Apply additional filters
        if (filters?.difficulty) {
          query = query.eq("difficulty", filters.difficulty);
        }
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }
        if (filters?.maxTime) {
          query = query.lte("total_time", filters.maxTime);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const recipes = (data || []) as unknown as Recipe[];
        cacheSet(cacheKey, recipes, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: recipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Get quick recipes (under 30 minutes)
   */
  async getQuickRecipes(
    familyId: string,
    maxTime: number = 30,
  ): Promise<ServiceResponse<Recipe[]>> {
    const cacheKey = `quick_recipes_${familyId}_${maxTime}`;
    const cached = cacheGet<Recipe[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getQuickRecipes",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .lte("total_time", maxTime)
          .order("total_time", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const recipes = (data || []) as unknown as Recipe[];
        cacheSet(cacheKey, recipes, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: recipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Get popular recipes (by favorite count)
   */
  async getPopularRecipes(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<Recipe[]>> {
    const cacheKey = `popular_recipes_${familyId}_${limit}`;
    const cached = cacheGet<Recipe[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getPopularRecipes",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("favorite_count", { ascending: false })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const recipes = (data || []) as unknown as Recipe[];
        cacheSet(cacheKey, recipes, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: recipes, error: null };
      },
      "custom",
    );
  }

  /**
   * Add a review to a recipe
   */
  async addRecipeReview(
    recipeId: string,
    reviewData: { userId: string; rating: number; comment?: string },
  ): Promise<ServiceResponse<RecipeReview>> {
    return measureAsync(
      "addRecipeReview",
      async () => {
        const { data, error } = await supabase
          .from("recipe_reviews")
          .insert({
            recipe_id: recipeId,
            user_id: reviewData.userId,
            rating: reviewData.rating,
            comment: reviewData.comment,
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
          data: data as unknown as RecipeReview,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get reviews for a recipe
   */
  async getRecipeReviews(
    recipeId: string,
  ): Promise<ServiceResponse<RecipeReview[]>> {
    const cacheKey = `recipe_reviews_${recipeId}`;
    const cached = cacheGet<RecipeReview[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecipeReviews",
      async () => {
        const { data, error } = await supabase
          .from("recipe_reviews")
          .select(
            `
          *,
          user:users!recipe_reviews_user_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("recipe_id", recipeId)
          .order("created_at", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const reviews = (data || []) as unknown as RecipeReview[];
        cacheSet(cacheKey, reviews, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: reviews, error: null };
      },
      "custom",
    );
  }

  /**
   * Toggle favorite status for a recipe
   */
  async toggleFavorite(
    recipeId: string,
    userId: string,
  ): Promise<ServiceResponse<{ isFavorited: boolean; favoriteCount: number }>> {
    return measureAsync(
      "toggleFavorite",
      async () => {
        // This would typically involve a separate favorites table
        // For now, we'll simulate the functionality
        const recipe = await this.getById(recipeId);
        if (!recipe.success || !recipe.data) {
          return { success: false, error: "Recipe not found", data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: {
            isFavorited: true,
            favoriteCount: (recipe.data.favoriteCount || 0) + 1,
          },
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Get recipe statistics for a family
   */
  async getRecipeStats(familyId: string): Promise<
    ServiceResponse<{
      totalRecipes: number;
      recipesByCategory: Record<string, number>;
      recipesByCuisine: Record<string, number>;
      recipesByDifficulty: Record<string, number>;
      averageRating: number;
      totalReviews: number;
      quickRecipes: number;
    }>
  > {
    const cacheKey = `recipe_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecipeStats",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select("category, cuisine, difficulty, rating, total_time")
          .eq("family_id", familyId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const recipes = data || [];

        const stats = {
          totalRecipes: recipes.length,
          recipesByCategory: recipes.reduce(
            (acc, r) => {
              const category = r.category || "uncategorized";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          recipesByCuisine: recipes.reduce(
            (acc, r) => {
              const cuisine = r.cuisine || "other";
              acc[cuisine] = (acc[cuisine] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          recipesByDifficulty: recipes.reduce(
            (acc, r) => {
              const difficulty = r.difficulty || "medium";
              acc[difficulty] = (acc[difficulty] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageRating:
            recipes.length > 0
              ? recipes.reduce((sum, r) => sum + (r.rating || 0), 0) /
                recipes.length
              : 0,
          totalReviews: recipes.reduce(
            (sum, r) => sum + (r.reviewCount || 0),
            0,
          ),
          quickRecipes: recipes.filter((r) => (r.total_time || 0) <= 30).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Calculate average rating from reviews
   */
  private calculateAverageRating(
    reviews: ServiceResponse<RecipeReview[]>,
  ): number {
    if (!reviews.success || !reviews.data || reviews.data.length === 0) {
      return 0;
    }

    const totalRating = reviews.data.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return Math.round((totalRating / reviews.data.length) * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Invalidate cache for recipes
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`recipes_family_${familyId}`),
      new RegExp(`recipes_with_details_${familyId}`),
      new RegExp(`recipes_search_${familyId}`),
      new RegExp(`recipes_category_${familyId}`),
      new RegExp(`recipes_cuisine_${familyId}`),
      new RegExp(`quick_recipes_${familyId}`),
      new RegExp(`popular_recipes_${familyId}`),
      new RegExp(`recipe_stats_${familyId}`),
      new RegExp(`recipe_reviews_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const recipeService = new RecipesService();

// Legacy export for backward compatibility
export const recipesService = recipeService;
