import React, { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useUIStore } from '../store/useUiStore';

interface KeyboardVisibilityProviderProps {
  children: React.ReactNode;
}

const KeyboardVisibilityProvider: React.FC<KeyboardVisibilityProviderProps> = ({
  children,
}) => {
  const setKeyboardVisible = useUIStore(state => state.setKeyboardVisible);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      // Added delay to avoid flicker
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setKeyboardVisible(false);
        timeoutRef.current = null;
      }, 100);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setKeyboardVisible]);

  return <>{children}</>;
};

export default KeyboardVisibilityProvider;
