import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces based on your API responses ---

export interface Interpretation {
  meaning: string;
  story: string;
  guidance: string;
  polarity: string;
}

export interface ThrownOdu {
  odu_id: string;
  odu_name: string;
  mouth_position: 'up' | 'down';
  interpretation: Interpretation;
  _id?: string; // This is present in history/save responses
}

// For the /throw-buzios API response (matching API docs)
export interface OduData {
  name: string;
  number: number;
  meaning: string;
  story: string;
  guidance: string;
  polarity: 'ire' | 'osogbo';
}

export interface BuziosReading {
  odu: OduData;
  shells: {
    total: number;
    mouth_up: number;
    mouth_down: number;
  };
  interpretation: string;
}

export interface ThrowBuziosData {
  reading: BuziosReading;
  can_save?: boolean;
  usage?: {
    daily_limit: number;
    used_today: number;
    remaining: number;
  };
}

// For the /save-buzios-odu-history API response
export interface SaveHistoryData {
  user_id: string;
  user_question: string;
  thrown_odus: ThrownOdu[];
  ai_response: string;
  reading_date: string;
  _id: string;
  history_uid: string;
  createdAt: string;
  updatedAt: string;
}

// For items from the /get-buzios-odu-history API response
export interface BuziosHistoryItem {
  _id: string;
  user_id: string;
  user_question: string;
  thrown_odus: ThrownOdu[];
  mouth_up_count: number;
  mouth_down_count: number;
  overall_polarity: string;
  ai_response: string;
  reading_date: string;
  history_uid: string;
  createdAt: string;
  updatedAt: string;
}

// --- Zustand Store State and Actions ---

interface BuziosState {
  // States for getting a reading
  reading: ThrowBuziosData | null;
  userQuestion: string | null;
  isLoadingReading: boolean;
  readingError: string | null;
  getBuziosReading: (user_question: string) => Promise<ThrowBuziosData | null>;

  // States for saving a reading
  isSaving: boolean;
  savingError: string | null;
  saveBuziosReading: (
    user_question: string,
    reading: BuziosReading,
  ) => Promise<boolean>;

  // States for fetching reading history
  history: BuziosHistoryItem[] | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  getBuziosHistory: (force?: boolean) => Promise<void>;

  historyItem: BuziosHistoryItem | null;
  isLoadingHistoryItem: boolean;
  historyItemError: string | null;
  getBuziosHistoryItem: (history_uid: string) => Promise<void>;
}

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
const retryApiCall = async <T>(
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
 * Zustand store for managing Buzios ODU reading data.
 */
export const useBuziosStore = create<BuziosState>((set, get) => ({
  // --- INITIAL STATE ---
  reading: null,
  userQuestion: null,
  isLoadingReading: false,
  readingError: null,

  isSaving: false,
  savingError: null,

  history: null,
  isLoadingHistory: false,
  historyError: null,
  lastHistoryFetch: null,

  historyItem: null,
  isLoadingHistoryItem: false,
  historyItemError: null,

  // --- ACTIONS ---
  getBuziosReading: async (user_question: string) => {
    set({
      isLoadingReading: true,
      readingError: null,
      reading: null,
      userQuestion: null,
    });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const body = { user_question };
      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.post(
          `${API_BASEURL}/buzios/throw-buzios`,
          body,
          { headers },
        );

        if (response.data?.success && response.data?.data) {
          const readingData: ThrowBuziosData = {
            reading: response.data.data.reading,
            can_save: response.data.data.can_save ?? true,
            usage: response.data.data.usage,
          };
          set({
            reading: readingData,
            userQuestion: user_question,
            isLoadingReading: false,
          });
          return readingData;
        } else {
          throw new Error(
            response.data?.message || 'Failed to get Buzios reading.',
          );
        }
      };

      return await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ readingError: errorMessage, isLoadingReading: false });
      // Don't auto-show Alert - let component handle based on error type
      return null;
    }
  },

  saveBuziosReading: async (user_question: string, reading: BuziosReading) => {
    set({ isSaving: true, savingError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // Construct the body matching API documentation
      const body = {
        user_question: user_question,
        reading: reading,
        odu_data: reading.odu,
      };

      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/buzios/save-buzios-odu-history`,
        body,
        { headers },
      );

      if (response.data?.success) {
        set({ isSaving: false });
        // Invalidate history cache
        set({ lastHistoryFetch: null });
        Alert.alert('Success', 'Reading saved to your history!');
        return true;
      } else {
        throw new Error(
          response.data?.message || 'Failed to save the reading.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ savingError: errorMessage, isSaving: false });
      Alert.alert('Error', errorMessage);
      return false;
    }
  },

  /**
   * Fetches the user's Buzios reading history (with caching).
   */
  getBuziosHistory: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.history &&
      state.lastHistoryFetch &&
      now - state.lastHistoryFetch < HISTORY_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isLoadingHistory) {
      return;
    }

    set({ isLoadingHistory: true, historyError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(
          `${API_BASEURL}/buzios/get-buzios-odu-history`,
          { headers },
        );

        if (response.data?.success && response.data?.data?.readings) {
          set({
            history: response.data.data.readings as BuziosHistoryItem[],
            isLoadingHistory: false,
            lastHistoryFetch: now,
          });
        } else {
          throw new Error(response.data?.message || 'Failed to fetch history.');
        }
      };

      await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isLoadingHistory: false });
      // Only show alert if we don't have cached data
      if (!state.history) {
        Alert.alert('Error', errorMessage);
      }
    }
  },

  getBuziosHistoryItem: async (history_uid: string) => {
    set({
      isLoadingHistoryItem: true,
      historyItemError: null,
      historyItem: null,
    });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': token };

      const fetchData = async () => {
        const response = await axios.get(
          `${API_BASEURL}/buzios/get-buzios-odu-history-by-id/${history_uid}`,
          { headers },
        );

        if (response.data?.success && response.data?.data?.reading) {
          set({
            historyItem: response.data.data.reading as BuziosHistoryItem,
            isLoadingHistoryItem: false,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch history item.',
          );
        }
      };

      await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyItemError: errorMessage, isLoadingHistoryItem: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));
