/**
 * PrimaryButton Component
 * Standardized button component matching BuySubscriptionScreen style
 * Used throughout the app for consistent button appearance
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import GradientBox from './GradientBox';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { Buttons, Colors } from '../constants/design';
import Pressable from './Pressable';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'disabled';
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticType?: 'light' | 'medium' | 'heavy';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  hapticType = 'medium',
}) => {
  const colors = useThemeStore(s => s.theme.colors);
  const isDisabled = disabled || loading;

  if (variant === 'disabled' || isDisabled) {
    return (
      <TouchableOpacity
        style={[Buttons.primary, Buttons.disabled, style]}
        disabled={true}
        activeOpacity={1}
      >
        <Text style={[Buttons.primaryText, Buttons.disabledText, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hapticType={hapticType}
      haptic={!isDisabled}
      style={[Buttons.primary, { borderColor: Colors.primary }, style]}
    >
      <GradientBox
        colors={[colors.black, colors.bgBox]}
        style={styles.gradientWrapper}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={[styles.buttonText, { color: Colors.white }, textStyle]}>
            {title}
          </Text>
        )}
      </GradientBox>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    color: Colors.white,
  },
});

export default PrimaryButton;
