import React, { useEffect, useMemo, useState } from 'react';
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
  ImageSourcePropType,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';

import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import GradientBox from '../../../../components/GradientBox';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

// 🔊 TTS
import Tts from 'react-native-tts';

// 🎥 Video
import Video from 'react-native-video';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type CardT = { id: string; img: ImageSourcePropType };

/* ---------- Tunables ---------- */
const CARD_W = 96;
const CARD_H = 170;

const ARC_Y_TOP = SCREEN_HEIGHT * 0.26;
const RADIUS = 260;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = ARC_Y_TOP + RADIUS;

const VISIBLE_COUNT = 7;
const STEP_DEG = 12;
const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

const FREEZE_BUFFER = 1.0;
const ITEM_STRIDE = 42;

/* Selected row layout (for drop targets) */
const SLOTS_PAD_H = 10;
const DROP_Y_THRESHOLD = -110;

/* ---------- Helpers ---------- */
const wClamp = (v: number, min: number, max: number) => {
  'worklet';
  return v < min ? min : v > max ? max : v;
};
const wRound = (v: number) => {
  'worklet';
  return Math.round(v);
};

const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 22 }).map(
  (_, i) => ({
    id: `${i + 1}`,
    image: require('../../../../assets/images/deskCard.png'),
  })
);

const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

function triggerHaptic() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 35, 40, 35]);
  } else {
    Vibration.vibrate();
  }
}
function triggerHapticDelayed(ms = 120) {
  setTimeout(() => triggerHaptic(), ms);
}

/* ---- STATIC REVEAL IMAGES  */
const revealImages: ImageSourcePropType[] = [
  require('../../../../assets/images/revealCard1.png'),
  require('../../../../assets/images/revealCard2.png'),
  require('../../../../assets/images/revealCard3.png'),
];

// Sample reading text
const readingMessage = `In the past, The Lovers suggests a meaningful connection or important decision that deeply influenced your path. In the present, The Chariot reveals your need to stay focused and take charge as you move forward. Looking to the future, The Star brings a message of hope, renewal, and the promise of brighter days ahead.`;

const TarotCardDetailScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
  const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

  const [showVideo, setShowVideo] = useState(false); // 🎥 VIDEO STATE
  const [revealStarted, setRevealStarted] = useState(false);
  const [showReading, setShowReading] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const maxIndex = deck.length - 1;
  const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
  const progress = useSharedValue(initialIndex);

  const filledCount = selectedCards.filter(Boolean).length;
  const isLocked = filledCount === 3;
  const lockedSV = useSharedValue(0);

  useEffect(() => {
    progress.value = initialIndex;
  }, [initialIndex]);

  useEffect(() => {
    lockedSV.value = isLocked ? 1 : 0;
  }, [isLocked]);

  type TtsSub = { remove?: () => void; removeListener?: () => void };
  // TTS setup
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.4, true);

    const onStart = () => setIsSpeaking(true);
    const onFinish = () => setIsSpeaking(false);
    const onCancel = () => setIsSpeaking(false);

    const startSub = Tts.addEventListener('tts-start', onStart) as unknown as TtsSub;
    const finishSub = Tts.addEventListener('tts-finish', onFinish) as unknown as TtsSub;
    const cancelSub = Tts.addEventListener('tts-cancel', onCancel) as unknown as TtsSub;

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
    if (!readingMessage.trim()) return;
    if (isSpeaking) {
      await Tts.stop();
      setIsSpeaking(false);
    } else {
      await Tts.stop();
      Tts.speak(readingMessage);
    }
  };

  const handleSelect = (card: CardT, slotIndex?: number) => {
    if (revealStarted || showVideo) return;
    setSelectedCards(prev => {
      const next = [...prev];
      if (slotIndex !== undefined) {
        if (!next[slotIndex]) next[slotIndex] = card;
        return next;
      }
      const emptyIdx = next.findIndex(x => x === null);
      if (emptyIdx !== -1) next[emptyIdx] = card;
      return next;
    });
  };

  const handleRemove = (slotIndex: number) => {
    if (revealStarted || showVideo) return;
    setSelectedCards(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const onPressReveal = () => {
    if (!revealStarted) {
      setShowVideo(true); // Show video first
    } else {
      setShowReading(true);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../assets/images/backgroundImage.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

          {/* 🎥 VIDEO PHASE */}
          {showVideo ? (
            <View style={{ flex: 1, alignItems:'center' }}>
              <Video
                source={require('../../../../assets/videos/onboardingVideo2.mp4')}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="cover"
                repeat={false}
                paused={false}
              />

              {/* Overlay Continue Button */}
              <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowVideo(false);
                    setRevealStarted(true);
                  }}
                  activeOpacity={0.9}
                >
                  <View
                    style={{
                      borderColor: colors.primary,
                      borderWidth: 1.5,
                      borderRadius: 60,
                      overflow: 'hidden',
                    }}
                  >
                    <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
                      <Text style={styles.revealBtnText}>Continue</Text>
                    </GradientBox>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Header (only when NOT video) */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Image
                    source={require('../../../../assets/icons/backIcon.png')}
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
                    Tarot Reader
                  </Text>
                </View>
              </View>

              {/* Focus Phase OR Reading Phase */}
              {!showReading ? (
                <>
                  <View style={styles.content}>
                    <Text style={[styles.focusTitle, { color: colors.primary }]}>
                      {revealStarted ? 'Your Card' : 'Focus on Your Question'}
                    </Text>
                    <Text style={[styles.paragraph, { color: colors.white }]}>
                      {revealStarted
                        ? 'Discover the deeper meaning behind the cards drawn for you.'
                        : 'Take a deep breath and think about what you seek to know'}
                    </Text>
                  </View>

                  {/* Slots */}
                  <View style={styles.selectedRow}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={styles.box}>
                        {selectedCards[i] && (
                          <>
                            <Image
                              source={revealStarted ? revealImages[i] : selectedCards[i]!.img}
                              style={styles.boxImg}
                            />
                            {!revealStarted && (
                              <TouchableOpacity onPress={() => handleRemove(i)} style={styles.removeBtn}>
                                <Image
                                  source={require('../../../../assets/icons/closeIcon.png')}
                                  style={styles.removeIcon}
                                />
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Reveal Button */}
                  {isLocked && (
                    <TouchableOpacity style={styles.revealBtnWrap} onPress={onPressReveal} activeOpacity={0.9}>
                      <View
                        style={{
                          borderColor: colors.primary,
                          borderWidth: 1.5,
                          borderRadius: 60,
                          overflow: 'hidden',
                        }}
                      >
                        <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
                          <Text style={styles.revealBtnText}>
                            {revealStarted ? 'Reveal Meaning' : 'Start Revealing'}
                          </Text>
                        </GradientBox>
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  {/* 📖 Reading Phase */}
                  <View style={styles.content}>
                    <Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text>
                  </View>

                  <View style={styles.selectedRow}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={styles.box}>
                        <Image source={revealImages[i]} style={styles.boxImg} />
                      </View>
                    ))}
                  </View>

                  <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
                      <Image
                        source={
                          isSpeaking
                            ? require('../../../../assets/icons/pauseIcon.png')
                            : require('../../../../assets/icons/playIcon.png')
                        }
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={[
                      styles.paragraph,
                      { color: colors.white, marginTop: 12, paddingHorizontal: 8 },
                    ]}
                  >
                    {readingMessage}
                  </Text>

                  <View style={styles.shareRow}>
                    <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
                      <Image
                        source={require('../../../../assets/icons/shareIcon.png')}
                        style={styles.smallIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.smallBtnText}>Share</Text>
                    </GradientBox>
                    <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
                      <Image
                        source={require('../../../../assets/icons/saveIcon.png')}
                        style={styles.smallIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.smallBtnText}>Save</Text>
                    </GradientBox>
                  </View>

                  <TouchableOpacity
                    style={{ marginTop: 40 }}
                    onPress={() => {
                      setShowSubscriptionModal(true);
                    }}
                  >
                    <View
                      style={{
                        borderColor: colors.primary,
                        borderWidth: 1.5,
                        borderRadius: 60,
                        overflow: 'hidden',
                      }}
                    >
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={[styles.revealBtnGrad, { borderRadius: 60 }]}
                      >
                        <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
                      </GradientBox>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* Deck */}
          {!showReading && !showVideo && (
            <View style={styles.deckWrap}>
              {deck.map((card, i) => (
                <ArcCard
                  key={card.id}
                  card={card}
                  index={i}
                  progress={progress}
                  maxIndex={maxIndex}
                  onSelect={handleSelect}
                  lockedSV={lockedSV}
                  revealStarted={revealStarted}
                />
              ))}
              <Text style={styles.hint}>drag to move</Text>
            </View>
          )}

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
    </GestureHandlerRootView>
  );
};

/* --------- Arc Card --------- */
function ArcCard({
  card,
  index,
  progress,
  maxIndex,
  onSelect,
  lockedSV,
  revealStarted,
}: {
  card: CardT;
  index: number;
  progress: Animated.SharedValue<number>;
  maxIndex: number;
  onSelect: (c: CardT, slotIndex?: number) => void;
  lockedSV: Animated.SharedValue<number>;
  revealStarted: boolean;
}) {
  const pressScale = useSharedValue(1);
  const isPressing = useSharedValue(0);
  const sentUpOnce = useSharedValue(0);
  const start = useSharedValue(0);
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => {
    const rel = index - progress.value;
    const absRel = Math.abs(rel);
    if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
      return { opacity: 0 };
    }

    const rawDeg = rel * STEP_DEG;
    const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
    const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

    const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
    const baseScale = 1 - 0.18 * t;
    const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
    const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

    return {
      position: 'absolute',
      left: withTiming(x, { duration: 60 }),
      top: withTiming(y, { duration: 60 }),
      width: CARD_W,
      height: CARD_H,
      opacity,
      transform: [
        { rotate: rotateDeg },
        { scale: baseScale * pressScale.value },
        { translateX: transX.value },
        { translateY: transY.value },
      ],
      zIndex: isPressing.value === 1 ? 999 : 200,
    };
  });

  const deckPan = Gesture.Pan()
    .onStart(() => {
      start.value = progress.value;
    })
    .onUpdate(e => {
      if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
      progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
    })
    .onEnd(() => {
      if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
      progress.value = withTiming(wRound(progress.value));
    });

  const tap = Gesture.Tap().onEnd(() => {
    if (lockedSV.value || revealStarted) return;
    runOnJS(triggerHaptic)();
    runOnJS(onSelect)(card);
  });

  const longPress = Gesture.LongPress()
    .minDuration(250)
    .onStart(() => {
      if (revealStarted) return;
      isPressing.value = 1;
      sentUpOnce.value = 0;
      pressScale.value = withSpring(1.2);
      runOnJS(triggerHapticDelayed)(120);
    });

  const dragPan = Gesture.Pan()
    .onUpdate(e => {
      if (isPressing.value === 1 && !revealStarted) {
        transX.value = e.translationX;
        transY.value = e.translationY;
      }
    })
    .onEnd(e => {
      if (isPressing.value !== 1 || revealStarted) return;
      if (e.translationY < DROP_Y_THRESHOLD) {
        const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
        const slot = Math.max(0, Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth)));
        runOnJS(onSelect)(card, slot);
        runOnJS(triggerHaptic)();
        sentUpOnce.value = 1;
      }
      transX.value = withTiming(0);
      transY.value = withTiming(0);
      pressScale.value = withTiming(1);
      isPressing.value = 0;
    });

  const composed = Gesture.Simultaneous(
    deckPan,
    Gesture.Exclusive(longPress, tap),
    dragPan
  );

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[aStyle, styles.cardShadow]}>
        <Image source={card.img} style={styles.cardImg} />
      </Animated.View>
    </GestureDetector>
  );
}

export default TarotCardDetailScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
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
  content: { alignItems: 'center', marginVertical: 6 },
  focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
  paragraph: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 8,
    lineHeight: 20,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  box: {
    width: '32%',
    height: 180,
    borderWidth: 1,
    borderColor: '#CEA16A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  boxImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#0008',
    borderRadius: 13,
    padding: 2,
  },
  removeIcon: { width: 17, height: 17, tintColor: '#fff' },
  revealBtnWrap: { margin: 10 },
  revealBtnGrad: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  revealBtnText: { color: '#fff', fontSize: 16 },
  deckWrap: { flex: 1 },
  hint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 12,
    opacity: 0.95,
  },
  cardImg: { width: '100%', height: '100%', borderRadius: 10 },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
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
    borderColor: '#D9B699',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  smallBtnText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    color: '#fff',
  },
});





















// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';

// import Animated,
// {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// // 🔊 TTS
// import Tts from 'react-native-tts';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 170;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.26;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// /* Selected row layout (for drop targets) */
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;

// /* ---------- Helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 22 }).map(
//   (_, i) => ({
//     id: `${i + 1}`,
//     image: require('../../../../assets/images/deskCard.png'),
//   })
// );

// const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// function triggerHapticDelayed(ms = 120) {
//   setTimeout(() => triggerHaptic(), ms);
// }

// /* ---- STATIC REVEAL IMAGES  */
// const revealImages: ImageSourcePropType[] = [
//   require('../../../../assets/images/revealCard1.png'),
//   require('../../../../assets/images/revealCard2.png'),
//   require('../../../../assets/images/revealCard3.png'),
// ];

// // Sample reading text
// const readingMessage = `In the past, The Lovers suggests a meaningful connection or important decision that deeply influenced your path. In the present, The Chariot reveals your need to stay focused and take charge as you move forward. Looking to the future, The Star brings a message of hope, renewal, and the promise of brighter days ahead.`;


// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
// const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);


//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

//   const [revealStarted, setRevealStarted] = useState(false);
//   const [showReading, setShowReading] = useState(false);

//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const maxIndex = deck.length - 1;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);
//   type TtsSub = { remove?: () => void; removeListener?: () => void };
//   // TTS setup
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
//     if (!readingMessage.trim()) return;
//     if (isSpeaking) {
//       await Tts.stop();
//       setIsSpeaking(false);
//     } else {
//       await Tts.stop();
//       Tts.speak(readingMessage);
//     }
//   };

//   const handleSelect = (card: CardT, slotIndex?: number) => {
//     if (revealStarted) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     if (revealStarted) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   const onPressReveal = () => {
//     if (!revealStarted) {
//       setRevealStarted(true);
//     } else {
//       // Now show final Reading screen
//       setShowReading(true);
//     }
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//               <Image
//                 source={require('../../../../assets/icons/backIcon.png')}
//                 style={[styles.backIcon, { tintColor: colors.white }]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>

//             <View style={styles.headerTitleWrap} pointerEvents="none">
//               <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                 Tarot Reader
//               </Text>
//             </View>
//           </View>

//           {/* Content */}
//           {!showReading ? (
//             <>
//               <View style={styles.content}>
//                 <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                   {revealStarted ? 'Your Card' : 'Focus on Your Question'}
//                 </Text>
//                 <Text style={[styles.paragraph, { color: colors.white }]}>
//                   {revealStarted ? 'Discover the deeper meaning behind the cards drawn for you.' : 'Take a deep breath and think about what you seek to know'}
//                 </Text>
//               </View>

//               {/* Slots */}
//               <View style={styles.selectedRow}>
//                 {[0, 1, 2].map(i => (
//                   <View key={i} style={styles.box}>
//                     {selectedCards[i] && (
//                       <>
//                         <Image
//                           source={revealStarted ? revealImages[i] : selectedCards[i]!.img}
//                           style={styles.boxImg}
//                         />
//                         {!revealStarted && (
//                           <TouchableOpacity onPress={() => handleRemove(i)} style={styles.removeBtn}>
//                             <Image
//                               source={require('../../../../assets/icons/closeIcon.png')}
//                               style={styles.removeIcon}
//                             />
//                           </TouchableOpacity>
//                         )}
//                       </>
//                     )}
//                   </View>
//                 ))}
//               </View>

//               {/* Reveal Button */}
//               {isLocked && (
//                 <TouchableOpacity style={styles.revealBtnWrap} onPress={onPressReveal} activeOpacity={0.9}>
//  <View                  style={{
//     borderColor: colors.primary,
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden'   // borderRadius ke liye zaroori
//   }}>
//   <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                     <Text style={styles.revealBtnText}>
//                       {revealStarted ? 'Reveal Meaning' : 'Start Revealing'}
//                     </Text>
//                   </GradientBox>
//  </View>
                
//                 </TouchableOpacity>
//               )}
//             </>
//           ) : (
//             <>
//               <View style={styles.content}>
//                 <Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text>
//               </View>

//               {/* Show the same cards */}
//               <View style={styles.selectedRow}>
//                 {[0, 1, 2].map(i => (
//                   <View key={i} style={styles.box}>
//                     <Image source={revealImages[i]} style={styles.boxImg} />
//                   </View>
//                 ))}
//               </View>

//               {/* Play Icon */}
//               <View style={{ alignItems: 'center', marginTop: 10 }}>
//                 <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
//                   <Image
//                     source={isSpeaking ? require('../../../../assets/icons/pauseIcon.png') : require('../../../../assets/icons/playIcon.png')}
//                     style={{ width: 40, height: 40 }}
//                     resizeMode="contain"
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Message */}
//               <Text style={[styles.paragraph, { color: colors.white, marginTop: 12, paddingHorizontal: 8 }]}>
//                 {readingMessage}
//               </Text>

//               {/* Share / Save */}
//               <View style={styles.shareRow}>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                   <Image source={require('../../../../assets/icons/shareIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={styles.smallBtnText}>Share</Text>
//                 </GradientBox>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                   <Image source={require('../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={styles.smallBtnText}>Save</Text>
//                 </GradientBox>
//               </View>

//               {/* Premium CTA */}
//           <TouchableOpacity style={{ marginTop: 40}}  onPress={()=>{  setShowSubscriptionModal(true);}}>
//   <View style={{
//     borderColor: colors.primary,
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden'   // borderRadius ke liye zaroori
//   }}>
//     <GradientBox
//       colors={[colors.black, colors.bgBox]}
//       style={[styles.revealBtnGrad, { borderRadius: 60 }]}
//     >
//       <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
//     </GradientBox>
//   </View>
// </TouchableOpacity>

//             </>
//           )}

//           {/* Deck */}
//           {!showReading && (
//             <View style={styles.deckWrap}>
//               {deck.map((card, i) => (
//                 <ArcCard
//                   key={card.id}
//                   card={card}
//                   index={i}
//                   progress={progress}
//                   maxIndex={maxIndex}
//                   onSelect={handleSelect}
//                   lockedSV={lockedSV}
//                   revealStarted={revealStarted}
//                 />
//               ))}
//               <Text style={styles.hint}>drag to move</Text>
//             </View>
//           )}
//           <SubscriptionPlanModal
//   isVisible={showSubscriptionModal}
//   onClose={() => setShowSubscriptionModal(false)}
//   onConfirm={(plan) => {
//     setShowSubscriptionModal(false);
//     console.log('User selected plan:', plan);
   
//   }}
// />

//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// export default TarotCardDetailScreen;

// /* --------- Arc Card --------- */
// function ArcCard({ card, index, progress, maxIndex, onSelect, lockedSV, revealStarted }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: CardT, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
//   revealStarted: boolean;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const sentUpOnce = useSharedValue(0);
//   const start = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);

//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return { opacity: 0 };
//     }

//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 60 }),
//       top: withTiming(y, { duration: 60 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [
//         { rotate: rotateDeg },
//         { scale: baseScale * pressScale.value },
//         { translateX: transX.value },
//         { translateY: transY.value },
//       ],
//       zIndex: isPressing.value === 1 ? 999 : 200,
//     };
//   });

//   const deckPan = Gesture.Pan()
//     .onStart(() => { start.value = progress.value; })
//     .onUpdate(e => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
//     })
//     .onEnd(() => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = withTiming(wRound(progress.value));
//     });

//   const tap = Gesture.Tap().onEnd(() => {
//     if (lockedSV.value || revealStarted) return;
//     runOnJS(triggerHaptic)();
//     runOnJS(onSelect)(card);
//   });

//   const longPress = Gesture.LongPress()
//     .minDuration(250)
//     .onStart(() => {
//       if (revealStarted) return;
//       isPressing.value = 1;
//       sentUpOnce.value = 0;
//       pressScale.value = withSpring(1.2);
//       runOnJS(triggerHapticDelayed)(120);
//     });

//   const dragPan = Gesture.Pan()
//     .onUpdate(e => {
//       if (isPressing.value === 1 && !revealStarted) {
//         transX.value = e.translationX;
//         transY.value = e.translationY;
//       }
//     })
//     .onEnd(e => {
//       if (isPressing.value !== 1 || revealStarted) return;
//       if (e.translationY < DROP_Y_THRESHOLD) {
//         const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
//         const slot = Math.max(0, Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth)));
//         runOnJS(onSelect)(card, slot);
//         runOnJS(triggerHaptic)();
//         sentUpOnce.value = 1;
//       }
//       transX.value = withTiming(0);
//       transY.value = withTiming(0);
//       pressScale.value = withTiming(1);
//       isPressing.value = 0;
//     });

//   const composed = Gesture.Simultaneous(deckPan, Gesture.Exclusive(longPress, tap), dragPan);

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.img} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 20 },
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
//   content: { alignItems: 'center', marginVertical: 6 },
//   focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18,
//         marginBottom: 5,
//    },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   selectedRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     margin: 10,
//   },
//   box: {
//     width: '32%',
//     height: 180,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13,
//     padding: 2,
//   },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: { margin: 10 },
//   revealBtnGrad: {
//     height: 52,
   
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
 
  
//   },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   deckWrap: { flex: 1 },
//   hint: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
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
//     borderColor: '#D9B699',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   smallIcon: {
//     width: 15,
//     height: 15,
//     marginRight: 8,
//     resizeMode: 'contain',
//     tintColor: '#fff',
//   },
//   smallBtnText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     color: '#fff',
//   },
// });
































// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withDelay,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 170;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.32; // you set this higher already
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// /* Selected row layout (for drop targets) */
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;

// /* ---------- Helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 16 }).map(
//   (_, i) => ({
//     id: `${i + 1}`,
//     image: require('../../../../assets/images/deskCard.png'),
//   })
// );

// const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// function triggerHapticDelayed(ms = 120) {
//   setTimeout(() => triggerHaptic(), ms);
// }

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

//   const maxIndex = deck.length - 1;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);

//   const handleSelect = (card: CardT, slotIndex?: number) => {
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* Header */}
//         <View style={styles.header}>
//              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                <Image
//                  source={require('../../../../assets/icons/backIcon.png')}
//                  style={[styles.backIcon, { tintColor: colors.white }]}
//                  resizeMode="contain"
//                />
//              </TouchableOpacity>
   
//              <View style={styles.headerTitleWrap} pointerEvents="none">
//                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                Tarot Reader
//                </Text>
//              </View>
//            </View>

//           {/* Instructions */}
//           <View style={styles.content}>
//             <Text style={[styles.focusTitle, { color: colors.primary }]}>
//               Focus on Your Question
//             </Text>
//             <Text style={[styles.paragraph, { color: colors.white }]}>
//               Take a deep breath and think about{'\n'}what you seek to know
//             </Text>
//           </View>

//           {/* Slots */}
//           <View style={styles.selectedRow}>
//             {[0, 1, 2].map(i => (
//               <View key={i} style={styles.box}>
//                 {selectedCards[i] && (
//                   <>
//                     <Image source={selectedCards[i]!.img} style={styles.boxImg} />
//                     <TouchableOpacity
//                       onPress={() => handleRemove(i)}
//                       style={styles.removeBtn}
//                     >
//                       <Image
//                         source={require('../../../../assets/icons/closeIcon.png')}
//                         style={styles.removeIcon}
//                       />
//                     </TouchableOpacity>
//                   </>
//                 )}
//               </View>
//             ))}
//           </View>

//           {/* Reveal */}
//           {isLocked && (
//             <TouchableOpacity style={styles.revealBtnWrap}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                 <Text style={styles.revealBtnText}>Start Revealing</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           )}

//           {/* Deck */}
//           <View style={styles.deckWrap}>
//             {deck.map((card, i) => (
//               <ArcCard
//                 key={card.id}
//                 card={card}
//                 index={i}
//                 progress={progress}
//                 maxIndex={maxIndex}
//                 onSelect={handleSelect}
//                 lockedSV={lockedSV}
//               />
//             ))}
//             {/* HINT fixed to screen bottom & white */}
//             <Text style={styles.hint}>drag to move</Text>
//           </View>
//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// export default TarotCardDetailScreen;

// /* --------- Arc Card --------- */
// function ArcCard({
//   card,
//   index,
//   progress,
//   maxIndex,
//   onSelect,
//   lockedSV,
// }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: CardT, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const sentUpOnce = useSharedValue(0);
//   const start = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);

//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return { opacity: 0 };
//     }

//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 100 }),
//       top: withTiming(y, { duration: 100 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [
//         { rotate: rotateDeg },
//         { scale: baseScale * pressScale.value },
//         { translateX: transX.value },
//         { translateY: transY.value },
//       ],
//       zIndex: isPressing.value === 1 ? 999 : 200,
//     };
//   });

//   const deckPan = Gesture.Pan()
//     .onStart(() => {
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       if (isPressing.value === 1 || lockedSV.value) return;
//       progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
//     })
//     .onEnd(() => {
//       if (isPressing.value === 1 || lockedSV.value) return;
//       progress.value = withTiming(wRound(progress.value));
//     });

//   const tap = Gesture.Tap().onEnd(() => {
//     if (lockedSV.value) return;
//     runOnJS(triggerHaptic)();
//     runOnJS(onSelect)(card);
//   });

//   const longPress = Gesture.LongPress()
//     .minDuration(250)
//     .onStart(() => {
//       isPressing.value = 1;
//       sentUpOnce.value = 0;
//       pressScale.value = withSpring(1.2);
//       runOnJS(triggerHapticDelayed)(120);
//     });

//   const dragPan = Gesture.Pan()
//     .onUpdate(e => {
//       if (isPressing.value === 1) {
//         transX.value = e.translationX;
//         transY.value = e.translationY;
//       }
//     })
//     .onEnd(e => {
//       if (isPressing.value !== 1) return;
//       if (e.translationY < DROP_Y_THRESHOLD) {
//         const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
//         const slot = Math.max(
//           0,
//           Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth))
//         );
//         runOnJS(onSelect)(card, slot);
//         runOnJS(triggerHaptic)();
//         sentUpOnce.value = 1;
//       }
//       // snap back
//       transX.value = withTiming(0);
//       transY.value = withTiming(0);
//       pressScale.value = withTiming(1);
//       isPressing.value = 0;
//     });

//   const composed = Gesture.Simultaneous(deckPan, Gesture.Exclusive(longPress, tap), dragPan);

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.img} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container:
//   {
//     flex: 1,
//     paddingHorizontal: 20
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
//   content:
//   {
//     alignItems: 'center',
//     marginVertical: 6
//   },
//   focusTitle:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18
//   },
//   paragraph:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop:5,
//     marginBottom:5
//   },
//   selectedRow:
//   {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     margin: 10
//   },
//   box:
//   {
//     width: '32%',
//     height: 170,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10
//   },
//   boxImg:
//   {
//     width: '100%',
//     height: '100%'
//   },

//   removeBtn:
//   {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13
//   },
//   removeIcon:

//   {
//     width: 17,
//     height: 17,
//     tintColor: '#fff'
//   }
//   ,
//   revealBtnWrap:
//     { margin: 10 },
//   revealBtnGrad:
//   {
//     height: 52,
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',

//   },
//   revealBtnText:
//     { color: '#fff', fontSize: 16 },
//   deckWrap:
//     { flex: 1 },

//   hint: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
// });



