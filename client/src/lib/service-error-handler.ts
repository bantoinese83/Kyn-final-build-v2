// Service Error Handler - Enhanced error handling for service operations
// Provides consistent error handling patterns across all services

import { ErrorHandler, AppError, ErrorContext } from "./error-handler";
import { logger } from "./logger";

export interface ServiceErrorContext extends ErrorContext {
  serviceName: string;
  operation: string;
  entityId?: string;
  familyId?: string;
  userId?: string;
}

export class ServiceErrorHandler extends ErrorHandler {
  /**
   * Handle service operation with consistent error handling
   */
  static async handleServiceOperation<T>(
    operation: () => Promise<T>,
    context: ServiceErrorContext,
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const startTime = performance.now();
      const result = await operation();
      const duration = performance.now() - startTime;

      logger.performance(`Service operation completed`, duration, context);
      return { success: true, data: result };
    } catch (error) {
      const appError = this.handleServiceError(error, context);
      return { success: false, error: appError.userMessage };
    }
  }

  /**
   * Handle service-specific errors
   */
  static handleServiceError(
    error: any,
    context: ServiceErrorContext,
  ): AppError {
    // Log the error with service context
    logger.serviceError(
      context.serviceName,
      context.operation,
      error as Error,
      context,
    );

    // Handle common service error patterns
    if (error?.code) {
      return this.handleServiceErrorCode(error.code, error.message, context);
    }

    // Handle network/connection errors
    if (error?.name === "TypeError" && error?.message.includes("fetch")) {
      return this.createError(
        "SERVICE_CONNECTION_ERROR",
        "Unable to connect to the service",
        "high",
        error,
        "Service temporarily unavailable. Please try again later.",
      );
    }

    // Handle timeout errors
    if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
      return this.createError(
        "SERVICE_TIMEOUT",
        "Service operation timed out",
        "medium",
        error,
        "Operation timed out. Please try again.",
      );
    }

    // Handle validation errors
    if (error?.name === "ValidationError" || error?.details) {
      return this.createError(
        "SERVICE_VALIDATION_ERROR",
        "Invalid data provided to service",
        "low",
        error,
        "Please check your input and try again.",
      );
    }

    // Default service error
    return this.createError(
      "SERVICE_ERROR",
      error?.message || "Service operation failed",
      "medium",
      error,
      "An error occurred while processing your request. Please try again.",
    );
  }

  /**
   * Handle specific service error codes
   */
  private static handleServiceErrorCode(
    code: string,
    message: string,
    context: ServiceErrorContext,
  ): AppError {
    switch (code) {
      case "PGRST116":
        return this.createError(
          "ENTITY_NOT_FOUND",
          "The requested entity was not found",
          "low",
          { code, message },
          "The requested item could not be found.",
        );

      case "23505":
        return this.createError(
          "DUPLICATE_ENTITY",
          "A record with this information already exists",
          "medium",
          { code, message },
          "This item already exists. Please use a different value.",
        );

      case "23503":
        return this.createError(
          "REFERENCED_ENTITY",
          "Cannot delete this entity because it is referenced by other records",
          "high",
          { code, message },
          "Cannot delete this item - it is currently in use by other parts of the system.",
        );

      case "42501":
        return this.createError(
          "INSUFFICIENT_PERMISSIONS",
          "User does not have permission to perform this action",
          "high",
          { code, message },
          "You do not have permission to perform this action.",
        );

      case "42P01":
        return this.createError(
          "SERVICE_UNAVAILABLE",
          "The requested service table does not exist",
          "critical",
          { code, message },
          "Service temporarily unavailable. Please contact support.",
        );

      case "23514":
        return this.createError(
          "INVALID_DATA",
          "Data validation failed",
          "low",
          { code, message },
          "The provided data is invalid. Please check your input.",
        );

      case "23502":
        return this.createError(
          "MISSING_REQUIRED_FIELD",
          "Required field is missing",
          "low",
          { code, message },
          "Please fill in all required fields.",
        );

      default:
        return this.createError(
          "SERVICE_DATABASE_ERROR",
          `Database error: ${message}`,
          "medium",
          { code, message },
          "A database error occurred. Please try again.",
        );
    }
  }

  /**
   * Create a standardized service response
   */
  static createServiceResponse<T>(
    success: boolean,
    data: T | null,
    error: string | null,
  ): { success: boolean; data: T | null; error: string | null } {
    return { success, data, error };
  }

  /**
   * Create a success service response
   */
  static createSuccessResponse<T>(data: T): {
    success: true;
    data: T;
    error: null;
  } {
    return { success: true, data, error: null };
  }

  /**
   * Create an error service response
   */
  static createErrorResponse<T>(error: string): {
    success: false;
    data: null;
    error: string;
  } {
    return { success: false, data: null, error };
  }

  /**
   * Handle optimistic operation with rollback
   */
  static async handleOptimisticOperation<T>(
    optimisticUpdate: () => Promise<T>,
    rollback: () => Promise<void>,
    context: ServiceErrorContext,
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const result = await optimisticUpdate();
      return { success: true, data: result };
    } catch (error) {
      // Attempt rollback
      try {
        await rollback();
        logger.info(`Rollback successful for ${context.operation}`, context);
      } catch (rollbackError) {
        logger.error(
          `Rollback failed for ${context.operation}`,
          rollbackError as Error,
          context,
        );
      }

      const appError = this.handleServiceError(error, context);
      return { success: false, error: appError.userMessage };
    }
  }

  /**
   * Handle batch operations with partial success
   */
  static async handleBatchOperation<T>(
    operations: (() => Promise<T>)[],
    context: ServiceErrorContext,
  ): Promise<{
    success: boolean;
    data: T[];
    errors: string[];
    successfulCount: number;
    failedCount: number;
  }> {
    const results: T[] = [];
    const errors: string[] = [];
    let successfulCount = 0;
    let failedCount = 0;

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await operations[i]();
        results.push(result);
        successfulCount++;
      } catch (error) {
        const appError = this.handleServiceError(error, {
          ...context,
          operation: `${context.operation}[${i}]`,
        });
        errors.push(appError.userMessage);
        failedCount++;
      }
    }

    const success = failedCount === 0;

    if (!success) {
      logger.warn(`Batch operation completed with ${failedCount} failures`, {
        ...context,
        successfulCount,
        failedCount,
        errors,
      });
    }

    return {
      success,
      data: results,
      errors,
      successfulCount,
      failedCount,
    };
  }
}

// Convenience functions for common service patterns
export const handleServiceOperation = <T>(
  operation: () => Promise<T>,
  context: ServiceErrorContext,
) => ServiceErrorHandler.handleServiceOperation(operation, context);

export const handleOptimisticOperation = <T>(
  optimisticUpdate: () => Promise<T>,
  rollback: () => Promise<void>,
  context: ServiceErrorContext,
) =>
  ServiceErrorHandler.handleOptimisticOperation(
    optimisticUpdate,
    rollback,
    context,
  );

export const handleBatchOperation = <T>(
  operations: (() => Promise<T>)[],
  context: ServiceErrorContext,
) => ServiceErrorHandler.handleBatchOperation(operations, context);

export const createServiceResponse = <T>(
  success: boolean,
  data: T | null,
  error: string | null,
) => ServiceErrorHandler.createServiceResponse(success, data, error);

export const createSuccessResponse = <T>(data: T) =>
  ServiceErrorHandler.createSuccessResponse(data);

export const createErrorResponse = <T>(error: string) =>
  ServiceErrorHandler.createErrorResponse(error);
