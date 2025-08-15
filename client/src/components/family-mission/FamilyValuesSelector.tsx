// FamilyValuesSelector Component - Handles family values selection
// Extracted from FamilyMission.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Heart,
  Users,
  Star,
  Leaf,
  Mountain,
  Palette,
  Gift,
  Book,
  Sun,
  Home,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FamilyValuesSelectorProps {
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  className?: string;
}

const valueOptions = [
  {
    id: "Love",
    name: "Love",
    icon: Heart,
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    id: "Respect",
    name: "Respect",
    icon: Users,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "Honesty",
    name: "Honesty",
    icon: Star,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "Growth",
    name: "Growth",
    icon: Leaf,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "Adventure",
    name: "Adventure",
    icon: Mountain,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "Creativity",
    name: "Creativity",
    icon: Palette,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "Service",
    name: "Service",
    icon: Gift,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    id: "Wisdom",
    name: "Wisdom",
    icon: Book,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "Joy",
    name: "Joy",
    icon: Sun,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "Unity",
    name: "Unity",
    icon: Home,
    color: "bg-teal-100 text-teal-800 border-teal-200",
  },
  {
    id: "Strength",
    name: "Strength",
    icon: Shield,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    id: "Faith",
    name: "Faith",
    icon: Sparkles,
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
];

export function FamilyValuesSelector({
  selectedValues,
  onValuesChange,
  className = "",
}: FamilyValuesSelectorProps) {
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onValuesChange(selectedValues.filter((v) => v !== value));
    } else {
      if (selectedValues.length < 5) {
        onValuesChange([...selectedValues, value]);
      }
    }
  };

  const isValueSelected = (value: string) => selectedValues.includes(value);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Family Values
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select up to 5 core values that define your family (currently{" "}
          {selectedValues.length}/5)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {valueOptions.map((option) => {
            const Icon = option.icon;
            const selected = isValueSelected(option.id);

            return (
              <Button
                key={option.id}
                variant={selected ? "default" : "outline"}
                onClick={() => toggleValue(option.id)}
                disabled={!selected && selectedValues.length >= 5}
                className={`h-auto p-3 flex flex-col items-center space-y-2 transition-all duration-200 ${
                  selected
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{option.name}</span>
              </Button>
            );
          })}
        </div>

        {selectedValues.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Selected Values:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((value) => {
                const option = valueOptions.find((v) => v.id === value);
                return (
                  <Badge
                    key={value}
                    className={`${option?.color} cursor-pointer hover:opacity-80`}
                    onClick={() => toggleValue(value)}
                  >
                    {option?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
