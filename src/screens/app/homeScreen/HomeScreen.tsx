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
import { useShallow } from 'zustand/react/shallow';
import GradientBox from '../../../components/GradientBox';
import { useInterstitialAd } from '../../../hooks/useInterstitialAd';
import HightlightsCarouselCards from './HightlightsCarouselCards';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/design';
import Pressable from '../../../components/Pressable';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type CardBoxProps = {
  label: string;
  icon: any;
  onPress?: () => void;
};

const CardBox: React.FC<CardBoxProps> = React.memo(
  ({ label, icon, onPress }) => {
    const colors = useThemeStore(s => s.theme.colors);

    return (
      <Pressable
        hapticType="light"
        onPress={onPress}
        style={[
          styles.cardBox,
          {
            backgroundColor: colors.bgBox,
          },
          Shadows.medium,
        ]}
      >
        {/* Left: Text Container */}
        <View style={styles.cardBoxTextContainer}>
          <Text
            style={[styles.cardBoxText, { color: colors.white }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>

        {/* Right: Icon with subtle glow */}
        <View style={styles.cardBoxIconContainer}>
          <Image
            source={icon}
            style={styles.cardBoxIcon}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    );
  },
);

const HomeScreen: React.FC = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const { user, fetchCurrentUser } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      fetchCurrentUser: state.fetchCurrentUser,
    })),
  );
  const { showAd } = useInterstitialAd();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const { unreadCount, getUnreadCount } = useGetNotificationsStore();

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      getUnreadCount();
    }, [fetchCurrentUser, getUnreadCount]),
  );

  const handleButtonPress = useCallback(() => {
    if (__DEV__) {
      console.log('Showing Ad...');
    }
    showAd();
  }, [showAd]);
  const onPressCarouselCard = useCallback(
    (item: CardItem) => {
      if (item.route) {
        navigation.navigate(item.route as any);
      } else {
        if (__DEV__) {
          console.warn('No route defined for card:', item.id);
        }
      }
    },
    [navigation],
  );

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
            <Pressable
              style={styles.profileWrap}
              hapticType="light"
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
            </Pressable>
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

            <Pressable
              style={styles.headerIconBtn}
              hapticType="light"
              onPress={() => navigation.navigate('Notification')}
            >
              <Image
                source={require('../../../assets/icons/notificationIcon.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
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
            // onPressCard={onPressCarouselCard}
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

            <Pressable
              hapticType="medium"
              onPress={() => navigation.navigate('ChatDetail')}
              style={styles.aiChatButtonWrapper}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.aiChatGradient, { borderColor: colors.primary }]}
              >
                <Image
                  source={require('../../../assets/images/chatAvatar.png')}
                  style={styles.aiChatButtonIcon}
                />
                <Text
                  style={[styles.aiChatButtonText, { color: colors.white }]}
                >
                  {t('home_ai_chat_button')}
                </Text>
              </GradientBox>
            </Pressable>
          </View>

          {/* Boxes without map */}
          <View style={styles.cardBoxSection}>
            {/* First Box */}
            <CardBox
              label={t('home_daily_wisdom_card')}
              icon={require('../../../assets/icons/dailyWisdomIcon.png')}
              onPress={() => {
                Vibration.vibrate([0, 35, 40, 35]);
                navigation.navigate('DailyWisdomCardScreen');
              }}
            />

            {/* Second Box */}
            <CardBox
              label={t('home_ritual_tip')}
              icon={require('../../../assets/icons/RitualTipIcon.png')}
              onPress={() => {
                Vibration.vibrate([0, 35, 40, 35]);
                navigation.navigate('RitualTipScreen');
              }}
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
    borderRadius: 25,
    borderWidth: 2.5,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2.5,
    ...Shadows.small,
  },
  titlesBox: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  cardBox: {
    height: 76,
    borderRadius: BorderRadius.xl,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  cardBoxTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardBoxText: {
    fontSize: 18,
    fontFamily: Fonts.cormorantSCBold,
    letterSpacing: 0.4,
    textTransform: 'capitalize',
    lineHeight: 26,
  },
  cardBoxIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBoxIcon: {
    height: 32,
    width: 32,
    tintColor: Colors.primary,
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
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
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
    height: 52,
    borderRadius: 26,
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
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.round,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.small,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.aeonikBold,
    lineHeight: 14,
  },
});
