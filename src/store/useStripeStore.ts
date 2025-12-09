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
  fetchStripePackages: () => Promise<void>;

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
  confirmPayment: (
    paymentIntentId: string,
  ) => Promise<{ success: boolean; subscription?: any }>;

  isVerifyingPayment: boolean;
  verificationError: string | null;
  debugVerifyPayment: (paymentIntentId: string) => Promise<boolean>;

  purchaseHistory: Purchase[] | null;
  isFetchingHistory: boolean;
  historyError: string | null;
  fetchPurchaseHistory: () => Promise<void>;

  currentSubscription: CurrentSubscriptionData | null;
  isFetchingSubscription: boolean;
  subscriptionError: string | null;
  fetchCurrentSubscription: () => Promise<void>;

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

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unknown error occurred.'
    );
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
};

export const useStripeStore = create<StripeState>((set, get) => ({
  // Initial State
  packages: null,
  isLoading: false,
  error: null,
  isCreatingIntent: false,
  intentError: null,
  isConfirmingPayment: false,
  confirmationError: null,
  purchaseHistory: null,
  isFetchingHistory: false,
  historyError: null,
  currentSubscription: null,
  isFetchingSubscription: false,
  subscriptionError: null,
  isCancelling: false,
  cancelError: null,
  isVerifyingPayment: false,
  verificationError: null,

  fetchStripePackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const response = await axios.get(`${API_BASEURL}/stripe/packages`, {
        headers,
      });

      if (response.data?.success) {
        set({
          packages: response.data.data as StripePackage[],
          isLoading: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch Stripe packages.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
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

      const response = await axios.post(
        `${API_BASEURL}/stripe/payment-intent`,
        payload,
        { headers },
      );

      if (response.data?.success && response.data.clientSecret) {
        set({ isCreatingIntent: false });
        return {
          clientSecret: response.data.clientSecret,
          paymentIntentId: response.data.paymentIntentId,
          subscriptionId: response.data.subscriptionId,
        };
      } else {
        throw new Error(
          response.data.message ||
            response.data.error ||
            'Failed to create payment intent.',
        );
      }
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

  fetchPurchaseHistory: async () => {
    set({ isFetchingHistory: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const response = await axios.get(`${API_BASEURL}/user/purchase-history`, {
        headers,
      });

      if (response.data?.success) {
        set({
          purchaseHistory: response.data.data.purchases as Purchase[],
          isFetchingHistory: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch purchase history.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isFetchingHistory: false });
      if (__DEV__) {
        console.log('Error fetching purchase history:', errorMessage);
      }
      Alert.alert('Error', errorMessage);
    }
  },

  fetchCurrentSubscription: async () => {
    set({ isFetchingSubscription: true, subscriptionError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/stripe/current-subscription`,
        { headers },
      );

      if (response.data?.success) {
        set({
          currentSubscription: response.data.data as CurrentSubscriptionData,
          isFetchingSubscription: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch subscription details.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ subscriptionError: errorMessage, isFetchingSubscription: false });
      if (__DEV__) {
        console.error('Fetch current subscription error:', errorMessage);
      }
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
        get().fetchCurrentSubscription();
        return true;
      } else {
        throw new Error(
          response.data.message || 'Failed to cancel subscription.',
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
