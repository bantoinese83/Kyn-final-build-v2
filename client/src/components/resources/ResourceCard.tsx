// ResourceCard Component - Displays individual resources/vendors
// Extracted from Resources.tsx to improve maintainability and reusability

import {
  Shield,
  Star,
  Phone,
  MapPin,
  Globe,
  Mail,
  Clock,
  CheckCircle,
  ExternalLink,
  Heart,
  Award,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface ResourceCardProps {
  resource: ResourceVendor;
  onEdit: (resource: ResourceVendor) => void;
  onDelete: (resourceId: string) => void;
  onFavorite: (resourceId: string) => void;
  onContact: (resource: ResourceVendor) => void;
  className?: string;
}

export function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onFavorite,
  onContact,
  className = "",
}: ResourceCardProps) {
  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      shield: Shield,
      star: Star,
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

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const CategoryIcon = getCategoryIcon(resource.category.icon);

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className} ${
        resource.isEmergencyContact ? "ring-2 ring-red-400" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                resource.isEmergencyContact
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {resource.name}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{resource.category.title}</span>
                {resource.isEmergencyContact && (
                  <>
                    <span>•</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Emergency Contact
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {resource.isVerified && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
              {resource.category.title}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {truncateText(resource.description)}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            {getRatingStars(resource.averageRating)}
          </div>
          <span className="text-sm text-gray-600">
            {resource.averageRating.toFixed(1)} ({resource.reviewCount} reviews)
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {resource.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{resource.phone}</span>
            </div>
          )}
          {resource.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{resource.email}</span>
            </div>
          )}
          {resource.address && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{truncateText(resource.address, 80)}</span>
            </div>
          )}
          {resource.website && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span className="text-blue-600 hover:underline cursor-pointer">
                {resource.website.replace(/^https?:\/\//, "")}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {resource.user.avatar ? (
                <AvatarImage
                  src={resource.user.avatar}
                  alt={resource.user.name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {resource.user.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs text-gray-600">
              Added by {resource.user.name}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(resource.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact(resource)}
              className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Phone className="h-3 w-3 mr-1" />
              Contact
            </Button>
            {resource.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resource.website, "_blank")}
                className="text-xs text-green-600 border-green-300 hover:bg-green-50"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Website
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFavorite(resource.id)}
              className="text-xs text-red-600 border-red-300 hover:bg-red-50"
            >
              <Heart className="h-3 w-3 mr-1" />
              Favorite
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(resource)}
              className="text-xs"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(resource.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
