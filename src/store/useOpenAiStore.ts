import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import SoundPlayer from 'react-native-sound-player';
import { Buffer } from 'buffer';
import { OPENAI_API_KEY, OPENAI_API_URL } from '@env';
import MD5 from 'crypto-js/md5'; 

interface OpenAiState {
  isLoading: boolean;
  error: string | null;
  generateAndPlaySpeech: (text: string) => Promise<boolean>;
  preloadSpeech: (text: string, id: string) => Promise<string | null>;
}

export const useOpenAiStore = create<OpenAiState>((set) => ({
  isLoading: false,
  error: null,

  generateAndPlaySpeech: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        { model: 'tts-1-hd', input: text, voice: 'alloy' },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
        }
      );
      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      const audioPath = `${RNFS.CachesDirectoryPath}/temp_speech_${Date.now()}.mp3`;
      await RNFS.writeFile(audioPath, base64Audio, 'base64');
      SoundPlayer.playUrl(`file://${audioPath}`);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate speech.';
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Audio Error', errorMessage);
      return false;
    }
  },

  preloadSpeech: async (text: string, id: string) => {
    // --- 2. LAMBE ID KO HASH KAREIN TAA_KE FILENAME CHOTA HO ---
    const hashedId = MD5(id).toString();
    const audioPath = `${RNFS.CachesDirectoryPath}/speech_${hashedId}.mp3`;

    // Check if the file already exists to avoid re-downloading
    const fileExists = await RNFS.exists(audioPath);
    if (fileExists) {
      return audioPath;
    }

    try {
      const response = await axios.post(
        OPENAI_API_URL,
        { model: 'tts-1-hd', input: text, voice: 'fable' },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
        }
      );
      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      await RNFS.writeFile(audioPath, base64Audio, 'base64');
      console.log('Audio preloaded successfully at:', audioPath);
      return audioPath;
    } catch (error: any) {
      console.error(`Failed to preload speech for ID ${id}:`, error.message);
      return null;
    }
  },
}));







// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import RNFS from 'react-native-fs';
// import SoundPlayer from 'react-native-sound-player';
// import { Buffer } from 'buffer';
// import { OPENAI_API_KEY, OPENAI_API_URL } from '@env';

// interface OpenAiState {
//   isLoading: boolean;
//   error: string | null;
//   generateAndPlaySpeech: (text: string) => Promise<boolean>;
//   preloadSpeech: (text: string, id: string) => Promise<string | null>; 
// }



// export const useOpenAiStore = create<OpenAiState>((set) => ({
//   isLoading: false,
//   error: null,

 
//   generateAndPlaySpeech: async (text: string) => {
 
//     set({ isLoading: true, error: null });
//     try {
//       const response = await axios.post(
//        OPENAI_API_URL,
//         { model: 'tts-1-hd', input: text,    voice: 'alloy',  },
//         {
//           headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
//           responseType: 'arraybuffer',
//         }
//       );
//       const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
//       const audioPath = `${RNFS.CachesDirectoryPath}/temp_speech_${Date.now()}.mp3`;
//       await RNFS.writeFile(audioPath, base64Audio, 'base64');
//       SoundPlayer.playUrl(`file://${audioPath}`);
//       set({ isLoading: false });
//       return true;
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate speech.';
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Audio Error', errorMessage);
//       return false;
//     }
//   },

//   /**
//    * --- NEW FUNCTION ---
//    * Preloads speech audio by fetching and saving it to a local file.
//    * Returns the local file path on success.
//    */
//   preloadSpeech: async (text: string, id: string) => {
//     const audioPath = `${RNFS.CachesDirectoryPath}/speech_${id}.mp3`;

//     // Check if the file already exists to avoid re-downloading
//     const fileExists = await RNFS.exists(audioPath);
//     if (fileExists) {
//       return audioPath;
//     }

//     try {
//       const response = await axios.post(
//         OPENAI_API_URL,
//         { model: 'tts-1-hd', input: text, voice: 'fable' },
//         {
//           headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
//           responseType: 'arraybuffer',
//         }
//       );
//       const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
//       await RNFS.writeFile(audioPath, base64Audio, 'base64');
//       console.log('Audio preloaded successfully at:', audioPath);
//       return audioPath;
//     } catch (error: any) {
//       console.error('Failed to preload speech:', error.message);
//       return null;
//     }
//   },
// }));










// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import RNFS from 'react-native-fs';
// import SoundPlayer from 'react-native-sound-player';
// import { Buffer } from 'buffer';

// // =================================================================
// // ZUSTAND STORE
// // =================================================================

// interface OpenAiState {
//   isLoading: boolean;
//   error: string | null;

//   generateAndPlaySpeech: (text: string) => Promise<boolean>;
// }


// const OPENAI_API_KEY = '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';

// export const useOpenAiStore = create<OpenAiState>((set) => ({
//   // --- INITIAL STATE ---
//   isLoading: false,
//   error: null,

//   // =================================================================
//   // ACTION
//   // =================================================================

//   generateAndPlaySpeech: async (text: string) => {
//     set({ isLoading: true, error: null });
//     try {
//       // 1. Call OpenAI API to get the audio data
//       const response = await axios.post(
//         'https://api.openai.com/v1/audio/speech',
//         {
//           // --- FIX 1: Use the High Definition model for better quality ---
//           model: 'tts-1-hd', 
//           input: text,
         
//           // Available options: 'alloy', 'echo', 'fable', 'onyx', 'shimmer', 'nova'
//           voice: 'alloy', 
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${OPENAI_API_KEY}`,
//             'Content-Type': 'application/json',
//           },
//           responseType: 'arraybuffer', 
//         }
//       );

//       // 2. Convert raw audio data to a Base64 string
//       const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      
//       // 3. Define a temporary path to save the audio file
//       const audioPath = `${RNFS.CachesDirectoryPath}/temp_speech.mp3`;

//       // 4. Save the Base64 audio data to the file
//       await RNFS.writeFile(audioPath, base64Audio, 'base64');
      
//       // 5. Play the saved audio file
//       SoundPlayer.playUrl(`file://${audioPath}`);

//       set({ isLoading: false });
//       return true;

//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.error?.message ||
//         error.message ||
//         'Failed to generate speech.';
      
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Audio Error', errorMessage);
//       return false;
//     }
//   },
// // }));












// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import RNFS from 'react-native-fs';
// import SoundPlayer from 'react-native-sound-player';
// import { Buffer } from 'buffer';
// // Step 5.1: Import from @env
// import { OPENAI_API_KEY, OPENAI_API_URL } from '@env';

// interface OpenAiState {
//   isLoading: boolean;
//   error: string | null;
//   generateAndPlaySpeech: (text: string) => Promise<boolean>;
//   preloadSpeech: (text: string, id: string) => Promise<string | null>;
// }

// // Step 5.2: Check if variables are loaded (optional but good practice)
// if (!OPENAI_API_KEY || !OPENAI_API_URL) {
//   console.error("ERROR: OpenAI API Key or URL is not set in .env file.");
//   // You could throw an error here to stop the app from running without config
// }

// export const useOpenAiStore = create<OpenAiState>((set) => ({
//   isLoading: false,
//   error: null,

//   generateAndPlaySpeech: async (text: string) => {
//     set({ isLoading: true, error: null });
//     try {
//       // Step 5.3: Use the imported variables
//       const response = await axios.post(
//         OPENAI_API_URL,
//         { model: 'tts-1-hd', input: text, voice: 'alloy' },
//         {
//           headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
//           responseType: 'arraybuffer',
//         }
//       );
//       const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
//       const audioPath = `${RNFS.CachesDirectoryPath}/temp_speech_${Date.now()}.mp3`;
//       await RNFS.writeFile(audioPath, base64Audio, 'base64');
//       SoundPlayer.playUrl(`file://${audioPath}`);
//       set({ isLoading: false });
//       return true;
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate speech.';
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Audio Error', errorMessage);
//       return false;
//     }
//   },

//   preloadSpeech: async (text: string, id: string) => {
//     const audioPath = `${RNFS.CachesDirectoryPath}/speech_${id}.mp3`;
//     const fileExists = await RNFS.exists(audioPath);
//     if (fileExists) {
//       return audioPath;
//     }

//     try {
//       // Step 5.4: Use the imported variables here as well
//       const response = await axios.post(
//         OPENAI_API_URL,
//         { model: 'tts-1-hd', input: text, voice: 'fable' },
//         {
//           headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
//           responseType: 'arraybuffer',
//         }
//       );
//       const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
//       await RNFS.writeFile(audioPath, base64Audio, 'base64');
//       console.log('Audio preloaded successfully at:', audioPath);
//       return audioPath;
//     } catch (error: any) {
//       console.error('Failed to preload speech:', error.message);
//       return null;
//     }
//   },
// }));