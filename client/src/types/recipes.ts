// Recipe Types - Centralized type definitions for recipes
// Provides consistent interfaces across all recipe-related components

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  cookTime: number; // in minutes
  prepTime?: number; // in minutes
  totalTime?: number; // in minutes
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  author?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  rating?: number;
  reviewCount?: number;
  nutritionInfo?: RecipeNutritionInfo;
  notes?: string;
  imageUrl?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "dessert"
  | "snack"
  | "beverage"
  | "appetizer"
  | "soup"
  | "salad"
  | "bread"
  | "pasta"
  | "seafood"
  | "vegetarian"
  | "vegan"
  | "gluten-free";

export type RecipeDifficulty = "easy" | "medium" | "hard";

export interface RecipeIngredient {
  id?: string;
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

export interface RecipeNutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
}

export interface CreateRecipeData {
  title: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  cookTime: number;
  prepTime?: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags?: string[];
  nutritionInfo?: RecipeNutritionInfo;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

export interface RecipeFilters {
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  search?: string;
  author?: string;
  tags?: string[];
  maxCookTime?: number;
  minRating?: number;
}

export interface RecipeSortOptions {
  field:
    | "title"
    | "category"
    | "difficulty"
    | "cookTime"
    | "createdAt"
    | "rating";
  direction: "asc" | "desc";
}

export interface RecipeStats {
  totalRecipes: number;
  recipesByCategory: Record<RecipeCategory, number>;
  recipesByDifficulty: Record<RecipeDifficulty, number>;
  averageRating: number;
  totalReviews: number;
  mostPopularTags: Array<{ tag: string; count: number }>;
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
    initials: string;
  };
}

export interface RecipeComment {
  id: string;
  recipeId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
}

export interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  defaultSettings: {
    cookTime: number;
    prepTime: number;
    servings: number;
    commonIngredients: string[];
    commonTags: string[];
  };
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCategoryInfo {
  category: RecipeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultCookTime: number;
  commonTags: string[];
}

export const RECIPE_CATEGORIES: RecipeCategoryInfo[] = [
  {
    category: "breakfast",
    label: "Breakfast",
    description: "Start your day with delicious morning meals",
    icon: "🍳",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    defaultCookTime: 20,
    commonTags: ["morning", "eggs", "pancakes", "cereal", "smoothies"],
  },
  {
    category: "lunch",
    label: "Lunch",
    description: "Midday meals to keep you energized",
    icon: "🥪",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    defaultCookTime: 30,
    commonTags: ["sandwiches", "salads", "soups", "quick", "healthy"],
  },
  {
    category: "dinner",
    label: "Dinner",
    description: "Main evening meals for the whole family",
    icon: "🍽️",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    defaultCookTime: 45,
    commonTags: ["main-course", "family", "hearty", "comfort", "traditional"],
  },
  {
    category: "dessert",
    label: "Dessert",
    description: "Sweet treats and after-dinner delights",
    icon: "🍰",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    defaultCookTime: 60,
    commonTags: ["sweet", "baking", "chocolate", "fruit", "indulgent"],
  },
  {
    category: "snack",
    label: "Snack",
    description: "Quick bites between meals",
    icon: "🍿",
    color: "bg-green-100 text-green-800 border-green-200",
    defaultCookTime: 15,
    commonTags: ["quick", "healthy", "portable", "crunchy", "light"],
  },
  {
    category: "beverage",
    label: "Beverage",
    description: "Drinks and liquid refreshments",
    icon: "🥤",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    defaultCookTime: 10,
    commonTags: ["drinks", "refreshing", "hot", "cold", "smoothies"],
  },
  {
    category: "appetizer",
    label: "Appetizer",
    description: "Small dishes to start your meal",
    icon: "🥟",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    defaultCookTime: 25,
    commonTags: ["starter", "finger-food", "party", "elegant", "bite-sized"],
  },
  {
    category: "soup",
    label: "Soup",
    description: "Warm and comforting liquid meals",
    icon: "🍲",
    color: "bg-red-100 text-red-800 border-red-200",
    defaultCookTime: 40,
    commonTags: ["warm", "comforting", "broth", "vegetables", "healing"],
  },
  {
    category: "salad",
    label: "Salad",
    description: "Fresh and healthy vegetable dishes",
    icon: "🥗",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    defaultCookTime: 15,
    commonTags: ["fresh", "healthy", "vegetables", "light", "crunchy"],
  },
  {
    category: "bread",
    label: "Bread",
    description: "Freshly baked breads and pastries",
    icon: "🍞",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    defaultCookTime: 120,
    commonTags: ["baking", "yeast", "fresh", "crusty", "homemade"],
  },
  {
    category: "pasta",
    label: "Pasta",
    description: "Italian-inspired noodle dishes",
    icon: "🍝",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    defaultCookTime: 25,
    commonTags: ["italian", "noodles", "sauce", "quick", "filling"],
  },
  {
    category: "seafood",
    label: "Seafood",
    description: "Fresh fish and ocean delicacies",
    icon: "🐟",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    defaultCookTime: 20,
    commonTags: ["fish", "ocean", "fresh", "light", "protein"],
  },
  {
    category: "vegetarian",
    label: "Vegetarian",
    description: "Meat-free dishes full of flavor",
    icon: "🥬",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    defaultCookTime: 35,
    commonTags: [
      "meat-free",
      "vegetables",
      "healthy",
      "plant-based",
      "nutritious",
    ],
  },
  {
    category: "vegan",
    label: "Vegan",
    description: "Plant-based dishes without animal products",
    icon: "🌱",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    defaultCookTime: 35,
    commonTags: [
      "plant-based",
      "vegan",
      "cruelty-free",
      "healthy",
      "sustainable",
    ],
  },
  {
    category: "gluten-free",
    label: "Gluten-Free",
    description: "Safe options for gluten sensitivities",
    icon: "🌾",
    color: "bg-stone-100 text-stone-800 border-stone-200",
    defaultCookTime: 40,
    commonTags: [
      "gluten-free",
      "allergen-safe",
      "alternative",
      "healthy",
      "special-diet",
    ],
  },
];

export interface RecipeFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface RecipeSearchResult {
  recipe: Recipe;
  relevance: number;
  matchedFields: string[];
}

export interface RecipeCollection {
  id: string;
  name: string;
  description?: string;
  recipes: Recipe[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeShareData {
  recipeId: string;
  shareType: "family" | "public" | "link";
  permissions: "view" | "edit" | "manage";
  expiresAt?: string;
}
