import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,

  login: async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    set({ isLoggedIn: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    set({ isLoggedIn: false });
  },

  checkAuthStatus: async () => {
    const status = await AsyncStorage.getItem('isLoggedIn');
    set({ isLoggedIn: status === 'true' });
  },
}));
