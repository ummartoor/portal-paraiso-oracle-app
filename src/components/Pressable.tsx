/**
 * Enhanced Pressable Component
 * Provides consistent haptic feedback and smooth animations across the app
 */
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

interface PressableProps extends TouchableOpacityProps {
  haptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  scaleOnPress?: boolean;
  children: React.ReactNode;
}

const Pressable: React.FC<PressableProps> = ({
  haptic = true,
  hapticType = 'light',
  scaleOnPress = true,
  children,
  style,
  onPress,
  activeOpacity = 0.8,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (scaleOnPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (scaleOnPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  };

  const handlePress = (e: any) => {
    if (haptic) {
      try {
        switch (hapticType) {
          case 'light':
            ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
            break;
          case 'medium':
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
            break;
          case 'heavy':
            ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
            break;
          case 'success':
            ReactNativeHapticFeedback.trigger(
              'notificationSuccess',
              hapticOptions,
            );
            break;
          case 'warning':
            ReactNativeHapticFeedback.trigger(
              'notificationWarning',
              hapticOptions,
            );
            break;
          case 'error':
            ReactNativeHapticFeedback.trigger(
              'notificationError',
              hapticOptions,
            );
            break;
        }
      } catch (error) {
        // Haptic feedback not available, continue without it
      }
    }
    onPress?.(e);
  };

  const animatedStyle = scaleOnPress
    ? {
        transform: [{ scale: scaleAnim }],
      }
    : {};

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        {...props}
        style={style}
        activeOpacity={activeOpacity}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Pressable;
