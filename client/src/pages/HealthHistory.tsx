// HealthHistory Page - Main health history management page
// Refactored to use modular components for better maintainability

import React, { useState, useCallback, useMemo, useRef } from "react";
import { withDataFetching } from "@/components/hoc/withDataFetching";
import { withFormManagement } from "@/components/hoc/withFormManagement";
import { withSidebar } from "@/components/composition/withSidebar";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { healthService, familyService } from "@/services";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
import {
  HealthDashboard,
  RecordList,
  AppointmentManager,
  HealthHistoryHeader,
  HealthHistoryFilters,
  HealthRecord,
  HealthAppointment,
  EmergencyContact,
  HealthStats,
} from "@/components/health-history";

interface HealthHistoryData {
  healthRecords: HealthRecord[];
  appointments: HealthAppointment[];
  emergencyContacts: EmergencyContact[];
  healthStats: HealthStats;
  recordCounts: Record<string, number>;
}

interface HealthHistoryFilters {
  searchTerm: string;
  selectedCategory: string;
  dateRange: "all" | "week" | "month" | "year";
  status: "all" | "active" | "completed" | "cancelled";
  priority: "all" | "low" | "medium" | "high";
}

interface HealthHistoryProps {
  familyId?: string;
  userId?: string;
  onRecordSelect?: (record: HealthRecord) => void;
  onRecordCreate?: (record: Partial<HealthRecord>) => void;
  onRecordUpdate?: (recordId: string, updates: Partial<HealthRecord>) => void;
  onRecordDelete?: (recordId: string) => void;
  onAppointmentSelect?: (appointment: HealthAppointment) => void;
  onAppointmentCreate?: (appointment: Partial<HealthAppointment>) => void;
  onAppointmentUpdate?: (
    appointmentId: string,
    updates: Partial<HealthAppointment>,
  ) => void;
  onAppointmentDelete?: (appointmentId: string) => void;
  onError?: (error: string) => void;
}

// Enhanced Health History component with modern patterns
const HealthHistoryComponent: React.FC<HealthHistoryProps> = ({
  familyId,
  userId,
  onRecordSelect,
  onRecordCreate,
  onRecordUpdate,
  onRecordDelete,
  onAppointmentSelect,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
  onError,
}) => {
  const { user, loading } = useAuth();
  const { success, error } = useToast();
  const performanceMetrics = usePerformanceMonitor("HealthHistory");

  // Enhanced state management
  const [filters, setFilters] = useState<HealthHistoryFilters>({
    searchTerm: "",
    selectedCategory: "all",
    dateRange: "all",
    status: "all",
    priority: "all",
  });

  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<HealthAppointment | null>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchHealthHistoryData =
    useCallback(async (): Promise<HealthHistoryData> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        // Mock data for now - replace with actual health service calls
        const recordsData: HealthRecord[] = [];
        const appointmentsData: HealthAppointment[] = [];
        const contactsData: EmergencyContact[] = [];

        // Calculate statistics
        const healthStats: HealthStats = {
          totalRecords: recordsData.length,
          upcomingAppointments: appointmentsData.length,
          emergencyContacts: contactsData.length,
        };

        // Calculate record counts by category
        const recordCounts: Record<string, number> = {
          all: recordsData.length,
        };
        const categories = [
          "checkup",
          "specialist",
          "medication",
          "dental",
          "emergency",
        ];

        categories.forEach((category) => {
          recordCounts[category] = recordsData.filter(
            (r) => r.type === category,
          ).length;
        });

        const data: HealthHistoryData = {
          healthRecords: recordsData,
          appointments: appointmentsData,
          emergencyContacts: contactsData,
          healthStats,
          recordCounts,
        };

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        onError?.(errorMessage);
        throw error;
      }
    }, [user, onError]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof HealthHistoryFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      handleFilterChange("searchTerm", value);
    },
    [handleFilterChange],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      handleFilterChange("selectedCategory", category);
    },
    [handleFilterChange],
  );

  // Health record action handlers
  const handleDeleteRecord = useCallback(
    async (recordId: string) => {
      try {
        const deleteSuccess = await healthService.deleteHealthRecord(recordId);

        if (deleteSuccess) {
          onRecordDelete?.(recordId);
          success(
            "Health record deleted successfully",
            "The health record has been removed",
          );
        } else {
          error("Failed to delete health record", "Please try again");
        }
      } catch (err) {
        console.error("Error deleting health record:", err);
        error("Failed to delete health record", "Please try again");
      }
    },
    [healthService, onRecordDelete, success, error],
  );

  const handleEditRecord = useCallback((record: HealthRecord) => {
    setEditingRecord(record);
    setShowAddRecordForm(true);
  }, []);

  const handleCreateRecord = useCallback(
    (recordData: Partial<HealthRecord>) => {
      onRecordCreate?.(recordData);
      setShowAddRecordForm(false);
    },
    [onRecordCreate],
  );

  const handleUpdateRecord = useCallback(
    (recordId: string, updates: Partial<HealthRecord>) => {
      onRecordUpdate?.(recordId, updates);
      setShowAddRecordForm(false);
      setEditingRecord(null);
    },
    [onRecordUpdate],
  );

  // Appointment action handlers
  const handleEditAppointment = useCallback(
    (appointment: HealthAppointment) => {
      setEditingAppointment(appointment);
      setShowAddAppointmentForm(true);
    },
    [],
  );

  const handleDeleteAppointment = useCallback(
    async (appointmentId: string) => {
      try {
        const deleteSuccess =
          await healthService.deleteHealthAppointment(appointmentId);

        if (deleteSuccess) {
          onAppointmentDelete?.(appointmentId);
          success(
            "Appointment deleted successfully",
            "The appointment has been removed",
          );
        } else {
          error("Failed to delete appointment", "Please try again");
        }
      } catch (err) {
        console.error("Error deleting appointment:", err);
        error("Failed to delete appointment", "Please try again");
      }
    },
    [healthService, onAppointmentDelete, success, error],
  );

  const handleToggleComplete = useCallback(
    async (appointmentId: string) => {
      try {
        // TODO: Implement appointment completion toggle when updateHealthAppointment supports isCompleted
        console.log("Toggle appointment completion:", appointmentId);
        // For now, just notify the parent component
        onAppointmentUpdate?.(appointmentId, { isCompleted: true });
      } catch (err) {
        console.error("Error updating appointment status:", err);
        error("Failed to update appointment status", "Please try again");
      }
    },
    [onAppointmentUpdate, error],
  );

  const handleCreateAppointment = useCallback(
    (appointmentData: Partial<HealthAppointment>) => {
      onAppointmentCreate?.(appointmentData);
      setShowAddAppointmentForm(false);
    },
    [onAppointmentCreate],
  );

  const handleUpdateAppointment = useCallback(
    (appointmentId: string, updates: Partial<HealthAppointment>) => {
      onAppointmentUpdate?.(appointmentId, updates);
      setShowAddAppointmentForm(false);
      setEditingAppointment(null);
    },
    [onAppointmentUpdate],
  );

  // UI action handlers
  const handleAddRecord = useCallback(() => {
    setShowAddRecordForm(true);
  }, []);

  const handleScheduleAppointment = useCallback(() => {
    setShowAddAppointmentForm(true);
  }, []);

  const handleAddContact = useCallback(() => {
    setShowAddContactForm(true);
  }, []);

  // Memoized filtered data
  const filteredRecords = useMemo(() => {
    return [];
  }, [filters]);

  // Show call-to-action if not authenticated
  if (!loading && !user) {
    return (
      <AuthCallToAction
        icon={<Stethoscope />}
        title="Keep Your Family Healthy Together"
        description="Track medical history, appointments, and health information for your entire family in one secure, private place."
        features={[
          "Store medical records and health history securely",
          "Track appointments and medication schedules",
          "Share emergency contact information with family",
          "Monitor family health trends and patterns",
          "Access health information from anywhere, anytime",
          "Keep everyone informed about important health updates",
        ]}
        accentColor="#2D548A"
        bgGradient="from-blue-50 to-teal-50"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <HealthHistoryHeader
          onAddRecord={handleAddRecord}
          onScheduleAppointment={handleScheduleAppointment}
          onAddContact={handleAddContact}
        />

        {/* Filters */}
        <HealthHistoryFilters
          searchTerm={filters.searchTerm}
          selectedCategory={filters.selectedCategory}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onFilterChange={handleFilterChange}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Dashboard */}
          <div className="lg:col-span-2">
            <HealthDashboard
              healthStats={{
                totalRecords: 0,
                upcomingAppointments: 0,
                emergencyContacts: 0,
              }}
              recordCounts={{}}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleAddRecord}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Record</span>
                </button>
                <button
                  onClick={handleScheduleAppointment}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Appointment</span>
                </button>
                <button
                  onClick={handleAddContact}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Recent Activity
              </h3>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Records and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Health Records
              </h3>
            </div>
            <div className="p-4">
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Health records will be loaded here
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Appointments
              </h3>
            </div>
            <div className="p-4">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Appointments will be loaded here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms and Modals */}
      {showAddRecordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Record form component would go here */}
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {editingRecord ? "Edit Health Record" : "Add Health Record"}
                </h3>
                <p className="text-gray-500">
                  Record form will be implemented here
                </p>
                <button
                  onClick={() => setShowAddRecordForm(false)}
                  className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Appointment form component would go here */}
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {editingAppointment
                    ? "Edit Appointment"
                    : "Schedule Appointment"}
                </h3>
                <p className="text-gray-500">
                  Appointment form will be implemented here
                </p>
                <button
                  onClick={() => setShowAddAppointmentForm(false)}
                  className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Health History with HOCs
const HealthHistory = withSidebar(
  withFormManagement(
    withDataFetching(HealthHistoryComponent, {
      dataKey: "healthHistoryData",
      fetchFunction: (props: HealthHistoryProps) => {
        return Promise.resolve({
          healthRecords: [],
          appointments: [],
          emergencyContacts: [],
          healthStats: {
            totalRecords: 0,
            upcomingAppointments: 0,
            emergencyContacts: 0,
          },
          recordCounts: {},
        });
      },
      dependencies: ["userId"],
      cacheKey: (props: HealthHistoryProps) =>
        `health_history_data_${props.userId}`,
      cacheTTL: 5 * 60 * 1000,
      errorFallback: (error: string) => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load health data
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      ),
      loadingFallback: (
        <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
          <div className="text-center">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-lg text-muted-foreground">
              Loading health data...
            </p>
          </div>
        </div>
      ),
    }),
    {
      formConfig: {
        initialValues: {
          searchTerm: "",
          selectedCategory: "all",
          dateRange: "all",
          status: "all",
          priority: "all",
        },
        validationSchema: null,
        onSubmit: async (values) => {
          console.log("Form submitted:", values);
        },
      },
    },
  ),
  {
    sidebarConfig: {
      title: "Health History",
      description: "Track medical records and appointments",
      navigation: [
        { label: "Dashboard", href: "#", icon: "activity" },
        { label: "Records", href: "#", icon: "stethoscope" },
        { label: "Appointments", href: "#", icon: "calendar" },
        { label: "Contacts", href: "#", icon: "user" },
        { label: "Reports", href: "#", icon: "bar-chart-3" },
      ],
    },
  },
);

export default HealthHistory;
