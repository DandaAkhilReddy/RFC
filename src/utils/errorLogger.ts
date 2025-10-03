/**
 * Centralized Error Logging System
 * Automatically logs errors and sends notifications
 */

interface ErrorLog {
  timestamp: Date;
  errorType: string;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 50;

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        errorType: 'UnhandledPromiseRejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.logError({
        errorType: 'GlobalError',
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
      });
    });
  }

  logError(error: {
    errorType: string;
    message: string;
    stack?: string;
    userId?: string;
  }) {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      errorType: error.errorType,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: error.userId,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error Logged:', errorLog);
    }

    // Add to queue
    this.errorQueue.push(errorLog);

    // Trim queue if too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Send to backend/monitoring service (implement when ready)
    this.sendToMonitoring(errorLog);
  }

  private sendToMonitoring(errorLog: ErrorLog) {
    // TODO: Send to Firebase, Sentry, or your backend
    // For now, just store in localStorage for debugging
    try {
      const existingLogs = localStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);

      // Keep only last 100 errors
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.errorQueue.slice(-count);
  }

  clearErrors() {
    this.errorQueue = [];
    localStorage.removeItem('error_logs');
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Helper function to wrap async functions with error logging
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorType: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      errorLogger.logError({
        errorType,
        message: error.message || 'Unknown error',
        stack: error.stack,
      });
      throw error; // Re-throw to let caller handle it
    }
  }) as T;
}

// Helper function to wrap sync functions with error logging
export function withErrorLoggingSync<T extends (...args: any[]) => any>(
  fn: T,
  errorType: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error: any) {
      errorLogger.logError({
        errorType,
        message: error.message || 'Unknown error',
        stack: error.stack,
      });
      throw error; // Re-throw to let caller handle it
    }
  }) as T;
}
