// HealthDashboard Component - Displays health statistics and overview
// Extracted from HealthHistory.tsx for better modularity and maintainability

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Calendar, Phone, TrendingUp } from "lucide-react";

interface HealthStats {
  totalRecords: number;
  upcomingAppointments: number;
  emergencyContacts: number;
}

interface HealthDashboardProps {
  stats: HealthStats;
  className?: string;
}

export function HealthDashboard({
  stats,
  className = "",
}: HealthDashboardProps) {
  const dashboardItems = [
    {
      title: "Total Health Records",
      value: stats.totalRecords,
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Medical records and history",
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Scheduled visits and checkups",
    },
    {
      title: "Emergency Contacts",
      value: stats.emergencyContacts,
      icon: Phone,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Quick access contacts",
    },
    {
      title: "Health Trend",
      value: "Good",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Overall family health status",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${className}`}
    >
      {dashboardItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${item.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {typeof item.value === "number" ? item.value : item.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
