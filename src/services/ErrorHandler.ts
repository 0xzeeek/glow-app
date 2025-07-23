import * as Sentry from '@sentry/react-native';
import { Alert, Platform } from 'react-native';
import { uiStore } from '../stores/uiStore';

interface ErrorConfig {
  sentryDsn?: string;
  enableInDev?: boolean;
  environment?: string;
}

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  WALLET = 'wallet',
  TRADING = 'trading',
  WEBSOCKET = 'websocket',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

interface ErrorReport {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  error?: Error;
  context?: ErrorContext;
  timestamp: number;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ErrorHandler {
  private config: ErrorConfig;
  private errorQueue: ErrorReport[] = [];
  private isInitialized = false;

  constructor(config: ErrorConfig) {
    this.config = config;
  }

  // Initialize Sentry
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.config.sentryDsn) {
        await Sentry.init({
          dsn: this.config.sentryDsn,
          debug: __DEV__ && this.config.enableInDev,
          environment: this.config.environment || (__DEV__ ? 'development' : 'production'),
          tracesSampleRate: __DEV__ ? 1.0 : 0.1,
          attachScreenshot: true,
          attachViewHierarchy: true,
        });
      }

      this.isInitialized = true;

      // Process queued errors
      this.processErrorQueue();
    } catch (error) {
      console.error('Failed to initialize ErrorHandler:', error);
    }
  }

  // Main error handling method
  public handleError(
    error: Error | unknown,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const errorReport = this.createErrorReport(error, category, severity, context);

    // Queue error if not initialized
    if (!this.isInitialized) {
      this.errorQueue.push(errorReport);
      return;
    }

    this.processError(errorReport);
  }

  // Process individual error
  private processError(report: ErrorReport): void {
    // Log to console in development
    if (__DEV__) {
      console.error(`[${report.category}] ${report.message}`, report.error);
    }

    // Send to Sentry
    this.sendToSentry(report);

    // Show user-friendly error based on severity
    this.showUserError(report);

    // Update UI store with error state if needed
    if (report.severity === ErrorSeverity.CRITICAL) {
      uiStore.getState().showError({
        title: 'Critical Error',
        message: this.getUserMessage(report),
        severity: 'critical',
      });
    }
  }

  // Create error report
  private createErrorReport(
    error: Error | unknown,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: ErrorContext
  ): ErrorReport {
    let message = 'An unexpected error occurred';
    let actualError: Error | undefined;

    if (error instanceof Error) {
      message = error.message;
      actualError = error;
    } else if (typeof error === 'string') {
      message = error;
      actualError = new Error(error);
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
      actualError = new Error(message);
    }

    return {
      message,
      category,
      severity,
      error: actualError,
      context,
      timestamp: Date.now(),
    };
  }

  // Send error to Sentry
  private sendToSentry(report: ErrorReport): void {
    if (!this.config.sentryDsn) return;

    const sentryLevel = this.getSentryLevel(report.severity);

    if (report.error) {
      Sentry.captureException(report.error, {
        level: sentryLevel,
        tags: {
          category: report.category,
          platform: Platform.OS,
        },
        contexts: {
          error_context: report.context || {},
        },
      });
    } else {
      Sentry.captureMessage(report.message, sentryLevel);
    }
  }

  // Show user-friendly error
  private showUserError(report: ErrorReport): void {
    const userMessage = this.getUserMessage(report);
    const shouldShowAlert = this.shouldShowAlert(report);

    if (shouldShowAlert) {
      Alert.alert(
        this.getAlertTitle(report),
        userMessage,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ],
        { cancelable: true }
      );
    } else {
      // Show toast for less severe errors
      uiStore.getState().showToast({
        message: userMessage,
        type: 'error',
        duration: 3000,
      });
    }
  }

  // Get user-friendly message
  private getUserMessage(report: ErrorReport): string {
    // Handle specific error types
    if (report.error instanceof ApiError) {
      return this.getApiErrorMessage(report.error);
    }

    // Handle by category
    switch (report.category) {
      case ErrorCategory.NETWORK:
        return 'Network connection issue. Please check your internet connection.';
      case ErrorCategory.AUTH:
        return 'Authentication failed. Please try logging in again.';
      case ErrorCategory.WALLET:
        return 'Wallet operation failed. Please try again.';
      case ErrorCategory.TRADING:
        return 'Trading operation failed. Please try again later.';
      case ErrorCategory.WEBSOCKET:
        return 'Real-time connection lost. Reconnecting...';
      case ErrorCategory.VALIDATION:
        return report.message || 'Invalid input. Please check and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Get API error message
  private getApiErrorMessage(error: ApiError): string {
    if (error.status === 0) {
      return 'No internet connection. Please check your network.';
    } else if (error.status === 401) {
      return 'Session expired. Please login again.';
    } else if (error.status === 403) {
      return 'Access denied. You don\'t have permission for this action.';
    } else if (error.status === 404) {
      return 'Resource not found.';
    } else if (error.status === 429) {
      return 'Too many requests. Please slow down.';
    } else if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || 'Request failed. Please try again.';
  }

  // Determine if alert should be shown
  private shouldShowAlert(report: ErrorReport): boolean {
    return report.severity === ErrorSeverity.HIGH || 
           report.severity === ErrorSeverity.CRITICAL;
  }

  // Get alert title
  private getAlertTitle(report: ErrorReport): string {
    switch (report.severity) {
      case ErrorSeverity.CRITICAL:
        return 'Critical Error';
      case ErrorSeverity.HIGH:
        return 'Error';
      default:
        return 'Notice';
    }
  }

  // Map severity to Sentry level
  private getSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  // Process queued errors
  private processErrorQueue(): void {
    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift();
      if (report) {
        this.processError(report);
      }
    }
  }

  // Set user context for error tracking
  public setUserContext(userId: string, wallet?: string): void {
    if (this.config.sentryDsn) {
      Sentry.setUser({
        id: userId,
        wallet,
      });
    }
  }

  // Clear user context
  public clearUserContext(): void {
    if (this.config.sentryDsn) {
      Sentry.setUser(null);
    }
  }

  // Add breadcrumb for tracking
  public addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, any>
  ): void {
    if (this.config.sentryDsn) {
      Sentry.addBreadcrumb({
        message,
        category,
        level: 'info',
        data,
        timestamp: Date.now() / 1000,
      });
    }
  }

  // Capture custom event
  public captureEvent(
    eventName: string,
    data: Record<string, any>
  ): void {
    if (this.config.sentryDsn) {
      Sentry.captureEvent({
        message: eventName,
        level: 'info',
        extra: data,
      });
    }
  }
}

// Singleton instance
let errorHandler: ErrorHandler | null = null;

export const initializeErrorHandler = (config: ErrorConfig): ErrorHandler => {
  errorHandler = new ErrorHandler(config);
  return errorHandler;
};

export const getErrorHandler = (): ErrorHandler => {
  if (!errorHandler) {
    // Create basic error handler if not initialized
    errorHandler = new ErrorHandler({});
  }
  return errorHandler;
}; 