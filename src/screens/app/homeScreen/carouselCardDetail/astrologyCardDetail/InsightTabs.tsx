// // components/InsightTabs.tsx
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ViewStyle,
// } from 'react-native';

// import GradientBox from '../../../../../components/GradientBox';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';

// export type InsightTab = {
//   key: string;
//   title: string;
//   icon: any;
//   description: string;
// };

// type InsightTabsProps = {
//   initialIndex?: number;
//   style?: ViewStyle;
//   onChange?: (index: number, tab: InsightTab) => void;
// };

// const TAB_SIZE = 47;   // as you set
// const TAB_SPACING = 7; // as you set

// const DEFAULT_TABS: InsightTab[] = [
//   {
//     key: 'morning',
//     title: 'Morning Vibe',
//     icon: require('../../../../../assets/icons/morningVibeIcon.png'),
//     description:
//       'The day begins with clarity — conversations flow smoothly, and you may receive unexpected support from someone close. Use this energy to set intentions for the day.',
//   },
//   {
//     key: 'career',
//     title: 'Career & Work',
//     icon: require('../../../../../assets/icons/careerWorkIcon.png'),
//     description:
//       'Opportunities to collaborate will arise. Avoid overthinking; a quick, confident decision could lead to a breakthrough.',
//   },
//   {
//     key: 'love',
//     title: 'Love & Relationships',
//     icon: require('../../../../../assets/icons/loveRelationshipIcon.png'),
//     description:
//       'Emotions feel balanced today. If single, a friendly chat could spark possibilities. If committed, a lighthearted activity with your partner will strengthen your bond.',
//   },
//   {
//     key: 'money',
//     title: 'Money & Finances',
//     icon: require('../../../../../assets/icons/moneyFinanceIcon.png'),
//     description:
//       'Finances feel steady. Use the focus to review subscriptions and small expenses; tiny tweaks will add up.',
//   },
//   {
//     key: 'health',
//     title: 'Health & Well-being',
//     icon: require('../../../../../assets/icons/healthIcon.png'),
//     description:
//       'Energy is consistent. A short walk or stretch routine will reset your mood and keep momentum through the afternoon.',
//   },
//   {
//     key: 'divine',
//     title: 'Divine Guidance',
//     icon: require('../../../../../assets/icons/divine.png'),
//     description:
//       'Trust your intuition. A subtle nudge or repeated sign points you in the right direction today.',
//   },
// ];

// const InsightTabs: React.FC<InsightTabsProps> = ({ initialIndex = 0, style, onChange }) => {
//   const colors = useThemeStore(s => s.theme.colors);

//   const tabs = useMemo(() => DEFAULT_TABS, []);
//   const [active, setActive] = useState<number>(initialIndex);
//   const current = tabs[active];

//   const handleSelect = (idx: number) => {
//     setActive(idx);
//     onChange?.(idx, tabs[idx]);
//   };

//   return (
//     <View style={[styles.card, style]}>
//       {/* Tabs Row (no scroll, full width) */}
//       <View style={styles.tabsRow}>
//         {tabs.map((t, idx) => {
//           const selected = idx === active;
//           const isLast = idx === tabs.length - 1;

//           if (selected) {
//             return (
//               <TouchableOpacity
//                 key={t.key}
//                 activeOpacity={0.9}
//                 onPress={() => handleSelect(idx)}
//                 style={[styles.tabTouchable, !isLast && { marginRight: TAB_SPACING }]}
//               >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={[styles.tabBox, styles.tabSelected, { borderColor: colors.primary }]}
//                 >
//                   <Image
//                     source={t.icon}
//                     style={[styles.tabIcon, { tintColor: colors.white }]}
//                     resizeMode="contain"
//                   />
//                 </GradientBox>
//               </TouchableOpacity>
//             );
//           }

//           return (
//             <TouchableOpacity
//               key={t.key}
//               activeOpacity={0.9}
//               onPress={() => handleSelect(idx)}
//               style={[styles.tabTouchable, !isLast && { marginRight: TAB_SPACING }]}
//             >
//               <View
//                 style={[
//                   styles.tabBox,
//                   { backgroundColor: colors.bgBox, borderColor: 'transparent' },
//                 ]}
//               >
//                 <Image
//                   source={t.icon}
//                   style={[styles.tabIcon, { tintColor: colors.white }]} 
//                   resizeMode="contain"
//                 />
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Content for active tab */}
//       <Text style={[styles.sectionTitle, { color: colors.primary }]} numberOfLines={2}>
//         {current.title}
//       </Text>
//       <Text style={[styles.sectionBody, { color: colors.white }]}>
//         {current.description}
//       </Text>
//     </View>
//   );
// };

// export default InsightTabs;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   card: {
//     marginTop: 30,
//     width: '100%',
//   },
//   tabsRow: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
    
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//   },
//   tabTouchable: {
  
//   },
//   tabBox: {
//     width: TAB_SIZE,
//     height: TAB_SIZE,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   tabSelected: {
//     shadowOpacity: 0.18,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 2,
//   },
//   tabIcon: {
//     width: 22,
//     height: 22,
//   },
//   sectionTitle: {
//     marginTop: 16,
//     marginBottom: 8,
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 16,
//     letterSpacing: 0.6,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//   },
//   sectionBody: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 20,
//     opacity: 0.95,
//     textAlign: 'center',
//   },
// });











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

import { HoroscopeData } from '../../../../../store/useAstologyStore';

export type InsightTab = {
  key: string;
  title: string;
  icon: any;
  description: string;
};

// --- MODIFIED: Props now accept horoscopeData ---
type InsightTabsProps = {
  horoscopeData: HoroscopeData;
  style?: ViewStyle;
};

const TAB_SIZE = 47;
const TAB_SPACING = 7;


const DEFAULT_TABS: Omit<InsightTab, 'description'>[] = [
  { key: 'morning', title: 'Morning Vibe', icon: require('../../../../../assets/icons/morningVibeIcon.png') },
  { key: 'career', title: 'Career & Work', icon: require('../../../../../assets/icons/careerWorkIcon.png') },
  { key: 'love', title: 'Love & Relationships', icon: require('../../../../../assets/icons/loveRelationshipIcon.png') },
  { key: 'money', title: 'Money & Finances', icon: require('../../../../../assets/icons/moneyFinanceIcon.png') },
  { key: 'health', title: 'Health & Well-being', icon: require('../../../../../assets/icons/healthIcon.png') },
  { key: 'divine', title: 'Divine Guidance', icon: require('../../../../../assets/icons/divine.png') },
];

const InsightTabs: React.FC<InsightTabsProps> = ({ horoscopeData, style }) => {
  const colors = useThemeStore(s => s.theme.colors);
  const [active, setActive] = useState<number>(0);

  // --- NEW: This memo creates the dynamic tabs based on API data ---
  const tabs: InsightTab[] = useMemo(() => {
    if (!horoscopeData) return []; // Return empty if no data

    // Map the API data to the description of each default tab
    return DEFAULT_TABS.map(tab => {
        switch (tab.key) {
            case 'morning': return { ...tab, description: horoscopeData.morning_vibe };
            case 'career': return { ...tab, description: horoscopeData.career_and_work };
            case 'love': return { ...tab, description: horoscopeData.love_and_relationship };
            case 'money': return { ...tab, description: horoscopeData.money_and_finance };
            case 'health': return { ...tab, description: horoscopeData.health_and_wellbeing };
            case 'divine': return { ...tab, description: horoscopeData.divine_guidance };
            default: return { ...tab, description: '' }; // Fallback
        }
    });
  }, [horoscopeData]); 

  
  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[active];

  const handleSelect = (idx: number) => {
    setActive(idx);
  };

  return (
    <View style={[styles.card, style]}>
      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {tabs.map((t, idx) => {
          const selected = idx === active;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.9}
              onPress={() => handleSelect(idx)}
              style={styles.tabTouchable}
            >
              {selected ? (
                <GradientBox colors={[colors.black, colors.bgBox]} style={[styles.tabBox, { borderColor: colors.primary }]}>
                  <Image source={t.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </GradientBox>
              ) : (
                <View style={[styles.tabBox, { backgroundColor: colors.bgBox, borderColor: 'transparent' }]}>
                  <Image source={t.icon} style={[styles.tabIcon, { tintColor: colors.white }]} resizeMode="contain" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

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