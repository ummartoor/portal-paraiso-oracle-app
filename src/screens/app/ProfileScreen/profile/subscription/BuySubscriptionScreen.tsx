import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type PlanKey = 'yearly' | 'monthly' | 'weekly';

const BuySubscriptionScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState<PlanKey>('yearly');

  const plans: Record<PlanKey, {
    title: string;
    sub: string;
    strike?: string;
    perWeek: string;
    badge?: string;
  }> = {
    yearly:   { title: 'Yearly',  sub: '12 mo', strike: '$39.99', perWeek: '$3.34', badge: 'Save 55%' },
    monthly:  { title: 'Monthly', sub: '1 mo',  strike: '$3.99',  perWeek: '$1.34' },
    weekly:   { title: 'Weekly',  sub: '4 week', strike: '$1.99', perWeek: '$1.34' },
  };

  const onStart = () => {
    // TODO: start trial / purchase flow with `selected` plan
  };

  const Card = ({ k, withShadow }: { k: PlanKey; withShadow?: boolean }) => {
    const p = plans[k];
    const isActive = selected === k;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelected(k)}
        style={[
          styles.card,
          withShadow && styles.shadowCard,
          {
            backgroundColor: isActive ? colors.white : colors.bgBox,
            borderColor: isActive ? colors.primary : 'transparent',
          },
        ]}
      >
        {/* Left title area */}
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text
              style={[
                styles.cardTitle,
                { color: isActive ? colors.black : colors.white },
              ]}
            >
              {p.title}
            </Text>

            {p.badge ? (
              <View style={[styles.badge, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {p.badge}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.subRow}>
            <Text
              style={[
                styles.subText,
                { color: isActive ? colors.black : colors.white, opacity: 0.9 },
              ]}
            >
              {p.sub}
            </Text>

            {p.strike ? (
              <Text
                style={[
                  styles.strike,
                { color: isActive ? colors.black : colors.white, opacity: 0.6 },
                ]}
              >
                {p.strike}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right price area */}
        <View style={styles.priceCol}>
          <Text
            style={[
              styles.price,
              { color: isActive ? colors.black : colors.white },
            ]}
          >
            {p.perWeek}
          </Text>
          <Text
            style={[
              styles.perWeek,
              { color: isActive ? colors.black : colors.white, opacity: 0.7 },
            ]}
          >
            per week
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              Subscription
            </Text>
          </View>
        </View>

        {/* Full-bleed hero image (300 height) */}
        <View style={[styles.heroWrap, { width: SCREEN_WIDTH, marginHorizontal: -20 }]}>
          <Image
            source={require('../../../../../assets/images/heroImage.png')} // your asset
            style={styles.hero}
            resizeMode="cover"
          />

          {/* centered text near the top */}
          <View style={styles.heroTopOverlay}>
            <Text style={[styles.heroTitle, { color: colors.white }]}>
              Unlock Your Cosmic Potential
            </Text>
          </View>
        </View>

        {/* Plan cards (first overlaps hero) */}
        <View style={styles.cardsWrap}>
          <Card k="yearly" withShadow />
          <Card k="monthly" />
          <Card k="weekly" />
        </View>

        {/* Bottom button */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} style={{ width: '100%' }} onPress={onStart}>
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
            >
              <Text style={styles.actionText}>Start Free • Cancel Anytime</Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default BuySubscriptionScreen;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,   // page padding
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },

  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },

  // HERO
  heroWrap: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    // marginHorizontal handled inline to make it full-bleed
    position: 'relative',
  },
  hero: { width: '100%', height: '100%' },

  // Text centered near the top of hero
  heroTopOverlay: {
    position: 'absolute',
    top: 220,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    textAlign: 'center',
  },

  // CARDS
  cardsWrap: {
    gap: 12,
    marginTop: -32, // overlap first card half onto the hero
    zIndex: 2,
  },

  card: {
    minHeight: 74,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadowCard: {
    // subtle floating effect for the overlapping first card
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginTop: 4,
  },
  subText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
  },
  strike: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },

  badge: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 10,
  },

  priceCol: { alignItems: 'flex-end' },
  price: { fontFamily: Fonts.aeonikBold, fontSize: 16 },
  perWeek: { fontFamily: Fonts.aeonikRegular, fontSize: 12, marginTop: 2 },

  footer: {
    paddingTop: 16,
    paddingBottom: Platform.select({ ios: 8, android: 28 }),
  },
  actionBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});
