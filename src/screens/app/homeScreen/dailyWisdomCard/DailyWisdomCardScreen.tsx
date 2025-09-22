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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SubscriptionPlanModal from '../../../../components/SubscriptionPlanModal';
import GradientBox from '../../../../components/GradientBox';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';
import Tts from 'react-native-tts';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_CARD = {
  name: 'The Star',
  image_back: require('../../../../assets/images/deskCard.png'),
  image_front: require('../../../../assets/images/revealCard1.png'),
  description:
    'Hope and renewal guide your path today. Trust that challenges are temporary and light is ahead. Stay open to inspiration, and let gratitude attract abundance.',
};

const DailyWisdomCardScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [isRevealed, setIsRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // --- TTS Setup ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.4, true);
    const subs = [
      Tts.addEventListener('tts-start', () => setIsSpeaking(true)),
      Tts.addEventListener('tts-finish', () => setIsSpeaking(false)),
      Tts.addEventListener('tts-cancel', () => setIsSpeaking(false)),
    ];
    return () => {
      subs.forEach(sub => (sub as any)?.remove?.());
      Tts.stop();
    };
  }, []);

  const onPressPlayToggle = async () => {
    if (isSpeaking) {
      await Tts.stop();
    } else {
      await Tts.stop();
      Tts.speak(MOCK_CARD.description);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Image
          source={require('../../../../assets/icons/backIcon.png')}
          style={[styles.backIcon, { tintColor: colors.white }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap} pointerEvents="none">
        <Text ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
          Daily Wisdom Card
        </Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {renderHeader()}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isRevealed ? (
            // --- PHASE 2: REVEALED CARD ---
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: colors.primary }]}>{MOCK_CARD.name}</Text>
              <View style={styles.cardFrame}>
                <Image source={MOCK_CARD.image_front} style={styles.cardImage} />
              </View>

              <TouchableOpacity onPress={onPressPlayToggle} style={styles.playButton}>
                <Image
                  source={
                    isSpeaking
                      ? require('../../../../assets/icons/pauseIcon.png')
                      : require('../../../../assets/icons/playIcon.png')
                  }
                  style={styles.playIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <Text style={[styles.description, { color: colors.white }]}>
                {MOCK_CARD.description}
              </Text>

              <View style={styles.shareRow}>
                <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
                  <Image
                    source={require('../../../../assets/icons/shareIcon.png')}
                    style={styles.smallIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.smallBtnText}>Share</Text>
                </GradientBox>
                <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
                  <Image
                    source={require('../../../../assets/icons/saveIcon.png')}
                    style={styles.smallIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.smallBtnText}>Save</Text>
                </GradientBox>
              </View>

              {/* Move Premium button INSIDE scroll for phase 2 */}
              <TouchableOpacity onPress={() => setShowSubscriptionModal(true)} style={{ marginTop: 30 }}>
                <View style={styles.buttonBorder}>
                  <GradientBox colors={[colors.black, colors.bgBox]} style={styles.mainButton}>
                    <Text style={styles.buttonText}>Get Premium For Full Reading</Text>
                  </GradientBox>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            // --- PHASE 1: INITIAL STATE ---
            <View style={styles.contentWrapper}>
              <Text style={[styles.title, { color: colors.primary }]}>Your Guidance for Today</Text>
              <Text style={[styles.subtitle, { color: colors.white }]}>
                A single card drawn to bring clarity, balance, and inspiration to your day.
              </Text>
              <Image source={MOCK_CARD.image_back} style={styles.cardImage} />
            </View>
          )}
        </ScrollView>

        {/* --- FOOTER BUTTON (ONLY FOR INITIAL STATE) --- */}
        {!isRevealed && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setIsRevealed(true)}>
              <View style={styles.buttonBorder}>
                <GradientBox colors={[colors.black, colors.bgBox]} style={styles.mainButton}>
                  <Text style={styles.buttonText}>Reveal Today's Card</Text>
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
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  backBtn: { position: 'absolute', left: 20, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
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
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6 * 1.77,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  cardName: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 24,
    textTransform: 'uppercase',
    marginBottom: 20,
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
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
  },
});
