import { create } from 'zustand';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// INTERFACES (Based on your API screenshot)
// =================================================================

export interface RegisterFcmTokenPayload {
  fcm_token: string;
  platform: 'android' | 'ios' | 'web';
}

export interface FcmTokenResponseData {
    user_id: string;
    platform: string;
    token_registered: boolean;
}

// =================================================================
// ZUSTAND STORE
// =================================================================

interface NotificationState {
  isRegistering: boolean;
  error: string | null;
  isTokenRegistered: boolean;
  registerFcmToken: (token: string) => Promise<boolean>; // Returns true on success
}

export const useNotificationStore = create<NotificationState>((set) => ({
  // --- INITIAL STATE ---
  isRegistering: false,
  error: null,
  isTokenRegistered: false,

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Registers the user's FCM token with the backend server.
   */
  registerFcmToken: async (token: string) => {
    set({ isRegistering: true, error: null });
    try {
      const authToken = await AsyncStorage.getItem('x-auth-token');
      if (!authToken) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': authToken };
      
      const payload: RegisterFcmTokenPayload = {
          fcm_token: token,
          // --- FIX IS HERE ---
          // We cast Platform.OS to the expected type to satisfy TypeScript.
          platform: Platform.OS as 'android' | 'ios' | 'web', 
      };

      const response = await axios.post(
        `${API_BASEURL}/user/fcm-token`,
        payload,
        { headers }
      );

      console.log('FCM Token Registration Response:', response.data);

      if (response.data?.success) {
        set({
          isRegistering: false,
          isTokenRegistered: response.data.data.token_registered,
        });
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to register FCM token.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while registering the token.';
      
      set({ error: errorMessage, isRegistering: false });
     
      console.error("FCM Registration Error:", errorMessage);
      return false;
    }
  },
}));

