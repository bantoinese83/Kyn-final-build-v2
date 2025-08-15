// Health Service - Handles all health-related data operations
// Refactored to extend FamilyService base class for consistency and performance

import { FamilyService, FamilyEntity, FamilyFilters } from "./base";
import { supabase } from "./supabase";
import { ServiceResponse } from "@/types/database";
import {
  globalCache,
  cacheGet,
  cacheSet,
  cacheDelete,
} from "@/lib/cache-manager";
import { measureAsync } from "@/lib/performance-monitor";

export interface HealthRecord extends FamilyEntity {
  title: string;
  description?: string;
  recordType:
    | "appointment"
    | "medication"
    | "symptom"
    | "test_result"
    | "vaccination"
    | "allergy"
    | "condition"
    | "other";
  date: string;
  endDate?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "completed" | "cancelled" | "in_progress";
  doctor?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Medication extends FamilyEntity {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  prescribedBy?: string;
  pharmacy?: string;
  refillDate?: string;
  refillCount?: number;
  maxRefills?: number;
  cost?: number;
  insurance?: string;
  metadata?: Record<string, any>;
}

export interface Appointment extends FamilyEntity {
  title: string;
  description?: string;
  appointmentType:
    | "checkup"
    | "consultation"
    | "procedure"
    | "emergency"
    | "followup"
    | "other";
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  doctor: string;
  specialty?: string;
  location: string;
  address?: string;
  phone?: string;
  notes?: string;
  preparation?: string[];
  isConfirmed: boolean;
  reminderTime?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  cost?: number;
  insurance?: string;
  metadata?: Record<string, any>;
}

export interface SymptomLog extends FamilyEntity {
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1=mild, 5=severe
  startDate: string;
  endDate?: string;
  duration?: number; // in hours
  triggers?: string[];
  treatments?: string[];
  effectiveness?: "none" | "partial" | "full";
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface HealthWithDetails extends HealthRecord {
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  relatedRecords: HealthRecord[];
  nextOccurrence?: string;
  isOverdue: boolean;
}

export interface CreateHealthRecordData {
  title: string;
  description?: string;
  familyId: string;
  authorId: string;
  recordType:
    | "appointment"
    | "medication"
    | "symptom"
    | "test_result"
    | "vaccination"
    | "allergy"
    | "condition"
    | "other";
  date: string;
  endDate?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "completed" | "cancelled" | "in_progress";
  doctor?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHealthRecordData {
  title?: string;
  description?: string;
  recordType?:
    | "appointment"
    | "medication"
    | "symptom"
    | "test_result"
    | "vaccination"
    | "allergy"
    | "condition"
    | "other";
  date?: string;
  endDate?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "scheduled" | "completed" | "cancelled" | "in_progress";
  doctor?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateMedicationData {
  name: string;
  dosage: string;
  frequency: string;
  familyId: string;
  authorId: string;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  prescribedBy?: string;
  pharmacy?: string;
  refillDate?: string;
  refillCount?: number;
  maxRefills?: number;
  cost?: number;
  insurance?: string;
  metadata?: Record<string, any>;
}

export interface CreateAppointmentData {
  title: string;
  description?: string;
  familyId: string;
  authorId: string;
  appointmentType:
    | "checkup"
    | "consultation"
    | "procedure"
    | "emergency"
    | "followup"
    | "other";
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  doctor: string;
  specialty?: string;
  location: string;
  address?: string;
  phone?: string;
  notes?: string;
  preparation?: string[];
  isConfirmed?: boolean;
  reminderTime?: string;
  status?: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  cost?: number;
  insurance?: string;
  metadata?: Record<string, any>;
}

export interface HealthFilters extends FamilyFilters {
  recordType?:
    | "appointment"
    | "medication"
    | "symptom"
    | "test_result"
    | "vaccination"
    | "allergy"
    | "condition"
    | "other";
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "scheduled" | "completed" | "cancelled" | "in_progress";
  dateRange?: "all" | "today" | "week" | "month" | "year";
  doctor?: string;
  location?: string;
  tags?: string[];
}

export interface HealthSearchParams {
  query: string;
  filters?: HealthFilters;
  sortBy?: "recent" | "priority" | "date" | "type" | "status";
  sortOrder?: "asc" | "desc";
}

class HealthService extends FamilyService<
  HealthRecord,
  CreateHealthRecordData,
  UpdateHealthRecordData
> {
  protected tableName = "health_records";
  protected selectFields = `
    *,
    author:users!health_records_author_id_fkey(
      id,
      name,
      avatar,
      initials
    )
  `;

  /**
   * Get health records with full details for a family
   */
  async getHealthRecordsWithDetails(
    familyId: string,
    filters?: HealthFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<HealthWithDetails[]>> {
    const cacheKey = `health_records_with_details_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<HealthWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getHealthRecordsWithDetails",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .order("date", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const records = (data || []) as unknown as HealthWithDetails[];

        // Transform and enrich records with additional data
        const enrichedRecords = records.map((record) => {
          const nextOccurrence = this.calculateNextOccurrence(record);
          const isOverdue = this.isOverdue(record);

          return {
            ...record,
            relatedRecords: [], // This would require additional queries
            nextOccurrence,
            isOverdue,
          };
        });

        cacheSet(cacheKey, enrichedRecords, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedRecords, error: null };
      },
      "custom",
    );
  }

  /**
   * Get upcoming appointments for a family
   */
  async getUpcomingAppointments(
    familyId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<Appointment[]>> {
    const cacheKey = `upcoming_appointments_${familyId}_${limit}`;
    const cached = cacheGet<Appointment[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUpcomingAppointments",
      async () => {
        const now = new Date();
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
          *,
          author:users!appointments_author_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("family_id", familyId)
          .gte("date", now.toISOString().split("T")[0])
          .eq("status", "scheduled")
          .order("date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(limit);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const appointments = (data || []) as unknown as Appointment[];
        cacheSet(cacheKey, appointments, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: appointments, error: null };
      },
      "custom",
    );
  }

  /**
   * Get active medications for a family
   */
  async getActiveMedications(
    familyId: string,
  ): Promise<ServiceResponse<Medication[]>> {
    const cacheKey = `active_medications_${familyId}`;
    const cached = cacheGet<Medication[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getActiveMedications",
      async () => {
        const now = new Date();
        const { data, error } = await supabase
          .from("medications")
          .select(
            `
          *,
          author:users!medications_author_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("family_id", familyId)
          .eq("is_active", true)
          .or(`end_date.is.null,end_date.gt.${now.toISOString()}`)
          .order("start_date", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const medications = (data || []) as unknown as Medication[];
        cacheSet(cacheKey, medications, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: medications, error: null };
      },
      "custom",
    );
  }

  /**
   * Get medications due for refill
   */
  async getMedicationsDueForRefill(
    familyId: string,
    daysAhead: number = 7,
  ): Promise<ServiceResponse<Medication[]>> {
    const cacheKey = `medications_refill_${familyId}_${daysAhead}`;
    const cached = cacheGet<Medication[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getMedicationsDueForRefill",
      async () => {
        const now = new Date();
        const futureDate = new Date(
          now.getTime() + daysAhead * 24 * 60 * 60 * 1000,
        );

        const { data, error } = await supabase
          .from("medications")
          .select(
            `
          *,
          author:users!medications_author_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("family_id", familyId)
          .eq("is_active", true)
          .not("refill_date", "is", null)
          .lte("refill_date", futureDate.toISOString())
          .order("refill_date", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const medications = (data || []) as unknown as Medication[];
        cacheSet(cacheKey, medications, 1 * 60 * 1000, globalCache); // 1 minute
        return { success: true, data: medications, error: null };
      },
      "custom",
    );
  }

  /**
   * Get recent symptoms for a family
   */
  async getRecentSymptoms(
    familyId: string,
    days: number = 30,
  ): Promise<ServiceResponse<SymptomLog[]>> {
    const cacheKey = `recent_symptoms_${familyId}_${days}`;
    const cached = cacheGet<SymptomLog[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getRecentSymptoms",
      async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const { data, error } = await supabase
          .from("symptom_logs")
          .select(
            `
          *,
          author:users!symptom_logs_author_id_fkey(
            id,
            name,
            avatar,
            initials
          )
        `,
          )
          .eq("family_id", familyId)
          .gte("start_date", cutoffDate.toISOString())
          .order("start_date", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const symptoms = (data || []) as unknown as SymptomLog[];
        cacheSet(cacheKey, symptoms, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: symptoms, error: null };
      },
      "custom",
    );
  }

  /**
   * Search health records by text content and filters
   */
  async searchHealthRecords(
    familyId: string,
    searchParams: HealthSearchParams,
  ): Promise<ServiceResponse<HealthRecord[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `health_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<HealthRecord[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchHealthRecords",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,notes.ilike.%${query}%,tags.cs.{${query}}`,
          );

        // Apply filters
        if (filters?.recordType) {
          queryBuilder = queryBuilder.eq("record_type", filters.recordType);
        }
        if (filters?.priority) {
          queryBuilder = queryBuilder.eq("priority", filters.priority);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.doctor) {
          queryBuilder = queryBuilder.ilike("doctor", `%${filters.doctor}%`);
        }
        if (filters?.location) {
          queryBuilder = queryBuilder.ilike(
            "location",
            `%${filters.location}%`,
          );
        }
        if (filters?.tags && filters.tags.length > 0) {
          queryBuilder = queryBuilder.overlaps("tags", filters.tags);
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          queryBuilder = queryBuilder.gte("date", startDate.toISOString());
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "priority":
            orderBy = "priority";
            break;
          case "date":
            orderBy = "date";
            break;
          case "type":
            orderBy = "record_type";
            break;
          case "status":
            orderBy = "status";
            break;
          default:
            orderBy = "created_at";
        }

        const { data, error } = await queryBuilder.order(orderBy, {
          ascending: sortOrder === "asc",
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const records = (data || []) as unknown as HealthRecord[];
        cacheSet(cacheKey, records, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: records, error: null };
      },
      "custom",
    );
  }

  /**
   * Get health records by type
   */
  async getHealthRecordsByType(
    familyId: string,
    recordType: string,
    filters?: Omit<HealthFilters, "recordType">,
  ): Promise<ServiceResponse<HealthRecord[]>> {
    const cacheKey = `health_records_type_${familyId}_${recordType}`;
    const cached = cacheGet<HealthRecord[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getHealthRecordsByType",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .eq("record_type", recordType);

        // Apply additional filters
        if (filters?.priority) {
          query = query.eq("priority", filters.priority);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.dateRange && filters.dateRange !== "all") {
          const now = new Date();
          let startDate: Date;

          switch (filters.dateRange) {
            case "today":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            case "week":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte("date", startDate.toISOString());
        }

        const { data, error } = await query.order("date", { ascending: false });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const records = (data || []) as unknown as HealthRecord[];
        cacheSet(cacheKey, records, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: records, error: null };
      },
      "custom",
    );
  }

  /**
   * Get overdue health records
   */
  async getOverdueHealthRecords(
    familyId: string,
  ): Promise<ServiceResponse<HealthRecord[]>> {
    const cacheKey = `overdue_health_records_${familyId}`;
    const cached = cacheGet<HealthRecord[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getOverdueHealthRecords",
      async () => {
        const now = new Date();
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .lt("date", now.toISOString())
          .eq("status", "scheduled")
          .order("date", { ascending: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const records = (data || []) as unknown as HealthRecord[];
        const overdueRecords = records.filter((record) =>
          this.isOverdue(record),
        );

        cacheSet(cacheKey, overdueRecords, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: overdueRecords, error: null };
      },
      "custom",
    );
  }

  /**
   * Get health statistics for a family
   */
  async getHealthStats(familyId: string): Promise<
    ServiceResponse<{
      totalRecords: number;
      recordsByType: Record<string, number>;
      recordsByPriority: Record<string, number>;
      recordsByStatus: Record<string, number>;
      upcomingAppointments: number;
      overdueRecords: number;
      activeMedications: number;
      medicationsDueRefill: number;
      recentSymptoms: number;
    }>
  > {
    const cacheKey = `health_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getHealthStats",
      async () => {
        const [
          recordsResult,
          appointmentsResult,
          medicationsResult,
          symptomsResult,
        ] = await Promise.all([
          supabase
            .from(this.tableName)
            .select("record_type, priority, status, date")
            .eq("family_id", familyId),
          supabase
            .from("appointments")
            .select("date, status")
            .eq("family_id", familyId),
          supabase
            .from("medications")
            .select("is_active, refill_date")
            .eq("family_id", familyId),
          supabase
            .from("symptom_logs")
            .select("start_date")
            .eq("family_id", familyId),
        ]);

        if (
          recordsResult.error ||
          appointmentsResult.error ||
          medicationsResult.error ||
          symptomsResult.error
        ) {
          return {
            success: false,
            error: "Failed to fetch health statistics",
            data: null,
          };
        }

        const records = recordsResult.data || [];
        const appointments = appointmentsResult.data || [];
        const medications = medicationsResult.data || [];
        const symptoms = symptomsResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats = {
          totalRecords: records.length,
          recordsByType: records.reduce(
            (acc, r) => {
              const type = r.record_type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          recordsByPriority: records.reduce(
            (acc, r) => {
              const priority = r.priority || "medium";
              acc[priority] = (acc[priority] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          recordsByStatus: records.reduce(
            (acc, r) => {
              const status = r.status || "scheduled";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          upcomingAppointments: appointments.filter(
            (a) => new Date(a.date) > now && a.status === "scheduled",
          ).length,
          overdueRecords: records.filter(
            (r) => new Date(r.date) < now && r.status === "scheduled",
          ).length,
          activeMedications: medications.filter((m) => m.is_active).length,
          medicationsDueRefill: medications.filter(
            (m) => m.refill_date && new Date(m.refill_date) <= now,
          ).length,
          recentSymptoms: symptoms.filter(
            (s) => new Date(s.start_date) >= thirtyDaysAgo,
          ).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Calculate next occurrence for recurring records
   */
  private calculateNextOccurrence(record: HealthRecord): string | undefined {
    if (!record.isRecurring || !record.recurrencePattern) {
      return undefined;
    }

    // This is a simplified calculation - in practice, you'd want a more sophisticated recurrence engine
    const lastDate = new Date(record.date);
    const now = new Date();

    if (lastDate > now) {
      return record.date;
    }

    // Simple weekly recurrence for demonstration
    if (record.recurrencePattern.includes("weekly")) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 7);
      return nextDate.toISOString().split("T")[0];
    }

    return undefined;
  }

  /**
   * Check if a health record is overdue
   */
  private isOverdue(record: HealthRecord): boolean {
    if (record.status !== "scheduled") {
      return false;
    }

    const recordDate = new Date(record.date);
    const now = new Date();

    return recordDate < now;
  }

  /**
   * Invalidate cache for health records
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`health_records_family_${familyId}`),
      new RegExp(`health_records_with_details_${familyId}`),
      new RegExp(`health_search_${familyId}`),
      new RegExp(`health_records_type_${familyId}`),
      new RegExp(`overdue_health_records_${familyId}`),
      new RegExp(`health_stats_${familyId}`),
      new RegExp(`upcoming_appointments_${familyId}`),
      new RegExp(`active_medications_${familyId}`),
      new RegExp(`medications_refill_${familyId}`),
      new RegExp(`recent_symptoms_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const healthService = new HealthService();

// Legacy export for backward compatibility
export const healthRecordsService = healthService;
