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
import Tts from 'react-native-tts';

import { RitualHistoryItem } from '../../../store/useRitualTipStore';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { useTranslation } from 'react-i18next';

// --- Import Icons ---
const BackIcon = require('../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../assets/icons/pauseIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RitualTipHistoryDetail: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<AppStackParamList, 'RitualTipHistoryDetail'>>();
  const { historyItem } = route.params || {};

  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- TTS Setup ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.45, true);
    const listeners = [
      Tts.addEventListener('tts-start', () => setIsSpeaking(true)),
      Tts.addEventListener('tts-finish', () => setIsSpeaking(false)),
      Tts.addEventListener('tts-cancel', () => setIsSpeaking(false)),
    ];
    return () => {
      listeners.forEach((listener: any) => listener?.remove?.());
      Tts.stop();
    };
  }, []);

  const onPressPlayToggle = async () => {
    if (!historyItem?.ai_response) return;
    if (isSpeaking) {
      await Tts.stop();
    } else {
      await Tts.stop();
      Tts.speak(historyItem.ai_response);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderHeader = () => (
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
          Ritual Tip
                </Text>
              </View>
            </View>
  );

  if (!historyItem) {
    return (
      <ImageBackground source={require('../../../assets/images/backgroundImage.png')} style={styles.bgImage}>
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#D9B699" />
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentWrapper}>
                <Text style={[styles.title, { color: colors.primary }]}>{t('library_your_ritual')}</Text>
                
                {/* --- CARD LAYOUT UPDATED --- */}
                <View style={styles.ritualCard}>
                    <Text style={styles.cardDate}>{formatDate(historyItem.tip_date)}</Text>
                    <Image 
                        source={{ uri: historyItem.ritual_tip.ritual_image.url }} 
                        style={styles.ritualImage}
                    />
                    <Text style={styles.ritualName}>{historyItem.ritual_tip.ritual_name}</Text>
                    
                    <TouchableOpacity onPress={onPressPlayToggle} style={styles.playButton}>
                        <Image
                            source={isSpeaking ? PauseIcon : PlayIcon}
                            style={styles.playIcon}
                        />
                    </TouchableOpacity>

                    <Text style={styles.description}>
                        {historyItem.ai_response}
                    </Text>
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
    header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8, paddingHorizontal: 20 },
  backBtn: {
    position: 'absolute',
    left: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22 },
    headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 50 },
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
  playButton: { marginVertical: 20 },
  playIcon: { width: 35, height: 35 },
  description: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#E0E0E0',
  },
});

