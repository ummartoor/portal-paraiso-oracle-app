import React, { useState, useEffect, useCallback } from 'react';
import { 
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Video from 'react-native-video'; 
import { useIsFocused } from '@react-navigation/native';

import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/routeTypes'; 
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWPORT_WIDTH = SCREEN_WIDTH;

const SNAP_WIDTH = SCREEN_WIDTH * 0.7;

const GAP = 16;

const ITEM_WIDTH = SNAP_WIDTH - GAP;

const ITEM_HEIGHT = 200; 
const CARD_RADIUS = 18;

// --- ASSET IMPORTS ---
const PLAY_ICON = require('../../../assets/icons/playIcon.png'); 
const DUMMY_POSTER = PLAY_ICON; 

// --- UPDATED TYPE ---
export type CardItem = {
  id: string | number;
  video: any;
  route: keyof AppStackParamList;
  poster: any;
};

type Props = {
  data?: CardItem[];
  onPressCard?: (item: CardItem) => void;
};

const HightlightsCarouselCards: React.FC<Props> = ({ data, onPressCard }) => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  
  const [activeIndex, setActiveIndex] = useState(0); 

  const DEFAULT_CARDS: CardItem[] = [
    {
      id: '1',
      video: require("../../../assets/videos/PortalGuide_1.mp4"),
      poster: DUMMY_POSTER,
      route: 'VideoPlayerScreen', 
    },
    {
      id: '2',
      video: require("../../../assets/videos/PortalGuide_2.mp4"),
      poster: DUMMY_POSTER,
      route: 'VideoPlayerScreen',
    },
    {
      id: '3',
      video: require("../../../assets/videos/PortalGuide_3.mp4"),
      poster: DUMMY_POSTER,
      route: 'VideoPlayerScreen',
    },
  ];

  const cardData = data || DEFAULT_CARDS;

const handlePress = (item: CardItem) => {
  Vibration.vibrate([0, 35, 40, 35]);

  navigation.navigate("VideoPlayerScreen", {
    videoID: item.id,
    videoSRC: item.video,
  });
};


  const renderCard = ({ item, index }: { item: CardItem, index: number }) => {
    
    const isPaused = true; 
    
    return (
      <View style={styles.cardWrap}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => handlePress(item)}
          style={styles.card} 
        >
          
          {/* --- VIDEO COMPONENT --- */}
          <Video
            source={item.video}
            style={styles.videoPlayer}
            resizeMode="cover"
            poster={item.poster}
            paused={isPaused} 
            repeat={true} 
            muted={true} 
            posterResizeMode="cover" 
          />

          {/* Dark overlay for better visibility of play icon */}
          <View style={styles.overlay} />

          {/* Video Play Icon in the Center */}
          <View style={styles.playIconContainer}>
            <Image
              source={PLAY_ICON}
              resizeMode="contain"
              style={styles.playIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ width: VIEWPORT_WIDTH }}>
      <View style={styles.headerContainer}>
        <Text style={[styles.mainTitle, { color: colors.white }]}>Portal Guide</Text>
      </View>

      <Carousel
        data={cardData}
        width={SNAP_WIDTH}
        height={ITEM_HEIGHT}
        style={{ width: VIEWPORT_WIDTH }}
        loop={false}
        pagingEnabled
        snapEnabled
        containerStyle={{ paddingHorizontal: 16 }}
        renderItem={renderCard}
        onProgressChange={(_, absoluteIndex) => {
            const newIndex = Math.round(absoluteIndex);
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        }}
      />
    </View>
  );
};

export default HightlightsCarouselCards;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: Fonts.cormorantSCBold,
   fontSize: 22,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  cardWrap: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: '#ffffff1a', 
  },
  
  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    zIndex: 1, 
  },
  
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, 
  },
  playIcon: {
    width: 50, 
    height: 50,
    tintColor: 'white', 
  },
});



// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ImageBackground,
//   Vibration,
// } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';

// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const VIEWPORT_WIDTH = SCREEN_WIDTH;

// const SNAP_WIDTH = SCREEN_WIDTH * 0.7;

// const GAP = 16;

// const ITEM_WIDTH = SNAP_WIDTH - GAP;

// const ITEM_HEIGHT = 200; // Height 200 hi hai
// const CARD_RADIUS = 18;

// export type CardItem = {
//   id: string | number;
//   title: string;
//   subtitle?: string; // Subtitle add kar diya hai
//   image?: any;
//   route: keyof AppStackParamList;
// };

// type Props = {
//   data?: CardItem[];
//   onPressCard?: (item: CardItem) => void;
// };

// const HightlightsCarouselCards: React.FC<Props> = ({ data, onPressCard }) => {
//   const { colors } = useThemeStore(s => s.theme);

//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { t } = useTranslation();

// const DEFAULT_CARDS: CardItem[] = [
//     {
//       id: 'tarot',
//       title: t('highlights_sun_title'),
//       subtitle: t('highlights_sun_subtitle'),
//       image: require('../../../assets/icons/TheSunIcon.png'),
//       route: 'TheSunScreen',
//     },
//     {
//       id: 'numero',
//       title: t('highlights_horoscope_title'),
//       subtitle: t('highlights_horoscope_subtitle'),
//       image: require('../../../assets/icons/TheHoroscopeIcon.png'),
//       route: 'TheHoroscopeScreen',
//     },
//     {
//       id: 'astro',
//       title: t('highlights_ritual_title'),
//       subtitle: t('highlights_ritual_subtitle'),
//       image: require('../../../assets/icons/TheRitualIcon.png'),
//       route: 'TheRitualScreen',
//     },
//   ];

//   const cardData = data || DEFAULT_CARDS;

//   const handlePress = (item: CardItem) => {
//     Vibration.vibrate([0, 35, 40, 35]);

//     if (onPressCard) {
//       onPressCard(item);
//       return;
//     }
//     if (item.route) {
//       navigation.navigate(item.route as any);
//     }
//   };

//   const renderCard = ({ item }: { item: CardItem }) => {
//     return (
//       <View style={styles.cardWrap}>
//         <TouchableOpacity activeOpacity={0.9}
//         //  onPress={() => handlePress(item)}
//          >
//           <ImageBackground
//             source={require('../../../assets/images/bgCard.png')}
//             style={styles.card} // --- STYLE CHANGED ---
//             resizeMode="cover"
//           >
//             <View
//               style={[
//                 StyleSheet.absoluteFillObject,
//                 styles.topFade,
//                 { borderRadius: CARD_RADIUS },
//               ]}
//             />
            
//             {/* --- MOVED: Image to the Top --- */}
//             {item.image ? (
//               <Image
//                 source={item.image}
//                 resizeMode="contain"
//                 style={styles.image} // --- STYLE CHANGED ---
//               />
//             ) : (
//               <View style={styles.imagePlaceholder}> 
//                 <Text style={styles.placeholderText}>
//                   {t('carousel_no_image')}
//                 </Text>
//               </View>
//             )}

//             {/* --- MOVED: Text Area to the Bottom --- */}
//             <View style={styles.textArea}>
//               <Text style={[styles.title, { color: colors.white }]}>
//                 {item.title}
//               </Text>
//               {/* --- ADDED Subtitle --- */}
//               {!!item.subtitle && (
//                 <Text style={[styles.subtitle, { color: colors.white }]}>
//                   {item.subtitle}
//                 </Text>
//               )}
//             </View>

//           </ImageBackground>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={{ width: VIEWPORT_WIDTH }}>
//       <View style={styles.headerContainer}>
//         <Text style={[styles.mainTitle, { color: colors.white }]}>{t('highlights_main_title')}</Text>
//       </View>

//       <Carousel
//         data={cardData}
//         width={SNAP_WIDTH}
//         height={ITEM_HEIGHT}
//         style={{ width: VIEWPORT_WIDTH }}
//         loop={false}
//         pagingEnabled
//         snapEnabled
//         containerStyle={{ paddingHorizontal: 16 }}
//         renderItem={({ item }) => renderCard({ item })}
//       />
//     </View>
//   );
// };

// export default HightlightsCarouselCards;

// const styles = StyleSheet.create({
//   headerContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   mainTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//    fontSize: 22,
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
  
//   cardWrap: {
//     height: ITEM_HEIGHT,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     width: ITEM_WIDTH,
//     height: ITEM_HEIGHT,
//     borderRadius: CARD_RADIUS,
//     padding: 20,
//     overflow: 'hidden',
//     borderColor: '#fff',
//     borderWidth: 1,
   
//     justifyContent: 'space-between', 
//   },
//   topFade: {
//     backgroundColor: 'transparent',
//   },
//   image: {
 
//     width: 100,
//     height: 100,
//     alignSelf: 'flex-end',
//   },
//   imagePlaceholder: {
 
//     width: 65,
//     height: 65,
//     alignSelf: 'flex-end',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#ffffff22',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   placeholderText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 12,
//     opacity: 0.8,
//   },
//   textArea: {
//     // --- CHANGED: Removed horizontal layout styles ---
//     // (flex: 1, paddingRight: 10) removed
//   },
//   title: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 20,
//     letterSpacing: 0.5,
//     textAlign: 'left', // Text aligned left
//     textTransform: 'uppercase',
//   },
//   subtitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     opacity: 0.85,
//     marginTop: 4,
//     textAlign: 'left', // Text aligned left
//   },
//   borderGlow: {
//     position: 'absolute',
//     top: 6,
//     left: 6,
//     right: 6,
//     bottom: 6,
//     borderRadius: CARD_RADIUS - 2,
//     borderWidth: 1,
//   },
// });