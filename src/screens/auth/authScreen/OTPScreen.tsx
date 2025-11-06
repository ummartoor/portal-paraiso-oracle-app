
// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView, 
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator, 
//   Alert,
//   NativeSyntheticEvent,
//   TextInputKeyPressEventData,
//   Vibration, 
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; 
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import GradientBox from '../../../components/GradientBox';
// import { useAuthStore } from '../../../store/useAuthStore'; 
// import { useTranslation } from 'react-i18next';
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// //  Type for route params ---
// type OTPScreenRouteProp = RouteProp<AuthStackParamsList, 'OTPScreen'>;

// const OTPScreen = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
//    const { t } = useTranslation(); 
//   //  Get email from previous screen ---
//   const route = useRoute<OTPScreenRouteProp>();
//   const { email } = route.params;

//   //  Get store functions ---
//   const { verifyOtp, forgotPassword} = useAuthStore();

//   const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
//   const [timer, setTimer] = useState(120);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const inputRefs = useRef<(TextInput | null)[]>([]);

//   useEffect(() => {
//     if (timer <= 0) return;
//     const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleChange = (text: string, index: number) => {
//     if (!/^\d*$/.test(text)) return;
//     const newOtp = [...otp];
//     newOtp[index] = text;
//     setOtp(newOtp);

//     if (text && index < otp.length - 1) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };
  
//   // --- ADDED: Handle backspace key press ---
//   const handleKeyPress = (
//     e: NativeSyntheticEvent<TextInputKeyPressEventData>,
//     index: number,
//   ) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const formatTimer = () => {
//     const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
//     const seconds = String(timer % 60).padStart(2, '0');
//     return `${minutes}:${seconds}`;
//   };

//   // --- UPDATED: Handle OTP verification ---
//   const handleContinue = async () => {
//              Vibration.vibrate([0, 35, 40, 35]);
//     const otpString = otp.join('');
//     if (otpString.length !== 6) {
//       Alert.alert(t('alert_error_title'), t('alert_otp_incomplete_message'));
//       return;
//     }
    
//     setIsVerifying(true);
//     const success = await verifyOtp(email, otpString);
//     if (success) {
//       // Pass email to the next screen
//                Vibration.vibrate([0, 35, 40, 35]);
//       navigation.navigate('ConfirmPassword', { email });
//     }
//     setIsVerifying(false);
//   };
  
//   // --- ADDED: Handle Resend OTP ---
// const handleResend = async () => {
//   setIsResending(true);
//   // Call forgotPassword from the store to resend OTP
//   const success = await forgotPassword(email); // <--- Use forgotPassword here
//   if (success) {
//     // If the backend successfully sent a new OTP, reset the timer
//     setTimer(120);
//     // Clear current OTP digits for a better user experience,
//     // so they don't try to submit the old OTP.
//     setOtp(Array(6).fill(''));
//     // Optionally, focus the first input for convenience
//     inputRefs.current[0]?.focus();
//   }
//   setIsResending(false);
// };

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
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             <Text style={[styles.heading, { color: colors.white }]}>
//                     {t('otp_header')}
//             </Text>
//             <Text style={[styles.subheading, { color: colors.primary }]}>
//                {t('otp_subheader')}
//             </Text>

//             <Text style={[styles.label, { color: colors.white }]}>
//            {t('otp_label')}
//             </Text>
//             <View style={styles.otpContainer}>
//               {otp.map((digit, index) => (
//                 <TextInput
//                   key={index}
//                   ref={ref => {
//                     inputRefs.current[index] = ref;
//                   }}
//                   style={[
//                     styles.otpInput,
//                     { backgroundColor: colors.bgBox, color: colors.white },
//                   ]}
//                   keyboardType="number-pad"
//                   maxLength={1}
//                   value={digit}
//                   onChangeText={text => handleChange(text, index)}
//                   onKeyPress={e => handleKeyPress(e, index)} // --- ADDED ---
//                   autoFocus={index === 0}
//                 />
//               ))}
//             </View>

//             <View style={styles.timerRow}>
//               <Text style={[styles.timerText, { color: colors.white }]}>
//                 {formatTimer()}
//               </Text>
//               <TouchableOpacity onPress={handleResend} disabled={timer > 0 || isResending}>
//                 <View style={styles.resendContainer}>
//                   {isResending ? (
//                     <ActivityIndicator size="small" color={colors.primary} />
//                   ) : (
//                     <Text
//                       style={[
//                         styles.resendText,
//                         { color: timer > 0 ? '#aaa' : colors.primary },
//                       ]}
//                     >
//               {t('resend_button')}
//                     </Text>
//                   )}
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={handleContinue}
//               style={{ width: '100%' }}
//               disabled={isVerifying} // --- ADDED ---
//             >
//               <GradientBox
//                 colors={[colors.black, colors.bgBox]}
//                 style={[
//                   styles.continueBtn,
//                   { borderWidth: 1, borderColor: colors.primary },
//                 ]}
//               >
//                 {isVerifying ? (
//                   <ActivityIndicator color={colors.primary} />
//                 ) : (
//                   <Text style={styles.continueText}>{t('continue_button')}</Text>
//                 )}
//               </GradientBox>
//             </TouchableOpacity>

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>{t('back_to_footer')}</Text>
//               <TouchableOpacity onPress={() =>  {
//                          Vibration.vibrate([0, 35, 40, 35]);
//                 navigation.navigate('Login')}}>
//                 <Text style={[styles.signupLink, { color: colors.primary }]}>
//                   {' '}
//                 {t('signin_footer_link')}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default OTPScreen;

// // Styles are unchanged, except for one addition
// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1 },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingTop: 80,
//     paddingBottom: 40,
//     alignItems: 'center',
//   },
//   heading: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 36,
//     lineHeight: 43,
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subheading: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   label: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     alignSelf: 'flex-start',
//     marginBottom: 10,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 20,
//   },
//   otpInput: {
//     width: 48,
//     height: 58,
//     borderRadius: 12,
//     textAlign: 'center',
//     fontSize: 20,
//     fontFamily: Fonts.aeonikRegular,
//   },
//   timerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 30,
//   },
//   timerText: {
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//   },
//   // --- ADDED ---
//   resendContainer: {
//     minWidth: 50, // To prevent layout shift when indicator appears
//     alignItems: 'flex-end',
//   },
//   resendText: {
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//     textDecorationLine: 'underline',
//   },
//   continueBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   continueText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 115,
//   },
//   footerText: {
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//     color: '#fff',
//   },
//   signupLink: {
//     fontSize: 14,
//     lineHeight: 18,
//     fontFamily: Fonts.aeonikRegular,
//     textDecorationLine: 'underline',
//   },
// });















import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator, 
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  // Vibration, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import GradientBox from '../../../components/GradientBox';
import { useAuthStore } from '../../../store/useAuthStore'; 
import { useTranslation } from 'react-i18next';
import { useHaptic } from "../../../hooks/useHaptic"; 
import { HapticFeedbackTypes } from "react-native-haptic-feedback";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

//  Type for route params ---
type OTPScreenRouteProp = RouteProp<AuthStackParamsList, 'OTPScreen'>;

const OTPScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
   const { t } = useTranslation(); 
     const { trigger: triggerHaptic } = useHaptic();
  //  Get email from previous screen ---
  const route = useRoute<OTPScreenRouteProp>();
  const { email } = route.params;

  //  Get store functions ---
  const { verifyOtp, forgotPassword} = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(120);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // --- UPDATED: Handle OTP Paste & Single Digit Input ---
  const handleChange = (text: string, index: number) => {
    // Validation: Sirf digits allow karein
    if (!/^\d*$/.test(text)) return;

    // --- PASTE LOGIC ---
    // Agar user ne pehle box (index 0) mein 6-digit code paste kiya hai
    if (index === 0 && text.length === 6) {
      const newOtp = text.split(''); // Code ko array mein baantein ('123456' -> ['1', '2', ...])
      setOtp(newOtp);

      // Focus ko aakhri input par bhej dein
      inputRefs.current[otp.length - 1]?.focus();
      return; // Function ko yahin rok dein
    }

    // --- SINGLE DIGIT LOGIC (Aapka original logic) ---
    // Agar paste nahi hua hai, ya 1 digit se kam hai
    if (text.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Agar text enter kiya hai, toh agle input par focus karein
      if (text && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  // --- Handle backspace key press ---
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTimer = () => {
    const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // --- Handle OTP verification ---
  const handleContinue = async () => {
                   triggerHaptic(HapticFeedbackTypes.impactLight); 
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert(t('alert_error_title'), t('alert_otp_incomplete_message'));
      return;
    }
    
    setIsVerifying(true);
    const success = await verifyOtp(email, otpString);
    if (success) {
      // Pass email to the next screen
                     triggerHaptic(HapticFeedbackTypes.impactLight); 
      navigation.navigate('ConfirmPassword', { email });
    }
    setIsVerifying(false);
  };
  
  // --- Handle Resend OTP ---
const handleResend = async () => {
  setIsResending(true);
  const success = await forgotPassword(email); 
  if (success) {
    setTimer(120);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();
  }
  setIsResending(false);
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.heading, { color: colors.white }]}>
                    {t('otp_header')}
            </Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
               {t('otp_subheader')}
            </Text>

            <Text style={[styles.label, { color: colors.white }]}>
           {t('otp_label')}
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    { backgroundColor: colors.bgBox, color: colors.white },
                  ]}
                  keyboardType="number-pad"
                  // --- CHANGED: Pehla input 6 digits accept karega, baaki 1 ---
                  maxLength={index === 0 ? 6 : 1}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                  
                  // --- ADDED: iOS ke liye 'From Messages' suggest karega ---
                  textContentType={index === 0 ? 'oneTimeCode' : 'none'}

                  // --- ADDED: Android ke liye SMS se auto-read karega ---
                  autoComplete={index === 0 ? 'sms-otp' : 'off'} 
                />
              ))}
            </View>

            <View style={styles.timerRow}>
              <Text style={[styles.timerText, { color: colors.white }]}>
                {formatTimer()}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0 || isResending}>
                <View style={styles.resendContainer}>
                  {isResending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.resendText,
                        { color: timer > 0 ? '#aaa' : colors.primary },
                      ]}
                    >
              {t('resend_button')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={{ width: '100%' }}
              disabled={isVerifying} 
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[
                  styles.continueBtn,
                  { borderWidth: 1, borderColor: colors.primary },
                ]}
              >
                {isVerifying ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.continueText}>{t('continue_button')}</Text>
                )}
              </GradientBox>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('back_to_footer')}</Text>
              <TouchableOpacity onPress={() =>  {
                               triggerHaptic(HapticFeedbackTypes.impactLight); 
                navigation.navigate('Login')}}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>
                  {' '}
                {t('signin_footer_link')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heading: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 36,
    lineHeight: 43,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: Fonts.aeonikRegular,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
  },
  resendContainer: {
    minWidth: 50, // To prevent layout shift when indicator appears
    alignItems: 'flex-end',
  },
  resendText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    textDecorationLine: 'underline',
  },
  continueBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 115,
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    color: '#fff',
  },
  signupLink: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.aeonikRegular,
    textDecorationLine: 'underline',
  },
});
