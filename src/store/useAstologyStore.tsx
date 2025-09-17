import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---

/**
 * Defines the structure of the horoscope object returned by the API.
 */
export interface HoroscopeData {
  morning_vibe: string;
  career_and_work: string;
  love_and_relationship: string;
  money_and_finance: string;
  health_and_wellbeing: string;
  divine_guidance: string;
}

/**
 * Defines the state and actions for the astrology store.
 */
interface AstrologyState {
  horoscope: HoroscopeData | null;
  isLoading: boolean;
  error: string | null;
  createHoroscope: (sign: string, date: string) => Promise<HoroscopeData | null>;
}

/**
 * Zustand store for managing astrology and horoscope data.
 */
export const useAstrologyStore = create<AstrologyState>((set) => ({
  // --- INITIAL STATE ---
  horoscope: null,
  isLoading: false,
  error: null,

  // --- ACTIONS ---

  /**
   * Fetches a horoscope from the API for a given sign and date.
   * @param {string} sign 
   * @param {string} date  
   * @returns {Promise<HoroscopeData | null>} The horoscope data if successful, otherwise null.
   */
  createHoroscope: async (sign: string, date: string) => {
    set({ isLoading: true, error: null, horoscope: null });
    try {
      // 1. Get auth token from storage
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // 2. Prepare request body and headers
      const body = { sign, date };
      const headers = { 'x-auth-token': token };

      // 3. Make the API call
      const response = await axios.post(
        `${API_BASEURL}/horoscope/create-horoscope`,
        body,
        { headers }
      );

      console.log('CREATE HOROSCOPE RESPONSE:', response.data);

      // 4. Handle the response
      if (response.data && response.data.success) {
        const horoscopeData = response.data.horoscope as HoroscopeData;
        set({ horoscope: horoscopeData, isLoading: false });
        return horoscopeData; // Return data on success
      } else {
        throw new Error(response.data.message || 'Failed to fetch horoscope.');
      }

    } catch (error: any) {
      console.log('CREATE HOROSCOPE ERROR:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
      return null; // Return null on failure
    }
  },
}));