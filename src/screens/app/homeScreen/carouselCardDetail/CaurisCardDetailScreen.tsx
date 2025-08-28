// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   Image,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
// } from 'react-native-reanimated';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// /* ---------- Images (replace ALT_CAURIS_IMG as you like) ---------- */
// const BASE_CAURIS_IMG = require('../../../../assets/images/bgCaurisImage.png');
// const ALT_CAURIS_IMG  = require('../../../../assets/images/shellImage.png'); // replace as needed

// const CaurisCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   // React state: controls button label
//   const [isAlt, setIsAlt] = useState(false); // false = "Throw the Shells", true = "Continue"

//   // Reanimated shared values: control visual transition
//   const showAlt = useSharedValue(0);         // 0 = base, 1 = alt
//   const baseOpacity = useSharedValue(1);
//   const altOpacity  = useSharedValue(0);
//   const baseScale   = useSharedValue(1);
//   const altScale    = useSharedValue(0.98);

//   const baseStyle = useAnimatedStyle(() => ({
//     opacity: baseOpacity.value,
//     transform: [{ scale: baseScale.value }],
//   }));
//   const altStyle = useAnimatedStyle(() => ({
//     opacity: altOpacity.value,
//     transform: [{ scale: altScale.value }],
//   }));

//   const onReplacePress = () => {
//     const toAlt = showAlt.value === 0;

//     if (toAlt) {
//       // base → alt
//       baseScale.value = withSpring(0.98, { damping: 20, stiffness: 240 });
//       baseOpacity.value = withTiming(0, { duration: 220 });
//       altScale.value = withSpring(1, { damping: 20, stiffness: 240 });
//       altOpacity.value = withTiming(1, { duration: 260 });
//       showAlt.value = 1;
//       setIsAlt(true);   // change button to "Continue"
//     } else {
//       // alt → base (toggle back)
//       altScale.value = withSpring(0.98, { damping: 20, stiffness: 240 });
//       altOpacity.value = withTiming(0, { duration: 220 });
//       baseScale.value = withSpring(1, { damping: 20, stiffness: 240 });
//       baseOpacity.value = withTiming(1, { duration: 260 });
//       showAlt.value = 0;
//       setIsAlt(false);  // label back to "Throw the Shells"
//     }
//   };

//   return (
//     <ImageBackground
//       source={require('../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       imageStyle={{ resizeMode: 'cover' }}
//     >
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../assets/icons/backIcon.png')}
//               style={[styles.backIcon, { tintColor: colors.white }]}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//               Cauris
//             </Text>
//           </View>
//         </View>

//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           {/* Title & subtitle (centered) */}
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
//               Cowrie Shells Divination
//             </Text>
//             <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
//               Unveil sacred wisdom through ancient African spiritual practice.
//             </Text>
//           </View>

//           {/* ---- Center Image Area (animated crossfade/scale) ---- */}
//           <View style={styles.centerImageWrap}>
//             {/* Base image (bottom layer) */}
//             <Animated.Image
//               source={BASE_CAURIS_IMG}
//               style={[styles.centerImage, baseStyle]}
//               resizeMode="contain"
//             />
//             {/* Alt image (top layer) */}
//             <Animated.Image
//               source={ALT_CAURIS_IMG}
//               style={[styles.centerImage, styles.absoluteFill, altStyle]}
//               resizeMode="contain"
//             />
//           </View>

//           {/* Button */}
//           <View style={styles.actionsRow}>
//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={onReplacePress}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>
//                   {isAlt ? 'Continue' : 'Throw the Shells'}
//                 </Text>
//               </GradientBox>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default CaurisCardDetailScreen;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//     width: SCREEN_WIDTH,
//     backgroundColor: 'transparent',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//     backgroundColor: 'transparent',
//   },

//   /* Header */
//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { width: 22, height: 22 },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },

//   /* Scroll content centered */
//   scrollContent: {
//     paddingBottom: 36,
//     alignItems: 'center',
//   },

//   /* Content Headings (centered) */
//   contentHeader: {
//     marginTop: 16,
//     width: '100%',
//     alignItems: 'center',
//   },
//   contentTitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     letterSpacing: 0.5,
//   },
//   contentSubtitle: {
//     marginTop: 6,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     opacity: 0.9,
//   },

//   /* Center Image */
//   centerImageWrap: {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 24,
//     marginBottom: 8,
//     height: 300,
//   },
//   centerImage: {
//     width: '100%',
//     height: '100%',
//   },
//   absoluteFill: {
//     position: 'absolute',
//     left: 0, right: 0, top: 0, bottom: 0,
//   },

//   /* Action Button */
//   actionsRow: {
//     marginTop: 16,
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   actionTouchable: {
//     flex: 1,
//   },
//   actionButton: {
//     height: 57,
//     borderRadius: 28.5,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.18)',
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 2,
//   },
//   actionLabel: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//   },
// });


import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Image,
  Platform,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import GradientBox from '../../../../components/GradientBox';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_W = SCREEN_WIDTH - 40; // container has paddingHorizontal:20

/* ---------- Assets ---------- */
const BG_IMG       = require('../../../../assets/images/backgroundImage.png');
const DECAL_IMG    = require('../../../../assets/images/decalImage.png'); // full width
const SHELL_IMG_1  = require('../../../../assets/images/shell1.png');
const SHELL_IMG_2  = require('../../../../assets/images/shell2.png');

/* ---------- Sizes ---------- */
const DECAL_SIZE  = 352;
const BOWL_SIZE   = 260;
/** increased sizes */
const SHELL_COUNT = 16;
const SHELL_MIN   = 44;
const SHELL_MAX   = 48;

/* ---------- Helpers ---------- */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* Single shell sprite */
function ShellSprite({
  size,
  x,
  y,
  rot,
  opacity,
  scale,
  source,
}: {
  size: number;
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  rot: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  source: ImageSourcePropType;
}) {
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    width: size,
    height: size,
    opacity: opacity.value,
    transform: [{ rotate: `${rot.value}deg` }, { scale: scale.value }],
  }));
  return <Animated.Image source={source} style={style} resizeMode="contain" />;
}

const CaurisCardDetailScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [thrown, setThrown] = useState(false);

  // bounce the circular box when throwing
  const circleScale = useSharedValue(1);
  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  /* Pick exactly 6 indices for shell2, rest shell1 */
  const shell2Set = useMemo(() => {
    const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(0, 6);
    return new Set(indices);
  }, []);

  /* Random landing spots INSIDE the 260 circle */
  const shellConfigs = useMemo(() => {
    const R = BOWL_SIZE / 2;
    const center = { x: R, y: R };
    return Array.from({ length: SHELL_COUNT }).map((_, i) => {
      const radius = rand(R * 0.25, R * 0.85);
      const angle = rand(0, Math.PI * 2);
      const size = rand(SHELL_MIN, SHELL_MAX);

      const targetX = center.x + radius * Math.cos(angle) - size / 2;
      const targetY = center.y + radius * Math.sin(angle) - size / 2;

      const startX = center.x + rand(-25, 25) - size / 2;
      const startY = BOWL_SIZE + rand(40, 80);

      const rot = rand(-150, 150);
      const delay = i * 70 + rand(0, 120);

      const source = shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1;

      return { size, startX, startY, targetX, targetY, rot, delay, source };
    });
  }, [shell2Set]);

  /* Per-shell animated values */
  const xSV = shellConfigs.map(c => useSharedValue(c.startX));
  const ySV = shellConfigs.map(c => useSharedValue(c.startY));
  const rSV = shellConfigs.map(() => useSharedValue(0));
  const sSV = shellConfigs.map(() => useSharedValue(0.7));
  const oSV = shellConfigs.map(() => useSharedValue(0));

  const onThrowPress = () => {
    if (thrown) {
      // navigation.navigate('CaurisReading');
      return;
    }

    // bounce the circular gradient box
    circleScale.value = withSpring(0.98, { damping: 20, stiffness: 240 }, () => {
      circleScale.value = withSpring(1);
    });

    // animate shells into the circle
    shellConfigs.forEach((c, i) => {
      xSV[i].value = withDelay(c.delay, withSpring(c.targetX, { damping: 14, stiffness: 170 }));
      ySV[i].value = withDelay(c.delay, withSpring(c.targetY, { damping: 14, stiffness: 170 }));
      rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
      sSV[i].value = withDelay(c.delay, withSpring(1, { damping: 14, stiffness: 200 }));
      oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
    });

    setThrown(true);
  };

  return (
    <ImageBackground source={BG_IMG} style={styles.bgImage} imageStyle={{ resizeMode: 'cover' }}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../../assets/icons/backIcon.png')}
              style={[styles.backIcon, { tintColor: colors.white }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              Cauris
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} // extra bottom so button overlay doesn't cover content
          showsVerticalScrollIndicator={false}
        >
          {/* Title & subtitle */}
          <View style={styles.contentHeader}>
            <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
              {thrown ? 'Casting the Shells' : 'Cowrie Shells Divination'}
            </Text>
            <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
              {thrown ? 'The spirits are being summoned…' : 'Unveil sacred wisdom through ancient African spiritual practice.'}
            </Text>
          </View>

          {/* ---- Decal + Circular Box ---- */}
          <View style={styles.centerImageWrap}>
            {/* Full-width decal image (background) */}
            <Image source={DECAL_IMG} style={styles.decalFull} resizeMode="contain" />

            {/* Circular gradient box (260x260) centered on top of decal */}
            <Animated.View
              style={[
                styles.circleWrap,
                { left: (CONTAINER_W - BOWL_SIZE) / 2, borderColor: colors.primary },
                circleAnimStyle,
              ]}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.circleGradient}
              >
                <View />
              </GradientBox>

              {/* Shells overlay inside the circle */}
              <View style={styles.shellsOverlay} pointerEvents="none">
                {shellConfigs.map((cfg, i) => (
                  <ShellSprite
                    key={`shell-${i}`}
                    size={cfg.size}
                    x={xSV[i]}
                    y={ySV[i]}
                    rot={rSV[i]}
                    opacity={oSV[i]}
                    scale={sSV[i]}
                    source={cfg.source}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Fixed bottom action (prevents jump on press) */}
        <View style={styles.actionsRowFixed}>
          <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={onThrowPress}>
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[styles.actionButton, { borderColor: colors.primary }]}
            >
              <Text style={[styles.actionLabel, { color: colors.white }]}>
                {thrown ? 'Continue' : 'Throw the Shells'}
              </Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default CaurisCardDetailScreen;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
    backgroundColor: 'transparent',
  },

  /* Header */
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },

  scrollContent: {
    alignItems: 'center',
  },

  /* Titles */
  contentHeader: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  contentTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  contentSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },

  centerImageWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    height: DECAL_SIZE,
  },
  decalFull: {
    width: '100%',
    height: DECAL_SIZE,
  },

  circleWrap: {
    position: 'absolute',
    top: (DECAL_SIZE - BOWL_SIZE) / 2,
    width: BOWL_SIZE,
    height: BOWL_SIZE,
    borderRadius: BOWL_SIZE / 2,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleGradient: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: BOWL_SIZE / 2,
    padding: 0,
  },

  shellsOverlay: {
    position: 'absolute',
    width: BOWL_SIZE,
    height: BOWL_SIZE,
    left: 0,
    top: 0,
  },

  /* Fixed bottom Action Button */
  actionsRowFixed: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  actionTouchable: {
    flex: 1,
  },
  actionButton: {
    height: 57,
    borderRadius: 28.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.3,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  actionLabel: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },
});
