import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerData } from '../utils/timerUtils';
import {
  parseApiError,
  getErrorMessageWithContext,
  isCardLimitError,
  isDailyLimitError,
} from '../utils/apiErrorHandler';

// --- Interfaces matching API v2.0 documentation ---

export interface LocalizedString {
  en: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface TarotCard {
  _id: string;
  card_name: LocalizedString;
  card_meaning?: LocalizedString;
  card_keywords?: LocalizedString | string[];
  card_image: string; // URL string from API
  card_number?: number;
  card_suit?: string;
  reversed?: boolean;
  created_at?: string;
}

export interface SelectedCard {
  _id: string;
  card_name: LocalizedString;
  card_meaning?: LocalizedString;
  card_image: string;
  [key: string]: any;
}

export interface ReadingUsage {
  readings_used: number;
  readings_limit: number;
  readings_remaining: number;
  cards_min: number;
  cards_max: number;
  timer?: TimerData;
  show_timer?: boolean;
}

export interface GenerateReadingData {
  reading_id: string;
  user_question: string;
  selected_cards: SelectedCard[];
  reading: string;
  created_at: string;
  usage?: ReadingUsage;
}

export interface TarotReadingHistoryItem {
  _id: string;
  user_question: string;
  selected_cards: SelectedCard[];
  reading: string;
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

export interface ReadingHistoryResponse {
  readings: TarotReadingHistoryItem[];
  pagination: PaginationInfo;
}

interface TarotCardState {
  // State for fetching all cards
  cards: TarotCard[];
  isLoading: boolean;
  error: string | null;
  lastCardsFetch: number | null;
  fetchTarotCards: (force?: boolean) => Promise<void>;

  // State for generating a reading
  readingData: GenerateReadingData | null;
  isReadingLoading: boolean;
  readingError: string | null;
  readingErrorDetails: {
    isPremiumRequired: boolean;
    timer: TimerData | null;
    showTimer: boolean;
    isCardLimitError: boolean;
    minCards?: number;
    maxCards?: number;
    cardsSelected?: number;
  } | null;
  generateReading: (
    card_ids: string[],
    user_question: string,
  ) => Promise<GenerateReadingData | null>;

  // State for saving a reading
  isSavingLoading: boolean;
  savingError: string | null;
  saveReading: (reading_id: string, title: string) => Promise<boolean>;

  // State for selected cards (temporary selection before generating reading)
  selectedCards: TarotCard[];
  setSelectedCards: (cards: TarotCard[]) => void;
  clearSelectedCards: () => void;

  // State for reading history
  history: TarotReadingHistoryItem[];
  pagination: PaginationInfo | null;
  isHistoryLoading: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  fetchReadingHistory: (
    page?: number,
    limit?: number,
    force?: boolean,
  ) => Promise<void>;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('x-auth-token');
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  return token;
};

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

// Cache duration constants (in milliseconds)
const CARDS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (cards rarely change)
const HISTORY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useTarotCardStore = create<TarotCardState>((set, get) => ({
  // Initial state for fetching cards
  cards: [],
  isLoading: false,
  error: null,
  lastCardsFetch: null,

  // Initial state for generating reading
  readingData: null,
  isReadingLoading: false,
  readingError: null,
  readingErrorDetails: null,

  // Initial state for saving reading
  isSavingLoading: false,
  savingError: null,

  // Initial state for selected cards
  selectedCards: [],

  // Initial state for history
  history: [],
  pagination: null,
  isHistoryLoading: false,
  historyError: null,
  lastHistoryFetch: null,

  // --- FETCH ALL TAROT CARDS (with caching) ---
  fetchTarotCards: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
      state.cards.length > 0 &&
      state.lastCardsFetch &&
      now - state.lastCardsFetch < CARDS_CACHE_DURATION
    ) {
      return;
    }

    // Prevent concurrent fetches
    if (state.isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const fetchData = async () => {
        const token = await getAuthToken();
        const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
          headers: { 'x-auth-token': token },
        });

        console.log('📜 [API Response] GET /user/purchase-history:', {
          url: `${API_BASEURL}/user/purchase-history`,
          status: response.status,
          data: response.data,
        });

        if (response.data?.success && response.data?.data?.cards) {
          set({
            cards: response.data.data.cards as TarotCard[],
            isLoading: false,
            lastCardsFetch: now,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch tarot cards.',
          );
        }
      };

      await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      // Only show alert if we don't have cached data
      if (state.cards.length === 0) {
        Alert.alert('Error', errorMessage);
      }
    }
  },

  // --- GENERATE TAROT READING ---
  generateReading: async (card_ids: string[], user_question: string) => {
    set({
      isReadingLoading: true,
      readingError: null,
      readingErrorDetails: null,
      readingData: null,
    });

    try {
      const token = await getAuthToken();

      const response = await axios.post(
        `${API_BASEURL}/tarotcard/select-cards`,
        { user_question, card_ids },
        { headers: { 'x-auth-token': token } },
      );

      console.log('📜 [API Response] POST /tarotcard/select-cards:', {
        url: `${API_BASEURL}/tarotcard/select-cards`,
        status: response.status,
        requestPayload: { user_question, card_ids },
        data: response.data,
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const responseData: GenerateReadingData = {
          reading_id: data.reading_id || '',
          user_question: data.user_question || user_question,
          selected_cards: data.selected_cards || [],
          reading: data.reading || '',
          created_at: data.created_at || new Date().toISOString(),
          usage: data.usage,
        };

        set({
          readingData: responseData,
          isReadingLoading: false,
          readingError: null,
          readingErrorDetails: null,
        });
        return responseData;
      }

      throw new Error(response.data?.message || 'Failed to generate reading.');
    } catch (error: unknown) {
      const errorInfo = getErrorMessageWithContext(error);
      const apiError = parseApiError(error);

      set({
        readingError: errorInfo.message,
        readingErrorDetails: {
          isPremiumRequired: errorInfo.isPremiumRequired,
          timer: errorInfo.timer,
          showTimer: errorInfo.showTimer,
          isCardLimitError: isCardLimitError(error),
          minCards: apiError?.minCardsAllowed,
          maxCards: apiError?.maxCardsAllowed,
          cardsSelected: apiError?.cardsSelected,
        },
        isReadingLoading: false,
      });

      // Don't auto-show Alert - let the component handle it based on error type
      return null;
    }
  },

  // --- SAVE TAROT READING ---
  saveReading: async (reading_id: string, title: string) => {
    set({ isSavingLoading: true, savingError: null });

    try {
      const token = await getAuthToken();
      const { readingData } = get();

      if (!readingData) {
        throw new Error('No reading data found to save.');
      }

      if (!reading_id) {
        throw new Error('Reading ID is required to save.');
      }

      const response = await axios.post(
        `${API_BASEURL}/tarotcard/save-reading`,
        {
          reading_id,
          title,
        },
        { headers: { 'x-auth-token': token } },
      );

      console.log('📜 [API Response] POST /tarotcard/save-reading:', {
        url: `${API_BASEURL}/tarotcard/save-reading`,
        status: response.status,
        requestPayload: { reading_id, title },
        data: response.data,
      });

      if (response.data?.success) {
        set({ isSavingLoading: false });
        // Invalidate history cache to force refresh
        set({ lastHistoryFetch: null });
        Alert.alert('Success', 'Tarot reading saved successfully!');
        return true;
      }

      // Check if upgrade required
      if (response.data?.upgrade_required) {
        throw new Error(
          response.data?.message || 'Upgrade to VIP to save readings',
        );
      }

      throw new Error(response.data?.message || 'Failed to save the reading.');
    } catch (error: unknown) {
      const errorInfo = getErrorMessageWithContext(error);
      set({ savingError: errorInfo.message, isSavingLoading: false });

      // Check if it's an upgrade required error
      if (errorInfo.isPremiumRequired) {
        Alert.alert('Upgrade Required', 'Upgrade to VIP to save readings');
      } else {
        Alert.alert('Error', errorInfo.message);
      }
      return false;
    }
  },

  // --- SET SELECTED CARDS ---
  setSelectedCards: (cards: TarotCard[]) => {
    set({ selectedCards: cards });
  },

  // --- CLEAR SELECTED CARDS ---
  clearSelectedCards: () => {
    set({ selectedCards: [] });
  },

  // --- FETCH READING HISTORY (with caching and pagination) ---
  fetchReadingHistory: async (
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
      state.history.length > 0 &&
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
      const fetchData = async () => {
        const token = await getAuthToken();
        const response = await axios.get(
          `${API_BASEURL}/tarotcard/get-tarot-reading-history?page=${page}&limit=${limit}`,
          { headers: { 'x-auth-token': token } },
        );

        console.log(
          '📜 [API Response] GET /tarotcard/get-tarot-reading-history:',
          {
            url: `${API_BASEURL}/tarotcard/get-tarot-reading-history?page=${page}&limit=${limit}`,
            status: response.status,
            requestPayload: { page, limit },
            data: response.data,
          },
        );

        if (response.data?.success && response.data?.data) {
          const data = response.data.data as ReadingHistoryResponse;
          set({
            history:
              page === 1 ? data.readings : [...state.history, ...data.readings],
            pagination: data.pagination,
            isHistoryLoading: false,
            lastHistoryFetch: now,
          });
        } else {
          throw new Error(
            response.data?.message || 'Failed to fetch reading history.',
          );
        }
      };

      await retryApiCall(fetchData);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isHistoryLoading: false });
      // Only show alert if we don't have cached data
      if (state.history.length === 0) {
        Alert.alert('Error', errorMessage);
      }
    }
  },
}));
