import { useCallback } from 'react';
import {
  handleError,
  parseError,
  safeAsync,
  ErrorType,
} from '../utils/errorHandler';
import Toast from 'react-native-toast-message';

/**
 * Hook for error handling in components
 */
export function useErrorHandler() {
  const handleErrorWithToast = useCallback(
    async (
      error: unknown,
      options: {
        context?: Record<string, any>;
        showAlert?: boolean;
        onRetry?: () => Promise<void>;
        silent?: boolean;
      } = {},
    ) => {
      await handleError(error, {
        ...options,
        showToast: true,
      });
    },
    [],
  );

  const handleErrorSilently = useCallback(
    async (error: unknown, context?: Record<string, any>) => {
      await handleError(error, {
        context,
        showToast: false,
        showAlert: false,
        silent: true,
      });
    },
    [],
  );

  const showErrorToast = useCallback((message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'bottom',
    });
  }, []);

  const showSuccessToast = useCallback((message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'bottom',
    });
  }, []);

  const showInfoToast = useCallback((message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'bottom',
    });
  }, []);

  return {
    handleError: handleErrorWithToast,
    handleErrorSilently,
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    safeAsync,
    parseError,
  };
}
