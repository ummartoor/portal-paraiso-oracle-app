import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerData } from '../utils/timerUtils';
import {
  parseApiError,
  getErrorMessageWithContext,
  isDailyLimitError,
} from '../utils/apiErrorHandler';

// --- Interfaces matching API v2.0 documentation ---

export interface LocalizedString {
  en: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface ShellPosition {
  position: 'up' | 'down';
}

export interface ShellsSummary {
  mouth_up_count: number;
  mouth_down_count: number;
}

export interface OduInterpretation {
  meaning: string;
  story: string;
  guidance: string;
  polarity: string;
}

export interface Odu {
  number: number;
  name: LocalizedString;
  polarity: 'ire' | 'osogbo';
  polarity_label: LocalizedString;
  interpretation: OduInterpretation;
}

export interface BuziosReadingUsage {
  readings_used: number;
  readings_limit: number;
  readings_remaining: number;
  timer?: TimerData;
  show_timer?: boolean;
}

export interface ThrowBuziosData {
  reading_id: string;
  user_question: string;
  shells: ShellPosition[];
  shells_summary: ShellsSummary;
  odu: Odu;
  created_at: string;
  usage?: BuziosReadingUsage;
}

// For items from the /get-buzios-odu-history API response
export interface BuziosHistoryItem {
  _id: string;
  user_question: string;
  shells: ShellPosition[];
  shells_summary?: ShellsSummary;
  odu: Odu;
  created_at: string;
  saved?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BuziosHistoryResponse {
  readings: BuziosHistoryItem[];
  pagination: PaginationInfo;
}

// --- Zustand Store State and Actions ---

interface BuziosState {
  // States for getting a reading
  reading: ThrowBuziosData | null;
  isLoadingReading: boolean;
  readingError: string | null;
  readingErrorDetails: {
    isPremiumRequired: boolean;
    timer: TimerData | null;
    showTimer: boolean;
  } | null;
  getBuziosReading: (user_question: string) => Promise<ThrowBuziosData | null>;

  // States for saving a reading
  isSaving: boolean;
  savingError: string | null;
  saveBuziosReading: (reading_id: string, title: string) => Promise<boolean>;

  // States for fetching reading history
  history: BuziosHistoryItem[] | null;
  pagination: PaginationInfo | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  getBuziosHistory: (
    page?: number,
    limit?: number,
    force?: boolean,
  ) => Promise<void>;

  historyItem: BuziosHistoryItem | null;
  isLoadingHistoryItem: boolean;
  historyItemError: string | null;
  getBuziosHistoryItem: (id: string) => Promise<void>;
}

// Helper function to extract error message (kept for backward compatibility)
const getErrorMessage = (error: unknown): string => {
  const errorInfo = getErrorMessageWithContext(error);
  return errorInfo.message;
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
  isLoadingReading: false,
  readingError: null,
  readingErrorDetails: null,

  isSaving: false,
  savingError: null,

  history: null,
  pagination: null,
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
      readingErrorDetails: null,
      reading: null,
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
          const data = response.data.data;
          const readingData: ThrowBuziosData = {
            reading_id: data.reading_id || '',
            user_question: data.user_question || user_question,
            shells: data.shells || [],
            shells_summary: data.shells_summary || {
              mouth_up_count: 0,
              mouth_down_count: 0,
            },
            odu: data.odu,
            created_at: data.created_at || new Date().toISOString(),
            usage: data.usage,
          };
          set({
            reading: readingData,
            isLoadingReading: false,
            readingError: null,
            readingErrorDetails: null,
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
      const errorInfo = getErrorMessageWithContext(error);
      set({
        readingError: errorInfo.message,
        readingErrorDetails: {
          isPremiumRequired: errorInfo.isPremiumRequired,
          timer: errorInfo.timer,
          showTimer: errorInfo.showTimer,
        },
        isLoadingReading: false,
      });
      // Don't auto-show Alert - let component handle based on error type
      return null;
    }
  },

  saveBuziosReading: async (reading_id: string, title: string) => {
    set({ isSaving: true, savingError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const body = {
        reading_id,
        title,
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
        Alert.alert('Success', 'Buzios reading saved successfully!');
        return true;
      } else {
        throw new Error(
          response.data?.message || 'Failed to save the reading.',
        );
      }
    } catch (error: unknown) {
      const errorInfo = getErrorMessageWithContext(error);
      set({ savingError: errorInfo.message, isSaving: false });
      Alert.alert('Error', errorInfo.message);
      return false;
    }
  },

  /**
   * Fetches the user's Buzios reading history (with caching and pagination).
   */
  getBuziosHistory: async (
    page: number = 1,
    limit: number = 20,
    force: boolean = false,
  ) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh and fetching first page
    if (
      !force &&
      page === 1 &&
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
          `${API_BASEURL}/buzios/get-buzios-odu-history?page=${page}&limit=${limit}`,
          { headers },
        );

        console.log('📜 buzios/get-buzios-odu-history', {
          url: `${API_BASEURL}/buzios/get-buzios-odu-history`,
          status: response.status,
          data: response.data,
        });

        if (response.data?.success && response.data?.data) {
          const data = response.data.data as BuziosHistoryResponse;
          set({
            history:
              page === 1
                ? data.readings
                : [...(state.history || []), ...data.readings],
            pagination: data.pagination,
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

  getBuziosHistoryItem: async (id: string) => {
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
          `${API_BASEURL}/buzios/get-buzios-odu-history-by-id/${id}`,
          { headers },
        );

        console.log(
          '📜 [API Response] GET /buzios/get-buzios-odu-history-by-id/:id:',
          {
            url: `${API_BASEURL}/buzios/get-buzios-odu-history-by-id/${id}`,
            status: response.status,
            data: response.data,
          },
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
