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
import GradientBox from '../../../components/GradientBox';
import TarotHistoryList from './TarotHistoryList';
import AstrologyHistoryList from './AstrologyHistoryList';
import BuziosHistoryList from './BuziosHistoryList';

const tabs = ['Tarot', 'Astrology', 'Buzious'];

// Placeholder component for other tabs
const PlaceholderComponent = ({ title }: { title: string }) => (
  <View style={styles.emptyWrapper}>
    <Text style={styles.emptyText}>{title} history will be shown here.</Text>
  </View>
);

const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const [activeTab, setActiveTab] = useState('Tarot');

  const renderContent = () => {
    switch (activeTab) {
      case 'Tarot':
        return <TarotHistoryList />;
      case 'Astrology':
        return <AstrologyHistoryList/>;
      case 'Buzious':
        return <BuziosHistoryList/>;
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
          contentContainerStyle={{ paddingHorizontal: 16, }}
        >
          {tabs.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              {activeTab === tab ? (
                <GradientBox colors={[colors.black, colors.bgBox]} style={styles.activeTabBtn}>
                  <Text style={[styles.tabText, styles.activeTabText]}>{tab}</Text>
                </GradientBox>
              ) : (
                <View style={styles.tabBtn}>
                  <Text style={styles.tabText}>{tab}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 14 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: Fonts.cormorantSCBold, fontSize: 24, color: '#fff' },
  subtitle: { textAlign: 'center', marginTop: 12, fontFamily: Fonts.aeonikRegular, fontSize: 16, color: '#D9B699', lineHeight: 20 },
  tabsWrapper: { marginTop: 20, marginBottom: 10, flexGrow: 0 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#4A3F50', marginRight: 10 },
  activeTabBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginRight: 10, borderWidth: 1.5, borderColor: '#D9B699' },
  tabText: { fontFamily: Fonts.aeonikRegular, fontSize: 14, color: '#fff' },
  activeTabText: { fontWeight: '600' },
  contentContainer: { flex: 1 },
  emptyWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyText: { fontFamily: Fonts.aeonikRegular, fontSize: 15, color: '#fff', textAlign: 'center', opacity: 0.9, lineHeight: 22 },
});
