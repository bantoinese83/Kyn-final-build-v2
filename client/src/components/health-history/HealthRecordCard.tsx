// HealthRecordCard Component - Displays individual health records
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import {
  Calendar,
  User,
  Shield,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HealthRecord {
  id: string;
  title: string;
  type: string; // Use type instead of category
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

interface HealthRecordCardProps {
  record: HealthRecord;
  onEdit: (record: HealthRecord) => void;
  onDelete: (recordId: string) => void;
  className?: string;
}

export function HealthRecordCard({
  record,
  onEdit,
  onDelete,
  className = "",
}: HealthRecordCardProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Shield className="h-4 w-4 text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "checkup":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "specialist":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "medication":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "vaccination":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {record.patient.avatar ? (
                <AvatarImage
                  src={record.patient.avatar}
                  alt={record.patient.name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {record.patient.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {record.patient.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(record.date)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${getCategoryColor(record.type)}`}>
              {record.type}
            </Badge>
            <Badge className={`${getPriorityColor(record.priority)}`}>
              {getPriorityIcon(record.priority)} {record.priority}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {record.title}
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {truncateDescription(record.description)}
          </p>
        </div>

        {/* Doctor & Facility */}
        {(record.doctorName || record.facility) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Medical Details
              </span>
            </div>
            {record.doctorName && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span> {record.doctorName}
              </p>
            )}
            {record.facility && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Facility:</span> {record.facility}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {record.tags.map((tag, index) => (
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

        {/* Notes */}
        {record.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 italic">
              <span className="font-medium">Notes:</span> {record.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(record)}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(record.id)}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
