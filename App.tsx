import React, { useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

import './src/i18n';
import RouteNavigator from './src/navigation/RouteNavigator';
import KeyboardVisibilityProvider from './src/components/KeyboardVisiblilityProvider';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useNotification } from './src/store/useNotification';

function App() {
  useNotification();

  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    // Foreground messages (modular API)
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      // Handle foreground messages here if needed
      // Currently empty as per original implementation
    });

    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        urlScheme="portalparaiso"
      >
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.container}>
            <KeyboardVisibilityProvider>
              <NavigationContainer>
                <RouteNavigator />
              </NavigationContainer>
              <Toast />
            </KeyboardVisibilityProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
