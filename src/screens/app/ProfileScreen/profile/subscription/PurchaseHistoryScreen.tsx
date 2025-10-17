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
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { useStripeStore, Purchase } from '../../../../../store/useStripeStore';
import GradientBox from '../../../../../components/GradientBox';

const PurchaseHistoryScreen = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<any>();

  // --- Zustand store: Fetching history data ---
  const { purchaseHistory, isFetchingHistory, fetchPurchaseHistory } =
    useStripeStore(
      useShallow(state => ({
        purchaseHistory: state.purchaseHistory,
        isFetchingHistory: state.isFetchingHistory,
        fetchPurchaseHistory: state.fetchPurchaseHistory,
      })),
    );

  // --- Fetch data when the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      fetchPurchaseHistory();
    }, [fetchPurchaseHistory]),
  );

  // --- Component for a single history item ---
  const HistoryItem = ({ item }: { item: Purchase }) => {
    const status = item.payment_status.toLowerCase();

    // --- Using static colors to fix the error ---
    const statusColor =
      status === 'completed'
        ? '#4CAF50' // Static green for success
        : status === 'pending'
        ? '#FFC107' // Static yellow for pending
        : '#F44336'; // Static red for failed/other

    // --- Format date for better readability ---
    const formattedDate = new Date(item.purchase_date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    return (
      <GradientBox
        colors={[colors.bgBox, colors.bgBox]}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Image
            source={require('../../../../../assets/icons/AquariusIcon.png')}
            style={[styles.cardIcon, { tintColor: colors.primary }]}
          />
          <View style={styles.cardHeaderText}>
            <Text style={styles.packageName}>{item.package.name}</Text>
            <Text style={styles.purchaseDate}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            {/* --- FIX: Safely handle null currency --- */}
            {(item.amount / 100).toFixed(2)}{' '}
            {item.currency?.toUpperCase() ?? ''}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '30', borderColor: statusColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.payment_status}
            </Text>
          </View>
        </View>
      </GradientBox>
    );
  };

  // --- Component to show when the list is empty ---
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Purchases Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your past transactions will appear here.
      </Text>
    </View>
  );

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
              Purchase History
            </Text>
          </View>
        </View>

        {/* --- Main Content --- */}
        {isFetchingHistory ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={purchaseHistory}
            renderItem={({ item }) => <HistoryItem item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PurchaseHistoryScreen;

// --- Styles for the Purchase History Screen ---
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  packageName: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    color: '#fff',
  },
  purchaseDate: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 13,
    color: '#fff',
    opacity: 0.7,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  priceText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    color: '#fff',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
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
  },
});


















