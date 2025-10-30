import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SubscriptionPlanModal from '../../../components/SubscriptionPlanModal';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';

// --- NEW: Import OpenAI Store and SoundPlayer ---
import { useOpenAiStore } from '../../../store/useOpenAiStore';
import SoundPlayer from 'react-native-sound-player';
import { t } from 'i18next';

// --- Import Icons ---
const BackIcon = require('../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../assets/icons/pauseIcon.png');
const ShareIcon = require('../../../assets/icons/shareIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- THE FIX IS HERE (Part 1) ---
// The _id is not reliably passed via navigation, so we remove it from the type
// to match the actual data shape and prevent future errors.
type WisdomHistoryItem = {
  card: {
    card_name: string;
    card_image: { url: string };
  };
  reading: string;
};

const DailyWisdomHistoryDetail: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route =
    useRoute<RouteProp<AppStackParamList, 'DailyWisdomCardHistoryDetail'>>();
  const { historyItem } = route.params || {};

  // --- NEW: State for audio playback and preloading ---
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(null);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // --- NEW: Get preload function from OpenAI store ---
  const { preloadSpeech } = useOpenAiStore();

  // --- NEW: useEffect to preload audio when history data is available ---
  useEffect(() => {
    const prepareAudio = async () => {
      // --- THE FIX IS HERE (Part 2) ---
      // We check for properties we know exist (reading and card_name)
      if (historyItem?.reading && historyItem?.card?.card_name) {
        setIsPreloadingAudio(true);
        // Create a unique ID from the available data for caching.
        const readingId = `${historyItem.card.card_name}_${historyItem.reading.substring(0,20)}`.replace(/[^a-zA-Z0-9]/g, '_');
        const audioPath = await preloadSpeech(historyItem.reading, readingId);

        if (audioPath) {
          setPreloadedAudioPath(audioPath);
          console.log('Wisdom history audio preloaded successfully.');
        } else {
          console.error('Failed to preload wisdom history audio.');
        }
        setIsPreloadingAudio(false);
      }
    };
    prepareAudio();
  }, [historyItem, preloadSpeech]);

  // --- NEW: useEffect for SoundPlayer events ---
  useEffect(() => {
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      setIsPlayingAudio(false);
    });
    // Cleanup on unmount
    return () => {
      SoundPlayer.stop();
      onFinishedPlayingSubscription.remove();
    };
  }, []);

  // --- NEW: Updated playback toggle function ---
  const onPressPlayToggle = () => {
    if (isPlayingAudio) {
      SoundPlayer.stop();
      setIsPlayingAudio(false);
      return;
    }
    if (preloadedAudioPath) {
      try {
        SoundPlayer.playUrl(`file://${preloadedAudioPath}`);
        setIsPlayingAudio(true);
      } catch (e) {
        console.error('Could not play preloaded audio file', e);
      }
    }
  };

  const renderHeader = () => (
   <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Image
          source={BackIcon}
          style={[styles.backIcon, { tintColor: colors.white }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap} pointerEvents="none">
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
          Daily Wisdom Reading
        </Text>
      </View>
    </View>
  );

  if (!historyItem) {
    return (
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
      >
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.errorText}>History data not found.</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

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
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentWrapper}>
            <Text style={[styles.cardName, { color: colors.primary }]}>
              {historyItem.card.card_name}
            </Text>

            <View style={styles.cardFrame}>
              {historyItem.card.card_image.url && (
                <Image
                  source={{ uri: historyItem.card.card_image.url }}
                  style={styles.cardImage}
                />
              )}
            </View>

            {/* --- NEW: Updated Play Button UI --- */}
            <TouchableOpacity
              onPress={onPressPlayToggle}
              style={styles.playButton}
              disabled={isPreloadingAudio || !preloadedAudioPath}
            >
              {isPreloadingAudio ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Image
                  source={isPlayingAudio ? PauseIcon : PlayIcon}
                  style={[styles.playIcon, { tintColor: (isPreloadingAudio || !preloadedAudioPath) ? '#999' : colors.primary }]}
                />
              )}
            </TouchableOpacity>

            <Text style={[styles.description, { color: colors.white }]}>
              {historyItem.reading}
            </Text>

            {/* <View style={styles.shareRow}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.smallBtn}
              >
                <Image source={ShareIcon} style={styles.smallIcon} />
                <Text style={styles.smallBtnText}>Share</Text>
              </GradientBox>
            </View> */}

            <TouchableOpacity
                    style={{ marginTop: 40, paddingHorizontal:20 }}
                    onPress={() => setShowSubscriptionModal(true)}
                  >
                    <View style={styles.buttonBorder}>
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={[styles.revealBtnGrad, { borderRadius: 60 }]}
                      >
                        <Text style={styles.revealBtnText}>
                          {t('get_premium_button')}
                        </Text>
                      </GradientBox>
                    </View>
                  </TouchableOpacity>
          </View>
        </ScrollView>

        <SubscriptionPlanModal
          isVisible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onConfirm={() => setShowSubscriptionModal(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DailyWisdomHistoryDetail;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', marginTop: 10, fontFamily: Fonts.aeonikRegular },
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
    paddingBottom: 50,
  },
  contentWrapper: { width: '100%', marginTop: 20 },
  cardName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 28,
    textAlign:'center',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  cardImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65 * 1.7,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  cardFrame: { alignItems: 'center'},
  playButton: { marginTop: 20,justifyContent: 'center', alignItems: 'center' },
  playIcon: { width: 40, height: 40 },
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
    paddingHorizontal: 16,
    borderWidth: 1.1,
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

 
    revealBtnGrad: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 60,
  },
  revealBtnText: { color: '#fff', fontSize: 16 },  buttonBorder: {
     borderColor: '#D9B699',
    borderWidth: 1,
    borderRadius: 60,
    overflow: 'hidden',
  },
});

