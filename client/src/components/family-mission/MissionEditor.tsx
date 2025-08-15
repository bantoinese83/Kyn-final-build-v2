// MissionEditor Component - Handles mission statement editing functionality
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Edit3, Save, X } from "lucide-react";
import { FamilyMission as FamilyMissionType } from "@/types/shared";

interface MissionEditorProps {
  familyMission: FamilyMissionType;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onInputChange: (field: keyof FamilyMissionType, value: string) => void;
  className?: string;
}

export function MissionEditor({
  familyMission,
  isEditing,
  onEditToggle,
  onSave,
  onInputChange,
  className = "",
}: MissionEditorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-600" />
          <span>Mission Statement</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <Label htmlFor="statement">Mission Statement</Label>
              <Textarea
                id="statement"
                value={familyMission.statement}
                onChange={(e) => onInputChange("statement", e.target.value)}
                placeholder="Write your family's mission statement..."
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={familyMission.tagline}
                onChange={(e) => onInputChange("tagline", e.target.value)}
                placeholder="A short, memorable phrase..."
              />
            </div>
            <div>
              <Label htmlFor="motto">Family Motto</Label>
              <Input
                id="motto"
                value={familyMission.familyMotto}
                onChange={(e) => onInputChange("familyMotto", e.target.value)}
                placeholder="Your family's guiding principle..."
              />
            </div>
            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                value={familyMission.foundedYear}
                onChange={(e) => onInputChange("foundedYear", e.target.value)}
                placeholder="e.g., 1985"
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-lg text-gray-800 leading-relaxed">
                {familyMission.statement || "No mission statement set yet."}
              </p>
            </div>
            {familyMission.tagline && (
              <div className="text-center">
                <p className="text-xl font-semibold text-green-700 italic">
                  "{familyMission.tagline}"
                </p>
              </div>
            )}
            {familyMission.familyMotto && (
              <div className="text-center">
                <p className="text-lg text-gray-600">
                  {familyMission.familyMotto}
                </p>
              </div>
            )}
            {familyMission.foundedYear && (
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  Founded {familyMission.foundedYear}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
