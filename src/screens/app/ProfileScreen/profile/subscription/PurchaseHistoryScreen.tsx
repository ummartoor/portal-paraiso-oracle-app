import React, { useCallback, useState } from 'react';
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
import PurchaseDetailModal from '../../../../../components/PurchaseDetailModal';
// REMOVED: No longer importing GradientBox
// import GradientBox from '../../../../../components/GradientBox';

const PurchaseHistoryScreen = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<any>();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { purchaseHistory, isFetchingHistory, fetchPurchaseHistory } =
    useStripeStore(
      useShallow(state => ({
        purchaseHistory: state.purchaseHistory,
        isFetchingHistory: state.isFetchingHistory,
        fetchPurchaseHistory: state.fetchPurchaseHistory,
      })),
    );

  useFocusEffect(
    useCallback(() => {
      fetchPurchaseHistory();
    }, [fetchPurchaseHistory]),
  );

  const handleItemPress = (item: Purchase) => {
    if (__DEV__) {
      console.log('Purchase item pressed:', {
        itemId: item.id,
        item: JSON.stringify(item, null, 2),
      });
    }
    setSelectedPurchase(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPurchase(null);
  };

  const HistoryItem = ({ item }: { item: Purchase }) => {
    const status = item.payment_status.toLowerCase();
    const statusColor =
      status === 'completed'
        ? '#4CAF50'
        : status === 'pending'
        ? '#FFC107'
        : '#F44336';

    const formattedDate = new Date(item.purchase_date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
        style={[styles.card, { backgroundColor: colors.bgBox }]}
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
      </TouchableOpacity>
    );
  };

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

        {isFetchingHistory ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <FlatList
              data={purchaseHistory}
              renderItem={({ item }) => <HistoryItem item={item} />}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={EmptyListComponent}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          </View>
        )}

        {/* Purchase Detail Modal */}
        <PurchaseDetailModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          purchase={selectedPurchase}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PurchaseHistoryScreen;

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
  listWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,

    padding: 16,

    flexDirection: 'column',
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
