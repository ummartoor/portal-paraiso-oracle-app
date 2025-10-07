import React, { useMemo, useState, useEffect } from 'react';
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
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAstrologyStore } from '../../../../../store/useAstologyStore';
import { useAuthStore } from '../../../../../store/useAuthStore';
import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import InsightTabs from './InsightTabs';
import { useTranslation } from 'react-i18next';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type ZodiacKey =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

type Zodiac = { key: ZodiacKey; name: string; icon: ImageSourcePropType };




const ZODIAC_ICON_BOX = 160;
const ZODIAC_ICON_INNER = 128;

const AstrologyCardDetailScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const route = useRoute<RouteProp<AppStackParamList, 'AstrologyCardDetail'>>();
  const { userQuestion } = route.params;
  const { t } = useTranslation();
  const { user, fetchCurrentUser } = useAuthStore();
  const { horoscope, isLoading, createHoroscope, saveHoroscope, isSaving } =
    useAstrologyStore();

      const ZODIACS: Zodiac[] = [
    { key: "aries", name: t('zodiac_aries'), icon: require('../../../../../assets/icons/AriesIcon.png') },
    { key: "taurus", name: t('zodiac_taurus'), icon: require('../../../../../assets/icons/TaurusIcon.png') },
    { key: "gemini", name: t('zodiac_gemini'), icon: require('../../../../../assets/icons/GeminiIcon.png') },
    { key: "cancer", name: t('zodiac_cancer'), icon: require('../../../../../assets/icons/CancerIcon.png') },
    { key: "leo", name: t('zodiac_leo'), icon: require('../../../../../assets/icons/leoIcon.png') },
    { key: "virgo", name: t('zodiac_virgo'), icon: require('../../../../../assets/icons/VirgoIcon.png') },
    { key: "libra", name: t('zodiac_libra'), icon: require('../../../../../assets/icons/libraIcon.png') },
    { key: "scorpio", name: t('zodiac_scorpio'), icon: require('../../../../../assets/icons/ScorpioIcon.png') },
    { key: "sagittarius", name: t('zodiac_sagittarius'), icon: require('../../../../../assets/icons/SagittariusIcon.png') },
    { key: "capricorn", name: t('zodiac_capricorn'), icon: require('../../../../../assets/icons/CapricornIcon.png') },
    { key: "aquarius", name: t('zodiac_aquarius'), icon: require('../../../../../assets/icons/AquariusIcon.png') },
    { key: "pisces", name: t('zodiac_pisces'), icon: require('../../../../../assets/icons/PiscesIcon.png') },
  ];
const wrapIndex = (i: number) => (i + ZODIACS.length) % ZODIACS.length;
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
  const [zIndex, setZIndex] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user?.sign_in_zodiac) {
      const userSignIndex = ZODIACS.findIndex(
        z => z.key === user.sign_in_zodiac,
      );
      if (userSignIndex !== -1) {
        setZIndex(userSignIndex);
      }
    }
  }, [user]);

  useEffect(() => {
    const selectedSign = ZODIACS[zIndex]?.key;
    const selectedDate = days[selectedIdx]?.date;
    if (selectedSign && selectedDate && userQuestion) {
      const dateISO = selectedDate.toISOString();
      createHoroscope(selectedSign, dateISO, userQuestion);
    }
  }, [zIndex, selectedIdx, createHoroscope, userQuestion]);

  const current = ZODIACS[zIndex];
  const prevZ = ZODIACS[wrapIndex(zIndex - 1)];
  const nextZ = ZODIACS[wrapIndex(zIndex + 1)];

  const goPrev = () => setZIndex(i => wrapIndex(i - 1));
  const goNext = () => setZIndex(i => wrapIndex(i + 1));

  const handleSave = async () => {
       Vibration.vibrate([0, 35, 40, 35]); 
    if (!horoscope || isSaving || !userQuestion) return;

    const selectedSign = ZODIACS[zIndex]?.key;
    const selectedDate = days[selectedIdx]?.date;

    if (selectedSign && selectedDate) {
      const dateISO = selectedDate.toISOString();

   
      await saveHoroscope(selectedSign, dateISO, horoscope, userQuestion);
      navigation.navigate('MainTabs');
    }
  };
  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={[styles.backIcon, { tintColor: colors.white }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap} pointerEvents="none">
           <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              {t('astrology_screen_header')}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.contentHeader}>
         <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
              {t('astrology_unlock_title')}
            </Text>
          <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
              {t('astrology_explore_subtitle')}
            </Text>
          </View>

          {/* Calendar */}
          <View style={styles.calendarOuter}>
            <View style={styles.calendarWrap}>
              {days.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.9}
                    onPress={() => setSelectedIdx(idx)}
                    style={styles.calItem}
                  >
                    <Text style={[styles.dayTop, { color: colors.white }]}>
                      {item.day ?? ''}
                    </Text>
                    {isSelected ? (
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={[
                          styles.calBox,
                          { borderColor: colors.primary, padding: 0 },
                        ]}
                      >
                        <Text
                          style={[styles.dateText, { color: colors.white }]}
                        >
                          {String(item.dateNum ?? '')}
                        </Text>
                      </GradientBox>
                    ) : (
                      <View
                        style={[
                          styles.calBox,
                          {
                            backgroundColor: colors.bgBox,
                            borderColor: 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[styles.dateText, { color: colors.white }]}
                        >
                          {String(item.dateNum ?? '')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Zodiac Navigation */}
          <View style={styles.zodiacRow}>
            <View style={styles.sideCol}>
              {/* <TouchableOpacity activeOpacity={0.85} style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}
              //  onPress={goPrev}
               >
                <Image source={require('../../../../../assets/icons/backIcon.png')} style={[styles.arrowIcon, { tintColor: colors.white }]} resizeMode="contain" />
              </TouchableOpacity> */}
              {/* <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>{prevZ?.name ?? ''}</Text> */}
            </View>
            <View style={styles.zodiacCenter}>
              <View
                style={[
                  styles.zodiacImageFrame,
                  { borderColor: 'rgba(255,255,255,0.12)' },
                ]}
              >
                <Image
                  source={current?.icon}
                  style={styles.zodiacImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.zodiacName, { color: colors.white }]}>
                {current?.name ?? ''}
              </Text>
            </View>
            <View style={[styles.sideCol, { alignItems: 'flex-end' }]}>
              {/* <TouchableOpacity activeOpacity={0.85} style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}
              //  onPress={goNext}
               >
                <Image source={require('../../../../../assets/icons/rightArrow.png')} style={[styles.arrowIcon, { tintColor: colors.white }]} resizeMode="contain" />
              </TouchableOpacity> */}
              {/* <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>{nextZ?.name ?? ''}</Text> */}
            </View>
          </View>

          {/* Horoscope Data */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 30 }}
            />
          ) : horoscope ? (
            <InsightTabs horoscopeData={horoscope} />
          ) : (
            <View style={styles.errorContainer}>
             <Text style={styles.errorText}>{t('astrology_horoscope_not_available')}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionTouchable}
              onPress={() => {}}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.actionButton}
              >
                <Image
                  source={require('../../../../../assets/icons/shareIcon.png')}
                  style={[styles.actionIcon, { tintColor: colors.white }]}
                  resizeMode="contain"
                />
               <Text style={[styles.actionLabel, { color: colors.white }]}>{t('share_button')}</Text>
              </GradientBox>
            </TouchableOpacity>
            {/* <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={() => {}}>
              <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
                <Image source={require('../../../../../assets/icons/saveIcon.png')} style={[styles.actionIcon, { tintColor: colors.white }]} resizeMode="contain" />
                <Text style={[styles.actionLabel, { color: colors.white }]}>Save</Text>
              </GradientBox>
              
            </TouchableOpacity> */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionTouchable}
              onPress={handleSave}
              disabled={isSaving}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.actionButton}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <>
                    <Image
                      source={require('../../../../../assets/icons/saveIcon.png')}
                      style={[styles.actionIcon, { tintColor: colors.white }]}
                      resizeMode="contain"
                    />
                           <Text style={[styles.actionLabel, { color: colors.white }]}>{t('save_button')}</Text>
                  </>
                )}
              </GradientBox>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const BOX_SIZE = 40;
const SPACING = 6;
const CAL_WIDTH = BOX_SIZE * 7 + SPACING * 6;

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: SCREEN_WIDTH },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },
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
  headerTitleWrap: {
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  scrollContent: { paddingBottom: 36, alignItems: 'center' },
  contentHeader: { marginTop: 16, width: '100%', alignItems: 'center' },
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
  calendarOuter: { marginTop: 25, width: '100%', alignItems: 'center' },
  calendarWrap: {
    width: CAL_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calItem: { alignItems: 'center' },
  calBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayTop: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 6,
  },
  dateText: { fontFamily: Fonts.cormorantSCBold, fontSize: 16 },
  zodiacRow: {
    marginTop: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideCol: { width: 80 },
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
  zodiacImageFrame: {
    width: ZODIAC_ICON_BOX,
    height: ZODIAC_ICON_BOX,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacImage: { width: ZODIAC_ICON_INNER, height: ZODIAC_ICON_INNER },
  zodiacName: {
    marginTop: 8,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 18,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  actionsRow: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionTouchable: { flex: 1 },
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
  actionIcon: { width: 20, height: 20, resizeMode: 'contain', marginRight: 8 },
  actionLabel: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
  errorContainer: {
    marginTop: 30,
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default AstrologyCardDetailScreen;



// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   Image,
//   Platform,
//   ScrollView,
//   ImageSourcePropType,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useAstrologyStore } from '../../../../../store/useAstologyStore';
// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../../navigation/routeTypes';
// import InsightTabs from './InsightTabs';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// /* ---------- Zodiac Data (update icon paths if needed) ---------- */
// type ZodiacKey =
//   | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
//   | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// type Zodiac = { key: ZodiacKey; name: string; icon: ImageSourcePropType };

// const ZODIACS: Zodiac[] = [
//   { key: 'aries',       name: 'Aries',       icon: require('../../../../../assets/icons/aries.png') },
//   { key: 'taurus',      name: 'Taurus',      icon: require('../../../../../assets/icons/taurus.png') },
//   { key: 'gemini',      name: 'Gemini',      icon: require('../../../../../assets/icons/gemini.png') },
//   { key: 'cancer',      name: 'Cancer',      icon: require('../../../../../assets/icons/cancer.png') },
//   { key: 'leo',         name: 'Leo',         icon: require('../../../../../assets/icons/leo.png') },
//   { key: 'virgo',       name: 'Virgo',       icon: require('../../../../../assets/icons/virgo.png') },
//   { key: 'libra',       name: 'Libra',       icon: require('../../../../../assets/icons/libra.png') },
//   { key: 'scorpio',     name: 'Scorpio',     icon: require('../../../../../assets/icons/scorpio.png') },
//   { key: 'sagittarius', name: 'Sagittarius', icon: require('../../../../../assets/icons/sagittarius.png') },
//   { key: 'capricorn',   name: 'Capricorn',   icon: require('../../../../../assets/icons/capricorn.png') },
//   { key: 'aquarius',    name: 'Aquarius',    icon: require('../../../../../assets/icons/aquarius.png') },
//   { key: 'pisces',      name: 'Pisces',      icon: require('../../../../../assets/icons/pisces.png') },
// ];

// const wrapIndex = (i: number) => (i + ZODIACS.length) % ZODIACS.length;

// /** 🔧 Consistent icon sizes */
// const ZODIAC_ICON_BOX = 160; // square frame for all icons
// const ZODIAC_ICON_INNER = 128; // actual image max size inside the frame

// const AstrologyCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   /* ---- 7-Day calendar ---- */
//   const days = useMemo(() => {
//     const today = new Date();
//     return Array.from({ length: 7 }).map((_, i) => {
//       const d = new Date(today);
//       d.setDate(today.getDate() + i);
//       return {
//         key: i,
//         day: DAY_LABELS[d.getDay()],
//         dateNum: d.getDate(),
//         date: d,
//       };
//     });
//   }, []);
//   const [selectedIdx, setSelectedIdx] = useState(0);

//   /* ---- Zodiac selector state (dynamic) ---- */
//   const initialIndex = ZODIACS.findIndex(z => z.key === 'libra');
//   const [zIndex, setZIndex] = useState(initialIndex === -1 ? 0 : initialIndex);

//   const current = ZODIACS[zIndex];
//   const prevZ = ZODIACS[wrapIndex(zIndex - 1)];
//   const nextZ = ZODIACS[wrapIndex(zIndex + 1)];

//   const goPrev = () => setZIndex(i => wrapIndex(i - 1));
//   const goNext = () => setZIndex(i => wrapIndex(i + 1));
//   const goTo = (i: number) => setZIndex(wrapIndex(i));

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       imageStyle={{ resizeMode: 'cover' }}
//     >
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={[styles.backIcon, { tintColor: colors.white }]}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//               Astrology
//             </Text>
//           </View>
//         </View>

//         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//           {/* Title & subtitle (centered) */}
//           <View style={styles.contentHeader}>
//             <Text style={[styles.contentTitle, { color: colors.primary, textAlign: 'center' }]}>
//               Unlock your celestial blueprint
//             </Text>
//             <Text style={[styles.contentSubtitle, { color: colors.white, textAlign: 'center' }]}>
//               Explore who you are, what’s ahead, and how the stars shape your path.
//             </Text>
//           </View>

//           {/* 7-day Calendar */}
//           <View style={styles.calendarOuter}>
//             <View style={styles.calendarWrap}>
//               {days.map((item, idx) => {
//                 const isSelected = idx === selectedIdx;
//                 return (
//                   <View key={item.key} style={styles.calItem}>
//                     <Text style={[styles.dayTop, { color: colors.white }]}>{item.day}</Text>

//                     {isSelected ? (
//                       <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedIdx(idx)}>
//                         <GradientBox
//                           colors={[colors.black, colors.bgBox]}
//                           style={[styles.calBox, styles.calGradient, { borderColor: colors.primary }]}
//                         >
//                           <View style={styles.calContent}>
//                             <Text style={[styles.dateText, { color: colors.white, opacity: 0.9 }]}>{item.dateNum}</Text>
//                           </View>
//                         </GradientBox>
//                       </TouchableOpacity>
//                     ) : (
//                       <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedIdx(idx)}>
//                         <View
//                           style={[
//                             styles.calBox,
//                             { backgroundColor: colors.bgBox, borderColor: 'transparent' },
//                           ]}
//                         >
//                           <Text style={[styles.dateText, { color: colors.white, opacity: 0.9 }]}>{item.dateNum}</Text>
//                         </View>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 );
//               })}
//             </View>
//           </View>

//           {/* ===== Dynamic Zodiac Navigation ===== */}
//           <View style={styles.zodiacRow}>
//             {/* Left side (Prev) */}
//             <View style={styles.sideCol}>
//               <TouchableOpacity
//                 activeOpacity={0.85}
//                 style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}
//                 onPress={goPrev}
//               >
//                 <Image
//                   source={require('../../../../../assets/icons/backIcon.png')}
//                   style={[styles.arrowIcon, { tintColor: colors.white }]}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//               <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>
//                 {prevZ.name}
//               </Text>
//             </View>

//             {/* Center current (Framed for consistent sizing) */}
//             <View style={styles.zodiacCenter}>
//               <View
//                 style={[
//                   styles.zodiacImageFrame,
//                   { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.12)' },
//                 ]}
//               >
//                 <Image
//                   source={current.icon}
//                   style={styles.zodiacImage}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={[styles.zodiacName, { color: colors.white }]}>{current.name}</Text>
//             </View>

//             {/* Right side (Next) */}
//             <View style={[styles.sideCol, { alignItems: 'flex-end' }]}>
//               <TouchableOpacity
//                 activeOpacity={0.85}
//                 style={[styles.arrowWrap, { borderColor: colors.primary, backgroundColor: colors?.bgBox }]}
//                 onPress={goNext}
//               >
//                 <Image
//                   source={require('../../../../../assets/icons/rightArrow.png')}
//                   style={[styles.arrowIcon, { tintColor: colors.white }]}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//               <Text style={[styles.sideLabel, { color: colors.white }]} numberOfLines={1}>
//                 {nextZ.name}
//               </Text>
//             </View>
//           </View>

//           <InsightTabs />

//           {/* ===== Share / Save Buttons Row ===== */}
//           <View style={styles.actionsRow}>
//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={() => {}}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
//                 <Image
//                   source={require('../../../../../assets/icons/shareIcon.png')}
//                   style={[styles.actionIcon, { tintColor: colors.white }]}
//                   resizeMode="contain"
//                 />
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>Share</Text>
//               </GradientBox>
//             </TouchableOpacity>

//             <TouchableOpacity activeOpacity={0.7} style={styles.actionTouchable} onPress={() => {}}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.actionButton}>
//                 <Image
//                   source={require('../../../../../assets/icons/saveIcon.png')}
//                   style={[styles.actionIcon, { tintColor: colors.white }]}
//                   resizeMode="contain"
//                 />
//                 <Text style={[styles.actionLabel, { color: colors.white }]}>{t('astrology_save')}</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           </View>
//           {/* ===== /Buttons Row ===== */}
//         </ScrollView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default AstrologyCardDetailScreen;

// /* ----------------- STYLES ----------------- */
// const BOX_SIZE = 40;
// const SPACING = 6;
// const CAL_WIDTH = BOX_SIZE * 7 + SPACING * 6;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//     width: SCREEN_WIDTH,
//     backgroundColor: 'transparent',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//     backgroundColor: 'transparent',
//   },

//   /* Header */
//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { width: 22, height: 22 },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },

//   /* Scroll content centered */
//   scrollContent: {
//     paddingBottom: 36,
//     alignItems: 'center',
//   },

//   contentHeader: {
//     marginTop: 16,
//     width: '100%',
//     alignItems: 'center',
//   },
//   contentTitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     letterSpacing: 0.5,
//   },
//   contentSubtitle: {
//     marginTop: 6,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     opacity: 0.9,
//   },

//   /* Calendar */
//   calendarOuter: {
//     marginTop: 25,
//     width: '100%',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   calendarWrap: {
//     width: CAL_WIDTH,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   calItem: {
//     alignItems: 'center',
//   },
//   calBox: {
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   calGradient: {
//     padding: 0,
//     overflow: 'hidden',
//   },
//   calContent: {
//     width: '100%',
//     height: '100%',
//     paddingVertical: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 8,
//   },
//   dayTop: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 12,
//     opacity: 0.85,
//     marginBottom: 6,
//   },
//   dateText: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 16,
//     letterSpacing: 0.3,
//   },

//   /* Zodiac row (centered) */
//   zodiacRow: {
//     marginTop: 28,
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: 'transparent',
//   },

//   sideCol: {
//     width: 80,
//   },
//   sideLabel: {
//     marginTop: 8,
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 16,
//     opacity: 0.8,
//   },

//   arrowWrap: {
//     width: 31,
//     height: 31,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   arrowIcon: { width: 18, height: 18 },

//   zodiacCenter: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     minWidth: 120,
//   },

//   zodiacImageFrame: {
//     width: ZODIAC_ICON_BOX,
//     height: ZODIAC_ICON_BOX,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // borderWidth: 1,
//     padding: (ZODIAC_ICON_BOX - ZODIAC_ICON_INNER) / 2,
//   },

//   zodiacImage: {
//     width: ZODIAC_ICON_INNER,
//     height: ZODIAC_ICON_INNER,
//   },

//   zodiacName: {
//     marginTop: 8,
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 18,
//     letterSpacing: 0.8,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//   },

//   /* Mini icons strip */
//   strip: {
//     marginTop: 10,
//     width: '100%',
//   },
//   stripContent: {
//     paddingHorizontal: 10,
//     alignItems: 'center',
//   },
//   stripItem: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     marginHorizontal: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   stripIcon: {
//     width: 22,
//     height: 22,
//   },

//   /* Actions row (Share / Save) */
//   actionsRow: {
//     marginTop: 24,
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   actionTouchable: {
//     flex: 1,
//   },
//   actionButton: {
//     height: 57,
//     borderRadius: 28.5,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.18)',
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 2,
//   },
//   actionIcon: {
//     width: 20,
//     height: 20,
//     resizeMode: 'contain',
//     marginRight: 8,
//   },
//   actionLabel: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//   },
// });
