// GameForm Component - Handles game creation and editing
// Extracted from Games.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import { X, Save, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateGameData {
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  rules: string;
  equipment: string[];
}

interface FamilyGame {
  id: string;
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isActive: boolean;
  currentChampion?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  totalPlays: number;
  tags: string[];
  rules?: string;
  equipment?: string[];
  lastPlayed?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface GameFormProps {
  game?: CreateGameData | FamilyGame | null;
  isEditMode: boolean;
  onSubmit: (gameData: CreateGameData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

const GAME_CATEGORIES = [
  "Board Games",
  "Card Games",
  "Outdoor",
  "Puzzles",
  "Video Games",
  "Party Games",
  "Educational",
  "Strategy",
  "Sports",
  "Creative",
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

export function GameForm({
  game,
  isEditMode,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}: GameFormProps) {
  const [formData, setFormData] = useState<CreateGameData>({
    title: "",
    category: "",
    description: "",
    players: "",
    duration: "",
    difficulty: "Easy",
    tags: [],
    rules: "",
    equipment: [],
  });

  const [newTag, setNewTag] = useState("");
  const [newEquipment, setNewEquipment] = useState("");

  useEffect(() => {
    if (game) {
      if ("id" in game) {
        // It's a FamilyGame, convert to CreateGameData
        setFormData({
          title: game.title,
          category: game.category,
          description: game.description,
          players: game.players,
          duration: game.duration,
          difficulty: game.difficulty,
          tags: game.tags,
          rules: game.rules || "",
          equipment: game.equipment || [],
        });
      } else {
        // It's already CreateGameData
        setFormData(game);
      }
    }
  }, [game]);

  const handleInputChange = (field: keyof CreateGameData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof CreateGameData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleArrayChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleArrayChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const addEquipment = () => {
    if (
      newEquipment.trim() &&
      !formData.equipment.includes(newEquipment.trim())
    ) {
      handleArrayChange("equipment", [
        ...formData.equipment,
        newEquipment.trim(),
      ]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipmentToRemove: string) => {
    handleArrayChange(
      "equipment",
      formData.equipment.filter((eq) => eq !== equipmentToRemove),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.category.trim()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.category.trim() &&
      formData.description.trim()
    );
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-dark-blue">
          {isEditMode ? "Edit Game" : "Create New Game"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Update your family game details"
            : "Add a new game to your family's collection"}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Game Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Family Monopoly Night"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GAME_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="players"
                className="text-sm font-medium text-gray-700"
              >
                Number of Players
              </Label>
              <Input
                id="players"
                value={formData.players}
                onChange={(e) => handleInputChange("players", e.target.value)}
                placeholder="e.g., 2-6 players"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-sm font-medium text-gray-700"
              >
                Duration
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 30-60 minutes"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="difficulty"
              className="text-sm font-medium text-gray-700"
            >
              Difficulty Level
            </Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                handleInputChange(
                  "difficulty",
                  value as "Easy" | "Medium" | "Hard",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the game and what makes it fun for families..."
              rows={3}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
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

          {/* Equipment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Equipment Needed
            </Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Add equipment..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addEquipment())
                }
              />
              <Button
                type="button"
                onClick={addEquipment}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEquipment(item)}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label
              htmlFor="rules"
              className="text-sm font-medium text-gray-700"
            >
              Game Rules
            </Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => handleInputChange("rules", e.target.value)}
              placeholder="Explain the basic rules and how to play..."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Game" : "Create Game"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
