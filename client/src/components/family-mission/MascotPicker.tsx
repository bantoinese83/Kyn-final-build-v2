// MascotPicker Component - Handles family mascot selection functionality
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface MascotOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface MascotPickerProps {
  selectedMascot: MascotOption | null;
  onMascotSelect: (mascot: MascotOption) => void;
  className?: string;
}

// Available mascot options
const availableMascots: MascotOption[] = [
  {
    id: "1",
    name: "Oak Tree",
    icon: "🌳",
    description: "Strength and longevity",
    category: "Nature",
  },
  {
    id: "2",
    name: "Eagle",
    icon: "🦅",
    description: "Vision and freedom",
    category: "Animals",
  },
  {
    id: "3",
    name: "Lion",
    icon: "🦁",
    description: "Courage and leadership",
    category: "Animals",
  },
  {
    id: "4",
    name: "Dolphin",
    icon: "🐬",
    description: "Intelligence and playfulness",
    category: "Animals",
  },
  {
    id: "5",
    name: "Mountain",
    icon: "⛰️",
    description: "Stability and grandeur",
    category: "Nature",
  },
  {
    id: "6",
    name: "Star",
    icon: "⭐",
    description: "Guidance and inspiration",
    category: "Symbols",
  },
  {
    id: "7",
    name: "Heart",
    icon: "❤️",
    description: "Love and compassion",
    category: "Symbols",
  },
  {
    id: "8",
    name: "Anchor",
    icon: "⚓",
    description: "Security and hope",
    category: "Symbols",
  },
];

export function MascotPicker({
  selectedMascot,
  onMascotSelect,
  className = "",
}: MascotPickerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Family Mascot</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableMascots.map((mascot) => {
            const isSelected = selectedMascot?.id === mascot.id;
            return (
              <div
                key={mascot.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onMascotSelect(mascot)}
              >
                <div className="text-4xl mb-2">{mascot.icon}</div>
                <h3 className="font-semibold text-gray-900">{mascot.name}</h3>
                <p className="text-sm text-gray-600">{mascot.description}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {mascot.category}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
