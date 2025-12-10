import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

/**
 * Simple network status hook
 * Detects network status through API call failures
 * For better accuracy, install @react-native-community/netinfo
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const { t } = useTranslation();

  // Network status is primarily detected through API errors
  // This hook provides a simple interface for components
  useEffect(() => {
    // Assume online initially
    setIsOnline(true);
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Simple connectivity check
      // In a real scenario, you'd ping a lightweight endpoint
      // For now, we'll rely on API error handling to detect offline status
      setIsOnline(true);
      return true;
    } catch (error) {
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Method to update network status (called by error handler)
  const updateNetworkStatus = (status: boolean) => {
    const wasOnline = isOnline;
    setIsOnline(status);

    // Show toast on status change
    if (wasOnline !== status) {
      if (status) {
        Toast.show({
          type: 'success',
          text1: t('errors.connection_restored'),
          text2: t('errors.network_connection'),
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('errors.network_title'),
          text2: t('errors.network_connection'),
          position: 'bottom',
        });
      }
    }
  };

  return {
    isOnline,
    isChecking,
    checkConnection,
    updateNetworkStatus, // For use by error handler
  };
}
