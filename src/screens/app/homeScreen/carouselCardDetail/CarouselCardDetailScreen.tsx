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
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type DetailRoute = RouteProp<AppStackParamList, 'CarouselCardDetail'>;
// type Nav = NativeStackNavigationProp<AppStackParamList, 'CarouselCardDetail'>;

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 152;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.62;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// const DECK_TOUCH_TOP = ARC_Y_TOP - CARD_H * 0.25;
// const DECK_TOUCH_HEIGHT = CARD_H + 60;

// /* ---------- Worklet-safe helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   // Math.round is worklet-safe
//   return Math.round(v);
// };

// /* ---------- Data ---------- */
// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = [
//   { id: '1', image: require('../../../../assets/images/deskCard.png') },
//   { id: '2', image: require('../../../../assets/images/deskCard.png') },
//   { id: '3', image: require('../../../../assets/images/deskCard.png') },
//   { id: '4', image: require('../../../../assets/images/deskCard.png') },
//   { id: '5', image: require('../../../../assets/images/deskCard.png') },
//   { id: '6', image: require('../../../../assets/images/deskCard.png') },
//   { id: '7', image: require('../../../../assets/images/deskCard.png') },
//   { id: '8', image: require('../../../../assets/images/deskCard.png') },
//   { id: '9', image: require('../../../../assets/images/deskCard.png') },
//   { id: '10', image: require('../../../../assets/images/deskCard.png') },
//   { id: '11', image: require('../../../../assets/images/deskCard.png') },
//   { id: '12', image: require('../../../../assets/images/deskCard.png') },
//   { id: '13', image: require('../../../../assets/images/deskCard.png') },
//   { id: '14', image: require('../../../../assets/images/deskCard.png') },
//   { id: '15', image: require('../../../../assets/images/deskCard.png') },
//   { id: '16', image: require('../../../../assets/images/deskCard.png') },
// ];

// const toDeck = (rows: typeof cardsJSON): CardT[] =>
//   rows.map(r => ({ id: r.id, img: r.image }));

// const CarouselCardDetailScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const { params } = useRoute<DetailRoute>();
//   const navigation = useNavigation<Nav>();
//   const title = params?.title;

//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const maxIndex = deck.length - 1;

//   // center index on first frame
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);

//   // this drives the arc
//   const progress = useSharedValue(initialIndex);

//   // pan gesture with velocity-based snap
//   const start = useSharedValue(initialIndex);

//   const pan = Gesture.Pan()
//     .activeOffsetX([-12, 12]) // ignore tiny jiggles
//     .onStart(() => {
//       'worklet';
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       'worklet';
//       // right swipe => translationX positive => move to smaller index (left)
//       const p = start.value - e.translationX / ITEM_STRIDE;
//       progress.value = wClamp(p, 0, maxIndex);
//     })
//     .onEnd(e => {
//       'worklet';
//       // allow flick to skip 1–2 cards (tune factor if you like)
//       const projected = progress.value - e.velocityX * 0.00045;
//       const snapTo = wClamp(wRound(projected), 0, maxIndex);
//       progress.value = withTiming(snapTo, { duration: 160 });
//     });

//   // ensure first render is centered
//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex, progress]);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//               <Image source={require('../../../../assets/icons/backIcon.png')} style={styles.backIcon} resizeMode="contain" />
//             </TouchableOpacity>

//             <View style={styles.headerTitleWrap} pointerEvents="none">
//               <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                 {title}
//               </Text>
//             </View>
//           </View>

//           {/* Body */}
//           <View style={styles.content}>
//             <Text style={[styles.focusTitle, { color: colors.primary || '#CEA16A' }]}>Focus on Your Question</Text>
//             <Text style={[styles.paragraph, { color: colors.white }]}>
//               Take a deep breath and think about{'\n'}
//               what you seek to know
//             </Text>
//           </View>

//           {/* Deck */}
//           <View style={styles.deckWrap} pointerEvents="box-none">
//             {/* Transparent gesture capture area */}
//             <GestureDetector gesture={pan}>
//               <View
//                 style={{
//                   position: 'absolute',
//                   left: 0,
//                   right: 0,
//                   top: DECK_TOUCH_TOP,
//                   height: DECK_TOUCH_HEIGHT,
//                   zIndex: 9999,
//                 }}
//                 hitSlop={{ left: 8, right: 8, top: 8, bottom: 8 }}
//               />
//             </GestureDetector>

//             {/* Visible arc overlay */}
//             {deck.map((card, i) => (
//               <ArcCard key={card.id} card={card} index={i} progress={progress} />
//             ))}

//             <Text style={styles.hint}>Swipe the cards left/right</Text>
//           </View>
//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// export default CarouselCardDetailScreen;

// /* --------- Arc card (overlay) --------- */
// function ArcCard({
//   card,
//   index,
//   progress,
// }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
// }) {
//   const aStyle = useAnimatedStyle(() => {
//     const centerIndex = progress.value;
//     const rel = index - centerIndex;
//     const absRel = Math.abs(rel);

//     // hide far
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return {
//         position: 'absolute',
//         left: CENTER_X - CARD_W / 2,
//         top: CENTER_Y + 9999,
//         width: CARD_W,
//         height: CARD_H,
//         opacity: 0,
//         zIndex: 0,
//       };
//     }

//     const rawDeg = rel * STEP_DEG;

//     // freeze ring (edge)
//     if (absRel > HALF_WINDOW) {
//       const angleDeg = Math.sign(rel) * MAX_VISIBLE_DEG;
//       const angleRad = (Math.PI / 180) * angleDeg;
//       const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//       const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//       return {
//         position: 'absolute',
//         left: x,
//         top: y,
//         width: CARD_W,
//         height: CARD_H,
//         opacity: 0.35,
//         transform: [{ rotate: `${angleDeg}deg` }, { scale: 0.84 }],
//         zIndex: 100,
//       };
//     }

//     // active window (subtle timing)
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const scale = 1 - 0.18 * t;
//     const opacity = 1 - 0.1 * t;

//     const cfg = { duration: 120 };

//     return {
//       position: 'absolute',
//       left: withTiming(x, cfg),
//       top: withTiming(y, cfg),
//       width: CARD_W,
//       height: CARD_H,
//       opacity: withTiming(opacity, cfg),
//       transform: [
//         { rotate: withTiming(`${angleDeg}deg`, cfg) },
//         { scale: withTiming(scale, cfg) },
//       ],
//       zIndex: 100,
//     };
//   });

//   return (
//     <Animated.View pointerEvents="none" style={[aStyle, styles.cardShadow, { overflow: 'hidden' }]}>
//       <Image source={card.img} style={styles.cardImg} resizeMode="cover" />
//     </Animated.View>
//   );
// }

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
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
//   backIcon: { width: 22, height: 22, tintColor: '#fff' },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },
//   content: { paddingTop: 12, alignItems: 'center' },
//   focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, letterSpacing: 0.5, marginTop: 6 },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     opacity: 0.85,
//     textAlign: 'center',
//     lineHeight: 20,
//     marginTop: 8,
//     marginBottom: 14,
//   },
//   deckWrap: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//     paddingBottom: 28,
//   },
//   hint: {
//     position: 'absolute',
//     bottom: 10,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#cfc5d9',
//     fontSize: 12,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//   },
// });
