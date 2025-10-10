import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// INTERFACES (Updated)
// =================================================================

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

// --- NEW Interface for Payment Intent Response ---
export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentID: string;
    amount: number;
    currency: string;
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
  createPaymentIntent: (packageId: string, priceId: string) => Promise<string | null>;


  isConfirmingPayment: boolean;
  confirmError: string | null;
  confirmStripePayment: (paymentIntentId: string, paymentMethod: string) => Promise<boolean>; 

}

export const useStripeStore = create<StripeState>((set) => ({
  // --- INITIAL STATE ---
  packages: null,
  isLoading: false,
  error: null,
  isCreatingIntent: false,
  intentError: null,


    isConfirmingPayment: false, // ✅ NEW
  confirmError: null,
  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Fetches the available Stripe subscription packages from the server.
   */
  fetchStripePackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/stripe/packages`,
        { headers }
      );

      if (response.data?.success) {
        set({
          packages: response.data.data as StripePackage[],
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch Stripe packages.');
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

 
 createPaymentIntent: async (packageId: string, priceId: string): Promise<string | null> => {
      set({ isCreatingIntent: true, intentError: null });
      try {
          const token = await AsyncStorage.getItem('x-auth-token');
          if (!token) throw new Error('Authentication token not found.');

          const headers = { 'x-auth-token': token };
          const payload = { packageId, priceId };

          const response = await axios.post(
              `${API_BASEURL}/stripe/payment-intent`,
              payload,
              { headers }
          );

   
          console.log('Create Payment Intent Response:', response.data);

          if (response.data?.success && response.data.clientSecret) {
              set({ isCreatingIntent: false });
              return response.data.clientSecret;
          } else {
           
              throw new Error(response.data.message || response.data.error || 'Failed to create payment intent.');
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

//confirm payment screen
    confirmStripePayment: async (paymentIntentId: string, paymentMethod: string): Promise<boolean> => {
    set({ isConfirmingPayment: true, confirmError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');

      const headers = { 'x-auth-token': token };
      const payload = { 
        paymentIntentId: paymentIntentId, 
        paymentMethod: paymentMethod 
      };

      const response = await axios.post(
        `${API_BASEURL}/stripe/confirm-payment`,
        payload,
        { headers }
      );

      console.log(response)
      if (response.data?.success) {
        set({ isConfirmingPayment: false });
        return true; // Payment was successful
      } else {
        throw new Error(response.data.message || 'Failed to confirm payment.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while confirming the payment.';
      
      set({ confirmError: errorMessage, isConfirmingPayment: false });
      Alert.alert('Confirmation Error', errorMessage);
      return false; // Payment failed
    }
  },

}));

