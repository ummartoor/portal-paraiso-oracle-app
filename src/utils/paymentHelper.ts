import { Alert } from 'react-native';
import { useStripeStore } from '../store/useStripeStore';

export interface PaymentResult {
  success: boolean;
  subscription?: any;
  error?: string;
}

/**
 * Utility function to handle payment flow for packages
 * @param packageId - The package ID to purchase
 * @param priceId - The price ID for the package
 * @param stripe - Stripe hook instance
 * @param onSuccess - Callback when payment is successful
 * @param onError - Callback when payment fails
 */
export const processPayment = async (
  packageId: string,
  priceId: string,
  stripe: { initPaymentSheet: any; presentPaymentSheet: any },
  onSuccess?: (subscription: any) => void,
  onError?: (error: string) => void,
): Promise<PaymentResult> => {
  const { initPaymentSheet, presentPaymentSheet } = stripe;
  const { createPaymentIntent, confirmPayment } = useStripeStore.getState();

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
      // For recurring subscriptions, we need to save the payment method
      allowsDelayedPaymentMethods: true,
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
    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      if (paymentError.code !== 'Canceled') {
        const error = `Payment Error: ${paymentError.code} - ${paymentError.message}`;
        onError?.(error);
        return { success: false, error };
      }
      // User canceled - not an error
      return { success: false, error: 'Payment canceled by user' };
    }

    // Step 4: Confirm payment with backend
    const confirmationResult = await confirmPayment(
      paymentData.paymentIntentId,
    );

    if (confirmationResult.success) {
      onSuccess?.(confirmationResult.subscription);
      return {
        success: true,
        subscription: confirmationResult.subscription,
      };
    } else {
      const error = 'Payment verification failed';
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
