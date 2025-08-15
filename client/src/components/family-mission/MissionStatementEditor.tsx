// MissionStatementEditor Component - Handles mission statement editing
// Extracted from FamilyMission.tsx to improve maintainability and reusability

import { useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FamilyMission {
  id?: string;
  familyId: string;
  statement: string;
  tagline: string;
  familyMotto: string;
  foundedYear: string;
  values: string[];
  mascotId: string | null;
  mascotName: string | null;
}

interface MissionStatementEditorProps {
  mission: FamilyMission;
  onSave: (mission: FamilyMission) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEdit: () => void;
  className?: string;
}

export function MissionStatementEditor({
  mission,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  className = "",
}: MissionStatementEditorProps) {
  const [formData, setFormData] = useState<FamilyMission>(mission);

  const handleInputChange = (
    field: keyof FamilyMission,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData(mission);
    onCancel();
  };

  const isFormValid = () => {
    return (
      formData.statement.trim() &&
      formData.tagline.trim() &&
      formData.foundedYear.trim()
    );
  };

  if (!isEditing) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Mission Statement
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {mission.statement ? (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Mission Statement
                </Label>
                <p className="text-gray-900 text-lg leading-relaxed">
                  {mission.statement}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Tagline
                </Label>
                <p className="text-gray-700 italic">"{mission.tagline}"</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Family Motto
                </Label>
                <p className="text-gray-700 font-medium">
                  {mission.familyMotto}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Founded
                </Label>
                <p className="text-gray-700">{mission.foundedYear}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No mission statement defined yet
              </p>
              <Button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Mission Statement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Edit Mission Statement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="statement"
            className="text-sm font-medium text-gray-700"
          >
            Mission Statement *
          </Label>
          <Textarea
            id="statement"
            value={formData.statement}
            onChange={(e) => handleInputChange("statement", e.target.value)}
            placeholder="What is your family's purpose? What do you stand for?"
            rows={4}
            className="resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="tagline"
            className="text-sm font-medium text-gray-700"
          >
            Tagline *
          </Label>
          <Input
            id="tagline"
            value={formData.tagline}
            onChange={(e) => handleInputChange("tagline", e.target.value)}
            placeholder="A short, memorable phrase that captures your mission"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motto" className="text-sm font-medium text-gray-700">
            Family Motto
          </Label>
          <Input
            id="motto"
            value={formData.familyMotto}
            onChange={(e) => handleInputChange("familyMotto", e.target.value)}
            placeholder="A guiding principle or saying for your family"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="foundedYear"
            className="text-sm font-medium text-gray-700"
          >
            Founded Year *
          </Label>
          <Input
            id="foundedYear"
            type="number"
            value={formData.foundedYear}
            onChange={(e) => handleInputChange("foundedYear", e.target.value)}
            placeholder="When was your family established?"
            min="1800"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
