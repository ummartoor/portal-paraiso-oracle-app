// import React, { useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { useShallow } from 'zustand/react/shallow';

// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { useStripeStore } from '../../../../../store/useStripeStore';
// import GradientBox from '../../../../../components/GradientBox';

// // --- Date formatting helper ---
// const formatDate = (dateString: string | undefined | null) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString(undefined, {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });
// };

// const SubscriptionDetailsScreen = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const navigation = useNavigation<any>();

//   // --- Zustand store: Using the new fetchCurrentSubscription ---
//   const {
//     currentSubscription,
//     isFetchingSubscription,
//     fetchCurrentSubscription,
//   } = useStripeStore(
//     useShallow(state => ({
//       currentSubscription: state.currentSubscription,
//       isFetchingSubscription: state.isFetchingSubscription,
//       fetchCurrentSubscription: state.fetchCurrentSubscription,
//     })),
//   );

//   // --- Fetch data when the screen is focused ---
//   useFocusEffect(
//     useCallback(() => {
//       fetchCurrentSubscription();
//     }, [fetchCurrentSubscription]),
//   );

//   const renderContent = () => {
//     // --- Loading State ---
//     if (isFetchingSubscription) {
//       return (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       );
//     }

//     // --- No Active Subscription State ---
//     // --- CHANGE: Updated to check for vipSubscription from the new API response ---
//     if (!currentSubscription?.vipSubscription) {
//       return (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyTitle}>No Active Subscription</Text>
//           <Text style={styles.emptySubtitle}>
//             Upgrade your plan to unlock all features.
//           </Text>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: colors.primary }]}
//             onPress={() => navigation.navigate('BuySubscriptionScreen')}
//           >
//             <Text style={styles.actionText}>View Plans</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     // --- Active Subscription Details ---
//     const { vipSubscription } = currentSubscription;

//     return (
//    <View style={styles.contentContainer}>
//         <GradientBox
//           colors={[colors.bgBox, colors.bgBox]}
//           style={styles.currentPlanCard}
//         >
//           <View style={styles.planHeader}>
//             <Text style={[styles.currentPlanName, {color:colors.primary}]}>
//               {vipSubscription?.packageName || 'Active Plan'}
//             </Text>
//             {vipSubscription?.tier && (
//               <View style={[styles.tierBadge, { backgroundColor: colors.white}]}>
//                 <Text style={styles.tierText}>Tier {vipSubscription.tier}</Text>
//               </View>
//             )}
//           </View>

//           <View style={styles.divider} />

//           {/* --- NEW: Display Price --- */}
//           <View style={styles.dateInfoRow}>
//             <Text style={styles.dateLabel}>Price</Text>
//             <Text style={styles.dateValue}>

//    {`${vipSubscription?.currency?.toUpperCase()} ${(vipSubscription?.amount / 100 || 0).toFixed(2)} / ${vipSubscription?.interval}`}
//             </Text>
//           </View>

//           {/* --- Display start and expiry dates --- */}
//           <View style={styles.dateInfoRow}>
//             <Text style={styles.dateLabel}>Activated On</Text>
//             <Text style={styles.dateValue}>
//               {formatDate(vipSubscription?.startDate)}
//             </Text>
//           </View>
//           <View style={styles.dateInfoRow}>
//             <Text style={styles.dateLabel}>Expires On</Text>
//             <Text style={styles.dateValue}>
//               {formatDate(vipSubscription?.currentPeriodEnd)}
//             </Text>
//           </View>
//         </GradientBox>
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
//         {/* --- Header --- */}
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
//               style={[styles.headerTitle, { color: colors.white }]}
//             >
//               Subscription Details
//             </Text>
//           </View>
//         </View>

//         {/* --- Main Content --- */}
//         {renderContent()}
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default SubscriptionDetailsScreen;

// // --- Styles for the Subscription Details Screen ---
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
//     marginBottom: 10,
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
//     maxWidth: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 24,

//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   currentPlanCard: {
//     borderRadius: 16,
//     padding: 20,
//   },
//   planHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   currentPlanName: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     color: '#fff',
//     flex: 1,
//   },
//   tierBadge: {
//     borderRadius: 12,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//   },
//   tierText: {
//     fontFamily: Fonts.aeonikBold,
//     fontSize: 12,
//     color: '#000',
//     textTransform: 'uppercase',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     marginVertical: 16,
//   },
//   dateInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   dateLabel: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 15,
//     color: 'rgba(255,255,255,0.7)',
//   },
//   dateValue: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 15,
//     color: '#fff',
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   emptyTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 20,
//     color: '#fff',
//     textAlign: 'center',
//   },
//   emptySubtitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 15,
//     color: 'rgba(255,255,255,0.7)',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 24,
//   },
//   actionBtn: {
//     height: 52,
//     width: '100%',
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 16,
//     color: '#000',
//     fontFamily: Fonts.aeonikBold,
//   },
// });

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  Image,
  ActivityIndicator,
  Alert, // Alert import karein
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { useStripeStore } from '../../../../../store/useStripeStore';
import { useFeaturePermissionStore } from '../../../../../store/useFeaturePermissionStore';
import GradientBox from '../../../../../components/GradientBox';
import { ScrollView } from 'react-native';

// --- Date formatting helper ---
const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SubscriptionDetailsScreen = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<any>();

  const {
    currentSubscription,
    isFetchingSubscription,
    fetchCurrentSubscription,
    isCancelling,
    cancelSubscription,
  } = useStripeStore(
    useShallow(state => ({
      currentSubscription: state.currentSubscription,
      isFetchingSubscription: state.isFetchingSubscription,
      fetchCurrentSubscription: state.fetchCurrentSubscription,
      isCancelling: state.isCancelling,
      cancelSubscription: state.cancelSubscription,
    })),
  );

  // Feature access store
  const { featureAccess, isFetchingFeatureAccess, fetchFeatureAccess } =
    useFeaturePermissionStore(
      useShallow(state => ({
        featureAccess: state.featureAccess,
        isFetchingFeatureAccess: state.isFetchingFeatureAccess,
        fetchFeatureAccess: state.fetchFeatureAccess,
      })),
    );

  useFocusEffect(
    useCallback(() => {
      fetchCurrentSubscription();
      fetchFeatureAccess(true); // Force fetch to get latest data
    }, [fetchCurrentSubscription, fetchFeatureAccess]),
  );

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? This action cannot be undone.',
      [
        {
          text: "Don't Cancel",
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            await cancelSubscription();
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderContent = () => {
    // --- Loading State ---
    if (isFetchingSubscription && !currentSubscription) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // --- No Active Subscription State ---
    if (!currentSubscription?.vipSubscription) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Subscription</Text>
          <Text style={styles.emptySubtitle}>
            Upgrade your plan to unlock all features.
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('BuySubscription')}
          >
            <Text style={styles.actionText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // --- Active Subscription Details ---
    const { vipSubscription } = currentSubscription;

    return (
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.currentPlanCard}>
          <View style={styles.planHeader}>
            <Text style={[styles.currentPlanName, { color: colors.primary }]}>
              {vipSubscription?.packageName || 'Active Plan'}
            </Text>
            {vipSubscription?.tier && (
              <View
                style={[styles.tierBadge, { backgroundColor: colors.white }]}
              >
                <Text style={styles.tierText}>Tier {vipSubscription.tier}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Status indicator */}
          {vipSubscription?.status && (
            <View style={styles.dateInfoRow}>
              <Text style={styles.dateLabel}>Status</Text>
              <Text
                style={[
                  styles.dateValue,
                  {
                    color:
                      vipSubscription.status === 'active'
                        ? '#4CAF50'
                        : vipSubscription.status === 'past_due'
                        ? '#FF9800'
                        : vipSubscription.status === 'canceled' ||
                          vipSubscription.status === 'cancelled'
                        ? '#F44336'
                        : '#fff',
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {vipSubscription.status.replace('_', ' ')}
              </Text>
            </View>
          )}

          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Price</Text>
            <Text style={styles.dateValue}>
              {`${vipSubscription?.currency?.toUpperCase()} ${(
                vipSubscription?.amount / 100 || 0
              ).toFixed(2)} / ${vipSubscription?.interval}`}
            </Text>
          </View>

          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Activated On</Text>
            <Text style={styles.dateValue}>
              {formatDate(vipSubscription?.startDate)}
            </Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Expires on</Text>
            <Text style={styles.dateValue}>
              {(() => {
                // Try currentPeriodEnd first (for active subscriptions), then endedAt (for cancelled)
                const expiryDate =
                  vipSubscription?.currentPeriodEnd || vipSubscription?.endedAt;

                // Handle special cases
                if (!expiryDate) {
                  const status = vipSubscription?.status?.toLowerCase();

                  // For past_due subscriptions, show appropriate message
                  if (status === 'past_due') {
                    return 'Past Due - Please update payment method';
                  }

                  // For other statuses without expiry date
                  if (status === 'canceled' || status === 'cancelled') {
                    return 'Cancelled';
                  }

                  if (status === 'unpaid') {
                    return 'Unpaid';
                  }

                  if (__DEV__) {
                    console.warn('Subscription expiry date not found:', {
                      currentPeriodEnd: vipSubscription?.currentPeriodEnd,
                      endedAt: vipSubscription?.endedAt,
                      status: vipSubscription?.status,
                      fullSubscription: vipSubscription,
                    });
                  }

                  return 'N/A';
                }

                return formatDate(expiryDate);
              })()}
            </Text>
          </View>
        </View>

        {/* --- Cancel button or status message --- */}
        {(() => {
          const status = vipSubscription?.status?.toLowerCase();

          // Don't show cancel button for already cancelled or past_due subscriptions
          if (status === 'canceled' || status === 'cancelled') {
            return (
              <Text style={styles.cancellationStatus}>
                Your subscription has been cancelled.
              </Text>
            );
          }

          if (status === 'past_due') {
            return (
              <View>
                <Text style={styles.cancellationStatus}>
                  Your subscription is past due. Please update your payment
                  method to continue your subscription.
                </Text>
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.cancelButtonText}>
                      Cancel Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }

          if (vipSubscription?.cancelAtPeriodEnd) {
            return (
              <Text style={styles.cancellationStatus}>
                Your subscription will be cancelled at the end of the current
                period.
              </Text>
            );
          }

          return (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              )}
            </TouchableOpacity>
          );
        })()}

        {/* Feature Access Details */}
        {featureAccess && (
          <>
            {/* Package Info from Feature Access */}
            <View style={[styles.currentPlanCard, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Package Information
              </Text>
              <View style={styles.divider} />
              {featureAccess.package && (
                <>
                  <View style={styles.dateInfoRow}>
                    <Text style={styles.dateLabel}>Package Name</Text>
                    <Text style={styles.dateValue}>
                      {typeof featureAccess.package.name === 'string'
                        ? featureAccess.package.name
                        : featureAccess.package.name?.en ||
                          featureAccess.package.name?.pt ||
                          'N/A'}
                    </Text>
                  </View>
                  <View style={styles.dateInfoRow}>
                    <Text style={styles.dateLabel}>Package Type</Text>
                    <Text style={styles.dateValue}>
                      {featureAccess.package.type || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.dateInfoRow}>
                    <Text style={styles.dateLabel}>Tier</Text>
                    <Text style={styles.dateValue}>
                      {featureAccess.package.tier || 'N/A'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Features Section */}
            <View style={[styles.currentPlanCard, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Features Access
              </Text>
              <View style={styles.divider} />

              {/* Tarot */}
              {featureAccess.readings?.tarot && (
                <View style={styles.featureSection}>
                  <Text style={[styles.featureName, { color: colors.white }]}>
                    Tarot Readings
                  </Text>
                  <View style={styles.featureDetails}>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Unlimited</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.readings.tarot.unlimited
                              ? '#4CAF50'
                              : '#fff',
                          },
                        ]}
                      >
                        {featureAccess.readings.tarot.unlimited ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    {!featureAccess.readings.tarot.unlimited && (
                      <>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Daily Limit</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.tarot.daily_limit === -1
                              ? 'Unlimited'
                              : featureAccess.readings.tarot.daily_limit}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Remaining</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.tarot.remaining}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Used Today</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.tarot.used_today}
                          </Text>
                        </View>
                      </>
                    )}
                    {featureAccess.readings.tarot.cards_per_reading && (
                      <View style={styles.dateInfoRow}>
                        <Text style={styles.dateLabel}>Cards Per Reading</Text>
                        <Text style={styles.dateValue}>
                          {featureAccess.readings.tarot.cards_per_reading}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Buzios */}
              {featureAccess.readings?.buzios && (
                <View style={[styles.featureSection, { marginTop: 16 }]}>
                  <Text style={[styles.featureName, { color: colors.white }]}>
                    Búzios Readings
                  </Text>
                  <View style={styles.featureDetails}>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Unlimited</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.readings.buzios.unlimited
                              ? '#4CAF50'
                              : '#fff',
                          },
                        ]}
                      >
                        {featureAccess.readings.buzios.unlimited ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    {!featureAccess.readings.buzios.unlimited && (
                      <>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Daily Limit</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.buzios.daily_limit === -1
                              ? 'Unlimited'
                              : featureAccess.readings.buzios.daily_limit}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Remaining</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.buzios.remaining}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Used Today</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.buzios.used_today}
                          </Text>
                        </View>
                      </>
                    )}
                    {featureAccess.readings.buzios.shells_per_reading && (
                      <View style={styles.dateInfoRow}>
                        <Text style={styles.dateLabel}>Shells Per Reading</Text>
                        <Text style={styles.dateValue}>
                          {featureAccess.readings.buzios.shells_per_reading}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Astrology */}
              {featureAccess.readings?.astrology && (
                <View style={[styles.featureSection, { marginTop: 16 }]}>
                  <Text style={[styles.featureName, { color: colors.white }]}>
                    Astrology/Horoscope
                  </Text>
                  <View style={styles.featureDetails}>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Unlimited</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.readings.astrology.unlimited
                              ? '#4CAF50'
                              : '#fff',
                          },
                        ]}
                      >
                        {featureAccess.readings.astrology.unlimited
                          ? 'Yes'
                          : 'No'}
                      </Text>
                    </View>
                    {!featureAccess.readings.astrology.unlimited && (
                      <>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Daily Limit</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.astrology.daily_limit === -1
                              ? 'Unlimited'
                              : featureAccess.readings.astrology.daily_limit}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Remaining</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.astrology.remaining}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Used Today</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.astrology.used_today}
                          </Text>
                        </View>
                      </>
                    )}
                    {featureAccess.readings.astrology.depth && (
                      <View style={styles.dateInfoRow}>
                        <Text style={styles.dateLabel}>Depth</Text>
                        <Text style={styles.dateValue}>
                          {featureAccess.readings.astrology.depth}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Chat */}
              {featureAccess.readings?.chat && (
                <View style={[styles.featureSection, { marginTop: 16 }]}>
                  <Text style={[styles.featureName, { color: colors.white }]}>
                    Oracle Chat
                  </Text>
                  <View style={styles.featureDetails}>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Unlimited</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.readings.chat.unlimited
                              ? '#4CAF50'
                              : '#fff',
                          },
                        ]}
                      >
                        {featureAccess.readings.chat.unlimited ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    {!featureAccess.readings.chat.unlimited && (
                      <>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Daily Limit</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.chat.daily_limit === -1
                              ? 'Unlimited'
                              : featureAccess.readings.chat.daily_limit}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Remaining</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.chat.remaining}
                          </Text>
                        </View>
                        <View style={styles.dateInfoRow}>
                          <Text style={styles.dateLabel}>Used Today</Text>
                          <Text style={styles.dateValue}>
                            {featureAccess.readings.chat.used_today}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Additional Features */}
            {(featureAccess.experience || featureAccess.features) && (
              <View style={[styles.currentPlanCard, { marginTop: 20 }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Additional Features
                </Text>
                <View style={styles.divider} />
                {featureAccess.experience && (
                  <>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Ad Free</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.experience.ad_free
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.experience.ad_free ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>VIP Badge</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.experience.vip_badge
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.experience.vip_badge ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>
                        Early Access Features
                      </Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.experience
                              .early_access_features
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.experience.early_access_features
                          ? 'Yes'
                          : 'No'}
                      </Text>
                    </View>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Priority Support</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.experience.priority_support
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.experience.priority_support
                          ? 'Yes'
                          : 'No'}
                      </Text>
                    </View>
                  </>
                )}
                {featureAccess.features && (
                  <>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Audio Narration</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.features.audio_narration
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.features.audio_narration ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Can Save Readings</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: featureAccess.features.can_save_readings
                              ? '#4CAF50'
                              : '#F44336',
                          },
                        ]}
                      >
                        {featureAccess.features.can_save_readings
                          ? 'Yes'
                          : 'No'}
                      </Text>
                    </View>
                    {featureAccess.features.reading_history_days && (
                      <View style={styles.dateInfoRow}>
                        <Text style={styles.dateLabel}>
                          Reading History Days
                        </Text>
                        <Text style={styles.dateValue}>
                          {featureAccess.features.reading_history_days}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Timer and Usage Reset */}
            {(featureAccess.timer || featureAccess.next_reset) && (
              <View style={[styles.currentPlanCard, { marginTop: 20 }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Usage & Timer
                </Text>
                <View style={styles.divider} />
                {featureAccess.timer && (
                  <>
                    <View style={styles.dateInfoRow}>
                      <Text style={styles.dateLabel}>Time Until Reset</Text>
                      <Text style={styles.dateValue}>
                        {featureAccess.timer.hours}h{' '}
                        {featureAccess.timer.minutes}m{' '}
                        {featureAccess.timer.seconds}s
                      </Text>
                    </View>
                    {featureAccess.timer.reset_time && (
                      <View style={styles.dateInfoRow}>
                        <Text style={styles.dateLabel}>Reset Time</Text>
                        <Text style={styles.dateValue}>
                          {formatDate(featureAccess.timer.reset_time)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {featureAccess.next_reset && (
                  <View style={styles.dateInfoRow}>
                    <Text style={styles.dateLabel}>Next Reset</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(featureAccess.next_reset)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {isFetchingFeatureAccess && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.white }]}>
              Loading feature details...
            </Text>
          </View>
        )}
      </ScrollView>
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
              style={[styles.headerTitle, { color: colors.white }]}
            >
              Subscription Details
            </Text>
          </View>
        </View>

        {renderContent()}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default SubscriptionDetailsScreen;

// --- Styles for the Subscription Details Screen ---
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
    marginBottom: 10,
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
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  currentPlanCard: {
    borderRadius: 16,
    // padding: 20,
  },
  planHeader: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPlanName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    color: '#fff',
    flex: 1,
  },
  tierBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tierText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 12,
    color: '#000',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  dateInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateLabel: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  dateValue: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 15,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    height: 52,
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.aeonikBold,
  },

  cancelButton: {
    backgroundColor: '#D9534F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.aeonikBold,
  },
  cancellationStatus: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 20,
    marginBottom: 4,
  },
  featureSection: {
    marginTop: 12,
  },
  featureName: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    marginBottom: 8,
  },
  featureDetails: {
    paddingLeft: 12,
  },
  loadingText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
