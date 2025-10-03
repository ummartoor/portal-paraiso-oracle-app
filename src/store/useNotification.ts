import { useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

// ✅ Import modular API instead of messaging()
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useFcmStore } from './useFcmStore';

/**
 * Ask user for notification permission
 */
const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Notification permission granted');
          return true;
        } else if (result === PermissionsAndroid.RESULTS.DENIED) {
          console.log('❌ Notification permission denied');
          return false;
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.log('🚫 Notification permission set to never ask again');
          Alert.alert(
            'Permission Needed',
            'Notifications are disabled. Please enable them from Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }
      } catch (err) {
        console.error('❌ Permission request error:', err);
        return false;
      }
    } else {
      // ✅ Android 12 and below → always granted
      return true;
    }
  }
  return true;
};

/**
 * Get the FCM token (modular API)
 */
const getFcmToken = async () => {
  try {
    const app = getApp(); // 👈 use modular app
    const messaging = getMessaging(app);

    const token = await getToken(messaging); // 👈 modular getToken
    if (token) {
      console.log('📲 FCM Token:', token);
      
      return token;
    } else {
      console.log('⚠️ No token received');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get FCM Token:', error);
    return null;
  }
};

/**
 * Hook to initialize notification permission + FCM token
 */
export const useNotification = () => {
  const setFcmToken = useFcmStore(state => state.setFcmToken);

  useEffect(() => {
    const init = async () => {
      const permissionGranted = await requestUserPermission();
      if (permissionGranted) {
        const fcmToken = await getFcmToken();
        if(fcmToken){
          // console.log('got the fcm token',fcmToken)
          setFcmToken(fcmToken)
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
