// import { StatusBar, StyleSheet, useColorScheme, View ,Text} from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
// <View><Text>My New Apps</Text></View>
//     </SafeAreaProvider>
//   );
// }

// export default App;

import './src/i18n';



import {

  Alert,
  StyleSheet,
 
} from 'react-native';

import RouteNavigator from './src/navigation/RouteNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import KeyboardVisibilityProvider from './src/components/KeyboardVisiblilityProvider';
import { useNotification } from './src/store/useNotification';
import messaging from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
function App() {

   useNotification();


  

  // useEffect(() => {
  //   // Foreground messages
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('📩 New FCM message!', JSON.stringify(remoteMessage));
  //   });

  //   return unsubscribe;
  // }, []);


    useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    // Foreground messages (modular API)
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      // Alert.alert('📩 New FCM message!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);


  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <KeyboardVisibilityProvider>
          <NavigationContainer>
            <RouteNavigator />
          </NavigationContainer>
      
        </KeyboardVisibilityProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
