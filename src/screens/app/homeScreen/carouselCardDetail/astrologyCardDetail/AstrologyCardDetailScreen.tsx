import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import InsightTabs from './InsightTabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AstrologyCardDetailScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        key: i,
        day: DAY_LABELS[d.getDay()],
        dateNum: d.getDate(),
        date: d,
      };
    });
  }, []);

  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView
        style={styles.container}
        edges={['top']}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={[styles.backIcon, { tintColor: colors.white }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              Astrology
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title & subtitle (centered) */}
          <View style={styles.contentHeader}>
            <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
              Unlock your celestial blueprint
            </Text>
            <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
              Explore who you are, what’s ahead, and how the stars shape your path.
            </Text>
          </View>

          {/* 7-day Calendar (day label on top, only date inside box) */}
          <View style={styles.calendarOuter}>
            <View style={styles.calendarWrap}>
              {days.map((item, idx) => {
                const isSelected = idx === selectedIdx;

                return (
                  <View key={item.key} style={styles.calItem}>
                    {/* Day label ABOVE the box */}
                    <Text style={[styles.dayTop, { color: colors.white }]}>{item.day}</Text>

                    {/* Date BOX */}
                    {isSelected ? (
                      <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedIdx(idx)}>
                        <GradientBox
                          colors={[colors.black, colors.bgBox]}
                          style={[styles.calBox, styles.calGradient, { borderColor: colors.primary }]}
                        >
                          <View style={styles.calContent}>
                            <Text style={[styles.dateText, { color: colors.white, opacity: 0.9 }]}>{item.dateNum}</Text>
                          </View>
                        </GradientBox>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedIdx(idx)}>
                        <View
                          style={[
                            styles.calBox,
                            { backgroundColor: colors.bgBox, borderColor: 'transparent' },
                          ]}
                        >
                          <Text style={[styles.dateText, { color: colors.white, opacity: 0.9 }]}>{item.dateNum}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Zodiac Navigation Row (visual only left/right) */}
          <View style={styles.zodiacRow}>
            <View style={styles.sideCol}>
              <TouchableOpacity activeOpacity={0.85} style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}>
                <Image
                  source={require('../../../../../assets/icons/backIcon.png')}
                  style={[styles.arrowIcon, { tintColor: colors.white }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>
                Virgo
              </Text>
            </View>

            <View style={styles.zodiacCenter}>
              <Image
                source={require('../../../../../assets/icons/libra.png')}
                style={styles.zodiacImage}
                resizeMode="contain"
              />
              <Text style={[styles.zodiacName, { color: colors.white }]}>Libra</Text>
            </View>

            <View style={[styles.sideCol, { alignItems: 'flex-end' }]}>
              <TouchableOpacity activeOpacity={0.85} style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}>
                <Image
                  source={require('../../../../../assets/icons/rightArrow.png')}
                  style={[styles.arrowIcon, { tintColor: colors.white }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>
                Scorpio
              </Text>
            </View>
          </View>

<InsightTabs/>
          {/* ===== Share / Save Buttons Row ===== */}
          <View style={styles.actionsRow}>
            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionTouchable}
              onPress={() => {
          
              }}
            >
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
                <Image
                  source={require('../../../../../assets/icons/shareIcon.png')}  // <-- replace if needed
                  style={[styles.actionIcon, { tintColor: colors.white }]}
                  resizeMode="contain"
                />
                <Text style={[styles.actionLabel, { color: colors.white }]}>Share</Text>
              </GradientBox>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionTouchable}
              onPress={() => {
                // TODO: save logic
              }}
            >
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
                <Image
                  source={require('../../../../../assets/icons/saveIcon.png')}   // <-- replace if needed
                  style={[styles.actionIcon, { tintColor: colors.white }]}
                  resizeMode="contain"
                />
                <Text style={[styles.actionLabel, { color: colors.white }]}>Save</Text>
              </GradientBox>
            </TouchableOpacity>
          </View>
          {/* ===== /Buttons Row ===== */}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default AstrologyCardDetailScreen;

/* ----------------- STYLES ----------------- */
const BOX_SIZE = 40;
const SPACING = 6; // spacing between calendar boxes
const CAL_WIDTH = BOX_SIZE * 7 + SPACING * 6;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
    backgroundColor: 'transparent',
  },

  /* Header */
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },

  /* Scroll content centered */
  scrollContent: {
    paddingBottom: 36,
    alignItems: 'center',
  },

  /* Content Headings (centered) */
  contentHeader: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  contentTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  contentSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },

  /* Calendar */
  calendarOuter: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calendarWrap: {
    width: CAL_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calItem: {
    alignItems: 'center',
  },
  calBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  calGradient: {
    padding: 0,
    overflow: 'hidden',
  },
  calContent: {
    width: '100%',
    height: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayTop: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 6,
  },
  dateText: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 16,
    letterSpacing: 0.3,
  },

  /* Zodiac row (centered) */
  zodiacRow: {
    marginTop: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },

  sideCol: {
    width: 80,
  },
  sideLabel: {
    marginTop: 8,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 16,
    opacity: 0.8,
  },

  arrowWrap: {
    width: 31,
    height: 31,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  arrowIcon: { width: 18, height: 18 },

  zodiacCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  zodiacImage: {
    width: 155,
    height: 155,
  },
  zodiacName: {
    marginTop: 8,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 18,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  /* Actions row (Share / Save) */
  actionsRow: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // if RN doesn't support, remove and add spacer View
  },
  actionTouchable: {
    flex: 1,
  },
  actionButton: {
    height: 57,
    borderRadius: 28.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionIcon: {
    width: 20,
    height:20,
    resizeMode:'contain',
    marginRight: 8,
  },
  actionLabel: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },
});
