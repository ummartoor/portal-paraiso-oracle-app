import React, { useCallback, useState } from 'react';
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
  LayoutRectangle,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useAnimatedScrollHandler,
  type SharedValue,
} from 'react-native-reanimated';

import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type DetailRoute = RouteProp<AppStackParamList, 'CarouselCardDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList, 'CarouselCardDetail'>;

type CardT = { id: string; img: ImageSourcePropType };

const CARD_W = 96;
const CARD_H = 152;

// Arc geometry (fan of 4 visible)
const ARC_Y_TOP = SCREEN_HEIGHT * 0.62;
const ARC_SPREAD_DEG = 90;     // spread for visible set
const CURVE_HEIGHT = 26;

const VISIBLE_COUNT = 4;       // show ~4 at a time
const ITEM_GAP = 12;           // spacing between items in the scroll list
const ITEM_STRIDE = CARD_W + ITEM_GAP; // horizontal scroll unit

const SNAP_MS = 200;

/** Local deck (require assets) */
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

const CarouselCardDetailScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const { params } = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const title = params?.title;

  const [deck, setDeck] = useState<CardT[]>(() => toDeck(cardsJSON));
  const [slots, setSlots] = useState<Array<{ id: number; frame?: LayoutRectangle; card?: CardT }>>(
    [{ id: 0 }, { id: 1 }, { id: 2 }],
  );

  // horizontal scroll offset (px)
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onSlotLayout = useCallback((index: number, frame: LayoutRectangle) => {
    setSlots(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], frame };
      return copy;
    });
  }, []);

  const placeIntoSlot = useCallback((c: CardT, slotIdx: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], card: c };
      return next;
    });
    setDeck(prev => prev.filter(x => x.id !== c.id));
  }, []);

  return (
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
              {title}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.content}>
          <Text style={[styles.focusTitle, { color: colors.primary || '#CEA16A' }]}>Focus on Your Question</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            Take a deep breath and think about{'\n'}what you seek to know
          </Text>

          {/* 3 slots */}
          <View style={styles.slotRow}>
            {slots.map((slt, i) => (
              <Slot key={i} index={i} onLayout={onSlotLayout} card={slt.card} />
            ))}
          </View>
        </View>

        {/* Deck area (no group pan) */}
        <View style={styles.deckWrap} pointerEvents="box-none">
          {/* Invisible horizontal scroller that drives positions */}
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            // padding so first/last cards align nicely under the arc
            contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - (VISIBLE_COUNT * CARD_W + (VISIBLE_COUNT - 1) * ITEM_GAP)) / 2 }}
            // Important: we still render cards absolutely; this scroller only gives us offset
          >
            {/* We render placeholder items just to provide the natural scroll length */}
            {deck.map((_, i) => (
              <View key={`ph-${i}`} style={{ width: CARD_W, height: CARD_H, marginRight: i === deck.length - 1 ? 0 : ITEM_GAP }} />
            ))}
          </Animated.ScrollView>

          {/* Actual cards, absolutely positioned following the arc & scrollX */}
          {deck.map((card, i) => (
            <ArcDraggableCard
              key={card.id}
              card={card}
              index={i}
              total={deck.length}
              slots={slots}
              onSnapToSlot={slotIdx => placeIntoSlot(card, slotIdx)}
              scrollX={scrollX}
            />
          ))}

          <Text style={styles.hint}>Drag to move</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default CarouselCardDetailScreen;

/* ----------------- Slots ----------------- */
function Slot({
  index,
  onLayout,
  card,
}: {
  index: number;
  onLayout: (idx: number, frame: LayoutRectangle) => void;
  card?: CardT;
}) {
  return (
    <View style={styles.slotOuter} onLayout={e => onLayout(index, e.nativeEvent.layout)}>
      <View style={styles.slotInner}>
        {card ? <Image source={card.img} style={styles.cardImg} resizeMode="cover" /> : null}
      </View>
    </View>
  );
}

/* --------- Card riding arc + vertical drag to slots --------- */
function ArcDraggableCard({
  card,
  index,
  total,
  slots,
  onSnapToSlot,
  scrollX,
}: {
  card: CardT;
  index: number;
  total: number;
  slots: Array<{ frame?: LayoutRectangle; card?: CardT }>;
  onSnapToSlot: (slotIdx: number) => void;
  scrollX: SharedValue<number>;
}) {
  // angles for visible 4
  const spread = (ARC_SPREAD_DEG * Math.PI) / 180;
  const step = spread / (VISIBLE_COUNT - 1);
  const centerShift = (VISIBLE_COUNT - 1) / 2; // centers the "window" on screen

  const lift = useSharedValue(0);
  const z = useSharedValue(0);

  // --- WORKLET HELPERS ---
  const xForTheta = (t: number) => {
    'worklet';
    return SCREEN_WIDTH * 0.5 + Math.sin(t) * 140 - CARD_W / 2;
  };
  const yForTheta = (t: number) => {
    'worklet';
    return ARC_Y_TOP + (1 - Math.cos(t)) * CURVE_HEIGHT;
  };

  // vertical pan per card (horizontal scroll is owned by ScrollView)
  const cardPan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .failOffsetX([-10, 10])
    .onBegin(() => {
      lift.value = withTiming(-12, { duration: 120 });
      z.value = 1;
    })
    .onChange(e => {
      lift.value += e.changeY; // up negative
      if (lift.value > 0) lift.value = 0;
      if (lift.value < -240) lift.value = -240;
    })
    .onFinalize(() => {
      'worklet';
      // compute current theta from scrollX
      const offset = scrollX.value / ITEM_STRIDE; // how many items scrolled
      const thetaNow = (index - offset - centerShift) * step;

      const cx = xForTheta(thetaNow) + CARD_W / 2;
      const cy = yForTheta(thetaNow) + lift.value + CARD_H * 0.55;

      // try to snap into any free slot
      for (let i = 0; i < slots.length; i++) {
        const f = slots[i].frame;
        const occ = !!slots[i].card;
        if (f && !occ) {
          const inside = cx > f.x && cx < f.x + f.width && cy > f.y && cy < f.y + f.height;
          if (inside) {
            const tx = f.x + (f.width - CARD_W) / 2;
            const ty = f.y + (f.height - CARD_H) / 2;

            const curX = xForTheta(thetaNow);
            const curY = yForTheta(thetaNow) + lift.value;
            const dx = tx - curX;
            const dy = ty - curY;

            // just animate vertical to the slot; no horizontal group shift now
            lift.value = withTiming(lift.value + dy, { duration: SNAP_MS }, () => {
              runOnJS(onSnapToSlot)(i);
            });
            z.value = 0;
            return;
          }
        }
      }

      // not snapped → reset
      lift.value = withTiming(0, { duration: 180 });
      z.value = 0;
    });

  const aStyle = useAnimatedStyle(() => {
    // map index & scroll to an angle within the fan of 4
    const offset = scrollX.value / ITEM_STRIDE;
    const thetaNow = (index - offset - centerShift) * step;

    // Only render if near the window; otherwise move off-screen (perf)
    // (optional optimization)
    const isNear =
      Math.abs(index - offset - centerShift) <= VISIBLE_COUNT + 1;

    const left = xForTheta(thetaNow);
    const top = yForTheta(thetaNow) + lift.value;
    const rotDeg = ((thetaNow * 180) / Math.PI) * 0.15;

    return {
      position: 'absolute',
      left: isNear ? left : -9999,
      top: isNear ? top : -9999,
      width: CARD_W,
      height: CARD_H,
      transform: [{ rotate: `${rotDeg}deg` }],
      zIndex: z.value ? 10 : 1,
    };
  });

  return (
    <GestureDetector gesture={cardPan}>
      <Animated.View style={[aStyle, styles.cardShadow]}>
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
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
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

  content: {
    paddingTop: 12,
    alignItems: 'center',
  },
  focusTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    letterSpacing: 0.5,
    marginTop: 6,
  },
  paragraph: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 14,
  },

  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 12,
    marginBottom: 6,
  },
  slotOuter: {
    width: CARD_W + 14,
    height: CARD_H + 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,160,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  slotInner: {
    width: CARD_W + 2,
    height: CARD_H + 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deckWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingBottom: 28,
  },
  hint: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#cfc5d9',
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
