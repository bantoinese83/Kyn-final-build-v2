// Centralized Error Handling Utility
// Provides consistent error handling patterns across the application

import { logger } from "./logger";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  userMessage?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  familyId?: string;
  [key: string]: any;
}

export class ErrorHandler {
  /**
   * Create a standardized error object
   */
  static createError(
    code: string,
    message: string,
    severity: AppError["severity"] = "medium",
    details?: any,
    userMessage?: string,
  ): AppError {
    return {
      code,
      message,
      details,
      userMessage: userMessage || message,
      severity,
    };
  }

  /**
   * Handle Supabase errors consistently
   */
  static handleSupabaseError(error: any, context?: ErrorContext): AppError {
    // Log the error with context
    logger.error("Supabase operation failed", error, context);

    // Handle common Supabase error codes
    switch (error?.code) {
      case "PGRST116":
        return this.createError(
          "NOT_FOUND",
          "The requested resource was not found",
          "low",
          error,
          "Item not found",
        );

      case "23505":
        return this.createError(
          "DUPLICATE_ENTRY",
          "A record with this information already exists",
          "medium",
          error,
          "This item already exists",
        );

      case "23503":
        return this.createError(
          "FOREIGN_KEY_VIOLATION",
          "Cannot delete this item because it is referenced by other records",
          "high",
          error,
          "Cannot delete this item - it is in use",
        );

      case "42501":
        return this.createError(
          "PERMISSION_DENIED",
          "You do not have permission to perform this action",
          "high",
          error,
          "You do not have permission for this action",
        );

      case "42P01":
        return this.createError(
          "TABLE_NOT_FOUND",
          "The requested table does not exist",
          "critical",
          error,
          "System error - please contact support",
        );

      default:
        return this.createError(
          "DATABASE_ERROR",
          error?.message || "An unexpected database error occurred",
          "medium",
          error,
          "An error occurred while processing your request",
        );
    }
  }

  /**
   * Handle network/API errors
   */
  static handleNetworkError(error: any, context?: ErrorContext): AppError {
    logger.error("Network operation failed", error, context);

    if (error?.name === "TypeError" && error?.message.includes("fetch")) {
      return this.createError(
        "NETWORK_ERROR",
        "Failed to connect to the server",
        "high",
        error,
        "Unable to connect to the server. Please check your internet connection.",
      );
    }

    if (error?.status === 401) {
      return this.createError(
        "UNAUTHORIZED",
        "Authentication required",
        "high",
        error,
        "Please log in to continue",
      );
    }

    if (error?.status === 403) {
      return this.createError(
        "FORBIDDEN",
        "Access denied",
        "high",
        error,
        "You do not have permission to access this resource",
      );
    }

    if (error?.status === 404) {
      return this.createError(
        "NOT_FOUND",
        "Resource not found",
        "low",
        error,
        "The requested resource was not found",
      );
    }

    if (error?.status >= 500) {
      return this.createError(
        "SERVER_ERROR",
        "Server error occurred",
        "critical",
        error,
        "A server error occurred. Please try again later.",
      );
    }

    return this.createError(
      "API_ERROR",
      error?.message || "An unexpected error occurred",
      "medium",
      error,
      "An error occurred while processing your request",
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any, context?: ErrorContext): AppError {
    logger.error("Validation failed", error, context);

    if (error?.name === "ZodError") {
      const fieldErrors = error.errors.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`,
      );
      return this.createError(
        "VALIDATION_ERROR",
        "Input validation failed",
        "low",
        { fieldErrors, originalError: error },
        `Please check the following fields: ${fieldErrors.join(", ")}`,
      );
    }

    return this.createError(
      "VALIDATION_ERROR",
      error?.message || "Input validation failed",
      "low",
      error,
      "Please check your input and try again",
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any, context?: ErrorContext): AppError {
    logger.error("Authentication failed", error, context);

    if (error?.message?.includes("Invalid login credentials")) {
      return this.createError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        "medium",
        error,
        "Invalid email or password. Please try again.",
      );
    }

    if (error?.message?.includes("Email not confirmed")) {
      return this.createError(
        "EMAIL_NOT_CONFIRMED",
        "Email address not verified",
        "medium",
        error,
        "Please check your email and click the verification link.",
      );
    }

    if (error?.message?.includes("User already registered")) {
      return this.createError(
        "USER_EXISTS",
        "User already registered with this email",
        "medium",
        error,
        "An account with this email already exists. Please sign in instead.",
      );
    }

    return this.createError(
      "AUTH_ERROR",
      error?.message || "Authentication failed",
      "high",
      error,
      "Authentication failed. Please try again.",
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: AppError): string {
    return error.userMessage || "An unexpected error occurred";
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: AppError): boolean {
    return error.severity !== "critical";
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: AppError, context?: ErrorContext): void {
    const logData = {
      ...context,
      errorCode: error.code,
      severity: error.severity,
      details: error.details,
    };

    switch (error.severity) {
      case "critical":
        logger.error(error.message, undefined, logData);
        break;
      case "high":
        logger.error(error.message, undefined, logData);
        break;
      case "medium":
        logger.warn(error.message, logData);
        break;
      case "low":
        logger.info(error.message, logData);
        break;
    }
  }
}

// Convenience functions for common error patterns
export const handleSupabaseError = (error: any, context?: ErrorContext) =>
  ErrorHandler.handleSupabaseError(error, context);

export const handleNetworkError = (error: any, context?: ErrorContext) =>
  ErrorHandler.handleNetworkError(error, context);

export const handleValidationError = (error: any, context?: ErrorContext) =>
  ErrorHandler.handleValidationError(error, context);

export const handleAuthError = (error: any, context?: ErrorContext) =>
  ErrorHandler.handleAuthError(error, context);

export const createAppError = (
  code: string,
  message: string,
  severity?: AppError["severity"],
  details?: any,
  userMessage?: string,
) => ErrorHandler.createError(code, message, severity, details, userMessage);
