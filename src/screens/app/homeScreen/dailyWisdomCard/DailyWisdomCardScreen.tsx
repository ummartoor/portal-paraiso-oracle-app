import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Image,
  ScrollView,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import SoundPlayer from 'react-native-sound-player'; // 1. Import SoundPlayer

import { useDailyWisdomStore } from '../../../../store/useDailyWisdomStore';
import { useOpenAiStore } from '../../../../store/useOpenAiStore'; // 2. Import OpenAI Store
import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';
import GradientBox from '../../../../components/GradientBox';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

// --- Import Icons ---
const BackIcon = require('../../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../../assets/icons/pauseIcon.png');
const ShareIcon = require('../../../../assets/icons/shareIcon.png');
const SaveIcon = require('../../../../assets/icons/saveIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const cardBackImage = require('../../../../assets/images/deskCard.png');

const DailyWisdomCardScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();

  // --- API State from Zustand Stores ---
  const {
    wisdomCard,
    isLoading: isCardLoading,
    getDailyWisdomCard,
    markCardAsUsed,
  } = useDailyWisdomStore();
  const {
    isLoading: isAudioLoading,
    generateAndPlaySpeech,
    preloadSpeech,
  } = useOpenAiStore();

  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState<string | null>(null);

  useEffect(() => {
    getDailyWisdomCard();
  }, []);

  // --- Preload audio when wisdom card data is available ---
  useEffect(() => {
    if (wisdomCard) {
      if (wisdomCard.is_used) {
        setIsRevealed(true); // If already used, show revealed state immediately
      }
      // Preload the speech in the background
      preloadSpeech(wisdomCard.reading, wisdomCard.card.card_uid).then(path => {
        setAudioFilePath(path); // Save the local file path
      });
    }
  }, [wisdomCard]);

  // --- Sound Player Setup ---
  useEffect(() => {
    const onFinishedPlaying = SoundPlayer.addEventListener(
      'FinishedPlaying',
      () => {
        setIsPlaying(false);
      },
    );
    return () => {
      onFinishedPlaying.remove();
      SoundPlayer.stop();
    };
  }, []);

  // --- Play/Stop Handler ---
  const onPressPlayToggle = async () => {
    if (isPlaying) {
      SoundPlayer.stop();
      setIsPlaying(false);
    } else {
      if (audioFilePath) {
        SoundPlayer.playUrl(`file://${audioFilePath}`);
        setIsPlaying(true);
      } else if (wisdomCard?.reading) {
        // Fallback if preloading isn't finished
        setIsPlaying(true);
        const success = await generateAndPlaySpeech(wisdomCard.reading);
        if (!success) setIsPlaying(false);
      }
    }
  };

  const handleRevealCard = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    if (wisdomCard && !wisdomCard.is_used) {
      markCardAsUsed();
    }
    setIsRevealed(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Image
          source={BackIcon}
          style={[styles.backIcon, { tintColor: colors.white }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap}>
        <Text
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.white }]}
        >
          {t('daily_wisdom_header')}
        </Text>
      </View>
    </View>
  );

  if (isCardLoading) {
    return (
      <ImageBackground
        source={require('../../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
      >
        <SafeAreaView style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isRevealed ? (
            // --- PHASE 2: REVEALED CARD ---
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: colors.primary }]}>
                {wisdomCard?.card.card_name}
              </Text>
              <View style={styles.cardFrame}>
                {wisdomCard?.card.card_image.url && (
                  <Image
                    source={{ uri: wisdomCard.card.card_image.url }}
                    style={styles.cardImage}
                  />
                )}
              </View>

              <TouchableOpacity
                onPress={onPressPlayToggle}
                style={styles.playButton}
                disabled={isAudioLoading && !audioFilePath}
              >
                {isAudioLoading && !audioFilePath ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Image
                    source={isPlaying ? PauseIcon : PlayIcon}
                    style={styles.playIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>

              <Text style={[styles.description, { color: colors.white }]}>
                {wisdomCard?.reading}
              </Text>

              <View style={styles.shareRow}>
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.smallBtn}
                >
                  <Image source={ShareIcon} style={styles.smallIcon} />
                  <Text style={styles.smallBtnText}>
                    {t('daily_wisdom_share')}
                  </Text>
                </GradientBox>
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.smallBtn}
                >
                  <Image source={SaveIcon} style={styles.smallIcon} />
                  <Text style={styles.smallBtnText}>
                    {t('daily_wisdom_save')}
                  </Text>
                </GradientBox>
              </View>

              {/* <TouchableOpacity
                onPress={() => setShowSubscriptionModal(true)}
                style={{ marginTop: 30 }}
              >
                <View style={styles.buttonBorder}>
                  <GradientBox
                    colors={[colors.black, colors.bgBox]}
                    style={styles.mainButton}
                  >
                    <Text style={styles.buttonText}>
                      {t('daily_wisdom_premium_button')}
                    </Text>
                  </GradientBox>
                </View>
              </TouchableOpacity> */}
            </View>
          ) : (
            // --- PHASE 1: INITIAL STATE ---
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: colors.primary }]}>
                {t('daily_wisdom_guidance_title')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.white }]}>
                {t('daily_wisdom_guidance_subtitle')}
              </Text>
              <Image source={cardBackImage} style={styles.cardImage} />
            </View>
          )}
        </ScrollView>

        {/* --- FOOTER BUTTON --- */}
        {!isRevealed && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleRevealCard} disabled={!wisdomCard}>
              <View style={styles.buttonBorder}>
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.mainButton}
                >
                  <Text style={styles.buttonText}>
                    {t('daily_wisdom_reveal_button')}
                  </Text>
                </GradientBox>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <SubscriptionPlanModal
          isVisible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onConfirm={() => setShowSubscriptionModal(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DailyWisdomCardScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  contentWrapper: { width: '100%', alignItems: 'center', marginTop: 20 },
  title: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
  subtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 20,
  },
  cardImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65 * 1.7,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  cardFrame: {},
  playButton: {
    marginVertical: 20,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { width: 35, height: 35 },
  description: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    opacity: 0.9,
  },
  shareRow: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  smallBtn: {
    minWidth: 120,
    height: 46,
    borderRadius: 23,

    borderWidth: 0.7,
    borderColor: '#D9B699',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  smallBtnText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    color: '#fff',
  },
  footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  buttonBorder: {
    borderColor: '#D9B699',
    borderWidth: 1.5,
    borderRadius: 60,
    overflow: 'hidden',
  },
  mainButton: {
    height: 52,
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 20,
  
  },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.aeonikRegular },
});

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Tts from 'react-native-tts';
// import SoundPlayer from 'react-native-sound-player';
// import { useDailyWisdomStore } from '../../../../store/useDailyWisdomStore';
// import { useOpenAiStore } from '../../../../store/useOpenAiStore';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';
// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';
// import { useTranslation } from 'react-i18next';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// // Static image for the back of the card
// const cardBackImage = require('../../../../assets/images/deskCard.png');

// const DailyWisdomCardScreen: React.FC = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { t } = useTranslation();

//   // --- API State from Zustand Store ---
//   const { wisdomCard, isLoading, getDailyWisdomCard, markCardAsUsed } =
//     useDailyWisdomStore();

//   const [isRevealed, setIsRevealed] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

//   // --- Fetch Card on Screen Load ---
//   useEffect(() => {
//     getDailyWisdomCard();
//   }, []);

//   // --- TTS (Text-to-Speech) Setup ---
//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//     Tts.setDefaultRate(0.45, true);
//     const subs = [
//       Tts.addEventListener('tts-start', () => setIsSpeaking(true)),
//       Tts.addEventListener('tts-finish', () => setIsSpeaking(false)),
//       Tts.addEventListener('tts-cancel', () => setIsSpeaking(false)),
//     ];
//     return () => {
//       subs.forEach(sub => (sub as any)?.remove?.());
//       Tts.stop();
//     };
//   }, []);

//   // --- TTS Play/Stop Handler ---
//   const onPressPlayToggle = async () => {
//     if (!wisdomCard?.reading) return;

//     if (isSpeaking) {
//       await Tts.stop();
//     } else {
//       await Tts.stop();
//       Tts.speak(wisdomCard.reading);
//     }
//   };

//   // --- Reveal Card Handler (Calls mark-used API) ---
//   const handleRevealCard = () => {
//     // Only mark as used if the card exists and is not already used
//            Vibration.vibrate([0, 35, 40, 35]);
//     if (wisdomCard && !wisdomCard.is_used) {
//       markCardAsUsed();
//     }
//     setIsRevealed(true);
//   };

//   // --- RENDER FUNCTIONS ---

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={styles.backBtn}
//       >
//         <Image
//           source={require('../../../../assets/icons/backIcon.png')}
//           style={[styles.backIcon, { tintColor: colors.white }]}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//       <View style={styles.headerTitleWrap} pointerEvents="none">
//         <Text
//           ellipsizeMode="tail"
//           style={[styles.headerTitle, { color: colors.white }]}
//         >
//           {t('daily_wisdom_header')}
//         </Text>
//       </View>
//     </View>
//   );

//   // Full screen loader while fetching the card initially
//   if (isLoading) {
//     return (
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={styles.bgImage}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={[styles.container, styles.centered]}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </SafeAreaView>
//       </ImageBackground>
//     );
//   }

//   return (
//     <ImageBackground
//       source={require('../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           translucent
//           backgroundColor="transparent"
//         />
//         {renderHeader()}

//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {isRevealed || wisdomCard?.is_used ? (
//             // --- PHASE 2: REVEALED CARD (Dynamic Data) ---
//             <View style={styles.contentWrapper}>
//               <Text style={[styles.title, { color: colors.primary }]}>
//                 {wisdomCard?.card.card_name}
//               </Text>
//               <View style={styles.cardFrame}>
//                 {wisdomCard?.card.card_image.url && (
//                   <Image
//                     source={{ uri: wisdomCard.card.card_image.url }}
//                     style={styles.cardImage}
//                   />
//                 )}
//               </View>

//               <TouchableOpacity
//                 onPress={onPressPlayToggle}
//                 style={styles.playButton}
//               >
//                 <Image
//                   source={
//                     isSpeaking
//                       ? require('../../../../assets/icons/pauseIcon.png')
//                       : require('../../../../assets/icons/playIcon.png')
//                   }
//                   style={styles.playIcon}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>

//               <Text style={[styles.description, { color: colors.white }]}>
//                 {wisdomCard?.reading}
//               </Text>

//               <View style={styles.shareRow}>
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.smallBtn}
//                 >
//                   <Image
//                     source={require('../../../../assets/icons/shareIcon.png')}
//                     style={styles.smallIcon}
//                   />
//                   <Text style={styles.smallBtnText}>{t('daily_wisdom_share')}</Text>
//                 </GradientBox>
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.smallBtn}
//                 >
//                   <Image
//                     source={require('../../../../assets/icons/saveIcon.png')}
//                     style={styles.smallIcon}
//                   />
//                   <Text style={styles.smallBtnText}>{t('daily_wisdom_save')}</Text>
//                 </GradientBox>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowSubscriptionModal(true)}
//                 style={{ marginTop: 30 }}
//               >
//                 <View style={styles.buttonBorder}>
//                   <GradientBox
//                     colors={[colors.black, colors.bgBox]}
//                     style={styles.mainButton}
//                   >
//                     <Text style={styles.buttonText}>
//                       {t('daily_wisdom_premium_button')}
//                     </Text>
//                   </GradientBox>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             // --- PHASE 1: INITIAL STATE (Static Image) ---
//             <View style={styles.contentWrapper}>
//               <Text style={[styles.title, { color: colors.primary }]}>
//                 {t('daily_wisdom_guidance_title')}
//               </Text>
//               <Text style={[styles.subtitle, { color: colors.white }]}>
//                 {t('daily_wisdom_guidance_subtitle')}
//               </Text>
//               <Image source={cardBackImage} style={styles.cardImage} />
//             </View>
//           )}
//         </ScrollView>

//         {/* --- FOOTER BUTTON (ONLY SHOWS IN INITIAL STATE) --- */}
//         {!(isRevealed || wisdomCard?.is_used) && (
//           <View style={styles.footer}>
//             <TouchableOpacity onPress={handleRevealCard} disabled={!wisdomCard}>
//               <View style={styles.buttonBorder}>
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles.mainButton}
//                 >
//                   <Text style={styles.buttonText}>{t('daily_wisdom_reveal_button')}</Text>
//                 </GradientBox>
//               </View>
//             </TouchableOpacity>
//           </View>
//         )}

//         <SubscriptionPlanModal
//           isVisible={showSubscriptionModal}
//           onClose={() => setShowSubscriptionModal(false)}
//           onConfirm={() => setShowSubscriptionModal(false)}
//         />
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default DailyWisdomCardScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1 },
//   centered: { justifyContent: 'center', alignItems: 'center' },
//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//     paddingHorizontal: 20,
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 20,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { width: 22, height: 22 },
//   headerTitleWrap: {
//     maxWidth: '70%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },
//   scrollContent: {
//     flexGrow: 1,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: 120,
//   }, // Increased bottom padding
//   contentWrapper: { width: '100%', alignItems: 'center', marginTop: 20 },
//   title: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
//   subtitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   cardImage: {
//     width: SCREEN_WIDTH * 0.65,
//     height: SCREEN_WIDTH * 0.65 * 1.7,
//     resizeMode: 'contain',
//     borderRadius: 12,
//   },
//   cardName: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 24,
//     textTransform: 'uppercase',
//     marginBottom: 20,
//   },
//   cardFrame: {},
//   playButton: { marginTop: 20 },
//   playIcon: { width: 35, height: 35 },
//   description: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 16,
//     textAlign: 'center',
//     lineHeight: 24,
//     marginTop: 12,
//     opacity: 0.9,
//   },
//   shareRow: {
//     marginTop: 24,
//     width: '100%',
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   smallBtn: {
//     minWidth: 120,
//     height: 46,
//     borderRadius: 23,
//     paddingHorizontal: 16,
//     borderWidth: 1.1,
//     borderColor: '#D9B699',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   smallIcon: {
//     width: 15,
//     height: 15,
//     marginRight: 8,
//     resizeMode: 'contain',
//     tintColor: '#fff',
//   },
//   smallBtnText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     color: '#fff',
//   },
//   footer: { position: 'absolute', bottom: 40, left: 20, right: 20 },
//   buttonBorder: {
//     borderColor: '#D9B699',
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden',
//   },
//   mainButton: {
//     height: 52,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     borderRadius: 60,
//   },
//   buttonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.aeonikRegular },
// });
