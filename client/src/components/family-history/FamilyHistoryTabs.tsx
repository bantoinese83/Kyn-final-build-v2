// FamilyHistoryTabs Component - Handles tab navigation
// Extracted from FamilyHistory.tsx to improve maintainability and reusability

import { BookOpen, TreePine, Network, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TabType = "stories" | "tree" | "genealogy" | "intricate-tree";

interface FamilyHistoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  storiesCount: number;
  treeCount: number;
  className?: string;
}

export function FamilyHistoryTabs({
  activeTab,
  onTabChange,
  storiesCount,
  treeCount,
  className = "",
}: FamilyHistoryTabsProps) {
  const tabs = [
    {
      id: "stories" as TabType,
      label: "Family Stories",
      icon: BookOpen,
      description: "Share and discover family memories",
      count: storiesCount,
    },
    {
      id: "tree" as TabType,
      label: "Family Tree",
      icon: TreePine,
      description: "Visualize family connections",
      count: treeCount,
    },
    {
      id: "genealogy" as TabType,
      label: "Genealogy",
      icon: Network,
      description: "Research family history",
      count: 0, // TODO: Implement genealogy count
    },
    {
      id: "intricate-tree" as TabType,
      label: "Advanced Tree",
      icon: GitBranch,
      description: "Detailed family mapping",
      count: 0, // TODO: Implement advanced tree count
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
              {tab.count > 0 && (
                <Badge
                  variant="secondary"
                  className={`ml-2 text-xs ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </Badge>
              )}
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
