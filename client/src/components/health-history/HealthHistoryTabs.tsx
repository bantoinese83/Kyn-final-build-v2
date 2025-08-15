// HealthHistoryTabs Component - Handles tab navigation for health history
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import { Stethoscope, Calendar, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "overview" | "records" | "appointments" | "contacts";

interface HealthHistoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddRecord: () => void;
  onAddAppointment: () => void;
  onAddContact: () => void;
  className?: string;
}

export function HealthHistoryTabs({
  activeTab,
  onTabChange,
  onAddRecord,
  onAddAppointment,
  onAddContact,
  className = "",
}: HealthHistoryTabsProps) {
  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: Stethoscope,
      description: "Health statistics and summary",
    },
    {
      id: "records" as TabType,
      label: "Health Records",
      icon: Stethoscope,
      description: "Medical history and documentation",
    },
    {
      id: "appointments" as TabType,
      label: "Appointments",
      icon: Calendar,
      description: "Scheduled visits and consultations",
    },
    {
      id: "contacts" as TabType,
      label: "Emergency Contacts",
      icon: Shield,
      description: "Quick access to important contacts",
    },
  ];

  const getAddButton = () => {
    switch (activeTab) {
      case "records":
        return (
          <Button
            onClick={onAddRecord}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        );
      case "appointments":
        return (
          <Button
            onClick={onAddAppointment}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        );
      case "contacts":
        return (
          <Button
            onClick={onAddContact}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="flex justify-between items-center">
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

        {getAddButton()}
      </div>

      {/* Active Tab Description */}
      <div className="py-4">
        <p className="text-sm text-gray-600">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}
