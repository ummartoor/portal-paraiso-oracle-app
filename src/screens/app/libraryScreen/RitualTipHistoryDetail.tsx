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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { useTranslation } from 'react-i18next';

// --- NEW: Import OpenAI Store and SoundPlayer ---
import { useOpenAiStore } from '../../../store/useOpenAiStore';
import SoundPlayer from 'react-native-sound-player';

// --- Import Icons ---
const BackIcon = require('../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../assets/icons/pauseIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- TYPE DEFINITION ---
// --- FIX #1: Remove the '_id' property as it's not being passed ---
type RitualHistoryItem = {
  ritual_tip: {
    ritual_name: string;
    ritual_image: { url: string };
  };
  ai_response: string;
  tip_date: string;
};

const RitualTipHistoryDetail: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const route =
    useRoute<RouteProp<AppStackParamList, 'RitualTipHistoryDetail'>>();
  const { historyItem } = route.params || {};

  // --- NEW: State for audio playback and preloading ---
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(
    null,
  );
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);

  // --- NEW: Get preload function from OpenAI store ---
  const { preloadSpeech } = useOpenAiStore();

  // --- NEW: useEffect to preload audio when history data is available ---
  useEffect(() => {
    const prepareAudio = async () => {
      // --- FIX #2: Check for properties that exist and create a unique ID ---
      if (historyItem?.ai_response && historyItem?.ritual_tip?.ritual_name) {
        setIsPreloadingAudio(true);
        // Create a unique ID from the available data for caching.
        const readingId = `${
          historyItem.ritual_tip.ritual_name
        }_${historyItem.ai_response.substring(0, 20)}`.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        );
        const audioPath = await preloadSpeech(
          historyItem.ai_response,
          readingId,
        );

        if (audioPath) {
          setPreloadedAudioPath(audioPath);
          console.log('Ritual tip history audio preloaded successfully.');
        } else {
          console.error('Failed to preload ritual tip history audio.');
        }
        setIsPreloadingAudio(false);
      }
    };
    prepareAudio();
  }, [historyItem, preloadSpeech]);

  // --- NEW: useEffect for SoundPlayer events ---
  useEffect(() => {
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener(
      'FinishedPlaying',
      () => {
        setIsPlayingAudio(false);
      },
    );
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      <View style={styles.headerTitleWrap} pointerEvents="none">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.white }]}
        >
          Ritual Tip
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
            <Text style={[styles.title, { color: colors.primary }]}>
              {t('library_your_ritual')}
            </Text>

            <View style={styles.ritualCard}>
              <Text style={styles.cardDate}>
                {formatDate(historyItem.tip_date)}
              </Text>
              <Image
                source={{ uri: historyItem.ritual_tip.ritual_image.url }}
                style={styles.ritualImage}
              />
              <Text style={styles.ritualName}>
                {historyItem.ritual_tip.ritual_name}
              </Text>

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
                    style={[
                      styles.playIcon,
                      {
                        tintColor:
                          isPreloadingAudio || !preloadedAudioPath
                            ? '#999'
                            : colors.primary,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>

              <Text style={styles.description}>{historyItem.ai_response}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default RitualTipHistoryDetail;

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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  contentWrapper: { width: '100%', alignItems: 'center' },
  title: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 20 },
  ritualCard: {
    backgroundColor: 'rgba(74, 63, 80, 0.8)',
    borderRadius: 20,
    width: '100%',
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 182, 153, 0.3)',
  },
  cardDate: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  ritualImage: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  ritualName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 20,
    color: '#D9B699',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playButton: {
    marginVertical: 20,
    height: 35,
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { width: 35, height: 35 },
  description: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#E0E0E0',
  },
});
