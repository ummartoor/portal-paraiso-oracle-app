import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---

export interface HoroscopeDetails {
  morning_vibe: string;
  career_and_work: string;
  love_and_relationship: string;
  money_and_finance: string;
  health_and_wellbeing: string;
  divine_guidance: string;
}

export interface HoroscopeData {
  data: HoroscopeDetails;
  message: string;
  success: boolean;
}

export interface HoroscopeHistoryItem extends HoroscopeDetails {
    _id: string;
    user_id: string;
    user_question: string;
    sign: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}
interface AstrologyState {
  horoscope: HoroscopeData | null;
  isLoading: boolean;
  error: string | null;
  createHoroscope: (
    sign: string,
    date: string,
    user_question: string,
  ) => Promise<HoroscopeData | null>;

  isSaving: boolean;
  errorSaving: string | null;
  saveHoroscope: (
    sign: string,
    date: string,
    horoscopeData: HoroscopeData,
    user_question: string,
  ) => Promise<boolean>;

   horoscopeHistory: HoroscopeHistoryItem[] | null;
  isHistoryLoading: boolean;
  historyError: string | null;
  getHoroscopeHistory: () => Promise<void>;
}

/**
 * Zustand store for managing astrology and horoscope data.
 */
export const useAstrologyStore = create<AstrologyState>(set => ({
  // --- INITIAL STATE ---
  horoscope: null,
  isLoading: false,
  error: null,
  isSaving: false, // <-- ADD THIS
  errorSaving: null, // <-- ADD THIS

    // <-- NEW: Initial state for history
  horoscopeHistory: null,
  isHistoryLoading: false,
  historyError: null,
  // --- ACTIONS ---

  /**
   * Fetches a horoscope from the API for a given sign and date.
   * @param {string} sign
   * @param {string} date
   * @returns {Promise<HoroscopeData | null>} 
   */
  createHoroscope: async (
    sign: string,
    date: string,
    user_question: string,
  ) => {
    set({ isLoading: true, error: null, horoscope: null });
    try {
      // 1. Get auth token from storage
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // 2. Prepare request body and headers
      const body = { sign, date, user_question };
      const headers = { 'x-auth-token': token };

      // 3. Make the API call
      const response = await axios.post(
        `${API_BASEURL}/horoscope/create-horoscope`,
        body,
        { headers },
      );

      console.log('CREATE HOROSCOPE RESPONSE:', response.data);

      // 4. Handle the response
      if (response.data && response.data.success) {
        const horoscopeData = response.data.horoscope as HoroscopeData;
        set({ horoscope: horoscopeData, isLoading: false });
        return horoscopeData; 
      } else {
        throw new Error(response.data.message || 'Failed to fetch horoscope.');
      }
    } catch (error: any) {
      console.log(
        'CREATE HOROSCOPE ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
      return null; 
    }
  },
  // Add this function inside your create() block

  saveHoroscope: async (sign, date, horoscopeData, user_question) => {
    set({ isSaving: true, errorSaving: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const body = {
        sign,
        date,
        user_question,
        ...horoscopeData.data
      };

      const headers = { 'x-auth-token': token };

      // 3. Make the API call to save the horoscope
      const response = await axios.post(
        `${API_BASEURL}/horoscope/save-horoscope`,
        body,
        { headers },
      );

      console.log('SAVE HOROSCOPE RESPONSE:', response.data);

      // 4. Handle the response
      if (response.data && response.data.success) {
        set({ isSaving: false });
        Alert.alert('Success', 'Horoscope saved successfully!');
        return true; 
      } else {
        throw new Error(response.data.message || 'Failed to save horoscope.');
      }
    } catch (error: any) {
      console.log(
        'SAVE HOROSCOPE ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        'An unknown error occurred while saving.';
      set({ errorSaving: errorMessage, isSaving: false });
      Alert.alert('Error', errorMessage);
      return false; 
    }
  },

  // <-- NEW: Function to get horoscope history
  getHoroscopeHistory: async () => {
      set({ isHistoryLoading: true, historyError: null });
      try {
          // 1. Get auth token
          const token = await AsyncStorage.getItem('x-auth-token');
          if (!token) {
              throw new Error('Authentication token not found.');
          }

          const headers = { 'x-auth-token': token };

          // 2. Make GET request
          const response = await axios.get(
              `${API_BASEURL}/horoscope/get-horoscope-history`,
              { headers }
          );

          console.log('GET HOROSCOPE HISTORY RESPONSE:', response.data);

          // 3. Handle response
          if (response.data && response.data.success) {
              set({
                  horoscopeHistory: response.data.data as HoroscopeHistoryItem[],
                  isHistoryLoading: false
              });
          } else {
              throw new Error(response.data.message || 'Failed to fetch history.');
          }

      } catch (error: any) {
          console.log(
              'GET HOROSCOPE HISTORY ERROR:',
              error.response?.data || error.message
          );
          const errorMessage =
              error.response?.data?.message ||
              error.message ||
              'An unknown error occurred while fetching history.';
          set({ historyError: errorMessage, isHistoryLoading: false });
          Alert.alert('Error', errorMessage);
      }
  },
}));
