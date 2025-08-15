// RecipeForm Component - Handles recipe creation and editing
// Extracted from Recipes.tsx for better modularity and maintainability

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Save,
  Plus,
  Trash2,
  ChefHat,
  Clock,
  Users,
  Utensils,
} from "lucide-react";
import { Recipe } from "@/types/recipes";

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (recipeData: any) => Promise<any>;
  onCancel: () => void;
  mode: "create" | "edit";
  className?: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  cookTime: number;
  prepTime: number;
  totalTime: number;
  servings: number;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  instructions: string[];
  tags: string[];
  nutritionInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  notes: string;
}

const recipeCategories = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
  { value: "beverage", label: "Beverage" },
  { value: "appetizer", label: "Appetizer" },
  { value: "soup", label: "Soup" },
  { value: "salad", label: "Salad" },
  { value: "bread", label: "Bread" },
  { value: "pasta", label: "Pasta" },
  { value: "seafood", label: "Seafood" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
  mode,
  className = "",
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    category: "dinner",
    difficulty: "medium",
    cookTime: 30,
    prepTime: 15,
    totalTime: 45,
    servings: 4,
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [""],
    tags: [],
    nutritionInfo: {},
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<RecipeFormData>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (recipe && mode === "edit") {
      setFormData({
        title: recipe.title,
        description: recipe.description || "",
        category: recipe.category,
        difficulty: recipe.difficulty,
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime || 0,
        totalTime: recipe.totalTime || recipe.cookTime + (recipe.prepTime || 0),
        servings: recipe.servings,
        ingredients: recipe.ingredients?.map((ing) => ({
          name: ing.name,
          amount: ing.amount || "",
          unit: ing.unit || "",
        })) || [{ name: "", amount: "", unit: "" }],
        instructions: recipe.instructions || [""],
        tags: recipe.tags || [],
        nutritionInfo: recipe.nutritionInfo || {},
        notes: recipe.notes || "",
      });
    }
  }, [recipe, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RecipeFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Recipe title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Recipe description is required";
    }

    if (
      formData.ingredients.length === 0 ||
      formData.ingredients.some((ing) => !ing.name.trim())
    ) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    if (
      formData.instructions.length === 0 ||
      formData.instructions.some((inst) => !inst.trim())
    ) {
      newErrors.instructions = "At least one instruction step is required";
    }

    if (formData.cookTime <= 0) {
      newErrors.cookTime = "Cook time must be greater than 0";
    }

    if (formData.servings <= 0) {
      newErrors.servings = "Servings must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.filter((ing) => ing.name.trim()),
        instructions: formData.instructions.filter((inst) => inst.trim()),
        tags: formData.tags.filter((tag) => tag.trim()),
        totalTime: formData.prepTime + formData.cookTime,
      };

      await onSubmit(recipeData);
    } catch (error) {
      console.error("Failed to submit recipe:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RecipeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (
    index: number,
    field: keyof (typeof formData.ingredients)[0],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing,
      ),
    }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst,
      ),
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange("tags", [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            {mode === "create" ? "Create New Recipe" : "Edit Recipe"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recipe Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter recipe title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your recipe..."
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Time and Difficulty */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Time & Difficulty
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) =>
                    handleInputChange("prepTime", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime">Cook Time (min) *</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) =>
                    handleInputChange("cookTime", parseInt(e.target.value) || 0)
                  }
                  min="1"
                  className={errors.cookTime ? "border-red-500" : ""}
                />
                {errors.cookTime && (
                  <p className="text-sm text-red-500">{errors.cookTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings *</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) =>
                    handleInputChange("servings", parseInt(e.target.value) || 0)
                  }
                  min="1"
                  className={errors.servings ? "border-red-500" : ""}
                />
                {errors.servings && (
                  <p className="text-sm text-red-500">{errors.servings}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    handleInputChange("difficulty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((difficulty) => (
                      <SelectItem
                        key={difficulty.value}
                        value={difficulty.value}
                      >
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`ingredient-${index}`}>
                      Ingredient {index + 1} *
                    </Label>
                    <Input
                      id={`ingredient-${index}`}
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      placeholder="e.g., Flour"
                      className={errors.ingredients ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`amount-${index}`}>Amount</Label>
                    <Input
                      id={`amount-${index}`}
                      value={ingredient.amount}
                      onChange={(e) =>
                        updateIngredient(index, "amount", e.target.value)
                      }
                      placeholder="2"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`unit-${index}`}>Unit</Label>
                    <Input
                      id={`unit-${index}`}
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                      placeholder="cups"
                    />
                  </div>
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="px-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {errors.ingredients && (
                <p className="text-sm text-red-500">{errors.ingredients}</p>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Instructions</h3>

            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`instruction-${index}`}>
                      Step {index + 1} *
                    </Label>
                    <Textarea
                      id={`instruction-${index}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder="Describe this step..."
                      rows={2}
                      className={errors.instructions ? "border-red-500" : ""}
                    />
                  </div>
                  {formData.instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="px-2 self-end"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {errors.instructions && (
                <p className="text-sm text-red-500">{errors.instructions}</p>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={addInstruction}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tags</h3>

            <div className="space-y-2">
              <Label htmlFor="newTag">Add Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  placeholder="Enter tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(
                      "newTag",
                    ) as HTMLInputElement;
                    if (input.value) {
                      addTag(input.value);
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes, tips, or variations..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Recipe"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
