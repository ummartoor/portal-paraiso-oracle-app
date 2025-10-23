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
  Vibration,
  Modal, 
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

import Video from 'react-native-video';

import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
import { useBuziosStore } from '../../../../../store/useBuziousStore';
import { useTranslation } from 'react-i18next';
import { useOpenAiStore } from '../../../../../store/useOpenAiStore';
import SoundPlayer from 'react-native-sound-player';

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
  const { t } = useTranslation();
  
  const {
    reading,
    isLoadingReading,
    readingError,
    getBuziosReading,
    isSaving,
    saveBuziosReading,
  } = useBuziosStore();

  const { preloadSpeech } = useOpenAiStore();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  // --- UPDATED: Added phase 4 for the final reading screen ---
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(null);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);

  const circleScale = useSharedValue(1);
  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const shell2Set = useMemo(() => {
    if (reading) {
      const upCount = reading.buzios_result.mouth_up_count;
      const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i));
      return new Set(indices.slice(0, upCount));
    }
    const idx = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(
      0,
      6,
    );
    return new Set(idx);
  }, [reading]);

  const shellConfigs: ShellConfig[] = useMemo(() => {
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

  // --- UPDATED: onActionPress logic for new phases ---
  const onActionPress = async () => {
    Vibration.vibrate([0, 35, 40, 35]); 
    if (phase === 0) {
      setPhase(1);
      getBuziosReading(userQuestion);
      circleScale.value = withSpring(0.98, { damping: 20, stiffness: 240 }, () => {
        circleScale.value = withSpring(1);
      });
      shellConfigs.forEach((c, i) => {
        xSV[i].value = withDelay(c.delay, withSpring(c.targetX, { damping: 14, stiffness: 170 }));
        ySV[i].value = withDelay(c.delay, withSpring(c.targetY, { damping: 14, stiffness: 170 }));
        rSV[i].value = withDelay(c.delay, withTiming(c.rot, { duration: 650 }));
        sSV[i].value = withDelay(c.delay, withSpring(1, { damping: 14, stiffness: 200 }));
        oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
      });
    } else if (phase === 2) {
      // Phase 2 button now transitions to the video screen (phase 3)
      setPhase(3); 
    } else if (phase === 4) {
      setShowSubscriptionModal(true);
    }
  };

  useEffect(() => {
    if (phase === 1 && !isLoadingReading && reading) {
      setPhase(2);
    }
  }, [isLoadingReading, reading, phase]);
  
  useEffect(() => {
    const prepareReadingAudio = async () => {
        if (reading?.ai_reading && reading?.buzios_result?.overall_polarity) {
            setIsPreloadingAudio(true);
            const readingId = `${userQuestion}_${reading.buzios_result.overall_polarity}`.replace(/[^a-zA-Z0-9]/g, '_');
            const audioPath = await preloadSpeech(reading.ai_reading, readingId);
            if (audioPath) {
                setPreloadedAudioPath(audioPath);
            }
            setIsPreloadingAudio(false);
        }
    };
    prepareReadingAudio();
  }, [reading, userQuestion, preloadSpeech]);
  
  useEffect(() => {
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      setIsPlayingAudio(false);
    });
    return () => {
      SoundPlayer.stop();
      onFinishedPlayingSubscription.remove();
    };
  }, []);

  const handleSave = () => {
    Vibration.vibrate([0, 35, 40, 35]); 
    if (reading && !isSaving) {
      saveBuziosReading(reading).then(success => {
        if (success) {
          navigation.navigate('MainTabs');
        }
      });
    }
  };
  
  const onPressPlayToggle = () => {
    if (isPlayingAudio) {
      SoundPlayer.stop();
      setIsPlayingAudio(false);
      return;
    }
    if (preloadedAudioPath) {
      try {
        SoundPlayer.playUrl(`file://${preloadedAudioPath}`);
        setIsPlayingAudio(true);
      } catch (e) {
        console.error('Could not play preloaded audio', e);
      }
    }
  };

  if (readingError) {
    Alert.alert(t('alert_error_title'), readingError, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }
  
  // --- UPDATED: Title logic for new phases ---
  const titleTop = t(
    phase === 0 ? 'cauris_phase0_title' :
    phase === 1 ? 'cauris_phase1_title' :
    phase === 2 ? 'cauris_phase2_title' :
    phase === 3 ? 'cauris_phase2_title' : // Video phase can reuse phase 2 title
    'cauris_phase3_title'
  );
  
  const subtitle = phase < 2 ? t(
    phase === 0 ? 'cauris_phase0_subtitle' :
    'cauris_phase1_subtitle'
  ) : undefined;

  // --- UPDATED: Button label logic for new phases ---
  const actionLabel = 
    phase === 0 ? t('cauris_phase0_button') :
    phase === 1 ? t('continue_button') : 
    phase === 2 ? t('cauris_phase2_button') :
    phase === 4 ? t('get_premium_button') :
    ''; // No label needed for phase 3, as the button is in the modal

  const showShells = phase >= 1;
  const divineMessage = reading?.ai_reading ?? t('cauris_default_message');

  return (
    <ImageBackground
      source={BG_IMG}
      style={styles.bgImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      {/* --- NEW: Full screen video modal for Phase 3 --- */}
      <Modal
        visible={phase === 3}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.videoContainer}>
            {/* IMPORTANT: Replace the video URI with your own video file. 
              You can use a remote URL or a local file with require().
            */}
            <Video
         source={require('../../../../../assets/videos/onboardingVideo3.mp4')}
              style={styles.videoPlayer}
              resizeMode="cover"
              repeat={true}
           
            />
            <View style={styles.videoOverlay}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.videoContinueTouchable}
                    onPress={() => setPhase(4)} // Pressing continue moves to final phase 4
                >
                    <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={[styles.actionButton, { borderColor: colors.primary }]}>
                        <Text style={[styles.actionLabel, { color: colors.white }]}>
                            {t('continue_button')}
                        </Text>
                    </GradientBox>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
              {t('cauris_header')}
            </Text>
          </View>
        </View>
        
        {/* --- MODIFIED: Main content is in ScrollView, Button is outside and at the bottom --- */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: phase === 4 ? 20 : 100 }, // Added padding to avoid overlap with bottom button
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
              {titleTop}
            </Text>
            {subtitle ? (
              <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
                {subtitle}
              </Text>
            ) : null}
            {(phase === 2 || phase === 4) && reading && (
              <Text style={[styles.patternName, { color: colors.white }]}>
                {reading.buzios_result.overall_polarity}
              </Text>
            )}
          </View>

          <View style={styles.centerImageWrap}>
            <Image source={DECAL_IMG} style={styles.decalFull} resizeMode="contain" />
            <Animated.View
              style={[
                styles.circleWrap,
                { left: (CONTAINER_W - BOWL_SIZE) / 2, borderColor: colors.primary },
                circleAnimStyle,
              ]}
            >
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.circleGradient}>
                <View />
              </GradientBox>
              {showShells && (
                <View style={[styles.shellsOverlay, { padding: SHELL_PADDING }]} pointerEvents="none">
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
        
          {/* --- UPDATED: Show final content only in phase 4 --- */}
          {phase === 4 && (
            <>
              <View style={styles.playWrapper}>
                <TouchableOpacity
                  onPress={onPressPlayToggle}
                  activeOpacity={0.7}
                  disabled={isPreloadingAudio || !preloadedAudioPath}
                  style={styles.playBtnContainer}
                >
                  {isPreloadingAudio ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : (
                    <Image
                      source={isPlayingAudio ? PAUSE_ICON : PLAY_ICON}
                      style={[
                        styles.playIcon,
                        { tintColor: (isPreloadingAudio || !preloadedAudioPath) ? '#999' : colors.primary }
                      ]}
                      resizeMode="contain"
                    />
                  )}
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
                  <Image source={SHARE_ICON} style={styles.smallIcon} resizeMode="contain" />
                  <Text style={[styles.smallBtnText, { color: colors.white }]}>
                    {t('share_button')}
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
                        <Image source={SAVE_ICON} style={styles.smallIcon} resizeMode="contain" />
                        <Text style={[styles.smallBtnText, { color: colors.white }]}>
                          {t('save_button')}
                        </Text>
                      </>
                    )}
                  </GradientBox>
                </TouchableOpacity>
              </View>
            </>
          )}

    
        
        {/* --- MOVED: This is the main action button, now outside ScrollView and at the bottom --- */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.actionTouchable}
            onPress={onActionPress}
            disabled={(phase === 1 && isLoadingReading) || phase === 3}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[styles.actionButton, { borderColor: colors.primary }]}
            >
              {phase === 1 && isLoadingReading ? (
                <ActivityIndicator color={colors.primary} />
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
    // Horizontal padding is moved to sub-containers to allow the bottom button to span full width
    paddingTop: Platform.select({ ios: 0, android: 10 }),
    backgroundColor: 'transparent',
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
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
  scrollContent: { alignItems: 'center', paddingHorizontal: 20 },
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
    // paddingHorizontal: 16,
    // borderWidth: 1.1,
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
    // paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  actionLabel: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
  playBtnContainer: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
  },
  // --- NEW: Styles for the full screen video modal ---
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end', // Aligns children (the button) to the bottom
    alignItems: 'center',
  },
  videoContinueTouchable: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 50, // Position button up from the very bottom edge
  },
});































// import React, { useMemo, useState, useEffect } from 'react';
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
//   ActivityIndicator,
//   Alert,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   withDelay,
// } from 'react-native-reanimated';

// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../../navigation/routeTypes';
// import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
// import { useBuziosStore } from '../../../../../store/useBuziousStore';
// import { useTranslation } from 'react-i18next';
// // --- NEW: Import OpenAI Store and SoundPlayer ---
// import { useOpenAiStore } from '../../../../../store/useOpenAiStore';
// import SoundPlayer from 'react-native-sound-player';

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
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const route = useRoute<RouteProp<AppStackParamList, 'CaurisCardDetail'>>();
//   const { userQuestion } = route.params;
//   const { t } = useTranslation();
  
//   const {
//     reading,
//     isLoadingReading,
//     readingError,
//     getBuziosReading,
//     isSaving,
//     saveBuziosReading,
//   } = useBuziosStore();

//   // --- NEW: Integrate OpenAI Store ---
//   const { preloadSpeech } = useOpenAiStore();

//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  
//   // --- NEW: State for audio playback and preloading ---
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);
//   const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(null);
//   const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);

//   const circleScale = useSharedValue(1);
//   const circleAnimStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: circleScale.value }],
//   }));

//   const shell2Set = useMemo(() => {
//     if (reading) {
//       const upCount = reading.buzios_result.mouth_up_count;
//       const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i));
//       return new Set(indices.slice(0, upCount));
//     }
//     const idx = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i)).slice(
//       0,
//       6,
//     );
//     return new Set(idx);
//   }, [reading]);

//   const shellConfigs: ShellConfig[] = useMemo(() => {
//     const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
//     const R = effectiveSize / 2;
//     const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };
//     const sizes = Array.from({ length: SHELL_COUNT }, () =>
//       rand(SHELL_MIN, SHELL_MAX),
//     );
//     const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort(
//       (a, b) => sizes[b] - sizes[a],
//     );
//     type P = { cx: number; cy: number; r: number };
//     const placed: P[] = [];
//     const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(
//       null as any,
//     );
//     const insideCircle = (cx: number, cy: number, rEff: number) => {
//       const dx = cx - center.x,
//         dy = cy - center.y;
//       return Math.hypot(dx, dy) <= R - rEff;
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
//           const dx = cx - p.cx,
//             dy = cy - p.cy;
//           const minD = p.r + rEff + SHELL_GAP;
//           if (dx * dx + dy * dy < minD * minD) {
//             ok = false;
//             break;
//           }
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

//   const xSV = shellConfigs.map(c => useSharedValue(c.startX));
//   const ySV = shellConfigs.map(c => useSharedValue(c.startY));
//   const rSV = shellConfigs.map(() => useSharedValue(0));
//   const sSV = shellConfigs.map(() => useSharedValue(0.7));
//   const oSV = shellConfigs.map(() => useSharedValue(0));

//   const onActionPress = async () => {
//     Vibration.vibrate([0, 35, 40, 35]); 
//     if (phase === 0) {
//       setPhase(1);
//       getBuziosReading(userQuestion);
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
//     } else if (phase === 2) {
//       setPhase(3);
//     } else if (phase === 3) {
//       setShowSubscriptionModal(true);
//     }
//   };

//   useEffect(() => {
//     if (phase === 1 && !isLoadingReading && reading) {
//       setPhase(2);
//     }
//   }, [isLoadingReading, reading, phase]);
  
//   // --- NEW: useEffect to PRELOAD audio when reading is ready ---
//   useEffect(() => {
//     const prepareReadingAudio = async () => {
//         if (reading?.ai_reading && reading?.buzios_result?.overall_polarity) {
//             setIsPreloadingAudio(true);
            
//             // --- THE FIX IS HERE ---
//             // Create a unique ID from the reading result to use for caching the audio file.
//             // We sanitize it to make it a valid filename component.
//             const readingId = `${userQuestion}_${reading.buzios_result.overall_polarity}`.replace(/[^a-zA-Z0-9]/g, '_');

//             const audioPath = await preloadSpeech(reading.ai_reading, readingId);
//             if (audioPath) {
//                 setPreloadedAudioPath(audioPath);
//                 console.log('Cauris reading audio preloaded successfully.');
//             } else {
//                 console.log('Failed to preload Cauris reading audio.');
//             }
//             setIsPreloadingAudio(false);
//         }
//     };
//     prepareReadingAudio();
//   }, [reading, userQuestion, preloadSpeech]);
  
//   // --- NEW: useEffect for SoundPlayer events ---
//   useEffect(() => {
//     const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
//       setIsPlayingAudio(false);
//     });
//     return () => {
//       SoundPlayer.stop();
//       onFinishedPlayingSubscription.remove();
//     };
//   }, []);

//   const handleSave = () => {
//     Vibration.vibrate([0, 35, 40, 35]); 
//     if (reading && !isSaving) {
//       saveBuziosReading(reading).then(success => {
//         if (success) {
//           navigation.navigate('MainTabs');
//         }
//       });
//     }
//   };
  
//   // --- NEW: Updated playback toggle function ---
//   const onPressPlayToggle = () => {
//     if (isPlayingAudio) {
//       SoundPlayer.stop();
//       setIsPlayingAudio(false);
//       return;
//     }
//     if (preloadedAudioPath) {
//       try {
//         SoundPlayer.playUrl(`file://${preloadedAudioPath}`);
//         setIsPlayingAudio(true);
//       } catch (e) {
//         console.error('Could not play preloaded audio', e);
//       }
//     } else {
//       console.warn('Audio is not ready yet or failed to preload.');
//     }
//   };

//   if (readingError) {
//     Alert.alert(t('alert_error_title'), readingError, [
//       { text: 'OK', onPress: () => navigation.goBack() },
//     ]);
//   }
  
//   const titleTop = t(
//     phase === 0 ? 'cauris_phase0_title' :
//     phase === 1 ? 'cauris_phase1_title' :
//     phase === 2 ? 'cauris_phase2_title' :
//     'cauris_phase3_title'
//   );
  
//   const subtitle = phase < 2 ? t(
//     phase === 0 ? 'cauris_phase0_subtitle' :
//     'cauris_phase1_subtitle'
//   ) : undefined;

//   const actionLabel = 
//     phase === 0 ? t('cauris_phase0_button') :
//     phase === 1 ? t('continue_button') : // This is a temporary state, button is disabled
//     phase === 2 ? t('cauris_phase2_button') :
//     t('get_premium_button');

//   const showShells = phase >= 1;
//   const divineMessage = reading?.ai_reading ?? t('cauris_default_message');

//   return (
//     <ImageBackground
//       source={BG_IMG}
//       style={styles.bgImage}
//       imageStyle={{ resizeMode: 'cover' }}
//     >
//       <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={[styles.backIcon, { tintColor: colors.white }]}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.headerTitleWrap} pointerEvents="none">
//              <Text
//               numberOfLines={1}
//               ellipsizeMode="tail"
//               style={[styles.headerTitle, { color: colors.white }]}
//             >
//               {t('cauris_header')}
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
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
//               {titleTop}
//             </Text>
//             {subtitle ? (
//               <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
//                 {subtitle}
//               </Text>
//             ) : null}
//             {(phase === 2 || phase === 3) && reading && (
//               <Text style={[styles.patternName, { color: colors.white }]}>
//                 {reading.buzios_result.overall_polarity}
//               </Text>
//             )}
//           </View>

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

//           {phase === 3 && (
//             <>
//               <View style={styles.playWrapper}>
//                 <TouchableOpacity
//                   onPress={onPressPlayToggle}
//                   activeOpacity={0.7}
//                   disabled={isPreloadingAudio || !preloadedAudioPath}
//                   style={styles.playBtnContainer}
//                 >
//                   {isPreloadingAudio ? (
//                     <ActivityIndicator size="large" color={colors.primary} />
//                   ) : (
//                     <Image
//                       source={isPlayingAudio ? PAUSE_ICON : PLAY_ICON}
//                       style={[
//                         styles.playIcon,
//                         { tintColor: (isPreloadingAudio || !preloadedAudioPath) ? '#999' : colors.primary }
//                       ]}
//                       resizeMode="contain"
//                     />
//                   )}
//                 </TouchableOpacity>
//               </View>

//               <Text style={[styles.messageText, { color: colors.white }]}>
//                 {divineMessage}
//               </Text>

//               <View style={styles.shareRow}>
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={[styles.smallBtn, { borderColor: colors.primary }]}
//                 >
//                   <Image source={SHARE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={[styles.smallBtnText, { color: colors.white }]}>
//                     {t('share_button')}
//                   </Text>
//                 </GradientBox>
//                 <TouchableOpacity onPress={handleSave} disabled={isSaving}>
//                   <GradientBox
//                     colors={[colors.black, colors.bgBox]}
//                     style={[styles.smallBtn, { borderColor: colors.primary }]}
//                   >
//                     {isSaving ? (
//                       <ActivityIndicator color={colors.white} />
//                     ) : (
//                       <>
//                         <Image source={SAVE_ICON} style={styles.smallIcon} resizeMode="contain" />
//                         <Text style={[styles.smallBtnText, { color: colors.white }]}>
//                           {t('save_button')}
//                         </Text>
//                       </>
//                     )}
//                   </GradientBox>
//                 </TouchableOpacity>
//               </View>
//             </>
//           )}

//           <View style={styles.actionsRow}>
//             <TouchableOpacity
//               activeOpacity={0.7}
//               style={styles.actionTouchable}
//               onPress={onActionPress}
//               disabled={phase === 1 && isLoadingReading}
//             >
//               <GradientBox
//                 colors={[colors.black, colors.bgBox]}
//                 style={[styles.actionButton, { borderColor: colors.primary }]}
//               >
//                 {phase === 1 && isLoadingReading ? (
//                   <ActivityIndicator color={colors.primary} />
//                 ) : (
//                   <Text style={[styles.actionLabel, { color: colors.white }]}>
//                     {actionLabel}
//                   </Text>
//                 )}
//               </GradientBox>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//         <SubscriptionPlanModal
//           isVisible={showSubscriptionModal}
//           onClose={() => setShowSubscriptionModal(false)}
//           onConfirm={plan => {
//             setShowSubscriptionModal(false);
//             console.log('User selected plan:', plan);
//           }}
//         />
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default CaurisCardDetailScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1, width: SCREEN_WIDTH, backgroundColor: 'transparent' },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//     backgroundColor: 'transparent',
//   },
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
//   headerTitleWrap: {
//     maxWidth: '70%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },
//   scrollContent: { alignItems: 'center' },
//   contentHeader: { marginTop: 16, width: '100%', alignItems: 'center' },
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
//     height: DECAL_SIZE,
//   },
//   decalFull: { width: '100%', height: DECAL_SIZE },
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
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
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
//   messageText: {
//     marginTop: 18,
//     paddingHorizontal: 8,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 16,
//     lineHeight: 24,
//     opacity: 0.95,
//   },
//   playWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   playIcon: { width: 40, height: 40 },
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
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   smallIcon: { width: 15, height: 15, marginRight: 8, resizeMode: 'contain' },
//   smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
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
//   actionLabel: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
//   playBtnContainer: {
//       width: 60,
//       height: 60,
//       justifyContent: 'center',
//       alignItems: 'center',
//   }
// });



