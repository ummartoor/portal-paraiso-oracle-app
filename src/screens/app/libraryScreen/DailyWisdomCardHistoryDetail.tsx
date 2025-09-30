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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Tts from 'react-native-tts';

import { WisdomHistoryItem } from '../../../store/useDailyWisdomStore';
import SubscriptionPlanModal from '../../../components/SubscriptionPlanModal';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { AppStackParamList } from '../../../navigation/routeTypes';

// --- Import Icons ---
const BackIcon = require('../../../assets/icons/backIcon.png');
const PlayIcon = require('../../../assets/icons/playIcon.png');
const PauseIcon = require('../../../assets/icons/pauseIcon.png');
const ShareIcon = require('../../../assets/icons/shareIcon.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DailyWisdomHistoryDetail: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<AppStackParamList, 'DailyWisdomCardHistoryDetail'>>();
  const { historyItem } = route.params || {};

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
    if (!historyItem?.reading) return;
    if (isSpeaking) {
      await Tts.stop();
    } else {
      await Tts.stop();
      Tts.speak(historyItem.reading);
    }
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

            <TouchableOpacity
              onPress={onPressPlayToggle}
              style={styles.playButton}
            >
              <Image
                source={isSpeaking ? PauseIcon : PlayIcon}
                style={styles.playIcon}
              />
            </TouchableOpacity>

            <Text style={[styles.description, { color: colors.white }]}>
              {historyItem.reading}
            </Text>

            <View style={styles.shareRow}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={styles.smallBtn}
              >
                <Image source={ShareIcon} style={styles.smallIcon} />
                <Text style={styles.smallBtnText}>Share</Text>
              </GradientBox>
            </View>

            <TouchableOpacity
              onPress={() => setShowSubscriptionModal(true)}
              style={{ marginTop: 30 }}
            >
              <View style={styles.buttonBorder}>
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.mainButton}
                >
                  <Text style={styles.buttonText}>
                    Get Premium For Full Reading
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
  contentWrapper: { width: '100%', alignItems: 'center', marginTop: 20 },
  cardName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 28,
    textTransform: 'uppercase',
    marginBottom: 15,
    color: '#D9B699',
  },
  cardImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65 * 1.7,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  cardFrame: {},
  playButton: { marginTop: 20 },
  playIcon: { width: 44, height: 44 },
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
  buttonBorder: {
    borderColor: '#D9B699',
    borderWidth: 1.5,
    borderRadius: 60,
    overflow: 'hidden',
  },
  mainButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 60,
  },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.aeonikRegular },
});
