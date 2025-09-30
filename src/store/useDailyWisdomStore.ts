import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// INTERFACES
// =================================================================

export interface CardImage {
  url: string;
  key: string;
}

// Interface for the full card details
export interface WisdomCard {
  id: string;
  card_uid: string;
  card_name: string;
  card_meaning: string;
  card_description: string;
  card_image: CardImage;
  card_keywords: string[];
}

// Interface for the card object within the history array
export interface WisdomHistoryCard {
    id: string;
    card_name: string;
    card_meaning: string;
    card_image: CardImage;
    card_keywords: string[];
}

// Interface for a single daily card reading
export interface DailyWisdomData {
  card: WisdomCard;
  reading: string;
  card_date: string;
  is_used: boolean;
  used_at: string | null;
  cycle_number: number;
}

// --- NEW INTERFACE ---
// Interface for a single item in the history list
export interface WisdomHistoryItem {
    id: string;
    card: WisdomHistoryCard;
    reading: string;
    card_date: string;
    is_used: boolean;
    used_at: string | null;
    cycle_number: number;
}


// =================================================================
// ZUSTAND STORE (Updated)
// =================================================================

interface DailyWisdomState {
  // --- State for fetching the daily card ---
  wisdomCard: DailyWisdomData | null;
  isLoading: boolean;
  error: string | null;
  getDailyWisdomCard: () => Promise<void>;

  // --- State for marking the card as used ---
  isMarkingAsUsed: boolean;
  markAsUsedError: string | null;
  markCardAsUsed: () => Promise<boolean>;

  // --- State for fetching the history ---
  history: WisdomHistoryItem[] | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  getWisdomHistory: () => Promise<void>;
}

export const useDailyWisdomStore = create<DailyWisdomState>((set, get) => ({
  // --- INITIAL STATE ---
  wisdomCard: null,
  isLoading: false,
  error: null,
  isMarkingAsUsed: false,
  markAsUsedError: null,
  history: null,
  isLoadingHistory: false,
  historyError: null,

  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * Fetches the daily wisdom card from the server.
   */
  getDailyWisdomCard: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };
      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/daily-wisdom-card`,
        { headers }
      );

      if (response.data?.success) {
        set({
          wisdomCard: response.data.data as DailyWisdomData,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to retrieve daily wisdom card.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  /**
   * Marks the current daily wisdom card as used.
   */
  markCardAsUsed: async () => {
    const currentCard = get().wisdomCard;
    if (!currentCard || currentCard.is_used) {
        return false;
    }

    set({ isMarkingAsUsed: true, markAsUsedError: null });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };

        const response = await axios.post(
            `${API_BASEURL}/oracle-chat/daily-wisdom-card/mark-used`,
            {}, 
            { headers }
        );

        if (response.data?.success) {
            set(state => ({
                wisdomCard: state.wisdomCard
                    ? {
                        ...state.wisdomCard,
                        is_used: true,
                        used_at: response.data.data.used_at,
                      }
                    : null,
                isMarkingAsUsed: false,
            }));
            return true;
        } else {
            throw new Error(response.data.message || 'Failed to mark card as used.');
        }

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
        set({ markAsUsedError: errorMessage, isMarkingAsUsed: false });
        Alert.alert('Error', errorMessage);
        return false;
    }
  },

  /**

   * Fetches the history of all daily wisdom cards for the user.
   */
  getWisdomHistory: async () => {
    set({ isLoadingHistory: true, historyError: null });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };

        const response = await axios.get(
            `${API_BASEURL}/oracle-chat/daily-wisdom-card/history`,
            { headers }
        );

        if (response.data?.success) {
            set({
                history: response.data.data.history as WisdomHistoryItem[],
                isLoadingHistory: false,
            });
        } else {
            throw new Error(response.data.message || 'Failed to fetch wisdom history.');
        }
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
        set({ historyError: errorMessage, isLoadingHistory: false });
        Alert.alert('Error', errorMessage);
    }
  },
}));

