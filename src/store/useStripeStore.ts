import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---
export interface LocalizedString {
  en: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface StripePrice {
  stripe_price_id: string;
  type: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  is_default: boolean;
  display_name: string;
  _id: string;
}

export interface Features {
  oracles: { [key: string]: boolean };
  games: { [key: string]: any };
  history: { [key: string]: any };
  content: { [key: string]: boolean };
  experience: { [key: string]: boolean };
  game_packs: { [key: string]: any };
  _id: string;
}

export interface StripePackage {
  id: string;
  name: string;
  display_name: string;
  description: string;
  short_description: string;
  type: string;
  category: string;
  tier: number;
  prices: StripePrice[];
  features: Features;
  feature_list_for_ui: string[];
  benefits: string[];
  limitations: string[];
  is_popular: boolean;
  is_featured: boolean;
  sort_order: number;
  stripe_product_id: string | null;
  trial_days: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentID: string;
  amount: number;
  currency: string;
}

export interface PurchasePackage {
  id: string;
  name: string;
  type: string;
  tier: number;
}

export interface PurchaseMetadata {
  platform: string;
  package_name: string;
  price_id: string;
}

export interface Purchase {
  id: string;
  transaction_type: string;
  payment_method: string;
  amount: number;
  currency: string;
  payment_status: string;
  purchase_date: string;
  package: PurchasePackage;
  credits_granted: number;
  receipt_url: string | null;
  metadata: PurchaseMetadata;
}

export interface VipSubscription {
  subscriptionId: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  endedAt: string | null;
  tier: number;
  cancelAtPeriodEnd: boolean;
}

export interface CurrentSubscriptionData {
  vipSubscription: VipSubscription | null;
  gamePacks: any[];
}

interface StripeState {
  packages: StripePackage[] | null;
  isLoading: boolean;
  error: string | null;
  lastPackagesFetch: number | null;
  fetchStripePackages: (force?: boolean) => Promise<void>;

  isCreatingIntent: boolean;
  intentError: string | null;
  createPaymentIntent: (
    packageId: string,
    priceId: string,
  ) => Promise<{
    clientSecret: string;
    paymentIntentId: string;
    subscriptionId?: string;
  } | null>;

  isConfirmingPayment: boolean;
  confirmationError: string | null;
  /**
   * @deprecated This method is deprecated. With webhook-based architecture,
   * payments are automatically processed via webhooks. Use polling after payment
   * confirmation instead. See subscriptionPolling.ts for polling utilities.
   */
  confirmPayment: (
    paymentIntentId: string,
  ) => Promise<{ success: boolean; subscription?: any }>;

  isVerifyingPayment: boolean;
  verificationError: string | null;
  debugVerifyPayment: (paymentIntentId: string) => Promise<boolean>;

  purchaseHistory: Purchase[] | null;
  isFetchingHistory: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  fetchPurchaseHistory: (force?: boolean) => Promise<void>;

  currentSubscription: CurrentSubscriptionData | null;
  isFetchingSubscription: boolean;
  subscriptionError: string | null;
  lastSubscriptionFetch: number | null;
  fetchCurrentSubscription: (force?: boolean) => Promise<void>;

  isCancelling: boolean;
  cancelError: string | null;
  cancelSubscription: () => Promise<boolean>;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('x-auth-token');
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  return token;
};

// Import centralized error handling
import { parseError, handleError, ErrorType } from '../utils/errorHandler';

// Helper function to extract error message (kept for backward compatibility)
const getErrorMessage = (error: unknown): string => {
  const appError = parseError(error);
  return appError.message;
};

// Retry helper for critical API calls
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), delay * attempt),
        );
      }
    }
  }
  throw lastError;
};

// Cache duration constants (in milliseconds)
const PACKAGES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const SUBSCRIPTION_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const HISTORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useStripeStore = create<StripeState>((set, get) => ({
  // Initial State
  packages: null,
  isLoading: false,
  error: null,
  lastPackagesFetch: null,
  isCreatingIntent: false,
  intentError: null,
  isConfirmingPayment: false,
  confirmationError: null,
  purchaseHistory: null,
  isFetchingHistory: false,
  historyError: null,
  lastHistoryFetch: null,
  currentSubscription: null,
  isFetchingSubscription: false,
  subscriptionError: null,
  lastSubscriptionFetch: null,
  isCancelling: false,
  cancelError: null,
  isVerifyingPayment: false,
  verificationError: null,

  fetchStripePackages: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.packages &&
      state.lastPackagesFetch &&
      now - state.lastPackagesFetch < PACKAGES_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(`${API_BASEURL}/stripe/packages`, {
          headers,
        });

        if (response.data?.success) {
          // Handle different response structures
          const packagesData =
            response.data.data?.packages ||
            response.data.data ||
            response.data.packages ||
            [];

          if (__DEV__) {
            console.log('Stripe packages API response:', {
              success: response.data.success,
              hasData: !!response.data.data,
              packagesCount: Array.isArray(packagesData)
                ? packagesData.length
                : 0,
              responseStructure: {
                hasDataPackages: !!response.data.data?.packages,
                hasData: !!response.data.data,
                hasPackages: !!response.data.packages,
              },
            });
          }

          if (!Array.isArray(packagesData)) {
            console.warn(
              'Packages data is not an array:',
              typeof packagesData,
              packagesData,
            );
            set({
              packages: [],
              isLoading: false,
              lastPackagesFetch: now,
            });
            return;
          }

          set({
            packages: packagesData as StripePackage[],
            isLoading: false,
            lastPackagesFetch: now,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch Stripe packages.',
          );
        }
      };

      await retryApiCall(fetchData, 2, 500);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      // Only show alert if we don't have cached data
      if (!state.packages) {
        Alert.alert('Error', errorMessage);
      }
      if (__DEV__) {
        console.log('Error fetching Stripe packages:', errorMessage);
      }
    }
  },

  createPaymentIntent: async (
    packageId: string,
    priceId: string,
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    subscriptionId?: string;
  } | null> => {
    set({ isCreatingIntent: true, intentError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const payload = { packageId, priceId };

      const fetchData = async () => {
        const response = await axios.post(
          `${API_BASEURL}/stripe/payment-intent`,
          payload,
          { headers },
        );

        if (response.data?.success && response.data?.data?.client_secret) {
          set({ isCreatingIntent: false });
          return {
            clientSecret: response.data.data.client_secret,
            paymentIntentId: response.data.data.payment_intent_id,
            subscriptionId: response.data.data.subscription_id,
          };
        } else {
          throw new Error(
            response.data?.message ||
              response.data?.error ||
              'Failed to create payment intent.',
          );
        }
      };

      return await retryApiCall(fetchData, 2, 1000);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ intentError: errorMessage, isCreatingIntent: false });
      Alert.alert('Payment Error', errorMessage);
      return null;
    }
  },

  confirmPayment: async (
    paymentIntentId: string,
  ): Promise<{ success: boolean; subscription?: any }> => {
    set({ isConfirmingPayment: true, confirmationError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const payload = { paymentIntentId };

      const response = await axios.post(
        `${API_BASEURL}/stripe/confirm-payment`,
        payload,
        { headers },
      );

      if (__DEV__) {
        console.log('Confirm Payment Response:', response.data);
      }

      if (response.data?.success) {
        set({ isConfirmingPayment: false });
        return {
          success: true,
          subscription: response.data.subscription,
        };
      } else {
        const errorMessage =
          response.data.message || 'Failed to confirm payment.';
        if (__DEV__) {
          console.error('Payment confirmation failed:', {
            message: errorMessage,
            status: response.data.status,
            details: response.data.details,
          });
        }
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      if (__DEV__) {
        console.log('Payment confirmation error:', errorMessage);
      }
      set({ confirmationError: errorMessage, isConfirmingPayment: false });
      return { success: false };
    }
  },

  fetchPurchaseHistory: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.purchaseHistory &&
      state.lastHistoryFetch &&
      now - state.lastHistoryFetch < HISTORY_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isFetchingHistory) {
      return;
    }

    set({ isFetchingHistory: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(
          `${API_BASEURL}/user/purchase-history`,
          {
            headers,
          },
        );

        if (response.data?.success && response.data?.data?.purchases) {
          set({
            purchaseHistory: response.data.data.purchases as Purchase[],
            isFetchingHistory: false,
            lastHistoryFetch: now,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch purchase history.',
          );
        }
      };

      await retryApiCall(fetchData, 2, 500);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isFetchingHistory: false });
      if (__DEV__) {
        console.log('Error fetching purchase history:', errorMessage);
      }
      // Only show alert if we don't have cached data
      if (!state.purchaseHistory) {
        Alert.alert('Error', errorMessage);
      }
    }
  },

  fetchCurrentSubscription: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.currentSubscription &&
      state.lastSubscriptionFetch &&
      now - state.lastSubscriptionFetch < SUBSCRIPTION_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isFetchingSubscription) {
      return;
    }

    set({ isFetchingSubscription: true, subscriptionError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(
          `${API_BASEURL}/stripe/current-subscription`,
          { headers },
        );

        if (response.data?.success && response.data?.data) {
          set({
            currentSubscription: response.data.data as CurrentSubscriptionData,
            isFetchingSubscription: false,
            lastSubscriptionFetch: now,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch subscription details.',
          );
        }
      };

      await retryApiCall(fetchData, 3, 1000); // More retries for critical subscription endpoint
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ subscriptionError: errorMessage, isFetchingSubscription: false });
      if (__DEV__) {
        console.error('Fetch current subscription error:', errorMessage);
      }
      // Don't show alert - subscription fetch failures should be handled gracefully
      // Components can check subscriptionError if needed
    }
  },

  cancelSubscription: async () => {
    set({ isCancelling: true, cancelError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/stripe/cancel-subscription`,
        {},
        { headers },
      );

      if (__DEV__) {
        console.log('Cancel Response', response.data);
      }

      if (response.data?.success) {
        Alert.alert(
          'Success',
          response.data.message || 'Subscription cancelled successfully.',
        );
        // Force refresh subscription after cancellation
        get().fetchCurrentSubscription(true);
        return true;
      } else {
        throw new Error(
          response.data?.message || 'Failed to cancel subscription.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ cancelError: errorMessage });
      Alert.alert('Cancellation Failed', errorMessage);
      return false;
    } finally {
      set({ isCancelling: false });
    }
  },

  debugVerifyPayment: async (paymentIntentId: string) => {
    set({ isVerifyingPayment: true, verificationError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const payload = { paymentIntentId };

      const response = await axios.post(
        `${API_BASEURL}/stripe/debug-verify-payment`,
        payload,
        { headers },
      );

      if (__DEV__) {
        console.log('Debug Verify Response:', response.data);
      }

      if (response.data?.success) {
        Alert.alert(
          'Debug Success',
          response.data.message || 'Payment verified successfully.',
        );
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to verify payment.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ verificationError: errorMessage });
      Alert.alert('Debug Verification Failed', errorMessage);
      return false;
    } finally {
      set({ isVerifyingPayment: false });
    }
  },
}));
