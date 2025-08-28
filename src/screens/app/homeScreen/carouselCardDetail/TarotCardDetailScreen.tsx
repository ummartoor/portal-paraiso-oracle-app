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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import GradientBox from '../../../../components/GradientBox'; // <-- adjust path if needed
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type CardT = { id: string; img: ImageSourcePropType };

/* ---------- Tunables ---------- */
const CARD_W = 96;
const CARD_H = 170;

const ARC_Y_TOP = SCREEN_HEIGHT * 0.62;
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

const DROP_Y_THRESHOLD = -110; // treat as "over slots"

/* ---------- Helpers ---------- */
const wClamp = (v: number, min: number, max: number) => {
  'worklet';
  return v < min ? min : v > max ? max : v;
};
const wRound = (v: number) => {
  'worklet';
  return Math.round(v);
};

/* ---------- Data ---------- */
const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = [
  { id: '1', image: require('../../../../assets/images/deskCard.png') },
  { id: '2', image: require('../../../../assets/images/deskCard.png') },
  { id: '3', image: require('../../../../assets/images/deskCard.png') },
  { id: '4', image: require('../../../../assets/images/deskCard.png') },
  { id: '5', image: require('../../../../assets/images/deskCard.png') },
  { id: '6', image: require('../../../../assets/images/deskCard.png') },
  { id: '7', image: require('../../../../assets/images/deskCard.png') },
  { id: '8', image: require('../../../../assets/images/deskCard.png') },
  { id: '9', image: require('../../../../assets/images/deskCard.png') },
  { id: '10', image: require('../../../../assets/images/deskCard.png') },
  { id: '11', image: require('../../../../assets/images/deskCard.png') },
  { id: '12', image: require('../../../../assets/images/deskCard.png') },
  { id: '13', image: require('../../../../assets/images/deskCard.png') },
  { id: '14', image: require('../../../../assets/images/deskCard.png') },
  { id: '15', image: require('../../../../assets/images/deskCard.png') },
  { id: '16', image: require('../../../../assets/images/deskCard.png') },
];

const toDeck = (rows: typeof cardsJSON): CardT[] =>
  rows.map(r => ({ id: r.id, img: r.image }));

function triggerHaptic() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 35, 40, 35]);
  } else {
    Vibration.vibrate();
  }
}

// vibrate after a tiny delay (so zoom happens first)
function triggerHapticDelayed(ms = 120) {
  setTimeout(() => triggerHaptic(), ms);
}

const TarotCardDetailScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));

  // fixed-size 3 slots array with nulls
  const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

  const maxIndex = deck.length - 1;
  const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);

  // Arc progress shared across cards
  const progress = useSharedValue(initialIndex);

  // Lock state when 3 slots filled
  const filledCount = selectedCards.filter(Boolean).length;
  const isLocked = filledCount === 3;
  const lockedSV = useSharedValue(0);

  useEffect(() => {
    progress.value = initialIndex;
  }, [initialIndex, progress]);

  useEffect(() => {
    lockedSV.value = isLocked ? 1 : 0;
  }, [isLocked, lockedSV]);

  // allow duplicates & auto place in first empty slot
  const handleSelect = (card: CardT, slotIndex?: number) => {
    setSelectedCards(prev => {
      const next = [...prev];

      if (slotIndex !== undefined) {
        if (!next[slotIndex]) {
          next[slotIndex] = card; // fill only if empty
        }
        return next;
      }

      // find first empty slot
      const emptyIdx = next.findIndex(x => x === null);
      if (emptyIdx !== -1) {
        next[emptyIdx] = card; // duplicates allowed
      }
      return next;
    });
  };

  // remove/clear a selected slot
  const handleRemove = (slotIndex: number) => {
    setSelectedCards(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const onStartRevealing = () => {
    console.log('Start Revealing');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../assets/images/backgroundImage.png')}
        style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Image source={require('../../../../assets/icons/backIcon.png')} style={styles.backIcon} resizeMode="contain" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap} pointerEvents="none">
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
                Tarot Reading
              </Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.content}>
            <Text style={[styles.focusTitle, { color: colors.primary || '#CEA16A' }]}>Focus on Your Question</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>
              Take a deep breath and think about{'\n'}
              what you seek to know
            </Text>
          </View>

          {/* 3 slots */}
          <View style={styles.selectedRow}>
            {[0, 1, 2].map(i => (
              <View key={i} style={styles.box}>
                {selectedCards[i] && (
                  <>
                    <Image source={selectedCards[i]!.img} style={styles.boxImg} resizeMode="cover" />
                    {/* remove (cross) icon */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleRemove(i)}
                      style={styles.removeBtn}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <Image
                        source={require('../../../../assets/icons/closeIcon.png')}
                        style={styles.removeIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Start Revealing (hidden until 3 filled) */}
          {isLocked && (
            <TouchableOpacity activeOpacity={0.9} onPress={onStartRevealing} style={styles.revealBtnWrap}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.revealBtnGrad}
              >
                <Text style={styles.revealBtnText}>Start Revealing</Text>
              </GradientBox>
            </TouchableOpacity>
          )}

          {/* Deck */}
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
              />
            ))}
            <Text style={styles.hint}>
              drag to move
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
};

export default TarotCardDetailScreen;

/* --------- Arc card (overlay) --------- */
function ArcCard({
  card,
  index,
  progress,
  maxIndex,
  onSelect,
  lockedSV,
}: {
  card: CardT;
  index: number;
  progress: Animated.SharedValue<number>;
  maxIndex: number;
  onSelect: (c: CardT, slotIndex?: number) => void;
  lockedSV: Animated.SharedValue<number>;
}) {
  const pressScale = useSharedValue(1);
  const isPressing = useSharedValue(0);
  const sentUpOnce = useSharedValue(0);

  const start = useSharedValue(0);

  // translation values so card follows the finger during long-press drag
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => {
    const centerIndex = progress.value;
    const rel = index - centerIndex;
    const absRel = Math.abs(rel);

    // hide far
    if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
      return {
        position: 'absolute',
        left: CENTER_X - CARD_W / 2,
        top: CENTER_Y + 9999,
        width: CARD_W,
        height: CARD_H,
        opacity: 0,
        zIndex: 0,
      };
    }

    const rawDeg = rel * STEP_DEG;

    // freeze ring (edge)
    if (absRel > HALF_WINDOW) {
      const angleDeg = Math.sign(rel) * MAX_VISIBLE_DEG;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
      const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

      const combinedScale = 0.84 * pressScale.value;
      const baseOpacity = 0.35;

      // IMPORTANT: if dragging/pressing, keep card STRAIGHT (rotate 0deg)
      const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

      return {
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        opacity: baseOpacity,
        transform: [
          { rotate: rotateDeg },
          { scale: combinedScale },
          { translateX: transX.value },
          { translateY: transY.value },
        ],
        zIndex: isPressing.value === 1 ? 1000 : 100,
      };
    }

    // active window
    const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
    const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

    const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
    const baseScale = 1 - 0.18 * t;
    let opacity = 1 - 0.1 * t;
    if (lockedSV.value) opacity = Math.min(opacity, 0.35); // dull when locked

    const cfg = { duration: 120 };
    const combinedScale = baseScale * pressScale.value;

    // IMPORTANT: while dragging, keep rotate 0deg so the card is straight
    const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

    return {
      position: 'absolute',
      left: withTiming(x, cfg),
      top: withTiming(y, cfg),
      width: CARD_W,
      height: CARD_H,
      opacity: withTiming(opacity, cfg),
      transform: [
        { rotate: withTiming(rotateDeg, cfg) },
        { scale: combinedScale },
        { translateX: transX.value },
        { translateY: transY.value },
      ],
      zIndex: isPressing.value === 1 ? 1000 : 200,
    };
  });

  /* Horizontal deck pan — attached per-card */
  const deckPan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onStart(() => {
      'worklet';
      if (lockedSV.value) return;
      start.value = progress.value;
    })
    .onUpdate(e => {
      'worklet';
      if (lockedSV.value || isPressing.value === 1) return;
      const p = start.value - e.translationX / ITEM_STRIDE;
      progress.value = wClamp(p, 0, maxIndex);
    })
    .onEnd(() => {
      'worklet';
      if (lockedSV.value || isPressing.value === 1) return;
      const projected = progress.value; // using current since velocity->snap can conflict with longPress
      const snapTo = wClamp(wRound(projected), 0, maxIndex);
      progress.value = withTiming(snapTo, { duration: 160 });
    });

  /* Tap to select — waits for pan to fail */
  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      'worklet';
      if (lockedSV.value) return;
      runOnJS(triggerHaptic)();
      runOnJS(onSelect)(card); // auto to first empty slot
      pressScale.value = withSpring(1.1, { damping: 18, stiffness: 240 });
      pressScale.value = withDelay(150, withTiming(1, { duration: 120 }));
    })
    .requireExternalGestureToFail(deckPan);

  /* Long-press — ZOOM first, then VIBRATE (delayed)
     CHANGE: .maxDistance(30) so thoda movement allow ho, phir drag smooth ho */
  const longPress = Gesture.LongPress()
    .minDuration(300)
    .maxDistance(30) // allow slight finger drift; prevents accidental cancel
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      'worklet';
      if (lockedSV.value) return;
      isPressing.value = 1;
      sentUpOnce.value = 0;

      // zoom immediately
      pressScale.value = withSpring(1.18, { damping: 16, stiffness: 220 });
      pressScale.value = withDelay(900, withTiming(1.08, { duration: 140 }));

      // vibrate AFTER zoom starts
      runOnJS(triggerHapticDelayed)(120);
    })
    .onFinalize(() => {
      'worklet';
      if (lockedSV.value) return;
      isPressing.value = 0;
      pressScale.value = withTiming(1, { duration: 120 });
      // snap back if not dropped
      transX.value = withTiming(0, { duration: 160 });
      transY.value = withTiming(0, { duration: 160 });
    });

  /* While holding, DRAG to any slot (card follows finger) */
  const dragPan = Gesture.Pan()
    .minDistance(1)
    .onUpdate(e => {
      'worklet';
      if (lockedSV.value) return;
      if (isPressing.value !== 1) return;

      // follow the finger
      transX.value = e.translationX;
      transY.value = e.translationY;
    })
    .onEnd(e => {
      'worklet';
      if (lockedSV.value) return;

      if (isPressing.value !== 1 || sentUpOnce.value === 1) {
        // reset transform
        transX.value = withTiming(0, { duration: 160 });
        transY.value = withTiming(0, { duration: 160 });
        return;
      }

      // consider a "drop" when dragged up enough towards slots
      const movedUpEnough = e.translationY < DROP_Y_THRESHOLD;
      if (movedUpEnough) {
        const x = (e as any).absoluteX as number;

        // compute slot by % across the 3 boxes row
        const leftPadding = SLOTS_PAD_H;
        const rowWidth = SCREEN_WIDTH - leftPadding * 2;
        const slotWidth = rowWidth / 3;
        let slot = Math.max(0, Math.min(2, Math.floor((x - leftPadding) / slotWidth)));

        sentUpOnce.value = 1;

        // small bounce feedback
        pressScale.value = withSpring(1.22, { damping: 16, stiffness: 240 });
        pressScale.value = withDelay(150, withTiming(1.05, { duration: 160 }));

        runOnJS(triggerHaptic)();
        runOnJS(onSelect)(card, slot);
      }

      // either way, return card visually to arc
      transX.value = withTiming(0, { duration: 160 });
      transY.value = withTiming(0, { duration: 160 });
    });

  /* Relationships */
  // Deck pan can run unless you're actively pressing/dragging
  deckPan.simultaneousWithExternalGesture(longPress);
  deckPan.simultaneousWithExternalGesture(dragPan);
  longPress.simultaneousWithExternalGesture(deckPan);
  longPress.simultaneousWithExternalGesture(dragPan);
  dragPan.simultaneousWithExternalGesture(deckPan);
  dragPan.simultaneousWithExternalGesture(longPress);

  // LongPress vs Tap — if press holds enough, longPress wins; otherwise tap
  const composed = Gesture.Simultaneous(
    deckPan,
    Gesture.Exclusive(longPress, tap),
    dragPan
  );

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[aStyle, styles.cardShadow, { overflow: 'hidden' }]}>
        <Image source={card.img} style={styles.cardImg} resizeMode="cover" />
      </Animated.View>
    </GestureDetector>
  );
}

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
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
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  content: { paddingTop: 12, alignItems: 'center' },
  focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, letterSpacing: 0.5, marginTop: 6 },
  paragraph: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 14,
  },

  /* Boxes row under subtitle */
  selectedRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  box: {
    width: '32%',
    height: 170,
    borderWidth: 1,
    borderColor: '#CEA16A',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  boxImg: { width: '100%', height: '100%' },

  // remove (cross) button styles
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },

  /* Start Revealing button */
  revealBtnWrap: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  revealBtnGrad: {
    height: 52,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealBtnText: {
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    letterSpacing: 0.5,
  },

  /* Deck below boxes */
  deckWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 130,
    bottom: 0,
    paddingBottom: 28,
  },
  hint: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
  },
  cardImg: { width: '100%', height: '100%', borderRadius: 10 },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
}); 