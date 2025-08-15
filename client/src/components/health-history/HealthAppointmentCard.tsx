// HealthAppointmentCard Component - Displays individual health appointments
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Edit3,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HealthAppointment {
  id: string;
  appointmentType: string;
  date: string;
  time: string;
  doctorName: string;
  facility?: string;
  address?: string;
  phone?: string;
  notes?: string;
  isCompleted: boolean;
  patient: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface HealthAppointmentCardProps {
  appointment: HealthAppointment;
  onEdit: (appointment: HealthAppointment) => void;
  onDelete: (appointmentId: string) => void;
  onToggleComplete: (appointmentId: string) => void;
  className?: string;
}

export function HealthAppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onToggleComplete,
  className = "",
}: HealthAppointmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "checkup":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "consultation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "surgery":
        return "bg-red-100 text-red-800 border-red-200";
      case "follow-up":
        return "bg-green-100 text-green-800 border-green-200";
      case "emergency":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isUpcoming = new Date(appointment.date) > new Date();

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className} ${
        appointment.isCompleted ? "opacity-75" : ""
      }`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {appointment.patient.avatar ? (
                <AvatarImage
                  src={appointment.patient.avatar}
                  alt={appointment.patient.name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {appointment.patient.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {appointment.patient.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(appointment.date)}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatTime(appointment.time)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              className={`${getAppointmentTypeColor(appointment.appointmentType)}`}
            >
              {appointment.appointmentType}
            </Badge>
            {appointment.isCompleted && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            {!appointment.isCompleted && isUpcoming && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Upcoming
              </Badge>
            )}
          </div>
        </div>

        {/* Doctor & Facility */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Appointment Details
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Doctor:</span>{" "}
            {appointment.doctorName}
          </p>
          {appointment.facility && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Facility:</span>{" "}
              {appointment.facility}
            </p>
          )}
          {appointment.address && (
            <div className="flex items-start space-x-2 mt-2">
              <MapPin className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">{appointment.address}</p>
            </div>
          )}
          {appointment.phone && (
            <div className="flex items-center space-x-2 mt-1">
              <Phone className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-600">{appointment.phone}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 italic">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleComplete(appointment.id)}
            className={`text-xs ${
              appointment.isCompleted
                ? "text-gray-600 border-gray-300"
                : "text-green-600 border-green-300 hover:bg-green-50"
            }`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {appointment.isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
              className="text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(appointment.id)}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
