// FamilyMissionTabs Component - Handles tab navigation for family mission
// Extracted from FamilyMission.tsx to improve maintainability and reusability

import { Target, Heart, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "mission" | "values" | "mascot" | "merchandise";

interface FamilyMissionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export function FamilyMissionTabs({
  activeTab,
  onTabChange,
  className = "",
}: FamilyMissionTabsProps) {
  const tabs = [
    {
      id: "mission" as TabType,
      label: "Mission Statement",
      icon: Target,
      description: "Define your family's purpose and guiding principles",
    },
    {
      id: "values" as TabType,
      label: "Family Values",
      icon: Heart,
      description: "Select core values that define your family culture",
    },
    {
      id: "mascot" as TabType,
      label: "Family Mascot",
      icon: Users,
      description: "Choose a mascot that represents your family spirit",
    },
    {
      id: "merchandise" as TabType,
      label: "Merchandise",
      icon: ShoppingBag,
      description: "Create custom items with your family mission",
    },
  ];

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Active Tab Description */}
      <div className="py-4">
        <p className="text-sm text-gray-600">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}
