// components/InsightTabs.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ViewStyle,
} from 'react-native';

import GradientBox from '../../../../../components/GradientBox';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';

// Tab model (export in case you later want to override internal data)
export type InsightTab = {
  key: string;
  title: string;
  icon: any;        
  description: string;
};

type InsightTabsProps = {
  initialIndex?: number;
  style?: ViewStyle;
  onChange?: (index: number, tab: InsightTab) => void;
};

const TAB_SIZE = 50;

// Default data (icons: update paths if your structure differs)
const DEFAULT_TABS: InsightTab[] = [
  {
    key: 'morning',
    title: 'Morning Vibe',
    icon: require('../../../../../assets/icons/morningVibeIcon.png'),
    description:
      'The day begins with clarity — conversations flow smoothly, and you may receive unexpected support from someone close. Use this energy to set intentions for the day.',
  },
  {
    key: 'career',
    title: 'Career & Work',
    icon: require('../../../../../assets/icons/careerWorkIcon.png'),
    description:
      'Opportunities to collaborate will arise. Avoid overthinking; a quick, confident decision could lead to a breakthrough.',
  },
  {
    key: 'love',
    title: 'Love & Relationships',
    icon: require('../../../../../assets/icons/loveRelationshipIcon.png'),
    description:
      'Emotions feel balanced today. If single, a friendly chat could spark possibilities. If committed, a lighthearted activity with your partner will strengthen your bond.',
  },
  {
    key: 'money',
    title: 'Money & Finances',
    icon: require('../../../../../assets/icons/moneyFinanceIcon.png'),
    description:
      'Finances feel steady. Use the focus to review subscriptions and small expenses; tiny tweaks will add up.',
  },
  {
    key: 'health',
    title: 'Health & Well-being',
    icon: require('../../../../../assets/icons/healthIcon.png'),
    description:
      'Energy is consistent. A short walk or stretch routine will reset your mood and keep momentum through the afternoon.',
  },
  {
    key: 'divine',
    title: 'Divine Guidance',
    icon: require('../../../../../assets/icons/divine.png'),
    description:
      'Trust your intuition. A subtle nudge or repeated sign points you in the right direction today.',
  },
];

const InsightTabs: React.FC<InsightTabsProps> = ({ initialIndex = 0, style, onChange }) => {
  // ✅ dynamic theme colors from store
  const colors = useThemeStore(s => s.theme.colors);

  const tabs = useMemo(() => DEFAULT_TABS, []);
  const [active, setActive] = useState<number>(initialIndex);
  const current = tabs[active];

  const handleSelect = (idx: number) => {
    setActive(idx);
    onChange?.(idx, tabs[idx]);
  };

  return (
    <View style={[styles.card, style]}>
      {/* Tabs Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {tabs.map((t, idx) => {
          const selected = idx === active;

          if (selected) {
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.9}
                onPress={() => handleSelect(idx)}
                style={styles.tabTouchable}
              >
                <GradientBox
                  // gradient on selected tab
                  colors={[colors.black, colors.bgBox]}
                  style={[styles.tabBox, styles.tabSelected, { borderColor: colors.primary }]}
                >
                  <Image
                    source={t.icon}
                    style={[styles.tabIcon, { tintColor: colors.primary }]}
                    resizeMode="contain"
                  />
                </GradientBox>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.9}
              onPress={() => handleSelect(idx)}
              style={styles.tabTouchable}
            >
              <View
                style={[
                  styles.tabBox,
                  { backgroundColor: colors.bgBox, borderColor: 'transparent' },
                ]}
              >
                <Image
                  source={t.icon}
                  style={[styles.tabIcon, { tintColor: 'rgba(255,255,255,0.9)' }]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content for active tab */}
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

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
  },
  tabsRow: {
    paddingVertical: 8,
    gap: 10, // if your RN doesn't support gap, add marginRight on tabTouchable except last
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
  tabSelected: {
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  },
  sectionBody: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
  },
});
