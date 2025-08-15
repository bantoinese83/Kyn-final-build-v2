// HealthAppointmentForm Component - Handles health appointment creation and editing
// Extracted from HealthHistory.tsx to improve maintainability and reusability

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface CreateAppointmentData {
  appointmentType: string;
  date: string;
  time: string;
  doctorName: string;
  facility: string;
  address: string;
  phone: string;
  notes: string;
  patientId: string;
}

interface HealthAppointmentFormProps {
  appointment?: CreateAppointmentData | null;
  isEditMode: boolean;
  onSubmit: (appointmentData: CreateAppointmentData) => void;
  onCancel: () => void;
  loading?: boolean;
  patients: Array<{ id: string; name: string; email: string }>;
  className?: string;
}

const APPOINTMENT_TYPES = [
  { value: "checkup", label: "Check-up" },
  { value: "consultation", label: "Consultation" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
  { value: "surgery", label: "Surgery" },
  { value: "therapy", label: "Therapy" },
  { value: "lab-work", label: "Lab Work" },
  { value: "imaging", label: "Imaging" },
  { value: "vaccination", label: "Vaccination" },
  { value: "dental", label: "Dental" },
  { value: "specialist", label: "Specialist" },
  { value: "other", label: "Other" },
];

export function HealthAppointmentForm({
  appointment,
  isEditMode,
  onSubmit,
  onCancel,
  loading = false,
  patients,
  className = "",
}: HealthAppointmentFormProps) {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    appointmentType: "checkup",
    date: "",
    time: "",
    doctorName: "",
    facility: "",
    address: "",
    phone: "",
    notes: "",
    patientId: "",
  });

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
    } else {
      // Set default date to today and time to next hour
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        date: now.toISOString().split("T")[0],
        time: nextHour.toTimeString().slice(0, 5),
        patientId: patients.length > 0 ? patients[0].id : "",
      }));
    }
  }, [appointment, patients]);

  const handleInputChange = (
    field: keyof CreateAppointmentData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.appointmentType &&
      formData.date &&
      formData.time &&
      formData.doctorName &&
      formData.patientId
    ) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.appointmentType &&
      formData.date &&
      formData.time &&
      formData.doctorName &&
      formData.patientId
    );
  };

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-dark-blue">
          {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Update the appointment details"
            : "Schedule a new health appointment for family members"}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="appointmentType"
                className="text-sm font-medium text-gray-700"
              >
                Appointment Type *
              </Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) =>
                  handleInputChange("appointmentType", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="patientId"
                className="text-sm font-medium text-gray-700"
              >
                Patient *
              </Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleInputChange("patientId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
                Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="time"
                className="text-sm font-medium text-gray-700"
              >
                Time *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="space-y-2">
            <Label
              htmlFor="doctorName"
              className="text-sm font-medium text-gray-700"
            >
              Doctor/Provider Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="doctorName"
                value={formData.doctorName}
                onChange={(e) =>
                  handleInputChange("doctorName", e.target.value)
                }
                placeholder="e.g., Dr. Smith"
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Facility Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="facility"
                className="text-sm font-medium text-gray-700"
              >
                Facility/Hospital
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="facility"
                  value={formData.facility}
                  onChange={(e) =>
                    handleInputChange("facility", e.target.value)
                  }
                  placeholder="e.g., City General Hospital"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="e.g., (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-gray-700"
            >
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="e.g., 123 Medical Center Dr, City, State 12345"
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Notes
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions, preparation requirements, or additional notes..."
                rows={3}
                className="pl-10"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Scheduling..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Appointment" : "Schedule Appointment"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
