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
import { useThemeStore } from '../../../store/useThemeStore';

import {
  useAstrologyStore,
  HoroscopeHistoryItem, 
} from '../../../store/useAstologyStore'; 

const AstrologyHistoryList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useThemeStore(s => s.theme);

  // Getting state and actions from useAstrologyStore
  const { horoscopeHistory, isHistoryLoading, getHoroscopeHistory } = useAstrologyStore(
    useShallow((state) => ({
      horoscopeHistory: state.horoscopeHistory,
      isHistoryLoading: state.isHistoryLoading,
      getHoroscopeHistory: state.getHoroscopeHistory,
    }))
  );

  // Fetch history when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      getHoroscopeHistory();
    }, [getHoroscopeHistory])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderHistoryItem = ({ item }: { item: HoroscopeHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyCard}
      activeOpacity={0.7}
      onPress={() => {
  
        navigation.navigate('AstrologyHistoryDetail', { horoscopeItem: item });
      }}
    >
      <Image
        // Changed icon to represent Astrology
        source={require('../../../assets/images/astrology.png')}
        style={styles.cardIcon}
      />
      <View style={styles.cardTextContainer}>
        {/* Changed title to ASTROLOGY */}
        <Text style={styles.cardTitle}>ASTROLOGY</Text>
        {/* Changed subtitle to display the dynamic user_question */}
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.user_question}
        </Text>
      </View>
      <View style={styles.cardRightContainer}>
        {/* Formatting the dynamic date from the item */}
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
  );

  if (isHistoryLoading) {
    return (
      <ActivityIndicator size="large" color="#D9B699" style={styles.loader} />
    );
  }

  // Handle case where history might be null initially or empty
  if (!isHistoryLoading && (!horoscopeHistory || horoscopeHistory.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no saved horoscopes yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={horoscopeHistory}
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
