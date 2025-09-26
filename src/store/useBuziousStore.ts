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

// For the /throw-buzios API response
export interface BuziosThrowResult {
  total_odus_thrown: number;
  mouth_up_count: number;
  mouth_down_count: number;
  overall_polarity: string;
  thrown_odus_details: ThrownOdu[];
}

export interface ThrowBuziosData {
  reading_id: string;
  user_question: string;
  buzios_result: BuziosThrowResult;
  ai_reading: string;
  reading_date: string;
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
  isLoadingReading: boolean;
  readingError: string | null;
  getBuziosReading: (user_question: string) => Promise<ThrowBuziosData | null>;

  // States for saving a reading
  isSaving: boolean;
  savingError: string | null;
  saveBuziosReading: (
    readingData: ThrowBuziosData,
  ) => Promise<boolean>;

  // States for fetching reading history
  history: BuziosHistoryItem[] | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  getBuziosHistory: () => Promise<void>;

    historyItem: BuziosHistoryItem | null;
  isLoadingHistoryItem: boolean;
  historyItemError: string | null;
  getBuziosHistoryItem: (history_uid: string) => Promise<void>;
}

/**
 * Zustand store for managing Buzios ODU reading data.
 */
export const useBuziosStore = create<BuziosState>(set => ({
  // --- INITIAL STATE ---
  reading: null,
  isLoadingReading: false,
  readingError: null,

  isSaving: false,
  savingError: null,

  history: null,
  isLoadingHistory: false,
  historyError: null,


   historyItem: null,
  isLoadingHistoryItem: false,
  historyItemError: null,
  // --- ACTIONS ---

 
  getBuziosReading: async (user_question: string) => {
    set({ isLoadingReading: true, readingError: null, reading: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const body = { user_question };
      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/buzios/throw-buzios`,
        body,
        { headers },
      );

      console.log('GET BUZIOS READING RESPONSE:', response.data);

      if (response.data && response.data.success) {
        const readingData = response.data.data as ThrowBuziosData;
        set({ reading: readingData, isLoadingReading: false });
        return readingData;
      } else {
        throw new Error(response.data.message || 'Failed to get Buzios reading.');
      }
    } catch (error: any) {
      console.log(
        'GET BUZIOS READING ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred.';
      set({ readingError: errorMessage, isLoadingReading: false });
      Alert.alert('Error', errorMessage);
      return null;
    }
  },

  
  saveBuziosReading: async (readingData) => {
    set({ isSaving: true, savingError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      // Construct the body from the reading data
      const body = {
        user_question: readingData.user_question,
        ai_response: readingData.ai_reading,
        reading_date: readingData.reading_date,
        thrown_odus: readingData.buzios_result.thrown_odus_details,
      };

      const headers = { 'x-auth-token': token };

      const response = await axios.post(
        `${API_BASEURL}/buzios/save-buzios-odu-history`,
        body,
        { headers },
      );

      console.log('SAVE BUZIOS READING RESPONSE:', response.data);

      if (response.data && response.data.success) {
        set({ isSaving: false });
        Alert.alert('Success', 'Reading saved to your history!');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to save the reading.');
      }
    } catch (error: any) {
      console.log(
        'SAVE BUZIOS READING ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        'An unknown error occurred while saving.';
      set({ savingError: errorMessage, isSaving: false });
      Alert.alert('Error', errorMessage);
      return false;
    }
  },

  /**
   * Fetches the user's Buzios reading history.
   */
  getBuziosHistory: async () => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/buzios/get-buzios-odu-history`,
        { headers },
      );

      console.log('GET BUZIOS HISTORY RESPONSE:', response.data);

      if (response.data && response.data.success) {
        set({
          history: response.data.data as BuziosHistoryItem[],
          isLoadingHistory: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch history.');
      }
    } catch (error: any) {
      console.log(
        'GET BUZIOS HISTORY ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unknown error occurred while fetching history.';
      set({ historyError: errorMessage, isLoadingHistory: false });
      Alert.alert('Error', errorMessage);
    }
  },

 
  getBuziosHistoryItem: async (_id: string) => {
    set({ isLoadingHistoryItem: true, historyItemError: null, historyItem: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/buzios/get-buzios-odu-history-by-id/${_id}`, 
        { headers },
      );

      console.log('GET SINGLE BUZIOS HISTORY ITEM RESPONSE:', response.data);

      if (response.data && response.data.success) {
        set({
          historyItem: response.data.data as BuziosHistoryItem,
          isLoadingHistoryItem: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch history item.');
      }
    } catch (error: any) {
      console.log(
        'GET SINGLE BUZIOS HISTORY ITEM ERROR:',
        error.response?.data || error.message,
      );
      const errorMessage =
        error.response?.data?.message ||
        'An unknown error occurred while fetching the history item.';
      set({ historyItemError: errorMessage, isLoadingHistoryItem: false });
      Alert.alert('Error', errorMessage);
    }
  },
}));
