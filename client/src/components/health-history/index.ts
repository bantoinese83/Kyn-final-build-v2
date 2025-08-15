// Health History Components Index - Centralized exports for all health history components
// Refactored from monolithic HealthHistory.tsx to modular components

// Core components
export { HealthDashboard } from "./HealthDashboard";
export { RecordList } from "./RecordList";
export { AppointmentManager } from "./AppointmentManager";
export { HealthHistoryHeader } from "./HealthHistoryHeader";
export { HealthHistoryFilters } from "./HealthHistoryFilters";

// Existing components (keep for backward compatibility)
export { HealthRecordCard } from "./HealthRecordCard";
export { HealthAppointmentCard } from "./HealthAppointmentCard";
export { HealthStatsDashboard } from "./HealthStatsDashboard";
export { HealthHistoryTabs } from "./HealthHistoryTabs";
export { HealthRecordForm } from "./HealthRecordForm";
export { HealthAppointmentForm } from "./HealthAppointmentForm";

// Export types
export type {
  HealthRecord,
  HealthAppointment,
  EmergencyContact,
  HealthStats,
  CreateHealthRecordData,
  CreateAppointmentData,
  CreateContactData,
  HealthRecordFilters,
  HealthAppointmentFilters,
  HealthRecordPriority,
  HealthRecordType,
  Patient,
  HealthMetrics,
  HealthReminder,
  HealthDocument,
  HealthInsurance,
  HealthAllergy,
  HealthMedication,
  HealthVaccination,
  HealthCondition,
  HealthFamilyHistory,
  HealthLifestyle,
} from "@/types/health-history";
