import React from 'react';
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
import { useThemeStore } from '../../../store/useThemeStore'; // 👈 colors lene ke liye

import {
  useTarotCardStore,
  TarotReadingHistoryItem,
} from '../../../store/useTarotCardStore';
import { useTranslation } from 'react-i18next';

const TarotHistoryList: React.FC = () => {
  const navigation = useNavigation<any>(); // 👈 navigation hook
  const { colors } = useThemeStore(s => s.theme); // 👈 theme colors
  const { t } = useTranslation();
  const { history, isHistoryLoading, fetchReadingHistory } = useTarotCardStore(
    useShallow((state) => ({
      history: state.history,
      isHistoryLoading: state.isHistoryLoading,
      fetchReadingHistory: state.fetchReadingHistory,
    }))
  );

  // Fetch history on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchReadingHistory();
    }, [fetchReadingHistory])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderHistoryItem = ({ item }: { item: TarotReadingHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyCard}
      activeOpacity={0.7}
      onPress={() => {
     
        navigation.navigate('TarotReadingHistoryDetail', { readingItem: item });
    
      }}
    >
      <Image
        source={require('../../../assets/images/TarotReading.png')}
        style={styles.cardIcon}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>TAROT READER</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.user_question || item.reading.introduction}
        </Text>
      </View>
      <View style={styles.cardRightContainer}>
        <Text style={styles.cardDate}>{formatDate(item.reading_date)}</Text>

        {/* Gradient wrapper for arrow */}
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
  );

  if (isHistoryLoading) {
    return (
      <ActivityIndicator size="large" color="#D9B699" style={styles.loader} />
    );
  }

  if (!isHistoryLoading && history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
         <Text style={styles.emptyText}>{t('EMPTY_TEXT')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      renderItem={renderHistoryItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 70,
      }}
    />
  );
};

export default TarotHistoryList;

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
    backgroundColor: '#4A3F50',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 30,
    height: 30,
    borderRadius: 15, // circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
});
