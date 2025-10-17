import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import LinearGradient from 'react-native-linear-gradient';
import TarotHistoryList from './TarotHistoryList';
import AstrologyHistoryList from './AstrologyHistoryList';
import BuziosHistoryList from './BuziosHistoryList';
import DailyWisdomCardList from './DailyWisdomCardList';
import RitualTipHistoryList from './RitualTipHistoryList';

const tabs = [
  'Tarot',
  'Astrology',
  'Buzious',
  'Daily Wisdom Card',
  'Ritual Tip',
];

const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const [activeTab, setActiveTab] = useState('Tarot');

  const renderContent = () => {
    switch (activeTab) {
      case 'Tarot':
        return <TarotHistoryList />;
      case 'Astrology':
        return <AstrologyHistoryList />;
      case 'Buzious':
        return <BuziosHistoryList />;
      case 'Daily Wisdom Card':
        return <DailyWisdomCardList />;
      case 'Ritual Tip':
        return <RitualTipHistoryList />;
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
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
          <Text style={styles.headerTitle}>Library</Text>
        </View>

        <Text style={styles.subtitle}>
          All your favorite rituals, readings,{'\n'}and wisdom.
        </Text>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrapper}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {tabs.map(tab => {
            // FIX for TypeScript Error: Ensure colors are valid strings
            const gradientColors = [colors.black, colors.bgBox].filter(
              Boolean,
            ) as string[];

            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                {activeTab === tab ? (
                  // NEW, MORE STABLE APPROACH
                  <View style={styles.activeTabBtn}>
                    <LinearGradient
                      colors={
                        gradientColors.length >= 2
                          ? gradientColors
                          : ['#000', '#333'] // Fallback colors
                      }
                      style={StyleSheet.absoluteFill} // Fills the parent View
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                    />
                    <Text style={[styles.tabText, styles.activeTabText]}>
                      {tab}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.tabBtn}>
                    <Text style={styles.tabText}>{tab}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        <View style={styles.contentContainer}>{renderContent()}</View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 12,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    color: '#D9B699',
    lineHeight: 20,
  },
  tabsWrapper: { marginTop: 20, marginBottom: 10, flexGrow: 0 },
  tabBtn: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#4A3F50',
    marginRight: 10,
  },
  activeTabBtn: {
    // This View now controls the layout perfectly
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D9B699',
    overflow: 'hidden', // This makes sure the gradient respects the border radius
  },
  tabText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  activeTabText: {
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  contentContainer: { flex: 1 },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
});