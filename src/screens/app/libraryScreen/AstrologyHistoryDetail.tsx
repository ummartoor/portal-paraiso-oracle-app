import React, { useMemo } from 'react';
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
  ImageSourcePropType,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { HoroscopeHistoryItem, HoroscopeData } from '../../../store/useAstologyStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- ZODIAC DATA ---
type ZodiacKey =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

type Zodiac = { key: ZodiacKey; name: string; icon: ImageSourcePropType };

const ZODIACS: Zodiac[] = [
  { key: "aries", name: "Aries", icon: require("../../../assets/icons/AriesIcon.png") },
  { key: "taurus", name: "Taurus", icon: require("../../../assets/icons/TaurusIcon.png") },
  { key: "gemini", name: "Gemini", icon: require("../../../assets/icons/GeminiIcon.png") },
  { key: "cancer", name: "Cancer", icon: require("../../../assets/icons/CancerIcon.png") },
  { key: "leo", name: "Leo", icon: require("../../../assets/icons/leoIcon.png") },
  { key: "virgo", name: "Virgo", icon: require("../../../assets/icons/VirgoIcon.png") },
  { key: "libra", name: "Libra", icon: require("../../../assets/icons/libraIcon.png") },
  { key: "scorpio", name: "Scorpio", icon: require("../../../assets/icons/ScorpioIcon.png") },
  { key: "sagittarius", name: "Sagittarius", icon: require("../../../assets/icons/SagittariusIcon.png")},
  { key: "capricorn", name: "Capricorn", icon: require("../../../assets/icons/CapricornIcon.png") },
  { key: "aquarius", name: "Aquarius", icon: require("../../../assets/icons/AquariusIcon.png") },
  { key: "pisces", name: "Pisces", icon: require("../../../assets/icons/PiscesIcon.png") },
];

const ZODIAC_ICON_BOX = 160;
const ZODIAC_ICON_INNER = 128;


// --- InsightTabs Component (as requested in the same file) ---

export type InsightTab = {
  key: string;
  title: string;
  icon: any;
  description: string;
};

type InsightTabsProps = {
  horoscopeData: HoroscopeData;
  style?: ViewStyle;
};

const DEFAULT_TABS: Omit<InsightTab, 'description'>[] = [
  { key: 'morning', title: 'Morning Vibe', icon: require('../../../assets/icons/morningVibeIcon.png') },
  { key: 'career', title: 'Career & Work', icon: require('../../../assets/icons/careerWorkIcon.png') },
  { key: 'love', title: 'Love & Relationships', icon: require('../../../assets/icons/loveRelationshipIcon.png') },
  { key: 'money', title: 'Money & Finances', icon: require('../../../assets/icons/moneyFinanceIcon.png') },
  { key: 'health', title: 'Health & Well-being', icon: require('../../../assets/icons/healthIcon.png') },
  { key: 'divine', title: 'Divine Guidance', icon: require('../../../assets/icons/divine.png') },
];

const InsightTabs: React.FC<InsightTabsProps> = ({ horoscopeData, style }) => {
  const colors = useThemeStore(s => s.theme.colors);
  const [active, setActive] = React.useState<number>(0);

  const tabs: InsightTab[] = useMemo(() => {
    if (!horoscopeData || !horoscopeData.data) return [];

    return DEFAULT_TABS.map(tab => {
        switch (tab.key) {
            case 'morning': return { ...tab, description: horoscopeData.data.morning_vibe };
            case 'career': return { ...tab, description: horoscopeData.data.career_and_work };
            case 'love': return { ...tab, description: horoscopeData.data.love_and_relationship };
            case 'money': return { ...tab, description: horoscopeData.data.money_and_finance };
            case 'health': return { ...tab, description: horoscopeData.data.health_and_wellbeing };
            case 'divine': return { ...tab, description: horoscopeData.data.divine_guidance };
            default: return { ...tab, description: '' };
        }
    });
  }, [horoscopeData]);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[active];

  return (
    <View style={[styles.card, style]}>
      <View style={styles.tabsRow}>
        {tabs.map((t, idx) => {
          const selected = idx === active;
          return (
            <TouchableOpacity key={t.key} activeOpacity={0.9} onPress={() => setActive(idx)} style={styles.tabTouchable}>
              {selected ? (
                <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.tabBox, { borderColor: colors.primary }]}>
                  <Image source={t.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </GradientBox>
              ) : (
                <View style={[styles.tabBox, { backgroundColor: colors.bgBox, borderColor: 'transparent' }]}>
                  <Image source={t.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.primary }]} numberOfLines={2}>
        {current.title}
      </Text>
      <Text style={[styles.sectionBody, { color: colors.white }]}>
        {current.description}
      </Text>
    </View>
  );
};


// --- Main History Detail Screen ---

const AstrologyHistoryDetail: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AstrologyHistoryDetail'>>();
  const { horoscopeItem } = route.params;

  // Find the zodiac details based on the sign from the history item
  const currentZodiac = useMemo(() => {
    return ZODIACS.find(z => z.key === horoscopeItem?.sign) || null;
  }, [horoscopeItem]);

  // Format the date for display
  const displayDate = useMemo(() => {
      if (!horoscopeItem?.date) return { day: '', dateNum: ''};
      const date = new Date(horoscopeItem.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = date.getDate();
      return { day, dateNum };
  }, [horoscopeItem]);

  // Prepare the data in the format expected by the InsightTabs component
  const horoscopeDataForTabs: HoroscopeData | null = useMemo(() => {
      if (!horoscopeItem) return null;
      // The InsightTabs component expects a `data` property, so we wrap the item.
      return { data: horoscopeItem, success: true, message: '' };
  }, [horoscopeItem]);

  // Loading/Error state if no data is passed through navigation
  if (!horoscopeItem || !currentZodiac || !horoscopeDataForTabs) {
    return (
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
      >
        <SafeAreaView style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.errorText}>Horoscope data not found.</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../assets/icons/backIcon.png')}
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.contentHeader}>
            <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
              Your celestial blueprint for the day
            </Text>
          </View>

          {/* Static Date Display */}
          <View style={styles.calendarOuter}>
            <View style={styles.singleCalItem}>
                <Text style={[styles.dayTop, { color: colors.white }]}>{displayDate.day}</Text>
                <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.calBox, { borderColor: colors.primary, padding:0}]}>
                  <Text style={[styles.dateText, { color: colors.white }]}>{String(displayDate.dateNum)}</Text>
                </GradientBox>
            </View>
          </View>

          {/* Static Zodiac Display */}
          <View style={styles.zodiacRow}>
             <View style={styles.zodiacCenter}>
                <View style={[styles.zodiacImageFrame, { borderColor: 'rgba(255,255,255,0.12)' }]}>
                  <Image source={currentZodiac.icon} style={styles.zodiacImage} resizeMode="contain" />
                </View>
                <Text style={[styles.zodiacName, { color: colors.white }]}>{currentZodiac.name}</Text>
              </View>
          </View>

          {/* Horoscope Data using InsightTabs */}
          <InsightTabs horoscopeData={horoscopeDataForTabs} />


          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={() => { /* Share logic here */ }}>
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
                <Image source={require('../../../assets/icons/shareIcon.png')} style={[styles.actionIcon, { tintColor: colors.white }]} resizeMode="contain" />
                <Text style={[styles.actionLabel, { color: colors.white }]}>Share</Text>
              </GradientBox>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: SCREEN_WIDTH },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: Platform.select({ ios: 0, android: 10 }) },
  header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  backBtn: { position: 'absolute', left: 0, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
  scrollContent: { paddingBottom: 36, alignItems: 'center' },
  contentHeader: { marginTop: 16, width: '100%', alignItems: 'center' },
  contentTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, letterSpacing: 0.5 },
  calendarOuter: { marginTop: 25, width: '100%', alignItems: 'center' },
  singleCalItem: { alignItems: 'center' },
  calBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dayTop: { fontFamily: Fonts.aeonikRegular, fontSize: 12, opacity: 0.85, marginBottom: 6 },
  dateText: { fontFamily: Fonts.cormorantSCBold, fontSize: 16 },
  zodiacRow: { marginTop: 28, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  zodiacCenter: { alignItems: 'center', justifyContent: 'center', minWidth: 120 },
  zodiacImageFrame: { width: ZODIAC_ICON_BOX, height: ZODIAC_ICON_BOX, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  zodiacImage: { width: ZODIAC_ICON_INNER, height: ZODIAC_ICON_INNER },
  zodiacName: { marginTop: 8, fontFamily: Fonts.cormorantSCBold, fontSize: 18, letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center' },
  actionsRow: { marginTop: 24, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 12 },
  actionTouchable: { flex: 0.5 },
  actionButton: { height: 57, borderRadius: 28.5, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  actionIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 8 },
  actionLabel: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
  errorText: { fontFamily: Fonts.aeonikRegular, fontSize: 16, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', marginTop: 10 },
  // InsightTabs styles
  card: { marginTop: 30, width: '100%' },
  tabsRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  tabTouchable: {},
  tabBox: { width: 47, height: 47, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tabIcon: { width: 22, height: 22 },
  sectionTitle: { marginTop: 16, marginBottom: 8, fontFamily: Fonts.cormorantSCBold, fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center' },
  sectionBody: { fontFamily: Fonts.aeonikRegular, fontSize: 14, lineHeight: 20, opacity: 0.95, textAlign: 'center' },
});

export default AstrologyHistoryDetail;
