// components/KeyboardVisibilityProvider.tsx
import React, { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useUIStore } from '../store/useUiStore';



const KeyboardVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const setKeyboardVisible = useUIStore(state => state.setKeyboardVisible);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      // Added delay to avoid flicker
      setTimeout(() => {
        setKeyboardVisible(false);
      }, 100); // 👈 adjust delay (ms) as needed (150–250ms is usually good)
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return <>{children}</>;
};

export default KeyboardVisibilityProvider;