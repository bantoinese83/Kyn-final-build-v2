// Notification Service - Handles all notification-related data operations
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

export interface Notification extends FamilyEntity {
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invitation"
    | "announcement";
  title: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  readAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "system"
    | "user"
    | "family"
    | "content"
    | "security"
    | "billing"
    | "other";
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationWithDetails extends Notification {
  recipient: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
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
}

export interface CreateNotificationData {
  familyId: string;
  authorId: string;
  recipientId: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invitation"
    | "announcement";
  title: string;
  message: string;
  priority?: "low" | "medium" | "high" | "urgent";
  category?:
    | "system"
    | "user"
    | "family"
    | "content"
    | "security"
    | "billing"
    | "other";
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  isRead?: boolean;
  isDismissed?: boolean;
  readAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters extends FamilyFilters {
  type?:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invitation"
    | "announcement";
  priority?: "low" | "medium" | "high" | "urgent";
  category?:
    | "system"
    | "user"
    | "family"
    | "content"
    | "security"
    | "billing"
    | "other";
  isRead?: boolean;
  isDismissed?: boolean;
  recipientId?: string;
  dateRange?: "all" | "today" | "week" | "month" | "year";
}

export interface NotificationSearchParams {
  query: string;
  filters?: NotificationFilters;
  sortBy?: "recent" | "priority" | "type" | "date" | "title";
  sortOrder?: "asc" | "desc";
}

export interface NotificationPreferences {
  userId: string;
  familyId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    info: boolean;
    success: boolean;
    warning: boolean;
    error: boolean;
    reminder: boolean;
    update: boolean;
    invitation: boolean;
    announcement: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  frequency: "immediate" | "hourly" | "daily" | "weekly";
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  dismissedCount: number;
  notificationsByType: Record<string, number>;
  notificationsByPriority: Record<string, number>;
  notificationsByCategory: Record<string, number>;
  averageReadTime: number;
  recentNotifications: number;
  expiredNotifications: number;
}

class NotificationService extends FamilyService<
  Notification,
  CreateNotificationData,
  UpdateNotificationData
> {
  protected tableName = "notifications";
  protected selectFields = `
    *,
    author:users!notifications_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    family:families!notifications_family_id_fkey(
      id,
      name,
      avatar
    ),
    recipient:users!notifications_recipient_id_fkey(
      id,
      name,
      email,
      avatar,
      initials
    )
  `;

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(
    userId: string,
    familyId: string,
    filters?: NotificationFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<NotificationWithDetails[]>> {
    const cacheKey = `user_notifications_${userId}_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<NotificationWithDetails[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserNotifications",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(
            `
          *,
          author:users!notifications_author_id_fkey(
            id,
            name,
            avatar,
            initials
          ),
          family:families!notifications_family_id_fkey(
            id,
            name,
            avatar
          ),
          recipient:users!notifications_recipient_id_fkey(
            id,
            name,
            email,
            avatar,
            initials
          )
        `,
          )
          .eq("recipient_id", userId)
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.type) {
          query = query.eq("type", filters.type);
        }
        if (filters?.priority) {
          query = query.eq("priority", filters.priority);
        }
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }
        if (filters?.isRead !== undefined) {
          query = query.eq("is_read", filters.isRead);
        }
        if (filters?.isDismissed !== undefined) {
          query = query.eq("is_dismissed", filters.isDismissed);
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

        const notifications = (data ||
          []) as unknown as NotificationWithDetails[];
        cacheSet(cacheKey, notifications, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: notifications, error: null };
      },
      "custom",
    );
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(
    userId: string,
    familyId: string,
  ): Promise<ServiceResponse<number>> {
    const cacheKey = `unread_count_${userId}_${familyId}`;
    const cached = cacheGet<number>(cacheKey, globalCache);
    if (cached !== null) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUnreadCount",
      async () => {
        const { count, error } = await supabase
          .from(this.tableName)
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userId)
          .eq("family_id", familyId)
          .eq("is_read", false)
          .eq("is_dismissed", false);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const unreadCount = count || 0;
        cacheSet(cacheKey, unreadCount, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: unreadCount, error: null };
      },
      "custom",
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "markAsRead",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
          .eq("recipient_id", userId);

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
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
    familyId: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "markAllAsRead",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("recipient_id", userId)
          .eq("family_id", familyId)
          .eq("is_read", false);

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
   * Dismiss a notification
   */
  async dismissNotification(
    notificationId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "dismissNotification",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({
            is_dismissed: true,
            dismissed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", notificationId)
          .eq("recipient_id", userId);

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
   * Send notification to multiple recipients
   */
  async sendNotification(
    notificationData: Omit<CreateNotificationData, "recipientId">,
    recipientIds: string[],
  ): Promise<ServiceResponse<Notification[]>> {
    return measureAsync(
      "sendNotification",
      async () => {
        const notifications: Notification[] = [];
        const now = new Date().toISOString();

        // Create notifications for each recipient
        for (const recipientId of recipientIds) {
          const { data: notification, error } = await supabase
            .from(this.tableName)
            .insert({
              ...notificationData,
              recipient_id: recipientId,
              created_at: now,
              updated_at: now,
            })
            .select()
            .single();

          if (error) {
            return { success: false, error: error.message, data: null };
          }

          notifications.push(notification as unknown as Notification);
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: notifications, error: null };
      },
      "custom",
    );
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(
    userId: string,
    familyId: string,
  ): Promise<ServiceResponse<NotificationPreferences | null>> {
    const cacheKey = `notification_preferences_${userId}_${familyId}`;
    const cached = cacheGet<NotificationPreferences | null>(
      cacheKey,
      globalCache,
    );
    if (cached !== null) return { success: true, data: cached, error: null };

    return measureAsync(
      "getNotificationPreferences",
      async () => {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .eq("family_id", familyId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          // Return default preferences if none exist
          const defaultPreferences: NotificationPreferences = {
            userId,
            familyId,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            notificationTypes: {
              info: true,
              success: true,
              warning: true,
              error: true,
              reminder: true,
              update: true,
              invitation: true,
              announcement: true,
            },
            quietHours: {
              enabled: false,
              startTime: "22:00",
              endTime: "08:00",
              timezone: "UTC",
            },
            frequency: "immediate",
          };

          cacheSet(cacheKey, defaultPreferences, 30 * 60 * 1000, globalCache); // 30 minutes
          return { success: true, data: defaultPreferences, error: null };
        }

        const preferences = data as unknown as NotificationPreferences;
        cacheSet(cacheKey, preferences, 30 * 60 * 1000, globalCache); // 30 minutes
        return { success: true, data: preferences, error: null };
      },
      "custom",
    );
  }

  /**
   * Update notification preferences for a user
   */
  async updateNotificationPreferences(
    userId: string,
    familyId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<ServiceResponse<NotificationPreferences>> {
    return measureAsync(
      "updateNotificationPreferences",
      async () => {
        const { data, error } = await supabase
          .from("notification_preferences")
          .upsert({
            user_id: userId,
            family_id: familyId,
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const updatedPreferences = data as unknown as NotificationPreferences;

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: updatedPreferences, error: null };
      },
      "custom",
    );
  }

  /**
   * Get notification statistics for a family
   */
  async getNotificationStats(
    familyId: string,
  ): Promise<ServiceResponse<NotificationStats>> {
    const cacheKey = `notification_stats_${familyId}`;
    const cached = cacheGet<NotificationStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getNotificationStats",
      async () => {
        const { data: notifications, error } = await supabase
          .from(this.tableName)
          .select(
            "type, priority, category, is_read, is_dismissed, created_at, read_at",
          )
          .eq("family_id", familyId);

        if (error) {
          return {
            success: false,
            error: error.message,
            data: null,
          };
        }

        const notificationList = notifications || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: NotificationStats = {
          totalNotifications: notificationList.length,
          unreadCount: notificationList.filter(
            (n) => !n.is_read && !n.is_dismissed,
          ).length,
          dismissedCount: notificationList.filter((n) => n.is_dismissed).length,
          notificationsByType: notificationList.reduce(
            (acc, n) => {
              const type = n.type || "info";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          notificationsByPriority: notificationList.reduce(
            (acc, n) => {
              const priority = n.priority || "medium";
              acc[priority] = (acc[priority] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          notificationsByCategory: notificationList.reduce(
            (acc, n) => {
              const category = n.category || "other";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageReadTime: 0, // This would require more sophisticated calculation
          recentNotifications: notificationList.filter(
            (n) => new Date(n.created_at) >= thirtyDaysAgo,
          ).length,
          expiredNotifications: notificationList.filter(
            (n) => n.expires_at && new Date(n.expires_at) < now,
          ).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(
    familyId: string,
  ): Promise<ServiceResponse<number>> {
    return measureAsync(
      "cleanupExpiredNotifications",
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
   * Search notifications by text content and filters
   */
  async searchNotifications(
    familyId: string,
    searchParams: NotificationSearchParams,
  ): Promise<ServiceResponse<Notification[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `notification_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Notification[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchNotifications",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(`title.ilike.%${query}%,message.ilike.%${query}%`);

        // Apply filters
        if (filters?.type) {
          queryBuilder = queryBuilder.eq("type", filters.type);
        }
        if (filters?.priority) {
          queryBuilder = queryBuilder.eq("priority", filters.priority);
        }
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.isRead !== undefined) {
          queryBuilder = queryBuilder.eq("is_read", filters.isRead);
        }
        if (filters?.isDismissed !== undefined) {
          queryBuilder = queryBuilder.eq("is_dismissed", filters.isDismissed);
        }
        if (filters?.recipientId) {
          queryBuilder = queryBuilder.eq("recipient_id", filters.recipientId);
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

          queryBuilder = queryBuilder.gte(
            "created_at",
            startDate.toISOString(),
          );
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "priority":
            orderBy = "priority";
            break;
          case "type":
            orderBy = "type";
            break;
          case "date":
            orderBy = "created_at";
            break;
          case "title":
            orderBy = "title";
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

        const notifications = (data || []) as unknown as Notification[];
        cacheSet(cacheKey, notifications, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: notifications, error: null };
      },
      "custom",
    );
  }

  /**
   * Invalidate cache for notifications
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`notifications_family_${familyId}`),
      new RegExp(`user_notifications_`),
      new RegExp(`unread_count_`),
      new RegExp(`notification_preferences_`),
      new RegExp(`notification_stats_${familyId}`),
      new RegExp(`notification_search_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const notificationService = new NotificationService();

// Legacy export for backward compatibility
export const notificationsService = notificationService;
