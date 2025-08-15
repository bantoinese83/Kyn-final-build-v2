import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/HOCs/withDataFetching";
import { withFormManagement } from "@/components/HOCs/withFormManagement";
import { withSidebar } from "@/components/HOCs/withSidebar";
import { DataCard } from "@/components/Common/DataCard";
import { LoadingState } from "@/components/Common/LoadingState";
import { EmptyState } from "@/components/Common/EmptyState";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useCacheManager } from "@/hooks/useCacheManager";
import { recipeService, userService, photoService } from "@/services";
import { Recipe, User, RecipeFilters, RecipeCategory } from "@/types/database";
import {
  UtensilsCrossed,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  User as UserIcon,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Edit,
  Trash2,
  Plus,
  Clock,
  Users,
  Star,
  BookOpen,
  ChefHat,
  Timer,
  TrendingUp,
} from "lucide-react";

// Enhanced interfaces for the Recipes component
interface RecipesData {
  recipes: Recipe[];
  totalRecipes: number;
  totalCategories: number;
  totalFavorites: number;
  recentRecipes: Recipe[];
  popularRecipes: Recipe[];
  familyMembers: User[];
  categories: RecipeCategory[];
  cookingStats: {
    totalCookTime: number;
    averageRating: number;
    totalIngredients: number;
    mostUsedIngredient: string;
  };
}

interface RecipesFilters extends RecipeFilters {
  viewMode: "grid" | "list" | "masonry";
  sortBy: "recent" | "oldest" | "name" | "cookTime" | "rating" | "popular";
  sortOrder: "asc" | "desc";
  dateRange: "all" | "today" | "week" | "month" | "year";
  difficulty: "easy" | "medium" | "hard" | "expert";
  cookTime: "quick" | "medium" | "long" | "all";
  servings: number | "all";
  ingredients: string[];
  tags: string[];
}

interface RecipesProps {
  familyId: string;
  userId: string;
  onRecipeSelect?: (recipe: Recipe) => void;
  onRecipeCreate?: (recipe: Partial<Recipe>) => void;
  onRecipeUpdate?: (recipeId: string, updates: Partial<Recipe>) => void;
  onRecipeDelete?: (recipeId: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Recipes component with modern patterns
const RecipesComponent: React.FC<RecipesProps> = ({
  familyId,
  userId,
  onRecipeSelect,
  onRecipeCreate,
  onRecipeUpdate,
  onRecipeDelete,
  onError,
}) => {
  const { measureAsync } = usePerformanceMonitor();
  const { getCache, setCache, invalidateCache } = useCacheManager();

  // Enhanced state management
  const [filters, setFilters] = useState<RecipesFilters>({
    viewMode: "grid",
    sortBy: "recent",
    sortOrder: "desc",
    dateRange: "all",
    searchQuery: "",
    authorId: undefined,
    categoryId: undefined,
    difficulty: "all",
    cookTime: "all",
    servings: "all",
    ingredients: [],
    tags: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
  });

  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set(),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);

  // Refs for search and filters
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchRecipesData = useCallback(async (): Promise<RecipesData> => {
    return measureAsync(
      "fetchRecipesData",
      async () => {
        const cacheKey = `recipes_data_${familyId}_${JSON.stringify(filters)}_${currentPage}`;
        const cached = getCache(cacheKey);

        if (cached) {
          return cached;
        }

        try {
          // Parallel data fetching for better performance
          const [recipesResult, membersResult, categoriesResult] =
            await Promise.all([
              recipeService.getFamilyRecipes(familyId, {
                page: currentPage,
                pageSize,
                filters: {
                  searchQuery: filters.searchQuery,
                  authorId: filters.authorId,
                  categoryId: filters.categoryId,
                  difficulty: filters.difficulty,
                  cookTime: filters.cookTime,
                  servings: filters.servings,
                  ingredients: filters.ingredients,
                  tags: filters.tags,
                  isVegetarian: filters.isVegetarian,
                  isVegan: filters.isVegan,
                  isGlutenFree: filters.isGlutenFree,
                  isDairyFree: filters.isDairyFree,
                },
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
              }),
              userService.getFamilyMembers(familyId),
              recipeService.getRecipeCategories(familyId),
            ]);

          // Handle errors gracefully
          if (
            !recipesResult.success ||
            !membersResult.success ||
            !categoriesResult.success
          ) {
            throw new Error("Failed to fetch recipes data");
          }

          const recipes = recipesResult.data || [];
          const familyMembers = membersResult.data || [];
          const categories = categoriesResult.data || [];

          // Calculate cooking statistics
          const totalCookTime = recipes.reduce(
            (sum, recipe) => sum + (recipe.cookTime || 0),
            0,
          );
          const averageRating =
            recipes.length > 0
              ? recipes.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) /
                recipes.length
              : 0;
          const totalIngredients = recipes.reduce(
            (sum, recipe) => sum + (recipe.ingredients?.length || 0),
            0,
          );

          // Find most used ingredient
          const ingredientCounts: Record<string, number> = {};
          recipes.forEach((recipe) => {
            recipe.ingredients?.forEach((ingredient) => {
              ingredientCounts[ingredient.name] =
                (ingredientCounts[ingredient.name] || 0) + 1;
            });
          });
          const mostUsedIngredient =
            Object.entries(ingredientCounts).sort(
              ([, a], [, b]) => b - a,
            )[0]?.[0] || "None";

          // Get recent and popular recipes
          const recentRecipes = recipes
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 8);

          const popularRecipes = recipes
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);

          const data: RecipesData = {
            recipes,
            totalRecipes: recipes.length,
            totalCategories: categories.length,
            totalFavorites: recipes.filter((r) => r.isFavorite).length,
            recentRecipes,
            popularRecipes,
            familyMembers,
            categories,
            cookingStats: {
              totalCookTime,
              averageRating: Math.round(averageRating * 10) / 10,
              totalIngredients,
              mostUsedIngredient,
            },
          };

          // Cache the result
          setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes

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
    (key: keyof RecipesFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to first page when filters change
      // Invalidate cache when filters change
      invalidateCache(`recipes_data_${familyId}`);
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

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setFilters((prev) => ({ ...prev, sortBy: sortBy as any, sortOrder }));
      invalidateCache(`recipes_data_${familyId}`);
    },
    [familyId, invalidateCache],
  );

  // Recipe selection handlers
  const handleRecipeSelect = useCallback(
    (recipeId: string, isSelected: boolean) => {
      setSelectedRecipes((prev) => {
        const newSet = new Set(prev);
        if (isSelected) {
          newSet.add(recipeId);
        } else {
          newSet.delete(recipeId);
        }
        return newSet;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    // This would select all recipes on current page
    setSelectedRecipes(new Set());
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedRecipes(new Set());
  }, []);

  // Recipe action handlers
  const handleRecipeLike = useCallback(
    async (recipeId: string) => {
      try {
        await recipeService.likeRecipe(recipeId, userId);
        // Invalidate cache to refresh recipe data
        invalidateCache(`recipes_data_${familyId}`);
      } catch (error) {
        onError?.("Failed to like recipe");
      }
    },
    [recipeId, userId, recipeService, familyId, invalidateCache, onError],
  );

  const handleRecipeShare = useCallback((recipe: Recipe) => {
    // Implement share functionality
    console.log("Sharing recipe:", recipe);
  }, []);

  const handleRecipeEdit = useCallback((recipe: Recipe) => {
    // Implement edit functionality
    console.log("Editing recipe:", recipe);
  }, []);

  const handleRecipeDelete = useCallback(
    async (recipeId: string) => {
      if (!confirm("Are you sure you want to delete this recipe?")) return;

      setIsDeleting(true);
      try {
        await recipeService.deleteRecipe(recipeId);
        onRecipeDelete?.(recipeId);
        // Invalidate cache to refresh recipe data
        invalidateCache(`recipes_data_${familyId}`);
      } catch (error) {
        onError?.("Failed to delete recipe");
      } finally {
        setIsDeleting(false);
      }
    },
    [
      recipeId,
      recipeService,
      onRecipeDelete,
      familyId,
      invalidateCache,
      onError,
    ],
  );

  // Memoized filtered data
  const filteredData = useMemo(() => {
    // This would be implemented based on the actual data structure
    // For now, return empty arrays as placeholders
    return {
      recipes: [],
      totalRecipes: 0,
      totalCategories: 0,
      totalFavorites: 0,
      recentRecipes: [],
      popularRecipes: [],
      familyMembers: [],
      categories: [],
      cookingStats: {
        totalCookTime: 0,
        averageRating: 0,
        totalIngredients: 0,
        mostUsedIngredient: "None",
      },
    };
  }, [filters, currentPage]);

  // Enhanced render functions
  const renderRecipeCard = useCallback(
    (recipe: Recipe) => (
      <div
        key={recipe.id}
        className={`relative group cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg overflow-hidden bg-white ${
          selectedRecipes.has(recipe.id) ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onRecipeSelect?.(recipe)}
      >
        {/* Recipe Image */}
        <div className="aspect-video overflow-hidden bg-gray-100">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <UtensilsCrossed className="w-12 h-12 text-orange-400" />
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecipeLike(recipe.id);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${recipe.isLiked ? "text-red-500 fill-current" : "text-gray-600"}`}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecipeShare(recipe);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecipeEdit(recipe);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Selection checkbox */}
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={selectedRecipes.has(recipe.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleRecipeSelect(recipe.id, e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          {/* Difficulty badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                recipe.difficulty === "easy"
                  ? "bg-green-100 text-green-800"
                  : recipe.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : recipe.difficulty === "hard"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Recipe Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.description}
          </p>

          {/* Recipe metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>{recipe.cookTime} min</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {/* Rating and author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">
                {recipe.rating?.toFixed(1) || "0.0"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {recipe.author?.avatar ? (
                <img
                  src={recipe.author.avatar}
                  alt={recipe.author.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">
                    {recipe.author?.initials ||
                      recipe.author?.name?.charAt(0) ||
                      "?"}
                  </span>
                </div>
              )}
              <span>{recipe.author?.name || "Unknown"}</span>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    [
      selectedRecipes,
      onRecipeSelect,
      handleRecipeLike,
      handleRecipeShare,
      handleRecipeEdit,
      handleRecipeSelect,
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
                placeholder="Search recipes..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.categoryId || ""}
              onChange={(e) =>
                handleFilterChange("categoryId", e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {filteredData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>

            {/* Cook Time Filter */}
            <select
              value={filters.cookTime}
              onChange={(e) => handleFilterChange("cookTime", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Cook Times</option>
              <option value="quick">Quick (&lt; 30 min)</option>
              <option value="medium">Medium (30-60 min)</option>
              <option value="long">Long (&gt; 60 min)</option>
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
                  {mode === "masonry" && <BookOpen className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value, filters.sortOrder)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="cookTime">Cook Time</option>
              <option value="rating">Rating</option>
              <option value="popular">Most Popular</option>
            </select>

            <button
              onClick={() =>
                handleSortChange(
                  filters.sortBy,
                  filters.sortOrder === "asc" ? "desc" : "asc",
                )
              }
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </button>

            {/* Bulk Actions */}
            {selectedRecipes.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedRecipes.size} selected
                </span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    // Implement bulk delete
                    if (confirm(`Delete ${selectedRecipes.size} recipes?`)) {
                      selectedRecipes.forEach((recipeId) =>
                        handleRecipeDelete(recipeId),
                      );
                    }
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Create Recipe Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Recipe</span>
            </button>
          </div>
        </div>
      </div>
    ),
    [
      filters,
      filteredData.categories,
      selectedRecipes,
      isDeleting,
      handleSearch,
      handleFilterChange,
      handleViewModeChange,
      handleSortChange,
      handleRecipeDelete,
      handleDeselectAll,
    ],
  );

  const renderRecipeGrid = useCallback(() => {
    if (filteredData.recipes.length === 0) {
      return (
        <EmptyState
          icon={<UtensilsCrossed className="w-16 h-16 text-gray-400" />}
          title="No recipes found"
          description="Try adjusting your filters or create some new recipes."
        />
      );
    }

    const gridCols =
      filters.viewMode === "grid"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1";

    return (
      <div className={`grid ${gridCols} gap-6 p-6`}>
        {filteredData.recipes.map(renderRecipeCard)}
      </div>
    );
  }, [filteredData.recipes, filters.viewMode, renderRecipeCard]);

  const renderStats = useCallback(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <DataCard
          title="Total Recipes"
          value={filteredData.totalRecipes}
          icon={<UtensilsCrossed className="w-6 h-6 text-blue-600" />}
          trend="+15%"
          trendDirection="up"
        />
        <DataCard
          title="Categories"
          value={filteredData.totalCategories}
          icon={<BookOpen className="w-6 h-6 text-green-600" />}
          trend="+8%"
          trendDirection="up"
        />
        <DataCard
          title="Favorites"
          value={filteredData.totalFavorites}
          icon={<Heart className="w-6 h-6 text-red-600" />}
          trend="+12%"
          trendDirection="up"
        />
        <DataCard
          title="Avg Rating"
          value={filteredData.cookingStats.averageRating}
          icon={<Star className="w-6 h-6 text-yellow-600" />}
          trend="+5%"
          trendDirection="up"
        />
      </div>
    ),
    [filteredData],
  );

  const renderCookingStats = useCallback(
    () => (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChefHat className="w-5 h-5 text-orange-600 mr-2" />
          Cooking Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(filteredData.cookingStats.totalCookTime / 60)}h
            </div>
            <div className="text-sm text-gray-600">Total Cook Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.cookingStats.totalIngredients}
            </div>
            <div className="text-sm text-gray-600">Total Ingredients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredData.cookingStats.mostUsedIngredient}
            </div>
            <div className="text-sm text-gray-600">Most Used Ingredient</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredData.cookingStats.averageRating}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    ),
    [filteredData.cookingStats],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderToolbar()}
      {renderStats()}
      {renderCookingStats()}
      {renderRecipeGrid()}
    </div>
  );
};

// Enhanced Recipes with HOCs
const Recipes = withSidebar(
  withFormManagement(
    withDataFetching(RecipesComponent, {
      dataKey: "recipesData",
      fetchFunction: (props: RecipesProps) => {
        // This will be handled by the withDataFetching HOC
        return Promise.resolve({
          recipes: [],
          totalRecipes: 0,
          totalCategories: 0,
          totalFavorites: 0,
          recentRecipes: [],
          popularRecipes: [],
          familyMembers: [],
          categories: [],
          cookingStats: {
            totalCookTime: 0,
            averageRating: 0,
            totalIngredients: 0,
            mostUsedIngredient: "None",
          },
        });
      },
      dependencies: ["familyId", "userId"],
      cacheKey: (props: RecipesProps) => `recipes_data_${props.familyId}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load recipes
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
      loadingFallback: (
        <LoadingState message="Loading your family recipes..." />
      ),
    }),
    {
      formConfig: {
        initialValues: {
          searchQuery: "",
          categoryId: "",
          difficulty: "all",
          cookTime: "all",
          servings: "all",
          ingredients: [],
          tags: [],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: false,
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
      title: "Family Recipes",
      description: "Share and discover delicious family recipes",
      navigation: [
        { label: "All Recipes", href: "#", icon: "utensils" },
        { label: "Categories", href: "#", icon: "book-open" },
        { label: "Favorites", href: "#", icon: "heart" },
        { label: "Recent", href: "#", icon: "clock" },
        { label: "Create", href: "#", icon: "plus" },
      ],
    },
  },
);

export default Recipes;
