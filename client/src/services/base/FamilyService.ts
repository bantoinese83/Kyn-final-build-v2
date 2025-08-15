// Family Service - Base class for family-related entities
// Extends BaseService with family-specific operations

import {
  BaseService,
  BaseEntity,
  BaseFilters,
  PaginationResult,
} from "./BaseService";
import { supabase } from "../supabase";
import { ServiceResponse } from "@/types/shared";
import { logger } from "@/lib/logger";

// Helper functions for creating responses
const createSuccessResponse = <T>(data: T): ServiceResponse<T> => ({
  success: true,
  data,
  error: null,
});

const createErrorResponse = (error: string): ServiceResponse<never> => ({
  success: false,
  data: null,
  error,
});

export interface FamilyEntity {
  id: string;
  familyId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyFilters extends BaseFilters {
  familyId?: string;
  authorId?: string;
  isPublic?: boolean;
  tags?: string[];
  dateRange?: string;
}

export abstract class FamilyService<
  T extends FamilyEntity,
  CreateData,
  UpdateData,
> extends BaseService<T, CreateData, UpdateData> {
  /**
   * Get entities by family ID with pagination
   */
  async getByFamilyId(
    familyId: string,
    filters?: Omit<FamilyFilters, "familyId">,
  ): Promise<ServiceResponse<PaginationResult<T>>> {
    try {
      const {
        page = 1,
        pageSize = 20,
        orderBy = "createdAt",
        orderDirection = "desc",
        authorId,
        isPublic,
        tags,
        dateRange,
      } = filters || {};

      const offset = (page - 1) * pageSize;

      let query = supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq("family_id", familyId);

      // Apply additional filters
      if (authorId) {
        query = query.eq("author_id", authorId);
      }

      if (isPublic !== undefined) {
        query = query.eq("is_public", isPublic);
      }

      if (tags && tags.length > 0) {
        query = query.overlaps("tags", tags);
      }

      if (dateRange) {
        const { start, end } = this.parseDateRange(dateRange);
        if (start) {
          query = query.gte("created_at", start);
        }
        if (end) {
          query = query.lte("created_at", end);
        }
      }

      // Get total count
      const { data: countData, error: countError } = await query.count();

      if (countError) {
        logger.error(
          `Failed to get count for ${this.tableName} by family`,
          countError,
          {
            service: this.constructor.name,
            action: "getByFamilyId",
            familyId,
            filters,
          },
        );
        return createErrorResponse<PaginationResult<T>>(countError.message);
      }

      // Get paginated data
      const { data, error } = await query
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + pageSize - 1);

      if (error) {
        logger.error(`Failed to get ${this.tableName} by family`, error, {
          service: this.constructor.name,
          action: "getByFamilyId",
          familyId,
          filters,
        });
        return createErrorResponse<PaginationResult<T>>(error.message);
      }

      const total = Array.isArray(countData)
        ? countData.length
        : (countData as any)?.count || 0;
      const totalPages = Math.ceil(total / pageSize);

      const result: PaginationResult<T> = {
        data: (data as unknown as T[]) || [],
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      return createSuccessResponse(result);
    } catch (error) {
      logger.error(
        `Unexpected error getting ${this.tableName} by family`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getByFamilyId",
          familyId,
          filters,
        },
      );
      return createErrorResponse<PaginationResult<T>>(
        "An unexpected error occurred",
      );
    }
  }

  /**
   * Get entities by author ID within a family
   */
  async getByAuthorInFamily(
    familyId: string,
    authorId: string,
    filters?: Omit<BaseFilters, "page" | "pageSize">,
  ): Promise<ServiceResponse<T[]>> {
    try {
      const { orderBy = "createdAt", orderDirection = "desc" } = filters || {};

      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq("family_id", familyId)
        .eq("author_id", authorId)
        .order(orderBy, { ascending: orderDirection === "asc" });

      if (error) {
        logger.error(
          `Failed to get ${this.tableName} by author in family`,
          error,
          {
            service: this.constructor.name,
            action: "getByAuthorInFamily",
            familyId,
            authorId,
          },
        );
        return createErrorResponse(error.message);
      }

      return createSuccessResponse((data as unknown as T[]) || []);
    } catch (error) {
      logger.error(
        `Unexpected error getting ${this.tableName} by author in family`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getByAuthorInFamily",
          familyId,
          authorId,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Get public entities by family ID
   */
  async getPublicByFamilyId(
    familyId: string,
    filters?: Omit<BaseFilters, "page" | "pageSize">,
  ): Promise<ServiceResponse<T[]>> {
    try {
      const { orderBy = "createdAt", orderDirection = "desc" } = filters || {};

      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq("family_id", familyId)
        .eq("is_public", true)
        .order(orderBy, { ascending: orderDirection === "asc" });

      if (error) {
        logger.error(
          `Failed to get public ${this.tableName} by family`,
          error,
          {
            service: this.constructor.name,
            action: "getPublicByFamilyId",
            familyId,
          },
        );
        return createErrorResponse(error.message);
      }

      return createSuccessResponse((data as unknown as T[]) || []);
    } catch (error) {
      logger.error(
        `Unexpected error getting public ${this.tableName} by family`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getPublicByFamilyId",
          familyId,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Check if user has permission to modify entity
   */
  async hasPermission(
    entityId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("author_id, family_id")
        .eq("id", entityId)
        .single();

      if (error) {
        logger.error(
          `Failed to check permissions for ${this.tableName}`,
          error,
          {
            service: this.constructor.name,
            action: "hasPermission",
            entityId,
            userId,
          },
        );
        return createErrorResponse(error.message);
      }

      // User can modify if they are the author
      const canModify = data.author_id === userId;

      return createSuccessResponse(canModify);
    } catch (error) {
      logger.error(
        `Unexpected error checking permissions for ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "hasPermission",
          entityId,
          userId,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Get entity count by family
   */
  async getCountByFamily(familyId: string): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("family_id", familyId);

      if (error) {
        logger.error(
          `Failed to get count for ${this.tableName} by family`,
          error,
          {
            service: this.constructor.name,
            action: "getCountByFamily",
            familyId,
          },
        );
        return createErrorResponse(error.message);
      }

      return createSuccessResponse(count || 0);
    } catch (error) {
      logger.error(
        `Unexpected error getting count for ${this.tableName} by family`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getCountByFamily",
          familyId,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Parse date range string into start and end dates
   */
  private parseDateRange(dateRange: string): { start?: string; end?: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case "today":
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
      case "week":
        const weekStart = new Date(
          today.getTime() - today.getDay() * 24 * 60 * 60 * 1000,
        );
        return {
          start: weekStart.toISOString(),
          end: new Date(
            weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: monthStart.toISOString(),
          end: new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
          ).toISOString(),
        };
      case "year":
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          start: yearStart.toISOString(),
          end: new Date(today.getFullYear(), 11, 31).toISOString(),
        };
      default:
        return {};
    }
  }
}
