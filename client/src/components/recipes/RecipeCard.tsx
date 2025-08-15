// RecipeCard Component - Displays individual recipe information
// Extracted from Recipes.tsx for better modularity and maintainability

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  ChefHat,
  Users,
  Edit2,
  Trash2,
  MoreHorizontal,
  Star,
  Heart,
  Share2,
  BookOpen,
  Timer,
  Scale,
  Utensils,
} from "lucide-react";
import { Recipe } from "@/types/recipes";

interface RecipeCardProps {
  recipe: Recipe;
  onUpdate: (recipeId: string, updates: any) => Promise<any>;
  onDelete: (recipeId: string) => Promise<any>;
  className?: string;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

const categoryIcons = {
  breakfast: "🍳",
  lunch: "🥪",
  dinner: "🍽️",
  dessert: "🍰",
  snack: "🍿",
  beverage: "🥤",
  appetizer: "🥟",
  soup: "🍲",
  salad: "🥗",
  bread: "🍞",
  pasta: "🍝",
  seafood: "🐟",
  vegetarian: "🥬",
  vegan: "🌱",
  "gluten-free": "🌾",
};

export function RecipeCard({
  recipe,
  onUpdate,
  onDelete,
  className = "",
}: RecipeCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit recipe:", recipe.id);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      onDelete(recipe.id);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share recipe:", recipe.id);
  };

  const handleView = () => {
    // TODO: Navigate to recipe detail page
    console.log("View recipe:", recipe.id);
  };

  const formatCookTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
      default:
        return difficulty;
    }
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || "🍽️";
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getCategoryIcon(recipe.category)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={
                    difficultyColors[
                      recipe.difficulty as keyof typeof difficultyColors
                    ]
                  }
                >
                  {getDifficultyLabel(recipe.difficulty)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {recipe.category.charAt(0).toUpperCase() +
                    recipe.category.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  className="w-full justify-start rounded-none rounded-t-lg"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="w-full justify-start rounded-none"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="w-full justify-start rounded-none"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full justify-start rounded-none rounded-b-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipe Description */}
        {recipe.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatCookTime(recipe.cookTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{recipe.servings} servings</span>
          </div>

          {recipe.prepTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Timer className="w-4 h-4 text-gray-400" />
              <span>{formatCookTime(recipe.prepTime)} prep</span>
            </div>
          )}

          {recipe.totalTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Scale className="w-4 h-4 text-gray-400" />
              <span>{formatCookTime(recipe.totalTime)} total</span>
            </div>
          )}
        </div>

        {/* Key Ingredients Preview */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Key Ingredients
            </h4>
            <div className="flex flex-wrap gap-1">
              {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ingredient.name}
                </Badge>
              ))}
              {recipe.ingredients.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.ingredients.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recipe Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Recipe Author */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <Avatar className="w-8 h-8">
            <AvatarImage src={recipe.author?.avatar} />
            <AvatarFallback className="text-xs">
              {recipe.author?.initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {recipe.author?.name || "Unknown Author"}
            </p>
            <p className="text-xs text-gray-500">
              Added {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Recipe Rating */}
        {recipe.rating && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.floor(recipe.rating!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {recipe.rating.toFixed(1)} ({recipe.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleView}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Recipe
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
