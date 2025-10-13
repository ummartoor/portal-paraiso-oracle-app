import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import {
  useStripeStore,
  StripePackage,
} from '../../../../../store/useStripeStore';
import GradientBox from '../../../../../components/GradientBox';
import { useStripe } from '@stripe/stripe-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 15;

const BuySubscriptionScreen = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // --- CHANGE: Added `confirmPayment` from the store ---
  const {
    packages,
    isLoading,
    fetchStripePackages,
    createPaymentIntent,
    confirmPayment,
  } = useStripeStore(
    useShallow(state => ({
      packages: state.packages,
      isLoading: state.isLoading,
      fetchStripePackages: state.fetchStripePackages,
      createPaymentIntent: state.createPaymentIntent,
      confirmPayment: state.confirmPayment, // <-- Added this
    })),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(
    null,
  );
  const [activatedPackageId, setActivatedPackageId] = useState<string | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      fetchStripePackages();
    }, []),
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0] !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const paidPackages =
    packages
      ?.filter(p => p.type !== 'free')
      .sort((a, b) => a.sort_order - b.sort_order) || [];

  // --- CHANGE: Updated handleChoosePlan to call `confirmPayment` ---
  const handleChoosePlan = async (item: StripePackage) => {
    if (activatedPackageId) {
      Alert.alert(
        'Subscription Active',
        'You already have an active subscription.',
      );
      return;
    }

    const defaultPrice = item.prices.find(p => p.is_default);
    if (!defaultPrice) {
      Alert.alert('Error', 'This package is not configured correctly.');
      return;
    }

    setProcessingPackageId(item.id);

    try {
      // Step 1: Create a payment intent on your server
      const clientSecret = await createPaymentIntent(
        item.id,
        defaultPrice.stripe_price_id,
      );

      if (!clientSecret) {
        setProcessingPackageId(null);
        return; // Error is already shown by the store
      }

      // Step 2: Initialize the Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Portal Paraiso, Inc.',
        paymentIntentClientSecret: clientSecret,
      });

      if (initError) {
        throw new Error(
          `Could not initialize payment sheet: ${initError.message}`,
        );
      }

      // Step 3: Present the payment sheet to the user
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        // Handle payment error (e.g., user canceled)
        if (paymentError.code !== 'Canceled') {
          Alert.alert(
            `Payment Error: ${paymentError.code}`,
            paymentError.message,
          );
        }
      } else {
        // Step 4: (NEW) If payment is successful, confirm it with your backend
        const paymentIntentId = clientSecret.split('_secret_')[0];
        if (!paymentIntentId) {
          throw new Error(
            'Critical error: Could not extract Payment Intent ID.',
          );
        }

        // This function will call your backend and show success/error alerts
        const wasConfirmed = await confirmPayment(paymentIntentId);

        if (wasConfirmed) {
          // If backend confirmation is successful, update UI and navigate
          setActivatedPackageId(item.id);
          navigation.goBack();
        }
        // If 'wasConfirmed' is false, the store has already shown an error alert.
        // The user stays on the screen to try again.
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      Alert.alert(
        'An Unexpected Error Occurred',
        error.message || 'Please try again later.',
      );
    } finally {
      // Stop the loading indicator
      setProcessingPackageId(null);
    }
  };

  const Card = ({ item }: { item: StripePackage }) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    const isProcessing = processingPackageId === item.id;
    const isActivated = activatedPackageId === item.id;
    const [isExpanded, setIsExpanded] = useState(false);
    const features = item.feature_list_for_ui;
    const hasMoreFeatures = features.length > 8;
    const displayedFeatures = isExpanded ? features : features.slice(0, 8);
    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
        <GradientBox
          colors={[colors.bgBox, colors.bgBox]}
          style={[styles.card]}
        >
          <>
            {/* {item.is_popular && !isActivated && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )} */}
            <Text style={styles.cardTitle}>{item.display_name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>
                {defaultPrice?.amount.toFixed(2)}
              </Text>
              <Text style={styles.priceInterval}>
                /{defaultPrice?.interval}
              </Text>
            </View>
            <View style={styles.featuresList}>
              {displayedFeatures.map((feature, i) => (
                <Text key={i} style={styles.featureText}>
                  • {feature}
                </Text>
              ))}

              {hasMoreFeatures && (
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                  <Text style={styles.seeMoreText}>
                    {isExpanded ? 'See Less' : 'See More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isActivated ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.activatedButton]}
                disabled={true}
              >
                <Text style={styles.activatedText}>Activated</Text>
              </TouchableOpacity>
            ) : (
           <TouchableOpacity
  style={styles.actionBtn} // The main button style now goes here
  onPress={() => handleChoosePlan(item)}
  disabled={
    isProcessing ||
    (activatedPackageId !== null && !isActivated)
  }
>
  <GradientBox
    colors={[colors.black, colors.bgBox]}
    style={styles.gradientWrapper} // A new style to fill the button
  >
    {isProcessing ? (
      <ActivityIndicator color="#D9B699" />
    ) : (
      <Text style={styles.actionText}>Start Now</Text>
    )}
  </GradientBox>
</TouchableOpacity>
            )}
          </>
        </GradientBox>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
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
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.headerTitle, { color: colors.white }]}
            >
              {t('subscription_plan_title')}
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <Image
              source={require('../../../../../assets/images/heroImage.png')}
              style={styles.hero}
              resizeMode="cover"
            />
            <View style={styles.heroTopOverlay}>
              <Text style={[styles.heroTitle, { color: colors.white }]}>
                {t('subscription_unlock_title')}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ height: 400 }}
            />
          ) : (
            <View style={styles.carouselSection}>
              <FlatList
                data={paidPackages}
                renderItem={({ item }) => <Card item={item} />}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                ItemSeparatorComponent={() => (
                  <View style={{ width: CARD_SPACING }} />
                )}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default BuySubscriptionScreen;

// --- Styles (No changes) ---
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
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
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
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
  heroWrap: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
  },
  hero: { width: '100%', height: '100%' },
  heroTopOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  carouselSection: {
    marginTop: -40,
  },
  cardContainer: {
    paddingVertical: 20,
  },
  card: {
    // height: 400,
    borderRadius: 24,
    // borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    position: 'absolute',
    top: 20,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#000',
  },
  cardTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    color: '#D9B699',
    // marginTop: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  priceAmount: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 32,
    color: '#fff',
  },
  priceInterval: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 5,
    color: '#fff',
    opacity: 0.8,
  },
  featuresList: {
    gap: 8,
  },
  featureText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },


gradientWrapper: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 26, 
},
  actionBtn: {
    height: 52,
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderColor: '#D9B699',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
  activatedButton: {
    backgroundColor: '#4CAF50', 
    height: 52,
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  activatedText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.aeonikBold,
  },
  // Add this to your styles object at the bottom
  seeMoreText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 13,
    color: '#D9B699', // Or any color you like
    marginTop: 8,
  },
});

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   Image,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next'; // --- ADDED ---

// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import GradientBox from '../../../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// type PlanKey = 'yearly' | 'monthly' | 'weekly';

// const BuySubscriptionScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<any>();
//   const { t } = useTranslation(); // --- ADDED ---

//   const [selected, setSelected] = useState<PlanKey>('yearly');

//   // --- CHANGED: Moved inside component and translated ---
//   const plans: Record<PlanKey, {
//     title: string;
//     sub: string;
//     strike?: string;
//     perWeek: string;
//     badge?: string;
//   }> = {
//     yearly:  { title: t('subscription_yearly'),  sub: t('subscription_12_mo'), strike: '$39.99', perWeek: '$3.34', badge: t('subscription_save_55') },
//     monthly: { title: t('subscription_monthly'), sub: t('subscription_1_mo'),  strike: '$3.99',  perWeek: '$1.34' },
//     weekly:  { title: t('subscription_weekly'),  sub: t('subscription_4_week'), strike: '$1.99', perWeek: '$1.34' },
//   };

//   const onStart = () => {
//     // TODO: start trial / purchase flow with `selected` plan
//   };

//   const Card = ({ k, withShadow }: { k: PlanKey; withShadow?: boolean }) => {
//     const p = plans[k];
//     const isActive = selected === k;

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={() => setSelected(k)}
//         style={[
//           styles.card,
//           withShadow && styles.shadowCard,
//           {
//             backgroundColor: isActive ? colors.white : colors.bgBox,
//             borderColor: isActive ? colors.primary : 'transparent',
//           },
//         ]}
//       >
//         <View style={{ flex: 1 }}>
//           <View style={styles.cardTitleRow}>
//             <Text
//               style={[
//                 styles.cardTitle,
//                 { color: isActive ? colors.black : colors.white },
//               ]}
//             >
//               {p.title}
//             </Text>
//             {p.badge ? (
//               <View style={[styles.badge, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
//                 <Text style={[styles.badgeText, { color: colors.primary }]}>
//                   {p.badge}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//           <View style={styles.subRow}>
//             <Text
//               style={[
//                 styles.subText,
//                 { color: isActive ? colors.black : colors.white, opacity: 0.9 },
//               ]}
//             >
//               {p.sub}
//             </Text>
//             {p.strike ? (
//               <Text
//                 style={[
//                   styles.strike,
//                   { color: isActive ? colors.black : colors.white, opacity: 0.6 },
//                 ]}
//               >
//                 {p.strike}
//               </Text>
//             ) : null}
//           </View>
//         </View>

//         <View style={styles.priceCol}>
//           <Text
//             style={[
//               styles.price,
//               { color: isActive ? colors.black : colors.white },
//             ]}
//           >
//             {p.perWeek}
//           </Text>
//           <Text
//             style={[
//               styles.perWeek,
//               { color: isActive ? colors.black : colors.white, opacity: 0.7 },
//             ]}
//           >
//             {/* --- CHANGED --- */}
//             {t('subscription_per_week')}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             {/* --- CHANGED --- */}
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//               {t('subscription_plan_title')}
//             </Text>
//           </View>
//         </View>

//         <View style={[styles.heroWrap, { width: SCREEN_WIDTH, marginHorizontal: -20 }]}>
//           <Image
//             source={require('../../../../../assets/images/heroImage.png')}
//             style={styles.hero}
//             resizeMode="cover"
//           />
//           <View style={styles.heroTopOverlay}>
//             {/* --- CHANGED --- */}
//             <Text style={[styles.heroTitle, { color: colors.white }]}>
//               {t('subscription_unlock_title')}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.cardsWrap}>
//           <Card k="yearly" withShadow />
//           <Card k="monthly" />
//           <Card k="weekly" />
//         </View>

//         <View style={styles.footer}>
//           <TouchableOpacity activeOpacity={0.85} style={{ width: '100%' }} onPress={onStart}>
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
//             >
//               {/* --- CHANGED --- */}
//               <Text style={styles.actionText}>{t('subscription_start_now')}</Text>
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default BuySubscriptionScreen;

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
//   heroWrap: {
//     height: 300,
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 16,
//     position: 'relative',
//   },
//   hero: { width: '100%', height: '100%' },
//   heroTopOverlay: {
//     position: 'absolute',
//     top: 220,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   heroTitle: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   cardsWrap: {
//     gap: 12,
//     marginTop: -32,
//     zIndex: 2,
//   },
//   card: {
//     minHeight: 74,
//     borderRadius: 16,
//     borderWidth: 2,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   shadowCard: {
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 5,
//   },
//   cardTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: 8,
//   },
//   cardTitle: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 16,
//   },
//   subRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: 10,
//     marginTop: 4,
//   },
//   subText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 12,
//   },
//   strike: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 12,
//     textDecorationLine: 'line-through',
//   },
//   badge: {
//     borderRadius: 12,
//     paddingVertical: 2,
//     paddingHorizontal: 8,
//     borderWidth: 1,
//   },
//   badgeText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 10,
//   },
//   priceCol: { alignItems: 'flex-end' },
//   price: { fontFamily: Fonts.aeonikBold, fontSize: 16 },
//   perWeek: { fontFamily: Fonts.aeonikRegular, fontSize: 12, marginTop: 2 },
//   footer: {
//     paddingTop: 16,
//     paddingBottom: Platform.select({ ios: 8, android: 28 }),
//     marginTop: 'auto', // Pushes footer to the bottom
//   },
//   actionBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   Image,
//   Dimensions,
//   FlatList,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';
// import { useShallow } from 'zustand/react/shallow';

// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { useStripeStore, StripePackage } from '../../../../../store/useStripeStore';
// import GradientBox from '../../../../../components/GradientBox';
// import { useStripe } from '@stripe/stripe-react-native';

// const { width: SCREEN_WIDTH } = Dimensions.get('screen');

// const CARD_WIDTH = SCREEN_WIDTH * 0.7;
// const CARD_SPACING = 15;
// const SIDECARD_SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

// const BuySubscriptionScreen = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const navigation = useNavigation<any>();
//   const { t } = useTranslation();
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const { packages, isLoading, fetchStripePackages, createPaymentIntent, isCreatingIntent } = useStripeStore(
//     useShallow(state => ({
//       packages: state.packages,
//       isLoading: state.isLoading,
//       fetchStripePackages: state.fetchStripePackages,
//       createPaymentIntent: state.createPaymentIntent,
//       isCreatingIntent: state.isCreatingIntent,
//     }))
//   );

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   useFocusEffect(
//     useCallback(() => {
//       fetchStripePackages();
//     }, [])
//   );

//   const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
//     if (viewableItems[0] !== undefined) {
//       setActiveIndex(viewableItems[0].index);
//     }
//   }).current;

//   const paidPackages = packages
//     ?.filter(p => p.type !== 'free')
//     .sort((a, b) => a.sort_order - b.sort_order) || [];

//   const handleChoosePlan = async (item: StripePackage) => {
//     const defaultPrice = item.prices.find(p => p.is_default);
//     if (!defaultPrice || !defaultPrice.stripe_price_id) {
//       Alert.alert('Error', 'This package is not configured correctly. Please contact support.');
//       return;
//     }

//     setProcessingPackageId(item.id);

//     try {
//       const clientSecret = await createPaymentIntent(item.id, defaultPrice.stripe_price_id);

//       if (!clientSecret) {
//         Alert.alert('Error', 'Could not initiate payment. Please try again.');
//         return;
//       }

//       const { error: initError } = await initPaymentSheet({
//         merchantDisplayName: "Portal Paraiso, Inc.",
//         paymentIntentClientSecret: clientSecret,
//         allowsDelayedPaymentMethods: true,
//         returnURL: 'portalparaiso://stripe-redirect',
//       });

//       if (initError) {
//         throw new Error(`Could not initialize payment sheet: ${initError.message}`);
//       }

//       const { error: paymentError } = await presentPaymentSheet();

//       if (paymentError) {
//         if (paymentError.code !== 'Canceled') {
//           Alert.alert(`Payment Error: ${paymentError.code}`, paymentError.message);
//         }
//       } else {
//         Alert.alert('Success', 'Your subscription has been activated!');
//         navigation.goBack();
//       }

//     } catch (error: any) {
//       console.error("Payment processing failed:", error);
//       Alert.alert('An Unexpected Error Occurred', error.message || 'Please try again later.');

//     } finally {
//       setProcessingPackageId(null);
//     }
//   };

//   const Card = ({ item, index }: { item: StripePackage, index: number }) => {
//     const defaultPrice = item.prices.find(p => p.is_default);
//     const isProcessing = processingPackageId === item.id;

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={() => handleChoosePlan(item)}
//         style={[styles.cardContainer, { width: CARD_WIDTH }]}
//         disabled={isProcessing || processingPackageId !== null} // Disable button if this or ANY card is processing
//       >
//         <GradientBox
//           colors={[colors.bgBox, colors.bgBox]}
//           style={[styles.card]}
//         >
//           {isProcessing ? (
//              <ActivityIndicator size="large" color={colors.primary} />
//           ) : (
//             <>
//               {item.is_popular && (
//                 <View style={[styles.badge, { backgroundColor: colors.primary }]}>
//                   <Text style={styles.badgeText}>Popular</Text>
//                 </View>
//               )}
//               <Text style={styles.cardTitle}>
//                 {item.display_name}
//               </Text>
//               <View style={styles.priceRow}>
//                 <Text style={styles.priceAmount}>
//                   {defaultPrice ? `$${defaultPrice.amount.toFixed(2)}` : ''}
//                 </Text>
//                 <Text style={styles.priceInterval}>
//                   /{defaultPrice?.interval}
//                 </Text>
//               </View>
//               <View style={styles.featuresList}>
//                 {item.feature_list_for_ui.slice(0, 5).map((feature, i) => (
//                   <Text key={i} style={styles.featureText}>
//                     • {feature}
//                   </Text>
//                 ))}
//               </View>
//             </>
//           )}
//         </GradientBox>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.headerTitleWrap}>
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//               {t('subscription_plan_title')}
//             </Text>
//           </View>
//         </View>

//         <ScrollView showsVerticalScrollIndicator={false}>
//           <View style={styles.heroWrap}>
//             <Image
//               source={require('../../../../../assets/images/heroImage.png')}
//               style={styles.hero}
//               resizeMode="cover"
//             />
//             <View style={styles.heroTopOverlay}>
//               <Text style={[styles.heroTitle, { color: colors.white }]}>
//                 {t('subscription_unlock_title')}
//               </Text>
//             </View>
//           </View>

//           {isLoading ? (
//             <ActivityIndicator size="large" color={colors.primary} style={{ height: 350 }} />
//           ) : (
//             <View style={styles.carouselSection}>
//               <FlatList
//                 ref={flatListRef}
//                 data={paidPackages}
//                 renderItem={({ item, index }) => <Card item={item} index={index} />}
//                 keyExtractor={item => item.id}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingHorizontal: 20 }}
//                 ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
//                 snapToInterval={CARD_WIDTH + CARD_SPACING}
//                 decelerationRate="fast"
//                 onViewableItemsChanged={onViewableItemsChanged}
//                 viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
//               />

//               <View style={styles.dotsContainer}>
//                 {paidPackages.map((_, index) => (
//                   <View
//                     key={index}
//                     style={[
//                       styles.dot,
//                       { backgroundColor: index === activeIndex ? colors.primary : '#777' },
//                     ]}
//                   />
//                 ))}
//               </View>
//             </View>
//           )}
//         </ScrollView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default BuySubscriptionScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: {
//     flex: 1,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//   },
//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//     paddingHorizontal: 20
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 20,
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
//   heroWrap: {
//     height: 250,
//     marginHorizontal: 20,
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 16,
//     position: 'relative',
//   },
//   hero: { width: '100%', height: '100%' },
//   heroTopOverlay: {
//     position: 'absolute',
//     bottom: 20,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   heroTitle: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   carouselSection: {
//     marginTop: -40, // --- Overlap with hero image ---
//   },
//   cardContainer: {
//     paddingVertical: 20,
//   },
//   card: {
//     height: 360, // Reduced height
//     borderRadius: 24,
//     borderWidth: 1.5,
//     padding: 20,
//     justifyContent: 'center', // Changed to center for activity indicator
//     alignItems: 'center',
//     borderColor: 'rgba(255,255,255,0.2)' // Default border
//   },
//   activeCard: {
//     borderColor: '#D9B699', // Highlighted border
//   },
//   badge: {
//     position: 'absolute',
//     top: 20,
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   badgeText: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 11,
//     textTransform: 'uppercase',
//     color: '#000'
//   },
//   cardTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     color: '#fff'
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginVertical: 10,
//   },
//   priceAmount: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 32,
//     color: '#fff'
//   },
//   priceInterval: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     marginLeft: 5,
//     marginBottom: 5,
//     color: '#fff',
//     opacity: 0.8
//   },
//   featuresList: {
//     gap: 8,
//   },
//   featureText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 13,
//     color: '#fff',
//     opacity: 0.9
//   },
//   actionBtn: {
//     height: 52,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 16,
//     color: '#fff',
//     fontFamily: Fonts.aeonikBold,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 10,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
// });
