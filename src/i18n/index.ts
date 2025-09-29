import i18n, { LanguageDetectorModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import pt from './locales/pt.json';

const STORAGE_KEY = 'app_language';


const languageDetector = {
  type: 'languageDetector',
  async: true, 

  detect: (callback: (lang: string) => void) => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(savedLanguage => {
      
        callback(savedLanguage || 'en');
      })
      .catch(() => {
    
        callback('en');
      });
  },

  init: () => {},

  cacheUserLanguage: (language: string) => {
    AsyncStorage.setItem(STORAGE_KEY, language)
      .catch((error) => {
         console.error('Error saving language to AsyncStorage:', error);
      });
  },
} as unknown as LanguageDetectorModule; 

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;

