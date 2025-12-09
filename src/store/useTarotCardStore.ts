import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---

export interface TarotCard {
  _id: string;
  card_image: {
    url: string;
    key: string;
  };
  card_name: string;
  card_description: string;
  card_keywords: string[];
}

export interface Reading {
  introduction: string;
  love: string;
  career: string;
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
  user_id: string;
  selected_cards: SelectedCardDetail[];
  reading: Reading;
}

export interface FullReading {
  introduction: string;
  love: string;
  career: string;
  spirituality: string;
  reflection: string;
  guidance: string;
  affirmation: string;
}

export interface TarotReadingHistoryItem {
  _id: string;
  user_id: string;
  user_question: string;
  selected_cards: SelectedCardDetail[];
  reading: FullReading;
  reading_date: string;
  createdAt: string;
  updatedAt: string;
}

interface TarotCardState {
  // State for fetching all cards
  cards: TarotCard[];
  isLoading: boolean;
  error: string | null;
  fetchTarotCards: () => Promise<void>;

  // State for generating a reading
  readingData: GenerateReadingData | null;
  isReadingLoading: boolean;
  readingError: string | null;
  userQuestion: string | null;
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
  fetchReadingHistory: () => Promise<void>;
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

export const useTarotCardStore = create<TarotCardState>((set, get) => ({
  // Initial state for fetching cards
  cards: [],
  isLoading: false,
  error: null,

  // Initial state for generating reading
  readingData: null,
  isReadingLoading: false,
  readingError: null,
  userQuestion: null,

  // Initial state for saving reading
  isSavingLoading: false,
  savingError: null,

  // Initial state for selected cards
  selectedCards: [],

  // Initial state for history
  history: [],
  isHistoryLoading: false,
  historyError: null,

  // --- FETCH ALL TAROT CARDS ---
  fetchTarotCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await getAuthToken();

      const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
        headers: { 'x-auth-token': token },
      });

      if (response.data?.success) {
        set({ cards: response.data.data, isLoading: false });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch tarot cards.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  // --- GENERATE TAROT READING ---
  generateReading: async (card_ids: string[], user_question: string) => {
    set({
      isReadingLoading: true,
      readingError: null,
      readingData: null,
      userQuestion: null,
    });

    try {
      const token = await getAuthToken();

      const response = await axios.post(
        `${API_BASEURL}/tarotcard/select-cards`,
        { user_question, card_ids },
        { headers: { 'x-auth-token': token } },
      );

      if (response.data?.success) {
        const responseData = response.data.data as GenerateReadingData;
        set({
          readingData: responseData,
          userQuestion: user_question,
          isReadingLoading: false,
        });
        return responseData;
      }

      throw new Error(response.data.message || 'Failed to generate reading.');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ readingError: errorMessage, isReadingLoading: false });
      Alert.alert('Error', errorMessage);
      return null;
    }
  },

  // --- SAVE TAROT READING ---
  saveReading: async () => {
    set({ isSavingLoading: true, savingError: null });

    try {
      const token = await getAuthToken();
      const { readingData, userQuestion } = get();

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
          selected_cards: readingData.selected_cards,
          reading: readingData.reading,
        },
        { headers: { 'x-auth-token': token } },
      );

      if (response.data?.success) {
        set({ isSavingLoading: false });
        Alert.alert('Success', 'Tarot reading saved successfully!');
        return true;
      }

      throw new Error(response.data.message || 'Failed to save the reading.');
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

  // --- FETCH READING HISTORY ---
  fetchReadingHistory: async () => {
    set({ isHistoryLoading: true, historyError: null });

    try {
      const token = await getAuthToken();

      const response = await axios.get(
        `${API_BASEURL}/tarotcard/get-tarot-reading-history`,
        { headers: { 'x-auth-token': token } },
      );

      if (response.data?.success) {
        set({ history: response.data.data, isHistoryLoading: false });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch reading history.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isHistoryLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));
