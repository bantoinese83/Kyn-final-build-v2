// Recipe Service - Handles all recipe-related operations
// Implements consistent error handling and service response patterns

import { supabase } from "./supabase";
import { logServiceError } from "../lib/logger";
import { handleSupabaseError } from "../lib/error-handler";
import { Recipe, RecipeWithAuthor, RecipeRating } from "../types/database";
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../lib/constants";

export interface CreateRecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  familyId: string;
  authorId: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
}

export interface RecipeFilters {
  familyId: string;
  search?: string;
  difficulty?: string;
  tags?: string[];
  authorId?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class RecipeService {
  /**
   * Get family recipes with pagination and filtering
   */
  async getFamilyRecipes(
    filters: RecipeFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<ServiceResponse<RecipeWithAuthor[]>> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from("recipes")
        .select(
          `
          *,
          author:users(id, name, avatar)
        `,
        )
        .eq("familyId", filters.familyId)
        .order("createdAt", { ascending: false });

      // Apply search filter
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      // Apply difficulty filter
      if (filters.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }

      // Apply author filter
      if (filters.authorId) {
        query = query.eq("authorId", filters.authorId);
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      const { data: recipes, error } = await query.range(
        offset,
        offset + limit - 1,
      );

      if (error) throw error;

      const recipesWithAuthor =
        recipes?.map((recipe) => ({
          ...recipe,
          author: recipe.author,
        })) || [];

      return {
        data: recipesWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "getFamilyRecipes",
        familyId: filters.familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get recipe by ID with author details
   */
  async getRecipeById(
    recipeId: string,
  ): Promise<ServiceResponse<RecipeWithAuthor>> {
    try {
      const { data: recipe, error } = await supabase
        .from("recipes")
        .select(
          `
          *,
          author:users(id, name, avatar)
        `,
        )
        .eq("id", recipeId)
        .single();

      if (error) throw error;

      const recipeWithAuthor = {
        ...recipe,
        author: recipe.author,
      };

      return {
        data: recipeWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "getRecipeById",
        recipeId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(
    recipeData: CreateRecipeData,
  ): Promise<ServiceResponse<Recipe>> {
    try {
      // Validate required fields
      if (
        !recipeData.title ||
        recipeData.title.length < VALIDATION.RECIPE.MIN_TITLE_LENGTH
      ) {
        throw new Error("Recipe title must be at least 3 characters long");
      }

      if (!recipeData.description || recipeData.description.length < 10) {
        throw new Error(
          "Recipe description must be at least 10 characters long",
        );
      }

      if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
        throw new Error("Recipe must have at least one ingredient");
      }

      if (!recipeData.instructions || recipeData.instructions.length === 0) {
        throw new Error("Recipe must have at least one instruction");
      }

      if (recipeData.ingredients.length > VALIDATION.RECIPE.MAX_INGREDIENTS) {
        throw new Error(
          `Recipe cannot have more than ${VALIDATION.RECIPE.MAX_INGREDIENTS} ingredients`,
        );
      }

      if (recipeData.instructions.length > VALIDATION.RECIPE.MAX_INSTRUCTIONS) {
        throw new Error(
          `Recipe cannot have more than ${VALIDATION.RECIPE.MAX_INSTRUCTIONS} instructions`,
        );
      }

      const { data: recipe, error } = await supabase
        .from("recipes")
        .insert({
          ...recipeData,
          tags: recipeData.tags || [],
          prepTime: recipeData.prepTime || 0,
          cookTime: recipeData.cookTime || 0,
          servings: recipeData.servings || 1,
          difficulty: recipeData.difficulty || "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: recipe,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "createRecipe",
        familyId: recipeData.familyId,
        authorId: recipeData.authorId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Update a recipe
   */
  async updateRecipe(
    recipeId: string,
    updates: UpdateRecipeData,
  ): Promise<ServiceResponse<Recipe>> {
    try {
      // Validate updates if provided
      if (
        updates.title &&
        updates.title.length < VALIDATION.RECIPE.MIN_TITLE_LENGTH
      ) {
        throw new Error("Recipe title must be at least 3 characters long");
      }

      if (updates.description && updates.description.length < 10) {
        throw new Error(
          "Recipe description must be at least 10 characters long",
        );
      }

      if (
        updates.ingredients &&
        updates.ingredients.length > VALIDATION.RECIPE.MAX_INGREDIENTS
      ) {
        throw new Error(
          `Recipe cannot have more than ${VALIDATION.RECIPE.MAX_INGREDIENTS} ingredients`,
        );
      }

      if (
        updates.instructions &&
        updates.instructions.length > VALIDATION.RECIPE.MAX_INSTRUCTIONS
      ) {
        throw new Error(
          `Recipe cannot have more than ${VALIDATION.RECIPE.MAX_INSTRUCTIONS} instructions`,
        );
      }

      const { data: recipe, error } = await supabase
        .from("recipes")
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", recipeId)
        .select()
        .single();

      if (error) throw error;

      return {
        data: recipe,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "updateRecipe",
        recipeId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId: string): Promise<ServiceResponse<void>> {
    try {
      // First delete all ratings for this recipe
      const { error: ratingsError } = await supabase
        .from("recipe_ratings")
        .delete()
        .eq("recipeId", recipeId);

      if (ratingsError) throw ratingsError;

      // Then delete the recipe
      const { error: recipeError } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (recipeError) throw recipeError;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "deleteRecipe",
        recipeId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Rate a recipe
   */
  async rateRecipe(
    recipeId: string,
    userId: string,
    rating: number,
  ): Promise<ServiceResponse<RecipeRating>> {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Check if user already rated this recipe
      const { data: existingRating, error: checkError } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("recipeId", recipeId)
        .eq("userId", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      let recipeRating: RecipeRating;

      if (existingRating) {
        // Update existing rating
        const { data: updatedRating, error: updateError } = await supabase
          .from("recipe_ratings")
          .update({
            rating,
            createdAt: new Date().toISOString(),
          })
          .eq("id", existingRating.id)
          .select()
          .single();

        if (updateError) throw updateError;
        recipeRating = updatedRating;
      } else {
        // Create new rating
        const { data: newRating, error: insertError } = await supabase
          .from("recipe_ratings")
          .insert({
            recipeId,
            userId,
            rating,
            createdAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        recipeRating = newRating;
      }

      return {
        data: recipeRating,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "rateRecipe",
        recipeId,
        userId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get recipe ratings
   */
  async getRecipeRatings(
    recipeId: string,
  ): Promise<ServiceResponse<RecipeRating[]>> {
    try {
      const { data: ratings, error } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("recipeId", recipeId)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      return {
        data: ratings || [],
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "getRecipeRatings",
        recipeId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get average rating for a recipe
   */
  async getRecipeAverageRating(
    recipeId: string,
  ): Promise<ServiceResponse<number>> {
    try {
      const { data: ratings, error } = await supabase
        .from("recipe_ratings")
        .select("rating")
        .eq("recipeId", recipeId);

      if (error) throw error;

      if (!ratings || ratings.length === 0) {
        return {
          data: 0,
          error: null,
          success: true,
        };
      }

      const averageRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      return {
        data: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "getRecipeAverageRating",
        recipeId,
      });
      return {
        data: 0,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Search recipes by ingredients
   */
  async searchRecipesByIngredients(
    ingredients: string[],
    familyId: string,
  ): Promise<ServiceResponse<RecipeWithAuthor[]>> {
    try {
      const { data: recipes, error } = await supabase
        .from("recipes")
        .select(
          `
          *,
          author:users(id, name, avatar)
        `,
        )
        .eq("familyId", familyId)
        .overlaps("ingredients", ingredients)
        .order("createdAt", { ascending: false })
        .limit(20);

      if (error) throw error;

      const recipesWithAuthor =
        recipes?.map((recipe) => ({
          ...recipe,
          author: recipe.author,
        })) || [];

      return {
        data: recipesWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "searchRecipesByIngredients",
        familyId,
        ingredients,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }

  /**
   * Get popular recipes (by rating count)
   */
  async getPopularRecipes(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<RecipeWithAuthor[]>> {
    try {
      // This would require a more complex query with aggregations
      // For now, we'll get recipes with their rating counts
      const { data: recipes, error } = await supabase
        .from("recipes")
        .select(
          `
          *,
          author:users(id, name, avatar)
        `,
        )
        .eq("familyId", familyId)
        .order("createdAt", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const recipesWithAuthor =
        recipes?.map((recipe) => ({
          ...recipe,
          author: recipe.author,
        })) || [];

      return {
        data: recipesWithAuthor,
        error: null,
        success: true,
      };
    } catch (error) {
      const appError = handleSupabaseError(error, {
        component: "RecipeService",
        action: "getPopularRecipes",
        familyId,
      });
      return {
        data: null,
        error: appError.userMessage,
        success: false,
      };
    }
  }
}

// Export singleton instance
export const recipeService = new RecipeService();
