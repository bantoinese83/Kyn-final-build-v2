// Settings Service - Handles all application and user settings data operations
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

export interface Setting extends FamilyEntity {
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json" | "array" | "object";
  category:
    | "app"
    | "user"
    | "family"
    | "security"
    | "privacy"
    | "notifications"
    | "ui"
    | "other";
  subcategory?: string;
  description?: string;
  isPublic: boolean;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    required?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface SettingWithDetails extends Setting {
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

export interface CreateSettingData {
  familyId: string;
  authorId: string;
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json" | "array" | "object";
  category:
    | "app"
    | "user"
    | "family"
    | "security"
    | "privacy"
    | "notifications"
    | "ui"
    | "other";
  subcategory?: string;
  description?: string;
  isPublic?: boolean;
  isRequired?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    required?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface UpdateSettingData {
  value?: any;
  type?: "string" | "number" | "boolean" | "json" | "array" | "object";
  category?:
    | "app"
    | "user"
    | "family"
    | "security"
    | "privacy"
    | "notifications"
    | "ui"
    | "other";
  subcategory?: string;
  description?: string;
  isPublic?: boolean;
  isRequired?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    required?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface SettingFilters extends FamilyFilters {
  key?: string;
  type?: "string" | "number" | "boolean" | "json" | "array" | "object";
  category?:
    | "app"
    | "user"
    | "family"
    | "security"
    | "privacy"
    | "notifications"
    | "ui"
    | "other";
  subcategory?: string;
  isPublic?: boolean;
  isRequired?: boolean;
}

export interface SettingSearchParams {
  query: string;
  filters?: SettingFilters;
  sortBy?: "recent" | "key" | "category" | "type" | "date";
  sortOrder?: "asc" | "desc";
}

export interface SettingsConfig {
  familyId: string;
  settings: Record<string, any>;
  categories: Record<string, Setting[]>;
  metadata: {
    lastUpdated: string;
    version: string;
    checksum: string;
  };
}

export interface SettingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class SettingsService extends FamilyService<
  Setting,
  CreateSettingData,
  UpdateSettingData
> {
  protected tableName = "settings";
  protected selectFields = `
    *,
    author:users!settings_author_id_fkey(
      id,
      name,
      avatar,
      initials
    ),
    family:families!settings_family_id_fkey(
      id,
      name,
      avatar
    )
  `;

  /**
   * Get setting by key for a family
   */
  async getSettingByKey(
    key: string,
    familyId: string,
  ): Promise<ServiceResponse<Setting | null>> {
    const cacheKey = `setting_by_key_${key}_${familyId}`;
    const cached = cacheGet<Setting | null>(cacheKey, globalCache);
    if (cached !== null) return { success: true, data: cached, error: null };

    return measureAsync(
      "getSettingByKey",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("key", key)
          .eq("family_id", familyId)
          .single();

        if (error && error.code !== "PGRST116") {
          return { success: false, error: error.message, data: null };
        }

        if (!data) {
          return { success: true, data: null, error: null };
        }

        const setting = data as unknown as Setting;
        cacheSet(cacheKey, setting, 30 * 60 * 1000, globalCache); // 30 minutes
        return { success: true, data: setting, error: null };
      },
      "custom",
    );
  }

  /**
   * Get multiple settings by keys for a family
   */
  async getSettingsByKeys(
    keys: string[],
    familyId: string,
  ): Promise<ServiceResponse<Record<string, any>>> {
    const cacheKey = `settings_by_keys_${keys.join("_")}_${familyId}`;
    const cached = cacheGet<Record<string, any>>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getSettingsByKeys",
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(this.selectFields)
          .in("key", keys)
          .eq("family_id", familyId);

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const settings = (data || []) as unknown as Setting[];
        const settingsMap = settings.reduce(
          (acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
          },
          {} as Record<string, any>,
        );

        cacheSet(cacheKey, settingsMap, 30 * 60 * 1000, globalCache); // 30 minutes
        return { success: true, data: settingsMap, error: null };
      },
      "custom",
    );
  }

  /**
   * Get all settings for a family organized by category
   */
  async getFamilySettings(
    familyId: string,
    filters?: SettingFilters,
  ): Promise<ServiceResponse<SettingsConfig>> {
    const cacheKey = `family_settings_${familyId}_${JSON.stringify(filters)}`;
    const cached = cacheGet<SettingsConfig>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "getFamilySettings",
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId);

        // Apply filters
        if (filters?.category) {
          query = query.eq("category", filters.category);
        }
        if (filters?.subcategory) {
          query = query.eq("subcategory", filters.subcategory);
        }
        if (filters?.isPublic !== undefined) {
          query = query.eq("is_public", filters.isPublic);
        }

        const { data, error } = await query.order("category", {
          ascending: true,
        });

        if (error) {
          return { success: false, error: error.message, data: null };
        }

        const settings = (data || []) as unknown as Setting[];

        // Organize settings by category
        const categories: Record<string, Setting[]> = {};
        const settingsMap: Record<string, any> = {};

        settings.forEach((setting) => {
          if (!categories[setting.category]) {
            categories[setting.category] = [];
          }
          categories[setting.category].push(setting);
          settingsMap[setting.key] = setting.value;
        });

        const config: SettingsConfig = {
          familyId,
          settings: settingsMap,
          categories,
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            checksum: this.generateChecksum(settingsMap),
          },
        };

        cacheSet(cacheKey, config, 30 * 60 * 1000, globalCache); // 30 minutes
        return { success: true, data: config, error: null };
      },
      "custom",
    );
  }

  /**
   * Set a setting value
   */
  async setSetting(
    key: string,
    value: any,
    familyId: string,
    authorId: string,
    options?: {
      type?: "string" | "number" | "boolean" | "json" | "array" | "object";
      category?:
        | "app"
        | "user"
        | "family"
        | "security"
        | "privacy"
        | "notifications"
        | "ui"
        | "other";
      subcategory?: string;
      description?: string;
      isPublic?: boolean;
      isRequired?: boolean;
      validation?: any;
    },
  ): Promise<ServiceResponse<Setting>> {
    return measureAsync(
      "setSetting",
      async () => {
        // Check if setting exists
        const existingSetting = await this.getSettingByKey(key, familyId);

        if (existingSetting.success && existingSetting.data) {
          // Update existing setting
          const { data: setting, error } = await supabase
            .from(this.tableName)
            .update({
              value: value,
              type: options?.type || existingSetting.data.type,
              category: options?.category || existingSetting.data.category,
              subcategory:
                options?.subcategory || existingSetting.data.subcategory,
              description:
                options?.description || existingSetting.data.description,
              is_public:
                options?.isPublic !== undefined
                  ? options.isPublic
                  : existingSetting.data.isPublic,
              is_required:
                options?.isRequired !== undefined
                  ? options.isRequired
                  : existingSetting.data.isRequired,
              validation:
                options?.validation || existingSetting.data.validation,
              metadata: existingSetting.data.metadata,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSetting.data.id)
            .select()
            .single();

          if (error) {
            return { success: false, error: error.message, data: null };
          }

          // Invalidate related caches
          await this.invalidateCache("*");

          return {
            success: true,
            data: setting as unknown as Setting,
            error: null,
          };
        } else {
          // Create new setting
          const { data: setting, error } = await supabase
            .from(this.tableName)
            .insert({
              key,
              value,
              family_id: familyId,
              author_id: authorId,
              type: options?.type || this.inferType(value),
              category: options?.category || "app",
              subcategory: options?.subcategory,
              description: options?.description,
              is_public:
                options?.isPublic !== undefined ? options.isPublic : true,
              is_required:
                options?.isRequired !== undefined ? options.isRequired : false,
              validation: options?.validation,
              metadata: {},
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
            data: setting as unknown as Setting,
            error: null,
          };
        }
      },
      "custom",
    );
  }

  /**
   * Set multiple settings at once
   */
  async setMultipleSettings(
    settings: Record<string, any>,
    familyId: string,
    authorId: string,
    category?: string,
  ): Promise<ServiceResponse<Setting[]>> {
    return measureAsync(
      "setMultipleSettings",
      async () => {
        const results: Setting[] = [];

        for (const [key, value] of Object.entries(settings)) {
          const result = await this.setSetting(key, value, familyId, authorId, {
            category: (category as any) || "app",
          });

          if (!result.success) {
            return {
              success: false,
              error: `Failed to set setting ${key}: ${result.error}`,
              data: null,
            };
          }

          results.push(result.data!);
        }

        return { success: true, data: results, error: null };
      },
      "custom",
    );
  }

  /**
   * Delete a setting
   */
  async deleteSetting(
    key: string,
    familyId: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "deleteSetting",
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .delete()
          .eq("key", key)
          .eq("family_id", familyId);

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
   * Validate a setting value
   */
  async validateSetting(
    key: string,
    value: any,
    familyId: string,
  ): Promise<ServiceResponse<SettingValidationResult>> {
    return measureAsync(
      "validateSetting",
      async () => {
        const setting = await this.getSettingByKey(key, familyId);

        if (!setting.success || !setting.data) {
          return {
            success: true,
            data: {
              isValid: false,
              errors: ["Setting not found"],
              warnings: [],
            },
            error: null,
          };
        }

        const validation = setting.data.validation;
        const errors: string[] = [];
        const warnings: string[] = [];

        if (validation) {
          // Check required
          if (
            validation.required &&
            (value === null || value === undefined || value === "")
          ) {
            errors.push("Value is required");
          }

          // Check min/max for numbers
          if (
            validation.min !== undefined &&
            typeof value === "number" &&
            value < validation.min
          ) {
            errors.push(`Value must be at least ${validation.min}`);
          }
          if (
            validation.max !== undefined &&
            typeof value === "number" &&
            value > validation.max
          ) {
            errors.push(`Value must be at most ${validation.max}`);
          }

          // Check pattern for strings
          if (
            validation.pattern &&
            typeof value === "string" &&
            !new RegExp(validation.pattern).test(value)
          ) {
            errors.push(`Value does not match required pattern`);
          }

          // Check enum values
          if (validation.enum && !validation.enum.includes(value)) {
            errors.push(`Value must be one of: ${validation.enum.join(", ")}`);
          }
        }

        // Type validation
        const expectedType = setting.data.type;
        const actualType = this.inferType(value);

        if (expectedType !== actualType) {
          warnings.push(`Expected type ${expectedType}, got ${actualType}`);
        }

        const isValid = errors.length === 0;

        return {
          success: true,
          data: { isValid, errors, warnings },
          error: null,
        };
      },
      "custom",
    );
  }

  /**
   * Reset settings to defaults for a family
   */
  async resetToDefaults(
    familyId: string,
    authorId: string,
    category?: string,
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "resetToDefaults",
      async () => {
        // Get default settings
        const defaultSettings = this.getDefaultSettings();

        // Filter by category if specified
        const settingsToReset = category
          ? Object.entries(defaultSettings).filter(
              ([_, setting]) => setting.category === category,
            )
          : Object.entries(defaultSettings);

        // Reset each setting
        for (const [key, defaultSetting] of settingsToReset) {
          await this.setSetting(key, defaultSetting.value, familyId, authorId, {
            type: defaultSetting.type,
            category: defaultSetting.category,
            subcategory: defaultSetting.subcategory,
            description: defaultSetting.description,
            isPublic: defaultSetting.isPublic,
            isRequired: defaultSetting.isRequired,
            validation: defaultSetting.validation,
          });
        }

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Export settings for a family
   */
  async exportSettings(familyId: string): Promise<
    ServiceResponse<{
      familyId: string;
      settings: Record<string, any>;
      metadata: {
        exportedAt: string;
        version: string;
        checksum: string;
      };
    }>
  > {
    return measureAsync(
      "exportSettings",
      async () => {
        const settingsResult = await this.getFamilySettings(familyId);

        if (!settingsResult.success) {
          return { success: false, error: settingsResult.error, data: null };
        }

        const exportData = {
          familyId,
          settings: settingsResult.data.settings,
          metadata: {
            exportedAt: new Date().toISOString(),
            version: "1.0.0",
            checksum: this.generateChecksum(settingsResult.data.settings),
          },
        };

        return { success: true, data: exportData, error: null };
      },
      "custom",
    );
  }

  /**
   * Import settings for a family
   */
  async importSettings(
    familyId: string,
    authorId: string,
    importData: {
      settings: Record<string, any>;
      metadata?: {
        version?: string;
        checksum?: string;
      };
    },
  ): Promise<ServiceResponse<boolean>> {
    return measureAsync(
      "importSettings",
      async () => {
        // Validate checksum if provided
        if (importData.metadata?.checksum) {
          const expectedChecksum = importData.metadata.checksum;
          const actualChecksum = this.generateChecksum(importData.settings);

          if (expectedChecksum !== actualChecksum) {
            return {
              success: false,
              error: "Import data checksum validation failed",
              data: null,
            };
          }
        }

        // Import settings
        const result = await this.setMultipleSettings(
          importData.settings,
          familyId,
          authorId,
        );

        if (!result.success) {
          return { success: false, error: result.error, data: null };
        }

        return { success: true, data: true, error: null };
      },
      "custom",
    );
  }

  /**
   * Search settings by text content and filters
   */
  async searchSettings(
    familyId: string,
    searchParams: SettingSearchParams,
  ): Promise<ServiceResponse<Setting[]>> {
    const {
      query,
      filters,
      sortBy = "recent",
      sortOrder = "desc",
    } = searchParams;
    const cacheKey = `setting_search_${familyId}_${query}_${JSON.stringify(filters)}_${sortBy}_${sortOrder}`;
    const cached = cacheGet<Setting[]>(cacheKey, globalCache);
    if (cached) return { success: true, data: cached, error: null };

    return measureAsync(
      "searchSettings",
      async () => {
        let queryBuilder = supabase
          .from(this.tableName)
          .select(this.selectFields)
          .eq("family_id", familyId)
          .or(`key.ilike.%${query}%,description.ilike.%${query}%`);

        // Apply filters
        if (filters?.type) {
          queryBuilder = queryBuilder.eq("type", filters.type);
        }
        if (filters?.category) {
          queryBuilder = queryBuilder.eq("category", filters.category);
        }
        if (filters?.subcategory) {
          queryBuilder = queryBuilder.eq("subcategory", filters.subcategory);
        }
        if (filters?.isPublic !== undefined) {
          queryBuilder = queryBuilder.eq("is_public", filters.isPublic);
        }
        if (filters?.isRequired !== undefined) {
          queryBuilder = queryBuilder.eq("is_required", filters.isRequired);
        }

        // Apply sorting
        let orderBy = "created_at";
        switch (sortBy) {
          case "key":
            orderBy = "key";
            break;
          case "category":
            orderBy = "category";
            break;
          case "type":
            orderBy = "type";
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

        const settings = (data || []) as unknown as Setting[];
        cacheSet(cacheKey, settings, 2 * 60 * 1000, globalCache); // 2 minutes for search results
        return { success: true, data: settings, error: null };
      },
      "custom",
    );
  }

  /**
   * Infer the type of a value
   */
  private inferType(
    value: any,
  ): "string" | "number" | "boolean" | "json" | "array" | "object" {
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (value === null || value === undefined) return "string";
    if (typeof value === "object") return "object";
    return "string";
  }

  /**
   * Generate checksum for settings
   */
  private generateChecksum(settings: Record<string, any>): string {
    const jsonString = JSON.stringify(settings);
    let hash = 0;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(16);
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): Record<
    string,
    {
      value: any;
      type: "string" | "number" | "boolean" | "json" | "array" | "object";
      category:
        | "app"
        | "user"
        | "family"
        | "security"
        | "privacy"
        | "notifications"
        | "ui"
        | "other";
      subcategory?: string;
      description: string;
      isPublic: boolean;
      isRequired: boolean;
      validation?: any;
    }
  > {
    return {
      "app.theme": {
        value: "light",
        type: "string",
        category: "ui",
        subcategory: "appearance",
        description: "Application theme (light/dark)",
        isPublic: true,
        isRequired: false,
        validation: { enum: ["light", "dark", "auto"] },
      },
      "app.language": {
        value: "en",
        type: "string",
        category: "app",
        subcategory: "localization",
        description: "Application language",
        isPublic: true,
        isRequired: false,
        validation: { enum: ["en", "es", "fr", "de", "ja", "zh"] },
      },
      "notifications.email": {
        value: true,
        type: "boolean",
        category: "notifications",
        subcategory: "email",
        description: "Enable email notifications",
        isPublic: false,
        isRequired: false,
      },
      "notifications.push": {
        value: true,
        type: "boolean",
        category: "notifications",
        subcategory: "push",
        description: "Enable push notifications",
        isPublic: false,
        isRequired: false,
      },
      "privacy.profileVisibility": {
        value: "family",
        type: "string",
        category: "privacy",
        subcategory: "profile",
        description: "Profile visibility level",
        isPublic: false,
        isRequired: false,
        validation: { enum: ["private", "family", "friends", "public"] },
      },
      "security.twoFactorAuth": {
        value: false,
        type: "boolean",
        category: "security",
        subcategory: "authentication",
        description: "Enable two-factor authentication",
        isPublic: false,
        isRequired: false,
      },
    };
  }

  /**
   * Invalidate cache for settings
   */
  async invalidateCache(familyId: string): Promise<void> {
    const patterns = [
      new RegExp(`settings_family_${familyId}`),
      new RegExp(`setting_by_key_`),
      new RegExp(`settings_by_keys_`),
      new RegExp(`family_settings_${familyId}`),
      new RegExp(`setting_search_${familyId}`),
    ];

    patterns.forEach((pattern) => {
      globalCache.invalidatePattern(pattern);
    });
  }
}

// Export service instance
export const settingsService = new SettingsService();

// Legacy export for backward compatibility
export const appSettingsService = settingsService;
