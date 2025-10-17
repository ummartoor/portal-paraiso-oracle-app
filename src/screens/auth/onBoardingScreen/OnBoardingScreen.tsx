import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  Vibration,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Video from "react-native-video";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamsList } from "../../../navigation/routeTypes";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useThemeStore } from "../../../store/useThemeStore";
import { Fonts } from "../../../constants/fonts";
import GradientBox from "../../../components/GradientBox";
import { OnboardingData } from "../../../data/OnBoardingData";
import LinearGradient from "react-native-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const LANGUAGES = [
  { key: 'en', name: 'English' },
  { key: 'pt', name: 'Portuguese' },
];


function triggerHaptic() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 35, 40, 35]);
  } else {
    Vibration.vibrate();
  }
}
const OnBoardingScreen: React.FC = () => {
  const { colors } = useThemeStore((state) => state.theme);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isFocused = useIsFocused()
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    LANGUAGES.find(lang => lang.key === i18n.language) || LANGUAGES[0]
  );

  // Reanimated dropdown animation
  const dropdownAnimation = useSharedValue(0);
  const dropdownAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dropdownAnimation.value,
      transform: [{ scaleY: dropdownAnimation.value }],
    };
  });

  useEffect(() => {
    // animate when open state changes
    dropdownAnimation.value = withTiming(isDropdownOpen ? 1 : 0, { duration: 200 });
  }, [isDropdownOpen, dropdownAnimation]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleSelectLanguage = (language: typeof LANGUAGES[0]) => {
    setSelectedLanguage(language);
         Vibration.vibrate([0, 35, 40, 35]);
    setIsDropdownOpen(false);
    // Change app language
    i18n.changeLanguage(language.key).catch((err) => {
      // optional: handle errors in language change
      console.warn("changeLanguage error:", err);
    });
  };

  const currentItem = OnboardingData[currentIndex] || OnboardingData[0];

  return (
    <ImageBackground
      source={require("../../../assets/images/backgroundImage.png")}
      style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Language Dropdown */}
        <View style={[styles.dropdownContainer, { top: insets.top + 10 }]}>
          <TouchableOpacity
            style={[styles.dropdownTrigger, { backgroundColor: colors.bgBox, borderColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => setIsDropdownOpen(prev => !prev)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: colors.white }]}>{selectedLanguage.name}</Text>
            <Image
              source={require('../../../assets/icons/arrowDown.png')}
              style={[styles.dropdownIcon, { tintColor: colors.white, transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Animated menu — scaled from 0 -> 1 */}
          <Animated.View style={[styles.dropdownMenu, { backgroundColor: colors.bgBox, borderColor: 'rgba(255,255,255,0.2)' }, dropdownAnimatedStyle]}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.key}
                style={styles.dropdownItem}
                onPress={() => handleSelectLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, { color: lang.key === selectedLanguage.key ? colors.primary : colors.white }]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* Videos Swipe Section */}
        <FlatList
          ref={flatListRef}
          data={OnboardingData}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          renderItem={({ item, index }) => (
            <View style={styles.videoWrapper}>
              <Video
                source={item.video}
                style={styles.video}
                resizeMode="cover"
                repeat
                muted={false}
                 paused={currentIndex !== index || !isFocused}
                onError={(e) => console.log("Video error:", e)}
              />
            </View>
          )}
        />

        {/* Bottom Content Area */}
       <View style={styles.bottomContent}>
            {/* Gradient Overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                style={styles.gradientOverlay}
            />
          
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {OnboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: index === currentIndex ? colors.primary : "#777" },
                ]}
              />
            ))}
          </View>

          {/* Title & Subtitle */}
          <View style={styles.centerContent}>
            <Text style={[styles.title, { color: colors.white }]}>
              {t(currentItem.titleKey as any)}
            </Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
              {t(currentItem.subtitleKey as any)}
            </Text>
          </View>

          {/* Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => {
            //  triggerHaptic();
              Vibration.vibrate([0, 35, 40, 35]);
                navigation.navigate("WelcomeScreen");
              }}
              activeOpacity={0.8}
              style={{ width: "100%" }}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[
                  styles.button,
                  { borderWidth: 1, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {t('getStartedButton' as any)}
                </Text>
              </GradientBox>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  video: {
    width: "100%",
    height: "100%",
  },
    // --- 3. NEW STYLE FOR GRADIENT ---
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%', // Covers the entire bottom area
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
  centerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.cormorantSCBold,
    textAlign: "center",
    marginBottom: 9,
  },
  subheading: {
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
    textAlign: "center",
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 25,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
  },
  dropdownContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  dropdownTrigger: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dropdownText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    marginRight: 6,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  dropdownMenu: {
    width: 130,
    position: 'absolute',
    top: 42,
    right: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },
});





























// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   StatusBar,
//   ImageBackground,
//   FlatList,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Video from "react-native-video";

// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { AuthStackParamsList } from "../../../navigation/routeTypes";
// import { useNavigation } from "@react-navigation/native";
// import { useThemeStore } from "../../../store/useThemeStore";
// import { Fonts } from "../../../constants/fonts";
// import GradientBox from "../../../components/GradientBox";

// import { OnboardingData } from "../../../data/OnBoardingData";

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

// const OnBoardingScreen: React.FC = () => {
//   const { colors } = useThemeStore((state) => state.theme);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList>(null);

//   const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
//     setCurrentIndex(index);
//   };

//   const currentItem = OnboardingData[currentIndex];

//   return (
//     <ImageBackground
//       source={require("../../../assets/images/backgroundImage.png")}
//       style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
//       resizeMode="cover"
//     >
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="transparent"
//         translucent
//       />

//       <SafeAreaView style={styles.container} edges={["bottom"]}>
//         {/* Videos Swipe Section */}
//         <FlatList
//           ref={flatListRef}
//           data={OnboardingData}
//           keyExtractor={(item) => item.id.toString()}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//           renderItem={({ item, index }) => (
//             <View style={styles.videoWrapper}>
//               <Video
//                 source={item.video}
//                 style={styles.video}
//                 resizeMode="cover"
//                 repeat
//                 muted={false}
//                 paused={currentIndex !== index} 
//                 onError={(e) => console.log("Video error:", e)}
//               />
//             </View>
//           )}
//         />
//                {/* Dots */}
//         <View style={styles.dotsContainer}>
//           {OnboardingData.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.dot,
//                 {
//                   backgroundColor:
//                     index === currentIndex ? colors.primary : "#777",
//                 },
//               ]}
//             />
//           ))}
//         </View>

//         {/* Title & Subtitle */}
//         <View style={styles.centerContent}>
//           <Text style={[styles.title, { color: colors.white }]}>
//             {currentItem.title}
//           </Text>
//           <Text style={[styles.subheading, { color: colors.primary }]}>
//             {currentItem.subtitle}
//           </Text>
//         </View>

 

//         {/* Button */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("WelcomeScreen")}
//             activeOpacity={0.8}
//             style={{ width: "100%" }}
//           >
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[
//                 styles.button,
//                 { borderWidth: 1.5, borderColor: colors.primary },
//               ]}
//             >
//               <Text style={[styles.buttonText, { color: colors.white }]}>
//                 Get Started
//               </Text>
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default OnBoardingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingBottom: 40,
//     justifyContent: "space-between",
//   },
//   videoWrapper: {
//     width: SCREEN_WIDTH,
//     height: SCREEN_HEIGHT * 0.65, 
//     //     borderBottomLeftRadius: 90,  
//     // borderBottomRightRadius: 40,
//     //    overflow: "hidden",
//   },
//   video: {
//     width: "100%",
//     height: "100%",

 
//   },
//   centerContent: {
//     alignItems: "center",
//     paddingHorizontal: 20,
//     marginTop: 10,
//   },
//   title: {
//     fontSize: 28,
//     fontFamily: Fonts.cormorantSCBold,
//     textAlign: "center",
//     marginBottom: 9,
//   },
//   subheading: {
//     fontSize: 15,
//     fontFamily: Fonts.aeonikRegular,
//     textAlign: "center",
//        marginBottom: 12,
//   },
//   dotsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",

//   },
//   dot: {
//     width: 25,
//     height: 10,
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   footer: {
//     width: "100%",
//     paddingHorizontal: 20, 
//   },
//   button: {
//     height: 56,
//     borderRadius: 65,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//   },
// });



