// MilestoneCard Component - Displays individual milestones
// Extracted from Milestones.tsx to improve maintainability and reusability

import {
  Calendar,
  Heart,
  MessageCircle,
  Edit3,
  Trash2,
  Star,
  Users,
  Award,
  Target,
  Gift,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onLove: (milestoneId: string) => void;
  onComment: (milestoneId: string) => void;
  onGift: (milestoneId: string) => void;
  className?: string;
}

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  onLove,
  onComment,
  onGift,
  className = "",
}: MilestoneCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "birthday":
        return <Star className="h-5 w-5" />;
      case "anniversary":
        return <Heart className="h-5 w-5" />;
      case "achievement":
        return <Trophy className="h-5 w-5" />;
      case "career":
        return <Award className="h-5 w-5" />;
      case "education":
        return <Target className="h-5 w-5" />;
      case "family":
        return <Users className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "birthday":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "anniversary":
        return "bg-red-100 text-red-800 border-red-200";
      case "achievement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "career":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "education":
        return "bg-green-100 text-green-800 border-green-200";
      case "family":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateDescription = (
    description: string,
    maxLength: number = 120,
  ) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const isRecent = (dateString: string) => {
    const milestoneDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - milestoneDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className} ${
        isRecent(milestone.date) ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {milestone.achiever.avatar ? (
                <AvatarImage
                  src={milestone.achiever.avatar}
                  alt={milestone.achiever.name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {milestone.achiever.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {milestone.achiever.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(milestone.date)}</span>
                {milestone.era && (
                  <>
                    <span>•</span>
                    <span className="italic">{milestone.era}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${getCategoryColor(milestone.category)}`}>
              <div className="flex items-center space-x-1">
                {getCategoryIcon(milestone.category)}
                <span>{milestone.category}</span>
              </div>
            </Badge>
            {isRecent(milestone.date) && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Recent
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {milestone.title}
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {truncateDescription(milestone.description)}
          </p>
        </div>

        {/* Tags */}
        {milestone.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {milestone.tags.map((tag, index) => (
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

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>{milestone.loves}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>{milestone.comments}</span>
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Created {new Date(milestone.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLove(milestone.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Heart className="h-3 w-3 mr-1" />
              Love
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComment(milestone.id)}
              className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Comment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGift(milestone.id)}
              className="text-xs text-green-600 border-green-200 hover:bg-green-50"
            >
              <Gift className="h-3 w-3 mr-1" />
              Gift
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(milestone)}
              className="text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(milestone.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
