// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ImageBackground,
//   Image, // --- ADDED ---
// } from 'react-native';
// import { useThemeStore } from '../store/useThemeStore';
// import { Fonts } from '../constants/fonts';
// import GradientBox from './GradientBox';
// import { useTranslation } from 'react-i18next';

// const { width: SCREEN_WIDTH } = Dimensions.get('screen');

// type PlanKey = 'yearly' | 'monthly' | 'weekly';

// interface SubscriptionPlanModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onConfirm: (plan: PlanKey) => void;
// }

// // --- CardContent Component ko bahar nikala gaya hai taake code saaf rahe ---
// const CardContent = ({
//   p,
//   isActive,
//   colors,
//   t, // t function ko as a prop pass kiya gaya hai
// }: {
//   p: { title: string; sub: string; strike?: string; perWeek: string; badge?: string };
//   isActive: boolean;
//   colors: any;
//   t: (key: string) => string;
// }) => (
//   <>
//     {/* Left title area */}
//     <View style={{ flex: 1 }}>
//       <View style={styles.cardTitleRow}>
//         <Text
//           style={[
//             styles.cardTitle,
//             { color: isActive ? colors.black : colors.white },
//           ]}
//         >
//           {p.title}
//         </Text>

//         {p.badge ? (
//           <View
//             style={[
//               styles.badge,
//               { backgroundColor: colors.primary + '22', borderColor: colors.primary },
//             ]}
//           >
//             <Text style={[styles.badgeText, { color: colors.primary }]}>{p.badge}</Text>
//           </View>
//         ) : null}
//       </View>

//       <View style={styles.subRow}>
//         <Text
//           style={[
//             styles.subText,
//             { color: isActive ? colors.black : colors.white, opacity: 0.9 },
//           ]}
//         >
//           {p.sub}
//         </Text>

//         {p.strike ? (
//           <Text
//             style={[
//               styles.strike,
//               { color: isActive ? colors.black : colors.white, opacity: 0.6 },
//             ]}
//           >
//             {p.strike}
//           </Text>
//         ) : null}
//       </View>
//     </View>

//     {/* Right price area */}
//     <View style={styles.priceCol}>
//       <Text
//         style={[
//           styles.price,
//           { color: isActive ? colors.black : colors.white },
//         ]}
//       >
//         {p.perWeek}
//       </Text>
//       <Text
//         style={[
//           styles.perWeek,
//           { color: isActive ? colors.black : colors.white, opacity: 0.7 },
//         ]}
//       >
//         {t('subscription_per_week')}
//       </Text>
//     </View>
//   </>
// );

// const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
//   isVisible,
//   onClose,
//   onConfirm,
// }) => {
//   const colors = useThemeStore((s) => s.theme.colors);
//   const [selected, setSelected] = useState<PlanKey>('yearly');
//   const { t } = useTranslation();


//   const plans: Record<
//     PlanKey,
//     { title: string; sub: string; strike?: string; perWeek: string; badge?: string }
//   > = {
//     yearly: {
//       title: t('subscription_yearly'),
//       sub: t('subscription_12_mo'),
//       strike: '$39.99',
//       perWeek: '$3.34',
//       badge: t('subscription_save_55'),
//     },
//     monthly: { title: t('subscription_monthly'), sub: t('subscription_1_mo'), strike: '$3.99', perWeek: '$1.34' },
//     weekly: { title: t('subscription_weekly'), sub: t('subscription_4_week'), strike: '$1.99', perWeek: '$1.34' },
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
//           isActive && { backgroundColor: colors.white, borderColor: colors.primary, borderWidth: 2 },
//         ]}
//       >
//         {isActive ? (
//           <View style={[styles.gradientCard]}>
//             <CardContent p={p} isActive={isActive} colors={colors} t={t as any} />
//           </View>
//         ) : (
//           <GradientBox colors={[colors.bgBox, colors.black]} style={styles.gradientCard}>
//             <CardContent p={p} isActive={isActive} colors={colors} t={t as any} />
//           </GradientBox>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <Modal visible={isVisible} animationType="slide" transparent>
//       <View style={[StyleSheet.absoluteFill, styles.overlayBackground]}>
//         <View style={styles.overlay}>
//           <View style={[styles.modal, { backgroundColor: colors.bgBox }]}>
//             {/* --- CHANGED: Heading translated --- */}
//             <Text style={[styles.heading, { color: colors.primary }]}>
//               {t('subscription_plan_title')}
//             </Text>

//             <ImageBackground
//               source={require('../assets/images/heroImage.png')}
//               style={[styles.hero, { width: SCREEN_WIDTH - 40 }]}
//               resizeMode="cover"
//             >
//               <View style={styles.heroOverlay}>
//                 {/* --- CHANGED: Hero title translated --- */}
//                 <Text style={[styles.heroTitle, { color: colors.white }]}>
//                   {t('subscription_unlock_title')}
//                 </Text>
//               </View>
//             </ImageBackground>

//             <View style={styles.cardsWrap}>
//               <Card k="yearly" withShadow />
//               <Card k="monthly" />
//               <Card k="weekly" />
//             </View>

//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 onPress={onClose}
//                 activeOpacity={0.85}
//                 style={[styles.cancelButton, { backgroundColor: colors.white }]}
//               >
//                 <Text style={[styles.cancelText, { color: colors.black }]}>
//                   {/* --- CHANGED: Cancel button translated --- */}
//                   {t('cancel_button')}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 style={[styles.gradientTouchable, { borderColor: colors.primary, borderWidth: 1.6 }]}
//                 onPress={() => onConfirm(selected)}
//               >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.gradientFill}
//                 >
//                   {/* --- CHANGED: Start Now button translated --- */}
//                   <Text style={styles.startText}>{t('subscription_start_now')}</Text>
//                 </GradientBox>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default SubscriptionPlanModal;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   overlayBackground: {
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   modal: {
//     borderRadius: 15,
//     paddingVertical: 20,
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   heading: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     marginBottom: 10,
//   },
//   hero: {
//     height: 200,
//     // borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: -40, 
//   },
//   heroOverlay: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingBottom: 12,
//   },
//   heroTitle: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom:20

//   },
//   cardsWrap: {
//     width: '100%',
//     gap: 12,
//     paddingHorizontal: 20,
//     marginTop: 20,
//   },
//   card: {
//     minHeight: 74,
//     borderRadius: 16,
//   },
//   gradientCard: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     flex: 1,
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
//   buttonRow: {
//     width: '100%',
//     flexDirection: 'row',
//     columnGap: 12,
//     paddingHorizontal: 20,
//     marginTop: 30,
//   },
//   cancelButton: {
//     flexGrow: 1,
//     flexBasis: 0,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 200,
//   },
//   cancelText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 24,
//   },
//   gradientTouchable: {
//     flexGrow: 1,
//     flexBasis: 0,
//     height: 50,
//     borderRadius: 200,
//     overflow: 'hidden',
//   },
//   gradientFill: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   startText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     color: '#fff',
//   },
// });


import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import GradientBox from './GradientBox';
import { useTranslation } from 'react-i18next';
import { useStripe } from '@stripe/stripe-react-native';
import {
  useStripeStore,
  StripePackage,
} from '../store/useStripeStore';
import { useShallow } from 'zustand/react/shallow';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 15;

type PlanKey = 'yearly' | 'monthly' | 'weekly';

interface SubscriptionPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
 
  onConfirm: (plan: PlanKey) => void;
}

const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
   const { colors } = useThemeStore(state => state.theme);
  const { t } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();


  const {
    packages,
    isLoading,
    fetchStripePackages,
    createPaymentIntent,
    confirmPayment,
    currentSubscription,
    fetchCurrentSubscription,
    debugVerifyPayment,
    upgradeSubscription,
  } = useStripeStore(
    useShallow(state => ({
      packages: state.packages,
      isLoading: state.isLoading,
      fetchStripePackages: state.fetchStripePackages,
      createPaymentIntent: state.createPaymentIntent,
      confirmPayment: state.confirmPayment,
      currentSubscription: state.currentSubscription,
      fetchCurrentSubscription: state.fetchCurrentSubscription,
      debugVerifyPayment: state.debugVerifyPayment,
      upgradeSubscription: state.upgradeSubscription,
    })),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [activatedPackageId, setActivatedPackageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // --- Data Fetching (BuySubscriptionScreen se copy kiya gaya) ---
  // useFocusEffect modal me reliable nahi hai, is liye isay useEffect se badal diya hai
  useEffect(() => {
    if (isVisible) {
      fetchStripePackages();
      fetchCurrentSubscription();
    }
  }, [isVisible, fetchStripePackages, fetchCurrentSubscription]);

  useEffect(() => {
    const activePackageIdFromServer =
      currentSubscription?.vipSubscription?.packageId;
    if (activePackageIdFromServer) {
      setActivatedPackageId(activePackageIdFromServer);
    } else {
      setActivatedPackageId(null);
    }
  }, [currentSubscription]);



  const paidPackages =
    packages
      ?.filter(p => p.type !== 'free')
      .sort((a, b) => a.sort_order - b.sort_order) || [];
  
  // --- Payment Logic (BuySubscriptionScreen se copy kiya gaya) ---
  const handleChoosePlan = async (item: StripePackage) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    if (!defaultPrice) {
      Alert.alert('Error', 'This package is not configured correctly.');
      return;
    }

    setProcessingPackageId(item.id);

    try {
      const paymentData = await createPaymentIntent(
        item.id,
        defaultPrice.stripe_price_id,
      );

      if (!paymentData) {
        setProcessingPackageId(null);
        return;
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Portal Paraiso, Inc.',
        paymentIntentClientSecret: paymentData.clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: { name: 'Customer' },
        appearance: { colors: { primary: '#D9B699' } },
      });

      if (initError) {
        throw new Error(`Could not initialize payment sheet: ${initError.message}`);
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert(`Payment Error: ${paymentError.code}`, paymentError.message);
        }
      } else {
        const confirmationResult = await confirmPayment(paymentData.paymentIntentId);

        if (confirmationResult.success) {
          Alert.alert('Success!', 'Your subscription has been activated successfully!');
          setActivatedPackageId(item.id);
          fetchCurrentSubscription();
          onClose(); // --- CHANGED: navigation.goBack() ki jagah onClose() call kiya ---
        } else {
          Alert.alert(
            'Payment Verification Failed',
            'There was an issue verifying your payment. Please contact support.',
            // Debug button yahan se hata diya hai, production modal ke liye behtar hai
          );
        }
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      Alert.alert('An Unexpected Error Occurred', error.message || 'Please try again later.');
    } finally {
      setProcessingPackageId(null);
    }
  };

  // --- Upgrade Logic (BuySubscriptionScreen se copy kiya gaya) ---
  const handleUpgradePlan = async (item: StripePackage) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    if (!defaultPrice) {
      Alert.alert('Error', 'This package is not configured correctly.');
      return;
    }

    setProcessingPackageId(item.id);

    try {
      const success = await upgradeSubscription(item.id, defaultPrice.stripe_price_id);
      if (success) {
        fetchCurrentSubscription();
        onClose(); // --- CHANGED: navigation.goBack() ki jagah onClose() call kiya ---
      }
    } catch (error: any) {
      console.error('Upgrade processing failed:', error);
      Alert.alert('An Unexpected Error Occurred', error.message || 'Please try again later.');
    } finally {
      setProcessingPackageId(null);
    }
  };

  // --- Card Component (BuySubscriptionScreen se copy kiya gaya) ---
  const Card = ({ item }: { item: StripePackage }) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    const isProcessing = processingPackageId === item.id;
    const isActivated = activatedPackageId === item.id;
    const hasActiveSubscription = activatedPackageId !== null;
    const isUpgradeOption = hasActiveSubscription && !isActivated;
    const [isExpanded, setIsExpanded] = useState(false);
    const features = item.feature_list_for_ui;
    const hasMoreFeatures = features.length > 8;
    const displayedFeatures = isExpanded ? features : features.slice(0, 8);

    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
        <View style={[styles.card, { backgroundColor: colors.bgBox }]}>
          <Text style={styles.cardTitle}>{item.display_name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{defaultPrice?.amount.toFixed(2)}</Text>
            <Text style={styles.priceInterval}>/{defaultPrice?.interval}</Text>
          </View>
          <View style={styles.featuresList}>
            {displayedFeatures.map((feature, i) => (
              <Text key={i} style={styles.featureText}>• {feature}</Text>
            ))}
            {hasMoreFeatures && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.seeMoreText}>{isExpanded ? 'See Less' : 'See More'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isActivated ? (
            <TouchableOpacity style={[styles.actionBtn, styles.activatedButton]} disabled={true}>
              <Text style={styles.activatedText}>Activated</Text>
            </TouchableOpacity>
          ) : isUpgradeOption ? (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpgradePlan(item)} disabled={isProcessing}>
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.gradientWrapper}>
                {isProcessing ? <ActivityIndicator color="#D9B699" /> : <Text style={styles.actionText}>Upgrade</Text>}
              </GradientBox>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleChoosePlan(item)} disabled={isProcessing}>
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.gradientWrapper}>
                {isProcessing ? <ActivityIndicator color="#D9B699" /> : <Text style={styles.actionText}>Start Now</Text>}
              </GradientBox>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      {/* --- CHANGED: Layout ab neeche se upar aayega --- */}
      <View style={[StyleSheet.absoluteFill, styles.overlayBackground]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={[styles.modal, { backgroundColor: colors.bgBox }]}>
          
          {/* --- CHANGED: ScrollView add kiya gaya hai --- */}
          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            {/* Yeh khali View title ko center me rakhne ke liye zaroori hai */}
            <View style={styles.headerIconPlaceholder} />

            <Text style={[styles.heading, { color: colors.primary }]}>
              {t('subscription_plan_title')}
            </Text>

            {/* Naya Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Image
                source={require('../assets/icons/closeIcon.png')} // Yahan close icon ka path dein
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

            {/* Hero Section */}
            <ImageBackground
              source={require('../assets/images/heroImage.png')}
              style={[styles.hero, { width: SCREEN_WIDTH - 40 }]} // Full width minus padding
              resizeMode="cover"
            >
              <View style={styles.heroOverlay}>
                <Text style={[styles.heroTitle, { color: colors.white }]}>
                  {t('subscription_unlock_title')}
                </Text>
              </View>
            </ImageBackground>

         
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ height: 400 }} />
            ) : (
              <View style={styles.carouselSection}>
                <FlatList
                  data={paidPackages}
                  renderItem={({ item }) => <Card item={item} />}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 0 }} 
                  ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
                />
              </View>
            )}
            
  
     

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionPlanModal;


const styles = StyleSheet.create({
  overlayBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end', // --- CHANGED: Modal ko neeche rakha gaya hai
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // paddingHorizontal: 20, // Modal content me padding hai
  },
  modal: {
    maxHeight: SCREEN_HEIGHT * 0.9, 
    paddingTop: 20,

    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
    headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginBottom: 10,
    width: '100%',
  },
  closeBtn: {
    width: 30, 
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF', 
  },
  headerIconPlaceholder: {
    width: 30,
    height: 30,
  },
  heading: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    marginBottom: 10,
  },
hero: {
  height: 200,
  borderRadius: 16,
  overflow: 'hidden',
  marginTop: 10,
  width: SCREEN_WIDTH - 40, 
  alignSelf: 'center', 
},
  heroOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  heroTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  carouselSection: {
    marginTop: 20,
    // height: 480, 
  },
  cardContainer: {
    paddingVertical: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: CARD_WIDTH,
    minHeight: 440,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    color: '#D9B699',
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
    alignSelf: 'stretch',
    paddingHorizontal: 10,
  },
  featureText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  seeMoreText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 13,
    color: '#D9B699',
    marginTop: 8,
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
    backgroundColor: '#a19a9aff',
    height: 52,
    width: '100%',
    borderRadius: 26,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  activatedText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.aeonikBold,
  },
  shadowCard: {},
  cardTitleRow: {},
  subRow: {},
  subText: {},
  strike: {},
  badge: {},
  badgeText: {},
  priceCol: {},
  price: {},
  perWeek: {},
  buttonRow: {},
  cancelButton: {
    // Style for the new Cancel button
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    width: '90%', // Match content width
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 24,
  },

  gradientTouchable: {},
  gradientFill: {},
  startText: {},
});

