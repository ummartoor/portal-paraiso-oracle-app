import { create } from 'zustand';

type FcmState = {
  fcmToken: string | null;
  setFcmToken: (token: string) => void;
  clearFcmToken: () => void;
};

export const useFcmStore = create<FcmState>((set) => ({
  fcmToken: null,
  setFcmToken: (token) => set({ fcmToken: token }),
  clearFcmToken: () => set({ fcmToken: null }),
}));
