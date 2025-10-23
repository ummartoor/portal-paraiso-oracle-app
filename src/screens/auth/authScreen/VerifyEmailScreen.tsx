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
  Alert, // Keep Alert for simple validation
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import GradientBox from '../../../components/GradientBox';

import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// --- UPDATED: Type for route params to match the new screen name ---
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamsList, 'VerifyEmailScreen'>;

// --- UPDATED: Component name changed from OTPScreen to VerifyEmailScreen ---
const VerifyEmailScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const { t } = useTranslation();

  // --- Get email from previous screen ---
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { email } = route.params;

  // --- REMOVED: No longer using functions from useAuthStore ---
  // const { verifyOtp, forgotPassword} = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(120);
  // --- REMOVED: Loading states are not needed without API calls ---
  // const [isVerifying, setIsVerifying] = useState(false);
  // const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
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

  // --- UPDATED: Simplified handleContinue function ---
  const handleContinue = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert(t('alert_error_title'), t('alert_otp_incomplete_message'));
      return;
    }
    // Directly navigate to the next screen without API verification
    navigation.navigate('GenderScreen');
  };

  // --- UPDATED: Simplified handleResend function ---
  const handleResend = () => {
    // Simply reset the timer and clear the input fields
    setTimer(120);
    setOtp(Array(6).fill(''));
    // Focus the first input for convenience
    inputRefs.current[0]?.focus();
    console.log('Simulating resend code to:', email); // For debugging
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
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
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <View style={styles.timerRow}>
              <Text style={[styles.timerText, { color: colors.white }]}>
                {formatTimer()}
              </Text>
              {/* --- UPDATED: Disabled prop is now simpler --- */}
              <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                {/* --- UPDATED: Removed ActivityIndicator --- */}
                <Text
                  style={[
                    styles.resendText,
                    { color: timer > 0 ? '#aaa' : colors.primary },
                  ]}>
                  {t('resend_button')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- UPDATED: Removed disabled prop and ActivityIndicator --- */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleContinue}
              style={{ width: '100%' }}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[
                  styles.continueBtn,
                  { borderWidth: 1, borderColor: colors.primary },
                ]}>
                <Text style={styles.continueText}>{t('continue_button')}</Text>
              </GradientBox>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('back_to_footer')}</Text>
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35]);
                  navigation.navigate('Login');
                }}>
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

// --- UPDATED: Changed export name ---
export default VerifyEmailScreen;

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