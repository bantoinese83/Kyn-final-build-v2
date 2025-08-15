// HealthStatsDashboard Component - Displays health statistics overview
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import { Stethoscope, Calendar, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthStats {
  totalRecords: number;
  upcomingAppointments: number;
  emergencyContacts: number;
}

interface HealthStatsDashboardProps {
  stats: HealthStats;
  className?: string;
}

export function HealthStatsDashboard({
  stats,
  className = "",
}: HealthStatsDashboardProps) {
  const statCards = [
    {
      title: "Total Health Records",
      value: stats.totalRecords,
      icon: Stethoscope,
      color: "bg-blue-500",
      description: "Medical records stored",
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: "bg-green-500",
      description: "Scheduled visits",
    },
    {
      title: "Emergency Contacts",
      value: stats.emergencyContacts,
      icon: Shield,
      color: "bg-red-500",
      description: "Quick access contacts",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
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
              {index === 0 && stats.totalRecords > 0 && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">
                    {stats.totalRecords > 10
                      ? "Well documented"
                      : "Getting started"}
                  </span>
                </div>
              )}
              {index === 1 && stats.upcomingAppointments > 0 && (
                <div className="flex items-center mt-2">
                  <Calendar className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">
                    {stats.upcomingAppointments === 1
                      ? "1 appointment"
                      : `${stats.upcomingAppointments} appointments`}
                  </span>
                </div>
              )}
              {index === 2 && stats.emergencyContacts === 0 && (
                <div className="flex items-center mt-2">
                  <Shield className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">
                    Add emergency contacts
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
