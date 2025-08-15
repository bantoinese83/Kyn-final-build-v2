// PolicyDetailDialog Component - Displays detailed policy information in a dialog
// Extracted from PrivacyPolicy.tsx to improve maintainability and reusability

import {
  X,
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PolicySection {
  id: string;
  title: string;
  icon: any;
  color: string;
  content: React.ReactNode;
}

interface PolicyDetailDialogProps {
  section: PolicySection | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function PolicyDetailDialog({
  section,
  isOpen,
  onClose,
  className = "",
}: PolicyDetailDialogProps) {
  if (!section) return null;

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
  const iconColor = getIconColor(section.color);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-full bg-${section.color}/10`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <DialogTitle className="text-2xl font-bold text-dark-blue">
              {section.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">{section.content}</div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
