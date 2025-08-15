// MilestoneForm Component - Handles milestone creation and editing
// Extracted from Milestones.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
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

interface Milestone {
  id: string;
  familyId: string;
  achieverId: string;
  title: string;
  category: string;
  description: string;
  date: string;
  era?: string;
  isRecent: boolean;
  loves: number;
  comments: number;
  tags: string[];
  createdAt: string;
  achiever: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface MilestoneFormProps {
  milestone?: Milestone | null;
  familyMembers: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  onSave: (
    milestone: Omit<
      Milestone,
      "id" | "createdAt" | "loves" | "comments" | "isRecent" | "achiever"
    >,
  ) => void;
  onCancel: () => void;
  isEditing: boolean;
  className?: string;
}

export function MilestoneForm({
  milestone,
  familyMembers,
  onSave,
  onCancel,
  isEditing,
  className = "",
}: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "achievement",
    description: "",
    date: "",
    era: "",
    tags: "",
    achieverId: "",
  });

  useEffect(() => {
    if (milestone && isEditing) {
      setFormData({
        title: milestone.title,
        category: milestone.category,
        description: milestone.description,
        date: milestone.date,
        era: milestone.era || "",
        tags: milestone.tags.join(", "),
        achieverId: milestone.achieverId,
      });
    }
  }, [milestone, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const milestoneData = {
      familyId: "demo-family-id", // This should come from context
      achieverId: formData.achieverId,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      era: formData.era || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    onSave(milestoneData);
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.date &&
      formData.achieverId
    );
  };

  const categories = [
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "achievement", label: "Achievement" },
    { value: "career", label: "Career" },
    { value: "education", label: "Education" },
    { value: "family", label: "Family Event" },
    { value: "milestone", label: "Life Milestone" },
  ];

  const eras = [
    { value: "infant", label: "Infant (0-2 years)" },
    { value: "toddler", label: "Toddler (2-5 years)" },
    { value: "child", label: "Child (5-12 years)" },
    { value: "teen", label: "Teen (13-19 years)" },
    { value: "young-adult", label: "Young Adult (20-29 years)" },
    { value: "adult", label: "Adult (30-59 years)" },
    { value: "senior", label: "Senior (60+ years)" },
  ];

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {isEditing ? "Edit Milestone" : "Add New Milestone"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Milestone Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Graduated from High School, First Steps, 25th Wedding Anniversary"
              required
            />
          </div>

          {/* Category */}
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Achiever */}
          <div className="space-y-2">
            <Label
              htmlFor="achiever"
              className="text-sm font-medium text-gray-700"
            >
              Who achieved this? *
            </Label>
            <Select
              value={formData.achieverId}
              onValueChange={(value) => handleInputChange("achieverId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select family member" />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          {/* Era */}
          <div className="space-y-2">
            <Label htmlFor="era" className="text-sm font-medium text-gray-700">
              Life Era
            </Label>
            <Select
              value={formData.era}
              onValueChange={(value) => handleInputChange("era", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select life era (optional)" />
              </SelectTrigger>
              <SelectContent>
                {eras.map((era) => (
                  <SelectItem key={era.value} value={era.value}>
                    {era.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
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
              placeholder="Describe this milestone in detail..."
              rows={4}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="e.g., graduation, education, celebration (separate with commas)"
            />
            <p className="text-xs text-gray-500">
              Add tags to help organize and find milestones later
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Update" : "Create"} Milestone</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
