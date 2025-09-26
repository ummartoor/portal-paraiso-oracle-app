import React, { useMemo, useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
import { useBuziosStore } from '../../../../../store/useBuziousStore';

// 🔊 TTS
import Tts from 'react-native-tts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_W = SCREEN_WIDTH - 40;

/* Assets */
const BG_IMG = require('../../../../../assets/images/backgroundImage.png');
const DECAL_IMG = require('../../../../../assets/images/decalImage.png');
const SHELL_IMG_1 = require('../../../../../assets/images/shell1.png');
const SHELL_IMG_2 = require('../../../../../assets/images/shell2.png');

const PLAY_ICON = require('../../../../../assets/icons/playIcon.png');
const PAUSE_ICON = require('../../../../../assets/icons/pauseIcon.png');
const SHARE_ICON = require('../../../../../assets/icons/shareIcon.png');
const SAVE_ICON = require('../../../../../assets/icons/saveIcon.png');

/* Sizes */
const DECAL_SIZE = 352;
const BOWL_SIZE = 260;
const SHELL_COUNT = 16;
const SHELL_MIN = 44;
const SHELL_MAX = 48;
const SHELL_PADDING = 16;

/* No-overlap controls */
const SHELL_GAP = 10;
const RADIUS_SCALE = 0.6;
const MAX_ATTEMPTS = 500;

/* helpers */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

type ShellConfig = {
  size: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  rot: number;
  delay: number;
  source: ImageSourcePropType;
};

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
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaurisCardDetail'>>();
  const { userQuestion } = route.params;

  // --- Zustand Store Integration ---
  const {
    reading,
    isLoadingReading,
    readingError,
    getBuziosReading,
    isSaving,
    saveBuziosReading,
  } = useBuziosStore();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const circleScale = useSharedValue(1);
  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const shell2Set = useMemo(() => {
    // Use the API response to determine which shells are "mouth up"
    if (reading) {
      const upCount = reading.buzios_result.mouth_up_count;
      const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i));
      return new Set(indices.slice(0, upCount));
    }
    // Default random set before API call
    const idx = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(
      0,
      6,
    );
    return new Set(idx);
  }, [reading]);

  const shellConfigs: ShellConfig[] = useMemo(() => {
    // ... (rest of the shell configuration logic remains the same)
    const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
    const R = effectiveSize / 2;
    const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };
    const sizes = Array.from({ length: SHELL_COUNT }, () =>
      rand(SHELL_MIN, SHELL_MAX),
    );
    const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort(
      (a, b) => sizes[b] - sizes[a],
    );
    type P = { cx: number; cy: number; r: number };
    const placed: P[] = [];
    const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(
      null as any,
    );
    const insideCircle = (cx: number, cy: number, rEff: number) => {
      const dx = cx - center.x,
        dy = cy - center.y;
      return Math.hypot(dx, dy) <= R - rEff;
    };
    for (const idx of order) {
      const size = sizes[idx];
      const rEff = (size / 2) * RADIUS_SCALE;
      let done = false;
      for (let k = 0; k < MAX_ATTEMPTS; k++) {
        const angle = rand(0, Math.PI * 2);
        const radius = Math.sqrt(Math.random()) * (R - rEff);
        const cx = center.x + radius * Math.cos(angle);
        const cy = center.y + radius * Math.sin(angle);
        if (!insideCircle(cx, cy, rEff)) continue;
        let ok = true;
        for (const p of placed) {
          const dx = cx - p.cx,
            dy = cy - p.cy;
          const minD = p.r + rEff + SHELL_GAP;
          if (dx * dx + dy * dy < minD * minD) {
            ok = false;
            break;
          }
        }
        if (ok) {
          placed.push({ cx, cy, r: rEff });
          targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
          done = true;
          break;
        }
      }
      if (!done) {
        const cx = center.x;
        const cy = center.y;
        placed.push({ cx, cy, r: rEff });
        targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
      }
    }
    return Array.from({ length: SHELL_COUNT }).map((_, i) => {
      const size = sizes[i];
      const { tx, ty } = targets[i];
      const startX = center.x + rand(-25, 25) - size / 2;
      const startY = BOWL_SIZE + rand(40, 80);
      return {
        size,
        startX,
        startY,
        targetX: tx,
        targetY: ty,
        rot: rand(-150, 150),
        delay: i * 70 + rand(0, 120),
        source: shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1,
      };
    });
  }, [shell2Set]);

  const xSV = shellConfigs.map(c => useSharedValue(c.startX));
  const ySV = shellConfigs.map(c => useSharedValue(c.startY));
  const rSV = shellConfigs.map(() => useSharedValue(0));
  const sSV = shellConfigs.map(() => useSharedValue(0.7));
  const oSV = shellConfigs.map(() => useSharedValue(0));

  const onActionPress = async () => {
    if (phase === 0) {
      setPhase(1); // Show "Casting the Shells"
      // Start API call in the background while animation runs
      getBuziosReading(userQuestion);

      circleScale.value = withSpring(
        0.98,
        { damping: 20, stiffness: 240 },
        () => {
          circleScale.value = withSpring(1);
        },
      );
      shellConfigs.forEach((c, i) => {
        xSV[i].value = withDelay(
          c.delay,
          withSpring(c.targetX, { damping: 14, stiffness: 170 }),
        );
        ySV[i].value = withDelay(
          c.delay,
          withSpring(c.targetY, { damping: 14, stiffness: 170 }),
        );
        rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
        sSV[i].value = withDelay(
          c.delay,
          withSpring(1, { damping: 14, stiffness: 200 }),
        );
        oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
      });
    } else if (phase === 1) {
      // This phase is now controlled by API loading state
    } else if (phase === 2) {
      setPhase(3);
    } else {
      setShowSubscriptionModal(true);
    }
  };

  // Handle API response to move to next phase
  useEffect(() => {
    if (phase === 1 && !isLoadingReading && reading) {
      // API call is done, move to phase 2
      setPhase(2);
    }
  }, [isLoadingReading, reading, phase]);

  const handleSave = () => {
    if (reading && !isSaving) {
      saveBuziosReading(reading).then(success => {
        if (success) {
          // Optionally navigate back or show a confirmation
          navigation.navigate('MainTabs');
        }
      });
    }
  };

  const titleTop =
    phase === 0
      ? 'Cowrie Shells Divination'
      : phase === 1
      ? 'Casting the Shells'
      : phase === 2
      ? 'Your divine pattern is'
      : 'Your Divine Message';

  const subtitle =
    phase === 0
      ? 'Unveil sacred wisdom through ancient African spiritual practice.'
      : phase === 1
      ? 'The spirits are being summoned…'
      : undefined;

  const actionLabel =
    phase === 0
      ? 'Throw the Shells'
      : phase === 1
      ? 'Continue' // Will be disabled while loading
      : phase === 2
      ? 'Reveal My Reading'
      : 'Get Premium For Full Reading';

  const showShells = phase >= 1;
  const divineMessage = reading?.ai_reading ?? 'Your divine message awaits...';

  type TtsSub = { remove?: () => void; removeListener?: () => void };

  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.4, true);

    const onStart = () => setIsSpeaking(true);
    const onFinish = () => setIsSpeaking(false);
    const onCancel = () => setIsSpeaking(false);

    const startSub = Tts.addEventListener(
      'tts-start',
      onStart,
    ) as unknown as TtsSub;
    const finishSub = Tts.addEventListener(
      'tts-finish',
      onFinish,
    ) as unknown as TtsSub;
    const cancelSub = Tts.addEventListener(
      'tts-cancel',
      onCancel,
    ) as unknown as TtsSub;

    return () => {
      startSub?.remove?.();
      startSub?.removeListener?.();
      finishSub?.remove?.();
      finishSub?.removeListener?.();
      cancelSub?.remove?.();
      cancelSub?.removeListener?.();
      Tts.stop();
    };
  }, []);

  const onPressPlayToggle = async () => {
    if (!divineMessage.trim()) return;
    if (isSpeaking) {
      await Tts.stop();
      setIsSpeaking(false);
    } else {
      await Tts.stop();
      Tts.speak(divineMessage);
    }
  };

  if (readingError) {
    Alert.alert('API Error', readingError, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ImageBackground
      source={BG_IMG}
      style={styles.bgImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={[styles.backIcon, { tintColor: colors.white }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.headerTitle, { color: colors.white }]}
            >
              Cauris
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: phase === 3 ? 20 : 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <Text
              style={[
                styles.contentTitle,
                { color: colors.primary, textAlign: 'center' },
              ]}
            >
              {titleTop}
            </Text>

            {subtitle ? (
              <Text
                style={[
                  styles.contentSubtitle,
                  { color: colors.white, textAlign: 'center' },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}

            {(phase === 2 || phase === 3) && reading && (
              <Text style={[styles.patternName, { color: colors.white }]}>
                {reading.buzios_result.overall_polarity}
              </Text>
            )}
          </View>

          <View style={styles.centerImageWrap}>
            <Image
              source={DECAL_IMG}
              style={styles.decalFull}
              resizeMode="contain"
            />
            <Animated.View
              style={[
                styles.circleWrap,
                {
                  left: (CONTAINER_W - BOWL_SIZE) / 2,
                  borderColor: colors.primary,
                },
                circleAnimStyle,
              ]}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.circleGradient}
              >
                <View />
              </GradientBox>

              {showShells && (
                <View
                  style={[styles.shellsOverlay, { padding: SHELL_PADDING }]}
                  pointerEvents="none"
                >
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
              )}
            </Animated.View>
          </View>

          {phase === 3 && (
            <>
              <View style={styles.playWrapper}>
                <TouchableOpacity
                  onPress={onPressPlayToggle}
                  activeOpacity={0.7}
                >
                  <Image
                    source={isSpeaking ? PAUSE_ICON : PLAY_ICON}
                    style={[styles.playIcon, { opacity: isSpeaking ? 0.9 : 1 }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.messageText, { color: colors.white }]}>
                {divineMessage}
              </Text>

              <View style={styles.shareRow}>
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={[styles.smallBtn, { borderColor: colors.primary }]}
                >
                  <Image
                    source={SHARE_ICON}
                    style={styles.smallIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.smallBtnText, { color: colors.white }]}>
                    Share
                  </Text>
                </GradientBox>

                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                  <GradientBox
                    colors={[colors.black, colors.bgBox]}
                    style={[styles.smallBtn, { borderColor: colors.primary }]}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Image
                          source={SAVE_ICON}
                          style={styles.smallIcon}
                          resizeMode="contain"
                        />
                        <Text
                          style={[styles.smallBtnText, { color: colors.white }]}
                        >
                          Save
                        </Text>
                      </>
                    )}
                  </GradientBox>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionTouchable}
              onPress={onActionPress}
              disabled={phase === 1 && isLoadingReading}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.actionButton, { borderColor: colors.primary }]}
              >
                {phase === 1 && isLoadingReading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.actionLabel, { color: colors.white }]}>
                    {actionLabel}
                  </Text>
                )}
              </GradientBox>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <SubscriptionPlanModal
          isVisible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onConfirm={plan => {
            setShowSubscriptionModal(false);
            console.log('User selected plan:', plan);
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default CaurisCardDetailScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: SCREEN_WIDTH, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
    backgroundColor: 'transparent',
  },
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
  headerTitleWrap: {
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  scrollContent: { alignItems: 'center' },
  contentHeader: { marginTop: 16, width: '100%', alignItems: 'center' },
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
  eyebrow: {
    marginTop: 2,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.9,
  },
  patternName: {
    marginTop: 8,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 28,
    letterSpacing: 1,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  centerImageWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8,
    height: DECAL_SIZE,
  },
  decalFull: { width: '100%', height: DECAL_SIZE },
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
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  messageText: {
    marginTop: 18,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.95,
  },
  playWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { width: 40, height: 40 },
  shareRow: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  smallBtn: {
    minWidth: 120,
    height: 46,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIcon: { width: 15, height: 15, marginRight: 8, resizeMode: 'contain' },
  smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
  actionsRow: { width: '100%', marginTop: 24, marginBottom: 12 },
  actionTouchable: { flex: 1 },
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
  actionLabel: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
});











  // ------------------------Design-------------------- 

// import React, { useMemo, useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions,
//   ImageBackground, Image, Platform, ScrollView, ImageSourcePropType,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../../navigation/routeTypes';
// import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';

// // 🔊 TTS
// import Tts from 'react-native-tts';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CONTAINER_W = SCREEN_WIDTH - 40;

// /* Assets */
// const BG_IMG = require('../../../../../assets/images/backgroundImage.png');
// const DECAL_IMG = require('../../../../../assets/images/decalImage.png');
// const SHELL_IMG_1 = require('../../../../../assets/images/shell1.png');
// const SHELL_IMG_2 = require('../../../../../assets/images/shell2.png');

// const PLAY_ICON = require('../../../../../assets/icons/playIcon.png');
// const PAUSE_ICON = require('../../../../../assets/icons/pauseIcon.png');
// const SHARE_ICON = require('../../../../../assets/icons/shareIcon.png');
// const SAVE_ICON = require('../../../../../assets/icons/saveIcon.png');

// /* Sizes */
// const DECAL_SIZE = 352;
// const BOWL_SIZE = 260;
// const SHELL_COUNT = 16;
// const SHELL_MIN = 44;
// const SHELL_MAX = 48;
// const SHELL_PADDING = 16;

// /* No-overlap controls */
// const SHELL_GAP = 10;
// const RADIUS_SCALE = 0.6;
// const MAX_ATTEMPTS = 500;

// /* helpers */
// const rand = (min: number, max: number) => Math.random() * (max - min) + min;
// const shuffle = <T,>(a: T[]) => {
//   const b = [...a];
//   for (let i = b.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [b[i], b[j]] = [b[j], b[i]];
//   }
//   return b;
// };

// type ShellConfig = {
//   size: number;
//   startX: number;
//   startY: number;
//   targetX: number;
//   targetY: number;
//   rot: number;
//   delay: number;
//   source: ImageSourcePropType;
// };

// function ShellSprite({
//   size, x, y, rot, opacity, scale, source,
// }: {
//   size: number;
//   x: Animated.SharedValue<number>;
//   y: Animated.SharedValue<number>;
//   rot: Animated.SharedValue<number>;
//   opacity: Animated.SharedValue<number>;
//   scale: Animated.SharedValue<number>;
//   source: ImageSourcePropType;
// }) {
//   const style = useAnimatedStyle(() => ({
//     position: 'absolute',
//     left: x.value,
//     top: y.value,
//     width: size,
//     height: size,
//     opacity: opacity.value,
//     transform: [{ rotate: `${rot.value}deg` }, { scale: scale.value }],
//   }));
//   return <Animated.Image source={source} style={style} resizeMode="contain" />;
// }

// const CaurisCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
// const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

//   // 0 = intro, 1 = casting, 2 = pattern reveal, 3 = divine message
//   const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const circleScale = useSharedValue(1);
//   const circleAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }] }));

//   // pick 6 shells for second image
//   const shell2Set = useMemo(() => {
//     const idx = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(0, 6);
//     return new Set(idx);
//   }, []);

//   // Non-overlapping placement
//   const shellConfigs: ShellConfig[] = useMemo(() => {
//     const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
//     const R = effectiveSize / 2;
//     const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };

//     // sizes & place larger first
//     const sizes = Array.from({ length: SHELL_COUNT }, () => rand(SHELL_MIN, SHELL_MAX));
//     const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort((a, b) => sizes[b] - sizes[a]);

//     type P = { cx: number; cy: number; r: number };
//     const placed: P[] = [];
//     const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(null as any);

//     const insideCircle = (cx: number, cy: number, rEff: number) => {
//       const dx = cx - center.x, dy = cy - center.y;
//       return Math.hypot(dx, dy) <= (R - rEff);
//     };

//     for (const idx of order) {
//       const size = sizes[idx];
//       const rEff = (size / 2) * RADIUS_SCALE;
//       let done = false;

//       for (let k = 0; k < MAX_ATTEMPTS; k++) {
//         const angle = rand(0, Math.PI * 2);
//         const radius = Math.sqrt(Math.random()) * (R - rEff);
//         const cx = center.x + radius * Math.cos(angle);
//         const cy = center.y + radius * Math.sin(angle);
//         if (!insideCircle(cx, cy, rEff)) continue;

//         let ok = true;
//         for (const p of placed) {
//           const dx = cx - p.cx, dy = cy - p.cy;
//           const minD = p.r + rEff + SHELL_GAP;
//           if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
//         }
//         if (ok) {
//           placed.push({ cx, cy, r: rEff });
//           targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//           done = true;
//           break;
//         }
//       }

//       if (!done) {
//         const cx = center.x;
//         const cy = center.y;
//         placed.push({ cx, cy, r: rEff });
//         targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//       }
//     }

//     // build final configs in original index order
//     return Array.from({ length: SHELL_COUNT }).map((_, i) => {
//       const size = sizes[i];
//       const { tx, ty } = targets[i];
//       const startX = center.x + rand(-25, 25) - size / 2;
//       const startY = BOWL_SIZE + rand(40, 80);
//       return {
//         size,
//         startX,
//         startY,
//         targetX: tx,
//         targetY: ty,
//         rot: rand(-150, 150),
//         delay: i * 70 + rand(0, 120),
//         source: shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1,
//       };
//     });
//   }, [shell2Set]);

//   // animated SVs
//   const xSV = shellConfigs.map(c => useSharedValue(c.startX));
//   const ySV = shellConfigs.map(c => useSharedValue(c.startY));
//   const rSV = shellConfigs.map(() => useSharedValue(0));
//   const sSV = shellConfigs.map(() => useSharedValue(0.7));
//   const oSV = shellConfigs.map(() => useSharedValue(0));

//   const onActionPress = () => {
//     if (phase === 0) {
//       circleScale.value = withSpring(0.98, { damping: 20, stiffness: 240 }, () => {
//         circleScale.value = withSpring(1);
//       });
//       shellConfigs.forEach((c, i) => {
//         xSV[i].value = withDelay(c.delay, withSpring(c.targetX, { damping: 14, stiffness: 170 }));
//         ySV[i].value = withDelay(c.delay, withSpring(c.targetY, { damping: 14, stiffness: 170 }));
//         rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
//         sSV[i].value = withDelay(c.delay, withSpring(1, { damping: 14, stiffness: 200 }));
//         oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
//       });
//       setPhase(1);
//     } else if (phase === 1) {
//       setPhase(2);
//     } else if (phase === 2) {
//       setPhase(3);
//     } else {
//   setShowSubscriptionModal(true);
//     }
//   };

//   const titleTop =
//     phase === 0 ? 'Cowrie Shells Divination'
//       : phase === 1 ? 'Casting the Shells'
//         : phase === 2 ? 'Your divine pattern is'
//           : 'Your Divine Message';

//   const subtitle =
//     phase === 0 ? 'Unveil sacred wisdom through ancient African spiritual practice.'
//       : phase === 1 ? 'The spirits are being summoned…'
//         : undefined;

//   const actionLabel =
//     phase === 0 ? 'Throw the Shells'
//       : phase === 1 ? 'Continue'
//         : phase === 2 ? 'Reveal My Reading'
//           : 'Get Premium For Full Reading';

//   const showShells = phase >= 1;

//   // 🔊 Text to speak
//   const divineMessage = `Obara Meji reveals growth, community, and learning through connection. You are guided to seek wisdom through dialogue and remain open to spiritual instruction. This is a time to trust the flow of energy around you and lean into shared experiences. The ancestors remind you that clarity comes when you listen with your soul, not just your ears.`;

//   // properly-typed subscriptions with .remove() or .removeListener() ----
//   type TtsSub = { remove?: () => void; removeListener?: () => void };

//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//   Tts.setDefaultRate(0.4, true);

//     const onStart = () => setIsSpeaking(true);
//     const onFinish = () => setIsSpeaking(false);
//     const onCancel = () => setIsSpeaking(false);

//     const startSub = Tts.addEventListener('tts-start', onStart) as unknown as TtsSub;
//     const finishSub = Tts.addEventListener('tts-finish', onFinish) as unknown as TtsSub;
//     const cancelSub = Tts.addEventListener('tts-cancel', onCancel) as unknown as TtsSub;

//     return () => {
//       startSub?.remove?.();
//       startSub?.removeListener?.();
//       finishSub?.remove?.();
//       finishSub?.removeListener?.();
//       cancelSub?.remove?.();
//       cancelSub?.removeListener?.();
//       Tts.stop();
//     };
//   }, []);

//   const onPressPlayToggle = async () => {
//     if (!divineMessage.trim()) return;

//     if (isSpeaking) {
//       await Tts.stop();
//       setIsSpeaking(false);
//     } else {
//       await Tts.stop();
//       Tts.speak(divineMessage);
//     }
//   };

//   return (
//     <ImageBackground source={BG_IMG} style={styles.bgImage} imageStyle={{ resizeMode: 'cover' }}>
//       <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
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

//         <ScrollView
//           contentContainerStyle={[
//             styles.scrollContent,
//             { paddingBottom: phase === 3 ? 20 : 24 },
//           ]}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Top Titles */}
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>{titleTop}</Text>

//             {subtitle ? (
//               <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>{subtitle}</Text>
//             ) : null}

//             {phase === 2 && (
//               <Text style={[styles.patternName, { color: colors.white }]}>Obara Meji</Text>
//             )}

//             {phase === 3 && (
//               <>
//                 <Text style={[styles.patternName, { color: colors.white }]}>Obara Meji</Text>
//               </>
//             )}
//           </View>

//           {/* Decal + Bowl */}
//           <View style={styles.centerImageWrap}>
//             <Image source={DECAL_IMG} style={styles.decalFull} resizeMode="contain" />
//             <Animated.View
//               style={[
//                 styles.circleWrap,
//                 { left: (CONTAINER_W - BOWL_SIZE) / 2, borderColor: colors.primary },
//                 circleAnimStyle,
//               ]}
//             >
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.circleGradient}>
//                 <View />
//               </GradientBox>

//               {showShells && (
//                 <View style={[styles.shellsOverlay, { padding: SHELL_PADDING }]} pointerEvents="none">
//                   {shellConfigs.map((cfg, i) => (
//                     <ShellSprite
//                       key={`shell-${i}`}
//                       size={cfg.size}
//                       x={xSV[i]}
//                       y={ySV[i]}
//                       rot={rSV[i]}
//                       opacity={oSV[i]}
//                       scale={sSV[i]}
//                       source={cfg.source}
//                     />
//                   ))}
//                 </View>
//               )}
//             </Animated.View>
//           </View>

//           {/* Phase 3 */}
//           {phase === 3 && (
//             <>
//               {/* Play/Pause icon centered */}
//               <View style={styles.playWrapper}>
//                 <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
//                   <Image
//                     source={isSpeaking ? PAUSE_ICON : PLAY_ICON}
//                     style={[styles.playIcon, { opacity: isSpeaking ? 0.9 : 1 }]}
//                     resizeMode="contain"
//                   />
//                 </TouchableOpacity>
//               </View>

//               <Text style={[styles.messageText, { color: colors.white }]}>
//                 {divineMessage}
//               </Text>

//               {/* Share / Save */}
//               <View style={styles.shareRow}>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.smallBtn, { borderColor: colors.primary }]}>
//                   <Image source={SHARE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={[styles.smallBtnText, { color: colors.white }]}>Share</Text>
//                 </GradientBox>

//                 <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.smallBtn, { borderColor: colors.primary }]}>
//                   <Image source={SAVE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={[styles.smallBtnText, { color: colors.white }]}>Save</Text>
//                 </GradientBox>
//               </View>
//             </>
//           )}

//           {/* Action Button */}
//           <View style={styles.actionsRow}>
//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={onActionPress}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.actionButton, { borderColor: colors.primary }]}>
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>{actionLabel}</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>

//       {/* Subscription Plan Modal */}
//         <SubscriptionPlanModal
//   isVisible={showSubscriptionModal}
//   onClose={() => setShowSubscriptionModal(false)}
//   onConfirm={(plan) => {
//     setShowSubscriptionModal(false);
//     console.log('User selected plan:', plan);

//   }}
// />

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
//     backgroundColor: 'transparent'
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }), backgroundColor: 'transparent'
//   },

//   /* Header */
//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   backIcon: {
//     width: 22,
//     height: 22
//   },
//   headerTitleWrap: {
//     maxWidth: '70%',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize'
//   },

//   scrollContent: { alignItems: 'center' },

//   /* Titles */
//   contentHeader: {
//     marginTop: 16,
//     width: '100%',
//     alignItems: 'center'
//   },
//   contentTitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     letterSpacing: 0.5
//   },

//   contentSubtitle: {
//     marginTop: 6,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     opacity: 0.9
//   },

//   eyebrow: {
//     marginTop: 2,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     opacity: 0.9,
//   },
//   patternName: {
//     marginTop: 8,
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 28,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//     textAlign: 'center',
//   },

//   centerImageWrap: {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 15,
//     marginBottom: 8,
//     height: DECAL_SIZE
//   },
//   decalFull: {
//     width: '100%',
//     height: DECAL_SIZE
//   },

//   circleWrap: {
//     position: 'absolute',
//     top: (DECAL_SIZE - BOWL_SIZE) / 2,
//     width: BOWL_SIZE, height: BOWL_SIZE,
//     borderRadius: BOWL_SIZE / 2, borderWidth: 2, overflow: 'hidden',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   circleGradient: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//     borderRadius: BOWL_SIZE / 2,
//     padding: 0
//   },

//   shellsOverlay: {
//     position: 'absolute',
//     width: BOWL_SIZE,
//     height: BOWL_SIZE,
//     left: 0,
//     top: 0
//   },

//   // Divine message paragraph
//   messageText: {
//     marginTop: 18,
//     paddingHorizontal: 8,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 16,
//   lineHeight: 24,
//     opacity: 0.95,
//   },

//   // Play/Pause icon wrapper
//   playWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   playIcon: { width: 40, height: 40 },

//   // Share / Save small buttons
//   shareRow: {
//     marginTop: 16,
//     width: '100%',
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   smallBtn: {
//     minWidth: 120,
//     height: 46,
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     borderWidth: 1.1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   smallIcon: {
//     width: 15,
//     height: 15,
//     marginRight: 8,
//     resizeMode: 'contain'
//   },

//   smallBtnText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//   },

//   /* Action Button */
//   actionsRow: { width: '100%', marginTop: 24, marginBottom: 12 },
//   actionTouchable: { flex: 1 },
//   actionButton: {
//     height: 57,
//     borderRadius: 28.5,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     borderWidth: 1.3,
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 3,
//   },
//   actionLabel: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14
//   },
// });

// import React, { useMemo, useState } from 'react';
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
//   ImageSourcePropType,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   withDelay,
// } from 'react-native-reanimated';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CONTAINER_W = SCREEN_WIDTH - 40; // container has paddingHorizontal:20

// /* ---------- Assets ---------- */
// const BG_IMG       = require('../../../../assets/images/backgroundImage.png');
// const DECAL_IMG    = require('../../../../assets/images/decalImage.png'); // full width
// const SHELL_IMG_1  = require('../../../../assets/images/shell1.png');
// const SHELL_IMG_2  = require('../../../../assets/images/shell2.png');

// /* ---------- Sizes ---------- */
// const DECAL_SIZE  = 352;
// const BOWL_SIZE   = 260;
// /** increased sizes */
// const SHELL_COUNT = 16;
// const SHELL_MIN   = 44;
// const SHELL_MAX   = 48;

// /* inner padding so shells spread nicely */
// const SHELL_PADDING = 16;

// /* ---- Overlap control ---- */
// const SHELL_GAP = 12;                 // Minimum edge-to-edge gap (px)
// const EFFECTIVE_RADIUS_SCALE = 0.55;  // Treat image as circle with slightly bigger radius
// const BEST_CANDIDATE_SAMPLES = 60;    // Candidates per shell
// const MAX_ATTEMPTS_PER_SHELL = 600;   // Fallback random retries

// /* ---------- Helpers ---------- */
// const rand = (min: number, max: number) => Math.random() * (max - min) + min;
// const shuffle = <T,>(arr: T[]) => {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// };

// type ShellConfig = {
//   size: number;
//   startX: number;
//   startY: number;
//   targetX: number;
//   targetY: number;
//   rot: number;
//   delay: number;
//   source: ImageSourcePropType;
// };

// /* Single shell sprite */
// function ShellSprite({
//   size,
//   x,
//   y,
//   rot,
//   opacity,
//   scale,
//   source,
// }: {
//   size: number;
//   x: Animated.SharedValue<number>;
//   y: Animated.SharedValue<number>;
//   rot: Animated.SharedValue<number>;
//   opacity: Animated.SharedValue<number>;
//   scale: Animated.SharedValue<number>;
//   source: ImageSourcePropType;
// }) {
//   const style = useAnimatedStyle(() => ({
//     position: 'absolute',
//     left: x.value,
//     top: y.value,
//     width: size,
//     height: size,
//     opacity: opacity.value,
//     transform: [{ rotate: `${rot.value}deg` }, { scale: scale.value }],
//   }));
//   return <Animated.Image source={source} style={style} resizeMode="contain" />;
// }

// const CaurisCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   const [thrown, setThrown] = useState(false);

//   // bounce the circular box when throwing
//   const circleScale = useSharedValue(1);
//   const circleAnimStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: circleScale.value }],
//   }));

//   /* Pick exactly 6 indices for shell2, rest shell1 */
//   const shell2Set = useMemo(() => {
//     const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(0, 6);
//     return new Set(indices);
//   }, []);

//   /**
//    * Best-candidate non-overlapping placement in a circle:
//    * - Place larger shells first.
//    * - For each shell, sample N candidates (uniform by area) and pick the one
//    *   that maximizes the minimum clearance to already placed shells.
//    * - Ensure inside bounds (within circle minus own radius).
//    * - Strong gap enforced via SHELL_GAP and EFFECTIVE_RADIUS_SCALE.
//    */
//   const shellConfigs: ShellConfig[] = useMemo(() => {
//     const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
//     const R = effectiveSize / 2;

//     // Center in overlay coordinates (overlay itself is at 0,0 but we add padding visually)
//     const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };

//     // Pre-generate sizes so we can sort by size (desc)
//     const sizes = Array.from({ length: SHELL_COUNT }, () => rand(SHELL_MIN, SHELL_MAX));
//     const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort(
//       (a, b) => sizes[b] - sizes[a]
//     );

//     type Placed = { cx: number; cy: number; r: number };
//     const placed: Placed[] = [];
//     const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(null as any);

//     const insideBounds = (cx: number, cy: number, radEff: number) => {
//       // must lie within circle of radius R, but keep margin radEff
//       const dx = cx - center.x;
//       const dy = cy - center.y;
//       const dist = Math.sqrt(dx*dx + dy*dy);
//       return dist <= (R - radEff);
//     };

//     const minClearance = (cx: number, cy: number, radEff: number) => {
//       // minimum (distance - (r1+r2)) across all placed shells
//       let minC = Infinity;
//       for (const p of placed) {
//         const dx = cx - p.cx;
//         const dy = cy - p.cy;
//         const d = Math.sqrt(dx*dx + dy*dy);
//         const required = p.r + radEff;
//         const clearance = d - required;
//         if (clearance < minC) minC = clearance;
//       }
//       return placed.length ? minC : Infinity;
//     };

//     for (const idx of order) {
//       const size = sizes[idx];
//       const radEff = (size / 2) * EFFECTIVE_RADIUS_SCALE; // conservative effective circle
//       let best: { cx: number; cy: number; minC: number } | null = null;

//       // Best-candidate sampling
//       for (let s = 0; s < BEST_CANDIDATE_SAMPLES; s++) {
//         const angle = rand(0, Math.PI * 2);
//         const radius = Math.sqrt(Math.random()) * (R - radEff); // keep fully inside
//         const cx = center.x + radius * Math.cos(angle);
//         const cy = center.y + radius * Math.sin(angle);
//         if (!insideBounds(cx, cy, radEff)) continue;

//         const clearance = minClearance(cx, cy, radEff);
//         if (best === null || clearance > best.minC) {
//           best = { cx, cy, minC: clearance };
//         }
//       }

//       let used = false;

//       // If best candidate has acceptable clearance, place it
//       if (best && best.minC >= SHELL_GAP) {
//         placed.push({ cx: best.cx, cy: best.cy, r: radEff });
//         targets[idx] = { tx: best.cx - size / 2, ty: best.cy - size / 2 };
//         used = true;
//       }

//       // Fallback random retries if needed
//       if (!used) {
//         let attempts = 0;
//         while (attempts < MAX_ATTEMPTS_PER_SHELL) {
//           attempts++;
//           const angle = rand(0, Math.PI * 2);
//           const radius = Math.sqrt(Math.random()) * (R - radEff);
//           const cx = center.x + radius * Math.cos(angle);
//           const cy = center.y + radius * Math.sin(angle);
//           if (!insideBounds(cx, cy, radEff)) continue;

//           let ok = true;
//           for (const p of placed) {
//             const dx = cx - p.cx;
//             const dy = cy - p.cy;
//             const d2 = dx*dx + dy*dy;
//             const minD = p.r + radEff + SHELL_GAP;
//             if (d2 < minD * minD) {
//               ok = false;
//               break;
//             }
//           }
//           if (ok) {
//             placed.push({ cx, cy, r: radEff });
//             targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//             used = true;
//             break;
//           }
//         }
//       }

//       // Extreme fallback: put it right at center with big margin (should rarely trigger)
//       if (!used) {
//         const cx = center.x;
//         const cy = center.y;
//         placed.push({ cx, cy, r: radEff });
//         targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//       }
//     }

//     // Build final configs in original index order
//     const configs: ShellConfig[] = Array.from({ length: SHELL_COUNT }).map((_, i) => {
//       const size = sizes[i];
//       const { tx, ty } = targets[i];

//       // start slightly below the bowl and near center
//       const startX = center.x + rand(-25, 25) - size / 2;
//       const startY = BOWL_SIZE + rand(40, 80);

//       const rot = rand(-150, 150);
//       const delay = i * 70 + rand(0, 120);
//       const source = shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1;

//       return {
//         size,
//         startX,
//         startY,
//         targetX: tx,
//         targetY: ty,
//         rot,
//         delay,
//         source,
//       };
//     });

//     return configs;
//   }, [shell2Set]);

//   /* Per-shell animated values */
//   const xSV = shellConfigs.map(c => useSharedValue(c.startX));
//   const ySV = shellConfigs.map(c => useSharedValue(c.startY));
//   const rSV = shellConfigs.map(() => useSharedValue(0));
//   const sSV = shellConfigs.map(() => useSharedValue(0.7));
//   const oSV = shellConfigs.map(() => useSharedValue(0));

//   const onThrowPress = () => {
//     if (thrown) {
//       // navigation.navigate('CaurisReading');
//       return;
//     }

//     // bounce the circular gradient box
//     circleScale.value = withSpring(0.98, { damping: 20, stiffness: 240 }, () => {
//       circleScale.value = withSpring(1);
//     });

//     // animate to non-overlapping targets
//     shellConfigs.forEach((c, i) => {
//       xSV[i].value = withDelay(c.delay, withSpring(c.targetX, { damping: 14, stiffness: 170 }));
//       ySV[i].value = withDelay(c.delay, withSpring(c.targetY, { damping: 14, stiffness: 170 }));
//       rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
//       sSV[i].value = withDelay(c.delay, withSpring(1, { damping: 14, stiffness: 200 }));
//       oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
//     });

//     setThrown(true);
//   };

//   return (
//     <ImageBackground source={BG_IMG} style={styles.bgImage} imageStyle={{ resizeMode: 'cover' }}>
//       <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

//         {/* Content */}
//         <ScrollView
//           contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Title & subtitle */}
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
//               {thrown ? 'Casting the Shells' : 'Cowrie Shells Divination'}
//             </Text>
//             <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
//               {thrown ? 'The spirits are being summoned…' : 'Unveil sacred wisdom through ancient African spiritual practice.'}
//             </Text>
//           </View>

//           {/* ---- Decal + Circular Box ---- */}
//           <View style={styles.centerImageWrap}>
//             {/* Full-width decal image (background) */}
//             <Image source={DECAL_IMG} style={styles.decalFull} resizeMode="contain" />

//             {/* Circular gradient box (260x260) centered on top of decal */}
//             <Animated.View
//               style={[
//                 styles.circleWrap,
//                 { left: (CONTAINER_W - BOWL_SIZE) / 2, borderColor: colors.primary },
//                 circleAnimStyle,
//               ]}
//             >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.circleGradient}
//                 >
//                   <View />
//                 </GradientBox>

//                 {/* Shells overlay inside the circle with inner padding */}
//                 <View style={[styles.shellsOverlay, { padding: SHELL_PADDING }]} pointerEvents="none">
//                   {shellConfigs.map((cfg, i) => (
//                     <ShellSprite
//                       key={`shell-${i}`}
//                       size={cfg.size}
//                       x={xSV[i]}
//                       y={ySV[i]}
//                       rot={rSV[i]}
//                       opacity={oSV[i]}
//                       scale={sSV[i]}
//                       source={cfg.source}
//                     />
//                   ))}
//                 </View>
//             </Animated.View>
//           </View>

//           {/* Action button (not fixed; part of scroll content) */}
//           <View style={styles.actionsRow}>
//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={onThrowPress}>
//               <GradientBox
//                 colors={[colors.black, colors.bgBox]}
//                 style={[styles.actionButton, { borderColor: colors.primary }]}
//               >
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>
//                   {thrown ? 'Continue' : 'Throw the Shells'}
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

//   scrollContent: {
//     alignItems: 'center',
//   },

//   /* Titles */
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

//   centerImageWrap: {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 24,
//     marginBottom: 8,
//     height: DECAL_SIZE,
//   },
//   decalFull: {
//     width: '100%',
//     height: DECAL_SIZE,
//   },

//   circleWrap: {
//     position: 'absolute',
//     top: (DECAL_SIZE - BOWL_SIZE) / 2,
//     width: BOWL_SIZE,
//     height: BOWL_SIZE,
//     borderRadius: BOWL_SIZE / 2,
//     borderWidth: 2,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   circleGradient: {
//     position: 'absolute',
//     left: 0, right: 0, top: 0, bottom: 0,
//     borderRadius: BOWL_SIZE / 2,
//     padding: 0,
//   },

//   shellsOverlay: {
//     position: 'absolute',
//     width: BOWL_SIZE,
//     height: BOWL_SIZE,
//     left: 0,
//     top: 0,
//   },

//   /* Action Button (in flow, not fixed) */
//   actionsRow: {
//     width: '100%',
//     marginTop: 24,
//     marginBottom: 12,
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
//     borderWidth: 1.3,
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 3,
//   },
//   actionLabel: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//   },
// });













// import React, { useMemo, useState } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions,
//   ImageBackground, Image, Platform, ScrollView, ImageSourcePropType,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CONTAINER_W = SCREEN_WIDTH - 40;

// /* Assets */
// const BG_IMG = require('../../../../assets/images/backgroundImage.png');
// const DECAL_IMG = require('../../../../assets/images/decalImage.png');
// const SHELL_IMG_1 = require('../../../../assets/images/shell1.png');
// const SHELL_IMG_2 = require('../../../../assets/images/shell2.png');

// const PLAY_ICON = require('../../../../assets/icons/playIcon.png');
// const SHARE_ICON = require('../../../../assets/icons/shareIcon.png');
// const SAVE_ICON = require('../../../../assets/icons/saveIcon.png');

// /* Sizes */
// const DECAL_SIZE = 352;
// const BOWL_SIZE = 260;
// const SHELL_COUNT = 16;
// const SHELL_MIN = 44;
// const SHELL_MAX = 48;
// const SHELL_PADDING = 16;

// /* No-overlap controls */
// const SHELL_GAP = 10;
// const RADIUS_SCALE = 0.6;
// const MAX_ATTEMPTS = 500;

// /* helpers */
// const rand = (min: number, max: number) => Math.random() * (max - min) + min;
// const shuffle = <T,>(a: T[]) => {
//   const b = [...a];
//   for (let i = b.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [b[i], b[j]] = [b[j], b[i]];
//   }
//   return b;
// };

// type ShellConfig = {
//   size: number;
//   startX: number;
//   startY: number;
//   targetX: number;
//   targetY: number;
//   rot: number;
//   delay: number;
//   source: ImageSourcePropType;
// };

// function ShellSprite({
//   size, x, y, rot, opacity, scale, source,
// }: {
//   size: number;
//   x: Animated.SharedValue<number>;
//   y: Animated.SharedValue<number>;
//   rot: Animated.SharedValue<number>;
//   opacity: Animated.SharedValue<number>;
//   scale: Animated.SharedValue<number>;
//   source: ImageSourcePropType;
// }) {
//   const style = useAnimatedStyle(() => ({
//     position: 'absolute',
//     left: x.value,
//     top: y.value,
//     width: size,
//     height: size,
//     opacity: opacity.value,
//     transform: [{ rotate: `${rot.value}deg` }, { scale: scale.value }],
//   }));
//   return <Animated.Image source={source} style={style} resizeMode="contain" />;
// }

// const CaurisCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   // 0 = intro, 1 = casting, 2 = pattern reveal, 3 = divine message
//   const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

//   const circleScale = useSharedValue(1);
//   const circleAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }] }));

//   // pick 6 shells for second image
//   const shell2Set = useMemo(() => {
//     const idx = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(0, 6);
//     return new Set(idx);
//   }, []);

//   // Non-overlapping placement
//   const shellConfigs: ShellConfig[] = useMemo(() => {
//     const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
//     const R = effectiveSize / 2;
//     const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };

//     // sizes & place larger first
//     const sizes = Array.from({ length: SHELL_COUNT }, () => rand(SHELL_MIN, SHELL_MAX));
//     const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort((a, b) => sizes[b] - sizes[a]);

//     type P = { cx: number; cy: number; r: number };
//     const placed: P[] = [];
//     const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(null as any);

//     const insideCircle = (cx: number, cy: number, rEff: number) => {
//       const dx = cx - center.x, dy = cy - center.y;
//       return Math.hypot(dx, dy) <= (R - rEff);
//     };

//     for (const idx of order) {
//       const size = sizes[idx];
//       const rEff = (size / 2) * RADIUS_SCALE;
//       let done = false;

//       for (let k = 0; k < MAX_ATTEMPTS; k++) {
//         const angle = rand(0, Math.PI * 2);
//         const radius = Math.sqrt(Math.random()) * (R - rEff);
//         const cx = center.x + radius * Math.cos(angle);
//         const cy = center.y + radius * Math.sin(angle);
//         if (!insideCircle(cx, cy, rEff)) continue;

//         let ok = true;
//         for (const p of placed) {
//           const dx = cx - p.cx, dy = cy - p.cy;
//           const minD = p.r + rEff + SHELL_GAP;
//           if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
//         }
//         if (ok) {
//           placed.push({ cx, cy, r: rEff });
//           targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//           done = true;
//           break;
//         }
//       }

//       if (!done) {
//         const cx = center.x;
//         const cy = center.y;
//         placed.push({ cx, cy, r: rEff });
//         targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
//       }
//     }

//     // build final configs in original index order
//     return Array.from({ length: SHELL_COUNT }).map((_, i) => {
//       const size = sizes[i];
//       const { tx, ty } = targets[i];
//       const startX = center.x + rand(-25, 25) - size / 2;
//       const startY = BOWL_SIZE + rand(40, 80);
//       return {
//         size,
//         startX,
//         startY,
//         targetX: tx,
//         targetY: ty,
//         rot: rand(-150, 150),
//         delay: i * 70 + rand(0, 120),
//         source: shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1,
//       };
//     });
//   }, [shell2Set]);

//   // animated SVs
//   const xSV = shellConfigs.map(c => useSharedValue(c.startX));
//   const ySV = shellConfigs.map(c => useSharedValue(c.startY));
//   const rSV = shellConfigs.map(() => useSharedValue(0));
//   const sSV = shellConfigs.map(() => useSharedValue(0.7));
//   const oSV = shellConfigs.map(() => useSharedValue(0));

//   const onActionPress = () => {
//     if (phase === 0) {
//       // throw -> go to phase 1 (Casting) with animation
//       circleScale.value = withSpring(0.98, { damping: 20, stiffness: 240 }, () => {
//         circleScale.value = withSpring(1);
//       });
//       shellConfigs.forEach((c, i) => {
//         xSV[i].value = withDelay(c.delay, withSpring(c.targetX, { damping: 14, stiffness: 170 }));
//         ySV[i].value = withDelay(c.delay, withSpring(c.targetY, { damping: 14, stiffness: 170 }));
//         rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
//         sSV[i].value = withDelay(c.delay, withSpring(1, { damping: 14, stiffness: 200 }));
//         oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
//       });
//       setPhase(1);
//     } else if (phase === 1) {
//       setPhase(2);
//     } else if (phase === 2) {
//       setPhase(3);
//     } else {
//       // CTA on phase 3 (hook premium flow)
//       // navigation.navigate('Premium');
//     }
//   };

//   // UI text per phase
//   const titleTop =
//     phase === 0 ? 'Cowrie Shells Divination'
//       : phase === 1 ? 'Casting the Shells'
//         : phase === 2 ? 'Your divine pattern is'
//           : 'Your Divine Message';

//   const subtitle =
//     phase === 0 ? 'Unveil sacred wisdom through ancient African spiritual practice.'
//       : phase === 1 ? 'The spirits are being summoned…'
//         : undefined;

//   const actionLabel =
//     phase === 0 ? 'Throw the Shells'
//       : phase === 1 ? 'Continue'
//         : phase === 2 ? 'Reveal My Reading'
//           : 'Get Premium For Full Reading';

//   const showShells = phase >= 1;

//   return (
//     <ImageBackground source={BG_IMG} style={styles.bgImage} imageStyle={{ resizeMode: 'cover' }}>
//       <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

//         <ScrollView
//           contentContainerStyle={[
//             styles.scrollContent,
//             { paddingBottom: phase === 3 ? 20 : 24 }, // full scroll in phase 3
//           ]}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Top Titles */}
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>{titleTop}</Text>

//             {subtitle ? (
//               <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>{subtitle}</Text>
//             ) : null}

//             {/* Phase 2 big pattern name */}
//             {phase === 2 && (
//               <Text style={[styles.patternName, { color: colors.white }]}>Obara Meji</Text>
//             )}

//             {/* Phase 3 eyebrow + big title */}
//             {phase === 3 && (
//               <>

//                 <Text style={[styles.patternName, { color: colors.white }]}>Obara Meji</Text>
//               </>
//             )}
//           </View>

//           {/* Decal + Bowl */}
//           <View style={styles.centerImageWrap}>
//             <Image source={DECAL_IMG} style={styles.decalFull} resizeMode="contain" />
//             <Animated.View
//               style={[
//                 styles.circleWrap,
//                 { left: (CONTAINER_W - BOWL_SIZE) / 2, borderColor: colors.primary },
//                 circleAnimStyle,
//               ]}
//             >
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.circleGradient}>
//                 <View />
//               </GradientBox>

//               {/* Shells visible in phase 1,2,3 */}
//               {showShells && (
//                 <View style={[styles.shellsOverlay, { padding: SHELL_PADDING }]} pointerEvents="none">
//                   {shellConfigs.map((cfg, i) => (
//                     <ShellSprite
//                       key={`shell-${i}`}
//                       size={cfg.size}
//                       x={xSV[i]}
//                       y={ySV[i]}
//                       rot={rSV[i]}
//                       opacity={oSV[i]}
//                       scale={sSV[i]}
//                       source={cfg.source}
//                     />
//                   ))}
//                 </View>
//               )}
//             </Animated.View>
//           </View>

//           {/* Phase 3*/}
//           {phase === 3 && (
//             <>

//                {/* Play icon centered, */}

//               <View style={styles.playWrapper}>
//                 <Image source={PLAY_ICON} style={styles.playIcon} resizeMode="contain" />
//               </View>

//               <Text style={[styles.messageText, { color: colors.white }]}>
//                 “Obara Meji reveals growth, community, and learning through connection. You are guided
//                 to seek wisdom through dialogue and remain open to spiritual instruction. This is a time to
//                 trust the flow of energy around you and lean into shared experiences. The ancestors
//                 remind you that clarity comes when you listen with your soul, not just your ears.”
//               </Text>

//               {/* Share / Save */}
//               <View style={styles.shareRow}>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.smallBtn, { borderColor: colors.primary }]}>
//                   <Image source={SHARE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={[styles.smallBtnText, { color: colors.white }]}>Share</Text>
//                 </GradientBox>

//                 <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.smallBtn, { borderColor: colors.primary }]}>
//                   <Image source={SAVE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={[styles.smallBtnText, { color: colors.white }]}>Save</Text>
//                 </GradientBox>
//               </View>
//             </>
//           )}

//           {/* Action Button (advances phases / CTA) */}
//           <View style={styles.actionsRow}>
//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={onActionPress}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.actionButton, { borderColor: colors.primary }]}>
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>{actionLabel}</Text>
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
//   bgImage:
//   {
//     flex: 1,
//     width: SCREEN_WIDTH,
//     backgroundColor: 'transparent'
//   },
//   container:
//   {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }), backgroundColor: 'transparent'
//   },

//   /* Header */
//   header:
//   {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8
//   },
//   backBtn:
//   {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   backIcon:
//   {
//     width: 22,
//     height: 22
//   },
//   headerTitleWrap:
//   {
//     maxWidth: '70%',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   headerTitle:
//   {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize'
//   },

//   scrollContent: { alignItems: 'center' },

//   /* Titles */
//   contentHeader:
//   {
//     marginTop: 16,
//     width: '100%',
//     alignItems: 'center'
//   },
//   contentTitle:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     letterSpacing: 0.5
//   },

//   contentSubtitle:
//   {
//     marginTop: 6,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     opacity: 0.9
//   },

//   eyebrow: {
//     marginTop: 2,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     opacity: 0.9,
//   },
//   patternName: {
//     marginTop: 8,
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 28,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//     textAlign: 'center',
//   },

//   centerImageWrap:
//   {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 24,
//     marginBottom: 8,
//     height: DECAL_SIZE
//   },
//   decalFull:
//   {
//     width: '100%',
//     height: DECAL_SIZE
//   },

//   circleWrap: {
//     position: 'absolute',
//     top: (DECAL_SIZE - BOWL_SIZE) / 2,
//     width: BOWL_SIZE, height: BOWL_SIZE,
//     borderRadius: BOWL_SIZE / 2, borderWidth: 2, overflow: 'hidden',
//     alignItems: 'center', justifyContent: 'center',
//   },
//   circleGradient:
//   {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//     borderRadius: BOWL_SIZE / 2,
//     padding: 0
//   },

//   shellsOverlay:
//   {
//     position: 'absolute',
//     width: BOWL_SIZE,
//     height: BOWL_SIZE,
//     left: 0,
//     top: 0
//   },

//   // Divine message paragraph
//   messageText: {
//     marginTop: 18,
//     paddingHorizontal: 8,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 16,
//     fontWeight: '400' as any,
//     lineHeight: 24,
//     opacity: 0.95,
//   },

//   // Play icon wrapper
//   playWrapper: {

//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   playIcon: { width: 36, height: 36 },

//   // Share / Save small buttons
//   shareRow: {
//     marginTop: 16,
//     width: '100%',
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   smallBtn: {
//     minWidth: 120,
//     height: 46,
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     borderWidth: 1.1,
//     flexDirection: 'row',

//     justifyContent: 'center',
//   },
//   smallIcon:
//   {
//     width: 15,
//     height: 15,
//     marginRight: 8,
//     resizeMode:'contain'
//   },

//   smallBtnText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,

//   },

//   /* Action Button */
//   actionsRow:
//     { width: '100%', marginTop: 24, marginBottom: 12 },
//   actionTouchable:
//     { flex: 1 },
//   actionButton:
//   {
//     height: 57,
//     borderRadius: 28.5,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     borderWidth: 1.3,
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 3,
//   },
//   actionLabel:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14
//   }
//   ,
// });
