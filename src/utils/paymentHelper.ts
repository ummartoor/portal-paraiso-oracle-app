import { Alert } from 'react-native';
import { useStripeStore } from '../store/useStripeStore';
import { pollSubscriptionStatus } from './subscriptionPolling';

export interface PaymentResult {
  success: boolean;
  subscription?: any;
  error?: string;
  isProcessing?: boolean; // True if payment confirmed but subscription not yet updated
}

/**
 * Utility function to handle payment flow for packages using webhook-based architecture
 * After payment confirmation, polls subscription status instead of calling verification endpoint
 * @param packageId - The package ID to purchase
 * @param priceId - The price ID for the package
 * @param stripe - Stripe hook instance
 * @param onSuccess - Callback when payment is successful and subscription is confirmed
 * @param onError - Callback when payment fails
 * @param onProcessing - Callback when payment is confirmed but subscription is still processing
 */
export const processPayment = async (
  packageId: string,
  priceId: string,
  stripe: { initPaymentSheet: any; presentPaymentSheet: any },
  onSuccess?: (subscription: any) => void,
  onError?: (error: string) => void,
  onProcessing?: () => void,
): Promise<PaymentResult> => {
  const { initPaymentSheet, presentPaymentSheet } = stripe;
  const { createPaymentIntent } = useStripeStore.getState();

  try {
    // Step 1: Create payment intent
    const paymentData = await createPaymentIntent(packageId, priceId);

    if (!paymentData) {
      const error = 'Failed to create payment intent';
      onError?.(error);
      return { success: false, error };
    }

    // Step 2: Initialize payment sheet
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: 'Portal Paraiso, Inc.',
      paymentIntentClientSecret: paymentData.clientSecret,
      // Note: Guide says false, but true is required for recurring subscriptions to save payment method
      // Keeping true as it's correct for subscription billing
      allowsDelayedPaymentMethods: true,
      returnURL: 'portalparaiso://payment-return',
      defaultBillingDetails: {
        name: 'Customer',
      },
      appearance: {
        colors: {
          primary: '#D9B699',
        },
      },
    });

    if (initError) {
      const error = `Could not initialize payment sheet: ${initError.message}`;
      onError?.(error);
      return { success: false, error };
    }

    // Step 3: Present payment sheet
    const { error: paymentError, paymentIntent: result } =
      await presentPaymentSheet();

    if (paymentError) {
      if (paymentError.code !== 'Canceled') {
        const error = `Payment Error: ${paymentError.code} - ${paymentError.message}`;
        onError?.(error);
        return { success: false, error };
      }
      // User canceled - not an error
      return { success: false, error: 'Payment canceled by user' };
    }

    // Step 4: Check payment result status
    if (result?.status !== 'Succeeded') {
      const error = `Payment not completed. Status: ${
        result?.status || 'unknown'
      }`;
      onError?.(error);
      return { success: false, error };
    }

    // Step 5: Verify payment (backup for webhook delays)
    const { verifyPayment } = useStripeStore.getState();
    try {
      await verifyPayment(paymentData.paymentIntentId);
      if (__DEV__) {
        console.log(
          'Payment verified successfully via verify-payment endpoint',
        );
      }
    } catch (error) {
      // Verification failed, but continue with polling as webhook may still process
      if (__DEV__) {
        console.warn(
          'Payment verification failed, continuing with polling:',
          error,
        );
      }
    }

    // Step 6: Payment confirmed by Stripe SDK - now poll for webhook processing
    // The webhook will process the payment automatically on the server
    if (onProcessing) {
      onProcessing();
    }

    const pollingResult = await pollSubscriptionStatus({
      expectedPackageId: packageId,
      maxDuration: 30000, // 30 seconds
      initialInterval: 2500, // 2.5 seconds
      onUpdate: subscription => {
        if (__DEV__) {
          console.log('Subscription updated via polling:', subscription);
        }
      },
      onTimeout: () => {
        if (__DEV__) {
          console.log('Polling timeout - webhook may still be processing');
        }
      },
    });

    if (pollingResult.success && pollingResult.subscription) {
      onSuccess?.(pollingResult.subscription);
      return {
        success: true,
        subscription: pollingResult.subscription,
      };
    } else if (pollingResult.timedOut) {
      // Payment was confirmed but subscription not yet updated
      // This is okay - webhook will process it in the background
      return {
        success: false,
        isProcessing: true,
        error: 'Payment received. Your subscription will be activated shortly.',
      };
    } else {
      const error =
        pollingResult.error ||
        'Payment confirmed but subscription status could not be verified';
      onError?.(error);
      return { success: false, error };
    }
  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred';
    onError?.(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Hook for payment processing with loading states
 */
export const usePaymentProcessor = (stripe: {
  initPaymentSheet: any;
  presentPaymentSheet: any;
}) => {
  const { isCreatingIntent, isConfirmingPayment } = useStripeStore();

  const processPaymentWithLoading = async (
    packageId: string,
    priceId: string,
    onSuccess?: (subscription: any) => void,
    onError?: (error: string) => void,
  ) => {
    const result = await processPayment(
      packageId,
      priceId,
      stripe,
      onSuccess,
      onError,
    );
    return result;
  };

  return {
    processPayment: processPaymentWithLoading,
    isLoading: isCreatingIntent || isConfirmingPayment,
  };
};
