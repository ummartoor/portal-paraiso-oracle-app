import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  ImageSourcePropType,
  Vibration,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withDecay,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import Pressable from '../../../../../components/Pressable';
import Video from 'react-native-video';
import { useTarotCardStore } from '../../../../../store/useTarotCardStore';
import { useTranslation } from 'react-i18next';
import SoundPlayer from 'react-native-sound-player';

// --- UPDATED: Import preloadSpeech as well ---
import { useOpenAiStore } from '../../../../../store/useOpenAiStore';
import { useInterstitialAd } from '../../../../../hooks/useInterstitialAd';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type TarotCardFromAPI = {
  _id: string;
  card_image: { url: string; key: string };
  card_name: string;
  card_description: string;
  card_keywords: string[];
};
type DeckCard = TarotCardFromAPI & {
  cardBackImg: ImageSourcePropType;
};

type TarotCardDetailRouteProp = RouteProp<AppStackParamList, 'TarotCardDetail'>;

// --- Tunables and Helpers ---
const DECK_AREA_HEIGHT = SCREEN_HEIGHT * 0.4;
const CARD_W = 96;
const CARD_H = 170;
const ARC_Y_TOP = DECK_AREA_HEIGHT * 0.15;
const RADIUS = 260;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = ARC_Y_TOP + RADIUS;
const VISIBLE_COUNT = 7;
const STEP_DEG = 12;
const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;
const ITEM_STRIDE = 65;

const shuffleArray = (array: TarotCardFromAPI[]): TarotCardFromAPI[] => {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
};

function triggerHaptic() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 35, 40, 35]);
  } else {
    Vibration.vibrate();
  }
}
const wClamp = (v: number, min: number, max: number) => {
  'worklet';
  return v < min ? min : v > max ? max : v;
};
const wRound = (v: number) => {
  'worklet';
  return Math.round(v);
};

const TarotCardDetailScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<TarotCardDetailRouteProp>();
  const { userQuestion } = route.params;
  const { t } = useTranslation();
  const {
    cards: apiCards,
    isLoading: isDeckLoading,
    fetchTarotCards,
    generateReading,
    readingData,
    isReadingLoading,
    saveReading,
    isSavingLoading,
  } = useTarotCardStore();

  const { preloadSpeech } = useOpenAiStore();

  const [fullDeck, setFullDeck] = useState<DeckCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRevealGrid, setShowRevealGrid] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  // --- NEW: State for preloading audio ---
  const [preloadedAudioPath, setPreloadedAudioPath] = useState<string | null>(
    null,
  );
  const [isPreloadingAudio, setIsPreloadingAudio] = useState(false);

  const { showAd } = useInterstitialAd();
  const selectedCardsScrollViewRef = useRef<ScrollView>(null);

  // const handleSaveReading = async () => {
  //   Vibration.vibrate([0, 35, 40, 35]);
  //   if (isSavingLoading) return;
  //   await saveReading();
  //   navigation.navigate('MainTabs');
  // };
  const performSaveAndNavigate = async () => {
    if (isSavingLoading) return; // Check again in case
    await saveReading();
    navigation.navigate('MainTabs');
  };

  // --- UPDATE THIS FUNCTION ---
  // This is what the "Save" button presses.
  // It now shows the ad and passes our save function as the callback.
  const handleSaveReading = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    if (isSavingLoading) return;

    // Show the ad.
    // The `performSaveAndNavigate` function will ONLY run
    // after the user closes the ad (or immediately if the ad fails to load).
    showAd(performSaveAndNavigate);
  };

  const availableDeck = useMemo(() => {
    const selectedIds = new Set(selectedCards.map(c => c._id));
    return fullDeck.filter(card => !selectedIds.has(card._id));
  }, [fullDeck, selectedCards]);

  const maxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    fetchTarotCards();
  }, [fetchTarotCards]);

  useEffect(() => {
    if (apiCards.length > 0) {
      const shuffledApiCards = shuffleArray(apiCards);
      const cardBackImg = require('../../../../../assets/images/deskCard.png');
      const transformedDeck = shuffledApiCards.map(card => ({
        ...card,
        cardBackImg,
      }));
      setFullDeck(transformedDeck);
      progress.value = Math.floor(transformedDeck.length / 2);
    }
  }, [apiCards]);

  useEffect(() => {
    const newMaxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
    if (progress.value > newMaxIndex) {
      progress.value = withTiming(newMaxIndex);
    }
  }, [availableDeck.length, progress]);

  // --- NEW: useEffect to PRELOAD audio when reading data is ready ---
  useEffect(() => {
    const prepareReadingAudio = async () => {
      // We only preload if we have the necessary data and a unique ID for the reading
      if (readingData?.reading?.introduction && selectedCards.length > 0) {
        setIsPreloadingAudio(true);
        const textToPreload = `An introduction to your reading: ${readingData.reading.introduction}`;

        // --- THE FIX IS HERE ---
        // Create a unique ID from the selected cards to use for caching the audio file.
        // Sorting ensures the ID is the same regardless of selection order.
        const readingId = selectedCards
          .map(c => c._id)
          .sort()
          .join('-');

        const audioPath = await preloadSpeech(textToPreload, readingId);

        if (audioPath) {
          setPreloadedAudioPath(audioPath);
          if (__DEV__) {
            console.log('Tarot reading audio preloaded successfully.');
          }
        } else {
          if (__DEV__) {
            console.log('Failed to preload tarot reading audio.');
          }
        }
        setIsPreloadingAudio(false);
      }
    };

    prepareReadingAudio();
  }, [readingData, preloadSpeech]);

  useEffect(() => {
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener(
      'FinishedPlaying',
      () => {
        setIsPlayingAudio(false);
      },
    );
    return () => {
      SoundPlayer.stop();
      onFinishedPlayingSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (selectedCards.length > 0) {
      const timer = setTimeout(() => {
        selectedCardsScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCards.length]);

  // --- NEW: Updated to play preloaded audio instantly ---
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
        console.error('Could not play preloaded audio', e);
      }
    } else {
      console.warn('Audio is not ready yet or failed to preload.');
    }
  };

  const handleSelect = (card: DeckCard) => {
    setSelectedCards(prev => [...prev, card]);
    triggerHaptic();
  };
  const handleRemove = (cardToRemove: DeckCard) => {
    setSelectedCards(prev =>
      prev.filter(card => card._id !== cardToRemove._id),
    );
    triggerHaptic();
  };
  const handleStartRevealFlow = () => {
    setShowVideo(true);
  };

  const handleRevealMeaning = async () => {
    Vibration.vibrate([0, 35, 40, 35]);
    if (isReadingLoading || selectedCards.length === 0 || !userQuestion) return;
    const card_ids = selectedCards.map(card => card._id);
    const result = await generateReading(card_ids, userQuestion);
    if (result) {
      setShowRevealGrid(false);
      setShowReading(true);
    }
  };

  const renderHeader = () => (
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
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.white }]}
        >
          {t('tarot_reader_header')}
        </Text>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../../assets/images/backgroundImage.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />
          {showVideo ? (
            <View style={styles.fullscreenCenter}>
              <Video
                source={require('../../../../../assets/videos/onboardingVideo2.mp4')}
                style={styles.video}
                resizeMode="cover"
                repeat={false}
                paused={false}
              />
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    Vibration.vibrate([0, 35, 40, 35]);
                    setShowVideo(false);
                    setShowRevealGrid(true);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.buttonBorder}>
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={styles.revealBtnGrad}
                    >
                      <Text style={styles.revealBtnText}>
                        {t('continue_button')}
                      </Text>
                    </GradientBox>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : showRevealGrid ? (
            <>
              <View style={{ flex: 1 }}>
                {renderHeader()}
                <View style={styles.content}>
                  <Text style={[styles.focusTitle, { color: colors.primary }]}>
                    {t('tarot_your_cards_title')}
                  </Text>
                  <Text style={[styles.paragraph, { color: colors.white }]}>
                    {t('tarot_your_cards_subtitle')}
                  </Text>
                </View>
                <View style={styles.revealGridContainer}>
                  <ScrollView contentContainerStyle={styles.selectedScroll}>
                    {selectedCards
                      .reduce((rows: DeckCard[][], card, index) => {
                        if (index % 3 === 0) rows.push([card]);
                        else rows[rows.length - 1].push(card);
                        return rows;
                      }, [])
                      .map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.selectedRow}>
                          {row.map(card => (
                            <View key={card._id} style={styles.box}>
                              <Image
                                source={{ uri: card.card_image.url }}
                                style={styles.boxImg}
                              />
                            </View>
                          ))}
                          {row.length < 3 &&
                            [...Array(3 - row.length)].map((_, i) => (
                              <View
                                key={`p-grid-${rowIndex}-${i}`}
                                style={[styles.box, { opacity: 0 }]}
                              />
                            ))}
                        </View>
                      ))}
                  </ScrollView>
                </View>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={handleRevealMeaning}
                  activeOpacity={0.9}
                  disabled={isReadingLoading}
                >
                  <View style={styles.buttonBorder}>
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={styles.revealBtnGrad}
                    >
                      {isReadingLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.revealBtnText}>
                          {t('tarot_reveal_meaning_button')}
                        </Text>
                      )}
                    </GradientBox>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : showReading ? (
            <>
              <View style={{ flex: 1 }}>
                {renderHeader()}
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                  <View style={styles.content}>
                    <Text
                      style={[styles.focusTitle, { color: colors.primary }]}
                    >
                      {t('tarot_your_reading_title')}
                    </Text>
                  </View>
                  <View style={styles.readingCardsContainer}>
                    {readingData?.selected_cards
                      .reduce((rows: any[][], card, index) => {
                        if (index % 3 === 0) rows.push([card]);
                        else rows[rows.length - 1].push(card);
                        return rows;
                      }, [])
                      .map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.selectedRow}>
                          {row.map(card => (
                            <View key={card.card_id} style={styles.box}>
                              <Image
                                source={{ uri: card.image.url }}
                                style={styles.boxImg}
                                resizeMode="cover"
                              />
                            </View>
                          ))}
                          {row.length < 3 &&
                            [...Array(3 - row.length)].map((_, i) => (
                              <View
                                key={`p-reading-${rowIndex}-${i}`}
                                style={[styles.box, { opacity: 0 }]}
                              />
                            ))}
                        </View>
                      ))}
                  </View>

                  {/* --- NEW: Updated Playback Button UI for preloading --- */}
                  <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={onPressPlayToggle}
                      activeOpacity={0.7}
                      disabled={isPreloadingAudio || !preloadedAudioPath}
                      style={styles.playBtnContainer}
                    >
                      {isPreloadingAudio ? (
                        <ActivityIndicator
                          size="large"
                          color={colors.primary}
                        />
                      ) : (
                        <Image
                          source={
                            isPlayingAudio
                              ? require('../../../../../assets/icons/pauseIcon.png')
                              : require('../../../../../assets/icons/playIcon.png')
                          }
                          style={{
                            width: 40,
                            height: 40,
                            tintColor:
                              isPreloadingAudio || !preloadedAudioPath
                                ? '#999'
                                : colors.primary,
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.readingContentContainer}>
                    {readingData?.reading?.introduction && (
                      <>
                        <Text style={styles.readingParagraph}>
                          "{readingData.reading.introduction}"
                        </Text>
                        <View style={styles.readMoreContainer}>
                          <TouchableOpacity
                            onPress={() => setShowSubscriptionModal(true)}
                          >
                            <Text
                              style={[
                                styles.smallBtnText,
                                {
                                  color: colors.primary,
                                  textDecorationLine: 'underline',
                                },
                              ]}
                            >
                              {t('read_more_button')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.shareRow}>
                    {/* <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={styles.smallBtn}
                    >
                      <Image
                        source={require('../../../../../assets/icons/shareIcon.png')}
                        style={styles.smallIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.smallBtnText}>
                        {t('share_button')}
                      </Text>
                    </GradientBox> */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleSaveReading}
                      disabled={isSavingLoading}
                    >
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={styles.smallBtn}
                      >
                        {isSavingLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Image
                              source={require('../../../../../assets/icons/saveIcon.png')}
                              style={styles.smallIcon}
                              resizeMode="contain"
                            />
                            <Text style={styles.smallBtnText}>
                              {t('save_button')}
                            </Text>
                          </>
                        )}
                      </GradientBox>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{ marginTop: 40, paddingHorizontal: 20 }}
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
                </ScrollView>
              </View>
            </>
          ) : (
            <>
              <View style={styles.topContentContainer}>
                {renderHeader()}
                <View style={styles.content}>
                  <Text style={[styles.focusTitle, { color: colors.primary }]}>
                    {t('tarot_focus_question_title')}
                  </Text>
                  <Text style={[styles.paragraph, { color: colors.white }]}>
                    {t('tarot_focus_question_subtitle')}
                  </Text>
                </View>
                {selectedCards.length > 0 && (
                  <View style={styles.selectedArea}>
                    <ScrollView
                      ref={selectedCardsScrollViewRef}
                      contentContainerStyle={styles.selectedScroll}
                    >
                      {selectedCards
                        .reduce((rows: DeckCard[][], card, index) => {
                          if (index % 3 === 0) rows.push([card]);
                          else rows[rows.length - 1].push(card);
                          return rows;
                        }, [])
                        .map((row, rowIndex) => (
                          <View key={rowIndex} style={styles.selectedRow}>
                            {row.map(card => (
                              <View key={card._id} style={styles.box}>
                                <Image
                                  source={card.cardBackImg}
                                  style={styles.boxImg}
                                />
                                <TouchableOpacity
                                  onPress={() => handleRemove(card)}
                                  style={styles.removeBtn}
                                >
                                  <Image
                                    source={require('../../../../../assets/icons/closeIcon.png')}
                                    style={styles.removeIcon}
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                            {row.length < 3 &&
                              [...Array(3 - row.length)].map((_, i) => (
                                <View
                                  key={`p-initial-${rowIndex}-${i}`}
                                  style={[styles.box, { opacity: 0 }]}
                                />
                              ))}
                          </View>
                        ))}
                    </ScrollView>
                  </View>
                )}
                {selectedCards.length > 0 && (
                  <View style={styles.revealBtnWrap}>
                    <Pressable
                      onPress={handleStartRevealFlow}
                      hapticType="medium"
                      style={styles.buttonBorder}
                    >
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={styles.revealBtnGrad}
                      >
                        <Text style={styles.revealBtnText}>
                          {t('tarot_start_revealing_button')}
                        </Text>
                      </GradientBox>
                    </Pressable>
                  </View>
                )}
              </View>
              <View style={styles.deckWrap}>
                {isDeckLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  availableDeck.map(card => (
                    <ArcCard
                      key={card._id}
                      index={availableDeck.indexOf(card)}
                      card={card}
                      progress={progress}
                      maxIndex={maxIndex}
                      onSelect={handleSelect}
                    />
                  ))
                )}
                {!isDeckLoading && (
                  <Text style={styles.hint}>
                    {t('tarot_tap_to_select_hint')}
                  </Text>
                )}
              </View>
            </>
          )}
          <SubscriptionPlanModal
            isVisible={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            onConfirm={plan => {
              console.log('Selected:', plan);
              setShowSubscriptionModal(false);
            }}
          />
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
};

function ArcCard({
  card,
  index,
  progress,
  maxIndex,
  onSelect,
}: {
  card: DeckCard;
  index: number;
  progress: Animated.SharedValue<number>;
  maxIndex: number;
  onSelect: (c: DeckCard) => void;
}) {
  const start = useSharedValue(0);
  const aStyle = useAnimatedStyle(() => {
    const rel = index - progress.value;
    const angleDeg = Math.max(
      -MAX_VISIBLE_DEG,
      Math.min(MAX_VISIBLE_DEG, rel * STEP_DEG),
    );
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
    const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;
    const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
    const baseScale = 1 - 0.18 * t;
    const opacity = 1 - 0.1 * t;
    return {
      position: 'absolute',
      left: x,
      top: y,
      width: CARD_W,
      height: CARD_H,
      opacity,
      transform: [{ rotate: `${angleDeg}deg` }, { scale: baseScale }],
    };
  });
  const deckPan = Gesture.Pan()
    .onStart(() => {
      start.value = progress.value;
    })
    .onUpdate(e => {
      progress.value = wClamp(
        start.value - e.translationX / ITEM_STRIDE,
        0,
        maxIndex,
      );
    })
    .onEnd(e => {
      progress.value = withDecay(
        {
          velocity: -e.velocityX / ITEM_STRIDE,
          clamp: [0, maxIndex],
          rubberBandEffect: true,
          deceleration: 0.997,
        },
        () => {
          progress.value = withTiming(wRound(progress.value));
        },
      );
    });
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)(card);
  });
  const composed = Gesture.Simultaneous(deckPan, tap);
  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[aStyle, styles.cardShadow]}>
        <Image source={card.cardBackImg} style={styles.cardImg} />
      </Animated.View>
    </GestureDetector>
  );
}

export default TarotCardDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topContentContainer: {
    height: '70%',
    justifyContent: 'flex-start',
  },
  deckWrap: {
    height: '30%',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  focusTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    marginBottom: 5,
  },
  paragraph: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 8,
    lineHeight: 20,
  },
  selectedArea: {
    flex: 1,
    minHeight: 190,
  },
  selectedScroll: { paddingHorizontal: 10, paddingBottom: 10 },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  box: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 180,
    borderWidth: 1,
    borderColor: '#CEA16A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  boxImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#0008',
    borderRadius: 13,
    padding: 2,
  },
  removeIcon: { width: 17, height: 17, tintColor: '#fff' },
  revealBtnWrap: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 'auto',
  },
  revealBtnGrad: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 60,
  },
  revealBtnText: { color: '#fff', fontSize: 16 },
  hint: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.95,
    marginTop: 70,
    position: 'absolute',
  },
  cardImg: { width: '100%', height: '100%', borderRadius: 10 },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  readingCardsContainer: {
    maxHeight: 380,
    marginTop: 10,
  },
  readingContentContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  readingParagraph: {
    color: '#FFFFFF',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
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
    borderRadius: 22,
    // paddingHorizontal: 16,

    borderColor: '#D9B699',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readMoreContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 5,
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
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  buttonBorder: {
    borderColor: '#D9B699',
    borderWidth: 1,
    borderRadius: 26,
    overflow: 'hidden',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  fullscreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealGridContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  playBtnContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// import React, { useEffect, useMemo, useState, useRef } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   runOnJS,
//   withDecay,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';
// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../../navigation/routeTypes';
// import Tts from 'react-native-tts';
// import Video from 'react-native-video';
// import { useTarotCardStore } from '../../../../../store/useTarotCardStore';

// import { useTranslation } from 'react-i18next';
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
// import SoundPlayer from 'react-native-sound-player';

// type TarotCardFromAPI = {
//   _id: string;
//   card_image: { url: string; key: string };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// };
// type DeckCard = TarotCardFromAPI & {
//   cardBackImg: ImageSourcePropType;
// };

// // This type is defined here, at the top level of the file
// type TarotCardDetailRouteProp = RouteProp<AppStackParamList, 'TarotCardDetail'>;

// // --- Tunables and Helpers ---
// const DECK_AREA_HEIGHT = SCREEN_HEIGHT * 0.4;
// const CARD_W = 96;
// const CARD_H = 170;
// const ARC_Y_TOP = DECK_AREA_HEIGHT * 0.15;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;
// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;
// const ITEM_STRIDE = 65;

// const shuffleArray = (array: TarotCardFromAPI[]): TarotCardFromAPI[] => {
//   // Create a copy to avoid mutating the original array
//   const newArray = [...array];
//   let currentIndex = newArray.length;
//   let randomIndex;

//   // While there remain elements to shuffle...
//   while (currentIndex !== 0) {
//     // Pick a remaining element...
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [newArray[currentIndex], newArray[randomIndex]] = [
//       newArray[randomIndex], newArray[currentIndex],
//     ];
//   }
//   return newArray;
// };

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const route = useRoute<TarotCardDetailRouteProp>();
//   const { userQuestion } = route.params;
//   const { t } = useTranslation();
//   const {
//     cards: apiCards,
//     isLoading: isDeckLoading,
//     fetchTarotCards,
//     generateReading,
//     readingData,
//     isReadingLoading,
//     saveReading,
//     isSavingLoading,
//   } = useTarotCardStore();

//   const [fullDeck, setFullDeck] = useState<DeckCard[]>([]);
//   const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
//   const [showVideo, setShowVideo] = useState(false);
//   const [showReading, setShowReading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [showRevealGrid, setShowRevealGrid] = useState(false);

//   const selectedCardsScrollViewRef = useRef<ScrollView>(null);

//   const handleSaveReading = async () => {
//            Vibration.vibrate([0, 35, 40, 35]);
//     if (isSavingLoading) return;

//     await saveReading();

//     navigation.navigate('MainTabs');
//   };
//   const availableDeck = useMemo(() => {
//     const selectedIds = new Set(selectedCards.map(c => c._id));
//     return fullDeck.filter(card => !selectedIds.has(card._id));
//   }, [fullDeck, selectedCards]);

//   const maxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//   const progress = useSharedValue(0);
//   useEffect(() => {
//     fetchTarotCards();
//   }, [fetchTarotCards]);

//   // useEffect(() => {
//   //   if (apiCards.length > 0) {
//   //     const cardBackImg = require('../../../../../assets/images/deskCard.png');
//   //     const transformedDeck = apiCards.map(card => ({ ...card, cardBackImg }));
//   //     setFullDeck(transformedDeck);
//   //     progress.value = Math.floor(transformedDeck.length / 2);
//   //   }
//   // }, [apiCards]);

//   // NEW UPDATED CODE
// useEffect(() => {
//     if (apiCards.length > 0) {
//       // 1. Cards ko pehle shuffle karein
//       const shuffledApiCards = shuffleArray(apiCards);

//       const cardBackImg = require('../../../../../assets/images/deskCard.png');

//       // 2. Shuffled array ko use karke deck banayein
//       const transformedDeck = shuffledApiCards.map(card => ({
//         ...card,
//         cardBackImg,
//       }));

//       setFullDeck(transformedDeck);
//       progress.value = Math.floor(transformedDeck.length / 2);
//     }
// }, [apiCards]);

//   useEffect(() => {
//     const newMaxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//     if (progress.value > newMaxIndex) {
//       progress.value = withTiming(newMaxIndex);
//     }
//   }, [availableDeck.length, progress]);

//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//     Tts.setDefaultRate(0.4, true);
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
//   useEffect(() => {
//     if (selectedCards.length > 0) {
//       const timer = setTimeout(() => {
//         selectedCardsScrollViewRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [selectedCards.length]);

//   const onPressPlayToggle = async () => {
//     if (!readingData?.reading) return;
//     const textToSpeak = `Introduction. ${readingData.reading.introduction}. Love . ${readingData.reading.love} Career . ${readingData.reading.career}`;

//     if (isSpeaking) {
//       await Tts.stop();
//     } else {
//       await Tts.stop();
//       Tts.speak(textToSpeak);
//     }
//   };

//   const handleSelect = (card: DeckCard) => {
//     setSelectedCards(prev => [...prev, card]);
//     triggerHaptic();
//   };
//   const handleRemove = (cardToRemove: DeckCard) => {
//     setSelectedCards(prev =>
//       prev.filter(card => card._id !== cardToRemove._id),
//     );
//     triggerHaptic();
//   };
//   const handleStartRevealFlow = () => {

//     setShowVideo(true);
//   };

//   const handleRevealMeaning = async () => {
//            Vibration.vibrate([0, 35, 40, 35]);
//     // FIX 4: Add a check for userQuestion before calling the API
//     if (isReadingLoading || selectedCards.length === 0 || !userQuestion) return;

//     const card_ids = selectedCards.map(card => card._id);

//     // FIX 5: Pass the userQuestion as the second argument to the function
//     const result = await generateReading(card_ids, userQuestion);

//     if (result) {
//       setShowRevealGrid(false);
//       setShowReading(true);

//     }
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={styles.backBtn}
//       >
//         <Image
//           source={require('../../../../../assets/icons/backIcon.png')}
//           style={[styles.backIcon, { tintColor: colors.white }]}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//       <View style={styles.headerTitleWrap} pointerEvents="none">
//         <Text
//           numberOfLines={1}
//           ellipsizeMode="tail"
//           style={[styles.headerTitle, { color: colors.white }]}
//         >
//           {t('tarot_reader_header')}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//
//       <ImageBackground
//         source={require('../../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//
//         <SafeAreaView style={styles.container}>
//
//           <StatusBar
//             barStyle="light-content"
//             translucent
//             backgroundColor="transparent"
//           />
//
//           {showVideo ? (
//             <View style={styles.fullscreenCenter}>
//               <Video
//                 source={require('../../../../../assets/videos/onboardingVideo2.mp4')}
//                 style={styles.video}
//                 resizeMode="cover"
//                 repeat={false}
//                 paused={false}
//               />
//               <View style={styles.footer}>
//                 <TouchableOpacity
//                   onPress={() => {
//                            Vibration.vibrate([0, 35, 40, 35]);
//                     setShowVideo(false);
//                     setShowRevealGrid(true);
//                   }}
//                   activeOpacity={0.9}
//                 >
//                   <View style={styles.buttonBorder}>
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.revealBtnGrad}
//                     >
//                       <Text style={styles.revealBtnText}>
//                         {t('continue_button')}
//                       </Text>
//                     </GradientBox>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : showRevealGrid ? (
//             <>
//               <View style={{ flex: 1 }}>
//                 {renderHeader()}
//                 <View style={styles.content}>
//                   <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                     {t('tarot_your_cards_title')}
//                   </Text>
//                   <Text style={[styles.paragraph, { color: colors.white }]}>
//                     {t('tarot_your_cards_subtitle')}
//                   </Text>
//                 </View>
//                 <View style={styles.revealGridContainer}>
//                   <ScrollView contentContainerStyle={styles.selectedScroll}>
//
//                     {selectedCards
//                       .reduce((rows: DeckCard[][], card, index) => {
//                         if (index % 3 === 0) rows.push([card]);
//                         else rows[rows.length - 1].push(card);
//                         return rows;
//                       }, [])
//                       .map((row, rowIndex) => (
//                         <View key={rowIndex} style={styles.selectedRow}>
//                           {row.map(card => (
//                             <View key={card._id} style={styles.box}>
//                               <Image
//                                 source={{ uri: card.card_image.url }}
//                                 style={styles.boxImg}
//                               />
//                             </View>
//                           ))}
//                           {row.length < 3 &&
//                             [...Array(3 - row.length)].map((_, i) => (
//                               <View
//                                 key={`p-grid-${rowIndex}-${i}`}
//                                 style={[styles.box, { opacity: 0 }]}
//                               />
//                             ))}
//                         </View>
//                       ))}
//
//                   </ScrollView>
//                 </View>
//
//               </View>
//
//               <View style={styles.footer}>
//
//                 <TouchableOpacity
//                   onPress={handleRevealMeaning}
//                   activeOpacity={0.9}
//                   disabled={isReadingLoading}
//                 >
//
//                   <View style={styles.buttonBorder}>
//
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.revealBtnGrad}
//                     >
//
//                       {isReadingLoading ? (
//                         <ActivityIndicator color="#fff" />
//                       ) : (
//                         <Text style={styles.revealBtnText}>
//                           {t('tarot_reveal_meaning_button')}
//                         </Text>
//                       )}
//
//                     </GradientBox>
//
//                   </View>
//
//                 </TouchableOpacity>
//
//               </View>
//             </>
//           ) : showReading ? (
//             <>
//               <View style={{ flex: 1 }}>
//                 {renderHeader()}
//                 <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
//                   <View style={styles.content}>
//                     <Text
//                       style={[styles.focusTitle, { color: colors.primary }]}
//                     >
//                       {t('tarot_your_reading_title')}
//                     </Text>
//                   </View>
//
//                   <View style={styles.readingCardsContainer}>
//
//                     <ScrollView nestedScrollEnabled={true}>
//
//                       {readingData?.selected_cards
//                         .reduce((rows: any[][], card, index) => {
//                           if (index % 3 === 0) rows.push([card]);
//                           else rows[rows.length - 1].push(card);
//                           return rows;
//                         }, [])
//                         .map((row, rowIndex) => (
//                           <View key={rowIndex} style={styles.selectedRow}>
//
//                             {row.map(card => (
//                               <View key={card.card_id} style={styles.box}>
//                                 <Image
//                                   source={{ uri: card.image.url }}
//                                   style={styles.boxImg}
//                                 />
//                               </View>
//                             ))}
//
//                             {row.length < 3 &&
//                               [...Array(3 - row.length)].map((_, i) => (
//                                 <View
//                                   key={`p-reading-${rowIndex}-${i}`}
//                                   style={[styles.box, { opacity: 0 }]}
//                                 />
//                               ))}
//
//                           </View>
//                         ))}
//
//                     </ScrollView>
//
//                   </View>
//
//                   <View style={{ alignItems: 'center', marginTop: 10 }}>
//                     <TouchableOpacity
//                       onPress={onPressPlayToggle}
//                       activeOpacity={0.7}
//                     >
//                       <Image
//                         source={
//                           isSpeaking
//                             ? require('../../../../../assets/icons/pauseIcon.png')
//                             : require('../../../../../assets/icons/playIcon.png')
//                         }
//                         style={{ width: 40, height: 40 }}
//                         resizeMode="contain"
//                       />
//                     </TouchableOpacity>
//                   </View>
//
//                   <View style={styles.readingContentContainer}>
//
//                     {readingData?.reading?.introduction && (
//                       <>
//                         {/*                           <Text style={styles.readingTitle}>Introduction</Text> */}
//
//                         <Text style={styles.readingParagraph}>
//                           "{readingData.reading.introduction}"
//                         </Text>
//                         {/* --- MODIFIED: Button is now after the paragraph and aligned right --- */}
//                         <View style={styles.readMoreContainer}>
//                           <TouchableOpacity
//                             onPress={() => setShowSubscriptionModal(true)}
//                           >
//                             <Text
//                               style={[
//                                 styles.smallBtnText,
//                                 {
//                                   color: colors.primary,
//                                   textDecorationLine: 'underline',
//                                 },
//                               ]}
//                             >
//                               {t('read_more_button')}
//                             </Text>
//                           </TouchableOpacity>
//                         </View>
//
//                       </>
//                     )}
//
//                     {/* {readingData?.reading?.love && (
//                         <>
//                           <Text style={[styles.readingTitle, { marginTop: 15 }]}>Love</Text>
//                           <Text style={styles.readingParagraph}>"{readingData.reading.love}"</Text>
//                         </>
//                       )}
//                         {readingData?.reading?.career && (
//                         <>
//                           <Text style={[styles.readingTitle, { marginTop: 15 }]}>career</Text>
//                           <Text style={styles.readingParagraph}>"{readingData.reading.career}"</Text>
//                         </>
//                       )} */}
//
//                   </View>
//
//                   <View style={styles.shareRow}>
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.smallBtn}
//                     >
//                       <Image
//                         source={require('../../../../../assets/icons/shareIcon.png')}
//                         style={styles.smallIcon}
//                         resizeMode="contain"
//                       />
//                       <Text style={styles.smallBtnText}>
//                         {t('share_button')}
//                       </Text>
//                     </GradientBox>

//                     {/* <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//       <Image source={require('../../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//       <Text style={styles.smallBtnText}>Save</Text></GradientBox> */}
//                     <TouchableOpacity
//                       activeOpacity={0.7}
//                       onPress={handleSaveReading}
//                       disabled={isSavingLoading}
//                     >
//                       <GradientBox
//                         colors={[colors.black, colors.bgBox]}
//                         style={styles.smallBtn}
//                       >
//                         {isSavingLoading ? (
//                           <ActivityIndicator color="#fff" size="small" />
//                         ) : (
//                           <>
//                             <Image
//                               source={require('../../../../../assets/icons/saveIcon.png')}
//                               style={styles.smallIcon}
//                               resizeMode="contain"
//                             />
//                             <Text style={styles.smallBtnText}>
//                               {t('save_button')}
//                             </Text>
//                           </>
//                         )}
//                       </GradientBox>
//                     </TouchableOpacity>
//                   </View>
//
//                   <TouchableOpacity
//                     style={{ marginTop: 40, alignItems: 'center' }}
//                     onPress={() => setShowSubscriptionModal(true)}
//                   >
//                     <View style={styles.buttonBorder}>
//                       <GradientBox
//                         colors={[colors.black, colors.bgBox]}
//                         style={[styles.revealBtnGrad, { borderRadius: 60 }]}
//                       >
//                         <Text style={styles.revealBtnText}>
//                           {t('get_premium_button')}
//                         </Text>
//                       </GradientBox>
//                     </View>
//                   </TouchableOpacity>
//
//                 </ScrollView>
//               </View>
//             </>
//           ) : (
//             <>
//
//               <View style={styles.topContentContainer}>
//                                             {renderHeader()}
//
//                 <View style={styles.content}>
//
//                   <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                     {t('tarot_focus_question_title')}
//                   </Text>
//
//                   <Text style={[styles.paragraph, { color: colors.white }]}>
//                     {t('tarot_focus_question_subtitle')}
//                   </Text>
//
//                 </View>
//
//                 {selectedCards.length > 0 && (
//                   <View style={styles.selectedArea}>
//
//                     <ScrollView
//                       ref={selectedCardsScrollViewRef}
//                       contentContainerStyle={styles.selectedScroll}
//                     >
//
//                       {selectedCards
//                         .reduce((rows: DeckCard[][], card, index) => {
//                           if (index % 3 === 0) rows.push([card]);
//                           else rows[rows.length - 1].push(card);
//                           return rows;
//                         }, [])
//                         .map((row, rowIndex) => (
//                           <View key={rowIndex} style={styles.selectedRow}>
//
//                             {row.map(card => (
//                               <View key={card._id} style={styles.box}>
//                                 <Image
//                                   source={card.cardBackImg}
//                                   style={styles.boxImg}
//                                 />
//                                 <TouchableOpacity
//                                   onPress={() => handleRemove(card)}
//                                   style={styles.removeBtn}
//                                 >
//                                   <Image
//                                     source={require('../../../../../assets/icons/closeIcon.png')}
//                                     style={styles.removeIcon}
//                                   />
//                                 </TouchableOpacity>
//                               </View>
//                             ))}
//
//                             {row.length < 3 &&
//                               [...Array(3 - row.length)].map((_, i) => (
//                                 <View
//                                   key={`p-initial-${rowIndex}-${i}`}
//                                   style={[styles.box, { opacity: 0 }]}
//                                 />
//                               ))}
//
//                           </View>
//                         ))}
//
//                     </ScrollView>
//
//                   </View>
//                 )}
//
//                 {selectedCards.length > 0 && (
//                   <View style={styles.revealBtnWrap}>
//
//                     <TouchableOpacity
//                       onPress={handleStartRevealFlow}
//                       activeOpacity={0.9}
//                     >
//
//                       <View style={styles.buttonBorder}>
//                         <GradientBox
//                           colors={[colors.black, colors.bgBox]}
//                           style={styles.revealBtnGrad}
//                         >
//                           <Text style={styles.revealBtnText}>
//                             {t('tarot_start_revealing_button')}
//                           </Text>
//                         </GradientBox>
//                       </View>
//
//                     </TouchableOpacity>
//
//                   </View>
//                 )}
//
//               </View>
//
//               <View style={styles.deckWrap}>
//
//                 {isDeckLoading ? (
//                   <ActivityIndicator size="large" color={colors.primary} />
//                 ) : (
//                   availableDeck.map(card => (
//                     <ArcCard
//                       key={card._id}
//                       index={availableDeck.indexOf(card)}
//                       card={card}
//                       progress={progress}
//                       maxIndex={maxIndex}
//                       onSelect={handleSelect}
//                     />
//                   ))
//                 )}
//
//                 {!isDeckLoading && (
//                   <Text style={styles.hint}>
//                     {t('tarot_tap_to_select_hint')}
//                   </Text>
//                 )}
//
//               </View>
//
//             </>
//           )}
//
//           <SubscriptionPlanModal
//             isVisible={showSubscriptionModal}
//             onClose={() => setShowSubscriptionModal(false)}
//             onConfirm={plan => {
//               console.log('Selected:', plan);
//               setShowSubscriptionModal(false);
//             }}
//           />
//
//         </SafeAreaView>
//
//       </ImageBackground>
//
//     </GestureHandlerRootView>
//   );
// };

// function ArcCard({
//   card,
//   index,
//   progress,
//   maxIndex,
//   onSelect,
// }: {
//   card: DeckCard;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: DeckCard) => void;
// }) {
//   const start = useSharedValue(0);
//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const angleDeg = Math.max(
//       -MAX_VISIBLE_DEG,
//       Math.min(MAX_VISIBLE_DEG, rel * STEP_DEG),
//     );
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;
//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = 1 - 0.1 * t;
//     return {
//       position: 'absolute',
//       left: x,
//       top: y,
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [{ rotate: `${angleDeg}deg` }, { scale: baseScale }],
//     };
//   });
//   const deckPan = Gesture.Pan()
//     .onStart(() => {
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       progress.value = wClamp(
//         start.value - e.translationX / ITEM_STRIDE,
//         0,
//         maxIndex,
//       );
//     })
//     .onEnd(e => {
//       // ENHANCEMENT: Inertia ke liye withDecay use karein
//       progress.value = withDecay(
//         {
//           velocity: -e.velocityX / ITEM_STRIDE, // Velocity ko use karein
//           clamp: [0, maxIndex], // Ensure it stops at the ends
//           rubberBandEffect: true,
//           deceleration: 0.997,
//         },
//         () => {
//           // Jab decay khatam ho to nearest card par snap karein
//           progress.value = withTiming(wRound(progress.value));
//         },
//       );
//     });
//   const tap = Gesture.Tap().onEnd(() => {
//     runOnJS(onSelect)(card);
//   });
//   const composed = Gesture.Simultaneous(deckPan, tap);
//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.cardBackImg} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// export default TarotCardDetailScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   topContentContainer: {
//     height: '70%',
//     justifyContent: 'flex-start',
//   },
//   deckWrap: {
//     height: '30%',
//     marginTop: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
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
//   content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
//   focusTitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   selectedArea: {
//     flex: 1,
//     minHeight: 190,
//   },
//   selectedScroll: { paddingHorizontal: 10, paddingBottom: 10 },
//   selectedRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   box: {
//     width: (SCREEN_WIDTH - 60) / 3,
//     height: 180,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13,
//     padding: 2,
//   },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     marginTop: 'auto',
//   },
//   revealBtnGrad: {
//     height: 52,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     borderRadius: 60,
//   },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   hint: {
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//     marginTop: 70,
//     position: 'absolute',
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   readingCardsContainer: {
//     maxHeight: 380,
//     marginTop: 10,
//   },
//   readingContentContainer: {
//     paddingHorizontal: 16,
//     marginTop: 12,
//   },
//   readingTitle: {
//     color: '#CEA16A',
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 18,
//     marginBottom: 8,
//     // --- MODIFIED: Centered the title as it's now on its own line ---
//     textAlign: 'center',
//   },
//   readingParagraph: {
//     color: '#FFFFFF',
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 15,
//     textAlign: 'center',
//     lineHeight: 22,
//     fontStyle: 'italic',
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
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     borderWidth: 1.1,
//     borderColor: '#D9B699',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   readMoreBtn: {
//     height: 40,
//     borderRadius: 20,
//     paddingHorizontal: 20,
//     borderWidth: 1.1,
//     borderColor: '#D9B699',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // --- MODIFIED: This new style aligns the "Read More" button correctly ---
//   readMoreContainer: {
//     alignItems: 'flex-end',
//     marginTop: 12,
//     paddingHorizontal: 5,
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
//   footer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   buttonBorder: {
//     borderColor: '#D9B699',
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden',
//   },
//   video: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   fullscreenCenter: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   revealGridContainer: {
//     flex: 1,
//     paddingBottom: 100,
//   },
// });

// import React, { useEffect, useMemo, useState, useRef } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';
// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../../navigation/routeTypes';
// import Tts from 'react-native-tts';
// import Video from 'react-native-video';
// import { useTarotCardStore } from '../../../../../store/useTarotCardStore';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type TarotCardFromAPI = {
//   _id: string;
//   card_image: { url: string; key: string };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// };
// type DeckCard = TarotCardFromAPI & {
//   cardBackImg: ImageSourcePropType;
// };

// // This type is defined here, at the top level of the file
// type TarotCardDetailRouteProp = RouteProp<AppStackParamList, 'TarotCardDetail'>;

// // --- Tunables and Helpers ---
// const DECK_AREA_HEIGHT = SCREEN_HEIGHT * 0.4;
// const CARD_W = 96;
// const CARD_H = 170;
// const ARC_Y_TOP = DECK_AREA_HEIGHT * 0.15;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;
// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;
// const ITEM_STRIDE = 65;
// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const route = useRoute<TarotCardDetailRouteProp>();
//   const { userQuestion } = route.params;
//   const {
//     cards: apiCards,
//     isLoading: isDeckLoading,
//     fetchTarotCards,
//     generateReading,
//     readingData,
//     isReadingLoading,
//     saveReading, // <-- Add this
//     isSavingLoading, // <-- And this
//   } = useTarotCardStore();

//   const [fullDeck, setFullDeck] = useState<DeckCard[]>([]);
//   const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
//   const [showVideo, setShowVideo] = useState(false);
//   const [showReading, setShowReading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [showRevealGrid, setShowRevealGrid] = useState(false);

//   const selectedCardsScrollViewRef = useRef<ScrollView>(null);

//   const handleSaveReading = async () => {
//     // Agar pehle se save ho raha hai to kuch na karein
//     if (isSavingLoading) return;

//     await saveReading();
//     // Success/Error alert store khud handle kar lega
//   };
//   const availableDeck = useMemo(() => {
//     const selectedIds = new Set(selectedCards.map(c => c._id));
//     return fullDeck.filter(card => !selectedIds.has(card._id));
//   }, [fullDeck, selectedCards]);

//   const maxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//   const progress = useSharedValue(0);
//   useEffect(() => {
//     fetchTarotCards();
//   }, [fetchTarotCards]);

//   useEffect(() => {
//     if (apiCards.length > 0) {
//       const cardBackImg = require('../../../../../assets/images/deskCard.png');
//       const transformedDeck = apiCards.map(card => ({ ...card, cardBackImg }));
//       setFullDeck(transformedDeck);
//       progress.value = Math.floor(transformedDeck.length / 2);
//     }
//   }, [apiCards]);
//   useEffect(() => {
//     const newMaxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//     if (progress.value > newMaxIndex) {
//       progress.value = withTiming(newMaxIndex);
//     }
//   }, [availableDeck.length, progress]);

//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//     Tts.setDefaultRate(0.4, true);
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
//   useEffect(() => {
//     if (selectedCards.length > 0) {
//       const timer = setTimeout(() => {
//         selectedCardsScrollViewRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [selectedCards.length]);

//   const onPressPlayToggle = async () => {
//     if (!readingData?.reading) return;
//     const textToSpeak = `Introduction. ${readingData.reading.introduction}. Love . ${readingData.reading.love} Career . ${readingData.reading.career}`;

//     if (isSpeaking) {
//       await Tts.stop();
//     } else {
//       await Tts.stop();
//       Tts.speak(textToSpeak);
//     }
//   };

//   const handleSelect = (card: DeckCard) => {
//     setSelectedCards(prev => [...prev, card]);
//     triggerHaptic();
//   };
//   const handleRemove = (cardToRemove: DeckCard) => {
//     setSelectedCards(prev =>
//       prev.filter(card => card._id !== cardToRemove._id),
//     );
//     triggerHaptic();
//   };
//   const handleStartRevealFlow = () => {
//     setShowVideo(true);
//   };

//   const handleRevealMeaning = async () => {
//     // FIX 4: Add a check for userQuestion before calling the API
//     if (isReadingLoading || selectedCards.length === 0 || !userQuestion) return;

//     const card_ids = selectedCards.map(card => card._id);

//     // FIX 5: Pass the userQuestion as the second argument to the function
//     const result = await generateReading(card_ids, userQuestion);

//     if (result) {
//       setShowRevealGrid(false);
//       setShowReading(true);
//     }
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity
//         onPress={() => navigation.goBack()}
//         style={styles.backBtn}
//       >
//         <Image
//           source={require('../../../../../assets/icons/backIcon.png')}
//           style={[styles.backIcon, { tintColor: colors.white }]}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>
//       <View style={styles.headerTitleWrap} pointerEvents="none">
//         <Text
//           numberOfLines={1}
//           ellipsizeMode="tail"
//           style={[styles.headerTitle, { color: colors.white }]}
//         >
//           Tarot Reader
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//
//       <ImageBackground
//         source={require('../../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//
//         <SafeAreaView style={styles.container}>
//
//           <StatusBar
//             barStyle="light-content"
//             translucent
//             backgroundColor="transparent"
//           />
//
//           {showVideo ? (
//             <View style={styles.fullscreenCenter}>
//               <Video
//                 source={require('../../../../../assets/videos/onboardingVideo2.mp4')}
//                 style={styles.video}
//                 resizeMode="cover"
//                 repeat={false}
//                 paused={false}
//               />
//               <View style={styles.footer}>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setShowVideo(false);
//                     setShowRevealGrid(true);
//                   }}
//                   activeOpacity={0.9}
//                 >
//                   <View style={styles.buttonBorder}>
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.revealBtnGrad}
//                     >
//                       <Text style={styles.revealBtnText}>Continue</Text>
//                     </GradientBox>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : showRevealGrid ? (
//             <>
//               <View style={{ flex: 1 }}>
//                 {renderHeader()}
//                 <View style={styles.content}>
//                   <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                     Your Cards
//                   </Text>
//                   <Text style={[styles.paragraph, { color: colors.white }]}>
//                     Discover the deeper meaning behind the cards.
//                   </Text>
//                 </View>
//                 <View style={styles.revealGridContainer}>
//                   <ScrollView contentContainerStyle={styles.selectedScroll}>
//
//                     {selectedCards
//                       .reduce((rows: DeckCard[][], card, index) => {
//                         if (index % 3 === 0) rows.push([card]);
//                         else rows[rows.length - 1].push(card);
//                         return rows;
//                       }, [])
//                       .map((row, rowIndex) => (
//                         <View key={rowIndex} style={styles.selectedRow}>
//                           {row.map(card => (
//                             <View key={card._id} style={styles.box}>
//                               <Image
//                                 source={{ uri: card.card_image.url }}
//                                 style={styles.boxImg}
//                               />
//                             </View>
//                           ))}
//                           {row.length < 3 &&
//                             [...Array(3 - row.length)].map((_, i) => (
//                               <View
//                                 key={`p-grid-${rowIndex}-${i}`}
//                                 style={[styles.box, { opacity: 0 }]}
//                               />
//                             ))}
//                         </View>
//                       ))}
//
//                   </ScrollView>
//                 </View>
//
//               </View>
//
//               <View style={styles.footer}>
//
//                 <TouchableOpacity
//                   onPress={handleRevealMeaning}
//                   activeOpacity={0.9}
//                   disabled={isReadingLoading}
//                 >
//
//                   <View style={styles.buttonBorder}>
//
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.revealBtnGrad}
//                     >
//
//                       {isReadingLoading ? (
//                         <ActivityIndicator color="#fff" />
//                       ) : (
//                         <Text style={styles.revealBtnText}>Reveal Meaning</Text>
//                       )}
//
//                     </GradientBox>
//
//                   </View>
//
//                 </TouchableOpacity>
//
//               </View>
//             </>
//           ) : showReading ? (
//             <>
//               <View style={{ flex: 1 }}>
//                 {renderHeader()}
//                 <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
//                   <View style={styles.content}>
//                     <Text
//                       style={[styles.focusTitle, { color: colors.primary }]}
//                     >
//                       Your Reading
//                     </Text>
//                   </View>
//
//                   <View style={styles.readingCardsContainer}>
//
//                     <ScrollView nestedScrollEnabled={true}>
//
//                       {readingData?.selected_cards
//                         .reduce((rows: any[][], card, index) => {
//                           if (index % 3 === 0) rows.push([card]);
//                           else rows[rows.length - 1].push(card);
//                           return rows;
//                         }, [])
//                         .map((row, rowIndex) => (
//                           <View key={rowIndex} style={styles.selectedRow}>
//
//                             {row.map(card => (
//                               <View key={card.card_id} style={styles.box}>
//                                 <Image
//                                   source={{ uri: card.image.url }}
//                                   style={styles.boxImg}
//                                 />
//                               </View>
//                             ))}
//
//                             {row.length < 3 &&
//                               [...Array(3 - row.length)].map((_, i) => (
//                                 <View
//                                   key={`p-reading-${rowIndex}-${i}`}
//                                   style={[styles.box, { opacity: 0 }]}
//                                 />
//                               ))}
//
//                           </View>
//                         ))}
//
//                     </ScrollView>
//
//                   </View>
//
//                   <View style={{ alignItems: 'center', marginTop: 10 }}>
//                     <TouchableOpacity
//                       onPress={onPressPlayToggle}
//                       activeOpacity={0.7}
//                     >
//                       <Image
//                         source={
//                           isSpeaking
//                             ? require('../../../../../assets/icons/pauseIcon.png')
//                             : require('../../../../../assets/icons/playIcon.png')
//                         }
//                         style={{ width: 40, height: 40 }}
//                         resizeMode="contain"
//                       />
//                     </TouchableOpacity>
//                   </View>
//
//                   <View style={styles.readingContentContainer}>
//
//                     {readingData?.reading?.introduction && (
//                       <>
//                         {/*                           <Text style={styles.readingTitle}>Introduction</Text> */}
//
//                         <Text style={styles.readingParagraph}>
//                           "{readingData.reading.introduction}"
//                         </Text>
//                         {/* --- MODIFIED: Button is now after the paragraph and aligned right --- */}
//                         <View style={styles.readMoreContainer}>
//                           <TouchableOpacity
//                             onPress={() => setShowSubscriptionModal(true)}
//                           >
//                             <Text
//                               style={[
//                                 styles.smallBtnText,
//                                 {
//                                   color: colors.primary,
//                                   textDecorationLine: 'underline',
//                                 },
//                               ]}
//                             >
//                               Read More
//                             </Text>
//                           </TouchableOpacity>
//                         </View>
//
//                       </>
//                     )}
//
//                     {/* {readingData?.reading?.love && (
//                         <>
//                           <Text style={[styles.readingTitle, { marginTop: 15 }]}>Love</Text>
//                           <Text style={styles.readingParagraph}>"{readingData.reading.love}"</Text>
//                         </>
//                       )}
//                         {readingData?.reading?.career && (
//                         <>
//                           <Text style={[styles.readingTitle, { marginTop: 15 }]}>career</Text>
//                           <Text style={styles.readingParagraph}>"{readingData.reading.career}"</Text>
//                         </>
//                       )} */}
//
//                   </View>
//
//                   <View style={styles.shareRow}>
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={styles.smallBtn}
//                     >
//                       <Image
//                         source={require('../../../../../assets/icons/shareIcon.png')}
//                         style={styles.smallIcon}
//                         resizeMode="contain"
//                       />
//                       <Text style={styles.smallBtnText}>Share</Text>
//                     </GradientBox>

//                     {/* <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//       <Image source={require('../../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//       <Text style={styles.smallBtnText}>Save</Text></GradientBox> */}
//                     <TouchableOpacity
//                       activeOpacity={0.7}
//                       onPress={handleSaveReading}
//                       disabled={isSavingLoading}
//                     >
//                       <GradientBox
//                         colors={[colors.black, colors.bgBox]}
//                         style={styles.smallBtn}
//                       >
//                         {isSavingLoading ? (
//                           <ActivityIndicator color="#fff" size="small" />
//                         ) : (
//                           <>
//                             <Image
//                               source={require('../../../../../assets/icons/saveIcon.png')}
//                               style={styles.smallIcon}
//                               resizeMode="contain"
//                             />
//                             <Text style={styles.smallBtnText}>Save</Text>
//                           </>
//                         )}
//                       </GradientBox>
//                     </TouchableOpacity>
//                   </View>
//
//                   <TouchableOpacity
//                     style={{ marginTop: 40, alignItems: 'center' }}
//                     onPress={() => setShowSubscriptionModal(true)}
//                   >
//                     <View style={styles.buttonBorder}>
//                       <GradientBox
//                         colors={[colors.black, colors.bgBox]}
//                         style={[styles.revealBtnGrad, { borderRadius: 60 }]}
//                       >
//                         <Text style={styles.revealBtnText}>
//                           Get Premium For Full Reading
//                         </Text>
//                       </GradientBox>
//                     </View>
//                   </TouchableOpacity>
//
//                 </ScrollView>
//               </View>
//             </>
//           ) : (
//             <>
//
//               <View style={styles.topContentContainer}>
//                                             {renderHeader()}
//
//                 <View style={styles.content}>
//
//                   <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                     Focus on Your Question
//                   </Text>
//
//                   <Text style={[styles.paragraph, { color: colors.white }]}>
//                     Tap on cards to select them.
//                   </Text>
//
//                 </View>
//
//                 {selectedCards.length > 0 && (
//                   <View style={styles.selectedArea}>
//
//                     <ScrollView
//                       ref={selectedCardsScrollViewRef}
//                       contentContainerStyle={styles.selectedScroll}
//                     >
//
//                       {selectedCards
//                         .reduce((rows: DeckCard[][], card, index) => {
//                           if (index % 3 === 0) rows.push([card]);
//                           else rows[rows.length - 1].push(card);
//                           return rows;
//                         }, [])
//                         .map((row, rowIndex) => (
//                           <View key={rowIndex} style={styles.selectedRow}>
//
//                             {row.map(card => (
//                               <View key={card._id} style={styles.box}>
//                                 <Image
//                                   source={card.cardBackImg}
//                                   style={styles.boxImg}
//                                 />
//                                 <TouchableOpacity
//                                   onPress={() => handleRemove(card)}
//                                   style={styles.removeBtn}
//                                 >
//                                   <Image
//                                     source={require('../../../../../assets/icons/closeIcon.png')}
//                                     style={styles.removeIcon}
//                                   />
//                                 </TouchableOpacity>
//                               </View>
//                             ))}
//
//                             {row.length < 3 &&
//                               [...Array(3 - row.length)].map((_, i) => (
//                                 <View
//                                   key={`p-initial-${rowIndex}-${i}`}
//                                   style={[styles.box, { opacity: 0 }]}
//                                 />
//                               ))}
//
//                           </View>
//                         ))}
//
//                     </ScrollView>
//
//                   </View>
//                 )}
//
//                 {selectedCards.length > 0 && (
//                   <View style={styles.revealBtnWrap}>
//
//                     <TouchableOpacity
//                       onPress={handleStartRevealFlow}
//                       activeOpacity={0.9}
//                     >
//
//                       <View style={styles.buttonBorder}>
//                         <GradientBox
//                           colors={[colors.black, colors.bgBox]}
//                           style={styles.revealBtnGrad}
//                         >
//                           <Text style={styles.revealBtnText}>
//                             Start Revealing
//                           </Text>
//                         </GradientBox>
//                       </View>
//
//                     </TouchableOpacity>
//
//                   </View>
//                 )}
//
//               </View>
//
//               <View style={styles.deckWrap}>
//
//                 {isDeckLoading ? (
//                   <ActivityIndicator size="large" color={colors.primary} />
//                 ) : (
//                   availableDeck.map(card => (
//                     <ArcCard
//                       key={card._id}
//                       index={availableDeck.indexOf(card)}
//                       card={card}
//                       progress={progress}
//                       maxIndex={maxIndex}
//                       onSelect={handleSelect}
//                     />
//                   ))
//                 )}
//
//                 {!isDeckLoading && (
//                   <Text style={styles.hint}>tap to select</Text>
//                 )}
//
//               </View>
//
//             </>
//           )}
//
//           <SubscriptionPlanModal
//             isVisible={showSubscriptionModal}
//             onClose={() => setShowSubscriptionModal(false)}
//             onConfirm={plan => {
//               console.log('Selected:', plan);
//               setShowSubscriptionModal(false);
//             }}
//           />
//
//         </SafeAreaView>
//
//       </ImageBackground>
//
//     </GestureHandlerRootView>
//   );
// };

// function ArcCard({
//   card,
//   index,
//   progress,
//   maxIndex,
//   onSelect,
// }: {
//   card: DeckCard;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: DeckCard) => void;
// }) {
//   const start = useSharedValue(0);
//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const angleDeg = Math.max(
//       -MAX_VISIBLE_DEG,
//       Math.min(MAX_VISIBLE_DEG, rel * STEP_DEG),
//     );
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;
//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = 1 - 0.1 * t;
//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 150 }),
//       top: withTiming(y, { duration: 150 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [{ rotate: `${angleDeg}deg` }, { scale: baseScale }],
//     };
//   });
//   const deckPan = Gesture.Pan()
//     .onStart(() => {
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       progress.value = wClamp(
//         start.value - e.translationX / ITEM_STRIDE,
//         0,
//         maxIndex,
//       );
//     })
//     .onEnd(() => {
//       progress.value = withTiming(wRound(progress.value));
//     });
//   const tap = Gesture.Tap().onEnd(() => {
//     runOnJS(onSelect)(card);
//   });
//   const composed = Gesture.Simultaneous(deckPan, tap);
//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.cardBackImg} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// export default TarotCardDetailScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   topContentContainer: {
//     height: '70%',
//     justifyContent: 'flex-start',
//   },
//   deckWrap: {
//     height: '30%',
//     marginTop: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
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
//   content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
//   focusTitle: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   selectedArea: {
//     flex: 1,
//     minHeight: 190,
//   },
//   selectedScroll: { paddingHorizontal: 10, paddingBottom: 10 },
//   selectedRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   box: {
//     width: (SCREEN_WIDTH - 60) / 3,
//     height: 180,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13,
//     padding: 2,
//   },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     marginTop: 'auto',
//   },
//   revealBtnGrad: {
//     height: 52,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     borderRadius: 60,
//   },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   hint: {
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//     marginTop: 70,
//     position: 'absolute',
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   readingCardsContainer: {
//     maxHeight: 380,
//     marginTop: 10,
//   },
//   readingContentContainer: {
//     paddingHorizontal: 16,
//     marginTop: 12,
//   },
//   readingTitle: {
//     color: '#CEA16A',
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 18,
//     marginBottom: 8,
//     // --- MODIFIED: Centered the title as it's now on its own line ---
//     textAlign: 'center',
//   },
//   readingParagraph: {
//     color: '#FFFFFF',
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 15,
//     textAlign: 'center',
//     lineHeight: 22,
//     fontStyle: 'italic',
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
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     borderWidth: 1.1,
//     borderColor: '#D9B699',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   readMoreBtn: {
//     height: 40,
//     borderRadius: 20,
//     paddingHorizontal: 20,
//     borderWidth: 1.1,
//     borderColor: '#D9B699',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // --- MODIFIED: This new style aligns the "Read More" button correctly ---
//   readMoreContainer: {
//     alignItems: 'flex-end',
//     marginTop: 12,
//     paddingHorizontal: 5,
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
//   footer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   buttonBorder: {
//     borderColor: '#D9B699',
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden',
//   },
//   video: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   fullscreenCenter: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   revealGridContainer: {
//     flex: 1,
//     paddingBottom: 100,
//   },
// });

// import React, { useEffect, useMemo, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   Image,
//   Platform,
//   ImageSourcePropType,
//   Vibration,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
// import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';
// import Tts from 'react-native-tts';
// import Video from 'react-native-video';
// // --- MODIFIED: Import everything needed from the store ---
// import { useTarotCardStore } from '../../../../store/useTarrotCardStore';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type TarotCardFromAPI = {
//   _id: string;
//   card_image: { url: string; key: string };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// };
// type DeckCard = TarotCardFromAPI & {
//   cardBackImg: ImageSourcePropType;
// };

// // --- Tunables and Helpers ---
// const DECK_AREA_HEIGHT = SCREEN_HEIGHT * 0.4;
// const CARD_W = 96;
// const CARD_H = 170;
// const ARC_Y_TOP = DECK_AREA_HEIGHT * 0.15;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;
// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;
// const ITEM_STRIDE = 65;
// function triggerHaptic() { if (Platform.OS === 'android') { Vibration.vibrate([0, 35, 40, 35]); } else { Vibration.vibrate(); } }
// const wClamp = (v: number, min: number, max: number) => { 'worklet'; return v < min ? min : v > max ? max : v; };
// const wRound = (v: number) => { 'worklet'; return Math.round(v); };

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//
//   // --- MODIFIED: Destructure all necessary state and actions from the store ---
//   const {
//     cards: apiCards,
//     isLoading: isDeckLoading,
//     fetchTarotCards,
//     generateReading,
//     readingData,
//     isReadingLoading
//   } = useTarotCardStore();

//   const [fullDeck, setFullDeck] = useState<DeckCard[]>([]);
//   const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
//
//   const [readingText, setReadingText] = useState('');
//   const [showVideo, setShowVideo] = useState(false);
//   const [showReading, setShowReading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
//   const [showRevealGrid, setShowRevealGrid] = useState(false);

//   const selectedCardsScrollViewRef = useRef<ScrollView>(null);

//   const availableDeck = useMemo(() => {
//     const selectedIds = new Set(selectedCards.map(c => c._id));
//     return fullDeck.filter(card => !selectedIds.has(card._id));
//   }, [fullDeck, selectedCards]);

//   const maxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//   const progress = useSharedValue(0);
//
//   useEffect(() => { fetchTarotCards(); }, [fetchTarotCards]);

//   useEffect(() => {
//     if (apiCards.length > 0) {
//       const cardBackImg = require('../../../../assets/images/deskCard.png');
//       const transformedDeck = apiCards.map(card => ({ ...card, cardBackImg }));
//       setFullDeck(transformedDeck);
//       progress.value = Math.floor(transformedDeck.length / 2);
//     }
//   }, [apiCards]);
//
//   useEffect(() => {
//     const newMaxIndex = availableDeck.length > 0 ? availableDeck.length - 1 : 0;
//     if (progress.value > newMaxIndex) {
//       progress.value = withTiming(newMaxIndex);
//     }
//   }, [availableDeck.length, progress]);
//
//   // --- MODIFIED: This effect now populates reading text from the API response ---
//   useEffect(() => {
//     if (readingData?.reading) {
//       const { introduction, love } = readingData.reading;
//       // Combine the parts of the reading into a single string for display and TTS
//       const fullText = `Introduction:\n${introduction}\n\nLove Reading:\n${love}`;
//       setReadingText(fullText);
//     }
//   }, [readingData]);

//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {}); Tts.setDefaultRate(0.4, true);
//     const subs = [ Tts.addEventListener('tts-start', () => setIsSpeaking(true)), Tts.addEventListener('tts-finish', () => setIsSpeaking(false)), Tts.addEventListener('tts-cancel', () => setIsSpeaking(false)), ];
//     return () => { subs.forEach(sub => (sub as any)?.remove?.()); Tts.stop(); };
//   }, []);
//
//   useEffect(() => {
//     if (selectedCards.length > 0) {
//       const timer = setTimeout(() => {
//         selectedCardsScrollViewRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//       return () => clearTimeout(timer);
//     }
//   }, [selectedCards.length]);

//   const onPressPlayToggle = async () => { if (!readingText.trim()) return; if (isSpeaking) { await Tts.stop(); } else { await Tts.stop(); Tts.speak(readingText); } };
//   const handleSelect = (card: DeckCard) => { setSelectedCards(prev => [...prev, card]); triggerHaptic(); };
//   const handleRemove = (cardToRemove: DeckCard) => { setSelectedCards(prev => prev.filter(card => card._id !== cardToRemove._id)); triggerHaptic(); };

//   // --- MODIFIED: Renamed to clarify its new purpose ---
//   const handleStartRevealFlow = () => {
//     // This just starts the video transition
//     setShowVideo(true);
//   };

//   // --- NEW: Handles the API call for generating the reading ---
//   const handleRevealMeaning = async () => {
//     if (isReadingLoading || selectedCards.length === 0) return;

//     const card_ids = selectedCards.map(card => card._id);
//     const result = await generateReading(card_ids);

//     // If the API call was successful, move to the reading screen
//     if (result) {
//         setShowRevealGrid(false);
//         setShowReading(true);
//     }
//     // Error alerts are handled inside the store
//   };

//   const renderHeader = () => (
//     <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Image source={require('../../../../assets/icons/backIcon.png')} style={[styles.backIcon, { tintColor: colors.white }]} resizeMode="contain" /></TouchableOpacity><View style={styles.headerTitleWrap} pointerEvents="none"><Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>Tarot Reader</Text></View></View>
//   );

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//         <ImageBackground source={require('../../../../assets/images/backgroundImage.png')} style={{ flex: 1 }} resizeMode="cover">
//             <SafeAreaView style={styles.container}>
//                 <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
//                 {showVideo ? (
//                     <View style={styles.fullscreenCenter}><Video source={require('../../../../assets/videos/onboardingVideo2.mp4')} style={styles.video} resizeMode="cover" repeat={false} paused={false} /><View style={styles.footer}><TouchableOpacity onPress={() => { setShowVideo(false); setShowRevealGrid(true); }} activeOpacity={0.9}><View style={styles.buttonBorder}><GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}><Text style={styles.revealBtnText}>Continue</Text></GradientBox></View></TouchableOpacity></View></View>
//                 ) : showRevealGrid ? (
//                     <><View style={{flex: 1}}>{renderHeader()}<View style={styles.content}><Text style={[styles.focusTitle, { color: colors.primary }]}>Your Cards</Text><Text style={[styles.paragraph, { color: colors.white }]}>Discover the deeper meaning behind the cards.</Text></View>
//                     <ScrollView contentContainerStyle={styles.selectedScroll} style={{ flex: 1 }}>
//                         {/* This screen still shows the originally selected cards before revealing */}
//                         {selectedCards.reduce((rows: DeckCard[][], card, index) => {if (index % 3 === 0) rows.push([card]); else rows[rows.length - 1].push(card); return rows;}, []).map((row, rowIndex) => (
//                             <View key={rowIndex} style={styles.selectedRow}>{row.map(card => (
//                                 <View key={card._id} style={styles.box}><Image source={{ uri: card.card_image.url }} style={styles.boxImg} /></View>))}{row.length < 3 && [...Array(3 - row.length)].map((_, i) => <View key={`p-grid-${rowIndex}-${i}`} style={[styles.box, { opacity: 0 }]} />)}</View>))}
//                     </ScrollView>
//                 </View>
//                 <View style={styles.footer}>
//                     {/* --- MODIFIED: This button now triggers the API call --- */}
//                     <TouchableOpacity onPress={handleRevealMeaning} activeOpacity={0.9} disabled={isReadingLoading}>
//                         <View style={styles.buttonBorder}>
//                             <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                                 {isReadingLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.revealBtnText}>Reveal Meaning</Text>}
//                             </GradientBox>
//                         </View>
//                     </TouchableOpacity>
//                 </View></>
//                 ) : showReading ? (
//                     <><View style={{flex: 1}}>{renderHeader()}<ScrollView contentContainerStyle={{ paddingBottom: 50 }}><View style={styles.content}><Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text></View>
//                     <View style={styles.readingCardsContainer}>
//                         <ScrollView nestedScrollEnabled={true}>
//                         {/* --- MODIFIED: Grid now uses data from the API response --- */}
//                         {readingData?.selected_cards.reduce((rows: any[][], card, index) => {
//                             if (index % 3 === 0) rows.push([card]);
//                             else rows[rows.length - 1].push(card);
//                             return rows;
//                         }, []).map((row, rowIndex) => (
//                             <View key={rowIndex} style={styles.selectedRow}>
//                                 {row.map(card => (
//                                     <View key={card.card_id} style={styles.box}>
//                                         <Image source={{ uri: card.image.url }} style={styles.boxImg} />
//                                     </View>
//                                 ))}
//                                 {row.length < 3 && [...Array(3 - row.length)].map((_, i) =>
//                                     <View key={`p-reading-${rowIndex}-${i}`} style={[styles.box, { opacity: 0 }]} />
//                                 )}
//                             </View>
//                         ))}
//                         </ScrollView>
//                     </View>
//                     <View style={{ alignItems: 'center', marginTop: 10 }}><TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}><Image source={isSpeaking ? require('../../../../assets/icons/pauseIcon.png') : require('../../../../assets/icons/playIcon.png')} style={{ width: 40, height: 40 }} resizeMode="contain" /></TouchableOpacity></View>
//                     <Text style={[styles.paragraph, { color: colors.white, marginTop: 12, paddingHorizontal: 8 }]}>{readingText}</Text>
//                     <View style={styles.shareRow}><GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}><Image source={require('../../../../assets/icons/shareIcon.png')} style={styles.smallIcon} resizeMode="contain" /><Text style={styles.smallBtnText}>Share</Text></GradientBox><GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}><Image source={require('../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" /><Text style={styles.smallBtnText}>Save</Text></GradientBox></View><TouchableOpacity style={{ marginTop: 40, alignItems: 'center' }} onPress={() => setShowSubscriptionModal(true)}><View style={styles.buttonBorder}><GradientBox colors={[colors.black, colors.bgBox]} style={[styles.revealBtnGrad, { borderRadius: 60 }]}><Text style={styles.revealBtnText}>Get Premium For Full Reading</Text></GradientBox></View></TouchableOpacity></ScrollView></View></>
//                 ) : (
//                     <>
//                         <View style={styles.topContentContainer}>
//                             {renderHeader()}
//                             <View style={styles.content}>
//                                 <Text style={[styles.focusTitle, { color: colors.primary }]}>Focus on Your Question</Text>
//                                 <Text style={[styles.paragraph, { color: colors.white }]}>Tap on cards to select them.</Text>
//                             </View>
//                             {selectedCards.length > 0 && (
//                             <View style={styles.selectedArea}>
//                                 <ScrollView ref={selectedCardsScrollViewRef} contentContainerStyle={styles.selectedScroll}>
//                                 {selectedCards.reduce((rows: DeckCard[][], card, index) => { if (index % 3 === 0) rows.push([card]); else rows[rows.length - 1].push(card); return rows; }, []).map((row, rowIndex) => (
//                                     <View key={rowIndex} style={styles.selectedRow}>
//                                         {row.map(card => (<View key={card._id} style={styles.box}><Image source={card.cardBackImg} style={styles.boxImg} /><TouchableOpacity onPress={() => handleRemove(card)} style={styles.removeBtn}><Image source={require('../../../../assets/icons/closeIcon.png')} style={styles.removeIcon} /></TouchableOpacity></View>))}
//                                         {row.length < 3 && [...Array(3 - row.length)].map((_, i) => <View key={`p-initial-${rowIndex}-${i}`} style={[styles.box, { opacity: 0 }]} />)}
//                                     </View>
//                                 ))}
//                                 </ScrollView>
//                             </View>
//                             )}
//                             {selectedCards.length > 0 && (
//                             <View style={styles.revealBtnWrap}>
//                                 <TouchableOpacity onPress={handleStartRevealFlow} activeOpacity={0.9}>
//                                 <View style={styles.buttonBorder}><GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}><Text style={styles.revealBtnText}>Start Revealing</Text></GradientBox></View>
//                                 </TouchableOpacity>
//                             </View>
//                             )}
//                         </View>
//                         <View style={styles.deckWrap}>
//                             {isDeckLoading ? (<ActivityIndicator size="large" color={colors.primary} />) : (
//                             availableDeck.map((card) => (
//                                 <ArcCard key={card._id} index={availableDeck.indexOf(card)} card={card} progress={progress} maxIndex={maxIndex} onSelect={handleSelect} />
//                             ))
//                             )}
//                             {!isDeckLoading && <Text style={styles.hint}>tap to select</Text>}
//                         </View>
//                     </>
//                 )}
//                 <SubscriptionPlanModal isVisible={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onConfirm={(plan) => { console.log('Selected:', plan); setShowSubscriptionModal(false); }} />
//             </SafeAreaView>
//         </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// function ArcCard({ card, index, progress, maxIndex, onSelect }: { card: DeckCard; index: number; progress: Animated.SharedValue<number>; maxIndex: number; onSelect: (c: DeckCard) => void; }) {
//     const start = useSharedValue(0);
//     const aStyle = useAnimatedStyle(() => { const rel = index - progress.value; const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rel * STEP_DEG)); const angleRad = (Math.PI / 180) * angleDeg; const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2; const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2; const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG); const baseScale = 1 - 0.18 * t; const opacity = 1 - 0.1 * t; return { position: 'absolute', left: withTiming(x, { duration: 150 }), top: withTiming(y, { duration: 150 }), width: CARD_W, height: CARD_H, opacity, transform: [{ rotate: `${angleDeg}deg` }, { scale: baseScale }], }; });
//     const deckPan = Gesture.Pan().onStart(() => { start.value = progress.value; }).onUpdate(e => { progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex); }).onEnd(() => { progress.value = withTiming(wRound(progress.value)); });
//     const tap = Gesture.Tap().onEnd(() => { runOnJS(onSelect)(card); });
//     const composed = Gesture.Simultaneous(deckPan, tap);
//     return (<GestureDetector gesture={composed}><Animated.View style={[aStyle, styles.cardShadow]}><Image source={card.cardBackImg} style={styles.cardImg} /></Animated.View></GestureDetector>);
// }

// export default TarotCardDetailScreen;

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     topContentContainer: {
//         height: '70%',
//         justifyContent: 'flex-start',
//     },
//     deckWrap: {
//         height: '30%',
//         marginTop:40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8, paddingHorizontal: 20 },
//     backBtn: { position: 'absolute', left: 20, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
//     backIcon: { width: 22, height: 22 },
//     headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//     headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
//     content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
//     focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
//     paragraph: { fontFamily: Fonts.aeonikRegular, fontSize: 14, textAlign: 'center', marginTop: 5, marginBottom: 8, lineHeight: 20 },
//     selectedArea: {
//         flex: 1,
//         minHeight: 190,
//     },
//     selectedScroll: { paddingHorizontal: 10, paddingBottom: 10 },
//     selectedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 },
//     box: { width: (SCREEN_WIDTH - 60) / 3, height: 180, borderWidth: 1, borderColor: '#CEA16A', borderRadius: 10, overflow: 'hidden' },
//     boxImg: { width: '100%', height: '100%' },
//     removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#0008', borderRadius: 13, padding: 2 },
//     removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//     revealBtnWrap: {
//       paddingHorizontal: 20,
//       paddingVertical: 15,
//       marginTop: 'auto',
//     },
//     revealBtnGrad: { height: 52, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 60 },
//     revealBtnText: { color: '#fff', fontSize: 16 },
//     hint: { color: '#fff', fontSize: 12, opacity: 0.95, marginTop: 70,position: 'absolute',  },
//     cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//     cardShadow: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, elevation: 8 },
//     readingCardsContainer: {
//         height: 380,
//         marginTop: 10,
//     },
//     shareRow: { marginTop: 16, width: '100%', flexDirection: 'row', gap: 12, justifyContent: 'center' },
//     smallBtn: { minWidth: 120, height: 46, borderRadius: 22, paddingHorizontal: 16, borderWidth: 1.1, borderColor: '#D9B699', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
//     smallIcon: { width: 15, height: 15, marginRight: 8, resizeMode: 'contain', tintColor: '#fff' },
//     smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14, color: '#fff' },
//     footer: {
//         position: 'absolute',
//         bottom: 40,
//         left: 20,
//         right: 20,
//     },
//     buttonBorder: {
//         borderColor: '#D9B699',
//         borderWidth: 1.5,
//         borderRadius: 60,
//         overflow: 'hidden',
//     },
//     video: {
//       ...StyleSheet.absoluteFillObject,
//     },
//     fullscreenCenter: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     }
// });

// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
//   ActivityIndicator, // --- ADDED ---
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
// import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';
// import Tts from 'react-native-tts';
// import Video from 'react-native-video';

// // --- CHANGE: Import the Tarot Card Store ---
// import { useTarotCardStore } from '../../../../store/useTarrotCardStore';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// // --- CHANGE: Define a new type for deck cards that includes all API data ---
// type TarotCardFromAPI = {
//   _id: string;
//   card_image: { url: string; key: string };
//   card_name: string;
//   card_description: string;
//   card_keywords: string[];
// };
// type DeckCard = TarotCardFromAPI & {
//   cardBackImg: ImageSourcePropType;
// };

// // ... (Tunables and Helpers are unchanged) ...
// const CARD_W = 96;
// const CARD_H = 170;
// const ARC_Y_TOP = SCREEN_HEIGHT * 0.26;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;
// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;
// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;
// const wClamp = (v: number, min: number, max: number) => { 'worklet'; return v < min ? min : v > max ? max : v; };
// const wRound = (v: number) => { 'worklet'; return Math.round(v); };
// function triggerHaptic() { if (Platform.OS === 'android') { Vibration.vibrate([0, 35, 40, 35]); } else { Vibration.vibrate(); } }
// function triggerHapticDelayed(ms = 120) { setTimeout(() => triggerHaptic(), ms); }
// // --- END: Tunables and Helpers ---

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   // --- CHANGE: Get data and functions from the store ---
//   const { cards: apiCards, isLoading: isDeckLoading, fetchTarotCards } = useTarotCardStore();

//   const [deck, setDeck] = useState<DeckCard[]>([]);
//   const [selectedCards, setSelectedCards] = useState<Array<DeckCard | null>>([null, null, null]);

//   // --- CHANGE: State for dynamic reading message ---
//   const [readingText, setReadingText] = useState('');

//   const [showVideo, setShowVideo] = useState(false);
//   const [revealStarted, setRevealStarted] = useState(false);
//   const [showReading, setShowReading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

//   const maxIndex = deck.length > 0 ? deck.length - 1 : 0;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   // --- CHANGE: Fetch cards from API on component mount ---
//   useEffect(() => {
//     fetchTarotCards();
//   }, [fetchTarotCards]);

//   // --- CHANGE: Populate deck with API data once it's fetched ---
//   useEffect(() => {
//     if (apiCards.length > 0) {
//       const cardBackImg = require('../../../../assets/images/deskCard.png');
//       const transformedDeck = apiCards.map(card => ({
//         ...card,
//         cardBackImg: cardBackImg,
//       }));
//       setDeck(transformedDeck);
//       progress.value = Math.floor(transformedDeck.length / 2); // Reset progress
//     }
//   }, [apiCards]);

//   // --- CHANGE: Generate dynamic reading text when cards are revealed ---
//   useEffect(() => {
//     if (revealStarted && filledCount === 3) {
//       const past = selectedCards[0]?.card_description || '';
//       const present = selectedCards[1]?.card_description || '';
//       const future = selectedCards[2]?.card_description || '';
//       const fullReading = `In the past: ${past}\n\nIn the present: ${present}\n\nFor the future: ${future}`;
//       setReadingText(fullReading);
//     }
//   }, [revealStarted, selectedCards, filledCount]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);

//   // TTS setup remains the same
//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//     Tts.setDefaultRate(0.4, true);
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

//   const onPressPlayToggle = async () => {
//     if (!readingText.trim()) return;
//     if (isSpeaking) {
//       await Tts.stop();
//     } else {
//       await Tts.stop();
//       Tts.speak(readingText);
//     }
//   };

//   const handleSelect = (card: DeckCard, slotIndex?: number) => {
//     if (revealStarted || showVideo) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     if (revealStarted || showVideo) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   const onPressReveal = () => {
//     if (!revealStarted) {
//       setShowVideo(true);
//     } else {
//       setShowReading(true);
//     }
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground source={require('../../../../assets/images/backgroundImage.png')} style={{ flex: 1 }} resizeMode="cover">
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {showVideo ? (
//             <View style={{ flex: 1, alignItems:'center' }}>
//               <Video source={require('../../../../assets/videos/onboardingVideo2.mp4')} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} resizeMode="cover" repeat={false} paused={false} />
//               <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20 }}>
//                 <TouchableOpacity onPress={() => { setShowVideo(false); setRevealStarted(true); }} activeOpacity={0.9}>
//                   <View style={{ borderColor: colors.primary, borderWidth: 1.5, borderRadius: 60, overflow: 'hidden' }}>
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                       <Text style={styles.revealBtnText}>Continue</Text>
//                     </GradientBox>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : (
//             <>
//               <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                   <Image source={require('../../../../assets/icons/backIcon.png')} style={[styles.backIcon, { tintColor: colors.white }]} resizeMode="contain" />
//                 </TouchableOpacity>
//                 <View style={styles.headerTitleWrap} pointerEvents="none">
//                   <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                     Tarot Reader
//                   </Text>
//                 </View>
//               </View>

//               {!showReading ? (
//                 <>
//                   <View style={styles.content}>
//                     <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                       {revealStarted ? 'Your Cards' : 'Focus on Your Question'}
//                     </Text>
//                     <Text style={[styles.paragraph, { color: colors.white }]}>
//                       {revealStarted ? 'Discover the deeper meaning behind the cards.' : 'Take a deep breath and select three cards.'}
//                     </Text>
//                   </View>
//                   <View style={styles.selectedRow}>
//                     {[0, 1, 2].map(i => (
//                       <View key={i} style={styles.box}>
//                         {selectedCards[i] && (
//                           <>
//                             {/* --- CHANGE: Source is now dynamic for reveal --- */}
//                             <Image
//                               source={
//                                 revealStarted
//                                   ? { uri: selectedCards[i]!.card_image.url }
//                                   : selectedCards[i]!.cardBackImg
//                               }
//                               style={styles.boxImg}
//                             />
//                             {!revealStarted && (
//                               <TouchableOpacity onPress={() => handleRemove(i)} style={styles.removeBtn}>
//                                 <Image source={require('../../../../assets/icons/closeIcon.png')} style={styles.removeIcon} />
//                               </TouchableOpacity>
//                             )}
//                           </>
//                         )}
//                       </View>
//                     ))}
//                   </View>
//                   {isLocked && (
//                     <TouchableOpacity style={styles.revealBtnWrap} onPress={onPressReveal} activeOpacity={0.9}>
//                        <View style={{ borderColor: colors.primary, borderWidth: 1.5, borderRadius: 60, overflow: 'hidden' }}>
//                         <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                           <Text style={styles.revealBtnText}>{revealStarted ? 'Reveal Meaning' : 'Start Revealing'}</Text>
//                         </GradientBox>
//                       </View>
//                     </TouchableOpacity>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.content}>
//                     <Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text>
//                   </View>
//                   <View style={styles.selectedRow}>
//                     {[0, 1, 2].map(i => (
//                       <View key={i} style={styles.box}>
//                         <Image source={{ uri: selectedCards[i]!.card_image.url }} style={styles.boxImg} />
//                       </View>
//                     ))}
//                   </View>
//                   <View style={{ alignItems: 'center', marginTop: 10 }}>
//                     <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
//                       <Image source={isSpeaking ? require('../../../../assets/icons/pauseIcon.png') : require('../../../../assets/icons/playIcon.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
//                     </TouchableOpacity>
//                   </View>
//                   {/* --- CHANGE: Use dynamic reading text --- */}
//                   <Text style={[styles.paragraph, { color: colors.white, marginTop: 12, paddingHorizontal: 8 }]}>
//                     {readingText}
//                   </Text>
//                   <View style={styles.shareRow}>
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                       <Image source={require('../../../../assets/icons/shareIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                       <Text style={styles.smallBtnText}>Share</Text>
//                     </GradientBox>
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                       <Image source={require('../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                       <Text style={styles.smallBtnText}>Save</Text>
//                     </GradientBox>
//                   </View>
//                   <TouchableOpacity style={{ marginTop: 40 }} onPress={() => setShowSubscriptionModal(true)}>
//                     <View style={{ borderColor: colors.primary, borderWidth: 1.5, borderRadius: 60, overflow: 'hidden' }}>
//                       <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.revealBtnGrad, { borderRadius: 60 }]}>
//                         <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
//                       </GradientBox>
//                     </View>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </>
//           )}

//           {!showReading && !showVideo && (
//             <View style={styles.deckWrap}>
//               {isDeckLoading ? (
//                 <ActivityIndicator size="large" color={colors.primary} />
//               ) : (
//                 deck.map((card, i) => (
//                   <ArcCard key={card._id} card={card} index={i} progress={progress} maxIndex={maxIndex} onSelect={handleSelect} lockedSV={lockedSV} revealStarted={revealStarted} />
//                 ))
//               )}
//               <Text style={styles.hint}>drag to move</Text>
//             </View>
//           )}

//           <SubscriptionPlanModal isVisible={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onConfirm={(plan) => { setShowSubscriptionModal(false); console.log('User selected plan:', plan); }} />
//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// // --- CHANGE: Update ArcCard to use the new DeckCard type ---
// function ArcCard({ card, index, progress, maxIndex, onSelect, lockedSV, revealStarted }: {
//   card: DeckCard; // Updated type
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: DeckCard, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
//   revealStarted: boolean;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);
//   const start = useSharedValue(0);

//   // ... (aStyle and gesture logic are largely unchanged, but will now operate on DeckCard) ...
//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) return { opacity: 0 };
//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;
//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;
//     return { position: 'absolute', left: withTiming(x, { duration: 60 }), top: withTiming(y, { duration: 60 }), width: CARD_W, height: CARD_H, opacity, transform: [ { rotate: rotateDeg }, { scale: baseScale * pressScale.value }, { translateX: transX.value }, { translateY: transY.value } ], zIndex: isPressing.value === 1 ? 999 : 200, };
//   });

//   const deckPan = Gesture.Pan().onStart(() => { start.value = progress.value; }).onUpdate(e => { if (isPressing.value === 1 || lockedSV.value || revealStarted) return; progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex); }).onEnd(() => { if (isPressing.value === 1 || lockedSV.value || revealStarted) return; progress.value = withTiming(wRound(progress.value)); });
//   const tap = Gesture.Tap().onEnd(() => { if (lockedSV.value || revealStarted) return; runOnJS(triggerHaptic)(); runOnJS(onSelect)(card); });
//   const longPress = Gesture.LongPress().minDuration(250).onStart(() => { if (revealStarted) return; isPressing.value = 1; pressScale.value = withSpring(1.2); runOnJS(triggerHapticDelayed)(120); });
//   const dragPan = Gesture.Pan().onUpdate(e => { if (isPressing.value === 1 && !revealStarted) { transX.value = e.translationX; transY.value = e.translationY; } }).onEnd(e => { if (isPressing.value !== 1 || revealStarted) return; if (e.translationY < DROP_Y_THRESHOLD) { const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3; const slot = Math.max(0, Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth))); runOnJS(onSelect)(card, slot); runOnJS(triggerHaptic)(); } transX.value = withTiming(0); transY.value = withTiming(0); pressScale.value = withTiming(1); isPressing.value = 0; });
//   const composed = Gesture.Simultaneous(deckPan, Gesture.Exclusive(longPress, tap), dragPan);

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         {/* --- CHANGE: Use the generic card back image here --- */}
//         <Image source={card.cardBackImg} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// export default TarotCardDetailScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 20 },
//   header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
//   backBtn: { position: 'absolute', left: 0, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
//   backIcon: { width: 22, height: 22 },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
//   content: { alignItems: 'center', marginVertical: 6 },
//   focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
//   paragraph: { fontFamily: Fonts.aeonikRegular, fontSize: 14, textAlign: 'center', marginTop: 5, marginBottom: 8, lineHeight: 20 },
//   selectedRow: { flexDirection: 'row', justifyContent: 'space-between', margin: 10 },
//   box: { width: '32%', height: 180, borderWidth: 1, borderColor: '#CEA16A', borderRadius: 10, overflow: 'hidden' },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: '#0008', borderRadius: 13, padding: 2 },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: { margin: 10 },
//   revealBtnGrad: { height: 52, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   deckWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   hint: { position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 12, opacity: 0.95 },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, elevation: 8 },
//   shareRow: { marginTop: 16, width: '100%', flexDirection: 'row', gap: 12, justifyContent: 'center' },
//   smallBtn: { minWidth: 120, height: 46, borderRadius: 22, paddingHorizontal: 16, borderWidth: 1.1, borderColor: '#D9B699', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
//   smallIcon: { width: 15, height: 15, marginRight: 8, resizeMode: 'contain', tintColor: '#fff' },
//   smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14, color: '#fff' },
// });

// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';

// import Animated,
// {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// // 🔊 TTS
// import Tts from 'react-native-tts';

// // 🎥 Video
// import Video from 'react-native-video';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 170;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.26;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// /* Selected row layout (for drop targets) */
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;

// /* ---------- Helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 22 }).map(
//   (_, i) => ({
//     id: `${i + 1}`,
//     image: require('../../../../assets/images/deskCard.png'),
//   })
// );

// const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// function triggerHapticDelayed(ms = 120) {
//   setTimeout(() => triggerHaptic(), ms);
// }

// /* ---- STATIC REVEAL IMAGES  */
// const revealImages: ImageSourcePropType[] = [
//   require('../../../../assets/images/revealCard1.png'),
//   require('../../../../assets/images/revealCard2.png'),
//   require('../../../../assets/images/revealCard3.png'),
// ];

// // Sample reading text
// const readingMessage = `In the past, The Lovers suggests a meaningful connection or important decision that deeply influenced your path. In the present, The Chariot reveals your need to stay focused and take charge as you move forward. Looking to the future, The Star brings a message of hope, renewal, and the promise of brighter days ahead.`;

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

//   const [showVideo, setShowVideo] = useState(false); // 🎥 VIDEO STATE
//   const [revealStarted, setRevealStarted] = useState(false);
//   const [showReading, setShowReading] = useState(false);

//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const maxIndex = deck.length - 1;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);

//   type TtsSub = { remove?: () => void; removeListener?: () => void };
//   // TTS setup
//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//     Tts.setDefaultRate(0.4, true);

//     const onStart = () => setIsSpeaking(true);
//     const onFinish = () => setIsSpeaking(false);
//     const onCancel = () => setIsSpeaking(false);

//     const startSub = Tts.addEventListener('tts-start', onStart) as unknown as TtsSub;
//     const finishSub = Tts.addEventListener('tts-finish', onFinish) as unknown as TtsSub;
//     const cancelSub = Tts.addEventListener('tts-cancel', onCancel) as unknown as TtsSub;

//     return () => {
//       startSub?.remove?.();
//       startSub?.removeListener?.();
//       finishSub?.remove?.();
//       finishSub?.removeListener?.();
//       cancelSub?.remove?.();
//       cancelSub?.removeListener?.();
//       Tts.stop();
//     };
//   }, []);

//   const onPressPlayToggle = async () => {
//     if (!readingMessage.trim()) return;
//     if (isSpeaking) {
//       await Tts.stop();
//       setIsSpeaking(false);
//     } else {
//       await Tts.stop();
//       Tts.speak(readingMessage);
//     }
//   };

//   const handleSelect = (card: CardT, slotIndex?: number) => {
//     if (revealStarted || showVideo) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     if (revealStarted || showVideo) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   const onPressReveal = () => {
//     if (!revealStarted) {
//       setShowVideo(true); // Show video first
//     } else {
//       setShowReading(true);
//     }
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* 🎥 VIDEO PHASE */}
//           {showVideo ? (
//             <View style={{ flex: 1, alignItems:'center' }}>
//               <Video
//                 source={require('../../../../assets/videos/onboardingVideo2.mp4')}
//                 style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
//                 resizeMode="cover"
//                 repeat={false}
//                 paused={false}
//               />

//               {/* Overlay Continue Button */}
//               <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20 }}>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setShowVideo(false);
//                     setRevealStarted(true);
//                   }}
//                   activeOpacity={0.9}
//                 >
//                   <View
//                     style={{
//                       borderColor: colors.primary,
//                       borderWidth: 1.5,
//                       borderRadius: 60,
//                       overflow: 'hidden',
//                     }}
//                   >
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                       <Text style={styles.revealBtnText}>Continue</Text>
//                     </GradientBox>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : (
//             <>
//               {/* Header (only when NOT video) */}
//               <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                   <Image
//                     source={require('../../../../assets/icons/backIcon.png')}
//                     style={[styles.backIcon, { tintColor: colors.white }]}
//                     resizeMode="contain"
//                   />
//                 </TouchableOpacity>

//                 <View style={styles.headerTitleWrap} pointerEvents="none">
//                   <Text
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                     style={[styles.headerTitle, { color: colors.white }]}
//                   >
//                     Tarot Reader
//                   </Text>
//                 </View>
//               </View>

//               {/* Focus Phase OR Reading Phase */}
//               {!showReading ? (
//                 <>
//                   <View style={styles.content}>
//                     <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                       {revealStarted ? 'Your Card' : 'Focus on Your Question'}
//                     </Text>
//                     <Text style={[styles.paragraph, { color: colors.white }]}>
//                       {revealStarted
//                         ? 'Discover the deeper meaning behind the cards drawn for you.'
//                         : 'Take a deep breath and think about what you seek to know'}
//                     </Text>
//                   </View>

//                   {/* Slots */}
//                   <View style={styles.selectedRow}>
//                     {[0, 1, 2].map(i => (
//                       <View key={i} style={styles.box}>
//                         {selectedCards[i] && (
//                           <>
//                             <Image
//                               source={revealStarted ? revealImages[i] : selectedCards[i]!.img}
//                               style={styles.boxImg}
//                             />
//                             {!revealStarted && (
//                               <TouchableOpacity onPress={() => handleRemove(i)} style={styles.removeBtn}>
//                                 <Image
//                                   source={require('../../../../assets/icons/closeIcon.png')}
//                                   style={styles.removeIcon}
//                                 />
//                               </TouchableOpacity>
//                             )}
//                           </>
//                         )}
//                       </View>
//                     ))}
//                   </View>

//                   {/* Reveal Button */}
//                   {isLocked && (
//                     <TouchableOpacity style={styles.revealBtnWrap} onPress={onPressReveal} activeOpacity={0.9}>
//                       <View
//                         style={{
//                           borderColor: colors.primary,
//                           borderWidth: 1.5,
//                           borderRadius: 60,
//                           overflow: 'hidden',
//                         }}
//                       >
//                         <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                           <Text style={styles.revealBtnText}>
//                             {revealStarted ? 'Reveal Meaning' : 'Start Revealing'}
//                           </Text>
//                         </GradientBox>
//                       </View>
//                     </TouchableOpacity>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {/* 📖 Reading Phase */}
//                   <View style={styles.content}>
//                     <Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text>
//                   </View>

//                   <View style={styles.selectedRow}>
//                     {[0, 1, 2].map(i => (
//                       <View key={i} style={styles.box}>
//                         <Image source={revealImages[i]} style={styles.boxImg} />
//                       </View>
//                     ))}
//                   </View>

//                   <View style={{ alignItems: 'center', marginTop: 10 }}>
//                     <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
//                       <Image
//                         source={
//                           isSpeaking
//                             ? require('../../../../assets/icons/pauseIcon.png')
//                             : require('../../../../assets/icons/playIcon.png')
//                         }
//                         style={{ width: 40, height: 40 }}
//                         resizeMode="contain"
//                       />
//                     </TouchableOpacity>
//                   </View>

//                   <Text
//                     style={[
//                       styles.paragraph,
//                       { color: colors.white, marginTop: 12, paddingHorizontal: 8 },
//                     ]}
//                   >
//                     {readingMessage}
//                   </Text>

//                   <View style={styles.shareRow}>
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                       <Image
//                         source={require('../../../../assets/icons/shareIcon.png')}
//                         style={styles.smallIcon}
//                         resizeMode="contain"
//                       />
//                       <Text style={styles.smallBtnText}>Share</Text>
//                     </GradientBox>
//                     <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                       <Image
//                         source={require('../../../../assets/icons/saveIcon.png')}
//                         style={styles.smallIcon}
//                         resizeMode="contain"
//                       />
//                       <Text style={styles.smallBtnText}>Save</Text>
//                     </GradientBox>
//                   </View>

//                   <TouchableOpacity
//                     style={{ marginTop: 40 }}
//                     onPress={() => {
//                       setShowSubscriptionModal(true);
//                     }}
//                   >
//                     <View
//                       style={{
//                         borderColor: colors.primary,
//                         borderWidth: 1.5,
//                         borderRadius: 60,
//                         overflow: 'hidden',
//                       }}
//                     >
//                       <GradientBox
//                         colors={[colors.black, colors.bgBox]}
//                         style={[styles.revealBtnGrad, { borderRadius: 60 }]}
//                       >
//                         <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
//                       </GradientBox>
//                     </View>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </>
//           )}

//           {/* Deck */}
//           {!showReading && !showVideo && (
//             <View style={styles.deckWrap}>
//               {deck.map((card, i) => (
//                 <ArcCard
//                   key={card.id}
//                   card={card}
//                   index={i}
//                   progress={progress}
//                   maxIndex={maxIndex}
//                   onSelect={handleSelect}
//                   lockedSV={lockedSV}
//                   revealStarted={revealStarted}
//                 />
//               ))}
//               <Text style={styles.hint}>drag to move</Text>
//             </View>
//           )}

//           <SubscriptionPlanModal
//             isVisible={showSubscriptionModal}
//             onClose={() => setShowSubscriptionModal(false)}
//             onConfirm={plan => {
//               setShowSubscriptionModal(false);
//               console.log('User selected plan:', plan);
//             }}
//           />
//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// /* --------- Arc Card --------- */
// function ArcCard({
//   card,
//   index,
//   progress,
//   maxIndex,
//   onSelect,
//   lockedSV,
//   revealStarted,
// }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: CardT, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
//   revealStarted: boolean;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const sentUpOnce = useSharedValue(0);
//   const start = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);

//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return { opacity: 0 };
//     }

//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 60 }),
//       top: withTiming(y, { duration: 60 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [
//         { rotate: rotateDeg },
//         { scale: baseScale * pressScale.value },
//         { translateX: transX.value },
//         { translateY: transY.value },
//       ],
//       zIndex: isPressing.value === 1 ? 999 : 200,
//     };
//   });

//   const deckPan = Gesture.Pan()
//     .onStart(() => {
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
//     })
//     .onEnd(() => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = withTiming(wRound(progress.value));
//     });

//   const tap = Gesture.Tap().onEnd(() => {
//     if (lockedSV.value || revealStarted) return;
//     runOnJS(triggerHaptic)();
//     runOnJS(onSelect)(card);
//   });

//   const longPress = Gesture.LongPress()
//     .minDuration(250)
//     .onStart(() => {
//       if (revealStarted) return;
//       isPressing.value = 1;
//       sentUpOnce.value = 0;
//       pressScale.value = withSpring(1.2);
//       runOnJS(triggerHapticDelayed)(120);
//     });

//   const dragPan = Gesture.Pan()
//     .onUpdate(e => {
//       if (isPressing.value === 1 && !revealStarted) {
//         transX.value = e.translationX;
//         transY.value = e.translationY;
//       }
//     })
//     .onEnd(e => {
//       if (isPressing.value !== 1 || revealStarted) return;
//       if (e.translationY < DROP_Y_THRESHOLD) {
//         const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
//         const slot = Math.max(0, Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth)));
//         runOnJS(onSelect)(card, slot);
//         runOnJS(triggerHaptic)();
//         sentUpOnce.value = 1;
//       }
//       transX.value = withTiming(0);
//       transY.value = withTiming(0);
//       pressScale.value = withTiming(1);
//       isPressing.value = 0;
//     });

//   const composed = Gesture.Simultaneous(
//     deckPan,
//     Gesture.Exclusive(longPress, tap),
//     dragPan
//   );

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.img} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// export default TarotCardDetailScreen;

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 20 },
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
//   content: { alignItems: 'center', marginVertical: 6 },
//   focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   selectedRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     margin: 10,
//   },
//   box: {
//     width: '32%',
//     height: 180,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13,
//     padding: 2,
//   },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: { margin: 10 },
//   revealBtnGrad: {
//     height: 52,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   deckWrap: { flex: 1 },
//   hint: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   shareRow: {
//     marginTop: 16,
//     width: '100%',
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   smallBtn: {
//     minWidth: 120,
//     height: 46,
//     borderRadius: 22,
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
// });

// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';

// import Animated,
// {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// // 🔊 TTS
// import Tts from 'react-native-tts';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 170;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.26;
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// /* Selected row layout (for drop targets) */
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;

// /* ---------- Helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 22 }).map(
//   (_, i) => ({
//     id: `${i + 1}`,
//     image: require('../../../../assets/images/deskCard.png'),
//   })
// );

// const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// function triggerHapticDelayed(ms = 120) {
//   setTimeout(() => triggerHaptic(), ms);
// }

// /* ---- STATIC REVEAL IMAGES  */
// const revealImages: ImageSourcePropType[] = [
//   require('../../../../assets/images/revealCard1.png'),
//   require('../../../../assets/images/revealCard2.png'),
//   require('../../../../assets/images/revealCard3.png'),
// ];

// // Sample reading text
// const readingMessage = `In the past, The Lovers suggests a meaningful connection or important decision that deeply influenced your path. In the present, The Chariot reveals your need to stay focused and take charge as you move forward. Looking to the future, The Star brings a message of hope, renewal, and the promise of brighter days ahead.`;

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
// const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

//   const [revealStarted, setRevealStarted] = useState(false);
//   const [showReading, setShowReading] = useState(false);

//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const maxIndex = deck.length - 1;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);
//   type TtsSub = { remove?: () => void; removeListener?: () => void };
//   // TTS setup
//   useEffect(() => {
//     Tts.setDefaultLanguage('en-US').catch(() => {});
//   Tts.setDefaultRate(0.4, true);

//     const onStart = () => setIsSpeaking(true);
//     const onFinish = () => setIsSpeaking(false);
//     const onCancel = () => setIsSpeaking(false);

//     const startSub = Tts.addEventListener('tts-start', onStart) as unknown as TtsSub;
//     const finishSub = Tts.addEventListener('tts-finish', onFinish) as unknown as TtsSub;
//     const cancelSub = Tts.addEventListener('tts-cancel', onCancel) as unknown as TtsSub;

//     return () => {
//       startSub?.remove?.();
//       startSub?.removeListener?.();
//       finishSub?.remove?.();
//       finishSub?.removeListener?.();
//       cancelSub?.remove?.();
//       cancelSub?.removeListener?.();
//       Tts.stop();
//     };
//   }, []);

//   const onPressPlayToggle = async () => {
//     if (!readingMessage.trim()) return;
//     if (isSpeaking) {
//       await Tts.stop();
//       setIsSpeaking(false);
//     } else {
//       await Tts.stop();
//       Tts.speak(readingMessage);
//     }
//   };

//   const handleSelect = (card: CardT, slotIndex?: number) => {
//     if (revealStarted) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     if (revealStarted) return;
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   const onPressReveal = () => {
//     if (!revealStarted) {
//       setRevealStarted(true);
//     } else {
//       // Now show final Reading screen
//       setShowReading(true);
//     }
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//               <Image
//                 source={require('../../../../assets/icons/backIcon.png')}
//                 style={[styles.backIcon, { tintColor: colors.white }]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>

//             <View style={styles.headerTitleWrap} pointerEvents="none">
//               <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                 Tarot Reader
//               </Text>
//             </View>
//           </View>

//           {/* Content */}
//           {!showReading ? (
//             <>
//               <View style={styles.content}>
//                 <Text style={[styles.focusTitle, { color: colors.primary }]}>
//                   {revealStarted ? 'Your Card' : 'Focus on Your Question'}
//                 </Text>
//                 <Text style={[styles.paragraph, { color: colors.white }]}>
//                   {revealStarted ? 'Discover the deeper meaning behind the cards drawn for you.' : 'Take a deep breath and think about what you seek to know'}
//                 </Text>
//               </View>

//               {/* Slots */}
//               <View style={styles.selectedRow}>
//                 {[0, 1, 2].map(i => (
//                   <View key={i} style={styles.box}>
//                     {selectedCards[i] && (
//                       <>
//                         <Image
//                           source={revealStarted ? revealImages[i] : selectedCards[i]!.img}
//                           style={styles.boxImg}
//                         />
//                         {!revealStarted && (
//                           <TouchableOpacity onPress={() => handleRemove(i)} style={styles.removeBtn}>
//                             <Image
//                               source={require('../../../../assets/icons/closeIcon.png')}
//                               style={styles.removeIcon}
//                             />
//                           </TouchableOpacity>
//                         )}
//                       </>
//                     )}
//                   </View>
//                 ))}
//               </View>

//               {/* Reveal Button */}
//               {isLocked && (
//                 <TouchableOpacity style={styles.revealBtnWrap} onPress={onPressReveal} activeOpacity={0.9}>
//  <View                  style={{
//     borderColor: colors.primary,
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden'   // borderRadius ke liye zaroori
//   }}>
//   <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                     <Text style={styles.revealBtnText}>
//                       {revealStarted ? 'Reveal Meaning' : 'Start Revealing'}
//                     </Text>
//                   </GradientBox>
//  </View>

//                 </TouchableOpacity>
//               )}
//             </>
//           ) : (
//             <>
//               <View style={styles.content}>
//                 <Text style={[styles.focusTitle, { color: colors.primary }]}>Your Reading</Text>
//               </View>

//               {/* Show the same cards */}
//               <View style={styles.selectedRow}>
//                 {[0, 1, 2].map(i => (
//                   <View key={i} style={styles.box}>
//                     <Image source={revealImages[i]} style={styles.boxImg} />
//                   </View>
//                 ))}
//               </View>

//               {/* Play Icon */}
//               <View style={{ alignItems: 'center', marginTop: 10 }}>
//                 <TouchableOpacity onPress={onPressPlayToggle} activeOpacity={0.7}>
//                   <Image
//                     source={isSpeaking ? require('../../../../assets/icons/pauseIcon.png') : require('../../../../assets/icons/playIcon.png')}
//                     style={{ width: 40, height: 40 }}
//                     resizeMode="contain"
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Message */}
//               <Text style={[styles.paragraph, { color: colors.white, marginTop: 12, paddingHorizontal: 8 }]}>
//                 {readingMessage}
//               </Text>

//               {/* Share / Save */}
//               <View style={styles.shareRow}>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                   <Image source={require('../../../../assets/icons/shareIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={styles.smallBtnText}>Share</Text>
//                 </GradientBox>
//                 <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
//                   <Image source={require('../../../../assets/icons/saveIcon.png')} style={styles.smallIcon} resizeMode="contain" />
//                   <Text style={styles.smallBtnText}>Save</Text>
//                 </GradientBox>
//               </View>

//               {/* Premium CTA */}
//           <TouchableOpacity style={{ marginTop: 40}}  onPress={()=>{  setShowSubscriptionModal(true);}}>
//   <View style={{
//     borderColor: colors.primary,
//     borderWidth: 1.5,
//     borderRadius: 60,
//     overflow: 'hidden'   // borderRadius ke liye zaroori
//   }}>
//     <GradientBox
//       colors={[colors.black, colors.bgBox]}
//       style={[styles.revealBtnGrad, { borderRadius: 60 }]}
//     >
//       <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
//     </GradientBox>
//   </View>
// </TouchableOpacity>

//             </>
//           )}

//           {/* Deck */}
//           {!showReading && (
//             <View style={styles.deckWrap}>
//               {deck.map((card, i) => (
//                 <ArcCard
//                   key={card.id}
//                   card={card}
//                   index={i}
//                   progress={progress}
//                   maxIndex={maxIndex}
//                   onSelect={handleSelect}
//                   lockedSV={lockedSV}
//                   revealStarted={revealStarted}
//                 />
//               ))}
//               <Text style={styles.hint}>drag to move</Text>
//             </View>
//           )}
//           <SubscriptionPlanModal
//   isVisible={showSubscriptionModal}
//   onClose={() => setShowSubscriptionModal(false)}
//   onConfirm={(plan) => {
//     setShowSubscriptionModal(false);
//     console.log('User selected plan:', plan);

//   }}
// />

//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// export default TarotCardDetailScreen;

// /* --------- Arc Card --------- */
// function ArcCard({ card, index, progress, maxIndex, onSelect, lockedSV, revealStarted }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: CardT, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
//   revealStarted: boolean;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const sentUpOnce = useSharedValue(0);
//   const start = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);

//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return { opacity: 0 };
//     }

//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 60 }),
//       top: withTiming(y, { duration: 60 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [
//         { rotate: rotateDeg },
//         { scale: baseScale * pressScale.value },
//         { translateX: transX.value },
//         { translateY: transY.value },
//       ],
//       zIndex: isPressing.value === 1 ? 999 : 200,
//     };
//   });

//   const deckPan = Gesture.Pan()
//     .onStart(() => { start.value = progress.value; })
//     .onUpdate(e => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
//     })
//     .onEnd(() => {
//       if (isPressing.value === 1 || lockedSV.value || revealStarted) return;
//       progress.value = withTiming(wRound(progress.value));
//     });

//   const tap = Gesture.Tap().onEnd(() => {
//     if (lockedSV.value || revealStarted) return;
//     runOnJS(triggerHaptic)();
//     runOnJS(onSelect)(card);
//   });

//   const longPress = Gesture.LongPress()
//     .minDuration(250)
//     .onStart(() => {
//       if (revealStarted) return;
//       isPressing.value = 1;
//       sentUpOnce.value = 0;
//       pressScale.value = withSpring(1.2);
//       runOnJS(triggerHapticDelayed)(120);
//     });

//   const dragPan = Gesture.Pan()
//     .onUpdate(e => {
//       if (isPressing.value === 1 && !revealStarted) {
//         transX.value = e.translationX;
//         transY.value = e.translationY;
//       }
//     })
//     .onEnd(e => {
//       if (isPressing.value !== 1 || revealStarted) return;
//       if (e.translationY < DROP_Y_THRESHOLD) {
//         const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
//         const slot = Math.max(0, Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth)));
//         runOnJS(onSelect)(card, slot);
//         runOnJS(triggerHaptic)();
//         sentUpOnce.value = 1;
//       }
//       transX.value = withTiming(0);
//       transY.value = withTiming(0);
//       pressScale.value = withTiming(1);
//       isPressing.value = 0;
//     });

//   const composed = Gesture.Simultaneous(deckPan, Gesture.Exclusive(longPress, tap), dragPan);

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.img} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 20 },
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
//   content: { alignItems: 'center', marginVertical: 6 },
//   focusTitle: { fontFamily: Fonts.aeonikRegular, fontSize: 18,
//         marginBottom: 5,
//    },
//   paragraph: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 5,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   selectedRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     margin: 10,
//   },
//   box: {
//     width: '32%',
//     height: 180,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   boxImg: { width: '100%', height: '100%' },
//   removeBtn: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13,
//     padding: 2,
//   },
//   removeIcon: { width: 17, height: 17, tintColor: '#fff' },
//   revealBtnWrap: { margin: 10 },
//   revealBtnGrad: {
//     height: 52,

//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,

//   },
//   revealBtnText: { color: '#fff', fontSize: 16 },
//   deckWrap: { flex: 1 },
//   hint: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   shareRow: {
//     marginTop: 16,
//     width: '100%',
//     flexDirection: 'row',
//     gap: 12,
//     justifyContent: 'center',
//   },
//   smallBtn: {
//     minWidth: 120,
//     height: 46,
//     borderRadius: 22,
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
// });

// import React, { useEffect, useMemo, useState } from 'react';
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
//   ImageSourcePropType,
//   Vibration,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withDelay,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import {
//   GestureHandlerRootView,
//   Gesture,
//   GestureDetector,
// } from 'react-native-gesture-handler';

// import GradientBox from '../../../../components/GradientBox';
// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// type CardT = { id: string; img: ImageSourcePropType };

// /* ---------- Tunables ---------- */
// const CARD_W = 96;
// const CARD_H = 170;

// const ARC_Y_TOP = SCREEN_HEIGHT * 0.32; // you set this higher already
// const RADIUS = 260;
// const CENTER_X = SCREEN_WIDTH / 2;
// const CENTER_Y = ARC_Y_TOP + RADIUS;

// const VISIBLE_COUNT = 7;
// const STEP_DEG = 12;
// const HALF_WINDOW = (VISIBLE_COUNT - 1) / 2;
// const MAX_VISIBLE_DEG = HALF_WINDOW * STEP_DEG;

// const FREEZE_BUFFER = 1.0;
// const ITEM_STRIDE = 42;

// /* Selected row layout (for drop targets) */
// const SLOTS_PAD_H = 10;
// const DROP_Y_THRESHOLD = -110;

// /* ---------- Helpers ---------- */
// const wClamp = (v: number, min: number, max: number) => {
//   'worklet';
//   return v < min ? min : v > max ? max : v;
// };
// const wRound = (v: number) => {
//   'worklet';
//   return Math.round(v);
// };

// const cardsJSON: Array<{ id: string; image: ImageSourcePropType }> = Array.from({ length: 16 }).map(
//   (_, i) => ({
//     id: `${i + 1}`,
//     image: require('../../../../assets/images/deskCard.png'),
//   })
// );

// const toDeck = (rows: typeof cardsJSON): CardT[] => rows.map(r => ({ id: r.id, img: r.image }));

// function triggerHaptic() {
//   if (Platform.OS === 'android') {
//     Vibration.vibrate([0, 35, 40, 35]);
//   } else {
//     Vibration.vibrate();
//   }
// }
// function triggerHapticDelayed(ms = 120) {
//   setTimeout(() => triggerHaptic(), ms);
// }

// const TarotCardDetailScreen: React.FC = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

//   const [deck] = useState<CardT[]>(() => toDeck(cardsJSON));
//   const [selectedCards, setSelectedCards] = useState<Array<CardT | null>>([null, null, null]);

//   const maxIndex = deck.length - 1;
//   const initialIndex = useMemo(() => Math.floor(deck.length / 2), [deck.length]);
//   const progress = useSharedValue(initialIndex);

//   const filledCount = selectedCards.filter(Boolean).length;
//   const isLocked = filledCount === 3;
//   const lockedSV = useSharedValue(0);

//   useEffect(() => {
//     progress.value = initialIndex;
//   }, [initialIndex]);

//   useEffect(() => {
//     lockedSV.value = isLocked ? 1 : 0;
//   }, [isLocked]);

//   const handleSelect = (card: CardT, slotIndex?: number) => {
//     setSelectedCards(prev => {
//       const next = [...prev];
//       if (slotIndex !== undefined) {
//         if (!next[slotIndex]) next[slotIndex] = card;
//         return next;
//       }
//       const emptyIdx = next.findIndex(x => x === null);
//       if (emptyIdx !== -1) next[emptyIdx] = card;
//       return next;
//     });
//   };

//   const handleRemove = (slotIndex: number) => {
//     setSelectedCards(prev => {
//       const next = [...prev];
//       next[slotIndex] = null;
//       return next;
//     });
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ImageBackground
//         source={require('../../../../assets/images/backgroundImage.png')}
//         style={{ flex: 1 }}
//         resizeMode="cover"
//       >
//         <SafeAreaView style={styles.container}>
//           <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//           {/* Header */}
//         <View style={styles.header}>
//              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                <Image
//                  source={require('../../../../assets/icons/backIcon.png')}
//                  style={[styles.backIcon, { tintColor: colors.white }]}
//                  resizeMode="contain"
//                />
//              </TouchableOpacity>

//              <View style={styles.headerTitleWrap} pointerEvents="none">
//                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//                Tarot Reader
//                </Text>
//              </View>
//            </View>

//           {/* Instructions */}
//           <View style={styles.content}>
//             <Text style={[styles.focusTitle, { color: colors.primary }]}>
//               Focus on Your Question
//             </Text>
//             <Text style={[styles.paragraph, { color: colors.white }]}>
//               Take a deep breath and think about{'\n'}what you seek to know
//             </Text>
//           </View>

//           {/* Slots */}
//           <View style={styles.selectedRow}>
//             {[0, 1, 2].map(i => (
//               <View key={i} style={styles.box}>
//                 {selectedCards[i] && (
//                   <>
//                     <Image source={selectedCards[i]!.img} style={styles.boxImg} />
//                     <TouchableOpacity
//                       onPress={() => handleRemove(i)}
//                       style={styles.removeBtn}
//                     >
//                       <Image
//                         source={require('../../../../assets/icons/closeIcon.png')}
//                         style={styles.removeIcon}
//                       />
//                     </TouchableOpacity>
//                   </>
//                 )}
//               </View>
//             ))}
//           </View>

//           {/* Reveal */}
//           {isLocked && (
//             <TouchableOpacity style={styles.revealBtnWrap}>
//               <GradientBox colors={[colors.black, colors.bgBox]} style={styles.revealBtnGrad}>
//                 <Text style={styles.revealBtnText}>Start Revealing</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           )}

//           {/* Deck */}
//           <View style={styles.deckWrap}>
//             {deck.map((card, i) => (
//               <ArcCard
//                 key={card.id}
//                 card={card}
//                 index={i}
//                 progress={progress}
//                 maxIndex={maxIndex}
//                 onSelect={handleSelect}
//                 lockedSV={lockedSV}
//               />
//             ))}
//             {/* HINT fixed to screen bottom & white */}
//             <Text style={styles.hint}>drag to move</Text>
//           </View>
//         </SafeAreaView>
//       </ImageBackground>
//     </GestureHandlerRootView>
//   );
// };

// export default TarotCardDetailScreen;

// /* --------- Arc Card --------- */
// function ArcCard({
//   card,
//   index,
//   progress,
//   maxIndex,
//   onSelect,
//   lockedSV,
// }: {
//   card: CardT;
//   index: number;
//   progress: Animated.SharedValue<number>;
//   maxIndex: number;
//   onSelect: (c: CardT, slotIndex?: number) => void;
//   lockedSV: Animated.SharedValue<number>;
// }) {
//   const pressScale = useSharedValue(1);
//   const isPressing = useSharedValue(0);
//   const sentUpOnce = useSharedValue(0);
//   const start = useSharedValue(0);
//   const transX = useSharedValue(0);
//   const transY = useSharedValue(0);

//   const aStyle = useAnimatedStyle(() => {
//     const rel = index - progress.value;
//     const absRel = Math.abs(rel);
//     if (absRel > HALF_WINDOW + FREEZE_BUFFER + 1) {
//       return { opacity: 0 };
//     }

//     const rawDeg = rel * STEP_DEG;
//     const angleDeg = Math.max(-MAX_VISIBLE_DEG, Math.min(MAX_VISIBLE_DEG, rawDeg));
//     const angleRad = (Math.PI / 180) * angleDeg;
//     const x = CENTER_X + RADIUS * Math.sin(angleRad) - CARD_W / 2;
//     const y = CENTER_Y - RADIUS * Math.cos(angleRad) - CARD_H / 2;

//     const t = Math.min(1, Math.abs(angleDeg) / MAX_VISIBLE_DEG);
//     const baseScale = 1 - 0.18 * t;
//     const opacity = lockedSV.value ? 0.35 : 1 - 0.1 * t;
//     const rotateDeg = isPressing.value === 1 ? '0deg' : `${angleDeg}deg`;

//     return {
//       position: 'absolute',
//       left: withTiming(x, { duration: 100 }),
//       top: withTiming(y, { duration: 100 }),
//       width: CARD_W,
//       height: CARD_H,
//       opacity,
//       transform: [
//         { rotate: rotateDeg },
//         { scale: baseScale * pressScale.value },
//         { translateX: transX.value },
//         { translateY: transY.value },
//       ],
//       zIndex: isPressing.value === 1 ? 999 : 200,
//     };
//   });

//   const deckPan = Gesture.Pan()
//     .onStart(() => {
//       start.value = progress.value;
//     })
//     .onUpdate(e => {
//       if (isPressing.value === 1 || lockedSV.value) return;
//       progress.value = wClamp(start.value - e.translationX / ITEM_STRIDE, 0, maxIndex);
//     })
//     .onEnd(() => {
//       if (isPressing.value === 1 || lockedSV.value) return;
//       progress.value = withTiming(wRound(progress.value));
//     });

//   const tap = Gesture.Tap().onEnd(() => {
//     if (lockedSV.value) return;
//     runOnJS(triggerHaptic)();
//     runOnJS(onSelect)(card);
//   });

//   const longPress = Gesture.LongPress()
//     .minDuration(250)
//     .onStart(() => {
//       isPressing.value = 1;
//       sentUpOnce.value = 0;
//       pressScale.value = withSpring(1.2);
//       runOnJS(triggerHapticDelayed)(120);
//     });

//   const dragPan = Gesture.Pan()
//     .onUpdate(e => {
//       if (isPressing.value === 1) {
//         transX.value = e.translationX;
//         transY.value = e.translationY;
//       }
//     })
//     .onEnd(e => {
//       if (isPressing.value !== 1) return;
//       if (e.translationY < DROP_Y_THRESHOLD) {
//         const slotWidth = (SCREEN_WIDTH - SLOTS_PAD_H * 2) / 3;
//         const slot = Math.max(
//           0,
//           Math.min(2, Math.floor((e.absoluteX - SLOTS_PAD_H) / slotWidth))
//         );
//         runOnJS(onSelect)(card, slot);
//         runOnJS(triggerHaptic)();
//         sentUpOnce.value = 1;
//       }
//       // snap back
//       transX.value = withTiming(0);
//       transY.value = withTiming(0);
//       pressScale.value = withTiming(1);
//       isPressing.value = 0;
//     });

//   const composed = Gesture.Simultaneous(deckPan, Gesture.Exclusive(longPress, tap), dragPan);

//   return (
//     <GestureDetector gesture={composed}>
//       <Animated.View style={[aStyle, styles.cardShadow]}>
//         <Image source={card.img} style={styles.cardImg} />
//       </Animated.View>
//     </GestureDetector>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container:
//   {
//     flex: 1,
//     paddingHorizontal: 20
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
//   content:
//   {
//     alignItems: 'center',
//     marginVertical: 6
//   },
//   focusTitle:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18
//   },
//   paragraph:
//   {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop:5,
//     marginBottom:5
//   },
//   selectedRow:
//   {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     margin: 10
//   },
//   box:
//   {
//     width: '32%',
//     height: 170,
//     borderWidth: 1,
//     borderColor: '#CEA16A',
//     borderRadius: 10
//   },
//   boxImg:
//   {
//     width: '100%',
//     height: '100%'
//   },

//   removeBtn:
//   {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#0008',
//     borderRadius: 13
//   },
//   removeIcon:

//   {
//     width: 17,
//     height: 17,
//     tintColor: '#fff'
//   }
//   ,
//   revealBtnWrap:
//     { margin: 10 },
//   revealBtnGrad:
//   {
//     height: 52,
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',

//   },
//   revealBtnText:
//     { color: '#fff', fontSize: 16 },
//   deckWrap:
//     { flex: 1 },

//   hint: {
//     position: 'absolute',
//     bottom: 16,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.95,
//   },
//   cardImg: { width: '100%', height: '100%', borderRadius: 10 },
//   cardShadow: {
//     shadowColor: '#000',
//     shadowOpacity: 0.35,
//     shadowRadius: 8,
//     elevation: 8,
//   },
// });
