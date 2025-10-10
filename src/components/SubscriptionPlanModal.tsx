import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image, // --- ADDED ---
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import GradientBox from './GradientBox';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

type PlanKey = 'yearly' | 'monthly' | 'weekly';

interface SubscriptionPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (plan: PlanKey) => void;
}

// --- CardContent Component ko bahar nikala gaya hai taake code saaf rahe ---
const CardContent = ({
  p,
  isActive,
  colors,
  t, // t function ko as a prop pass kiya gaya hai
}: {
  p: { title: string; sub: string; strike?: string; perWeek: string; badge?: string };
  isActive: boolean;
  colors: any;
  t: (key: string) => string;
}) => (
  <>
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
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primary + '22', borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>{p.badge}</Text>
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
        {t('subscription_per_week')}
      </Text>
    </View>
  </>
);

const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const colors = useThemeStore((s) => s.theme.colors);
  const [selected, setSelected] = useState<PlanKey>('yearly');
  const { t } = useTranslation();


  const plans: Record<
    PlanKey,
    { title: string; sub: string; strike?: string; perWeek: string; badge?: string }
  > = {
    yearly: {
      title: t('subscription_yearly'),
      sub: t('subscription_12_mo'),
      strike: '$39.99',
      perWeek: '$3.34',
      badge: t('subscription_save_55'),
    },
    monthly: { title: t('subscription_monthly'), sub: t('subscription_1_mo'), strike: '$3.99', perWeek: '$1.34' },
    weekly: { title: t('subscription_weekly'), sub: t('subscription_4_week'), strike: '$1.99', perWeek: '$1.34' },
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
          isActive && { backgroundColor: colors.white, borderColor: colors.primary, borderWidth: 2 },
        ]}
      >
        {isActive ? (
          <View style={[styles.gradientCard]}>
            <CardContent p={p} isActive={isActive} colors={colors} t={t as any} />
          </View>
        ) : (
          <GradientBox colors={[colors.bgBox, colors.black]} style={styles.gradientCard}>
            <CardContent p={p} isActive={isActive} colors={colors} t={t as any} />
          </GradientBox>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles.overlayBackground]}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.bgBox }]}>
            {/* --- CHANGED: Heading translated --- */}
            <Text style={[styles.heading, { color: colors.primary }]}>
              {t('subscription_plan_title')}
            </Text>

            <ImageBackground
              source={require('../assets/images/heroImage.png')}
              style={[styles.hero, { width: SCREEN_WIDTH - 40 }]}
              resizeMode="cover"
            >
              <View style={styles.heroOverlay}>
                {/* --- CHANGED: Hero title translated --- */}
                <Text style={[styles.heroTitle, { color: colors.white }]}>
                  {t('subscription_unlock_title')}
                </Text>
              </View>
            </ImageBackground>

            <View style={styles.cardsWrap}>
              <Card k="yearly" withShadow />
              <Card k="monthly" />
              <Card k="weekly" />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={[styles.cancelButton, { backgroundColor: colors.white }]}
              >
                <Text style={[styles.cancelText, { color: colors.black }]}>
                  {/* --- CHANGED: Cancel button translated --- */}
                  {t('cancel_button')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.gradientTouchable, { borderColor: colors.primary, borderWidth: 1.6 }]}
                onPress={() => onConfirm(selected)}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles.gradientFill}
                >
                  {/* --- CHANGED: Start Now button translated --- */}
                  <Text style={styles.startText}>{t('subscription_start_now')}</Text>
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubscriptionPlanModal;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  overlayBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heading: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    marginBottom: 10,
  },
  hero: {
    height: 200,
    // borderRadius: 16,
    overflow: 'hidden',
    marginBottom: -40, 
  },
  heroOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  heroTitle: {
    fontFamily: Fonts.aeonikBold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom:20

  },
  cardsWrap: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    minHeight: 74,
    borderRadius: 16,
  },
  gradientCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
  },
  shadowCard: {
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
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    columnGap: 12,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  cancelButton: {
    flexGrow: 1,
    flexBasis: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
  },
  cancelText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 24,
  },
  gradientTouchable: {
    flexGrow: 1,
    flexBasis: 0,
    height: 50,
    borderRadius: 200,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 18,
    color: '#fff',
  },
});
