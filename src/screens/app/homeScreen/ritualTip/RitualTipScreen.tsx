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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SoundPlayer from 'react-native-sound-player';

import { useRitualTipStore } from '../../../../store/useRitualTipStore';
import { useOpenAiStore } from '../../../../store/useOpenAiStore';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

const BackIcon = require('../../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../../assets/icons/pauseIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RitualTipScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const {
    ritualTip,
    isLoading: isTipLoading,
    getDailyRitualTip,
    markRitualTipAsUsed,
  } = useRitualTipStore();
  const {
    isLoading: isAudioLoading,
    generateAndPlaySpeech,
    preloadSpeech,
  } = useOpenAiStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFilePath, setAudioFilePath] = useState<string | null>(null); // State for preloaded audio path

  useEffect(() => {
    getDailyRitualTip();
  }, []);

  // --- Preload audio when ritual tip data is available ---
  useEffect(() => {
    if (ritualTip) {
      // Mark as used
      if (!ritualTip.is_used) {
        markRitualTipAsUsed();
      }
      // Preload the speech in the background
      preloadSpeech(ritualTip.ai_response, ritualTip.ritual_tip.id).then(
        path => {
          setAudioFilePath(path); // Save the local file path
        },
      );
    }
  }, [ritualTip]);

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

  const onPressPlayToggle = async () => {
    if (isPlaying) {
      SoundPlayer.stop();
      setIsPlaying(false);
    } else {
      // --- UPDATED LOGIC ---
      if (audioFilePath) {
        // If file is preloaded, play it instantly
        SoundPlayer.playUrl(`file://${audioFilePath}`);
        setIsPlaying(true);
      } else {
      
        setIsPlaying(true);
        const success = await generateAndPlaySpeech(ritualTip!.ai_response);
        if (!success) {
          setIsPlaying(false);
        }
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
      <View style={styles.headerTitleWrap}>
        <Text
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.white }]}
        >
          Ritual Tip
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isTipLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.centeredLoader}
        />
      );
    }
    if (!ritualTip) {
      return (
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>
            Could not load today's ritual tip.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.contentWrapper}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Today's Ritual
        </Text>
        <Text style={[styles.subtitle, { color: colors.white }]}>
          Simple practices to ground, heal and empower your energy
        </Text>
        <View style={styles.ritualCard}>
          <Text style={styles.cardDate}>{formatDate(ritualTip.tip_date)}</Text>
          <Image
            source={{ uri: ritualTip.ritual_tip.ritual_image.url }}
            style={styles.ritualImage}
          />
          <Text style={styles.ritualName}>
            {ritualTip.ritual_tip.ritual_name}
          </Text>
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
              />
            )}
          </TouchableOpacity>
          <Text style={styles.description}>{ritualTip.ai_response}</Text>
        </View>
      </View>
    );
  };

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
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default RitualTipScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
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
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  title: { fontFamily: Fonts.aeonikRegular, fontSize: 18, marginBottom: 5 },
  subtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 20,
  },
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
    color: '#E0E0E0',
  },
});
