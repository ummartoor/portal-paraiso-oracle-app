import { Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import i18n from '../i18n';

// NetInfo is optional - check if available
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  // NetInfo not installed - will use fallback method
  if (__DEV__) {
    console.log('NetInfo not available, using fallback network detection');
  }
}

/**
 * Error Types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  PAYMENT = 'PAYMENT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: unknown;
  code?: string;
  statusCode?: number;
  retryable?: boolean;
  context?: Record<string, any>;
}

/**
 * Error Logger - Centralized error logging
 */
interface LoggedError extends AppError {
  timestamp: number;
}

class ErrorLogger {
  private errorQueue: LoggedError[] = [];
  private maxQueueSize = 50;

  log(error: AppError) {
    // Add to queue with timestamp
    const errorWithTimestamp: LoggedError = {
      ...error,
      timestamp: Date.now(),
    };
    this.errorQueue.push(errorWithTimestamp);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (__DEV__) {
      console.error('[ErrorLogger]', {
        type: error.type,
        severity: error.severity,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        originalError: error.originalError,
      });
    }

    // In production, send to error tracking service (Sentry, etc.)
    // Example: Sentry.captureException(error.originalError, { extra: error.context });
  }

  getErrors(): LoggedError[] {
    return [...this.errorQueue];
  }

  clearErrors() {
    this.errorQueue = [];
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Network Status Checker
 * Uses NetInfo if available, otherwise falls back to API-based detection
 */
class NetworkChecker {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  public hasNetInfo: boolean = false;

  constructor() {
    this.hasNetInfo = NetInfo !== null;
    if (this.hasNetInfo) {
      this.init();
    }
  }

  private async init() {
    if (!this.hasNetInfo) return;

    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;

      NetInfo.addEventListener((state: any) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? false;

        // Notify listeners of change
        if (wasOnline !== this.isOnline) {
          this.listeners.forEach(listener => listener(this.isOnline));
        }
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to initialize NetInfo:', error);
      }
      this.hasNetInfo = false;
    }
  }

  async checkConnection(): Promise<boolean> {
    if (this.hasNetInfo && NetInfo) {
      try {
        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected ?? false;
        return this.isOnline;
      } catch (error) {
        // Fallback to true if NetInfo fails
        return true;
      }
    }

    // Fallback: assume online (will be detected by API errors)
    return true;
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const networkChecker = new NetworkChecker();

/**
 * Parse error and create AppError
 */
export function parseError(
  error: unknown,
  context?: Record<string, any>,
): AppError {
  // Network errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const responseData = axiosError.response?.data as any;

    // Network connectivity issues
    if (!axiosError.response && axiosError.request) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: i18n.t('errors.network_connection'),
        originalError: error,
        code: 'NETWORK_ERROR',
        retryable: true,
        context,
      };
    }

    // HTTP status code errors
    switch (statusCode) {
      case 401:
      case 403:
        return {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: i18n.t('errors.session_expired'),
          originalError: error,
          code: 'AUTH_ERROR',
          statusCode,
          retryable: false,
          context,
        };

      case 404:
        return {
          type: ErrorType.API,
          severity: ErrorSeverity.LOW,
          message: i18n.t('errors.resource_not_found'),
          originalError: error,
          code: 'NOT_FOUND',
          statusCode,
          retryable: false,
          context,
        };

      case 422:
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message:
            responseData?.message ||
            responseData?.error ||
            i18n.t('errors.validation_error'),
          originalError: error,
          code: 'VALIDATION_ERROR',
          statusCode,
          retryable: false,
          context,
        };

      case 429:
        return {
          type: ErrorType.API,
          severity: ErrorSeverity.MEDIUM,
          message: i18n.t('errors.rate_limit'),
          originalError: error,
          code: 'RATE_LIMIT',
          statusCode,
          retryable: true,
          context,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.API,
          severity: ErrorSeverity.HIGH,
          message: i18n.t('errors.server_error'),
          originalError: error,
          code: 'SERVER_ERROR',
          statusCode,
          retryable: true,
          context,
        };

      default:
        return {
          type: ErrorType.API,
          severity: ErrorSeverity.MEDIUM,
          message:
            responseData?.message ||
            responseData?.error ||
            axiosError.message ||
            i18n.t('errors.generic_error'),
          originalError: error,
          code: 'API_ERROR',
          statusCode,
          retryable: statusCode ? statusCode >= 500 : false,
          context,
        };
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || i18n.t('errors.unexpected_error'),
      originalError: error,
      code: error.name,
      retryable: false,
      context,
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: i18n.t('errors.unexpected_error'),
    originalError: error,
    retryable: false,
    context,
  };
}

/**
 * Handle error with user-friendly display
 */
export async function handleError(
  error: unknown,
  options: {
    context?: Record<string, any>;
    showToast?: boolean;
    showAlert?: boolean;
    onRetry?: () => Promise<void>;
    silent?: boolean;
    skipNetworkCheck?: boolean;
  } = {},
): Promise<void> {
  const {
    context,
    showToast = true,
    showAlert = false,
    onRetry,
    silent = false,
    skipNetworkCheck = false,
  } = options;

  // Check network first (if NetInfo is available)
  if (!skipNetworkCheck && networkChecker.hasNetInfo) {
    const isOnline = await networkChecker.checkConnection();
    if (!isOnline) {
      const networkError: AppError = {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: i18n.t('errors.network_connection'),
        code: 'OFFLINE',
        retryable: true,
        context,
      };

      errorLogger.log(networkError);

      if (!silent) {
        if (showToast) {
          Toast.show({
            type: 'error',
            text1: i18n.t('errors.network_title'),
            text2: networkError.message,
            position: 'bottom',
          });
        }
      }

      return;
    }
  }

  // Parse error
  const appError = parseError(error, context);
  errorLogger.log(appError);

  if (silent) {
    return;
  }

  // Show toast notification
  if (showToast) {
    Toast.show({
      type: 'error',
      text1: getErrorTitle(appError),
      text2: appError.message,
      position: 'bottom',
      visibilityTime:
        appError.severity === ErrorSeverity.CRITICAL ? 5000 : 3000,
    });
  }

  // Show alert for critical errors or when explicitly requested
  if (showAlert || appError.severity === ErrorSeverity.CRITICAL) {
    Alert.alert(
      getErrorTitle(appError),
      appError.message,
      [
        ...(appError.retryable && onRetry
          ? [
              {
                text: 'Retry',
                onPress: async () => {
                  try {
                    await onRetry();
                  } catch (retryError) {
                    await handleError(retryError, { context, showToast: true });
                  }
                },
              },
            ]
          : []),
        { text: 'OK', style: 'default' },
      ],
      { cancelable: true },
    );
  }
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return i18n.t('errors.network_title');
    case ErrorType.AUTHENTICATION:
      return i18n.t('errors.auth_title');
    case ErrorType.VALIDATION:
      return i18n.t('errors.validation_title');
    case ErrorType.PERMISSION:
      return i18n.t('errors.permission_title');
    case ErrorType.PAYMENT:
      return i18n.t('errors.payment_title');
    case ErrorType.API:
      return i18n.t('errors.server_title');
    default:
      return i18n.t('errors.generic_title');
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const appError = parseError(error);

      // Don't retry non-retryable errors
      if (!appError.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        onRetry?.(attempt, error);
        await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Safe async wrapper - catches errors and handles them
 */
export function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    context?: Record<string, any>;
    showToast?: boolean;
    defaultValue?: T;
  } = {},
): Promise<T | undefined> {
  return fn().catch(async error => {
    await handleError(error, {
      context: options.context,
      showToast: options.showToast ?? true,
      silent: false,
    });
    return options.defaultValue;
  });
}

/**
 * Handle API errors with automatic retry
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: {
    context?: Record<string, any>;
    maxRetries?: number;
    showToast?: boolean;
    showAlert?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: AppError) => void;
  } = {},
): Promise<T | null> {
  const {
    context,
    maxRetries = 2,
    showToast = true,
    showAlert = false,
    onSuccess,
    onError,
  } = options;

  try {
    const data = await retryWithBackoff(apiCall, {
      maxRetries,
      onRetry: (attempt, error) => {
        if (__DEV__) {
          console.log(`Retrying API call (attempt ${attempt})...`, error);
        }
      },
    });

    onSuccess?.(data);
    return data;
  } catch (error) {
    const appError = parseError(error, context);
    onError?.(appError);

    await handleError(error, {
      context,
      showToast,
      showAlert,
      silent: false,
    });

    return null;
  }
}
