import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
} from 'react-native';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useStripeStore } from '../store/useStripeStore';
import { Fonts } from '../constants/fonts';

const RouteNavigator: React.FC = () => {
  const { isLoggedIn, checkAuthStatus } = useAuthStore();
  const { fetchCurrentSubscription } = useStripeStore();
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeStore(s => s.theme);

  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
      setLoading(false);
    };
    init();
  }, [checkAuthStatus]);

  // Refresh subscription status on app launch after login is confirmed
  // (webhook may have processed payments while app was closed)
  useEffect(() => {
    if (!loading && isLoggedIn) {
      // Small delay to ensure auth is fully initialized
      const timer = setTimeout(() => {
        fetchCurrentSubscription(true).catch(err => {
          if (__DEV__) {
            console.warn('Failed to refresh subscription on app launch:', err);
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, isLoggedIn, fetchCurrentSubscription]);

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/images/backgroundImage.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Portal Paraiso
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
};

export default RouteNavigator;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
    letterSpacing: 1,
  },
});
