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
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';

import { useRegisterStore } from '../../../store/useRegisterStore'; 
import { useTranslation } from 'react-i18next';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const GenderScreen_1 = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

     const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  // --- ADDED: Local loading state ---
  const [isLoading, setIsLoading] = useState(false);

  // --- UPDATED: useRegisterStore  ---
  const { updateUserDetails } = useRegisterStore();

  const handleNext = async () => {
             Vibration.vibrate([0, 35, 40, 35]);
    if (!selectedGender) {
      Alert.alert('Selection Required', 'Please select your gender to continue.');
      return;
    }

    setIsLoading(true);
    // Call the API with the selected gender
    const success = await updateUserDetails({ gender: selectedGender });
    setIsLoading(false);

    // Navigate to the next screen only if the API call was successful
    if (success) {
      navigation.navigate('GoalScreen');
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
            <View style={[styles.progressBarFill, { width: '20%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white }]}>
                {t('gender_header')}
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
      {t('gender_subheader')}
        </Text>

        {/* Gender Options Centered */}
        <View style={styles.genderSection}>
          <View style={styles.genderRow}>
            {[
              {
                key: 'male',
                label: t('gender_male'),
                icon: require('../../../assets/icons/maleIcon.png'),
              },
              {
                key: 'female',
                label:  t('gender_female'),
                icon: require('../../../assets/icons/femaleIcon.png'),
              },
              {
                key: 'other',
                label: t('gender_non_binary'),
                icon: require('../../../assets/icons/nonBinaryIcon.png'),
              },
            ].map(item => {
              const isSelected = selectedGender === item.key;
              return (
                <View key={item.key} style={{ flex: 1, alignItems: 'center' }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                               Vibration.vibrate([0, 35, 40, 35]);
                      setSelectedGender(item.key)}
                    }
                  >
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={[
                        styles.genderBox,
                        {
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? colors.primary : colors.white,
                        },
                      ]}
                    >
                      <Image
                        source={item.icon}
                        style={{
                          width: 50,
                          height: 50,
                          tintColor: isSelected ? colors.primary : '#8D8B8E',
                        }}
                        resizeMode="contain"
                      />
                    </GradientBox>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.genderLabel,
                      {
                        color: isSelected ? colors.primary : '#fff',
                        fontFamily: isSelected
                          ? Fonts.aeonikBold
                          : Fonts.aeonikRegular,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Next Button fixed at bottom */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.nextBtn,
                { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.nextText}>{t('next_button')}</Text>
              )}
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default GenderScreen_1;

// --- Styles unchanged ---
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50',
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  genderSection: {
    flex: 1,
    justifyContent: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  genderBox: {
    height: 100,
    width: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderLabel: {
    fontSize: 14,
    marginTop: 8,
    fontFamily: Fonts.aeonikRegular,
    textAlign: 'center',
  },
  footer: {
    marginBottom: 40,
  },
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
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import GradientBox from '../../../components/GradientBox';
// import { Fonts } from '../../../constants/fonts';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const GenderScreen_1 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [selectedGender, setSelectedGender] = useState<string | null>(null);

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
//             <View style={[styles.progressBarFill, { width: '20%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//           What's your gender?
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//           Gender reveals the balance of your masculine and feminine energy
//         </Text>

//         {/* Gender Options Centered */}
//         <View style={styles.genderSection}>
//           <View style={styles.genderRow}>
//             {[
//               {
//                 key: 'male',
//                 label: 'Male',
//                 icon: require('../../../assets/icons/maleIcon.png'),
//               },
//               {
//                 key: 'female',
//                 label: 'Female',
//                 icon: require('../../../assets/icons/femaleIcon.png'),
//               },
//               {
//                 key: 'other',
//                 label: 'Non Binary',
//                 icon: require('../../../assets/icons/nonBinaryIcon.png'),
//               },
//             ].map(item => {
//               const isSelected = selectedGender === item.key;
//               return (
//                 <View key={item.key} style={{ flex: 1, alignItems: 'center' }}>
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={() => setSelectedGender(item.key)}
//                   >
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={[
//                         styles.genderBox,
//                         {
//                           borderWidth: isSelected ? 1.5 : 1,
//                           borderColor: isSelected ? colors.primary : colors.white,
//                         },
//                       ]}
//                     >
//                       <Image
//                         source={item.icon}
//                         style={{
//                           width: 50,
//                           height: 50,
//                           tintColor: isSelected ? colors.primary : '#8D8B8E',
//                         }}
//                         resizeMode="contain"
//                       />
//                     </GradientBox>
//                   </TouchableOpacity>
//                   <Text
//                     style={[
//                       styles.genderLabel,
//                       {
//                         color: isSelected ? colors.primary : '#fff',
//                         fontFamily: isSelected
//                           ? Fonts.aeonikBold
//                           : Fonts.aeonikRegular,
//                       },
//                     ]}
//                   >
//                     {item.label}
//                   </Text>
//                 </View>
//               );
//             })}
//           </View>
//         </View>

//         {/* Next Button fixed at bottom */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.8}
//             onPress={() => navigation.navigate('GoalScreen')}
//             style={{ width: '100%' }}
//           >
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[
//                 styles.nextBtn,
//                 { borderWidth: 1.5, borderColor: colors.primary },
//               ]}
//             >
//               <Text style={styles.nextText}>Next</Text>
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default GenderScreen_1;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   progressBarBackground: {
//     flex: 1,
//     height: 7,
//     backgroundColor: '#4A3F50',
//     borderRadius: 5,
//     marginLeft: 12,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     borderRadius: 5,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 32,
//     lineHeight: 36,
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,

//   },
//   genderSection: {
//     flex: 1,
//     justifyContent: 'center', 
//   },
//   genderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   genderBox: {
//     height: 100,
//     width: 100,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   genderLabel: {
//     fontSize: 14,
//     marginTop: 8,
//     fontFamily: Fonts.aeonikRegular,
//     textAlign: 'center',
//   },
//   footer: {
//     marginBottom: 40,
//   },
//   nextBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });
