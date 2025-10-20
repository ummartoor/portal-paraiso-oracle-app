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
import { useShallow } from 'zustand/react/shallow';

import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { useBuziosStore } from '../../../store/useBuziousStore';

// --- NEW: Import OpenAI Store and SoundPlayer ---
import { useOpenAiStore } from '../../../store/useOpenAiStore';
import SoundPlayer from 'react-native-sound-player';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_W = SCREEN_WIDTH - 40;

/* Assets */
const BG_IMG = require('../../../assets/images/backgroundImage.png');
const DECAL_IMG = require('../../../assets/images/decalImage.png');
const SHELL_IMG_1 = require('../../../assets/images/shell1.png');
const SHELL_IMG_2 = require('../../../assets/images/shell2.png');

const PLAY_ICON = require('../../../assets/icons/playIcon.png');
const PAUSE_ICON = require('../../../assets/icons/pauseIcon.png');
const SHARE_ICON = require('../../../assets/icons/shareIcon.png');

/* Sizes & Animation Config */
const DECAL_SIZE = 352;
const BOWL_SIZE = 260;
const SHELL_COUNT = 16;
const SHELL_MIN = 44;
const SHELL_MAX = 48;
const SHELL_PADDING = 16;
const SHELL_GAP = 10;
const RADIUS_SCALE = 0.6;
const MAX_ATTEMPTS = 500;

/* Helpers */
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

const BuziosHistoryDetail: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'BuziosHistoryDetail'>>();
  const { history_uid } = route.params;

  // --- NEW: State for audio playback ---
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(null);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);

  // --- NEW: Get preload function from store ---
  const { preloadSpeech } = useOpenAiStore();

  const {
    historyItem,
    isLoadingHistoryItem,
    historyItemError,
    getBuziosHistoryItem,
  } = useBuziosStore(
    useShallow(state => ({
      historyItem: state.historyItem,
      isLoadingHistoryItem: state.isLoadingHistoryItem,
      historyItemError: state.historyItemError,
      getBuziosHistoryItem: state.getBuziosHistoryItem,
    })),
  );

  useEffect(() => {
    getBuziosHistoryItem(history_uid);
  }, [getBuziosHistoryItem, history_uid]);

  // --- NEW: useEffect to preload audio when history data is ready ---
  useEffect(() => {
    const prepareAudio = async () => {
      if (historyItem?.ai_response) {
        setIsPreloadingAudio(true);
        const audioPath = await preloadSpeech(historyItem.ai_response, history_uid);
        if (audioPath) {
          setPreloadedAudioPath(audioPath);
          console.log('History audio preloaded successfully.');
        } else {
          console.error('Failed to preload history audio.');
        }
        setIsPreloadingAudio(false);
      }
    };
    prepareAudio();
  }, [historyItem, history_uid, preloadSpeech]);
  
  // --- NEW: useEffect for SoundPlayer events ---
  useEffect(() => {
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      setIsPlayingAudio(false);
    });
    // Cleanup on unmount
    return () => {
      SoundPlayer.stop();
      onFinishedPlayingSubscription.remove();
    };
  }, []);

  const shell2Set = useMemo(() => {
    if (historyItem) {
      const upCount = historyItem.mouth_up_count;
      const indices = shuffle(Array.from({ length: SHELL_COUNT }, (_, i) => i));
      return new Set(indices.slice(0, upCount));
    }
    return new Set();
  }, [historyItem]);

  const shellConfigs: ShellConfig[] = useMemo(() => {
    const effectiveSize = BOWL_SIZE - SHELL_PADDING * 2;
    const R = effectiveSize / 2;
    const center = { x: SHELL_PADDING + R, y: SHELL_PADDING + R };
    const sizes = Array.from({ length: SHELL_COUNT }, () => rand(SHELL_MIN, SHELL_MAX));
    const order = Array.from({ length: SHELL_COUNT }, (_, i) => i).sort((a, b) => sizes[b] - sizes[a]);
    const placed: { cx: number; cy: number; r: number }[] = [];
    const targets: { tx: number; ty: number }[] = Array(SHELL_COUNT).fill(null as any);
    for (const idx of order) {
      const size = sizes[idx];
      const rEff = (size / 2) * RADIUS_SCALE;
      let done = false;
      for (let k = 0; k < MAX_ATTEMPTS; k++) {
        const angle = rand(0, Math.PI * 2);
        const radius = Math.sqrt(Math.random()) * (R - rEff);
        const cx = center.x + radius * Math.cos(angle);
        const cy = center.y + radius * Math.sin(angle);
        let ok = true;
        for (const p of placed) {
          const dx = cx - p.cx, dy = cy - p.cy;
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
        const cx = center.x, cy = center.y;
        placed.push({ cx, cy, r: rEff });
        targets[idx] = { tx: cx - size / 2, ty: cy - size / 2 };
      }
    }
    return Array.from({ length: SHELL_COUNT }).map((_, i) => ({
      size: sizes[i],
      targetX: targets[i].tx,
      targetY: targets[i].ty,
      rot: rand(-150, 150),
      delay: i * 70 + rand(0, 120),
      source: shell2Set.has(i) ? SHELL_IMG_2 : SHELL_IMG_1,
    }));
  }, [shell2Set]);

  const xSV = shellConfigs.map(c => useSharedValue(c.targetX));
  const ySV = shellConfigs.map(c => useSharedValue(c.targetY));
  const rSV = shellConfigs.map(c => useSharedValue(c.rot));
  const sSV = shellConfigs.map(() => useSharedValue(0));
  const oSV = shellConfigs.map(() => useSharedValue(0));

  useEffect(() => {
    if (historyItem) {
      shellConfigs.forEach((c, i) => {
        sSV[i].value = withDelay(c.delay, withSpring(1));
        oSV[i].value = withDelay(c.delay, withTiming(1, { duration: 260 }));
      });
    }
  }, [historyItem, shellConfigs, sSV, oSV]);

  const divineMessage = historyItem?.ai_response ?? '';

  // --- NEW: Updated playback toggle function ---
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
        console.error('Could not play preloaded audio file', e);
        Alert.alert('Playback Error', 'Could not play the audio file.');
      }
    }
  };

  if (isLoadingHistoryItem) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (historyItemError) {
    Alert.alert('Error', historyItemError, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
    return null;
  }

  if (!historyItem) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.emptyText}>History item not found.</Text>
      </View>
    );
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
              source={require('../../../assets/icons/backIcon.png')}
              style={[styles.backIcon, { tintColor: colors.white }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text
              numberOfLines={1}
              style={[styles.headerTitle, { color: colors.white }]}
            >
              Cauris Reading
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <Text style={[styles.contentTitle, { color: colors.primary }]}>
              Your Divine Message
            </Text>
            <Text style={[styles.patternName, { color: colors.white }]}>
              {historyItem.overall_polarity}
            </Text>
          </View>

          <View style={styles.centerImageWrap}>
            <Image
              source={DECAL_IMG}
              style={styles.decalFull}
              resizeMode="contain"
            />
            <View style={[styles.circleWrap, { borderColor: colors.primary }]}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.circleGradient}
                children={undefined}
              />
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
            </View>
          </View>

          {/* --- NEW: Updated Playback Button UI --- */}
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
                  style={[styles.playIcon, { tintColor: (isPreloadingAudio || !preloadedAudioPath) ? '#999' : colors.primary }]}
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
              <Image
                source={SHARE_ICON}
                style={styles.smallIcon}
                resizeMode="contain"
              />
              <Text style={[styles.smallBtnText, { color: colors.white }]}>
                Share
              </Text>
            </GradientBox>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default BuziosHistoryDetail;

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: SCREEN_WIDTH },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: { fontFamily: Fonts.aeonikRegular, fontSize: 16, color: '#fff' },
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
  headerTitleWrap: { maxWidth: '70%' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
  },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  contentHeader: { marginTop: 16, width: '100%', alignItems: 'center' },
  contentTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    letterSpacing: 0.5,
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
    left: (CONTAINER_W - BOWL_SIZE) / 2,
    width: BOWL_SIZE,
    height: BOWL_SIZE,
    borderRadius: BOWL_SIZE / 2,
    borderWidth: 2,
    overflow: 'hidden',
  },
  circleGradient: { position: 'absolute', width: '100%', height: '100%' },
  shellsOverlay: { position: 'absolute', width: '100%', height: '100%' },
  playWrapper: { alignItems: 'center', justifyContent: 'center' },
  playIcon: { width: 40, height: 40 },
  messageText: {
    marginTop: 18,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.95,
  },
  shareRow: { marginTop: 24, width: '100%', justifyContent: 'center' },
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
  smallIcon: { width: 15, height: 15, marginRight: 8 },
  smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
  playBtnContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
