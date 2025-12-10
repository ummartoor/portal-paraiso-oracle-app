import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces matching API documentation ---

export interface LocalizedString {
  en: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface TarotCard {
  _id: string;
  card_image: {
    url: string;
    key: string;
  };
  card_name: LocalizedString | string; // API returns localized or string
  card_meaning?: LocalizedString | string;
  card_description?: string;
  card_keywords: string[];
}

export interface Reading {
  reading: string; // API returns single reading string
}

export interface SelectedCardDetail {
  card_id: string;
  name: string;
  description: string;
  meaning: string;
  keywords: string[];
  image: {
    url: string;
    key: string;
  };
}

export interface GenerateReadingData {
  reading: string;
  selected_cards: SelectedCardDetail[];
  can_save?: boolean;
  usage?: {
    daily_limit: number;
    used_today: number;
    remaining: number;
  };
}

export interface FullReading {
  reading: string;
}

export interface TarotReadingHistoryItem {
  _id: string;
  user_id: string;
  user_question: string;
  card_ids: string[];
  selected_cards: SelectedCardDetail[];
  reading: string;
  reading_date: string;
  createdAt: string;
  updatedAt: string;
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
  userQuestion: string | null;
  selectedCardIds: string[];
  generateReading: (
    card_ids: string[],
    user_question: string,
  ) => Promise<GenerateReadingData | null>;

  // State for saving a reading
  isSavingLoading: boolean;
  savingError: string | null;
  saveReading: () => Promise<boolean>;

  // State for selected cards (temporary selection before generating reading)
  selectedCards: TarotCard[];
  setSelectedCards: (cards: TarotCard[]) => void;
  clearSelectedCards: () => void;

  // State for reading history
  history: TarotReadingHistoryItem[];
  isHistoryLoading: boolean;
  historyError: string | null;
  lastHistoryFetch: number | null;
  fetchReadingHistory: (force?: boolean) => Promise<void>;
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
  userQuestion: null,
  selectedCardIds: [],

  // Initial state for saving reading
  isSavingLoading: false,
  savingError: null,

  // Initial state for selected cards
  selectedCards: [],

  // Initial state for history
  history: [],
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
      readingData: null,
      userQuestion: null,
      selectedCardIds: [],
    });

    try {
      const token = await getAuthToken();

      const response = await axios.post(
        `${API_BASEURL}/tarotcard/select-cards`,
        { user_question, card_ids },
        { headers: { 'x-auth-token': token } },
      );

      if (response.data?.success && response.data?.data) {
        const responseData: GenerateReadingData = {
          reading: response.data.data.reading || '',
          selected_cards: response.data.data.selected_cards || [],
          can_save: response.data.data.can_save ?? true,
          usage: response.data.data.usage,
        };

        set({
          readingData: responseData,
          userQuestion: user_question,
          selectedCardIds: card_ids,
          isReadingLoading: false,
        });
        return responseData;
      }

      throw new Error(response.data?.message || 'Failed to generate reading.');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ readingError: errorMessage, isReadingLoading: false });
      // Don't auto-show Alert - let the component handle it based on error type
      return null;
    }
  },

  // --- SAVE TAROT READING ---
  saveReading: async () => {
    set({ isSavingLoading: true, savingError: null });

    try {
      const token = await getAuthToken();
      const { readingData, userQuestion, selectedCardIds } = get();

      if (!readingData?.selected_cards || !readingData?.reading) {
        throw new Error('No complete reading data found to save.');
      }

      if (!userQuestion) {
        throw new Error('No user question found to save.');
      }

      const response = await axios.post(
        `${API_BASEURL}/tarotcard/save-reading`,
        {
          user_question: userQuestion,
          card_ids:
            selectedCardIds.length > 0
              ? selectedCardIds
              : readingData.selected_cards.map(c => c.card_id),
          selected_cards: readingData.selected_cards,
          reading: readingData.reading,
        },
        { headers: { 'x-auth-token': token } },
      );

      if (response.data?.success) {
        set({ isSavingLoading: false });
        // Invalidate history cache to force refresh
        set({ lastHistoryFetch: null });
        Alert.alert('Success', 'Tarot reading saved successfully!');
        return true;
      }

      throw new Error(response.data?.message || 'Failed to save the reading.');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ savingError: errorMessage, isSavingLoading: false });
      Alert.alert('Error', errorMessage);
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

  // --- FETCH READING HISTORY (with caching) ---
  fetchReadingHistory: async (force: boolean = false) => {
    const state = get();
    const now = Date.now();

    // Check cache if not forcing refresh
    if (
      !force &&
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
          `${API_BASEURL}/tarotcard/get-tarot-reading-history`,
          { headers: { 'x-auth-token': token } },
        );

        if (response.data?.success && response.data?.data?.readings) {
          set({
            history: response.data.data.readings as TarotReadingHistoryItem[],
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
