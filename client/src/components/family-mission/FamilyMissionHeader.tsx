// FamilyMissionHeader Component - Header section with navigation and edit controls
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Edit3, Save, X, ArrowLeft } from "lucide-react";

interface FamilyMissionHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  className?: string;
}

export function FamilyMissionHeader({
  isEditing,
  onEditToggle,
  onSave,
  className = "",
}: FamilyMissionHeaderProps) {
  return (
    <div className={`bg-white border-b border-light-blue-gray/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Family Mission
              </h1>
              <p className="text-gray-600">
                Define your family's purpose and values
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={onEditToggle}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={onSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Mission
                </Button>
              </>
            ) : (
              <Button onClick={onEditToggle}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Mission
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
