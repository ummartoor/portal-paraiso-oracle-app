// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import GradientBox from '../../../components/GradientBox';
// import { Fonts } from '../../../constants/fonts';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const GoalScreen_2 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

//   const goals = [
//     { key: 'find_partner', label: 'Find my perfect partner', icon: require('../../../assets/icons/goalIcon1.png') },
//     { key: 'improve_relationship', label: 'Improve current relationship', icon: require('../../../assets/icons/goalIcon2.png') },
//     { key: 'understand_self', label: 'Understand myself better', icon: require('../../../assets/icons/goalIcon3.png') },
//     { key: 'become_happier', label: 'Become happier', icon: require('../../../assets/icons/goalIcon4.png') },
//     { key: 'personal_growth', label: 'Foster personal growth', icon: require('../../../assets/icons/goalIcon5.png') },
//     { key: 'love_compatibility', label: 'Check love compatibility', icon: require('../../../assets/icons/goalIcon6.png') },
//     { key: 'others', label: 'Others', icon: require('../../../assets/icons/goalIcon7.png') },
//   ];

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bglinearImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />

//         {/* Header with back arrow + progress bar */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Progress Bar */}
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '40%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//           What are your goals?
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//           Goals reveal the balance between your ambition and patience
//         </Text>

//         {/* Scrollable Goal Section with Next Button fixed */}
//         <View style={{ flex: 1, marginTop: 30 }}>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 20 }}
//           >
//             {goals.map(goal => {
//               const isSelected = selectedGoal === goal.key;
//               return (
//                 <TouchableOpacity
//                   key={goal.key}
//                   activeOpacity={0.8}
//                   onPress={() => setSelectedGoal(goal.key)}
//                   style={[
//                     styles.goalBox,
//                     {
//                       borderColor: isSelected ? colors.primary : '#fff',
//                       borderWidth: isSelected ? 1.5 : 1,
//                       backgroundColor: colors.bgBox,
//                     },
//                   ]}
//                 >
//                   <GradientBox
//                     colors={[colors.black, colors.bgBox]}
//                     style={styles.iconWrapper}
//                   >
//                     <Image
//                       source={goal.icon}
//                       style={{ width: 21, height: 21 }}
//                       resizeMode="contain"
//                     />
//                   </GradientBox>
//                   <Text style={styles.goalLabel}>{goal.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>

//           {/* Next Button fixed at bottom */}
//           <View style={styles.footer}>
//             <TouchableOpacity
//               activeOpacity={0.8}
//           onPress={() => navigation.navigate('DateofBirth')}
//               style={{ width: '100%' }}
//             >
//               <GradientBox
//                 colors={[colors.black, colors.bgBox]}
//                 style={[styles.nextBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
//               >
//                 <Text style={styles.nextText}>Next</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default GoalScreen_2;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
//   header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
//   progressBarBackground: {
//     flex: 1,
//     height: 7,
//     backgroundColor: '#4A3F50',
//     borderRadius: 5,
//     marginLeft: 12,
//     overflow: 'hidden',
//   },
//   progressBarFill: { height: '100%', borderRadius: 5, backgroundColor: '#fff' },
//   heading: { fontSize: 32, lineHeight: 36, textAlign: 'center', fontFamily: Fonts.cormorantSCBold, marginBottom: 8 },
//   subheading: { fontSize: 16, textAlign: 'center', fontFamily: Fonts.aeonikRegular },
//   goalBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 53,
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     marginBottom: 12,
//   },
//   iconWrapper: {
//     width: 36,
//     height: 36,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   goalLabel: { fontSize: 14, color: '#fff', fontFamily: Fonts.aeonikRegular },
//   footer: { marginTop: 10, marginBottom: 20 },
//   nextBtn: { height: 56, width: '100%', borderRadius: 65, justifyContent: 'center', alignItems: 'center' },
//   nextText: { fontSize: 16, lineHeight: 20, color: '#fff', fontFamily: Fonts.aeonikRegular },
// });










import React, { useState } from 'react';
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
  Alert, // --- ADDED ---
  ActivityIndicator, // --- ADDED ---
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useRegisterStore } from '../../../store/useRegisterStore'; // --- ADDED ---
import { useTranslation } from 'react-i18next'; 
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const GoalScreen_2 = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

const { t } = useTranslation();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // --- ADDED: Store se function aur loading state lein ---
  const { updateUserDetails, isUpdating } = useRegisterStore();

  const goals = [
    { key: 'find_partner', label: t('goal_find_partner'), icon: require('../../../assets/icons/goalIcon1.png') },
    { key: 'improve_relationship', label: t('goal_improve_relationship'), icon: require('../../../assets/icons/goalIcon2.png') },
    { key: 'understand_self', label: t('goal_understand_self'), icon: require('../../../assets/icons/goalIcon3.png') },
    { key: 'become_happier', label: t('goal_become_happier'), icon: require('../../../assets/icons/goalIcon4.png') },
    { key: 'personal_growth', label: t('goal_personal_growth'), icon: require('../../../assets/icons/goalIcon5.png') },
    { key: 'love_compatibility', label: t('goal_love_compatibility'), icon: require('../../../assets/icons/goalIcon6.png') },
    { key: 'others', label: t('goal_others'), icon: require('../../../assets/icons/goalIcon7.png') },
  ];
  
  // Multiple goals select  ---
  const handleSelectGoal = (goalKey: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalKey)) {
        
        return prev.filter(g => g !== goalKey);
      } else {
      
        return [...prev, goalKey];
      }
    });
  };


  const handleNext = async () => {
    if (selectedGoals.length === 0) {
  Alert.alert(
        t('alert_selection_required_title'),
        t('alert_at_least_one_goal_message')
      );
      return;
    }

    const success = await updateUserDetails({ goals: selectedGoals });
    
    if (success) {
      navigation.navigate('DateofBirth');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header with back arrow + progress bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '40%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white }]}>
         {t('goals_header')}
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
               {t('goals_subheader')}
        </Text>

        <View style={{ flex: 1, marginTop: 30 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {goals.map(goal => {
              // --- UPDATED: 'isSelected' logic for array ---
              const isSelected = selectedGoals.includes(goal.key);
              return (
                <TouchableOpacity
                  key={goal.key}
                  activeOpacity={0.8}
                  // --- UPDATED: onPress handler for multiple selections ---
                  onPress={() => handleSelectGoal(goal.key)}
                  style={[
                    styles.goalBox,
                    {
                      borderColor: isSelected ? colors.primary : '#fff',
                      borderWidth: isSelected ? 1.5 : 1,
                      backgroundColor: colors.bgBox,
                    },
                  ]}
                >
                  <GradientBox
                    colors={[colors.black, colors.bgBox]}
                    style={styles.iconWrapper}
                  >
                    <Image
                      source={goal.icon}
                      style={{ width: 21, height: 21 }}
                      resizeMode="contain"
                    />
                  </GradientBox>
                  <Text style={styles.goalLabel}>{goal.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* --- UPDATED: Next Button with loading state and API call --- */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={{ width: '100%' }}
              disabled={isUpdating}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.nextBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.nextText}>{t('next_button')}</Text>
                )}
              </GradientBox>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default GoalScreen_2;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50',
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5, backgroundColor: '#fff' },
  heading: { fontSize: 32, lineHeight: 36, textAlign: 'center', fontFamily: Fonts.cormorantSCBold, marginBottom: 8 },
  subheading: { fontSize: 16, textAlign: 'center', fontFamily: Fonts.aeonikRegular },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 53,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalLabel: { fontSize: 14, color: '#fff', fontFamily: Fonts.aeonikRegular },
  footer: { marginTop: 10, marginBottom: 20 },
  nextBtn: { height: 56, width: '100%', borderRadius: 65, justifyContent: 'center', alignItems: 'center' },
  nextText: { fontSize: 16, lineHeight: 20, color: '#fff', fontFamily: Fonts.aeonikRegular },
});