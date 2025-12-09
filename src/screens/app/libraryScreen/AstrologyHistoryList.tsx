import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { Fonts } from '../../../constants/fonts';
import GradientBox from '../../../components/GradientBox';
import { useThemeStore } from '../../../store/useThemeStore';
import {
  useAstrologyStore,
  HoroscopeHistoryItem,
} from '../../../store/useAstologyStore';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/design';
import { SkeletonListItem } from '../../../components/SkeletonLoader';

const AstrologyHistoryList: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = useThemeStore(s => s.theme.colors);
  const { t } = useTranslation();
  // Getting state and actions from useAstrologyStore
  const { horoscopeHistory, isHistoryLoading, getHoroscopeHistory } =
    useAstrologyStore(
      useShallow(state => ({
        horoscopeHistory: state.horoscopeHistory,
        isHistoryLoading: state.isHistoryLoading,
        getHoroscopeHistory: state.getHoroscopeHistory,
      })),
    );

  // Fetch history when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      getHoroscopeHistory();
    }, [getHoroscopeHistory]),
  );

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  }, []);

  const handleItemPress = useCallback(
    (item: HoroscopeHistoryItem) => {
      navigation.navigate('AstrologyHistoryDetail', { horoscopeItem: item });
    },
    [navigation],
  );

  const renderHistoryItem = useCallback(
    ({ item }: { item: HoroscopeHistoryItem }) => (
      <TouchableOpacity
        style={styles.historyCard}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <Image
          source={require('../../../assets/images/astrology.png')}
          style={styles.cardIcon}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>ASTROLOGY</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.user_question}
          </Text>
        </View>
        <View style={styles.cardRightContainer}>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          <GradientBox
            colors={[colors.black, colors.bgBox]}
            style={styles.iconWrapper}
          >
            <Image
              source={require('../../../assets/icons/rightArrow.png')}
              style={styles.arrowIcon}
            />
          </GradientBox>
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress, formatDate, colors],
  );

  if (isHistoryLoading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonListItem key={i} />
        ))}
      </View>
    );
  }

  // Handle case where history might be null initially or empty
  if (
    !isHistoryLoading &&
    (!horoscopeHistory || horoscopeHistory.length === 0)
  ) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('EMPTY_TEXT')}</Text>
      </View>
    );
  }

  const keyExtractor = useCallback(
    (item: HoroscopeHistoryItem) => item._id,
    [],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 70,
    }),
    [],
  );

  return (
    <FlatList
      data={horoscopeHistory}
      renderItem={renderHistoryItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
};

export default AstrologyHistoryList;

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: Colors.bgBox,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
    ...Shadows.medium,
  },
  cardIcon: { width: 50, height: 50, marginRight: 12 },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    color: '#fff',
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#E0E0E0',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 13,
    marginTop: 4,
  },
  cardRightContainer: { alignItems: 'flex-end', marginLeft: 8 },
  cardDate: {
    color: '#BDBDBD',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  arrowIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});
