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
import Tts from 'react-native-tts';

import { Fonts } from '../../../constants/fonts';
import { AppStackParamList } from '../../../navigation/routeTypes';
import SubscriptionPlanModal from '../../../components/SubscriptionPlanModal';

// --- Import Icons ---
import Back from '../../../assets/icons/backIcon.png';
import Play from '../../../assets/icons/playIcon.png';
import Pause from '../../../assets/icons/pauseIcon.png';
import GradientBox from '../../../components/GradientBox';
import { useThemeStore } from '../../../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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


  const theme = useThemeStore(s => s.theme);
  const colors = theme?.colors || { black: '#000000', bgBox: '#333333' };

  const route = useRoute<RouteProp<AppStackParamList, 'TarotReadingHistoryDetail'>>();
  const { readingItem } = route.params || {};

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
console.log("readingItem", readingItem)
  // --- TTS ---
  useEffect(() => {
    Tts.setDefaultLanguage('en-US').catch(() => {});
    Tts.setDefaultRate(0.4, true);

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
    if (!readingItem?.reading?.introduction) return;

    if (isSpeaking) {
      await Tts.stop();
    } else {
      await Tts.stop();
      Tts.speak(readingItem.reading.introduction);
    }
  };

  // Header
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
                Tarot Reader
               </Text>
             </View>
           </View>
  );

  // --- Loading/Error case ---
  if (!readingItem) {
    return (
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.bgImage}
      >
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#D9B699" />
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
          <Text style={styles.focusTitle}>Your Reading</Text>


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


          {/* Play Button */}
          <TouchableOpacity onPress={onPressPlayToggle} style={styles.playButtonContainer}>
            <Image source={isSpeaking ? Pause : Play} style={styles.playIcon} />
          </TouchableOpacity>

          {/* Reading Text */}
          <View style={styles.readingContentContainer}>
            {readingItem?.reading?.introduction && (
              <>
                <Text style={styles.readingParagraph}>
                  "{readingItem.reading.introduction}"
                </Text>
                <View style={styles.readMoreContainer}>
                  <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
                    <Text style={styles.readMoreText}>Read More</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Share Button */}
          <View style={styles.shareRow}>
            <GradientBox colors={[colors.black, colors.bgBox]} style={styles.smallBtn}>
              <Image
                source={require('../../../assets/icons/shareIcon.png')}
                style={styles.smallIcon}
                resizeMode="contain"
              />
              <Text style={styles.smallBtnText}>Share</Text>
            </GradientBox>
          </View>

          {/* Premium Button */}
          <TouchableOpacity
            style={{ marginTop: 40, alignItems: 'center' }}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.buttonBorder}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.revealBtnGrad, { borderRadius: 60 }]}
              >
                <Text style={styles.revealBtnText}>Get Premium For Full Reading</Text>
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
 header: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  backBtn: { position: 'absolute', left: 10, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22 },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1, textTransform: 'capitalize' },
  headerRightPlaceholder: { width: 24 },

  scrollContent: { paddingBottom: 40 },
  focusTitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    color: '#D9B699',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  // ✅ Fixed height + scroll for cards
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

  playButtonContainer: { alignItems: 'center', marginTop: 20 },
  playIcon: { width: 50, height: 50 },

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
    color: '#D9B699',
    textDecorationLine: 'underline',
  },

  shareRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallBtn: {
    backgroundColor: '#FFFFFF26',
    minWidth: 120,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIcon: { width: 15, height: 15, marginRight: 8, tintColor: '#fff' },
  smallBtnText: { fontFamily: Fonts.aeonikRegular, fontSize: 14, color: '#fff' },

  revealBtnGrad: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
