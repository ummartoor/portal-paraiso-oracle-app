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

  // --- Zustand store: Using the new fetchCurrentSubscription ---
  const {
    currentSubscription,
    isFetchingSubscription,
    fetchCurrentSubscription,
  } = useStripeStore(
    useShallow(state => ({
      currentSubscription: state.currentSubscription,
      isFetchingSubscription: state.isFetchingSubscription,
      fetchCurrentSubscription: state.fetchCurrentSubscription,
    })),
  );

  // --- Fetch data when the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      fetchCurrentSubscription();
    }, [fetchCurrentSubscription]),
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
    // --- CHANGE: Updated to check for vipSubscription from the new API response ---
    if (!currentSubscription?.vipSubscription) {
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
    const { vipSubscription } = currentSubscription;

    return (
      <View style={styles.contentContainer}>
        <GradientBox
          colors={[colors.bgBox, colors.bgBox]}
          style={styles.currentPlanCard}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.currentPlanName, {color:colors.primary}]}>
              {/* --- CHANGE: Using packageName from vipSubscription --- */}
              {vipSubscription?.packageName || 'Active Plan'}
            </Text>
            {vipSubscription?.tier && (
              <View style={[styles.tierBadge, { backgroundColor: colors.white}]}>
                <Text style={styles.tierText}>Tier {vipSubscription.tier}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* --- CHANGE: Display start and expiry dates from vipSubscription --- */}
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Activated On</Text>
            <Text style={styles.dateValue}>
              {/* Using startDate from vipSubscription */}
              {formatDate(vipSubscription?.startDate)}
            </Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateLabel}>Expires On</Text>
            <Text style={styles.dateValue}>
              {/* Using currentPeriodEnd from vipSubscription for expiry */}
              {formatDate(vipSubscription?.currentPeriodEnd)}
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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  currentPlanCard: {
    borderRadius: 16,
    padding: 20,
  },
  planHeader: {
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
    fontFamily: Fonts.aeonikRegular,
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