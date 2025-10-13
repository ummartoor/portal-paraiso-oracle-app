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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { useStripeStore } from '../../../../../store/useStripeStore';
import GradientBox from '../../../../../components/GradientBox';

// --- CHANGE: Date formatting helper ---
const formatDate = (dateString: string | undefined) => {
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

  // --- Zustand store: Fetching subscription data ---
  const { subscriptionDetails, isFetchingSubscription, fetchSubscriptionDetails } =
    useStripeStore(
      useShallow(state => ({
        subscriptionDetails: state.subscriptionDetails,
        isFetchingSubscription: state.isFetchingSubscription,
        fetchSubscriptionDetails: state.fetchSubscriptionDetails,
      })),
    );

  // --- Fetch data when the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptionDetails();
    }, [fetchSubscriptionDetails]),
  );

  const renderContent = () => {
    // --- Loading State ---
    if (isFetchingSubscription) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // --- No Active Subscription State ---
    // --- CHANGE: Updated to check for vip_subscription as well for more accuracy ---
    if (!subscriptionDetails?.current_package && !subscriptionDetails?.vip_subscription) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Subscription</Text>
          <Text style={styles.emptySubtitle}>
            Upgrade your plan to unlock all features.
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('BuySubscriptionScreen')}
          >
            <Text style={styles.actionText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // --- Active Subscription Details ---
    const { current_package, vip_subscription } = subscriptionDetails;

    return (
      <View style={styles.contentContainer}>
        <GradientBox
          colors={[colors.bgBox, colors.bgBox]}
          style={styles.currentPlanCard}
        >
          <View style={styles.planHeader}>
            <Text style={styles.currentPlanName}>
              {/* --- CHANGE: Show package name, fall back to a default if needed --- */}
              {current_package?.name || 'Active Plan'}
            </Text>
            {current_package?.tier && (
              <View style={[styles.tierBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tierText}>Tier {current_package.tier}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* --- CHANGE: Display start and expiry dates --- */}
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Activated On</Text>
            <Text style={styles.dateValue}>
              {/* Assumes start_date is in the vip_subscription object */}
              {formatDate(vip_subscription?.start_date)}
            </Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Expires On</Text>
            <Text style={styles.dateValue}>
              {/* Assumes end_date is in the vip_subscription object */}
              {formatDate(vip_subscription?.end_date)}
            </Text>
          </View>
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
        {/* --- Header --- */}
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

        {/* --- Main Content --- */}
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
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- CHANGE: Renamed from scrollContainer ---
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  currentPlanCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 20,
  },
  // --- CHANGE: New styles for plan header ---
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPlanName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    color: '#fff',
    flex: 1, // Allows text to wrap if long
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
  // --- CHANGE: New styles for dates ---
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
});