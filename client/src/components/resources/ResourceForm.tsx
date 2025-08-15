// ResourceForm Component - Handles resource creation and editing
// Extracted from Resources.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Shield,
  Phone,
  MapPin,
  Globe,
  Mail,
  Clock,
  CheckCircle,
  Heart,
  Award,
  Users,
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
import { Switch } from "@/components/ui/switch";

interface ResourceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  itemCount: number;
}

interface ResourceVendor {
  id: string;
  name: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  tags: string[];
  isVerified: boolean;
  isEmergencyContact: boolean;
  averageRating: number;
  reviewCount: number;
  category: {
    id: string;
    title: string;
    icon: string;
  };
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ResourceFormProps {
  resource?: ResourceVendor | null;
  categories: ResourceCategory[];
  onSave: (resource: {
    categoryId: string;
    name: string;
    description: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    tags: string[];
    isVerified: boolean;
    isEmergencyContact: boolean;
  }) => void;
  onCancel: () => void;
  isEditing: boolean;
  className?: string;
}

export function ResourceForm({
  resource,
  categories,
  onSave,
  onCancel,
  isEditing,
  className = "",
}: ResourceFormProps) {
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    tags: "",
    isVerified: false,
    isEmergencyContact: false,
  });

  useEffect(() => {
    if (resource && isEditing) {
      setFormData({
        categoryId: resource.category.id,
        name: resource.name,
        description: resource.description,
        website: resource.website || "",
        phone: resource.phone || "",
        email: resource.email || "",
        address: resource.address || "",
        tags: resource.tags.join(", "),
        isVerified: resource.isVerified,
        isEmergencyContact: resource.isEmergencyContact,
      });
    }
  }, [resource, isEditing]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resourceData = {
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      website: formData.website || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      isVerified: formData.isVerified,
      isEmergencyContact: formData.isEmergencyContact,
    };

    onSave(resourceData);
  };

  const isFormValid = () => {
    return (
      formData.categoryId && formData.name.trim() && formData.description.trim()
    );
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      shield: Shield,
      star: Shield,
      phone: Phone,
      mapPin: MapPin,
      globe: Globe,
      mail: Mail,
      clock: Clock,
      checkCircle: CheckCircle,
      heart: Heart,
      award: Award,
      users: Users,
    };
    return iconMap[iconName] || Shield;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>{isEditing ? "Edit Resource" : "Add New Resource"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-gray-700"
            >
              Category *
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.title}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Resource Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., ABC Plumbing Services, Dr. Smith Pediatrics"
              required
            />
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
              placeholder="Describe the service, what makes them reliable, any special notes..."
              rows={4}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Website and Address */}
          <div className="space-y-2">
            <Label
              htmlFor="website"
              className="text-sm font-medium text-gray-700"
            >
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-gray-700"
            >
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main St, City, State 12345"
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
              placeholder="reliable, affordable, emergency, 24/7 (separate with commas)"
            />
            <p className="text-xs text-gray-500">
              Add tags to help organize and find resources later
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="isVerified"
                  className="text-sm font-medium text-gray-700"
                >
                  Verified Resource
                </Label>
                <p className="text-xs text-gray-500">
                  Mark as verified if you've personally used this service
                </p>
              </div>
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) =>
                  handleInputChange("isVerified", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="isEmergencyContact"
                  className="text-sm font-medium text-gray-700"
                >
                  Emergency Contact
                </Label>
                <p className="text-xs text-gray-500">
                  Mark as emergency contact for urgent situations
                </p>
              </div>
              <Switch
                id="isEmergencyContact"
                checked={formData.isEmergencyContact}
                onCheckedChange={(checked) =>
                  handleInputChange("isEmergencyContact", checked)
                }
              />
            </div>
          </div>

          {/* Info Boxes */}
          {formData.isVerified && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Verified Resource</p>
                  <p>
                    This resource will be marked as verified, indicating you've
                    personally used their services.
                  </p>
                </div>
              </div>
            </div>
          )}

          {formData.isEmergencyContact && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Emergency Contact</p>
                  <p>
                    This resource will be highlighted as an emergency contact
                    for urgent situations.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <span>{isEditing ? "Update" : "Create"} Resource</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
