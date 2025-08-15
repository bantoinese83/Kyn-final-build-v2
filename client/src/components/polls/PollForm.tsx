// PollForm Component - Handles poll creation and editing
// Extracted from Polls.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import { X, Save, Plus, Tag, Calendar } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface CreatePollData {
  title: string;
  description: string;
  type: "multiple_choice" | "yes_no" | "rating" | "ranking";
  endDate: string;
  isAnonymous: boolean;
  allowMultipleVotes: boolean;
  maxVotes: number;
  options: string[];
  tags: string[];
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  type: "multiple_choice" | "yes_no" | "rating" | "ranking";
  totalVotes: number;
  endDate: Date;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  options: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
    order?: number;
  }>;
  userVote?: {
    optionId: string;
    votedAt: string;
  };
  isActive: boolean;
  tags: string[];
  allowMultipleVotes: boolean;
  maxVotes?: number;
}

interface PollFormProps {
  poll?: CreatePollData | Poll | null;
  isEditMode: boolean;
  onSubmit: (pollData: CreatePollData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

const POLL_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "yes_no", label: "Yes/No" },
  { value: "rating", label: "Rating" },
  { value: "ranking", label: "Ranking" },
];

export function PollForm({
  poll,
  isEditMode,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}: PollFormProps) {
  const [formData, setFormData] = useState<CreatePollData>({
    title: "",
    description: "",
    type: "multiple_choice",
    endDate: "",
    isAnonymous: false,
    allowMultipleVotes: false,
    maxVotes: 1,
    options: ["", ""],
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (poll) {
      if ("id" in poll) {
        // It's a Poll, convert to CreatePollData
        setFormData({
          title: poll.title,
          description: poll.description || "",
          type: poll.type,
          endDate: new Date(poll.endDate).toISOString().slice(0, 16),
          isAnonymous: poll.isAnonymous,
          allowMultipleVotes: poll.allowMultipleVotes,
          maxVotes: poll.maxVotes || 1,
          options: poll.options.map((opt) => opt.text),
          tags: poll.tags || [],
        });
      } else {
        // It's already CreatePollData
        setFormData(poll);
      }
    } else {
      // Set default end date to 7 days from now
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      setFormData((prev) => ({
        ...prev,
        endDate: defaultEndDate.toISOString().split("T")[0],
      }));
    }
  }, [poll]);

  const handleInputChange = (
    field: keyof CreatePollData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof CreatePollData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      handleArrayChange("options", [...formData.options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const updatedOptions = formData.options.filter((_, i) => i !== index);
      handleArrayChange("options", updatedOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    handleArrayChange("options", updatedOptions);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.options.every((opt) => opt.trim())) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.options.every((opt) => opt.trim()) &&
      formData.endDate &&
      (!formData.allowMultipleVotes || formData.maxVotes > 0)
    );
  };

  const getMinOptions = () => {
    switch (formData.type) {
      case "yes_no":
        return 2;
      case "rating":
        return 1;
      case "ranking":
        return 2;
      default:
        return 2;
    }
  };

  const getMaxOptions = () => {
    switch (formData.type) {
      case "yes_no":
        return 2;
      case "rating":
        return 10;
      case "ranking":
        return 10;
      default:
        return 20;
    }
  };

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-dark-blue">
          {isEditMode ? "Edit Poll" : "Create New Poll"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Update your family poll details"
            : "Create a new poll to gather family opinions and make decisions together"}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Poll Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Where should we go on vacation?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide more context about this poll..."
                rows={3}
              />
            </div>
          </div>

          {/* Poll Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="text-sm font-medium text-gray-700"
              >
                Poll Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as CreatePollData["type"])
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select poll type" />
                </SelectTrigger>
                <SelectContent>
                  {POLL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="maxVotes"
                className="text-sm font-medium text-gray-700"
              >
                Max Votes
              </Label>
              <Input
                id="maxVotes"
                type="number"
                min="1"
                max={formData.options.length}
                value={formData.maxVotes}
                onChange={(e) =>
                  handleInputChange("maxVotes", parseInt(e.target.value) || 1)
                }
                disabled={!formData.allowMultipleVotes}
                className="w-full"
              />
            </div>
          </div>

          {/* Poll Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Poll Options * (Min: {getMinOptions()}, Max: {getMaxOptions()})
            </Label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    required
                  />
                  {formData.options.length > getMinOptions() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="px-3 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {formData.options.length < getMaxOptions() && (
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add new option..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addOption())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Poll Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Poll Settings</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Anonymous Voting
                </Label>
                <p className="text-xs text-gray-500">
                  Hide voter identities in results
                </p>
              </div>
              <Switch
                checked={formData.isAnonymous}
                onCheckedChange={(checked) =>
                  handleInputChange("isAnonymous", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Allow Multiple Votes
                </Label>
                <p className="text-xs text-gray-500">
                  Let users vote for multiple options
                </p>
              </div>
              <Switch
                checked={formData.allowMultipleVotes}
                onCheckedChange={(checked) =>
                  handleInputChange("allowMultipleVotes", checked)
                }
              />
            </div>
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
                  {isEditMode ? "Update Poll" : "Create Poll"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
