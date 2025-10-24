import { Alert } from 'react-native';
import { useStripeStore } from '../store/useStripeStore';

export interface PaymentResult {
  success: boolean;
  subscription?: any;
  error?: string;
}

/**
 * Improved payment helper that handles payment method issues
 */
export const processPaymentImproved = async (
  packageId: string,
  priceId: string,
  stripe: { initPaymentSheet: any; presentPaymentSheet: any },
  onSuccess?: (subscription: any) => void,
  onError?: (error: string) => void,
): Promise<PaymentResult> => {
  const { initPaymentSheet, presentPaymentSheet } = stripe;
  const { createPaymentIntent, confirmPayment } = useStripeStore.getState();

  try {
    console.log(
      'Starting payment process for package:',
      packageId,
      'price:',
      priceId,
    );

    // Step 1: Create payment intent
    const paymentData = await createPaymentIntent(packageId, priceId);

    if (!paymentData) {
      const error = 'Failed to create payment intent';
      console.error(error);
      onError?.(error);
      return { success: false, error };
    }

    console.log('Payment intent created:', {
      paymentIntentId: paymentData.paymentIntentId,
      hasSubscriptionId: !!paymentData.subscriptionId,
    });

    // Step 2: Initialize payment sheet with proper configuration
    const paymentSheetConfig = {
      merchantDisplayName: 'Portal Paraiso, Inc.',
      paymentIntentClientSecret: paymentData.clientSecret,
      // Critical: Allow delayed payment methods for subscriptions
      allowsDelayedPaymentMethods: true,
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

    console.log('Initializing payment sheet with config:', paymentSheetConfig);

    const { error: initError } = await initPaymentSheet(paymentSheetConfig);

    if (initError) {
      const error = `Could not initialize payment sheet: ${initError.message}`;
      console.error('Payment sheet initialization failed:', initError);
      onError?.(error);
      return { success: false, error };
    }

    console.log('Payment sheet initialized successfully');

    // Step 3: Present payment sheet
    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      console.log('Payment sheet error:', paymentError);

      if (paymentError.code === 'Canceled') {
        // User canceled - not an error
        return { success: false, error: 'Payment canceled by user' };
      } else {
        const error = `Payment Error: ${paymentError.code} - ${paymentError.message}`;
        console.error('Payment failed:', paymentError);
        onError?.(error);
        return { success: false, error };
      }
    }

    console.log('Payment sheet completed successfully, confirming payment...');

    // Step 4: Confirm payment with backend
    const confirmationResult = await confirmPayment(
      paymentData.paymentIntentId,
    );

    if (confirmationResult.success) {
      console.log(
        'Payment confirmed successfully:',
        confirmationResult.subscription,
      );
      onSuccess?.(confirmationResult.subscription);
      return {
        success: true,
        subscription: confirmationResult.subscription,
      };
    } else {
      const error = 'Payment verification failed';
      console.error('Payment confirmation failed:', confirmationResult);
      onError?.(error);
      return { success: false, error };
    }
  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred';
    console.error('Payment process failed:', error);
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
