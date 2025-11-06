import { useCallback } from 'react';

import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';


export const useHaptic = () => {

  const trigger = useCallback((

    type: HapticFeedbackTypes = HapticFeedbackTypes.impactMedium
  ) => {
    
    const options = {
      enableVibrateFallback: true, 
      ignoreAndroidSystemSettings: true
    };

   
    ReactNativeHapticFeedback.trigger(type, options);
  }, []);

  return { trigger };
};