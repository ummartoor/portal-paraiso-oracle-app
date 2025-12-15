import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
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
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import GradientBox from './GradientBox';
import { useTranslation } from 'react-i18next';
import { useStripe } from '@stripe/stripe-react-native';
import { useStripeStore, StripePackage } from '../store/useStripeStore';
import { useFeaturePermissionStore } from '../store/useFeaturePermissionStore';
import { useShallow } from 'zustand/react/shallow';
import SubscriptionConfirmationModal from './SubscriptionConfirmationModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 15;

type PlanKey = 'yearly' | 'monthly' | 'weekly';

interface SubscriptionPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (plan: PlanKey) => void; // This prop is not used by the new logic but kept for type safety
  message?: string; // Optional message to display to the user
}

// --- CardContent Component (No Changes) ---
const CardContent = ({
  p,
  isActive,
  colors,
  t,
}: {
  p: {
    title: string;
    sub: string;
    strike?: string;
    perWeek: string;
    badge?: string;
  };
  isActive: boolean;
  colors: any;
  t: (key: string) => string;
}) => (
  <>
    <View style={{ flex: 1 }}>
      <View style={styles.cardTitleRow}>
        <Text
          style={[
            styles.cardTitle,
            { color: isActive ? colors.black : colors.white },
          ]}
        >
          {p.title}
        </Text>
        {p.badge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary + '22',
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {p.badge}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.subRow}>
        <Text
          style={[
            styles.subText,
            { color: isActive ? colors.black : colors.white, opacity: 0.9 },
          ]}
        >
          {p.sub}
        </Text>
        {p.strike ? (
          <Text
            style={[
              styles.strike,
              { color: isActive ? colors.black : colors.white, opacity: 0.6 },
            ]}
          >
            {p.strike}
          </Text>
        ) : null}
      </View>
    </View>
    <View style={styles.priceCol}>
      <Text
        style={[
          styles.price,
          { color: isActive ? colors.black : colors.white },
        ]}
      >
        {p.perWeek}
      </Text>
      <Text
        style={[
          styles.perWeek,
          { color: isActive ? colors.black : colors.white, opacity: 0.7 },
        ]}
      >
        {t('subscription_per_week')}
      </Text>
    </View>
  </>
);

const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  message,
}) => {
  const { colors } = useThemeStore(state => state.theme);
  const { t } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // --- CHANGED: `upgradeSubscription` store se remove kar diya gaya hai ---
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

  // Feature access for timer information
  const { featureAccess, fetchFeatureAccess } = useFeaturePermissionStore(
    useShallow(state => ({
      featureAccess: state.featureAccess,
      fetchFeatureAccess: state.fetchFeatureAccess,
    })),
  );

  const [processingPackageId, setProcessingPackageId] = useState<string | null>(
    null,
  );
  const [activatedPackageId, setActivatedPackageId] = useState<string | null>(
    null,
  );
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [selectedPackageForConfirmation, setSelectedPackageForConfirmation] =
    useState<StripePackage | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isVisible) {
      // Fetch packages when modal opens
      // Force fetch if packages are missing to ensure they load
      const shouldForceFetch = !packages || packages.length === 0;
      fetchStripePackages(shouldForceFetch);
      fetchCurrentSubscription();
      // Fetch feature access to get timer information
      fetchFeatureAccess(false);
    }
  }, [isVisible, fetchFeatureAccess]);

  useEffect(() => {
    const activePackageIdFromServer =
      currentSubscription?.vipSubscription?.packageId;
    if (activePackageIdFromServer) {
      setActivatedPackageId(activePackageIdFromServer);
    } else {
      setActivatedPackageId(null);
    }
  }, [currentSubscription]);

  const plans: Record<
    PlanKey,
    {
      title: string;
      sub: string;
      strike?: string;
      perWeek: string;
      badge?: string;
    }
  > = {
    yearly: {
      title: t('subscription_yearly'),
      sub: t('subscription_12_mo'),
      strike: '$39.99',
      perWeek: '$3.34',
      badge: t('subscription_save_55'),
    },
    monthly: {
      title: t('subscription_monthly'),
      sub: t('subscription_1_mo'),
      strike: '$3.99',
      perWeek: '$1.34',
    },
    weekly: {
      title: t('subscription_weekly'),
      sub: t('subscription_4_week'),
      strike: '$1.99',
      perWeek: '$1.34',
    },
  };

  const paidPackages = useMemo(() => {
    console.log('📦 SubscriptionPlanModal - Packages data:', {
      packages: packages?.length || 0,
      packagesData: packages,
    });

    if (!packages || packages.length === 0) {
      console.log('⚠️ No packages available');
      return [];
    }

    const filtered = packages
      .filter(p => p.type !== 'free')
      .sort((a, b) => a.sort_order - b.sort_order);

    console.log('✅ Paid packages after filter:', {
      total: packages.length,
      filtered: filtered.length,
      types: packages.map(p => p.type),
    });

    return filtered;
  }, [packages]);

  const handleChoosePlan = (item: StripePackage) => {
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

    // Show confirmation modal first
    setSelectedPackageForConfirmation(item);
    setConfirmationModalVisible(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPackageForConfirmation) return;

    const item = selectedPackageForConfirmation;
    const defaultPrice = item.prices.find(p => p.is_default);
    if (!defaultPrice) {
      Alert.alert('Error', 'This package is not configured correctly.');
      setConfirmationModalVisible(false);
      return;
    }

    // Determine if this is a plan change (user has active subscription but different package)
    const activeSubscription = currentSubscription?.vipSubscription;
    const isPlanChange =
      !!activeSubscription && activeSubscription.packageId !== item.id;

    setProcessingPackageId(item.id);
    setConfirmationModalVisible(false);

    try {
      // Step 1: Create payment intent
      const paymentData = await createPaymentIntent(
        item.id,
        defaultPrice.stripe_price_id,
        isPlanChange,
      );

      if (!paymentData) {
        setProcessingPackageId(null);
        return;
      }

      // Step 2: Initialize payment sheet
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
        defaultBillingDetails: { name: 'Customer' },
        appearance: { colors: { primary: '#D9B699' } },
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

      // Step 3: Present payment sheet
      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        if (paymentResult.error.code !== 'Canceled') {
          Alert.alert(
            `Payment Error: ${paymentResult.error.code}`,
            paymentResult.error.message,
          );
        }
        setProcessingPackageId(null);
        return;
      }

      // Step 4: Check payment result status
      const result = (paymentResult as any).paymentIntent;
      if (!result || result.status !== 'Succeeded') {
        Alert.alert(
          'Payment Not Completed',
          `Payment status: ${result?.status || 'unknown'}. Please try again.`,
        );
        setProcessingPackageId(null);
        return;
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
        '../utils/subscriptionPolling'
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
        onClose();
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
                onClose();
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
                onClose();
              },
            },
          ],
        );
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      Alert.alert(
        'An Unexpected Error Occurred',
        error.message || 'Please try again later.',
      );
    } finally {
      setProcessingPackageId(null);
      setSelectedPackageForConfirmation(null);
    }
  };

  // --- CHANGED: `handleUpgradePlan` function remove kar diya gaya hai ---

  const Card: React.FC<{ item: StripePackage }> = React.memo(({ item }) => {
    const defaultPrice = item.prices.find(p => p.is_default);
    const isProcessing = processingPackageId === item.id;
    const isActivated = activatedPackageId === item.id;
    const hasActiveSubscription = activatedPackageId !== null;

    const [isExpanded, setIsExpanded] = useState(false);
    const features = item.feature_list_for_ui;
    const hasMoreFeatures = features.length > 8;
    const displayedFeatures = isExpanded ? features : features.slice(0, 8);

    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
        <View style={[styles.card, { backgroundColor: colors.bgBox }]}>
          <Text style={styles.cardTitle}>{item.display_name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>
              {defaultPrice?.amount.toFixed(2)}
            </Text>
            <Text style={styles.currency}>{defaultPrice?.currency}</Text>
            <Text style={styles.priceInterval}>/{defaultPrice?.interval}</Text>
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
            <TouchableOpacity
              style={[styles.actionBtn, styles.activatedButton]}
              disabled={true}
            >
              <Text style={styles.activatedText}>Activated</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleChoosePlan(item)}
              disabled={isProcessing}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.gradientWrapper}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#D9B699" />
                ) : (
                  <Text style={styles.actionText}>
                    {hasActiveSubscription ? 'Change Plan' : 'Start Now'}
                  </Text>
                )}
              </GradientBox>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  });

  // Debug log
  if (__DEV__) {
    console.log('SubscriptionPlanModal render:', {
      isVisible,
      packagesCount: packages?.length || 0,
      paidPackagesCount: paidPackages.length,
      isLoading,
      colors: !!colors,
    });
  }

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        swipeDirection={['down']}
        swipeThreshold={100}
        style={styles.modal}
        backdropOpacity={0.6}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        avoidKeyboard={true}
        propagateSwipe={true}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.bgBox || '#4A3F50',
              height: SCREEN_HEIGHT * 0.85,
              maxHeight: SCREEN_HEIGHT * 0.95,
            },
          ]}
        >
          {/* Scrollable Content - Everything is scrollable including header */}
          <ScrollView
            bounces={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconContainer}>
                <Image
                  source={require('../assets/icons/AquariusIcon.png')}
                  style={[styles.headerIcon, { tintColor: colors.primary }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: colors.white }]}>
                  {t('subscription_plan_title')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.white }]}>
                  Choose Your Plan
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.closeButtonText, { color: colors.white }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Timer Display - Show above hero image if timer exists */}
              {featureAccess?.timer && (
                <View
                  style={[
                    styles.timerBanner,
                    {
                      backgroundColor: colors.bgBox,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.timerLabel, { color: colors.white }]}>
                    Try after:
                  </Text>
                  <Text style={[styles.timerValue, { color: colors.primary }]}>
                    {featureAccess.timer.hours}h {featureAccess.timer.minutes}m{' '}
                    {featureAccess.timer.seconds}s
                  </Text>
                </View>
              )}

              <View style={styles.heroWrap}>
                <Image
                  source={require('../assets/images/heroImage.png')}
                  style={styles.hero}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay}>
                  <Text style={[styles.heroTitle, { color: colors.white }]}>
                    {t('subscription_unlock_title')}
                  </Text>
                </View>
              </View>

              {/* Message Banner */}
              {message && (
                <View
                  style={[
                    styles.messageBanner,
                    {
                      backgroundColor: colors.bgBox,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.messageText, { color: colors.white }]}>
                    {message}
                  </Text>
                </View>
              )}

              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={{ height: 400 }}
                />
              ) : paidPackages.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text
                    style={[styles.emptyStateText, { color: colors.white }]}
                  >
                    {packages === null
                      ? 'Loading packages...'
                      : packages.length === 0
                      ? 'No packages available at the moment.'
                      : `No paid packages found. Total packages: ${packages.length}`}
                  </Text>
                  {__DEV__ && (
                    <View style={{ marginTop: 10 }}>
                      <Text
                        style={[styles.debugText, { color: colors.primary }]}
                      >
                        Debug: packages={packages?.length || 0}, paidPackages=
                        {paidPackages.length}
                      </Text>
                      {packages && packages.length > 0 && (
                        <Text
                          style={[
                            styles.debugText,
                            { color: colors.primary, marginTop: 5 },
                          ]}
                        >
                          Package types: {packages.map(p => p.type).join(', ')}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
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
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={3}
                    windowSize={5}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Confirmation Modal - Outside main modal to avoid nesting issues */}
      <SubscriptionConfirmationModal
        isVisible={confirmationModalVisible}
        onClose={() => {
          setConfirmationModalVisible(false);
          setSelectedPackageForConfirmation(null);
        }}
        onConfirm={handleConfirmSubscription}
        selectedPackage={selectedPackageForConfirmation}
        currentSubscription={currentSubscription?.vipSubscription || null}
        packages={packages}
        isProcessing={processingPackageId !== null}
      />
    </>
  );
};

export default SubscriptionPlanModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 182, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    width: 28,
    height: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  heroWrap: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  timerBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerLabel: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  timerValue: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    lineHeight: 20,
  },
  messageBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    textAlign: 'center',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    fontFamily: Fonts.aeonikRegular,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
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
  buttonRow: {}, // This style is not used anymore
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    width: '90%',
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
