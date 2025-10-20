import { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useNotificationStore } from './useNotificationStore';

/**
 * Asks the user for notification permissions on both iOS and Android.
 */
const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ iOS Notification permission granted');
        return true;
      }
      console.log('❌ iOS Notification permission denied');
      return false;
    } catch (error) {
      console.error('❌ iOS Permission request error:', error);
      return false;
    }
  } else if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result === 'granted') {
           console.log('✅ Android Notification permission granted');
          return true;
        }
        return false;
      } catch (err) {
        console.error('❌ Android Permission request error:', err);
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * Gets the FCM token.
 */
const getFcmToken = async (): Promise<string | null> => {
  try {
    // The explicit call to registerDeviceForRemoteMessages() is no longer needed
    // as it's handled automatically by the library unless disabled.
    const token = await messaging().getToken();

    if (token) {
      console.log('📲 FCM Token:', token);
      return token;
    } else {
      console.log('⚠️ No FCM token received');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get FCM Token:', error);
    console.error(error); // Log the full error object for more detail
    return null;
  }
};

/**
 * Custom hook to initialize notification permissions and register the FCM token.
 */
export const useNotification = () => {
  const { registerFcmToken } = useNotificationStore();

  useEffect(() => {
    const init = async () => {
      // Check if user is logged in before trying to register token
      const authToken = await AsyncStorage.getItem('x-auth-token');
      if (!authToken) {
        console.log("User not logged in, skipping FCM token registration.");
        return;
      }

      const permissionGranted = await requestUserPermission();
      if (permissionGranted) {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          const storedToken = await AsyncStorage.getItem('fcm_token');
          if (storedToken !== fcmToken) {
            console.log('Registering new FCM token with the server...');
            const success = await registerFcmToken(fcmToken);
            if (success) {
              await AsyncStorage.setItem('fcm_token', fcmToken);
              console.log('✅ FCM token registered and stored.');
            }
          } else {
            console.log('FCM token is already registered.');
          }
        }
      }
    };

    init();
  }, []);
};






// import { useEffect } from 'react';
// import { PermissionsAndroid, Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';

// const requestUserPermission = async () => {
//   if (Platform.OS === 'android' ) {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//     );

//     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//       console.log('✅ Notification permission granted');
//       return true;
//     } else {
//       console.log('❌ Notification permission denied');
//       return false;
//     }
//   }
//   // For Android 12 and below, always true
//   return true;
// };

// const getFcmToken = async () => {
//   try {
//     const token = await messaging().getToken();
//     if (token) {
//       console.log('📲 FCM Token:', token);
//       return token;
//     } else {
//       console.log('⚠️ No token received');
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ Failed to get FCM Token:', error);
//     return null;
//   }
// };

// export const useNotification = () => {
//   useEffect(() => {
//     const init = async () => {
//       const permissionGranted = await requestUserPermission();
//       if (permissionGranted) {
//         await getFcmToken();
//       }
//     };

//     getFcmToken()

//     init();
//   }, []);
// };

// import { useEffect } from 'react';
// import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
// import messaging from '@react-native-firebase/messaging';

// /**
//  * Ask user for notification permission
//  * - Android 13+ → system popup
//  * - Android 12 and below → always true (no runtime popup exists)
//  */
// const requestUserPermission = async () => {
//   if (Platform.OS === 'android') {
//     if (Platform.Version >= 33) {
//       try {
//         const result = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//         );

//         if (result === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log('✅ Notification permission granted');
//           return true;
//         } else if (result === PermissionsAndroid.RESULTS.DENIED) {
//           console.log('❌ Notification permission denied');
//           return false;
//         } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//           console.log('🚫 Notification permission set to never ask again');
//           Alert.alert(
//             'Permission Needed',
//             'Notifications are disabled. Please enable them from Settings.',
//             [
//               { text: 'Cancel', style: 'cancel' },
//               {
//                 text: 'Open Settings',
//                 onPress: () => Linking.openSettings(),
//               },
//             ]
//           );
//           return false;
//         }
//       } catch (err) {
//         console.error('❌ Permission request error:', err);
//         return false;
//       }
//     } else {
//       // ✅ Android 12 and below → always granted
//       return true;
//     }
//   }
//   return true;
// };

// /**
//  * Get the FCM token for push notifications
//  */
// const getFcmToken = async () => {
//   try {
//     const token = await messaging().getToken();
//     if (token) {
//       console.log('📲 FCM Token:', token);
//       return token;
//     } else {
//       console.log('⚠️ No token received');
//       return null;
//     }
//   } catch (error) {
//     console.error('❌ Failed to get FCM Token:', error);
//     return null;
//   }
// };

// /**
//  * Hook to initialize notification permission + FCM token
//  */
// export const useNotification = () => {
//   useEffect(() => {
//     const init = async () => {
//       const permissionGranted = await requestUserPermission();
//       if (permissionGranted) {
//         await getFcmToken();
//       }
//     };

//     init();
//   }, []);
// };
