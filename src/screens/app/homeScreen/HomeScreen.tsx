import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView,
  Vibration,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/routeTypes';
import CarouselCard, { CardItem } from './CarouselCards';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useGetNotificationsStore } from '../../../store/useGetNotificationsStore'; 
import GradientBox from '../../../components/GradientBox';
import { useInterstitialAd } from '../../../hooks/useInterstitialAd';
import HightlightsCarouselCards from './HightlightsCarouselCards';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type CardBoxProps = {
  label: string;
  icon: any;
  onPress?: () => void;
};

const CardBox: React.FC<CardBoxProps> = ({ label, icon, onPress }) => {
  const { colors } = useThemeStore(s => s.theme);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.cardBox,
        {
          backgroundColor: colors.bgBox,
        },
      ]}
    >
      {/* Left: Text */}
      <Text
        style={[styles.cardBoxText, { color: colors.white }]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Right: Icon */}
      <Image source={icon} style={styles.cardBoxIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const theme = useThemeStore(state => state.theme);

  const { colors } = theme;
  const { user, fetchCurrentUser } = useAuthStore();
  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, []),
  );
  const { showAd } = useInterstitialAd();

  const handleButtonPress = () => {
    // 2. Call showAd() when you want to display the ad
    console.log('Showing Ad...');
    showAd();
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const { unreadCount, getUnreadCount } = useGetNotificationsStore();

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      getUnreadCount(); // Fetch the count every time the screen is focused
    }, []),
  );
  const onPressCarouselCard = (item: CardItem) => {
    if (item.route) {
      navigation.navigate(item.route as any);
    } else {
      console.warn('No route defined for card:', item.id);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.profileWrap}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image
                style={[styles.profileImg, { borderColor: colors.white }]}
                source={
                  user?.profile_image?.url
                    ? { uri: user.profile_image.url }
                    : require('../../../assets/icons/userprofile.png')
                }
              />
              <View style={[styles.onlineDot, { borderColor: colors.white }]} />
            </TouchableOpacity>
{/* 
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Notification')}
            >
              <Image
                source={require('../../../assets/icons/notificationIcon.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity> */}

               <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Notification')}
            >
              <Image
                source={require('../../../assets/icons/notificationIcon.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Titles */}
          <View style={styles.titlesBox}>
            <Text
              style={[styles.title, { color: colors.white }]}
              numberOfLines={1}
            >
              {t('home_title')}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.primary }]}
              numberOfLines={2}
            >
              {t('home_subtitle')}
            </Text>
          </View>

  {/* Hightlight Carousel */}
          <View style={{ marginTop: 22 }}>
            <HightlightsCarouselCards 
            onPressCard={onPressCarouselCard}
             />
          </View>
          {/* Carousel */}
          <View style={{ marginTop: 30 }}>
            <CarouselCard onPressCard={onPressCarouselCard} />
          </View>



<View style={styles.aiChatContainer}>
            <Text style={[styles.aiChatTitle, { color: colors.white }]}>
         {t('home_ai_chat_title')}
            </Text>
            <Text style={[styles.aiChatSubtitle, { color: colors.white }]}>
       {t('home_ai_chat_subtitle')}
            </Text>
            
            <TouchableOpacity
              activeOpacity={0.8}
         
              onPress={() => navigation.navigate('ChatDetail')} 
              style={styles.aiChatButtonWrapper}
            >
              <GradientBox
         
                colors={[colors.bgBox, colors.black]} 
                style={[styles.aiChatGradient, { borderColor: colors.primary }]}
              >
                <Image
             
                  source={require('../../../assets/images/chatAvatar.png')} 
                  style={styles.aiChatButtonIcon}
                />
                <Text style={[styles.aiChatButtonText, { color: colors.white }]}>
                  {t('home_ai_chat_button')}
                </Text>
              </GradientBox>
            </TouchableOpacity>
          </View>


          {/* Boxes without map */}
          <View style={styles.cardBoxSection}>
            {/* First Box */}
            <CardBox
              label={t('home_daily_wisdom_card')}
              icon={require('../../../assets/icons/dailyWisdomIcon.png')}
              onPress={() => {
                      Vibration.vibrate([0, 35, 40, 35]); 
                navigation.navigate('DailyWisdomCardScreen')}
              }
            />

            {/* Second Box */}
            <CardBox
              label={t('home_ritual_tip')}
              icon={require('../../../assets/icons/RitualTipIcon.png')}
              onPress={() => {
                      Vibration.vibrate([0, 35, 40, 35]); 
                navigation.navigate('RitualTipScreen')}}
            />
          </View>

          {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Show Interstitial Ad" onPress={handleButtonPress} />
    </View> */}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 14,
  },
  headerRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { height: 27, width: 27 },
  profileWrap: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    height: 50,
    width: 50,
    borderRadius: 30,
    borderWidth: 2,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 7,
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#27C93F',
    borderWidth: 2,
  },
  titlesBox: {
    marginTop: 21,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  cardBoxSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    rowGap: 12,
  },
  cardBox: {
    height: 70,
    borderRadius: 25,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardBoxText: {
    fontSize: 18,
    fontFamily: Fonts.cormorantSCBold,
    letterSpacing: 0.4,
    textTransform: 'capitalize',
  },
  cardBoxIcon: {
    height: 50,
    width: 50,
  },

  bottomAvatarButton: {
    position: 'absolute',
    bottom: 65,
    right: 14,
  },
  bottomAvatarImage: {
    height: 75,
    width: 75,
  },

  aiChatContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
   
  },
  aiChatTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 0.5,

  
  },
  aiChatSubtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.85,
    marginTop: 4,
    // textAlign: 'center',
    marginBottom: 20, // Button se pehle space
  },
  aiChatButtonWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  aiChatGradient: {
    height: 60,
    borderRadius: 30, 
    borderWidth: 1, 
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
 
  },
  aiChatButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16, 
    marginRight: 12, 
  },
  aiChatButtonText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 16,
    letterSpacing: 0.5,
  },
   notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Fonts.aeonikBold,
  },
});
