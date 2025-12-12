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
 * Improved payment helper that handles payment method issues using webhook-based architecture
 * After payment confirmation, polls subscription status instead of calling verification endpoint
 */
export const processPaymentImproved = async (
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
    if (__DEV__) {
      console.log(
        'Starting payment process for package:',
        packageId,
        'price:',
        priceId,
      );
    }

    // Step 1: Create payment intent
    const paymentData = await createPaymentIntent(packageId, priceId);

    if (!paymentData) {
      const error = 'Failed to create payment intent';
      if (__DEV__) {
        console.error(error);
      }
      onError?.(error);
      return { success: false, error };
    }

    if (__DEV__) {
      console.log('Payment intent created:', {
        paymentIntentId: paymentData.paymentIntentId,
        hasSubscriptionId: !!paymentData.subscriptionId,
      });
    }

    // Step 2: Initialize payment sheet with proper configuration
    const paymentSheetConfig = {
      merchantDisplayName: 'Portal Paraiso, Inc.',
      paymentIntentClientSecret: paymentData.clientSecret,
      // Note: Guide says false, but true is required for recurring subscriptions to save payment method
      // Keeping true as it's correct for subscription billing
      allowsDelayedPaymentMethods: true,
      returnURL: 'portalparaiso://payment-return',
      // Set default billing details
      defaultBillingDetails: {
        name: 'Customer',
      },
      // Customize appearance
      appearance: {
        colors: {
          primary: '#D9B699',
        },
      },
      // For subscriptions, we need to save the payment method
      ...(paymentData.subscriptionId && {
        customerId: undefined, // Will be set by Stripe automatically
      }),
    };

    if (__DEV__) {
      console.log(
        'Initializing payment sheet with config:',
        paymentSheetConfig,
      );
    }

    const { error: initError } = await initPaymentSheet(paymentSheetConfig);

    if (initError) {
      const error = `Could not initialize payment sheet: ${initError.message}`;
      if (__DEV__) {
        console.error('Payment sheet initialization failed:', initError);
      }
      onError?.(error);
      return { success: false, error };
    }

    if (__DEV__) {
      console.log('Payment sheet initialized successfully');
    }

    // Step 3: Present payment sheet
    const { error: paymentError, paymentIntent: result } =
      await presentPaymentSheet();

    if (paymentError) {
      if (__DEV__) {
        console.log('Payment sheet error:', paymentError);
      }

      if (paymentError.code === 'Canceled') {
        // User canceled - not an error
        return { success: false, error: 'Payment canceled by user' };
      } else {
        const error = `Payment Error: ${paymentError.code} - ${paymentError.message}`;
        if (__DEV__) {
          console.error('Payment failed:', paymentError);
        }
        onError?.(error);
        return { success: false, error };
      }
    }

    // Step 4: Check payment result status
    if (result?.status !== 'Succeeded') {
      const error = `Payment not completed. Status: ${
        result?.status || 'unknown'
      }`;
      if (__DEV__) {
        console.error('Payment status check failed:', error);
      }
      onError?.(error);
      return { success: false, error };
    }

    if (__DEV__) {
      console.log('Payment sheet completed successfully, verifying payment...');
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
      if (__DEV__) {
        console.log(
          'Payment confirmed and subscription activated:',
          pollingResult.subscription,
        );
      }
      onSuccess?.(pollingResult.subscription);
      return {
        success: true,
        subscription: pollingResult.subscription,
      };
    } else if (pollingResult.timedOut) {
      // Payment was confirmed but subscription not yet updated
      // This is okay - webhook will process it in the background
      if (__DEV__) {
        console.log('Polling timed out - payment will be processed by webhook');
      }
      return {
        success: false,
        isProcessing: true,
        error: 'Payment received. Your subscription will be activated shortly.',
      };
    } else {
      const error =
        pollingResult.error ||
        'Payment confirmed but subscription status could not be verified';
      if (__DEV__) {
        console.error('Payment polling failed:', error);
      }
      onError?.(error);
      return { success: false, error };
    }
  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred';
    if (__DEV__) {
      console.error('Payment process failed:', error);
    }
    onError?.(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Hook for improved payment processing
 */
export const useImprovedPaymentProcessor = (stripe: {
  initPaymentSheet: any;
  presentPaymentSheet: any;
}) => {
  const { isCreatingIntent, isConfirmingPayment } = useStripeStore();

  const processPayment = async (
    packageId: string,
    priceId: string,
    onSuccess?: (subscription: any) => void,
    onError?: (error: string) => void,
  ) => {
    const result = await processPaymentImproved(
      packageId,
      priceId,
      stripe,
      onSuccess,
      onError,
    );
    return result;
  };

  return {
    processPayment,
    isLoading: isCreatingIntent || isConfirmingPayment,
  };
};
