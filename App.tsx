
// import './src/i18n';



// import {

//   Alert,
//   StyleSheet,
 
// } from 'react-native';

// import RouteNavigator from './src/navigation/RouteNavigator';
// import { NavigationContainer } from '@react-navigation/native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import KeyboardVisibilityProvider from './src/components/KeyboardVisiblilityProvider';
// import { useNotification } from './src/store/useNotification';
// import messaging from '@react-native-firebase/messaging';
// import { getApp } from '@react-native-firebase/app';
// import { getMessaging, onMessage } from '@react-native-firebase/messaging';
// import { useEffect } from 'react';
// function App() {

//    useNotification();


  

//   // useEffect(() => {
//   //   // Foreground messages
//   //   const unsubscribe = messaging().onMessage(async remoteMessage => {
//   //     Alert.alert('📩 New FCM message!', JSON.stringify(remoteMessage));
//   //   });

//   //   return unsubscribe;
//   // }, []);


//     useEffect(() => {
//     const app = getApp();
//     const messaging = getMessaging(app);

//     // Foreground messages (modular API)
//     const unsubscribe = onMessage(messaging, async remoteMessage => {
//       // Alert.alert('📩 New FCM message!', JSON.stringify(remoteMessage));
//     });

//     return unsubscribe;
//   }, []);


//   return (
//     <SafeAreaProvider>
//       <GestureHandlerRootView>
//         <KeyboardVisibilityProvider>
//           <NavigationContainer>
//             <RouteNavigator />
//           </NavigationContainer>
      
//         </KeyboardVisibilityProvider>
//       </GestureHandlerRootView>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;


// 1. Import StripeProvider at the top

import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import './src/i18n';
import {
  StyleSheet,
} from 'react-native';
import RouteNavigator from './src/navigation/RouteNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import KeyboardVisibilityProvider from './src/components/KeyboardVisiblilityProvider';
import { useNotification } from './src/store/useNotification';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
function App() {
  useNotification();

  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);
    // Foreground messages (modular API)
    const unsubscribe = onMessage(messaging, async remoteMessage => {
  
    });
    return unsubscribe;
  }, []);

  return (
    // 2. Wrap your entire application with StripeProvider
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
          </KeyboardVisibilityProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
          <Toast />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;