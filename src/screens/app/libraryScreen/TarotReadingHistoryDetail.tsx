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

import { Fonts } from '../../../constants/fonts';
import { AppStackParamList } from '../../../navigation/routeTypes';
import SubscriptionPlanModal from '../../../components/SubscriptionPlanModal';
import { useTranslation } from 'react-i18next';
import GradientBox from '../../../components/GradientBox';
import { useThemeStore } from '../../../store/useThemeStore';

// --- NEW: Import OpenAI Store and SoundPlayer ---
import { useOpenAiStore } from '../../../store/useOpenAiStore';
import SoundPlayer from 'react-native-sound-player';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Import Icons ---
import Back from '../../../assets/icons/backIcon.png';
import Play from '../../../assets/icons/playIcon.png';
import Pause from '../../../assets/icons/pauseIcon.png';


// --- TYPE DEFINITIONS ---
type SelectedCard = {
  card_id: string;
  image: { url: string };
};

export type ReadingHistoryItem = {
  selected_cards: SelectedCard[];
  reading: { introduction: string };
};

const TarotReadingHistoryDetail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();

  const theme = useThemeStore(s => s.theme);
  const colors = theme?.colors || { black: '#000000', bgBox: '#333333', primary: '#D9B699', white: '#FFFFFF' };

  const route = useRoute<RouteProp<AppStackParamList, 'TarotReadingHistoryDetail'>>();
  const { readingItem } = route.params || {};

  
  // --- NEW: State for audio playback and preloading ---
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(null);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // --- NEW: Get preload function from OpenAI store ---
  const { preloadSpeech } = useOpenAiStore();

  // --- NEW: useEffect to preload audio when reading data is available ---
  useEffect(() => {
    const prepareAudio = async () => {
      if (readingItem?.reading?.introduction && readingItem?.selected_cards?.length > 0) {
        setIsPreloadingAudio(true);
        // Create a unique ID from the card IDs for caching
        // --- THE FIX IS HERE: Added explicit type for 'c' ---
        const readingId = readingItem.selected_cards.map((c: SelectedCard) => c.card_id).sort().join('-');
        const audioPath = await preloadSpeech(readingItem.reading.introduction, readingId);

        if (audioPath) {
          setPreloadedAudioPath(audioPath);
          console.log('Tarot history audio preloaded successfully.');
        } else {
          console.error('Failed to preload tarot history audio.');
        }
        setIsPreloadingAudio(false);
      }
    };
    prepareAudio();
  }, [readingItem, preloadSpeech]);

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
          source={Back}
          style={[styles.backIcon, { tintColor: colors.white }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap} pointerEvents="none">
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
          Tarot Reader
        </Text>
      </View>
    </View>
  );

  if (!readingItem) {
    return (
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
      >
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.errorText}>Reading data not found.</Text>
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.focusTitle, { color: colors.primary }]}>{t('library_your_reading')}</Text>

          <View style={styles.readingCardsContainer}>
            {readingItem.selected_cards
              .reduce((rows: SelectedCard[][], card: SelectedCard) => {
                const lastRow = rows[rows.length - 1];
                if (!lastRow || lastRow.length === 3) {
                  rows.push([card]);
                } else {
                  lastRow.push(card);
                }
                return rows;
              }, [])
              .map((row: SelectedCard[], rowIndex: number) => (
                <View key={rowIndex} style={styles.selectedRow}>
                  {row.map((card: SelectedCard) => (
                    <View key={card.card_id} style={styles.box}>
                      <Image source={{ uri: card.image.url }} style={styles.boxImg} />
                    </View>
                  ))}
                  {row.length < 3 &&
                    [...Array(3 - row.length)].map((_, i) => (
                      <View
                        key={`placeholder-${rowIndex}-${i}`}
                        style={[styles.box, { opacity: 0 }]}
                      />
                    ))}
                </View>
              ))}
          </View>

          {/* --- NEW: Updated Play Button UI --- */}
          <TouchableOpacity 
            onPress={onPressPlayToggle} 
            style={styles.playButtonContainer}
            disabled={isPreloadingAudio || !preloadedAudioPath}
          >
            {isPreloadingAudio ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <Image 
                    source={isPlayingAudio ? Pause : Play} 
                    style={[styles.playIcon, { tintColor: (isPreloadingAudio || !preloadedAudioPath) ? '#999' : colors.primary }]}
                />
            )}
          </TouchableOpacity>

          <View style={styles.readingContentContainer}>
            {readingItem?.reading?.introduction && (
              <>
                <Text style={styles.readingParagraph}>
                  "{readingItem.reading.introduction}"
                </Text>
                <View style={styles.readMoreContainer}>
                  <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]}>{t('library_read_more')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
{/* 
          <View style={styles.shareRow}>
            <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
              <Image
                source={require('../../../assets/icons/shareIcon.png')}
                style={styles.smallIcon}
                resizeMode="contain"
              />
              <Text style={styles.smallBtnText}>{t('library_share')}</Text>
            </GradientBox>
          </View> */}

          <TouchableOpacity
            style={{ marginTop: 40, paddingHorizontal:20}}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.buttonBorder}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.revealBtnGrad, { borderRadius: 60 }]}
              >
                <Text style={styles.revealBtnText}>{t('library_get_premium')}</Text>
              </GradientBox>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <SubscriptionPlanModal
          isVisible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onConfirm={plan => {
            console.log('Selected Plan:', plan);
            setShowSubscriptionModal(false);
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default TarotReadingHistoryDetail;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', marginTop: 10, fontFamily: Fonts.aeonikRegular },
  header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8, paddingHorizontal: 10 },
  backBtn: { position: 'absolute', left: 10, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
  scrollContent: { paddingBottom: 40 },
  focusTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  readingCardsContainer: {
    marginBottom: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  box: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 180,
    borderWidth: 1.5,
    borderColor: '#CEA16A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  boxImg: { width: '100%', height: '100%' },
  playButtonContainer: { alignItems: 'center', marginTop: 20, height: 50, justifyContent: 'center' },
  playIcon: { width: 40, height: 40 },
  readingContentContainer: { paddingHorizontal: 24, marginTop: 20 },
  readingParagraph: {
    color: '#FFFFFF',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  readMoreContainer: { alignItems: 'flex-end', marginTop: 12 },
  readMoreText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  shareRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallBtn: {
    minWidth: 120,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CEA16A',
  },
  smallIcon: { width: 15, height: 15, marginRight: 8, tintColor: '#fff' },
  smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14, color: '#fff' },
  revealBtnGrad: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 60,
  },
  revealBtnText: { color: '#fff', fontSize: 16 },
  buttonBorder: {
    borderColor: '#D9B699',
    borderWidth: 1.5,
    borderRadius: 60,
    overflow: 'hidden',
  },
});
