// Recipes Page - Main recipes management page
// Refactored to use modular components for better maintainability

import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { ChefHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { recipeService, familyService } from "@/services";
import { RecipeList } from "@/components/recipes";
import { Recipe } from "@/types/recipes";

export default function Recipes() {
  const { user, loading } = useAuth();

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<ChefHat />}
        title="Share Family Recipes"
        description="Preserve and share your family's culinary traditions, secret recipes, and favorite dishes with loved ones."
        features={[
          "Store and organize family recipes in one place",
          "Share cooking tips and family food traditions",
          "Rate and review family recipes",
          "Create recipe collections and meal plans",
          "Add photos and cooking notes to recipes",
          "Discover new dishes from family members",
        ]}
        accentColor="#BD692B"
        bgGradient="from-orange-50 to-amber-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setRecipes([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load user's current family
      const familyResult = await familyService.getUserFamilies(user.id);
      if (
        familyResult.success &&
        familyResult.data &&
        familyResult.data.length > 0
      ) {
        const currentFamilyData = familyResult.data[0];
        setCurrentFamily(currentFamilyData);

        // Load recipes for the family
        await loadFamilyRecipes(currentFamilyData.id);
      } else {
        setError("No family found. Please create or join a family.");
      }
    } catch (error) {
      const errorMessage = "Failed to load family data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load family recipes
  const loadFamilyRecipes = async (familyId: string) => {
    try {
      const recipesResult = await recipeService.getFamilyRecipes({ familyId });
      if (recipesResult.success && recipesResult.data) {
        setRecipes(recipesResult.data);
      } else {
        setError(recipesResult.error || "Failed to load recipes");
      }
    } catch (error) {
      setError("Failed to load recipes");
    }
  };

  // Recipe handlers
  const handleRecipeCreate = async (recipeData: any) => {
    if (!currentFamily) return;

    try {
      const result = await recipeService.createRecipe({
        ...recipeData,
        familyId: currentFamily.id,
        authorId: user!.id,
      });

      if (result.success && result.data) {
        setRecipes((prev) => [result.data!, ...prev]);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create recipe");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRecipeUpdate = async (recipeId: string, updates: any) => {
    try {
      const result = await recipeService.updateRecipe(recipeId, updates);
      if (result.success && result.data) {
        setRecipes((prev) =>
          prev.map((recipe) =>
            recipe.id === recipeId ? result.data! : recipe,
          ),
        );
        return result.data;
      } else {
        throw new Error(result.error || "Failed to update recipe");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRecipeDelete = async (recipeId: string) => {
    try {
      const result = await recipeService.deleteRecipe(recipeId);
      if (result.success) {
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
        return true;
      } else {
        throw new Error(result.error || "Failed to delete recipe");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = () => {
    if (currentFamily) {
      loadFamilyRecipes(currentFamily.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-warm-brown/10 rounded-full">
              <ChefHat className="w-8 h-8 text-warm-brown" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">
                Family Recipes
              </h1>
              <p className="text-light-blue-gray">
                Preserve and share your culinary traditions
              </p>
            </div>
          </div>
        </div>

        {/* Recipes List Component */}
        <RecipeList
          recipes={recipes}
          isLoading={isLoading}
          error={error}
          onRecipeCreate={handleRecipeCreate}
          onRecipeUpdate={handleRecipeUpdate}
          onRecipeDelete={handleRecipeDelete}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
