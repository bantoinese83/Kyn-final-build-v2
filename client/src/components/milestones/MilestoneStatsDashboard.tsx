// MilestoneStatsDashboard Component - Displays milestone statistics overview
// Extracted from Milestones.tsx to improve maintainability and reusability

import { Trophy, Calendar, Heart, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MilestoneStats {
  totalMilestones: number;
  thisMonth: number;
  familyCelebrations: number;
  majorAchievements: number;
}

interface MilestoneStatsDashboardProps {
  stats: MilestoneStats;
  className?: string;
}

export function MilestoneStatsDashboard({
  stats,
  className = "",
}: MilestoneStatsDashboardProps) {
  const statCards = [
    {
      title: "Total Milestones",
      value: stats.totalMilestones,
      icon: Trophy,
      color: "bg-yellow-500",
      description: "Achievements recorded",
      insight:
        stats.totalMilestones > 20
          ? "Well documented family history"
          : "Building your family story",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: Calendar,
      color: "bg-blue-500",
      description: "Recent achievements",
      insight:
        stats.thisMonth > 0
          ? `${stats.thisMonth} milestone(s) this month`
          : "No milestones this month",
    },
    {
      title: "Family Celebrations",
      value: stats.familyCelebrations,
      icon: Heart,
      color: "bg-pink-500",
      description: "Birthdays & anniversaries",
      insight:
        stats.familyCelebrations > 0
          ? "Celebrating family moments"
          : "Add family celebrations",
    },
    {
      title: "Major Achievements",
      value: stats.majorAchievements,
      icon: Award,
      color: "bg-green-500",
      description: "Career & education",
      insight:
        stats.majorAchievements > 0
          ? "Impressive accomplishments"
          : "Track major milestones",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{stat.insight}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
