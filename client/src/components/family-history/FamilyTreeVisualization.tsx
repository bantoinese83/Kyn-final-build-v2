// FamilyTreeVisualization Component - Displays family tree structure
// Extracted from FamilyHistory.tsx to improve maintainability and reusability

import { useState } from "react";
import { Plus, Crown, Baby, Dog, Cat, Bird, Fish, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TreeNode {
  id: string;
  name: string;
  generation: number;
  avatar?: string;
  type: "person" | "child" | "pet";
  dateOfBirth?: string;
  petType?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface FamilyTreeVisualizationProps {
  familyTree: TreeNode[];
  onAddNode: () => void;
  onEditNode: (node: TreeNode) => void;
  onDeleteNode: (nodeId: string) => void;
  className?: string;
}

export function FamilyTreeVisualization({
  familyTree,
  onAddNode,
  onEditNode,
  onDeleteNode,
  className = "",
}: FamilyTreeVisualizationProps) {
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(
    new Set([1, 2]),
  );

  const toggleGeneration = (generation: number) => {
    const newExpanded = new Set(expandedGenerations);
    if (newExpanded.has(generation)) {
      newExpanded.delete(generation);
    } else {
      newExpanded.add(generation);
    }
    setExpandedGenerations(newExpanded);
  };

  const getTypeIcon = (type: string, petType?: string) => {
    switch (type) {
      case "person":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "child":
        return <Baby className="h-4 w-4 text-pink-600" />;
      case "pet":
        switch (petType) {
          case "Dog":
            return <Dog className="h-4 w-4 text-amber-600" />;
          case "Cat":
            return <Cat className="h-4 w-4 text-orange-600" />;
          case "Bird":
            return <Bird className="h-4 w-4 text-green-600" />;
          case "Fish":
            return <Fish className="h-4 w-4 text-blue-600" />;
          default:
            return <Dog className="h-4 w-4 text-gray-600" />;
        }
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "child":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "pet":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  const getGenerationTitle = (generation: number) => {
    switch (generation) {
      case 1:
        return "1st Generation - Founding Members";
      case 2:
        return "2nd Generation - Parents & Siblings";
      case 3:
        return "3rd Generation - Children & Cousins";
      case 4:
        return "4th Generation - Grandchildren";
      default:
        return `${generation}${getOrdinalSuffix(generation)} Generation`;
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const groupedByGeneration = familyTree.reduce(
    (acc, node) => {
      if (!acc[node.generation]) {
        acc[node.generation] = [];
      }
      acc[node.generation].push(node);
      return acc;
    },
    {} as Record<number, TreeNode[]>,
  );

  const sortedGenerations = Object.keys(groupedByGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  if (familyTree.length === 0) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <CardContent>
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Family Members Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start building your family tree by adding family members
          </p>
          <Button onClick={onAddNode} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Member
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Add Node Button */}
      <div className="flex justify-end">
        <Button onClick={onAddNode} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Family Member
        </Button>
      </div>

      {/* Tree Visualization */}
      <div className="space-y-8">
        {sortedGenerations.map((generation) => {
          const nodes = groupedByGeneration[generation];
          const isExpanded = expandedGenerations.has(generation);

          return (
            <div key={generation} className="space-y-4">
              {/* Generation Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getGenerationTitle(generation)}
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {nodes.length} member{nodes.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGeneration(generation)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </Button>
              </div>

              {/* Generation Members */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nodes.map((node) => (
                    <Card
                      key={node.id}
                      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => onEditNode(node)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-12 w-12">
                            {node.avatar ? (
                              <AvatarImage src={node.avatar} alt={node.name} />
                            ) : (
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {node.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {node.name}
                              </h4>
                              {node.userId && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(node.type, node.petType)}
                              <Badge
                                className={`text-xs ${getTypeColor(node.type)}`}
                              >
                                {node.type === "pet"
                                  ? node.petType || "Pet"
                                  : node.type}
                              </Badge>
                            </div>

                            {node.dateOfBirth && (
                              <p className="text-xs text-gray-500">
                                Born: {formatDate(node.dateOfBirth)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
