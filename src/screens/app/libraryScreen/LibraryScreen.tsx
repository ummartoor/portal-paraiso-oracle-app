import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import GradientBox from '../../../components/GradientBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const tabs = ['All', 'Rituals', 'Tarot', 'Astrology', 'Cowrie'];

const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeTab, setActiveTab] = useState('All');

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
     
          <Text style={styles.headerTitle}>Library</Text>
        </View>

        {/* Subtitle */}
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
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                {isActive ? (
                  <GradientBox colors={[colors.black, colors.bgBox]} style={styles.activeTabBtn}>
                    <Text style={[styles.tabText, styles.activeTabText]}>{tab}</Text>
                  </GradientBox>
                ) : (
                  <View style={styles.tabBtn}>
                    <Text style={styles.tabText}>{tab}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Empty State */}
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>
            Your library is empty. Save rituals,{'\n'}readings, and insights here.
          </Text>
        </View>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <View style={styles.buttonBorder}>
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.mainButton}>
                <Text style={styles.buttonText}>Explore & Save Content</Text>
              </GradientBox>
            </View>
          </TouchableOpacity>
        </View>
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
  tabsWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#4A3F50',
    marginRight: 10,
  },
  activeTabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#D9B699',
  },
  tabText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    color: '#fff',
  },
  activeTabText: {
    fontWeight: '600',
  },
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  buttonBorder: {
    borderColor: '#D9B699',
    borderWidth: 1.2,
    borderRadius: 60,
    overflow: 'hidden',
  },
  mainButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
  },
});
