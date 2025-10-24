// import { useEffect, useRef } from 'react';
// import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
// const adUnitId = __DEV__
//   ? TestIds.INTERSTITIAL
//   : 'ca-app-pub-5848037568204765~5705361668'; 
// export const useInterstitialAd = () => {
//   const interstitialRef = useRef<InterstitialAd | null>(null);
//   useEffect(() => {
//     const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//       requestNonPersonalizedAdsOnly: true,
//     });
//     interstitial.load();
//     interstitialRef.current = interstitial;
//     const unsubscribe = interstitial.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         interstitial.load(); // preload next ad when closed
//       }
//     );
//     return () => unsubscribe();
//   }, []);
//   const showAd = () => {
//     if (interstitialRef.current?.loaded) {
//       interstitialRef.current.show();
//     }
//   };
//   return { showAd };
// };









// import { useEffect, useRef } from 'react';
// import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
// import { Platform } from 'react-native'; // 1. Import Platform

// // --- PASTE YOUR REAL AD UNIT IDS HERE ---
// // Get these from your AdMob dashboard (NOT from app.json)
// const androidAdUnitId = 'ca-app-pub-5848037568204765~5705361668'; // <-- REPLACE THIS
// const iosAdUnitId = 'ca-app-pub-5848037568204765~9172967418';     // <-- REPLACE THIS
// // ----------------------------------------

// // 2. This logic now selects the correct ID for development, iOS, or Android
// const adUnitId = __DEV__
//   ? TestIds.INTERSTITIAL // Always use test IDs in development
//   : Platform.OS === 'ios'
//   ? iosAdUnitId         // Your real iOS Ad Unit ID
//   : androidAdUnitId;      // Your real Android Ad Unit ID

// export const useInterstitialAd = () => {
//   const interstitialRef = useRef<InterstitialAd | null>(null);

//   useEffect(() => {
//     const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//       requestNonPersonalizedAdsOnly: true,
//     });
//     interstitial.load();
//     interstitialRef.current = interstitial;

//     const unsubscribe = interstitial.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         interstitial.load(); // Preload next ad when closed
//       }
//     );

//     // Clean up the listener when the hook unmounts
//     return () => unsubscribe();
//   }, []);

//   const showAd = () => {
//     if (interstitialRef.current?.loaded) {
//       interstitialRef.current.show();
//     } else {
//       console.log('Ad not loaded yet');
//     }
//   };

//   return { showAd };
// };




// --- PASTE THIS ENTIRE CODE INTO useInterstitialAd.ts ---

import { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// --- PASTE YOUR REAL AD UNIT IDS HERE (with the '/') ---
const androidAdUnitId = 'ca-app-pub-5848037568204765~5705361668'; // <-- REPLACE THIS
const iosAdUnitId = 'ca-app-pub-5848037568204765~9172967418';     // <-- REPLACE THIS
// -----------------------------------------------------

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
  ? iosAdUnitId
  : androidAdUnitId;

export const useInterstitialAd = () => {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  // Ref to store the callback function
  const onAdClosedCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitial.load();
    interstitialRef.current = interstitial;

    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // When ad closes:
        // 1. Run the stored callback (if it exists)
        if (onAdClosedCallbackRef.current) {
          onAdClosedCallbackRef.current();
          onAdClosedCallbackRef.current = null; // Clear it after use
        }
        // 2. Preload the next ad
        interstitial.load();
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * This is the updated function that accepts an 'onAdClosed' callback
   */
  const showAd = (onAdClosed?: () => void) => {
    if (interstitialRef.current?.loaded) {
      // Store the callback to be run when the 'CLOSED' event fires
      onAdClosedCallbackRef.current = onAdClosed || null;
      interstitialRef.current.show();
    } else {
      // Ad not loaded, so we can't show it.
      // Run the callback immediately so the user's action (like saving) is not blocked.
      console.log('Ad not loaded. Running action immediately.');
      if (onAdClosed) {
        onAdClosed();
      }
    }
  };

  // This is the function that had the syntax error (now fixed)
  const isAdLoaded = () => { // <-- Fixed: Added '=>'
    return interstitialRef.current?.loaded || false;
  };

  return { showAd, isAdLoaded };
};