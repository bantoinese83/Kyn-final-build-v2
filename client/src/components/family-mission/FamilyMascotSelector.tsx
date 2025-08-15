// FamilyMascotSelector Component - Handles family mascot selection
// Extracted from FamilyMission.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Crown,
  Bird,
  TreePine,
  Lightbulb,
  Flame,
  Mountain,
  Compass,
  Shield,
  Anchor,
  Star,
  Gem,
  CircleDot,
  Building,
  Sunrise,
  Fish,
  Rocket,
  Key,
  Flower2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FamilyMascotSelectorProps {
  selectedMascot: string | null;
  onMascotChange: (mascot: string | null) => void;
  className?: string;
}

const mascotOptions = [
  {
    id: "Lion",
    name: "Lion",
    description: "Strength, leadership, and courage",
    icon: Crown,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "Eagle",
    name: "Eagle",
    description: "Vision, freedom, and soaring above challenges",
    icon: Bird,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "Oak Tree",
    name: "Oak Tree",
    description: "Roots, growth, and family strength",
    icon: TreePine,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "Lighthouse",
    name: "Lighthouse",
    description: "Guidance, safety, and leading the way",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "Phoenix",
    name: "Phoenix",
    description: "Rebirth, resilience, and transformation",
    icon: Flame,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    id: "Mountain",
    name: "Mountain",
    description: "Stability, endurance, and reaching new heights",
    icon: Mountain,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    id: "Compass",
    name: "Compass",
    description: "Direction, guidance, and finding your path",
    icon: Compass,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    id: "Shield",
    name: "Shield",
    description: "Protection, defense, and family security",
    icon: Shield,
    color: "bg-slate-100 text-slate-800 border-slate-200",
  },
  {
    id: "Anchor",
    name: "Anchor",
    description: "Stability, grounding, and staying true to values",
    icon: Anchor,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "Star",
    name: "Star",
    description: "Inspiration, guidance, and shining bright",
    icon: Star,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "Gem",
    name: "Gem",
    description: "Precious, unique, and family treasure",
    icon: Gem,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "Connection",
    name: "Connection",
    description: "Unity, bonds, and family ties",
    icon: CircleDot,
    color: "bg-teal-100 text-teal-800 border-teal-200",
  },
  {
    id: "Fortress",
    name: "Fortress",
    description: "Protection, strength, and family home",
    icon: Building,
    color: "bg-stone-100 text-stone-800 border-stone-200",
  },
  {
    id: "Dawn",
    name: "Dawn",
    description: "New beginnings, hope, and fresh starts",
    icon: Sunrise,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "Ocean",
    name: "Ocean",
    description: "Depth, wisdom, and endless possibilities",
    icon: Fish,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  {
    id: "Rocket",
    name: "Rocket",
    description: "Innovation, progress, and reaching for the stars",
    icon: Rocket,
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    id: "Key",
    name: "Key",
    description: "Access, opportunity, and unlocking potential",
    icon: Key,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "Bloom",
    name: "Bloom",
    description: "Growth, beauty, and flourishing together",
    icon: Flower2,
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
  {
    id: "Globe",
    name: "Globe",
    description: "World perspective, unity, and global family",
    icon: Globe,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

export function FamilyMascotSelector({
  selectedMascot,
  onMascotChange,
  className = "",
}: FamilyMascotSelectorProps) {
  const handleMascotSelect = (mascotId: string) => {
    if (selectedMascot === mascotId) {
      onMascotChange(null);
    } else {
      onMascotChange(mascotId);
    }
  };

  const selectedMascotData = mascotOptions.find((m) => m.id === selectedMascot);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Family Mascot
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose a mascot that represents your family's spirit and values
        </p>
      </CardHeader>
      <CardContent>
        {selectedMascot && selectedMascotData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${selectedMascotData.color}`}>
                <selectedMascotData.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {selectedMascotData.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedMascotData.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMascotChange(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Change
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mascotOptions.map((option) => {
            const Icon = option.icon;
            const selected = selectedMascot === option.id;

            return (
              <Button
                key={option.id}
                variant={selected ? "default" : "outline"}
                onClick={() => handleMascotSelect(option.id)}
                className={`h-auto p-3 flex flex-col items-center space-y-2 transition-all duration-200 ${
                  selected
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${option.color} ${selected ? "bg-white/20" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{option.name}</span>
              </Button>
            );
          })}
        </div>

        {!selectedMascot && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Click on a mascot to select it for your family
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
