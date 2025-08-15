// PolicySectionCard Component - Displays individual privacy policy sections
// Extracted from PrivacyPolicy.tsx to improve maintainability and reusability

import {
  ChevronRight,
  Shield,
  Eye,
  Database,
  Lock,
  UserCheck,
  Globe,
  FileText,
  AlertCircle,
  Heart,
  Users,
  Camera,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PolicySection {
  id: string;
  title: string;
  icon: any;
  color: string;
  content: React.ReactNode;
  description?: string;
}

interface PolicySectionCardProps {
  section: PolicySection;
  onOpenDialog: (sectionId: string) => void;
  className?: string;
}

export function PolicySectionCard({
  section,
  onOpenDialog,
  className = "",
}: PolicySectionCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      "olive-green": "bg-olive-green/10 border-olive-green/20 text-olive-green",
      "warm-brown": "bg-warm-brown/10 border-warm-brown/20 text-warm-brown",
      "red-600": "bg-red-100 border-red-200 text-red-600",
      "blue-600": "bg-blue-100 border-blue-200 text-blue-600",
      "purple-600": "bg-purple-100 border-purple-200 text-purple-600",
      "green-600": "bg-green-100 border-green-200 text-green-600",
    };
    return colorMap[color] || "bg-gray-100 border-gray-200 text-gray-600";
  };

  const getIconColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      "olive-green": "text-olive-green",
      "warm-brown": "text-warm-brown",
      "red-600": "text-red-600",
      "blue-600": "text-blue-600",
      "purple-600": "text-purple-600",
      "green-600": "text-green-600",
    };
    return colorMap[color] || "text-gray-600";
  };

  const Icon = section.icon;
  const colorClasses = getColorClasses(section.color);
  const iconColor = getIconColor(section.color);

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${colorClasses}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-dark-blue">
                {section.title}
              </CardTitle>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {section.description}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="outline"
          onClick={() => onOpenDialog(section.id)}
          className="w-full justify-between"
        >
          <span>Read Full Details</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
