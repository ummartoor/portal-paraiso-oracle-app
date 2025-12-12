import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useAuthStore } from '../../../../../store/useAuthStore';
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
  const { t, i18n } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuthStore();
  const {
    packages,
    isLoading,
    fetchStripePackages,
    createPaymentIntent,
    currentSubscription,
    fetchCurrentSubscription,
  } = useStripeStore(
    useShallow(state => ({
      packages: state.packages,
      isLoading: state.isLoading,
      fetchStripePackages: state.fetchStripePackages,
      createPaymentIntent: state.createPaymentIntent,
      currentSubscription: state.currentSubscription,
      fetchCurrentSubscription: state.fetchCurrentSubscription,
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
      fetchCurrentSubscription();
    }, [fetchStripePackages, fetchCurrentSubscription]),
  );

  useEffect(() => {
    const activePackageIdFromServer =
      currentSubscription?.vipSubscription?.packageId;
    if (activePackageIdFromServer) {
      setActivatedPackageId(activePackageIdFromServer);
    } else {
      setActivatedPackageId(null); // Ensure it's null if subscription ends
    }
  }, [currentSubscription]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0] !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const paidPackages =
    packages
      ?.filter(p => p.type !== 'free')
      .sort((a, b) => a.sort_order - b.sort_order) || [];

  const handleChoosePlan = async (item: StripePackage) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    if (!defaultPrice) {
      Alert.alert('Error', 'This package is not configured correctly.');
      return;
    }

    // Check if user already has an active subscription to this package
    const activeSubscription = currentSubscription?.vipSubscription;
    if (activeSubscription && activeSubscription.packageId === item.id) {
      Alert.alert(
        'Already Subscribed',
        'You are already subscribed to this plan. Please check your subscription details.',
      );
      return;
    }

    // Determine if this is a plan change (user has active subscription but different package)
    const isPlanChange =
      !!activeSubscription && activeSubscription.packageId !== item.id;

    setProcessingPackageId(item.id);

    try {
      // Step 1: Create payment intent
      // Note: Backend should create payment intent WITHOUT a default payment method
      // to ensure payment sheet always shows payment method selection
      if (__DEV__) {
        console.log('Creating payment intent for package:', {
          packageId: item.id,
          priceId: defaultPrice.stripe_price_id,
          hasActiveSubscription: !!activeSubscription,
          isPlanChange,
        });
      }

      const paymentData = await createPaymentIntent(
        item.id,
        defaultPrice.stripe_price_id,
        isPlanChange,
      );

      if (!paymentData) {
        if (__DEV__) {
          console.log('Payment intent creation failed or returned null');
        }
        setProcessingPackageId(null);
        return; // Error is already shown by the store
      }

      if (__DEV__) {
        console.log('Payment intent created successfully:', {
          paymentIntentId: paymentData.paymentIntentId,
          hasClientSecret: !!paymentData.clientSecret,
          hasSubscriptionId: !!paymentData.subscriptionId,
        });
      }

      // Step 2: Initialize the Stripe payment sheet
      // Configure to always show payment method selection (prevent auto-completion)
      // Note: If backend creates payment intent with customer/default payment method,
      // Stripe may auto-complete. This config ensures we don't pass additional customer info
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Portal Paraiso, Inc.',
        paymentIntentClientSecret: paymentData.clientSecret,
        // Note: Guide says false, but true is required for recurring subscriptions to save payment method
        // Keeping true as it's correct for subscription billing
        allowsDelayedPaymentMethods: true,
        returnURL: 'portalparaiso://payment-return',
        // Explicitly omit customerId and customerEphemeralKeySecret
        // This prevents using saved payment methods from customer account
        defaultBillingDetails: {
          name: 'Customer',
        },
        appearance: {
          colors: {
            primary: '#D9B699',
          },
        },
      });

      if (__DEV__) {
        console.log('Payment sheet initialized with clientSecret:', {
          hasClientSecret: !!paymentData.clientSecret,
          paymentIntentId: paymentData.paymentIntentId,
        });
      }

      if (initError) {
        throw new Error(
          `Could not initialize payment sheet: ${initError.message}`,
        );
      }

      // Step 3: Present the payment sheet to the user
      if (__DEV__) {
        console.log('Presenting payment sheet...');
      }

      const { error: paymentError, paymentIntent: result } =
        await presentPaymentSheet();

      if (paymentError) {
        if (__DEV__) {
          console.log('Payment sheet error:', {
            code: paymentError.code,
            message: paymentError.message,
            type: paymentError.type,
            localizedMessage: paymentError.localizedMessage,
          });
        }

        if (paymentError.code !== 'Canceled') {
          Alert.alert(
            `Payment Error: ${paymentError.code}`,
            paymentError.message,
          );
        } else {
          // User canceled - this is expected behavior
          if (__DEV__) {
            console.log('User canceled payment sheet');
          }
        }
        setProcessingPackageId(null);
        return;
      }

      // Step 4: Check payment result status
      if (result?.status !== 'Succeeded') {
        Alert.alert(
          'Payment Not Completed',
          `Payment status: ${result?.status || 'unknown'}. Please try again.`,
        );
        setProcessingPackageId(null);
        return;
      }

      if (__DEV__) {
        console.log('Payment sheet completed successfully');
      }

      // Step 5: Verify payment (backup for webhook delays)
      const { verifyPayment } = useStripeStore.getState();
      try {
        await verifyPayment(paymentData.paymentIntentId);
        if (__DEV__) {
          console.log(
            'Payment verified successfully via verify-payment endpoint',
          );
        }
      } catch (error) {
        // Verification failed, but continue with polling as webhook may still process
        if (__DEV__) {
          console.warn(
            'Payment verification failed, continuing with polling:',
            error,
          );
        }
      }

      // Step 6: Payment confirmed - show processing message and poll for webhook
      Alert.alert(
        'Payment Confirmed',
        'Processing your payment. Please wait...',
        [],
        { cancelable: false },
      );

      // Step 7: Poll for subscription status update (webhook will process payment)
      const { pollSubscriptionStatus } = await import(
        '../../../../../utils/subscriptionPolling'
      );
      const pollingResult = await pollSubscriptionStatus({
        expectedPackageId: item.id,
        maxDuration: 30000, // 30 seconds
        initialInterval: 2500, // 2.5 seconds
      });

      if (pollingResult.success && pollingResult.subscription) {
        Alert.alert(
          'Success!',
          'Your subscription has been activated successfully!',
        );
        setActivatedPackageId(item.id);
        fetchCurrentSubscription(true);
        navigation.goBack();
      } else if (pollingResult.timedOut) {
        // Payment confirmed but webhook still processing
        Alert.alert(
          'Payment Received',
          'Your payment has been received. Your subscription will be activated shortly. You can check your subscription status in your profile.',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchCurrentSubscription(true);
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Payment Processing',
          'Your payment has been received. Please check your subscription status in a few moments.',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchCurrentSubscription(true);
                navigation.goBack();
              },
            },
          ],
        );
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('Payment processing failed:', error);
      }
      Alert.alert(
        'An Unexpected Error Occurred',
        error.message || 'Please try again later.',
      );
    } finally {
      setProcessingPackageId(null);
    }
  };

  const Card = ({ item }: { item: StripePackage }) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    //   const defaultPrice =
    // item.prices.find(p => p.currency === 'eur') ||
    // item.prices.find(p => p.is_default);  // fallback
    const isProcessing = processingPackageId === item.id;

    //  Logic
    const isActivated = activatedPackageId === item.id;
    const hasActiveSubscription = activatedPackageId !== null;

    const [isExpanded, setIsExpanded] = useState(false);
    const features = item.feature_list_for_ui;
    const hasMoreFeatures = features.length > 8;
    const displayedFeatures = isExpanded ? features : features.slice(0, 8);

    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
        <View style={[styles.card, { backgroundColor: colors.bgBox }]}>
          <>
            <Text style={styles.cardTitle}>
              {/* {item.display_name?.[user?.app_language ?? 'en'] ?? item.display_name?.en} */}
              <Text style={styles.cardTitle}>{item.display_name}</Text>
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>
                {defaultPrice?.amount.toFixed(2)}
              </Text>
              <Text style={styles.currency}>{defaultPrice?.currency}</Text>
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

            {/* --- CHANGED: Button logic update kiya gaya hai --- */}
            {isActivated ? (
              // CASE 1: Yeh package active hai
              <TouchableOpacity
                style={[styles.actionBtn, styles.activatedButton]}
                disabled={true}
              >
                <Text style={styles.activatedText}>Activated</Text>
              </TouchableOpacity>
            ) : (
              // CASE 2: Yeh package active nahi hai (ya doosra plan hai)
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleChoosePlan(item)} // <-- Hamesha `handleChoosePlan` call hoga
                disabled={isProcessing}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.gradientWrapper}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#D9B699" />
                  ) : (
                    // Text change ho jayega agar pehle se koi plan active hai
                    <Text style={styles.actionText}>
                      {hasActiveSubscription ? 'Change Plan' : 'Start Now'}
                    </Text>
                  )}
                </GradientBox>
              </TouchableOpacity>
            )}
          </>
        </View>
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
        {/* Header */}
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
          {/* Hero section */}
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

          {/* Carousel */}
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

// --- Styles ---
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
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
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
  currency: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    marginLeft: 5,
    marginBottom: 5,
    color: '#fff',
    // opacity: 0.8,
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
  seeMoreText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 13,
    color: '#D9B699',
    marginTop: 8,
  },
});

// import React, { useState, useCallback, useRef, useEffect } from 'react';
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
// import {
//   useStripeStore,
//   StripePackage,
// } from '../../../../../store/useStripeStore';
// import GradientBox from '../../../../../components/GradientBox';
// import { useStripe } from '@stripe/stripe-react-native';

// const { width: SCREEN_WIDTH } = Dimensions.get('screen');
// const CARD_WIDTH = SCREEN_WIDTH * 0.8;
// const CARD_SPACING = 15;

// const BuySubscriptionScreen = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const navigation = useNavigation<any>();
//   const { t } = useTranslation();
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   // =================================================================
//   // --- CHANGE 1: `upgradeSubscription` ko store se add karein ---
//   // =================================================================
//   const {
//     packages,
//     isLoading,
//     fetchStripePackages,
//     createPaymentIntent,
//     confirmPayment,
//     currentSubscription,
//     fetchCurrentSubscription,
//     debugVerifyPayment,
//     upgradeSubscription, // <-- YAHAN ADD KIYA GAYA
//   } = useStripeStore(
//     useShallow(state => ({
//       packages: state.packages,
//       isLoading: state.isLoading,
//       fetchStripePackages: state.fetchStripePackages,
//       createPaymentIntent: state.createPaymentIntent,
//       confirmPayment: state.confirmPayment,
//       currentSubscription: state.currentSubscription,
//       fetchCurrentSubscription: state.fetchCurrentSubscription,
//       debugVerifyPayment: state.debugVerifyPayment,
//       upgradeSubscription: state.upgradeSubscription, // <-- YAHAN ADD KIYA GAYA
//     })),
//   );

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [processingPackageId, setProcessingPackageId] = useState<string | null>(
//     null,
//   );
//   const [activatedPackageId, setActivatedPackageId] = useState<string | null>(
//     null,
//   );
//   const flatListRef = useRef<FlatList>(null);

//   useFocusEffect(
//     useCallback(() => {
//       fetchStripePackages();
//       fetchCurrentSubscription();
//     }, [fetchStripePackages, fetchCurrentSubscription]),
//   );

//   useEffect(() => {
//     const activePackageIdFromServer =
//       currentSubscription?.vipSubscription?.packageId;
//     if (activePackageIdFromServer) {
//       setActivatedPackageId(activePackageIdFromServer);
//     } else {
//       setActivatedPackageId(null); // Ensure it's null if subscription ends
//     }
//   }, [currentSubscription]);

//   const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
//     if (viewableItems[0] !== undefined) {
//       setActiveIndex(viewableItems[0].index);
//     }
//   }).current;

//   const paidPackages =
//     packages
//       ?.filter(p => p.type !== 'free')
//       .sort((a, b) => a.sort_order - b.sort_order) || [];

//   // =================================================================
//   // --- CHANGE 2: `handleChoosePlan` se activation check hatayein ---
//   // =================================================================
//   const handleChoosePlan = async (item: StripePackage) => {
//     // if (activatedPackageId) { ... } <-- YEH CHECK HATA DIYA GAYA HAI
//     // Logic ab Card component mein handle hoga

//     const defaultPrice = item.prices.find(p => p.is_default);
//     if (!defaultPrice) {
//       Alert.alert('Error', 'This package is not configured correctly.');
//       return;
//     }

//     setProcessingPackageId(item.id);

//     try {
//       // Step 1: Create a payment intent on your server
//       const paymentData = await createPaymentIntent(
//         item.id,
//         defaultPrice.stripe_price_id,
//       );

//       if (!paymentData) {
//         setProcessingPackageId(null);
//         return; // Error is already shown by the store
//       }

//       // Step 2: Initialize the Stripe payment sheet
//       const { error: initError } = await initPaymentSheet({
//         merchantDisplayName: 'Portal Paraiso, Inc.',
//         paymentIntentClientSecret: paymentData.clientSecret,
//         allowsDelayedPaymentMethods: true,
//         defaultBillingDetails: {
//           name: 'Customer',
//         },
//         appearance: {
//           colors: {
//             primary: '#D9B699',
//           },
//         },
//       });

//       if (initError) {
//         throw new Error(
//           `Could not initialize payment sheet: ${initError.message}`,
//         );
//       }

//       // Step 3: Present the payment sheet to the user
//       const { error: paymentError } = await presentPaymentSheet();

//       if (paymentError) {
//         if (paymentError.code !== 'Canceled') {
//           Alert.alert(
//             `Payment Error: ${paymentError.code}`,
//             paymentError.message,
//           );
//         }
//       } else {
//         // Step 4: If payment is successful, confirm it with backend
//         const confirmationResult = await confirmPayment(
//           paymentData.paymentIntentId,
//         );

//         if (confirmationResult.success) {
//           Alert.alert(
//             'Success!',
//             'Your subscription has been activated successfully!',
//           );
//           setActivatedPackageId(item.id);
//           fetchCurrentSubscription();
//           navigation.goBack();
//         } else {
//           Alert.alert(
//             'Payment Verification Failed',
//             'There was an issue verifying your payment. Please contact support or run debug verification.',
//             [
//               {
//                 text: 'Cancel',
//                 style: 'cancel',
//               },
//               {
//                 text: 'Run Debug Verify',
//                 onPress: () => {
//                   debugVerifyPayment(paymentData.paymentIntentId);
//                 },
//               },
//             ],
//           );
//         }
//       }
//     } catch (error: any) {
//       console.error('Payment processing failed:', error);
//       Alert.alert(
//         'An Unexpected Error Occurred',
//         error.message || 'Please try again later.',
//       );
//     } finally {
//       setProcessingPackageId(null);
//     }
//   };

//   // =================================================================
//   // --- CHANGE 3: Naya `handleUpgradePlan` function add karein ---
//   // =================================================================
//   const handleUpgradePlan = async (item: StripePackage) => {
//     const defaultPrice = item.prices.find(p => p.is_default);
//     if (!defaultPrice) {
//       Alert.alert('Error', 'This package is not configured correctly.');
//       return;
//     }

//     setProcessingPackageId(item.id);

//     try {
//       // Seedha store ka upgrade function call karein
//       const success = await upgradeSubscription(
//         item.id,
//         defaultPrice.stripe_price_id,
//       );

//       if (success) {
//         // Store mein pehle se hi Alert hai
//         // Naya subscription status fetch karein
//         fetchCurrentSubscription();
//         navigation.goBack();
//       } else {
//         // Store mein pehle se hi Error Alert hai
//       }
//     } catch (error: any)
//     {
//       console.error('Upgrade processing failed:', error);
//       Alert.alert(
//         'An Unexpected Error Occurred',
//         error.message || 'Please try again later.',
//       );
//     } finally {
//       setProcessingPackageId(null);
//     }
//   };

//   // =================================================================
//   // --- CHANGE 4: `Card` component mein button ka logic update karein ---
//   // =================================================================
//   const Card = ({ item }: { item: StripePackage }) => {
//     const defaultPrice = item.prices.find(p => p.is_default);
//     const isProcessing = processingPackageId === item.id;

//     // Naya Logic
//     const isActivated = activatedPackageId === item.id;
//     const hasActiveSubscription = activatedPackageId !== null;
//     const isUpgradeOption = hasActiveSubscription && !isActivated;

//     const [isExpanded, setIsExpanded] = useState(false);
//     const features = item.feature_list_for_ui;
//     const hasMoreFeatures = features.length > 8;
//     const displayedFeatures = isExpanded ? features : features.slice(0, 8);

//     return (
//       <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
//         <View style={[styles.card, { backgroundColor: colors.bgBox }]}>
//           <>
//             {/* ... (baki card ka content same rahega) ... */}
//             <Text style={styles.cardTitle}>{item.display_name}</Text>
//             <View style={styles.priceRow}>
//               <Text style={styles.priceAmount}>
//                 {defaultPrice?.amount.toFixed(2)}
//               </Text>
//               <Text style={styles.priceInterval}>
//                 /{defaultPrice?.interval}
//               </Text>
//             </View>
//             <View style={styles.featuresList}>
//               {displayedFeatures.map((feature, i) => (
//                 <Text key={i} style={styles.featureText}>
//                   • {feature}
//                 </Text>
//               ))}

//               {hasMoreFeatures && (
//                 <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
//                   <Text style={styles.seeMoreText}>
//                     {isExpanded ? 'See Less' : 'See More'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* --- YAHAN BUTTON LOGIC UPDATE KIYA GAYA HAI --- */}
//             {isActivated ? (
//               // CASE 1: Yeh package active hai
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.activatedButton]}
//                 disabled={true}
//               >
//                 <Text style={styles.activatedText}>Activated</Text>
//               </TouchableOpacity>
//             ) : isUpgradeOption ? (
//               // CASE 2: Koi aur package active hai (Upgrade option)
//               <TouchableOpacity
//                 style={styles.actionBtn}
//                 onPress={() => handleUpgradePlan(item)} // <-- Naya handler
//                 disabled={isProcessing}
//               >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.gradientWrapper}
//                 >
//                   {isProcessing ? (
//                     <ActivityIndicator color="#D9B699" />
//                   ) : (
//                     <Text style={styles.actionText}>Upgrade</Text> // <-- Text change
//                   )}
//                 </GradientBox>
//               </TouchableOpacity>
//             ) : (
//               // CASE 3: Koi package active nahi hai (Nayi purchase)
//               <TouchableOpacity
//                 style={styles.actionBtn}
//                 onPress={() => handleChoosePlan(item)} // <-- Purana handler
//                 disabled={isProcessing} // Disable logic simplify kiya gaya
//               >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.gradientWrapper}
//                 >
//                   {isProcessing ? (
//                     <ActivityIndicator color="#D9B699" />
//                   ) : (
//                     <Text style={styles.actionText}>Start Now</Text>
//                   )}
//                 </GradientBox>
//               </TouchableOpacity>
//             )}
//           </>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           translucent
//           backgroundColor="transparent"
//         />
//         {/* ... (Header aur Hero section same rahega) ... */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backBtn}
//           >
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.headerTitleWrap}>
//             <Text
//               numberOfLines={1}
//               ellipsizeMode="tail"
//               style={[styles.headerTitle, { color: colors.white }]}
//             >
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
//             <ActivityIndicator
//               size="large"
//               color={colors.primary}
//               style={{ height: 400 }}
//             />
//           ) : (
//             <View style={styles.carouselSection}>
//               <FlatList
//                 data={paidPackages}
//                 renderItem={({ item }) => <Card item={item} />}
//                 keyExtractor={item => item.id}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingHorizontal: 20 }}
//                 ItemSeparatorComponent={() => (
//                   <View style={{ width: CARD_SPACING }} />
//                 )}
//               />
//             </View>
//           )}
//         </ScrollView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default BuySubscriptionScreen;

// // --- Styles ---
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
//     paddingHorizontal: 20,
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
//     marginBottom: 20,
//   },
//   carouselSection: {
//     marginTop: -40,
//   },
//   cardContainer: {
//     paddingVertical: 20,
//   },
//   card: {
//     // height: 400,
//     borderRadius: 24,
//     // borderWidth: 1.5,
//     padding: 20,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // borderColor: 'rgba(255,255,255,0.2)',
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
//     color: '#000',
//   },
//   cardTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     color: '#D9B699',
//     // marginTop: 40,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginVertical: 10,
//   },
//   priceAmount: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 32,
//     color: '#fff',
//   },
//   priceInterval: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     marginLeft: 5,
//     marginBottom: 5,
//     color: '#fff',
//     opacity: 0.8,
//   },
//   featuresList: {
//     gap: 8,
//   },
//   featureText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 13,
//     color: '#fff',
//     opacity: 0.9,
//   },

//   gradientWrapper: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 26,
//   },
//   actionBtn: {
//     height: 52,
//     width: '100%',
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//     borderColor: '#D9B699',
//     borderWidth: 1,
//   },
//   actionText: {
//     fontSize: 16,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
//   activatedButton: {
//     backgroundColor: '#a19a9aff',
//     height: 52,
//     width: '100%',
//     borderRadius: 26,
//     borderWidth: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   activatedText: {
//     fontSize: 16,
//     color: '#fff',
//     fontFamily: Fonts.aeonikBold,
//   },

//   seeMoreText: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 13,
//     color: '#D9B699',
//     marginTop: 8,
//   },
// });
