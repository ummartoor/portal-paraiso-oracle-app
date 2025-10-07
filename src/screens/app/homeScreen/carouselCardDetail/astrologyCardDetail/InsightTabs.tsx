import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { HoroscopeData } from '../../../../../store/useAstologyStore';

export type InsightTab = {
  key: string;
  title: string;
  icon: any;
  description: string;
};

type InsightTabsProps = {
  horoscopeData: HoroscopeData;
  style?: ViewStyle;
};

const TAB_SIZE = 47;

const InsightTabs: React.FC<InsightTabsProps> = ({ horoscopeData, style }) => {
  const colors = useThemeStore(s => s.theme.colors);
  const { t } = useTranslation();
  const [active, setActive] = useState<number>(0);

  const DEFAULT_TABS: Omit<InsightTab, 'description'>[] = [
    { key: 'morning', title: t('insight_tabs_morning'), icon: require('../../../../../assets/icons/morningVibeIcon.png') },
    { key: 'career', title: t('insight_tabs_career'), icon: require('../../../../../assets/icons/careerWorkIcon.png') },
    { key: 'love', title: t('insight_tabs_love'), icon: require('../../../../../assets/icons/loveRelationshipIcon.png') },
    { key: 'money', title: t('insight_tabs_money'), icon: require('../../../../../assets/icons/moneyFinanceIcon.png') },
    { key: 'health', title: t('insight_tabs_health'), icon: require('../../../../../assets/icons/healthIcon.png') },
    { key: 'divine', title: t('insight_tabs_divine'), icon: require('../../../../../assets/icons/divine.png') },
  ];

  const tabs: InsightTab[] = useMemo(() => {
    if (!horoscopeData) return [];
    return DEFAULT_TABS.map(tab => {
      switch (tab.key) {
        case 'morning': return { ...tab, description: horoscopeData.data.morning_vibe };
        case 'career': return { ...tab, description: horoscopeData.data.career_and_work };
        case 'love': return { ...tab, description: horoscopeData.data.love_and_relationship };
        case 'money': return { ...tab, description: horoscopeData.data.money_and_finance };
        case 'health': return { ...tab, description: horoscopeData.data.health_and_wellbeing };
        case 'divine': return { ...tab, description: horoscopeData.data.divine_guidance };
        default: return { ...tab, description: '' };
      }
    });
  }, [horoscopeData, t]);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[active];

  const handleSelect = (idx: number) => {
    setActive(idx);
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.tabsRow}>
        {tabs.map((tabItem, idx) => {
          const selected = idx === active;
          return (
            <TouchableOpacity
              key={tabItem.key}
              activeOpacity={0.9}
              onPress={() => handleSelect(idx)}
              style={styles.tabTouchable}
            >
              {selected ? (
                <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.tabBox, { borderColor: colors.primary }]}>
                  <Image source={tabItem.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </GradientBox>
              ) : (
                <View style={[styles.tabBox, { backgroundColor: colors.bgBox, borderColor: 'transparent' }]}>
                  <Image source={tabItem.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.primary }]} numberOfLines={2}>
        {current.title}
      </Text>
      <Text style={[styles.sectionBody, { color: colors.white }]}>
        {current.description}
      </Text>
    </View>
  );
};

export default InsightTabs;

const styles = StyleSheet.create({
  card: {
    marginTop: 30,
    width: '100%',
  },
  tabsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tabTouchable: {},
  tabBox: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sectionBody: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
    textAlign: 'center',
  },
});
