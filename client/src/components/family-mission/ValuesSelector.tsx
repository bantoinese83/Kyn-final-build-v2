// ValuesSelector Component - Handles core values selection functionality
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Heart,
  Users,
  Leaf,
  Mountain,
  Palette,
  Gift,
  Book,
  Sun,
  Home,
  Shield,
} from "lucide-react";

interface FamilyValue {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface ValuesSelectorProps {
  selectedValues: FamilyValue[];
  onValueToggle: (value: FamilyValue) => void;
  className?: string;
}

// Available family values with icons
const availableValues: FamilyValue[] = [
  {
    id: "1",
    name: "Love",
    icon: <Heart className="w-5 h-5" />,
    description: "Unconditional care and affection",
  },
  {
    id: "2",
    name: "Respect",
    icon: <Users className="w-5 h-5" />,
    description: "Honoring each other's dignity",
  },
  {
    id: "3",
    name: "Honesty",
    icon: <Star className="w-5 h-5" />,
    description: "Truth and transparency",
  },
  {
    id: "4",
    name: "Growth",
    icon: <Leaf className="w-5 h-5" />,
    description: "Continuous learning and improvement",
  },
  {
    id: "5",
    name: "Adventure",
    icon: <Mountain className="w-5 h-5" />,
    description: "Embracing new experiences",
  },
  {
    id: "6",
    name: "Creativity",
    icon: <Palette className="w-5 h-5" />,
    description: "Expressing imagination",
  },
  {
    id: "7",
    name: "Service",
    icon: <Gift className="w-5 h-5" />,
    description: "Helping others",
  },
  {
    id: "8",
    name: "Wisdom",
    icon: <Book className="w-5 h-5" />,
    description: "Making thoughtful decisions",
  },
  {
    id: "9",
    name: "Joy",
    icon: <Sun className="w-5 h-5" />,
    description: "Finding happiness together",
  },
  {
    id: "10",
    name: "Unity",
    icon: <Home className="w-5 h-5" />,
    description: "Standing together as one",
  },
  {
    id: "11",
    name: "Strength",
    icon: <Shield className="w-5 h-5" />,
    description: "Resilience in challenges",
  },
  {
    id: "12",
    name: "Faith",
    icon: <Star className="w-5 h-5" />,
    description: "Belief in something greater",
  },
];

export function ValuesSelector({
  selectedValues,
  onValueToggle,
  className = "",
}: ValuesSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-600" />
          <span>Core Values</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableValues.map((value) => {
            const isSelected = selectedValues.some((v) => v.id === value.id);
            return (
              <div
                key={value.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onValueToggle(value)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">{value.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {value.name}
                    </h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
