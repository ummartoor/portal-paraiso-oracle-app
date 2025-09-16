// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import { API_BASEURL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // --- ADDED ---

// // --- Interfaces ---

// // Interface to define the structure of a single tarot card
// interface TarotCard {
//   _id: string;
//   card_image: {
//     url: string;
//     key: string;
//   };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// }

// // Interface to define the state and actions of the store
// interface TarotCardState {
//   cards: TarotCard[];
//   isLoading: boolean;
//   error: string | null;
//   fetchTarotCards: () => Promise<void>;
// }

// export const useTarotCardStore = create<TarotCardState>((set) => ({
//   cards: [],
//   isLoading: false,
//   error: null,

//   // --- FETCH TAROT CARDS ---
//   fetchTarotCards: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       // --- ADDED: Get token from AsyncStorage ---
//       const token = await AsyncStorage.getItem('x-auth-token');

//       if (!token) {
//         throw new Error('Authentication token not found.');
//       }

//       // --- UPDATED: Add headers to the axios request ---
//       const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
//         headers: {
//           'x-auth-token': token,
//         },
//       });
      
//       console.log('TAROT CARDS RESPONSE:', response.data);

//       if (response.data && response.data.success) {
//         set({ cards: response.data.data, isLoading: false });
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch tarot cards.');
//       }

//     } catch (error: any) {
//       console.log('FETCH TAROT CARDS ERROR:', error.response?.data || error.message);
//       const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Error', errorMessage);
//     }
//   },
// }));













import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---

// Interface for a single card from the initial GET /cards fetch
interface TarotCard {
  _id: string;
  card_image: {
    url: string;
    key: string;
  };
  card_name: string;
  card_description: string;
  card_keywords: string[];
}

// --- NEW: Interfaces for the POST /select-cards response ---

// Interface for the detailed reading text
interface Reading {
    introduction: string;
    love: string;
    career: string;
}

// Interface for a detailed card object returned after selection
interface SelectedCardDetail {
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

// Interface for the 'data' object in the reading response
interface GenerateReadingData {
    user_id: string;
    selected_cards: SelectedCardDetail[];
    reading: Reading;
}


// --- UPDATED: Main store state interface ---
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
  generateReading: (card_ids: string[]) => Promise<GenerateReadingData | null>;
}

export const useTarotCardStore = create<TarotCardState>((set) => ({
  // Initial state for fetching cards
  cards: [],
  isLoading: false,
  error: null,

  // Initial state for generating reading
  readingData: null,
  isReadingLoading: false,
  readingError: null,


  // --- FETCH ALL TAROT CARDS ---
  fetchTarotCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
        headers: { 'x-auth-token': token },
      });
      
      console.log('TAROT CARDS RESPONSE:', response.data);

      if (response.data && response.data.success) {
        set({ cards: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch tarot cards.');
      }

    } catch (error: any) {
      console.log('FETCH TAROT CARDS ERROR:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  // --- NEW: GENERATE TAROT READING ---
  generateReading: async (card_ids: string[]) => {
    set({ isReadingLoading: true, readingError: null, readingData: null });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');

        const body = { card_ids };

        const response = await axios.post(`${API_BASEURL}/tarotcard/select-cards`, body, {
            headers: { 'x-auth-token': token },
        });

        console.log('GENERATE READING RESPONSE:', response.data);

        if (response.data && response.data.success) {
            const responseData = response.data.data as GenerateReadingData;
            set({ readingData: responseData, isReadingLoading: false });
            return responseData; // Return data on success
        } else {
            throw new Error(response.data.message || 'Failed to generate reading.');
        }

    } catch (error: any) {
        console.log('GENERATE READING ERROR:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred while generating the reading.';
        set({ readingError: errorMessage, isReadingLoading: false });
        Alert.alert('Error', errorMessage);
        return null; // Return null on failure
    }
  },
}));