// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   TextInput,
//   KeyboardAvoidingView,
//   ScrollView,
//   Image,
//   Dimensions,
// } from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';

// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// import GradientBox from '../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const VideoPlayerScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<any>();



//   return (
//     <ImageBackground
//       source={require('../../../assets/images/backgroundImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//            Video Player
//             </Text>
//           </View>
//         </View>



    
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default VideoPlayerScreen;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//   },

//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { width: 22, height: 22, tintColor: '#fff' },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },

//   scrollInner: {
//     paddingBottom: 20,
//   },

// });






import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Video from 'react-native-video';
import { Image } from 'react-native';

import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type VideoPlayerRouteParams = {
  videoID: string | number;
  videoSRC: any;
};

type VideoPlayerScreenRouteProp = RouteProp<
  { VideoPlayerScreen: VideoPlayerRouteParams },
  'VideoPlayerScreen'
>;

const VideoPlayerScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const { t } = useTranslation();
  const { videoID, videoSRC } = route.params;

  if (!videoSRC) {
    return (
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <Text style={{ color: 'white' }}>Video Not Found</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* VIDEO SECTION */}
      <View style={styles.videoWrapper}>
        <Video
          source={videoSRC}
          style={styles.videoPlayer}
          resizeMode="contain"
          controls={true}      // ⭐ Important — enables pause/play/seek
          paused={false}
        />
      </View>

      {/* HEADER ON TOP */}
      <SafeAreaView style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../assets/icons/backIcon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.white }]}>
        {t('video_player')}
          </Text>
        </View>
      </SafeAreaView>

    </ImageBackground>
  );
};

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  videoWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,   // Push video below header
  },

  videoPlayer: {
    width: '100%',
    height: '100%',
  },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingHorizontal: 20,
  },

header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20, paddingHorizontal: 20, zIndex: 10, }, backBtn: { position: 'absolute', left: 20, height: 40, width: 40, justifyContent: 'center', alignItems: 'center', zIndex: 11, }, backIcon: { width: 22, height: 22, tintColor: '#fff' }, headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize', },
});

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   Dimensions,
// } from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; // Import useRoute and RouteProp
// import Video from 'react-native-video'; // Import the Video component
// import { Image } from 'react-native';

// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// // import GradientBox from '../../../components/GradientBox'; // Not needed here

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// // --- Define the expected route parameters ---
// type VideoPlayerRouteParams = {
//   videoId: string | number;
//   video: any; // The video source (number for require(), or object for URI)
// };

// type VideoPlayerScreenRouteProp = RouteProp<
//   { VideoPlayerScreen: VideoPlayerRouteParams },
//   'VideoPlayerScreen'
// >;
// // ---------------------------------------------


// const VideoPlayerScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<any>();
//   const route = useRoute<VideoPlayerScreenRouteProp>(); // Initialize useRoute

//   // 1. Retrieve the video source from the route parameters
//   const { video } = route.params;

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/backgroundImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
//       {/* --- VIDEO PLAYER CONTAINER --- */}
//       <View style={styles.videoContainer}>
//         <Video
//           source={video} // Pass the retrieved video source
//           style={styles.videoPlayer}
//           resizeMode="contain" // Use 'contain' to ensure the whole video is visible
//           repeat={true} 
//           paused={false} // Start playing immediately on this dedicated player screen
//           controls={true} // Add native playback controls (play/pause, timeline)
//         />
//       </View>
//       {/* ------------------------------- */}

//       <SafeAreaView style={styles.container}>
        
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                Video Player
//             </Text>
//           </View>
//         </View>

//         {/* You can add more content or controls below the video here */}
    
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default VideoPlayerScreen;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     // We remove paddingHorizontal and paddingTop from the main container 
//     // so the video can fill the whole screen behind the header.
//     flex: 1,
//   },

//   // --- NEW VIDEO STYLES ---
//   videoContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // Background color defaults to black if video hasn't loaded, which is often fine here
//     backgroundColor: 'black', 
//   },
//   videoPlayer: {
//     width: '100%', 
//     height: '100%',
//   },
//   // -------------------------

//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 20,
//     paddingHorizontal: 20, // Keep padding only on the header content
//     // Ensure the header is above the absolute-positioned video
//     zIndex: 10, 
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 20, // Adjusted for paddingHorizontal
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // Override zIndex to ensure back button is tappable
//     zIndex: 11, 
//   },
//   backIcon: { width: 22, height: 22, tintColor: '#fff' },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },

//   // ... (rest of the unused styles are removed for clarity)
// });