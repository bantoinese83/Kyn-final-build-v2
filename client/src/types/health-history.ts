// Health History Types - Centralized type definitions for health history functionality
// Extracted from HealthHistory.tsx for better type safety and consistency

export interface HealthRecord {
  id: string;
  title: string;
  type: string; // Use type instead of category to match service
  description: string;
  date: string;
  priority: string;
  tags: string[];
  doctorName?: string;
  facility?: string;
  notes?: string;
  patient: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface HealthAppointment {
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

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  specialty: string;
  address?: string;
  isAvailable247: boolean;
}

export interface HealthStats {
  totalRecords: number;
  upcomingAppointments: number;
  emergencyContacts: number;
}

export interface CreateHealthRecordData {
  familyId: string;
  patientId: string;
  type: string;
  title: string;
  description: string;
  date: string;
  priority: string;
  tags: string[];
  doctorName?: string;
  facility?: string;
  notes?: string;
}

export interface CreateAppointmentData {
  familyId: string;
  patientId: string;
  appointmentType: string;
  date: string;
  description: string;
  time: string;
  doctorName: string;
  facility?: string;
  address?: string;
  phone?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface CreateContactData {
  familyId: string;
  name: string;
  phone: string;
  relationship: string;
  specialty: string;
  address?: string;
  isAvailable247: boolean;
}

export interface HealthRecordFilters {
  searchTerm: string;
  category: string;
  dateRange?: string;
  priority?: string;
  patientId?: string;
}

export interface HealthAppointmentFilters {
  searchTerm: string;
  appointmentType?: string;
  dateRange?: string;
  isCompleted?: boolean;
  patientId?: string;
}

export interface HealthRecordPriority {
  value: string;
  label: string;
  color: string;
  description: string;
}

export interface HealthRecordType {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  relationship?: string;
  emergencyContact?: boolean;
}

export interface HealthMetrics {
  totalRecords: number;
  recordsByType: Record<string, number>;
  recordsByPriority: Record<string, number>;
  recordsByMonth: Array<{ month: string; count: number }>;
  averageRecordsPerPatient: number;
  mostCommonTypes: Array<{ type: string; count: number }>;
}

export interface HealthReminder {
  id: string;
  type: "appointment" | "medication" | "checkup" | "vaccination";
  title: string;
  description: string;
  dueDate: string;
  patientId: string;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  recurring?: boolean;
  recurringPattern?: string;
}

export interface HealthDocument {
  id: string;
  title: string;
  type:
    | "prescription"
    | "lab_result"
    | "imaging"
    | "vaccination_record"
    | "insurance"
    | "other";
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  patientId: string;
  tags: string[];
  description?: string;
  expiryDate?: string;
}

export interface HealthInsurance {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  effectiveDate: string;
  expiryDate?: string;
  coverageType: string;
  deductible: number;
  copay: number;
  patientId: string;
  isActive: boolean;
}

export interface HealthAllergy {
  id: string;
  allergen: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string;
  onsetDate: string;
  patientId: string;
  isActive: boolean;
  notes?: string;
}

export interface HealthMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  patientId: string;
  prescribedBy: string;
  pharmacy?: string;
  isActive: boolean;
  sideEffects?: string;
  interactions?: string[];
  notes?: string;
}

export interface HealthVaccination {
  id: string;
  name: string;
  date: string;
  patientId: string;
  administeredBy: string;
  facility?: string;
  lotNumber?: string;
  nextDueDate?: string;
  isComplete: boolean;
  notes?: string;
}

export interface HealthCondition {
  id: string;
  name: string;
  diagnosisDate: string;
  patientId: string;
  diagnosedBy: string;
  severity: "mild" | "moderate" | "severe";
  status: "active" | "resolved" | "chronic";
  symptoms: string[];
  treatment: string[];
  notes?: string;
}

export interface HealthFamilyHistory {
  id: string;
  condition: string;
  relationship: string;
  ageOfOnset?: number;
  isDeceased: boolean;
  notes?: string;
  patientId: string;
}

export interface HealthLifestyle {
  id: string;
  patientId: string;
  smokingStatus: "never" | "former" | "current";
  alcoholConsumption: "none" | "moderate" | "heavy";
  exerciseFrequency: "never" | "rarely" | "sometimes" | "regularly";
  dietType: "standard" | "vegetarian" | "vegan" | "keto" | "other";
  sleepHours: number;
  stressLevel: "low" | "moderate" | "high";
  lastUpdated: string;
}
