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
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
     const { t } = useTranslation();

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
       
            <TouchableOpacity style={styles.headerIconBtn}>
              <Image
                source={require('../../../assets/icons/notificationIcon.png')}
                style={styles.headerIcon}
                resizeMode="contain"
              />
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

          {/* Carousel */}
          <View style={{ marginTop: 22 }}>
            <CarouselCard onPressCard={onPressCarouselCard} />
          </View>

          {/* Boxes without map */}
          <View style={styles.cardBoxSection}>
            {/* First Box */}
            <CardBox
             label={t('home_daily_wisdom_card')}
              icon={require('../../../assets/icons/dailyWisdomIcon.png')}
              onPress={() => navigation.navigate('DailyWisdomCardScreen')}
            />

            {/* Second Box */}
            <CardBox
                    label={t('home_ritual_tip')}
              icon={require('../../../assets/icons/RitualTipIcon.png')}
              onPress={() => navigation.navigate('RitualTipScreen')}
            />
          </View>
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
  headerIcon: { height: 24, width: 24 },
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
    bottom:4,
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
});
