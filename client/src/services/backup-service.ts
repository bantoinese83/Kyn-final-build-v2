// Backup Service - Handles all backup and restore data operations
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

export interface Backup extends FamilyEntity {
  name: string;
  description?: string;
  type: "full" | "incremental" | "differential" | "selective";
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  size: number;
  sizeUnit: "bytes" | "kb" | "mb" | "gb" | "tb";
  compressionRatio: number;
  encryptionEnabled: boolean;
  encryptionType?: "aes-256" | "aes-128" | "none";
  backupLocation: "local" | "cloud" | "external" | "hybrid";
  cloudProvider?: "aws" | "google" | "azure" | "dropbox" | "other";
  filePath?: string;
  checksum: string;
  checksumAlgorithm: "md5" | "sha1" | "sha256" | "sha512";
  retentionDays: number;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface BackupWithDetails extends Backup {
  family: {
    id: string;
    name: string;
    avatar?: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  backupItems: BackupItem[];
  restoreHistory: RestoreOperation[];
}

export interface BackupItem {
  id: string;
  backupId: string;
  tableName: string;
  recordCount: number;
  size: number;
  status: "pending" | "backed_up" | "failed" | "skipped";
  errorMessage?: string;
  backupStartedAt?: string;
  backupCompletedAt?: string;
}

export interface RestoreOperation {
  id: string;
  backupId: string;
  familyId: string;
  authorId: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  restoreType: "full" | "selective" | "test";
  targetTables: string[];
  restoreStartedAt?: string;
  restoreCompletedAt?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface CreateBackupData {
  familyId: string;
  authorId: string;
  name: string;
  description?: string;
  type: "full" | "incremental" | "differential" | "selective";
  backupLocation: "local" | "cloud" | "external" | "hybrid";
  cloudProvider?: "aws" | "google" | "azure" | "dropbox" | "other";
  filePath?: string;
  encryptionEnabled?: boolean;
  encryptionType?: "aes-256" | "aes-128" | "none";
  retentionDays?: number;
  targetTables?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateBackupData {
  name?: string;
  description?: string;
  status?: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  size?: number;
  sizeUnit?: "bytes" | "kb" | "mb" | "gb" | "tb";
  compressionRatio?: number;
  checksum?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface BackupFilters extends FamilyFilters {
  type?: "full" | "incremental" | "differential" | "selective";
  status?: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  backupLocation?: "local" | "cloud" | "external" | "hybrid";
  cloudProvider?: "aws" | "google" | "azure" | "dropbox" | "other";
  dateRange?: "all" | "today" | "week" | "month" | "year";
  minSize?: number;
  maxSize?: number;
}

export interface BackupSearchParams {
  query: string;
  filters?: BackupFilters;
  sortBy?: "recent" | "name" | "size" | "status" | "date";
  sortOrder?: "asc" | "desc";
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  sizeUnit: string;
  backupsByType: Record<string, number>;
  backupsByStatus: Record<string, number>;
  backupsByLocation: Record<string, number>;
  averageBackupSize: number;
  successfulBackups: number;
  failedBackups: number;
  recentBackups: number;
  expiredBackups: number;
  totalRestores: number;
  successfulRestores: number;
}

export interface BackupSchedule {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  nextRunAt: string;
  isActive: boolean;
  backupType: "full" | "incremental" | "differential";
  targetTables: string[];
  retentionDays: number;
  encryptionEnabled: boolean;
  cloudBackupEnabled: boolean;
  metadata?: Record<string, any>;
}

class BackupService extends FamilyService<
  Backup,
  CreateBackupData,
  UpdateBackupData
> {
  protected tableName = "backups";
  protected selectFields = `
    *,
    author:users!backups_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    family:families!backups_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Create a new backup
   */
  async createBackup(
    backupData: CreateBackupData,
  ): Promise<ServiceResponse<Backup>> {
    return measureAsync(
      "createBackup",
      async () => {
        // Calculate expiration date
        const retentionDays = backupData.retentionDays || 30;
        const expiresAt = new Date(
          Date.now() + retentionDays * 24 * 60 * 60 * 1000,
        );

        // Create the backup record
        const { data: backup, error } = await supabase
          .from(this.tableName)
          .insert({
            ...backupData,
            status: "pending",
            size: 0,
            sizeUnit: "bytes",
            compressionRatio: 1.0,
            checksum: "",
            checksumAlgorithm: "sha256",
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Create backup items for each table
        const targetTables = backupData.targetTables || [
          "users",
          "posts",
          "events",
          "photos",
          "recipes",
        ];

        for (const tableName of targetTables) {
          await supabase.from("backup_items").insert({
            backup_id: backup.id,
            table_name: tableName,
            record_count: 0,
            size: 0,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: backup as unknown as Backup,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Start backup process
   */
  async startBackup(backupId: string): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "startBackup",
      async () => {
        // Update backup status
        const { error: updateError } = await supabase
          .from(this.tableName)
          .update({
            status: "in_progress",
            updated_at: new Date().toISOString(),
          })
          .eq("id", backupId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Update backup items status
        await supabase
          .from("backup_items")
          .update({
            status: "pending",
            backup_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("backup_id", backupId);

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Complete backup process
   */
  async completeBackup(
    backupId: string,
    backupResults: {
      size: number;
      sizeUnit: "bytes" | "kb" | "mb" | "gb" | "tb";
      compressionRatio: number;
      checksum: string;
      tableResults: Array<{
        tableName: string;
        recordCount: number;
        size: number;
        status: "backed_up" | "failed" | "skipped";
        errorMessage?: string;
      }>;
    },
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "completeBackup",
      async () => {
        // Update backup record
        const { error: updateError } = await supabase
          .from(this.tableName)
          .update({
            status: "completed",
            size: backupResults.size,
            size_unit: backupResults.sizeUnit,
            compression_ratio: backupResults.compressionRatio,
            checksum: backupResults.checksum,
            updated_at: new Date().toISOString(),
          })
          .eq("id", backupId);

        if (updateError) {
          return { success: false, error: updateError.message, data: null };
        }

        // Update backup items
        for (const tableResult of backupResults.tableResults) {
          await supabase
            .from("backup_items")
            .update({
              record_count: tableResult.recordCount,
              size: tableResult.size,
              status: tableResult.status,
              error_message: tableResult.errorMessage,
              backup_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("backup_id", backupId)
            .eq("table_name", tableResult.tableName);
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Get backup with full details
   */
  async getBackupWithDetails(
    backupId: string,
  ): Promise<ServiceResponse<BackupWithDetails | null>> {
    const cacheKey = `backup_with_details_${backupId}`;
    const cached = cacheGet<BackupWithDetails | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getBackupWithDetails",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!backups_author_id_fkey(
            id,
            name,
            avatar,
            initials
          ),
          family:families!backups_family_id_fkey(
            id,
            name,
            avatar
          ),
          backup_items:backup_items(
            id,
            table_name,
            record_count,
            size,
            status,
            error_message,
            backup_started_at,
            backup_completed_at
          ),
          restore_history:restore_operations(
            id,
            status,
            restore_type,
            target_tables,
            restore_started_at,
            restore_completed_at,
            error_message
          )
        `,
          )
          .eq("id", backupId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const backup = data as any;
        const enrichedBackup: BackupWithDetails = {
          ...backup,
          backupItems: backup.backup_items || [],
          restoreHistory: backup.restore_history || [],
        };

        cacheSet(cacheKey, enrichedBackup, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: enrichedBackup, error: null };
      },
      "custom",
    );
  }

  /**
   * Get backups for a family
   */
  async getFamilyBackups(
    familyId: string,
    filters?: BackupFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<Backup[]>> {
    const cacheKey = `family_backups_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<Backup[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getFamilyBackups",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.type) {
          query = query.eq("type", filters.type);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.backupLocation) {
          query = query.eq("backup_location", filters.backupLocation);
        }
        if (filters?.cloudProvider) {
          query = query.eq("cloud_provider", filters.cloudProvider);
        }
        if (filters?.minSize) {
          query = query.gte("size", filters.minSize);
        }
        if (filters?.maxSize) {
          query = query.lte("size", filters.maxSize);
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
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case "year":
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte("created_at", startDate.toISOString());
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const backups = (data || []) as unknown as Backup[];
        cacheSet(cacheKey, backups, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: backups, error: null };
      },
      "custom",
    );
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(
    backupId: string,
    familyId: string,
    authorId: string,
    options: {
      restoreType: "full" | "selective" | "test";
      targetTables?: string[];
      metadata?: Record<string, any>;
    },
  ): Promise<ServiceResponse<RestoreOperation>> {
    return measureAsync(
      "restoreFromBackup",
      async () => {
        // Create restore operation record
        const { data: restoreOp, error } = await supabase
          .from("restore_operations")
          .insert({
            backup_id: backupId,
            family_id: familyId,
            author_id: authorId,
            status: "pending",
            restore_type: options.restoreType,
            target_tables: options.targetTables || [],
            metadata: options.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Update backup status if this is a test restore
        if (options.restoreType === "test") {
          await supabase
            .from(this.tableName)
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", backupId);
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: restoreOp as unknown as RestoreOperation,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Start restore process
   */
  async startRestore(restoreId: string): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "startRestore",
      async () => {
        const { error } = await supabase
          .from("restore_operations")
          .update({
            status: "in_progress",
            restore_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", restoreId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Complete restore process
   */
  async completeRestore(
    restoreId: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "completeRestore",
      async () => {
        const status = success ? "completed" : "failed";

        const { error } = await supabase
          .from("restore_operations")
          .update({
            status: status,
            restore_completed_at: new Date().toISOString(),
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", restoreId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Delete expired backups
   */
  async cleanupExpiredBackups(
    familyId: string,
  ): Promise<ServiceResponse<number>> {
    return measureAsync(
      "cleanupExpiredBackups",
      async () => {
        const now = new Date().toISOString();

        const { count, error } = await supabase
          .from(this.tableName)
          .delete()
          .eq("family_id", familyId)
          .lt("expires_at", now);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: count || 0, error: null };
      },
      "custom",
    );
  }

  /**
   * Get backup statistics for a family
   */
  async getBackupStats(
    familyId: string,
  ): Promise<ServiceResponse<BackupStats>> {
    const cacheKey = `backup_stats_${familyId}`;
    const cached = cacheGet<BackupStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getBackupStats",
      async () => {
        const [backupsResult, restoresResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select(
              "type, status, backup_location, size, size_unit, created_at, expires_at",
            )
            .eq("family_id", familyId),
          supabase
            .from("restore_operations")
            .select("status")
            .eq("family_id", familyId),
        ]);

        if (backupsResult.error || restoresResult.error) {
          return {
            success: false,
            error: "Failed to fetch backup statistics",
            data: null,
          };
        }

        const backups = backupsResult.data || [];
        const restores = restoresResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        // Calculate total size in bytes
        const totalSizeBytes = backups.reduce((sum, b) => {
          const sizeInBytes = this.convertToBytes(b.size, b.size_unit);
          return sum + sizeInBytes;
        }, 0);

        const { size: totalSize, unit: sizeUnit } =
          this.convertFromBytes(totalSizeBytes);

        const stats: BackupStats = {
          totalBackups: backups.length,
          totalSize,
          sizeUnit,
          backupsByType: backups.reduce(
            (acc, b) => {
              const type = b.type || "full";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          backupsByStatus: backups.reduce(
            (acc, b) => {
              const status = b.status || "pending";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          backupsByLocation: backups.reduce(
            (acc, b) => {
              const location = b.backup_location || "local";
              acc[location] = (acc[location] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageBackupSize:
            backups.length > 0 ? totalSize / backups.length : 0,
          successfulBackups: backups.filter((b) => b.status === "completed")
            .length,
          failedBackups: backups.filter((b) => b.status === "failed").length,
          recentBackups: backups.filter(
            (b) => new Date(b.created_at) >= thirtyDaysAgo,
          ).length,
          expiredBackups: backups.filter(
            (b) => b.expires_at && new Date(b.expires_at) < now,
          ).length,
          totalRestores: restores.length,
          successfulRestores: restores.filter((r) => r.status === "completed")
            .length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Create backup schedule
   */
  async createBackupSchedule(
    scheduleData: Omit<BackupSchedule, "id" | "nextRunAt">,
  ): Promise<ServiceResponse<BackupSchedule>> {
    return measureAsync(
      "createBackupSchedule",
      async () => {
        // Calculate next run time
        const nextRunAt = this.calculateNextRunTime(
          scheduleData.frequency,
          scheduleData.cronExpression,
        );

        const { data: schedule, error } = await supabase
          .from("backup_schedules")
          .insert({
            ...scheduleData,
            next_run_at: nextRunAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: schedule as unknown as BackupSchedule,
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Search backups by text content and filters
   */
  async searchBackups(
    familyId: string,
    searchParams: BackupSearchParams,
  ): Promise<ServiceResponse<Backup[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `backup_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Backup[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchBackups",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

        // Apply filters
        if (filters?.type) {
          queryBuilder = queryBuilder.eq("type", filters.type);
        }
        if (filters?.status) {
          queryBuilder = queryBuilder.eq("status", filters.status);
        }
        if (filters?.backupLocation) {
          queryBuilder = queryBuilder.eq(
            "backup_location",
            filters.backupLocation,
          );
        }
        if (filters?.cloudProvider) {
          queryBuilder = queryBuilder.eq(
            "cloud_provider",
            filters.cloudProvider,
          );
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "name":
            orderBy = "name";
            break;
          case "size":
            orderBy = "size";
            break;
          case "status":
            orderBy = "status";
            break;
          case "date":
            orderBy = "created_at";
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

        const backups = (data || []) as unknown as Backup[];
        cacheSet(cacheKey, backups, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: backups, error: null };
      },
      "custom",
    );
  }

  /**
   * Convert size to bytes
   */
  private convertToBytes(size: number, unit: string): number {
    const multipliers: Record<string, number> = {
      bytes: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
      tb: 1024 * 1024 * 1024 * 1024,
    };

    return size * (multipliers[unit] || 1);
  }

  /**
   * Convert bytes to human readable format
   */
  private convertFromBytes(bytes: number): { size: number; unit: string } {
    const units = ["bytes", "kb", "mb", "gb", "tb"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return { size: Math.round(size * 100) / 100, unit: units[unitIndex] };
  }

  /**
   * Calculate next run time for backup schedule
   */
  private calculateNextRunTime(
    frequency: string,
    cronExpression?: string,
  ): Date {
    const now = new Date();

    if (cronExpression) {
      // This would require a cron parser library
      // For now, return a default time
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    }

    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Invalidate cache for backups
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`backups_family_${familyId}`),
      new RegExp(`backup_with_details_`),
      new RegExp(`family_backups_${familyId}`),
      new RegExp(`backup_stats_${familyId}`),
      new RegExp(`backup_search_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const backupService = new BackupService();

// Legacy export for backward compatibility
export const backupsService = backupService;
