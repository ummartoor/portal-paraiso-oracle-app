// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import { API_BASEURL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // =================================================================
// // INTERFACES (Updated)
// // =================================================================

// export interface StripePrice {
//   stripe_price_id: string;
//   type: string;
//   amount: number;
//   currency: string;
//   interval: 'month' | 'year';
//   interval_count: number;
//   is_default: boolean;
//   display_name: string;
//   _id: string;
// }

// export interface Features {
//   oracles: { [key: string]: boolean };
//   games: { [key: string]: any };
//   history: { [key: string]: any };
//   content: { [key: string]: boolean };
//   experience: { [key: string]: boolean };
//   game_packs: { [key: string]: any };
//   _id: string;
// }

// export interface StripePackage {
//   id: string;
//   name: string;
//   display_name: string;
//   description: string;
//   short_description: string;
//   type: string;
//   category: string;
//   tier: number;
//   prices: StripePrice[];
//   features: Features;
//   feature_list_for_ui: string[];
//   benefits: string[];
//   limitations: string[];
//   is_popular: boolean;
//   is_featured: boolean;
//   sort_order: number;
//   stripe_product_id: string | null;
//   trial_days: number;
// }

// // --- NEW Interface for Payment Intent Response ---
// export interface PaymentIntentResponse {
//   clientSecret: string;
//   paymentIntentID: string;
//   amount: number;
//   currency: string;
// }

// // =================================================================
// // ZUSTAND STORE
// // =================================================================

// interface StripeState {
//   // --- States for fetching packages ---
//   packages: StripePackage[] | null;
//   isLoading: boolean;
//   error: string | null;
//   fetchStripePackages: () => Promise<void>;

//   // --- States for creating a payment intent ---
//   isCreatingIntent: boolean;
//   intentError: string | null;
//   createPaymentIntent: (
//     packageId: string,
//     priceId: string,
//   ) => Promise<string | null>;
// }

// export const useStripeStore = create<StripeState>(set => ({
//   // --- INITIAL STATE ---
//   packages: null,
//   isLoading: false,
//   error: null,
//   isCreatingIntent: false,
//   intentError: null,

//   // =================================================================
//   // ACTIONS
//   // =================================================================

//   /**
//    * Fetches the available Stripe subscription packages from the server.
//    */
//   fetchStripePackages: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       const token = await AsyncStorage.getItem('x-auth-token');
//       if (!token) throw new Error('Authentication token not found.');
//       const headers = { 'x-auth-token': token };

//       const response = await axios.get(`${API_BASEURL}/stripe/packages`, {
//         headers,
//       });

//       if (response.data?.success) {
//         set({
//           packages: response.data.data as StripePackage[],
//           isLoading: false,
//         });
//       } else {
//         throw new Error(
//           response.data.message || 'Failed to fetch Stripe packages.',
//         );
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         'An unknown error occurred while fetching packages.';

//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Error', errorMessage);
//     }
//   },

//   createPaymentIntent: async (
//     packageId: string,
//     priceId: string,
//   ): Promise<string | null> => {
//     set({ isCreatingIntent: true, intentError: null });
//     try {
//       const token = await AsyncStorage.getItem('x-auth-token');
//       if (!token) throw new Error('Authentication token not found.');

//       const headers = { 'x-auth-token': token };
//       const payload = { packageId, priceId };

//       const response = await axios.post(
//         `${API_BASEURL}/stripe/payment-intent`,
//         payload,
//         { headers },
//       );

//       console.log('Create Payment Intent Response:', response.data);

//       if (response.data?.success && response.data.clientSecret) {
//         set({ isCreatingIntent: false });
//         return response.data.clientSecret;
//       } else {
//         throw new Error(
//           response.data.message ||
//             response.data.error ||
//             'Failed to create payment intent.',
//         );
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         error.message ||
//         'An unknown error occurred during payment setup.';

//       set({ intentError: errorMessage, isCreatingIntent: false });
//       Alert.alert('Payment Error', errorMessage);
//       return null;
//     }
//   },
// }));






import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// INTERFACES
// =================================================================

// --- Interfaces for Stripe Packages ---
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

// --- Interfaces for Purchase History ---
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

// --- NEW: Interfaces for Current Subscription ---
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
  gamePacks: any[]; // You can define a more specific type for gamePacks if needed
}


// =================================================================
// ZUSTAND STORE
// =================================================================

interface StripeState {
  // --- States for fetching packages ---
  packages: StripePackage[] | null;
  isLoading: boolean;
  error: string | null;
  fetchStripePackages: () => Promise<void>;

  // --- States for creating a payment intent ---
  isCreatingIntent: boolean;
  intentError: string | null;
  createPaymentIntent: (
    packageId: string,
    priceId: string,
  ) => Promise<string | null>;

  // --- States for confirming a payment ---
  isConfirmingPayment: boolean;
  confirmationError: string | null;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;

  // --- States for fetching purchase history ---
  purchaseHistory: Purchase[] | null;
  isFetchingHistory: boolean;
  historyError: string | null;
  fetchPurchaseHistory: () => Promise<void>;
  
  // --- NEW: States for fetching current subscription ---
  currentSubscription: CurrentSubscriptionData | null;
  isFetchingSubscription: boolean;
  subscriptionError: string | null;
  fetchCurrentSubscription: () => Promise<void>;
}

export const useStripeStore = create<StripeState>(set => ({
  // --- INITIAL STATE ---
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
  // --- NEW: Initial states for current subscription ---
  currentSubscription: null,
  isFetchingSubscription: false,
  subscriptionError: null,


  // =================================================================
  // ACTIONS
  // =================================================================

  fetchStripePackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
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
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while fetching packages.';

      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  createPaymentIntent: async (
    packageId: string,
    priceId: string,
  ): Promise<string | null> => {
    set({ isCreatingIntent: true, intentError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');

      const headers = { 'x-auth-token': token };
      const payload = { packageId, priceId };

      const response = await axios.post(
        `${API_BASEURL}/stripe/payment-intent`,
        payload,
        { headers },
      );

      if (response.data?.success && response.data.clientSecret) {
        set({ isCreatingIntent: false });
        return response.data.clientSecret;
      } else {
        throw new Error(
          response.data.message ||
            response.data.error ||
            'Failed to create payment intent.',
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred during payment setup.';

      set({ intentError: errorMessage, isCreatingIntent: false });
      Alert.alert('Payment Error', errorMessage);
      return null;
    }
  },

  confirmPayment: async (paymentIntentId: string): Promise<boolean> => {
    set({ isConfirmingPayment: true, confirmationError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');

      const headers = { 'x-auth-token': token };
      const payload = { paymentIntentId };

      const response = await axios.post(
        `${API_BASEURL}/stripe/confirm-payment`,
        payload,
        { headers },
      );

      if (response.data?.success) {
        set({ isConfirmingPayment: false });
        Alert.alert(
          'Success',
          response.data.message || 'Payment confirmed successfully!',
        );
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to confirm payment.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while confirming the payment.';

      set({ confirmationError: errorMessage, isConfirmingPayment: false });
      Alert.alert('Payment Confirmation Failed', errorMessage);
      return false;
    }
  },

  fetchPurchaseHistory: async () => {
    set({ isFetchingHistory: true, historyError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

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
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while fetching your history.';

      set({ historyError: errorMessage, isFetchingHistory: false });
      Alert.alert('Error', errorMessage);
    }
  },
  
  /**
   * NEW: Fetches the user's current subscription details from the server.
   */
  fetchCurrentSubscription: async () => {
    set({ isFetchingSubscription: true, subscriptionError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': token };

      const response = await axios.get(`${API_BASEURL}/stripe/current-subscription`, {
        headers,
      });

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
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while fetching your subscription.';

      set({ subscriptionError: errorMessage, isFetchingSubscription: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));