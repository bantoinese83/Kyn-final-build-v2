// AppointmentManager Component - Displays and manages health appointments
// Extracted from HealthHistory.tsx for better modularity and maintainability

import { Calendar } from "lucide-react";
import { HealthAppointment } from "@/types/health-history";
import { HealthAppointmentCard } from "./HealthAppointmentCard";

interface AppointmentManagerProps {
  appointments: HealthAppointment[];
  onEditAppointment: (appointment: HealthAppointment) => void;
  onDeleteAppointment: (appointmentId: string) => Promise<void>;
  onToggleComplete: (appointmentId: string) => Promise<void>;
  className?: string;
}

export function AppointmentManager({
  appointments,
  onEditAppointment,
  onDeleteAppointment,
  onToggleComplete,
  className = "",
}: AppointmentManagerProps) {
  const upcomingAppointments = appointments.filter((a) => !a.isCompleted);

  if (upcomingAppointments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <span className="text-sm text-muted-foreground">
          {upcomingAppointments.length} upcoming
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingAppointments.map((appointment) => (
          <HealthAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={() => onEditAppointment(appointment)}
            onDelete={() => onDeleteAppointment(appointment.id)}
            onToggleComplete={() => onToggleComplete(appointment.id)}
          />
        ))}
      </div>
    </div>
  );
}
