// HealthHistoryHeader Component - Header section with title and action buttons
// Extracted from HealthHistory.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HealthHistoryHeaderProps {
  onAddRecord: () => void;
  onScheduleAppointment: () => void;
  className?: string;
}

export function HealthHistoryHeader({
  onAddRecord,
  onScheduleAppointment,
  className = "",
}: HealthHistoryHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${className}`}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Family Health History
        </h1>
        <p className="text-muted-foreground">
          Track medical records, appointments, and health information for your
          entire family
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onAddRecord} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
        <Button onClick={onScheduleAppointment} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>
    </div>
  );
}
