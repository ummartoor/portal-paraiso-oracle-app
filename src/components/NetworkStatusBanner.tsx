import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { useTranslation } from 'react-i18next';

/**
 * Network status banner that appears at the top when offline
 */
export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const { colors } = useThemeStore(state => state.theme);
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: colors.primary,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.bannerText, { color: colors.white }]}>
        {t('errors.connection_lost')}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NetworkStatusBanner;
