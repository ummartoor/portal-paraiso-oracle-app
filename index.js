// /**
//  * @format
//  */

// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// AppRegistry.registerComponent(appName, () => App);


/**
 * @format
 */

import { AppRegistry } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// ✅ Modular imports
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

// // Background / Quit state handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('📥 Message handled in the background!', remoteMessage);
// });



// Background / Quit state handler (modular API)
const app = getApp();
const messaging = getMessaging(app);

setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('📥 Message handled in the background!', remoteMessage);
});


AppRegistry.registerComponent(appName, () => App);