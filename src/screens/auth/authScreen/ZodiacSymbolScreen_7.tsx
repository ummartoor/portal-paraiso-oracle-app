import React, { useState, useEffect } from 'react';
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
  ImageSourcePropType,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useRegisterStore } from '../../../store/useRegisterStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type Zodiac = { key: string; name: string; icon: ImageSourcePropType };

const ZODIACS: Zodiac[] = [
  { key: "aries", name: "Aries", icon: require("../../../assets/icons/AriesIcon.png") },
  { key: "taurus", name: "Taurus", icon: require("../../../assets/icons/TaurusIcon.png") },
  { key: "gemini", name: "Gemini", icon: require("../../../assets/icons/GeminiIcon.png") },
  { key: "cancer", name: "Cancer", icon: require("../../../assets/icons/CancerIcon.png") },
  { key: "leo", name: "Leo", icon: require("../../../assets/icons/leoIcon.png") },
  { key: "virgo", name: "Virgo", icon: require("../../../assets/icons/VirgoIcon.png") },
  { key: "libra", name: "Libra", icon: require("../../../assets/icons/libraIcon.png") },
  { key: "scorpio", name: "Scorpio", icon: require("../../../assets/icons/ScorpioIcon.png") },
  { key: "sagittarius", name: "Sagittarius", icon: require("../../../assets/icons/SagittariusIcon.png")},
  { key: "capricorn", name: "Capricorn", icon: require("../../../assets/icons/CapricornIcon.png") },
  { key: "aquarius", name: "Aquarius", icon: require("../../../assets/icons/AquariusIcon.png") },
  { key: "pisces", name: "Pisces", icon: require("../../../assets/icons/PiscesIcon.png") },
];

const getZodiacSign = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

  return '';
};

const ZodiacSymbolScreen_7: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);

  const { updateUserDetails, isUpdating, userData } = useRegisterStore();

  useEffect(() => {
    if (userData?.dob) {
      const birthDate = new Date(userData.dob);
      const calculatedSign = getZodiacSign(birthDate);
      if (calculatedSign) {
        setSelectedZodiac(calculatedSign);
      }
    }
  }, [userData]);

  const handleNext = async () => {
    if (!selectedZodiac) {
      Alert.alert('Selection Required', 'Please select your Zodiac Symbol to continue.');
      return;
    }

    const success = await updateUserDetails({ sign_in_zodiac: selectedZodiac });

    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
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
            <View style={[styles.progressBarFill, { width: '90%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white, textAlign: 'center' }]}>
          Your Zodiac Symbol
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
          Select Your Zodiac Symbol
        </Text>

        {/* Zodiac Symbols Grid */}
        <ScrollView contentContainerStyle={styles.statusSection}>
          {ZODIACS
            .reduce((rows: Zodiac[][], option, index) => {
              if (index % 3 === 0) rows.push([option]);
              else rows[rows.length - 1].push(option);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <View key={rowIndex} style={styles.statusRow}>
                {row.map((item: Zodiac) => {
                  const isSelected = selectedZodiac === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.statusBox,
                        {
                          borderColor: isSelected ? colors.primary : colors.white,
                          borderWidth: isSelected ? 1.5 : 1,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedZodiac(item.key)}
                    >
                      <Image
                        source={item.icon}
                        style={[
                          styles.iconImage,
                          { tintColor: isSelected ? colors.primary : '#fff' },
                        ]}
                        resizeMode="contain"
                      />
                      <Text
                        style={[
                          styles.statusLabel,
                          {
                            color: isSelected ? colors.primary : '#fff',
                            fontFamily: isSelected
                              ? Fonts.aeonikBold
                              : Fonts.aeonikRegular,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {row.length < 3 &&
                  [...Array(3 - row.length)].map((_, i) => (
                    <View
                      key={`placeholder-${i}`}
                      style={[
                        styles.statusBox,
                        { backgroundColor: 'transparent', borderColor: 'transparent' },
                      ]}
                    />
                  ))}
              </View>
            ))}
        </ScrollView>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
            style={{ width: '100%' }}
            disabled={isUpdating}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.nextBtn,
                { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.nextText}>Finish</Text>
              )}
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ZodiacSymbolScreen_7;

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
  heading: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  statusSection: { paddingVertical: 20 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusBox: {
    width: 100,
    height: 101,
    borderRadius: 16,
    backgroundColor: '#4A3F50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  statusLabel: { fontSize: 14, textAlign: 'center' },
  footer: { marginBottom: 20, marginTop: 'auto' },
  nextBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});





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
//   ImageSourcePropType,
//   Alert, // --- RE-ADDED ---
//   ActivityIndicator, // --- RE-ADDED ---
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import GradientBox from '../../../components/GradientBox';
// import { Fonts } from '../../../constants/fonts';
// import { useRegisterStore } from '../../../store/useRegisterStore'; // --- RE-ADDED ---


// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// type Zodiac = { key: string; name: string; icon: ImageSourcePropType };

// const ZODIACS: Zodiac[] = [
//     { key: 'aries',       name: 'Aries',       icon: require('../../../assets/icons/aries.png') },
//     { key: 'taurus',      name: 'Taurus',      icon: require('../../../assets/icons/taurus.png') },
//     { key: 'gemini',      name: 'Gemini',      icon: require('../../../assets/icons/gemini.png') },
//     { key: 'cancer',      name: 'Cancer',      icon: require('../../../assets/icons/cancer.png') },
//     { key: 'leo',         name: 'Leo',         icon: require('../../../assets/icons/leo.png') },
//     { key: 'virgo',       name: 'Virgo',       icon: require('../../../assets/icons/virgo.png') },
//     { key: 'libra',       name: 'Libra',       icon: require('../../../assets/icons/libra.png') },
//     { key: 'scorpio',     name: 'Scorpio',     icon: require('../../../assets/icons/scorpio.png') },
//     { key: 'sagittarius', name: 'Sagittarius', icon: require('../../../assets/icons/sagittarius.png') },
//     { key: 'capricorn',   name: 'Capricorn',   icon: require('../../../assets/icons/capricorn.png') },
//     { key: 'aquarius',    name: 'Aquarius',    icon: require('../../../assets/icons/aquarius.png') },
//     { key: 'pisces',      name: 'Pisces',      icon: require('../../../assets/icons/pisces.png') },
// ];

// const ZodiacSymbolScreen_7: React.FC = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  
//   // --- RE-ADDED: Get store function and loading state ---
//   const { updateUserDetails, isUpdating } = useRegisterStore();

//   // --- UPDATED: handleNext now calls the API ---
//   const handleNext = async () => {
//     if (!selectedZodiac) {
//       Alert.alert('Selection Required', 'Please select your Zodiac Symbol to continue.');
//       return;
//     }
    
//     // API is called with the selected zodiac sign
//     const success = await updateUserDetails({ sign_in_zodiac: selectedZodiac });
    
//     if (success) {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Login' }], // Navigate to main app screen after final step
//       });
//     }
//   };

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

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '100%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//           Your Zodiac Symbol
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//           Select your Zodiac Symbol
//         </Text>

//         {/* Zodiac Symbols Grid */}
//         <ScrollView contentContainerStyle={styles.statusSection}>
//           {ZODIACS
//             .reduce((rows: Zodiac[][], option, index) => {
//               if (index % 3 === 0) rows.push([option]);
//               else rows[rows.length - 1].push(option);
//               return rows;
//             }, [])
//             .map((row, rowIndex) => (
//               <View key={rowIndex} style={styles.statusRow}>
//                 {row.map((item: Zodiac) => {
//                   const isSelected = selectedZodiac === item.key;
//                   return (
//                     <TouchableOpacity
//                       key={item.key}
//                       style={[
//                         styles.statusBox,
//                         {
//                           borderColor: isSelected ? colors.primary : colors.white,
//                           borderWidth: isSelected ? 1.5 : 1,
//                         },
//                       ]}
//                       activeOpacity={0.8}
//                       onPress={() => setSelectedZodiac(item.key)}
//                     >
//                       <Image
//                         source={item.icon}
//                         style={styles.iconImage}
//                         resizeMode="contain"
//                         tintColor={isSelected ? colors.primary : '#fff'}
//                       />
//                       <Text
//                         style={[
//                           styles.statusLabel,
//                           {
//                             color: isSelected ? colors.primary : '#fff',
//                             fontFamily: isSelected
//                               ? Fonts.aeonikBold
//                               : Fonts.aeonikRegular,
//                           },
//                         ]}
//                       >
//                         {item.name}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//                  {row.length < 3 && [...Array(3 - row.length)].map((_, i) => <View key={`placeholder-${i}`} style={[styles.statusBox, { backgroundColor: 'transparent', borderColor: 'transparent' }]} />)}
//               </View>
//             ))}
//         </ScrollView>

//         {/* Next Button */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.8}
//             onPress={handleNext}
//             style={{ width: '100%' }}
//             disabled={isUpdating}
//           >
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[
//                 styles.nextBtn,
//                 { borderWidth: 1.5, borderColor: colors.primary },
//               ]}
//             >
//               {isUpdating ? (
//                 <ActivityIndicator color={colors.primary} />
//               ) : (
//                 <Text style={styles.nextText}>Finish</Text> 
//               )}
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default ZodiacSymbolScreen_7;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
//   header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
//   progressBarBackground: { flex: 1, height: 7, backgroundColor: '#4A3F50', borderRadius: 5, marginLeft: 12, overflow: 'hidden' },
//   progressBarFill: { height: '100%', borderRadius: 5, backgroundColor: '#fff' },
//   heading: { fontSize: 32, lineHeight: 36, textAlign: 'center', fontFamily: Fonts.cormorantSCBold, marginBottom: 8 },
//   subheading: { fontSize: 16, textAlign: 'center', fontFamily: Fonts.aeonikRegular },
//   statusSection: { paddingVertical: 20 },
//   statusRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
//   statusBox: {
//     width: 100,
//     height: 101,
//     borderRadius: 16,
//     backgroundColor: '#4A3F50',
//     justifyContent: 'center',
//     alignItems: 'center',

//   },
//   iconImage: {
//     width: 40,
//     height: 40,
//     marginBottom: 8,
//   },
//   statusLabel: { fontSize: 14, textAlign: 'center' },
//   footer: { marginBottom: 20, marginTop: 'auto' },
//   nextBtn: { height: 56, width: '100%', borderRadius: 65, justifyContent: 'center', alignItems: 'center' },
//   nextText: { fontSize: 16, lineHeight: 20, color: '#fff', fontFamily: Fonts.aeonikRegular },
// });