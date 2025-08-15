// Centralized logging and error handling utility
// Replaces scattered console.error and console.log statements

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  familyId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = this.isDevelopment
    ? LogLevel.DEBUG
    : LogLevel.WARN;

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context
      ? ` [${Object.entries(context)
          .map(([k, v]) => `${k}:${v}`)
          .join(", ")}]`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorDetails = error
        ? `\nError: ${error.message}\nStack: ${error.stack}`
        : "";
      console.error(
        this.formatMessage(LogLevel.ERROR, message + errorDetails, context),
      );
    }
  }

  // Service-specific logging methods
  serviceError(
    serviceName: string,
    action: string,
    error: Error,
    context?: LogContext,
  ): void {
    this.error(`Service error in ${serviceName}: ${action}`, error, {
      ...context,
      service: serviceName,
      action,
    });
  }

  apiError(endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API error calling ${endpoint}`, error, {
      ...context,
      endpoint,
    });
  }

  authError(action: string, error: Error, context?: LogContext): void {
    this.error(`Authentication error: ${action}`, error, {
      ...context,
      action,
    });
  }

  // Performance logging
  performance(action: string, duration: number, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.info(`Performance: ${action} took ${duration}ms`, {
        ...context,
        action,
        duration,
      });
    }
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common logging patterns
export const logServiceError = (
  serviceName: string,
  action: string,
  error: Error,
  context?: LogContext,
) => {
  logger.serviceError(serviceName, action, error, context);
};

export const logApiError = (
  endpoint: string,
  error: Error,
  context?: LogContext,
) => {
  logger.apiError(endpoint, error, context);
};

export const logAuthError = (
  action: string,
  error: Error,
  context?: LogContext,
) => {
  logger.authError(action, error, context);
};

export const logPerformance = (
  action: string,
  duration: number,
  context?: LogContext,
) => {
  logger.performance(action, duration, context);
};
