import React, { useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Video from "react-native-video";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamsList } from "../../../navigation/routeTypes";
import { useNavigation } from "@react-navigation/native";
import { useThemeStore } from "../../../store/useThemeStore";
import { Fonts } from "../../../constants/fonts";
import GradientBox from "../../../components/GradientBox";

import { OnboardingData } from "../../../data/OnBoardingData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const OnBoardingScreen: React.FC = () => {
  const { colors } = useThemeStore((state) => state.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const currentItem = OnboardingData[currentIndex];

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

      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Videos Swipe Section */}
        <FlatList
          ref={flatListRef}
          data={OnboardingData}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <View style={styles.videoWrapper}>
              <Video
                source={item.video}
                style={styles.video}
                resizeMode="cover"
                repeat
                muted={false}
                paused={currentIndex !== index} 
                onError={(e) => console.log("Video error:", e)}
              />
            </View>
          )}
        />
               {/* Dots */}
        <View style={styles.dotsContainer}>
          {OnboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.primary : "#777",
                },
              ]}
            />
          ))}
        </View>

        {/* Title & Subtitle */}
        <View style={styles.centerContent}>
          <Text style={[styles.title, { color: colors.white }]}>
            {currentItem.title}
          </Text>
          <Text style={[styles.subheading, { color: colors.primary }]}>
            {currentItem.subtitle}
          </Text>
        </View>

 

        {/* Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("WelcomeScreen")}
            activeOpacity={0.8}
            style={{ width: "100%" }}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.button,
                { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>
                Get Started
              </Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65, 
    //     borderBottomLeftRadius: 90,  
    // borderBottomRightRadius: 40,
    //    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",

 
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
});






// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ImageBackground,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import GradientBox from '../../../components/GradientBox'; 

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

// const OnBoardingScreen: React.FC = () => {
//   const { colors } = useThemeStore(state => state.theme);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/backgroundImage.png')}
//       style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />

//         {/* Centered content */}
//         <View style={styles.centerContent}>
//           <Text style={[styles.title, { color: colors.white }]}>
//             Welcome to Our App
//           </Text>
//           <Text style={[styles.subheading, { color: colors.primary }]}>
//             Get started to explore all the amazing features!
//           </Text>
//         </View>

//         {/* Get Started Button fixed at bottom with gradient */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             onPress={() => navigation.navigate('WelcomeScreen')}
//             activeOpacity={0.8}
//             style={{ width: '100%' }}
//           >
//             <GradientBox
//               colors={[colors.black, colors.bgBox]} // Gradient colors
//               style={[styles.button, { borderWidth: 1.5, borderColor: colors.primary }]}
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
//     paddingHorizontal: 20,
//     justifyContent: 'space-between',
//     paddingBottom: 40,
//   },
//   centerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 32,
//     fontFamily: Fonts.cormorantSCBold,
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   subheading: {
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//     textAlign: 'center',
//   },
//   footer: {
//     width: '100%',
//   },
//   button: {
//     height: 56,
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonText: {
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//   },
// });
