// CreateStoryDialog Component - Handles story creation
// Extracted from FamilyHistory.tsx to improve maintainability and reusability

import { useState } from "react";
import { X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StoryFormData {
  title: string;
  category: "wisdom" | "childhood" | "love" | "adventure";
  content: string;
  era: string;
  type: "story" | "photo" | "video" | "voice";
  tags: string;
}

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (storyData: StoryFormData) => void;
  submitting: boolean;
  className?: string;
}

export function CreateStoryDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  className = "",
}: CreateStoryDialogProps) {
  const [formData, setFormData] = useState<StoryFormData>({
    title: "",
    category: "wisdom",
    content: "",
    era: "",
    type: "story",
    tags: "",
  });

  const handleInputChange = (field: keyof StoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      category: "wisdom",
      content: "",
      era: "",
      type: "story",
      tags: "",
    });
    onOpenChange(false);
  };

  const isFormValid = () => {
    return (
      formData.title.trim() && formData.content.trim() && formData.era.trim()
    );
  };

  const eraOptions = [
    "Pre-1900s",
    "1900s-1920s",
    "1930s-1940s",
    "1950s-1960s",
    "1970s-1980s",
    "1990s-2000s",
    "2010s-2020s",
    "Present Day",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Share a Family Story
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Story Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a memorable title for your story"
              className="w-full"
              required
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  handleInputChange("category", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wisdom">
                    🧠 Wisdom & Life Lessons
                  </SelectItem>
                  <SelectItem value="childhood">
                    👶 Childhood Memories
                  </SelectItem>
                  <SelectItem value="love">💕 Love & Relationships</SelectItem>
                  <SelectItem value="adventure">
                    🗺️ Adventures & Travel
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="text-sm font-medium text-gray-700"
              >
                Story Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">📝 Written Story</SelectItem>
                  <SelectItem value="photo">📷 Photo Story</SelectItem>
                  <SelectItem value="video">🎥 Video Story</SelectItem>
                  <SelectItem value="voice">🎤 Voice Recording</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Era */}
          <div className="space-y-2">
            <Label htmlFor="era" className="text-sm font-medium text-gray-700">
              Time Period/Era *
            </Label>
            <Select
              value={formData.era}
              onValueChange={(value) => handleInputChange("era", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="When did this story take place?" />
              </SelectTrigger>
              <SelectContent>
                {eraOptions.map((era) => (
                  <SelectItem key={era} value={era}>
                    {era}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-gray-700"
            >
              Story Content *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Share the details of your family story..."
              rows={6}
              className="resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags (optional)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="family, vacation, wedding, graduation (separate with commas)"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Add tags to help family members find and organize stories
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? "Creating..." : "Share Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
