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

// Buzios store aur uski types import karein
import {
  useBuziosStore,
  BuziosHistoryItem,
} from '../../../store/useBuziousStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const BuziosHistoryList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors } = useThemeStore(s => s.theme);

  // Store se Buzios history functions aur state lein
  const { history, isLoadingHistory, getBuziosHistory } = useBuziosStore(
    useShallow((state) => ({
      history: state.history,
      isLoadingHistory: state.isLoadingHistory,
      getBuziosHistory: state.getBuziosHistory,
    }))
  );

  // Screen focus per history fetch karein
  useFocusEffect(
    React.useCallback(() => {
      getBuziosHistory();
    }, [getBuziosHistory])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderHistoryItem = ({ item }: { item: BuziosHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyCard}
      activeOpacity={0.7}
      onPress={() => {
    
        navigation.navigate('BuziosHistoryDetail', { history_uid: item._id});
      }}
    >

      <Image
        source={require('../../../assets/images/Caris.png')} // Make sure you have an image here
        style={styles.cardIcon}
      />
      <View style={styles.cardTextContainer}>
        {/* Static title */}
        <Text style={styles.cardTitle}>Buzious</Text>
  
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.user_question}
        </Text>
      </View>
      <View style={styles.cardRightContainer}>
        <Text style={styles.cardDate}>{formatDate(item.reading_date)}</Text>

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

  if (isLoadingHistory) {
    return (
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    );
  }

  if (!isLoadingHistory && (!history || history.length === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no saved readings yet.</Text>
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

export default BuziosHistoryList;

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
  cardIcon: { width: 50, height: 50, marginRight: 12, borderRadius: 10 },
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
