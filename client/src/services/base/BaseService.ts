// Base Service - Abstract class providing common CRUD operations
// Eliminates duplicate service code and provides consistent patterns

import { supabase } from "../supabase";
import {
  ServiceResponse,
  SuccessResponse,
  ErrorResponse,
} from "@/types/shared";
import { logger } from "@/lib/logger";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseFilters {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Helper functions for creating responses
const createSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
  error: null,
});

const createErrorResponse = (error: string): ErrorResponse => ({
  success: false,
  data: null,
  error,
});

export abstract class BaseService<
  T extends BaseEntity,
  CreateData,
  UpdateData,
> {
  protected abstract tableName: string;
  protected abstract selectFields: string;

  /**
   * Create a new entity
   */
  async create(data: CreateData): Promise<ServiceResponse<T>> {
    try {
      const startTime = performance.now();

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select(this.selectFields)
        .single();

      if (error) {
        logger.error(`Failed to create ${this.tableName}`, error, {
          service: this.constructor.name,
          action: "create",
          data,
        });
        return createErrorResponse(error.message);
      }

      logger.performance(
        `Created ${this.tableName}`,
        performance.now() - startTime,
        {
          service: this.constructor.name,
          action: "create",
        },
      );

      return createSuccessResponse(result as unknown as T);
    } catch (error) {
      logger.error(
        `Unexpected error creating ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "create",
          data,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createErrorResponse("Entity not found");
        }
        logger.error(`Failed to get ${this.tableName} by ID`, error, {
          service: this.constructor.name,
          action: "getById",
          id,
        });
        return createErrorResponse(error.message);
      }

      return createSuccessResponse(data as unknown as T);
    } catch (error) {
      logger.error(
        `Unexpected error getting ${this.tableName} by ID`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getById",
          id,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: UpdateData): Promise<ServiceResponse<T>> {
    try {
      const startTime = performance.now();

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ ...data, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select(this.selectFields)
        .single();

      if (error) {
        logger.error(`Failed to update ${this.tableName}`, error, {
          service: this.constructor.name,
          action: "update",
          id,
          data,
        });
        return createErrorResponse(error.message);
      }

      logger.performance(
        `Updated ${this.tableName}`,
        performance.now() - startTime,
        {
          service: this.constructor.name,
          action: "update",
        },
      );

      return createSuccessResponse(result as unknown as T);
    } catch (error) {
      logger.error(
        `Unexpected error updating ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "update",
          id,
          data,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const startTime = performance.now();

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        logger.error(`Failed to delete ${this.tableName}`, error, {
          service: this.constructor.name,
          action: "delete",
          id,
        });
        return createErrorResponse(error.message);
      }

      logger.performance(
        `Deleted ${this.tableName}`,
        performance.now() - startTime,
        {
          service: this.constructor.name,
          action: "delete",
        },
      );

      return createSuccessResponse(true);
    } catch (error) {
      logger.error(
        `Unexpected error deleting ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "delete",
          id,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Get list of entities with pagination and filtering
   */
  async getList(
    filters?: BaseFilters,
  ): Promise<ServiceResponse<PaginationResult<T>>> {
    try {
      const {
        page = 1,
        pageSize = 20,
        orderBy = "createdAt",
        orderDirection = "desc",
      } = filters || {};

      const offset = (page - 1) * pageSize;

      // Get total count
      const { count, error: countError } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      if (countError) {
        logger.error(`Failed to get count for ${this.tableName}`, countError, {
          service: this.constructor.name,
          action: "getList",
          filters,
        });
        return createErrorResponse(countError.message);
      }

      // Get paginated data
      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + pageSize - 1);

      if (error) {
        logger.error(`Failed to get list of ${this.tableName}`, error, {
          service: this.constructor.name,
          action: "getList",
          filters,
        });
        return createErrorResponse(error.message);
      }

      const total = count || 0;
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
        `Unexpected error getting list of ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getList",
          filters,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("id")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error(`Failed to check existence of ${this.tableName}`, error, {
          service: this.constructor.name,
          action: "exists",
          id,
        });
        return createErrorResponse(error.message);
      }

      return createSuccessResponse(!!data);
    } catch (error) {
      logger.error(
        `Unexpected error checking existence of ${this.tableName}`,
        error as Error,
        {
          service: this.constructor.name,
          action: "exists",
          id,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }

  /**
   * Get multiple entities by IDs
   */
  async getByIds(ids: string[]): Promise<ServiceResponse<T[]>> {
    try {
      if (ids.length === 0) {
        return createSuccessResponse([]);
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .in("id", ids);

      if (error) {
        logger.error(`Failed to get ${this.tableName} by IDs`, error, {
          service: this.constructor.name,
          action: "getByIds",
          ids,
        });
        return createErrorResponse(error.message);
      }

      return createSuccessResponse((data as unknown as T[]) || []);
    } catch (error) {
      logger.error(
        `Unexpected error getting ${this.tableName} by IDs`,
        error as Error,
        {
          service: this.constructor.name,
          action: "getByIds",
          ids,
        },
      );
      return createErrorResponse("An unexpected error occurred");
    }
  }
}
