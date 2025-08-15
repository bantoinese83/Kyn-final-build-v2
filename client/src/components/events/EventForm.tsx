// EventForm Component - Handles event creation and editing
// Extracted from Events.tsx for better modularity and maintainability

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
import { X, Save, Calendar, MapPin, Gift } from "lucide-react";
import { FamilyEvent } from "@/types/events";

interface EventFormProps {
  event?: FamilyEvent;
  onSubmit: (eventData: any) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
  className?: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  type: string;
  isRecurring: boolean;
  reminders: boolean;
  tags: string[];
  registryLinks: string[];
}

const eventTypes = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "gathering", label: "Family Gathering" },
  { value: "holiday", label: "Holiday" },
  { value: "milestone", label: "Milestone" },
  { value: "activity", label: "Activity" },
];

export function EventForm({
  event,
  onSubmit,
  onCancel,
  mode,
  className = "",
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    type: "gathering",
    isRecurring: false,
    reminders: false,
    tags: [],
    registryLinks: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (event && mode === "edit") {
      setFormData({
        title: event.title,
        description: event.description || "",
        date:
          event.date instanceof Date
            ? event.date.toISOString().split("T")[0]
            : "",
        time: event.time || "",
        endTime: event.endTime || "",
        location: event.location || "",
        type: event.type,
        isRecurring: event.isRecurring || false,
        reminders: event.reminders || false,
        tags: event.tags || [],
        registryLinks: event.registryLinks || [],
      });
    }
  }, [event, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    }

    if (formData.time && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.time}`);
      const endTime = new Date(`2000-01-01T${formData.endTime}`);
      if (startTime >= endTime) {
        newErrors.endTime = "End time must be after start time";
      }
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
      const eventData = {
        ...formData,
        date: new Date(formData.date),
        tags: formData.tags.filter((tag) => tag.trim()),
        registryLinks: formData.registryLinks.filter((link) => link.trim()),
      };

      await onSubmit(eventData);
    } catch (error) {
      console.error("Failed to submit event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

  const addRegistryLink = (link: string) => {
    if (link.trim() && !formData.registryLinks.includes(link.trim())) {
      handleInputChange("registryLinks", [
        ...formData.registryLinks,
        link.trim(),
      ]);
    }
  };

  const removeRegistryLink = (linkToRemove: string) => {
    handleInputChange(
      "registryLinks",
      formData.registryLinks.filter((link) => link !== linkToRemove),
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {mode === "create" ? "Create New Event" : "Edit Event"}
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
            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter event title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your event..."
                rows={3}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Date & Time</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={errors.endTime ? "border-red-500" : ""}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location</h3>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter event location"
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Options</h3>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) =>
                    handleInputChange("isRecurring", checked)
                  }
                />
                <Label htmlFor="isRecurring">Recurring Event</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminders"
                  checked={formData.reminders}
                  onCheckedChange={(checked) =>
                    handleInputChange("reminders", checked)
                  }
                />
                <Label htmlFor="reminders">Send Reminders</Label>
              </div>
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

          {/* Registry Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Gift Registry</h3>

            <div className="space-y-2">
              <Label htmlFor="newRegistryLink">Add Registry Link</Label>
              <div className="flex gap-2">
                <Input
                  id="newRegistryLink"
                  type="url"
                  placeholder="Enter registry URL"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRegistryLink(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById(
                      "newRegistryLink",
                    ) as HTMLInputElement;
                    if (input.value) {
                      addRegistryLink(input.value);
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {formData.registryLinks.length > 0 && (
              <div className="space-y-2">
                {formData.registryLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                  >
                    <Gift className="w-4 h-4 text-gray-400" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-blue-600 hover:underline truncate"
                    >
                      {link}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeRegistryLink(link)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                  ? "Create Event"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
