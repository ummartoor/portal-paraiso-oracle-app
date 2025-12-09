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
      error.message ||
      'An unknown error occurred.'
    );
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
};

/**
 * Zustand store for managing astrology and horoscope data.
 */
export const useAstrologyStore = create<AstrologyState>((set, get) => ({
  // Initial State
  horoscope: null,
  isLoading: false,
  error: null,
  isSaving: false,
  errorSaving: null,
  horoscopeHistory: null,
  isHistoryLoading: false,
  historyError: null,

  /**
   * Fetches a horoscope from the API for a given sign and date.
   */
  createHoroscope: async (
    sign: string,
    date: string,
    user_question: string,
  ) => {
    set({ isLoading: true, error: null, horoscope: null });
    try {
      const token = await getAuthToken();
      const body = { sign, date, user_question };
      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/horoscope/create-horoscope`,
        body,
        { headers },
      );

      if (response.data?.success) {
        const horoscopeData: HoroscopeData = {
          data: response.data.horoscope as HoroscopeDetails,
          message: response.data.message,
          success: response.data.success,
        };

        set({ horoscope: horoscopeData, isLoading: false });
        return horoscopeData;
      } else {
        throw new Error(response.data.message || 'Failed to fetch horoscope.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
      return null;
    }
  },

  /**
   * Saves a horoscope to the user's history.
   */
  saveHoroscope: async (
    sign: string,
    date: string,
    horoscopeData: HoroscopeData,
    user_question: string,
  ) => {
    set({ isSaving: true, errorSaving: null });
    try {
      const token = await getAuthToken();

      const body = {
        sign,
        date,
        user_question,
        ...horoscopeData.data,
      };

      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/horoscope/save-horoscope`,
        body,
        { headers },
      );

      if (response.data?.success) {
        set({ isSaving: false });
        Alert.alert('Success', 'Horoscope saved successfully!');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to save horoscope.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ errorSaving: errorMessage, isSaving: false });
      Alert.alert('Error', errorMessage);
      return false;
    }
  },

  /**
   * Fetches the horoscope history for the user.
   */
  getHoroscopeHistory: async () => {
    set({ isHistoryLoading: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/horoscope/get-horoscope-history`,
        { headers },
      );

      if (response.data?.success) {
        set({
          horoscopeHistory: response.data.data as HoroscopeHistoryItem[],
          isHistoryLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch history.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isHistoryLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));
