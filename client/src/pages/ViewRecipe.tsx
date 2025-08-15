import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  Users,
  ChefHat,
  Heart,
  Bookmark,
  Share2,
  Printer,
  Download,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabaseDataService } from "@/services";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  authorId: string;
  familyId: string;
  imageUrl?: string;
  averageRating?: number;
  ratingCount?: number;
  author?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface RecipeRating {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export function ViewRecipe() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ratings, setRatings] = useState<RecipeRating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (recipeId) {
      loadRecipeDetails();
    }
  }, [recipeId]);

  const loadRecipeDetails = async () => {
    if (!recipeId) return;

    try {
      setLoading(true);
      // TODO: Implement getRecipeById in supabaseData service
      const recipeData = null;
      setRecipe(recipeData);

      // Load ratings would require a separate endpoint (not currently implemented)
      // const ratingsData = await api.getRecipeRatings(recipeId);
      // setRatings(ratingsData);
    } catch (error) {
      console.error("Error loading recipe:", error);
      toast({
        title: "Error",
        description: "Failed to load recipe details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async () => {
    if (!recipe || !recipeId || userRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingRating(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast({
          title: "Error",
          description: "Please log in to rate recipes.",
          variant: "destructive",
        });
        return;
      }

      await supabaseDataService.rateRecipe(recipeId, userRating);

      toast({
        title: "Rating Submitted",
        description: "Thank you for rating this recipe!",
      });

      // Reset form
      setUserRating(0);
      setUserComment("");

      // Reload recipe to get updated rating
      await loadRecipeDetails();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleSaveRecipe = () => {
    toast({
      title: "Recipe Saved",
      description: "Recipe saved to your favorites!",
    });
  };

  const handleShareRecipe = () => {
    if (navigator.share && recipe) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Recipe link copied to clipboard!",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">
              Recipe Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The recipe you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/recipes">Back to Recipes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recipes
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveRecipe}>
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareRecipe}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Recipe Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{recipe.title}</CardTitle>
                <p className="text-muted-foreground text-lg mb-4">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipe.author?.avatar} />
                      <AvatarFallback>
                        {recipe.author?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {recipe.author?.name || "Unknown Author"}
                    </span>
                  </div>

                  {recipe.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {recipe.averageRating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({recipe.ratingCount || 0} review
                        {(recipe.ratingCount || 0) !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {recipe.imageUrl && (
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium">Prep: {recipe.prepTime}m</div>
                  <div className="text-sm text-muted-foreground">
                    Preparation
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium">Cook: {recipe.cookTime}m</div>
                  <div className="text-sm text-muted-foreground">Cooking</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium">{recipe.servings} servings</div>
                  <div className="text-sm text-muted-foreground">Serves</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium capitalize">
                    {recipe.difficulty}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Difficulty
                  </div>
                </div>
              </div>
            </div>

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Ingredients */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent font-medium">•</span>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-accent text-white text-sm rounded-full flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Rating Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rate This Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= userRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Share your thoughts about this recipe (optional)"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleRating}
              disabled={userRating === 0 || submittingRating}
              className="w-full"
            >
              {submittingRating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
