// HealthRecordForm Component - Handles health record creation and editing
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Tag,
  Calendar,
  User,
  Building,
  FileText,
} from "lucide-react";
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

interface CreateHealthRecordData {
  title: string;
  type: string; // Use type instead of category
  description: string;
  date: string;
  priority: string;
  tags: string[];
  doctorName?: string;
  facility?: string;
  notes?: string;
  patientId: string;
}

interface HealthRecord {
  id: string;
  title: string;
  type: string; // Use type instead of category to match service interface
  description: string;
  date: string;
  priority: string;
  tags: string[];
  doctorName?: string;
  facility?: string;
  notes?: string;
  patient: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface HealthRecordFormProps {
  record?: CreateHealthRecordData | HealthRecord | null;
  isEditMode: boolean;
  onSubmit: (recordData: CreateHealthRecordData) => void;
  onCancel: () => void;
  loading?: boolean;
  patients: Array<{ id: string; name: string; email: string }>;
  className?: string;
}

const HEALTH_CATEGORIES = [
  { value: "checkup", label: "Check-up" },
  { value: "specialist", label: "Specialist Visit" },
  { value: "medication", label: "Medication" },
  { value: "dental", label: "Dental" },
  { value: "emergency", label: "Emergency" },
  { value: "surgery", label: "Surgery" },
  { value: "vaccination", label: "Vaccination" },
  { value: "lab-work", label: "Lab Work" },
  { value: "imaging", label: "Imaging" },
  { value: "therapy", label: "Therapy" },
  { value: "other", label: "Other" },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "text-green-600" },
  { value: "normal", label: "Normal", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "urgent", label: "Urgent", color: "text-red-600" },
];

export function HealthRecordForm({
  record,
  isEditMode,
  onSubmit,
  onCancel,
  loading = false,
  patients,
  className = "",
}: HealthRecordFormProps) {
  const [formData, setFormData] = useState<CreateHealthRecordData>({
    title: "",
    type: "checkup", // Use type instead of category
    description: "",
    date: "",
    priority: "normal",
    tags: [],
    doctorName: "",
    facility: "",
    notes: "",
    patientId: "",
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (record) {
      if ("id" in record) {
        // It's a HealthRecord, convert to CreateHealthRecordData
        setFormData({
          title: record.title,
          type: record.type, // Use type instead of category
          description: record.description,
          date: record.date,
          priority: record.priority,
          tags: record.tags,
          doctorName: record.doctorName || "",
          facility: record.facility || "",
          notes: record.notes || "",
          patientId: record.patient.id,
        });
      } else {
        // It's already CreateHealthRecordData
        setFormData(record);
      }
    } else {
      // Set default date to today
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
        patientId: patients.length > 0 ? patients[0].id : "",
      }));
    }
  }, [record, patients]);

  const handleInputChange = (
    field: keyof CreateHealthRecordData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.title.trim() &&
      formData.type &&
      formData.date &&
      formData.patientId
    ) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.type &&
      formData.date &&
      formData.patientId
    );
  };

  const getPriorityColor = (priority: string) => {
    const priorityItem = PRIORITY_LEVELS.find((p) => p.value === priority);
    return priorityItem?.color || "text-gray-600";
  };

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-dark-blue">
          {isEditMode ? "Edit Health Record" : "Add New Health Record"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Update the health record details"
            : "Record important health information for family members"}
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
                Record Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Annual Physical Exam"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="patientId"
                className="text-sm font-medium text-gray-700"
              >
                Patient *
              </Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleInputChange("patientId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {HEALTH_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
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

            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="text-sm font-medium text-gray-700"
              >
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              placeholder="Describe the health record, symptoms, diagnosis, or treatment..."
              rows={4}
              required
            />
          </div>

          {/* Doctor and Facility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="doctorName"
                className="text-sm font-medium text-gray-700"
              >
                Doctor/Provider Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={(e) =>
                    handleInputChange("doctorName", e.target.value)
                  }
                  placeholder="e.g., Dr. Smith"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="facility"
                className="text-sm font-medium text-gray-700"
              >
                Facility/Hospital
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="facility"
                  value={formData.facility}
                  onChange={(e) =>
                    handleInputChange("facility", e.target.value)
                  }
                  placeholder="e.g., City General Hospital"
                  className="pl-10"
                />
              </div>
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

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Additional Notes
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information, follow-up instructions, or special notes..."
                rows={3}
                className="pl-10"
              />
            </div>
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
                  {isEditMode ? "Update Record" : "Create Record"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
