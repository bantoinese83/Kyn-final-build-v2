// RecipeList Component - Displays and manages a list of recipes
// Extracted from Recipes.tsx for better modularity and maintainability

import { useState } from "react";
import { RecipeCard } from "./RecipeCard";
import { RecipeForm } from "./RecipeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, RefreshCw, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types/recipes";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  onRecipeCreate: (recipe: any) => Promise<any>;
  onRecipeUpdate: (recipeId: string, updates: any) => Promise<any>;
  onRecipeDelete: (recipeId: string) => Promise<any>;
  onRefresh: () => void;
  className?: string;
}

export function RecipeList({
  recipes,
  isLoading,
  error,
  onRecipeCreate,
  onRecipeUpdate,
  onRecipeDelete,
  onRefresh,
  className = "",
}: RecipeListProps) {
  const { toast } = useToast();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "name" | "category" | "difficulty" | "cookTime" | "createdAt"
  >("name");

  // Filter and sort recipes
  const filteredAndSortedRecipes = recipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesCategory =
        filterCategory === "all" || recipe.category === filterCategory;
      const matchesDifficulty =
        filterDifficulty === "all" || recipe.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        case "difficulty":
          return a.difficulty.localeCompare(b.difficulty);
        case "cookTime":
          return a.cookTime - b.cookTime;
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  const handleCreateRecipe = async (recipeData: any) => {
    try {
      await onRecipeCreate(recipeData);
      setIsCreateFormOpen(false);
      toast({
        title: "Recipe Created",
        description: "Your recipe has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecipe = async (recipeId: string, updates: any) => {
    try {
      await onRecipeUpdate(recipeId, updates);
      toast({
        title: "Recipe Updated",
        description: "Your recipe has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      try {
        await onRecipeDelete(recipeId);
        toast({
          title: "Recipe Deleted",
          description: "Your recipe has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete recipe. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Recipes
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Recipes</h2>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedRecipes.length} recipe
            {filteredAndSortedRecipes.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Button
          onClick={() => setIsCreateFormOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search recipes, ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="dessert">Dessert</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="beverage">Beverage</SelectItem>
            <SelectItem value="appetizer">Appetizer</SelectItem>
            <SelectItem value="soup">Soup</SelectItem>
            <SelectItem value="salad">Salad</SelectItem>
            <SelectItem value="bread">Bread</SelectItem>
            <SelectItem value="pasta">Pasta</SelectItem>
            <SelectItem value="seafood">Seafood</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(
            value:
              | "name"
              | "category"
              | "difficulty"
              | "cookTime"
              | "createdAt",
          ) => setSortBy(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
            <SelectItem value="cookTime">Cook Time</SelectItem>
            <SelectItem value="createdAt">Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Recipe Form */}
      {isCreateFormOpen && (
        <RecipeForm
          onSubmit={handleCreateRecipe}
          onCancel={() => setIsCreateFormOpen(false)}
          mode="create"
        />
      )}

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">👨‍🍳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ||
            filterCategory !== "all" ||
            filterDifficulty !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first family recipe to get started"}
          </p>
          {!searchTerm &&
            filterCategory === "all" &&
            filterDifficulty === "all" && (
              <Button onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onUpdate={handleUpdateRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}
