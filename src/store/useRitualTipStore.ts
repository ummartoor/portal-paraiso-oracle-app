import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// INTERFACES (Based on your API responses)
// =================================================================

export interface RitualImage {
  url: string;
  key: string;
}

export interface RitualTip {
  id: string;
  ritual_day: string;
  ritual_name: string;
  ritual_description: string;
  ritual_image: RitualImage;
}

// For the main daily ritual data
export interface DailyRitualData {
  ritual_tip: RitualTip;
  ai_response: string;
  tip_date: string;
  is_used: boolean;
  used_at: string | null;
  cycle_number: number;
}

// For a single item in the history list
export interface RitualHistoryItem {
  id: string;
  ritual_tip: RitualTip;
  ai_response: string;
  tip_date: string;
  is_used: boolean;
  used_at: string | null;
  cycle_number: number;
}

// =================================================================
// ZUSTAND STORE
// =================================================================

interface RitualTipState {
  // --- State for the daily ritual tip ---
  ritualTip: DailyRitualData | null;
  isLoading: boolean;
  error: string | null;
  getDailyRitualTip: () => Promise<void>;

  // --- State for marking the tip as used ---
  isMarkingAsUsed: boolean;
  markAsUsedError: string | null;
  markRitualTipAsUsed: () => Promise<boolean>;

  // --- State for fetching the history ---
  history: RitualHistoryItem[] | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  getRitualTipHistory: () => Promise<void>;
}

export const useRitualTipStore = create<RitualTipState>((set, get) => ({
  // --- INITIAL STATE ---
  ritualTip: null,
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
   * API 1: Fetches the daily ritual tip from the server.
   */
  getDailyRitualTip: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/daily-ritual-tip`,
        { headers },
      );
      console.log('📜 [API Response] GET /oracle-chat/daily-ritual-tip:', {
        url: `${API_BASEURL}/oracle-chat/daily-ritual-tip`,
        status: response.status,
        data: response.data,
      });
      if (response.data?.success) {
        set({
          ritualTip: response.data.data as DailyRitualData,
          isLoading: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to retrieve daily ritual tip.',
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  /**
   * API 2: Marks the current daily ritual tip as used.
   */
  markRitualTipAsUsed: async () => {
    const currentTip = get().ritualTip;
    if (!currentTip || currentTip.is_used) {
      return false;
    }

    set({ isMarkingAsUsed: true, markAsUsedError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };

      // NOTE: The endpoint in your screenshot shows a 404. I am assuming the correct one is /mark-used
      const response = await axios.post(
        `${API_BASEURL}/oracle-chat/daily-ritual-tip/mark-used`,
        {},
        { headers },
      );
      console.log(
        '📜 [API Response] POST /oracle-chat/daily-ritual-tip/mark-used:',
        {
          url: `${API_BASEURL}/oracle-chat/daily-ritual-tip/mark-used`,
          status: response.status,
          data: response.data,
        },
      );
      if (response.data?.success) {
        set(state => ({
          ritualTip: state.ritualTip
            ? {
                ...state.ritualTip,
                is_used: true,
                used_at: response.data.data.used_at,
              }
            : null,
          isMarkingAsUsed: false,
        }));
        return true;
      } else {
        throw new Error(
          response.data.message || 'Failed to mark ritual as used.',
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'No daily ritual tip found for today';
      set({ markAsUsedError: errorMessage, isMarkingAsUsed: false });
      // Alert.alert('Error', errorMessage);
      console.warn(
        'Silent Error: Could not mark ritual as used.',
        errorMessage,
      );
      return false;
    }
  },

  /**
   * API 3: Fetches the history of all daily ritual tips.
   */
  getRitualTipHistory: async () => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/daily-ritual-tip/history`,
        { headers },
      );

      console.log(
        '📜 [API Response] GET /oracle-chat/daily-ritual-tip/history:',
        {
          url: `${API_BASEURL}/oracle-chat/daily-ritual-tip/history`,
          status: response.status,
          data: response.data,
        },
      );

      if (response.data?.success) {
        set({
          history: response.data.data.history as RitualHistoryItem[],
          isLoadingHistory: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch ritual history.',
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred.';
      set({ historyError: errorMessage, isLoadingHistory: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));
