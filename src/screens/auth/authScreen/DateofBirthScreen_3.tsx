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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../constants/fonts';
import DatePicker from 'react-native-date-picker';
import GradientBox from '../../../components/GradientBox';
import { useRegisterStore } from '../../../store/useRegisterStore';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');


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
// --- END OF ZODIAC FUNCTION ---


const DateofBirthScreen_3 = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const { t } = useTranslation();

  const [date, setDate] = useState(new Date(2000, 0, 1));
  const { updateUserDetails, isUpdating } = useRegisterStore();

  const handleNext = async () => {
  
    const formattedDate = date.toISOString().split('T')[0];
    
  
    const zodiacSignKey = getZodiacSign(date);


    const payload = { 
      dob: formattedDate, 
      sign_in_zodiac: zodiacSignKey 
    };
    
    const success = await updateUserDetails(payload);
    
   
    if (success) {
      navigation.navigate('TimeofBirth'); 
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
        </View>
        <Text style={[styles.heading, { color: colors.white }]}>
          {t('dob_header')}
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
          {t('dob_subheader')}
        </Text>
        <View style={styles.dobContainer}>
          <View
            style={[
              styles.dobBox,
              { backgroundColor: colors.bgBox, borderColor: colors.white },
            ]}
          >
            <DatePicker
              date={date}
              mode="date"
              onDateChange={setDate}
              theme="dark"
              style={styles.datePicker}
            />
          </View>
        </View>
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
                <Text style={styles.nextText}>{t('next_button')}</Text>
              )}
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DateofBirthScreen_3;

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
    marginBottom: 35,
  },
  dobContainer: {
    justifyContent: 'center',
  },
  dobBox: {
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  datePicker: {
    width: Dimensions.get('window').width - 80,
    height: 200,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
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











// without Zodaic functionality 

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
//   ActivityIndicator, // --- ADDED ---
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { Fonts } from '../../../constants/fonts';
// import DatePicker from 'react-native-date-picker';
// import GradientBox from '../../../components/GradientBox';
// import { useRegisterStore } from '../../../store/useRegisterStore'; // --- ADDED ---
// import { useTranslation } from 'react-i18next'; 
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const DateofBirthScreen_3 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
// const { t } = useTranslation(); 
//   const [date, setDate] = useState(new Date(2000, 0, 1)); // January 1, 2000

//   // --- ADDED: Get store function and loading state ---
//   const { updateUserDetails, isUpdating } = useRegisterStore();

//   // --- ADDED: Handle 'Next' button press and API call ---
//   const handleNext = async () => {
//     // Format the date to 'YYYY-MM-DD' string format for the API
//     const formattedDate = date.toISOString().split('T')[0];

//     const success = await updateUserDetails({ dob: formattedDate });
    
//     if (success) {
//       navigation.navigate('TimeofBirth');
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

//         {/* Header with back arrow + progress bar */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '60%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//          {t('dob_header')}
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//             {t('dob_subheader')}
//         </Text>

//         {/* DOB Picker inside bgBox */}
//         <View style={styles.dobContainer}>
//           <View
//             style={[
//               styles.dobBox,
//               { backgroundColor: colors.bgBox, borderColor: colors.white },
//             ]}
//           >
//             <DatePicker
//               date={date}
//               mode="date"
//               onDateChange={setDate}
              
          
//               theme="dark" 
//               style={styles.datePicker}
//             />
//           </View>
//         </View>

//         {/* --- UPDATED: Next Button with loading state and API call --- */}
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
//                 <Text style={styles.nextText}>{t('next_button')}</Text>
//               )}
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default DateofBirthScreen_3;

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
//     marginBottom: 35,
//   },
//   dobContainer: {

//     justifyContent: 'center', // Center the date picker vertically
//   },
//   dobBox: {
//     borderWidth: 1,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   datePicker: {
//     width: Dimensions.get('window').width - 80, // Adjust width to fit container
//     height: 200, // Explicit height for picker
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
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