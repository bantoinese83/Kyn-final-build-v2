// User Service - Handles all user-related data operations
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

export interface User extends FamilyEntity {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  initials?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  timezone?: string;
  language?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  loginCount: number;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}

export interface UserWithFamily extends User {
  families: FamilyMember[];
  currentFamily?: FamilyMember;
  roles: string[];
  permissions: string[];
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: "admin" | "parent" | "child" | "guardian" | "other";
  status: "active" | "inactive" | "pending" | "blocked";
  joinedAt: string;
  invitedBy?: string;
  invitedAt?: string;
  acceptedAt?: string;
  family: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    isPublic: boolean;
  };
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: "immediate" | "hourly" | "daily" | "weekly";
  };
  privacy: {
    profileVisibility: "public" | "family" | "friends" | "private";
    activityVisibility: "public" | "family" | "friends" | "private";
    locationSharing: boolean;
  };
  theme: {
    mode: "light" | "dark" | "auto";
    primaryColor: string;
    fontSize: "small" | "medium" | "large";
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

export interface CreateUserData {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  timezone?: string;
  language?: string;
  password: string;
  preferences?: Partial<UserPreferences>;
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  timezone?: string;
  language?: string;
  isActive?: boolean;
  preferences?: Partial<UserPreferences>;
  metadata?: Record<string, any>;
}

export interface UserFilters extends FamilyFilters {
  isVerified?: boolean;
  isActive?: boolean;
  role?: string;
  status?: string;
  dateJoined?: string;
  lastLoginAfter?: string;
  searchTerm?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
}

export interface UserSearchParams {
  query: string;
  filters?: UserFilters;
  sortBy?: "recent" | "name" | "last_login" | "join_date" | "activity";
  sortOrder?: "asc" | "desc";
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  averageLoginFrequency: number;
  mostActiveUsers: Array<{ userId: string; name: string; loginCount: number }>;
  recentRegistrations: number;
}

class UserService extends FamilyService<User, CreateUserData, UpdateUserData> {
  protected tableName = "users";
  protected selectFields = `
    *,
    families:family_members(
      id,
      family_id,
      role,
      status,
      joined_at,
      family:families(
        id,
        name,
        description,
        avatar,
        is_public
      )
    )
  `;

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<ServiceResponse<User | null>> {
    const cacheKey = `user_by_email_${email}`;
    const cached = cacheGet<User | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserByEmail",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("email", email)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          return { success: false, error: error.message, data: null };
        }

        const user = data ? (data as unknown as User) : null;
        cacheSet(cacheKey, user, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: user, error: null };
      },
      "custom",
    );
  }

  /**
   * Get user with family information
   */
  async getUserWithFamily(
    userId: string,
  ): Promise<ServiceResponse<UserWithFamily | null>> {
    const cacheKey = `user_with_family_${userId}`;
    const cached = cacheGet<UserWithFamily | null>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserWithFamily",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(
            `
          *,
          families:family_members(
            id,
            family_id,
            role,
            status,
            joined_at,
            invited_by,
            invited_at,
            accepted_at,
            family:families(
              id,
              name,
              description,
              avatar,
              is_public
            )
          )
        `,
          )
          .eq("id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const user = data as unknown as UserWithFamily;
        const families = user.families || [];

        // Determine current family (most recently active)
        const currentFamily = families
          .filter((f) => f.status === "active")
          .sort(
            (a, b) =>
              new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
          )[0];

        // Extract roles and permissions
        const roles = families.map((f) => f.role);
        const permissions = this.getPermissionsFromRoles(roles);

        const enrichedUser: UserWithFamily = {
          ...user,
          families,
          currentFamily,
          roles,
          permissions,
        };

        cacheSet(cacheKey, enrichedUser, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedUser, error: null };
      },
      "custom",
    );
  }

  /**
   * Get users by family ID
   */
  async getUsersByFamily(
    familyId: string,
    filters?: UserFilters,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<ServiceResponse<UserWithFamily[]>> {
    const cacheKey = `users_by_family_${familyId}_${page}_${pageSize}`;
    const cached = cacheGet<UserWithFamily[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUsersByFamily",
      async () => {
        let query = supabase
          .from("family_members")
          .select(
            `
          *,
          user:users(
            *,
            families:family_members(
              id,
              family_id,
              role,
              status,
              joined_at,
              family:families(
                id,
                name,
                description,
                avatar,
                is_public
              )
            )
          ),
          family:families(
            id,
            name,
            description,
            avatar,
            is_public
          )
        `,
          )
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.role) {
          query = query.eq("role", filters.role);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.isVerified !== undefined) {
          query = query.eq("user.is_verified", filters.isVerified);
        }
        if (filters?.isActive !== undefined) {
          query = query.eq("user.is_active", filters.isActive);
        }

        const { data, error } = await query
          .order("joined_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const familyMembers = (data || []) as any[];

        // Transform and enrich users
        const enrichedUsers = familyMembers.map((fm) => {
          const user = fm.user as UserWithFamily;
          const families = user.families || [];
          const roles = families.map((f) => f.role);
          const permissions = this.getPermissionsFromRoles(roles);

          return {
            ...user,
            families,
            currentFamily: fm.family,
            roles,
            permissions,
          };
        }) as UserWithFamily[];

        cacheSet(cacheKey, enrichedUsers, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: enrichedUsers, error: null };
      },
      "custom",
    );
  }

  /**
   * Search users by text content and filters
   */
  async searchUsers(
    familyId: string,
    searchParams: UserSearchParams,
  ): Promise<ServiceResponse<User[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `user_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<User[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchUsers",
      async () => {
        let queryBuilder = supabase
          .from("users")
          .select(this.selectFields)
          .or(
            `name.ilike.%${query}%,email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`,
          );

        // Apply filters
        if (filters?.isVerified !== undefined) {
          queryBuilder = queryBuilder.eq("is_verified", filters.isVerified);
        }
        if (filters?.isActive !== undefined) {
          queryBuilder = queryBuilder.eq("is_active", filters.isActive);
        }
        if (filters?.gender) {
          queryBuilder = queryBuilder.eq("gender", filters.gender);
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "name":
            orderBy = "name";
            break;
          case "last_login":
            orderBy = "last_login_at";
            break;
          case "join_date":
            orderBy = "created_at";
            break;
          case "activity":
            orderBy = "login_count";
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

        const users = (data || []) as unknown as User[];
        cacheSet(cacheKey, users, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: users, error: null };
      },
      "custom",
    );
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: UpdateUserData,
  ): Promise<ServiceResponse<User>> {
    return measureAsync(
      "updateUserProfile",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: data as unknown as User, error: null };
      },
      "custom",
    );
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<ServiceResponse<UserPreferences>> {
    return measureAsync(
      "updateUserPreferences",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            preferences: preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select("preferences")
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const userPreferences = data.preferences as UserPreferences;

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: userPreferences, error: null };
      },
      "custom",
    );
  }

  /**
   * Update user avatar
   */
  async updateUserAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<ServiceResponse<User>> {
    return measureAsync(
      "updateUserAvatar",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            avatar: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        // Invalidate related caches
        await this.invalidateCache("*");

        return { success: true, data: data as unknown as User, error: null };
      },
      "custom",
    );
  }

  /**
   * Record user login
   */
  async recordUserLogin(userId: string): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "recordUserLogin",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .update({
            last_login_at: new Date().toISOString(),
            login_count: supabase.rpc("increment_login_count", {
              user_id: userId,
            }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

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
   * Get user statistics for a family
   */
  async getUserStats(familyId: string): Promise<ServiceResponse<UserStats>> {
    const cacheKey = `user_stats_${familyId}`;
    const cached = cacheGet<UserStats>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserStats",
      async () => {
        const [usersResult, familyMembersResult] = await Promise.all([
          supabase
            .from(this.tableName)
            .select(
              "id, is_verified, is_active, last_login_at, login_count, created_at, name",
            )
            .eq("family_id", familyId),
          supabase
            .from("family_members")
            .select("role, status, joined_at")
            .eq("family_id", familyId),
        ]);

        if (usersResult.error || familyMembersResult.error) {
          return {
            success: false,
            error: "Failed to fetch user statistics",
            data: null,
          };
        }

        const users = usersResult.data || [];
        const familyMembers = familyMembersResult.data || [];

        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const stats: UserStats = {
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.is_active).length,
          verifiedUsers: users.filter((u) => u.is_verified).length,
          usersByRole: familyMembers.reduce(
            (acc, fm) => {
              const role = fm.role || "other";
              acc[role] = (acc[role] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          usersByStatus: familyMembers.reduce(
            (acc, fm) => {
              const status = fm.status || "active";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          averageLoginFrequency:
            users.length > 0
              ? users.reduce((sum, u) => sum + (u.login_count || 0), 0) /
                users.length
              : 0,
          mostActiveUsers: users
            .filter((u) => u.login_count && u.login_count > 0)
            .sort((a, b) => (b.login_count || 0) - (a.login_count || 0))
            .slice(0, 5)
            .map((u) => ({
              userId: u.id,
              name: u.name || "Unknown",
              loginCount: u.login_count || 0,
            })),
          recentRegistrations: users.filter(
            (u) => new Date(u.created_at) >= thirtyDaysAgo,
          ).length,
        };

        cacheSet(cacheKey, stats, 10 * 60 * 1000, globalCache); // 10 minutes
        return { success: true, data: stats, error: null };
      },
      "custom",
    );
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId: string,
    days: number = 30,
  ): Promise<
    ServiceResponse<
      Array<{
        date: string;
        type: string;
        description: string;
        metadata?: Record<string, any>;
      }>
    >
  > {
    const cacheKey = `user_activity_${userId}_${days}`;
    const cached = cacheGet<any[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getUserActivityTimeline",
      async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // This would typically query multiple activity tables
        // For now, we'll return a placeholder structure
        const activities = [
          {
            date: new Date().toISOString(),
            type: "login",
            description: "User logged in",
            metadata: { ip: "192.168.1.1", userAgent: "Mozilla/5.0..." },
          },
        ];

        cacheSet(cacheKey, activities, 5 * 60 * 1000, globalCache); // 5 minutes
        return { success: true, data: activities, error: null };
      },
      "custom",
    );
  }

  /**
   * Get permissions from user roles
   */
  private getPermissionsFromRoles(roles: string[]): string[] {
    const permissions: string[] = [];

    roles.forEach((role) => {
      switch (role) {
        case "admin":
          permissions.push(
            "manage_family",
            "manage_users",
            "manage_content",
            "view_analytics",
          );
          break;
        case "parent":
          permissions.push("manage_content", "view_analytics", "invite_users");
          break;
        case "guardian":
          permissions.push("view_content", "limited_management");
          break;
        case "child":
          permissions.push("view_content", "create_content");
          break;
        default:
          permissions.push("view_content");
      }
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Invalidate cache for users
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`users_family_${familyId}`),
      new RegExp(`user_by_email_`),
      new RegExp(`user_with_family_`),
      new RegExp(`users_by_family_${familyId}`),
      new RegExp(`user_search_${familyId}`),
      new RegExp(`user_stats_${familyId}`),
      new RegExp(`user_activity_`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const userService = new UserService();

// Legacy export for backward compatibility
export const usersService = userService;
