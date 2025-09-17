
import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---

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

interface Reading {
    introduction: string;
    love: string;
    career: string;
}

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

  // --- NEW: State for saving a reading ---
  isSavingLoading: boolean;
  savingError: string | null;
  saveReading: () => Promise<boolean>; // Returns true on success, false on failure
    // --- ADD THESE NEW LINES ---
    selectedCards: any[]; // Use 'any[]' for simplicity, or your DeckCard[] type
    setSelectedCards: (cards: any[]) => void;
    clearSelectedCards: () => void;
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

  // --- NEW: Initial state for saving reading ---
  isSavingLoading: false,
  savingError: null,
   selectedCards: [],
    setSelectedCards: (cards) => set({ selectedCards: cards }),
    clearSelectedCards: () => set({ selectedCards: [] }),
  // --- FETCH ALL TAROT CARDS ---
  fetchTarotCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
        headers: { 'x-auth-token': token },
      });
      
      if (response.data && response.data.success) {
        set({ cards: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch tarot cards.');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Error', errorMessage);
    }
  },

  // --- GENERATE TAROT READING ---
  generateReading: async (card_ids: string[]) => {
    set({ isReadingLoading: true, readingError: null });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');

        const body = { card_ids };
        const response = await axios.post(`${API_BASEURL}/tarotcard/select-cards`, body, {
            headers: { 'x-auth-token': token },
        });

        if (response.data && response.data.success) {
            const responseData = response.data.data as GenerateReadingData;
            set({ readingData: responseData, isReadingLoading: false });
            return responseData;
        } else {
            throw new Error(response.data.message || 'Failed to generate reading.');
        }

    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred while generating the reading.';
        set({ readingError: errorMessage, isReadingLoading: false });
        Alert.alert('Error', errorMessage);
        return null;
    }
  },

  // --- NEW: SAVE TAROT READING ---
  saveReading: async () => {
    set({ isSavingLoading: true, savingError: null });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');

        // The request body is empty as per the screenshot
        const response = await axios.post(`${API_BASEURL}/tarotcard/save-reading`, {}, {
            headers: { 'x-auth-token': token },
        });

        if (response.data && response.data.success) {
            set({ isSavingLoading: false });
            Alert.alert('Success', 'Tarot reading saved successfully!');
            return true; // Indicate success
        } else {
            throw new Error(response.data.message || 'Failed to save the reading.');
        }

    } catch (error: any) {
        console.log('SAVE READING ERROR:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred while saving the reading.';
        set({ savingError: errorMessage, isSavingLoading: false });
        Alert.alert('Error', errorMessage);
        return false; // Indicate failure
    }
  },
}));












// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import { API_BASEURL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // --- Interfaces ---

// // Interface for a single card from the initial GET /cards fetch
// interface TarotCard {
//   _id: string;
//   card_image: {
//     url: string;
//     key: string;
//   };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// }

// // --- NEW: Interfaces for the POST /select-cards response ---

// // Interface for the detailed reading text
// interface Reading {
//     introduction: string;
//     love: string;
//     career: string;
// }

// // Interface for a detailed card object returned after selection
// interface SelectedCardDetail {
//     card_id: string;
//     name: string;
//     description: string;
//     meaning: string;
//     keywords: string[];
//     image: {
//         url: string;
//         key: string;
//     };
// }

// // Interface for the 'data' object in the reading response
// interface GenerateReadingData {
//     user_id: string;
//     selected_cards: SelectedCardDetail[];
//     reading: Reading;
// }


// // --- UPDATED: Main store state interface ---
// interface TarotCardState {
//   // State for fetching all cards
//   cards: TarotCard[];
//   isLoading: boolean;
//   error: string | null;
//   fetchTarotCards: () => Promise<void>;

//   // State for generating a reading
//   readingData: GenerateReadingData | null;
//   isReadingLoading: boolean;
//   readingError: string | null;
//   generateReading: (card_ids: string[]) => Promise<GenerateReadingData | null>;
// }

// export const useTarotCardStore = create<TarotCardState>((set) => ({
//   // Initial state for fetching cards
//   cards: [],
//   isLoading: false,
//   error: null,

//   // Initial state for generating reading
//   readingData: null,
//   isReadingLoading: false,
//   readingError: null,


//   // --- FETCH ALL TAROT CARDS ---
//   fetchTarotCards: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       const token = await AsyncStorage.getItem('x-auth-token');
//       if (!token) throw new Error('Authentication token not found.');

//       const response = await axios.get(`${API_BASEURL}/tarotcard/cards`, {
//         headers: { 'x-auth-token': token },
//       });
//       
//       console.log('TAROT CARDS RESPONSE:', response.data);

//       if (response.data && response.data.success) {
//         set({ cards: response.data.data, isLoading: false });
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch tarot cards.');
//       }

//     } catch (error: any) {
//       console.log('FETCH TAROT CARDS ERROR:', error.response?.data || error.message);
//       const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Error', errorMessage);
//     }
//   },

//   // --- NEW: GENERATE TAROT READING ---
//   generateReading: async (card_ids: string[]) => {
//     set({ isReadingLoading: true, readingError: null, readingData: null });
//     try {
//         const token = await AsyncStorage.getItem('x-auth-token');
//         if (!token) throw new Error('Authentication token not found.');

//         const body = { card_ids };

//         const response = await axios.post(`${API_BASEURL}/tarotcard/select-cards`, body, {
//             headers: { 'x-auth-token': token },
//         });

//         console.log('GENERATE READING RESPONSE:', response.data);

//         if (response.data && response.data.success) {
//             const responseData = response.data.data as GenerateReadingData;
//             set({ readingData: responseData, isReadingLoading: false });
//             return responseData; // Return data on success
//         } else {
//             throw new Error(response.data.message || 'Failed to generate reading.');
//         }

//     } catch (error: any) {
//         console.log('GENERATE READING ERROR:', error.response?.data || error.message);
//         const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred while generating the reading.';
//         set({ readingError: errorMessage, isReadingLoading: false });
//         Alert.alert('Error', errorMessage);
//         return null; // Return null on failure
//     }
//   },
// }));