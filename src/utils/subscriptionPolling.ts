import { useStripeStore } from '../store/useStripeStore';

export interface PollingOptions {
  /**
   * Maximum duration to poll in milliseconds (default: 30000 = 30 seconds)
   */
  maxDuration?: number;
  /**
   * Interval between polls in milliseconds (default: 2500 = 2.5 seconds)
   */
  interval?: number;
  /**
   * Expected package ID to check for (optional)
   */
  expectedPackageId?: string;
  /**
   * Callback when subscription status is updated
   */
  onUpdate?: (subscription: any) => void;
  /**
   * Callback when polling times out
   */
  onTimeout?: () => void;
  /**
   * Callback when an error occurs during polling
   */
  onError?: (error: string) => void;
}

export interface PollingResult {
  success: boolean;
  subscription?: any;
  error?: string;
  timedOut: boolean;
}

/**
 * Polls the subscription status endpoint to check if payment has been processed via webhook
 * This is used after payment confirmation to wait for webhook processing
 */
export const pollSubscriptionStatus = async (
  options: PollingOptions = {},
): Promise<PollingResult> => {
  const {
    maxDuration = 30000, // 30 seconds
    interval = 2500, // 2.5 seconds
    expectedPackageId,
    onUpdate,
    onTimeout,
    onError,
  } = options;

  const startTime = Date.now();
  const { fetchCurrentSubscription } = useStripeStore.getState();

  // Initial fetch
  await fetchCurrentSubscription(true);

  const checkSubscription = (): PollingResult | null => {
    const { currentSubscription } = useStripeStore.getState();
    const vipSubscription = currentSubscription?.vipSubscription;

    // Check if we have the expected package ID
    if (expectedPackageId && vipSubscription?.packageId === expectedPackageId) {
      // Also check if status is active or trialing (valid subscription states)
      if (
        vipSubscription.status === 'active' ||
        vipSubscription.status === 'trialing'
      ) {
        if (onUpdate) {
          onUpdate(vipSubscription);
        }
        return {
          success: true,
          subscription: vipSubscription,
          timedOut: false,
        };
      }
    }

    // If no expected package ID, just check if subscription exists and is active/trialing
    if (
      !expectedPackageId &&
      vipSubscription &&
      (vipSubscription.status === 'active' ||
        vipSubscription.status === 'trialing')
    ) {
      if (onUpdate) {
        onUpdate(vipSubscription);
      }
      return {
        success: true,
        subscription: vipSubscription,
        timedOut: false,
      };
    }

    return null;
  };

  // Check immediately
  const immediateResult = checkSubscription();
  if (immediateResult) {
    return immediateResult;
  }

  // Poll until max duration
  return new Promise<PollingResult>(resolve => {
    const pollInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= maxDuration) {
        clearInterval(pollInterval);
        if (onTimeout) {
          onTimeout();
        }
        resolve({
          success: false,
          timedOut: true,
          error: 'Polling timeout - payment may still be processing',
        });
        return;
      }

      try {
        await fetchCurrentSubscription(true);
        const result = checkSubscription();

        if (result) {
          clearInterval(pollInterval);
          resolve(result);
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || 'Error polling subscription status';
        if (onError) {
          onError(errorMessage);
        }
        // Continue polling on error (might be transient network issue)
        if (__DEV__) {
          console.warn('Polling error (continuing):', errorMessage);
        }
      }
    }, interval);
  });
};
