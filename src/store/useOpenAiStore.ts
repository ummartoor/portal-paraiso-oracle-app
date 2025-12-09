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

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to generate speech.'
    );
  }
  return error instanceof Error ? error.message : 'Failed to generate speech.';
};

export const useOpenAiStore = create<OpenAiState>(set => ({
  isLoading: false,
  error: null,

  generateAndPlaySpeech: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        { model: 'tts-1-hd', input: text, voice: 'alloy' },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        },
      );

      const base64Audio = Buffer.from(response.data, 'binary').toString(
        'base64',
      );
      const audioPath = `${
        RNFS.CachesDirectoryPath
      }/temp_speech_${Date.now()}.mp3`;
      await RNFS.writeFile(audioPath, base64Audio, 'base64');
      SoundPlayer.playUrl(`file://${audioPath}`);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      Alert.alert('Audio Error', errorMessage);
      return false;
    }
  },

  preloadSpeech: async (text: string, id: string) => {
    // Hash the ID to create a shorter filename
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
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        },
      );

      const base64Audio = Buffer.from(response.data, 'binary').toString(
        'base64',
      );
      await RNFS.writeFile(audioPath, base64Audio, 'base64');
      return audioPath;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(`Failed to preload speech for ID ${id}:`, errorMessage);
      return null;
    }
  },
}));
