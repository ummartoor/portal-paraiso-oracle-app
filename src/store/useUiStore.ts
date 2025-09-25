import { create } from 'zustand';

type UIState = {
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
};

export const useUIStore = create<UIState>(set => ({
  isKeyboardVisible: false,
  setKeyboardVisible: visible => set({ isKeyboardVisible: visible }),
}));
