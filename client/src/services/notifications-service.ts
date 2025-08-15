// Notifications Service - Handles all notification-related data operations
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
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invite"
    | "system";
  category:
    | "general"
    | "family"
    | "events"
    | "photos"
    | "health"
    | "games"
    | "chat"
    | "security"
    | "other";
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  readAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationWithRecipient extends Notification {
  recipient: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
    email?: string;
  };
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    initials?: string;
  };
  relatedEntity?: {
    id: string;
    type: string;
    title: string;
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  familyId: string;
  authorId: string;
  recipientIds: string[];
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invite"
    | "system";
  category:
    | "general"
    | "family"
    | "events"
    | "photos"
    | "health"
    | "games"
    | "chat"
    | "security"
    | "other";
  priority?: "low" | "normal" | "high" | "urgent";
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  type?:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "reminder"
    | "update"
    | "invite"
    | "system";
  category?:
    | "general"
    | "family"
    | "events"
    | "photos"
    | "health"
    | "games"
    | "chat"
    | "security"
    | "other";
  priority?: "low" | "normal" | "high" | "urgent";
  isRead?: boolean;
  isDismissed?: boolean;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
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
    | "invite"
    | "system";
  category?:
    | "general"
    | "family"
    | "events"
    | "photos"
    | "health"
    | "games"
    | "chat"
    | "security"
    | "other";
  priority?: "low" | "normal" | "high" | "urgent";
  isRead?: boolean;
  isDismissed?: boolean;
  dateRange?: "all" | "today" | "week" | "month";
  recipientId?: string;
}

export interface NotificationSearchParams {
  query: string;
  filters?: NotificationFilters;
  sortBy?: "recent" | "priority" | "unread" | "category" | "date";
  sortOrder?: "asc" | "desc";
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  familyId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  categories: {
    general: boolean;
    family: boolean;
    events: boolean;
    photos: boolean;
    health: boolean;
    games: boolean;
    chat: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: "immediate" | "hourly" | "daily" | "weekly";
  metadata?: Record<string, any>;
}

class NotificationsService extends FamilyService<
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
    recipient:users!notifications_recipient_id_fkey(
      id,
      name,
      avatar,
      initials,
      email
    )
  `;

  /**
   * Get notifications for a specific user in a family
   */
  async getUserNotifications(
    userId: string,
    familyId: string,
    filters?: NotificationFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<NotificationWithRecipient[]>> {
    const cacheKey = `user_notifications_${userId}_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<NotificationWithRecipient[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserNotifications",
      async () => {
        let query = supabase
          .from("user_notifications")
          .select(
            `
          *,
          notification:notifications(
            *,
            author:users!notifications_author_id_fkey(
              id,
              name,
              avatar,
              initials
            )
          ),
          recipient:users!user_notifications_user_id_fkey(
            id,
            name,
            avatar,
            initials,
            email
          )
        `,
          )
          .eq("user_id", userId)
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.type) {
          query = query.eq("notification.type", filters.type);
        }
        if (filters?.category) {
          query = query.eq("notification.category", filters.category);
        }
        if (filters?.priority) {
          query = query.eq("notification.priority", filters.priority);
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
              startDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );
              break;
            default:
              startDate = new Date(0);
          }

          query = query.gte("notification.created_at", startDate.toISOString());
        }

        const { data, error } = await query
          .order("notification.created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const userNotifications = (data || []) as any[];

        // Transform and enrich notifications
        const enrichedNotifications = userNotifications.map((un) => ({
          ...un.notification,
          recipient: un.recipient,
          isRead: un.is_read,
          readAt: un.read_at,
          isDismissed: un.is_dismissed,
          dismissedAt: un.dismissed_at,
        })) as NotificationWithRecipient[];

        cacheSet(cacheKey, enrichedNotifications, 2 * 60 * 1000, globalCache); // 2 minutes
        return { success: true, data: enrichedNotifications, error: null };
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
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUnreadCount",
      async () => {
        const { count, error } = await supabase
          .from("user_notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("family_id", familyId)
          .eq("is_read", false)
          .eq("is_dismissed", false);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const unreadCount = count || 0;
        cacheSet(cacheKey, unreadCount, 30 * 1000, globalCache); // 30 seconds for unread count
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
          .from("user_notifications")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("notification_id", notificationId)
          .eq("user_id", userId);

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
          .from("user_notifications")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
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
          .from("user_notifications")
          .update({
            is_dismissed: true,
            dismissed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("notification_id", notificationId)
          .eq("user_id", userId);

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
    notificationData: CreateNotificationData,
  ): Promise<ServiceResponse<Notification[]>> {
    return measureAsync(
      "sendNotification",
      async () => {
        // Create the base notification
        const { data: notification, error: notificationError } = await supabase
          .from(this.tableName)
          .insert({
            title: notificationData.title,
            message: notificationData.message,
            family_id: notificationData.familyId,
            author_id: notificationData.authorId,
            type: notificationData.type,
            category: notificationData.category,
            priority: notificationData.priority || "normal",
            action_url: notificationData.actionUrl,
            action_text: notificationData.actionText,
            expires_at: notificationData.expiresAt,
            metadata: notificationData.metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (notificationError) {
          return {
            success: false,
            error: notificationError.message,
            data: null,
          };
        }

        // Create user notification records for each recipient
        const userNotificationPromises = notificationData.recipientIds.map(
          (recipientId) =>
            supabase.from("user_notifications").insert({
              notification_id: notification.id,
              user_id: recipientId,
              family_id: notificationData.familyId,
              is_read: false,
              is_dismissed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
        );

        await Promise.all(userNotificationPromises);

        // Invalidate related caches
        await this.invalidateCache("*");

        return {
          success: true,
          data: [notification as unknown as Notification],
          error: null,
        };
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
  ): Promise<ServiceResponse<NotificationPreferences>> {
    const cacheKey = `notification_preferences_${userId}_${familyId}`;
    const cached = cacheGet<NotificationPreferences>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

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
          // PGRST116 = no rows returned
          return { success: false, error: error.message, data: null };
        }

        let preferences: NotificationPreferences;
        if (data) {
          preferences = data as unknown as NotificationPreferences;
        } else {
          // Create default preferences if none exist
          preferences = {
            id: "",
            userId,
            familyId,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            categories: {
              general: true,
              family: true,
              events: true,
              photos: true,
              health: true,
              games: true,
              chat: true,
              security: true,
            },
            quietHours: {
              enabled: false,
              startTime: "22:00",
              endTime: "08:00",
            },
            frequency: "immediate",
          };
        }

        cacheSet(cacheKey, preferences, 10 * 60 * 1000, globalCache); // 10 minutes
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
    updates: Partial<NotificationPreferences>,
  ): Promise<ServiceResponse<NotificationPreferences>> {
    return measureAsync(
      "updateNotificationPreferences",
      async () => {
        const { data, error } = await supabase
          .from("notification_preferences")
          .upsert({
            user_id: userId,
            family_id: familyId,
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const preferences = data as unknown as NotificationPreferences;

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: preferences, error: null };
      },
      "custom",
    );
  }

  /**
   * Get notification statistics for a family
   */
  async getNotificationStats(familyId: string): Promise<
    ServiceResponse<{
      totalNotifications: number;
      notificationsByType: Record<string, number>;
      notificationsByCategory: Record<string, number>;
      notificationsByPriority: Record<string, number>;
      readRate: number;
      averageResponseTime: number;
      mostActiveUsers: Array<{ userId: string; count: number }>;
    }>
  > {
    const cacheKey = `notification_stats_${familyId}`;
    const cached = cacheGet<any>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getNotificationStats",
      async () => {
        const [notificationsResult, userNotificationsResult] =
          await Promise.all([
            supabase
              .from(this.tableName)
              .select("type, category, priority, created_at")
              .eq("family_id", familyId),
            supabase
              .from("user_notifications")
              .select("user_id, is_read, read_at, created_at")
              .eq("family_id", familyId),
          ]);

        if (notificationsResult.error || userNotificationsResult.error) {
          return {
            success: false,
            error: "Failed to fetch notification statistics",
            data: null,
          };
        }

        const notifications = notificationsResult.data || [];
        const userNotifications = userNotificationsResult.data || [];

        const stats = {
          totalNotifications: notifications.length,
          notificationsByType: notifications.reduce(
            (acc, n) => {
              const type = n.type || "other";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          notificationsByCategory: notifications.reduce(
            (acc, n) => {
              const category = n.category || "other";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          notificationsByPriority: notifications.reduce(
            (acc, n) => {
              const priority = n.priority || "normal";
              acc[priority] = (acc[priority] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          readRate:
            userNotifications.length > 0
              ? userNotifications.filter((un) => un.is_read).length /
                userNotifications.length
              : 0,
          averageResponseTime: 0, // This would require additional calculation
          mostActiveUsers: [], // This would require additional calculation
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
  async cleanupExpiredNotifications(): Promise<ServiceResponse<number>> {
    return measureAsync(
      "cleanupExpiredNotifications",
      async () => {
        const now = new Date();

        const { count, error } = await supabase
          .from(this.tableName)
          .delete()
          .not("expires_at", "is", null)
          .lt("expires_at", now.toISOString())
          .select("*", { count: "exact", head: true });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const deletedCount = count || 0;

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: deletedCount, error: null };
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
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const notificationService = new NotificationsService();

// Legacy export for backward compatibility
export const notificationsService = notificationService;
