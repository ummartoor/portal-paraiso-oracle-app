import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  parseError,
  handleError,
  ErrorType,
  ErrorSeverity,
} from './errorHandler';
import { errorLogger } from './errorHandler';

/**
 * Request interceptor - Add auth token and handle request errors
 */
export const setupRequestInterceptor = () => {
  axios.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (token && config.headers) {
          config.headers['x-auth-token'] = token;
        }
      } catch (error) {
        // Silent fail - token might not be available
      }

      // Add request timestamp for timeout handling
      (config as any).metadata = { startTime: Date.now() };

      return config;
    },
    (error: AxiosError) => {
      // Handle request configuration errors
      const appError = parseError(error);
      errorLogger.log(appError);
      return Promise.reject(error);
    },
  );
};

/**
 * Response interceptor - Handle responses and errors globally
 */
export const setupResponseInterceptor = () => {
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log slow requests in development
      if (__DEV__) {
        const config = response.config as any;
        if (config.metadata?.startTime) {
          const duration = Date.now() - config.metadata.startTime;
          if (duration > 3000) {
            console.warn(
              `Slow API call: ${response.config.url} took ${duration}ms`,
            );
          }
        }
      }

      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
      };

      // Don't retry if already retried or not retryable
      if (config._retry || !shouldRetry(error)) {
        const appError = parseError(error);
        errorLogger.log(appError);
        return Promise.reject(error);
      }

      // Handle 401 - Unauthorized (token expired)
      if (error.response?.status === 401) {
        // Clear auth data
        try {
          await AsyncStorage.removeItem('x-auth-token');
          await AsyncStorage.removeItem('isLoggedIn');
          await AsyncStorage.removeItem('user');
        } catch (storageError) {
          // Silent fail
        }

        // Don't retry auth errors
        const appError = parseError(error);
        appError.severity = ErrorSeverity.HIGH;
        errorLogger.log(appError);
        return Promise.reject(error);
      }

      // Retry logic for network errors and 5xx errors
      if (shouldRetry(error)) {
        config._retry = true;
        config._retryCount = (config._retryCount || 0) + 1;

        const maxRetries = 2;
        if (config._retryCount <= maxRetries) {
          // Exponential backoff
          const delay = Math.min(
            1000 * Math.pow(2, config._retryCount - 1),
            5000,
          );

          if (__DEV__) {
            console.log(
              `Retrying request ${config.url} (attempt ${config._retryCount}/${maxRetries}) after ${delay}ms`,
            );
          }

          await new Promise<void>(resolve =>
            setTimeout(() => resolve(), delay),
          );

          // Retry the request
          return axios(config);
        }
      }

      // Log and reject
      const appError = parseError(error);
      errorLogger.log(appError);
      return Promise.reject(error);
    },
  );
};

/**
 * Determine if error should be retried
 */
function shouldRetry(error: AxiosError<unknown>): boolean {
  // Don't retry if request was cancelled
  if (axios.isCancel(error)) {
    return false;
  }

  // Type assertion to help TypeScript understand the error structure
  const axiosErr = error as AxiosError<unknown>;

  // Retry on network errors (no response)
  if (!axiosErr.response && axiosErr.request) {
    return true;
  }

  // Retry on 5xx server errors
  const status = axiosErr.response?.status;
  if (status && status >= 500) {
    return true;
  }

  // Retry on 429 (rate limit) - but with longer delay
  if (status === 429) {
    return true;
  }

  // Retry on 408 (timeout)
  if (status === 408) {
    return true;
  }

  return false;
}

/**
 * Initialize interceptors
 */
export const initializeApiInterceptors = () => {
  setupRequestInterceptor();
  setupResponseInterceptor();
};
