import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces matching API documentation ---
export interface HoroscopeDetails {
  overview: string;
  love: string;
  career: string;
  health: string;
  finance: string;
}

export interface HoroscopeData {
  horoscope: HoroscopeDetails;
  depth?: string;
  can_save?: boolean;
  usage?: {
    daily_limit: number;
    used_today: number;
    remaining: number;
  };
}

export interface HoroscopeHistoryItem {
  _id: string;
  user_id: string;
  user_question: string;
  sign: string;
  date: string;
  horoscope: HoroscopeDetails;
  createdAt: string;
  updatedAt: string;
}

interface AstrologyState {
  horoscope: HoroscopeData | null;
  userQuestion: string | null;
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
    horoscope: HoroscopeDetails,
    user_question: string,
  ) => Promise<boolean>;

  horoscopeHistory: HoroscopeHistoryItem[] | null;
  isHistoryLoading: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  getHoroscopeHistory: (force?: boolean) => Promise<void>;
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

// Retry helper for critical API calls
const retryApiCall = async <T,>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 500,
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

// Cache duration constants
const HISTORY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Zustand store for managing astrology and horoscope data.
 */
export const useAstrologyStore = create<AstrologyState>((set, get) => ({
  // Initial State
  horoscope: null,
  userQuestion: null,
  isLoading: false,
  error: null,
  isSaving: false,
  errorSaving: null,
  horoscopeHistory: null,
  isHistoryLoading: false,
  historyError: null,
  lastHistoryFetch: null,

  /**
   * Fetches a horoscope from the API for a given sign and date.
   */
  createHoroscope: async (
    sign: string,
    date: string,
    user_question: string,
  ) => {
    set({ isLoading: true, error: null, horoscope: null, userQuestion: null });
    try {
      const token = await getAuthToken();
      const body = { sign, date, user_question };
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.post(
          `${API_BASEURL}/horoscope/create-horoscope`,
          body,
          { headers },
        );

        if (response.data?.success && response.data?.data) {
          const horoscopeData: HoroscopeData = {
            horoscope: response.data.data.horoscope as HoroscopeDetails,
            depth: response.data.data.depth,
            can_save: response.data.data.can_save ?? true,
            usage: response.data.data.usage,
          };

          set({
            horoscope: horoscopeData,
            userQuestion: user_question,
            isLoading: false,
          });
          return horoscopeData;
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch horoscope.',
          );
        }
      };

      return await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      // Don't auto-show Alert - let component handle based on error type
      return null;
    }
  },

  /**
   * Saves a horoscope to the user's history.
   */
  saveHoroscope: async (
    sign: string,
    date: string,
    horoscope: HoroscopeDetails,
    user_question: string,
  ) => {
    set({ isSaving: true, errorSaving: null });
    try {
      const token = await getAuthToken();

      const body = {
        sign,
        date,
        user_question,
        horoscope,
      };

      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/horoscope/save-horoscope`,
        body,
        { headers },
      );

      if (response.data?.success) {
        set({ isSaving: false });
        // Invalidate history cache
        set({ lastHistoryFetch: null });
        Alert.alert('Success', 'Horoscope saved successfully!');
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to save horoscope.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ errorSaving: errorMessage, isSaving: false });
      Alert.alert('Error', errorMessage);
      return false;
    }
  },

  /**
   * Fetches the horoscope history for the user (with caching).
   */
  getHoroscopeHistory: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.horoscopeHistory &&
      state.lastHistoryFetch &&
      now - state.lastHistoryFetch < HISTORY_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isHistoryLoading) {
      return;
    }

    set({ isHistoryLoading: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(
          `${API_BASEURL}/horoscope/get-horoscope-history`,
          { headers },
        );

        if (response.data?.success && response.data?.data?.horoscopes) {
          set({
            horoscopeHistory: response.data.data
              .horoscopes as HoroscopeHistoryItem[],
            isHistoryLoading: false,
            lastHistoryFetch: now,
          });
        } else {
          throw new Error(response.data?.message || 'Failed to fetch history.');
        }
      };

      await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isHistoryLoading: false });
      // Only show alert if we don't have cached data
      if (!state.horoscopeHistory) {
        Alert.alert('Error', errorMessage);
      }
    }
  },
}));
