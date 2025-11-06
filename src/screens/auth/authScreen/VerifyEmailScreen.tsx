
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
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Vibration,
  ActivityIndicator,
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type VerifyEmailScreenRouteProp = RouteProp<
  AuthStackParamsList,
  'VerifyEmailScreen'
>;

const VerifyEmailScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const { t } = useTranslation();

  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { email } = route.params;

  const { verifyEmailOtp, sendVerificationOtp } = useAuthStore();

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

  const handleContinue = async () => {
    Vibration.vibrate([0, 35, 40, 35]);
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert(t('alert_error_title'), t('alert_otp_incomplete_message'));
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verifyEmailOtp(email, otpString);
      if (success) {
        navigation.navigate('GenderScreen');
      }
    } catch (error) {
      console.error("Verification failed unexpectedly:", error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setOtp(Array(6).fill(''));

    try {
      const otpSent = await sendVerificationOtp(email);
      if (otpSent) {
        setTimer(120);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
       console.error("Resend OTP failed unexpectedly:", error);
       Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
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
              {t('otp_subheader')} {email}
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
                  editable={!isVerifying}

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
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.resendText,
                      { color: timer > 0 || isResending ? '#aaa' : colors.primary },
                    ]}
                  >
                    {t('resend_button')}
                  </Text>
                )}
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
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35]);
                  navigation.navigate('Login');
                }}
              >
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

export default VerifyEmailScreen;

// --- Styles remain the same ---
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
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#fff',
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
    fontSize: 22,
    fontFamily: Fonts.aeonikBold,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    color: '#fff',
  },
  resendText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikBold,
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
    fontFamily: Fonts.aeonikBold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 20,
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
//   Alert,
//   NativeSyntheticEvent,
//   TextInputKeyPressEventData,
//   Vibration,
//   ActivityIndicator,
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

// type VerifyEmailScreenRouteProp = RouteProp<
//   AuthStackParamsList,
//   'VerifyEmailScreen'
// >;

// const VerifyEmailScreen = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
//   const { t } = useTranslation();

//   const route = useRoute<VerifyEmailScreenRouteProp>();
//   const { email } = route.params;

//   const { verifyEmailOtp, sendVerificationOtp } = useAuthStore();

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

//   const handleContinue = async () => {
//     Vibration.vibrate([0, 35, 40, 35]);
//     const otpString = otp.join('');
//     if (otpString.length !== 6) {
//       Alert.alert(t('alert_error_title'), t('alert_otp_incomplete_message'));
//       return;
//     }

//     setIsVerifying(true);
//     try {
//       const success = await verifyEmailOtp(email, otpString);
//       if (success) {
//         navigation.navigate('GenderScreen');
//       }
//       // Error alert is handled by the store
//     } catch (error) {
//       console.error("Verification failed unexpectedly:", error);
//       // --- FIX 1: Use hardcoded English string ---
//       Alert.alert('Error', 'An unexpected error occurred. Please try again.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0 || isResending) return;

//     setIsResending(true);
//     setOtp(Array(6).fill(''));

//     try {
//       const otpSent = await sendVerificationOtp(email);
//       if (otpSent) {
//         setTimer(120);
//         inputRefs.current[0]?.focus();
//       }
//       // Success/Error alert is handled by the store
//     } catch (error) {
//        console.error("Resend OTP failed unexpectedly:", error);
//        // --- FIX 2: Use hardcoded English string ---
//        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
//     } finally {
//       setIsResending(false);
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
//               {t('otp_header')}
//             </Text>
//             <Text style={[styles.subheading, { color: colors.primary }]}>
//               {t('otp_subheader')} {email}
//             </Text>

//             <Text style={[styles.label, { color: colors.white }]}>
//               {t('otp_label')}
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
//                   onKeyPress={e => handleKeyPress(e, index)}
//                   autoFocus={index === 0}
//                   editable={!isVerifying}
//                 />
//               ))}
//             </View>

//             <View style={styles.timerRow}>
//               <Text style={[styles.timerText, { color: colors.white }]}>
//                 {formatTimer()}
//               </Text>
//               <TouchableOpacity onPress={handleResend} disabled={timer > 0 || isResending}>
//                 {isResending ? (
//                   <ActivityIndicator size="small" color={colors.primary} />
//                 ) : (
//                   <Text
//                     style={[
//                       styles.resendText,
//                       { color: timer > 0 || isResending ? '#aaa' : colors.primary },
//                     ]}
//                   >
//                     {t('resend_button')}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={handleContinue}
//               style={{ width: '100%' }}
//               disabled={isVerifying}
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
//               <TouchableOpacity
//                 onPress={() => {
//                   Vibration.vibrate([0, 35, 40, 35]);
//                   navigation.navigate('Login');
//                 }}
//               >
//                 <Text style={[styles.signupLink, { color: colors.primary }]}>
//                   {' '}
//                   {t('signin_footer_link')}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default VerifyEmailScreen;

// // --- Styles remain the same ---
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
//     paddingHorizontal: 10,
//   },
//   label: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     alignSelf: 'flex-start',
//     marginBottom: 10,
//     color: '#fff',
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
//     fontSize: 22,
//     fontFamily: Fonts.aeonikBold,
//   },
//   timerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 30,
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//     color: '#fff',
//   },
//   resendText: {
//     fontSize: 14,
//     fontFamily: Fonts.aeonikBold,
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
//     fontFamily: Fonts.aeonikBold,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 'auto',
//     paddingTop: 20,
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