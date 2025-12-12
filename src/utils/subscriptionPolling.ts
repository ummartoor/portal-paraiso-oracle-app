import { useStripeStore } from '../store/useStripeStore';

// Cache the last successful subscription check to reduce unnecessary API calls
let lastSubscriptionCheck: {
  timestamp: number;
  subscription: any;
  packageId?: string;
} | null = null;

// Cache duration for subscription checks (5 minutes)
const SUBSCRIPTION_CACHE_DURATION = 5 * 60 * 1000;

export interface PollingOptions {
  /**
   * Maximum duration to poll in milliseconds (default: 20000 = 20 seconds)
   */
  maxDuration?: number;
  /**
   * Initial interval between polls in milliseconds (default: 1000 = 1 second)
   * Will increase with each retry up to maxInterval
   */
  initialInterval?: number;
  /**
   * Maximum interval between polls in milliseconds (default: 5000 = 5 seconds)
   */
  maxInterval?: number;
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
  /**
   * Whether to use cached subscription data (default: true)
   */
  useCache?: boolean;
}

export interface PollingResult {
  success: boolean;
  subscription?: any;
  error?: string;
  timedOut: boolean;
  fromCache?: boolean;
}

/**
 * Clears the subscription cache
 */
export const clearSubscriptionCache = () => {
  lastSubscriptionCheck = null;
};

/**
 * Checks if a subscription is valid (active or trialing)
 */
const isValidSubscription = (
  subscription: any,
  expectedPackageId?: string,
): boolean => {
  if (!subscription) return false;
  if (expectedPackageId && subscription.packageId !== expectedPackageId)
    return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
};

/**
 * Polls the subscription status endpoint with exponential backoff
 */
export const pollSubscriptionStatus = async (
  options: PollingOptions = {},
): Promise<PollingResult> => {
  const {
    maxDuration = 20000, // 20 seconds
    initialInterval = 1000, // 1 second
    maxInterval = 5000, // 5 seconds
    expectedPackageId,
    onUpdate,
    onTimeout,
    onError,
    useCache = true,
  } = options;

  const startTime = Date.now();
  const { fetchCurrentSubscription } = useStripeStore.getState();
  let currentInterval = initialInterval;
  let attempt = 0;

  // Check cache first if enabled and valid
  if (useCache && lastSubscriptionCheck) {
    const cacheAge = Date.now() - lastSubscriptionCheck.timestamp;
    const isCacheValid =
      cacheAge < SUBSCRIPTION_CACHE_DURATION &&
      (!expectedPackageId ||
        lastSubscriptionCheck.packageId === expectedPackageId);

    if (
      isCacheValid &&
      isValidSubscription(lastSubscriptionCheck.subscription, expectedPackageId)
    ) {
      if (__DEV__) {
        console.log('Using cached subscription data');
      }
      return {
        success: true,
        subscription: lastSubscriptionCheck.subscription,
        timedOut: false,
        fromCache: true,
      };
    }
  }

  // Initial fetch
  try {
    await fetchCurrentSubscription(true);
    const { currentSubscription } = useStripeStore.getState();
    const vipSubscription = currentSubscription?.vipSubscription;

    if (
      vipSubscription &&
      isValidSubscription(vipSubscription, expectedPackageId)
    ) {
      lastSubscriptionCheck = {
        timestamp: Date.now(),
        subscription: vipSubscription,
        packageId: expectedPackageId,
      };
      onUpdate?.(vipSubscription);
      return { success: true, subscription: vipSubscription, timedOut: false };
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error fetching initial subscription status';
    onError?.(errorMessage);
    if (__DEV__) {
      console.warn('Initial subscription check failed:', error);
    }
  }

  // Poll with exponential backoff
  return new Promise<PollingResult>(resolve => {
    const poll = async () => {
      const elapsed = Date.now() - startTime;
      attempt++;

      if (elapsed >= maxDuration) {
        clearTimeout(timeout);
        onTimeout?.();
        resolve({
          success: false,
          timedOut: true,
          error: 'Polling timeout - payment may still be processing',
        });
        return;
      }

      try {
        await fetchCurrentSubscription(true);
        const { currentSubscription } = useStripeStore.getState();
        const vipSubscription = currentSubscription?.vipSubscription;

        if (
          vipSubscription &&
          isValidSubscription(vipSubscription, expectedPackageId)
        ) {
          lastSubscriptionCheck = {
            timestamp: Date.now(),
            subscription: vipSubscription,
            packageId: expectedPackageId,
          };
          clearTimeout(timeout);
          onUpdate?.(vipSubscription);
          resolve({
            success: true,
            subscription: vipSubscription,
            timedOut: false,
          });
          return;
        }

        // Increase interval with exponential backoff, but cap at maxInterval
        currentInterval = Math.min(
          initialInterval * Math.pow(1.5, attempt - 1),
          maxInterval,
        );

        if (__DEV__) {
          console.log(`Retrying in ${currentInterval}ms (attempt ${attempt})`);
        }

        timeout = setTimeout(poll, currentInterval);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error polling subscription status';
        onError?.(errorMessage);

        // Continue polling on error with increased interval
        currentInterval = Math.min(currentInterval * 2, maxInterval);
        timeout = setTimeout(poll, currentInterval);

        if (__DEV__) {
          console.warn(
            `Polling error (retrying in ${currentInterval}ms):`,
            error,
          );
        }
      }
    };

    let timeout = setTimeout(poll, currentInterval);

    // Cleanup function
    return () => clearTimeout(timeout);
  });
};
