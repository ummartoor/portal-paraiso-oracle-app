import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { Formik } from 'formik';
import * as Yup from 'yup';
import eyeIcon from '../../../assets/icons/eye.png';
import eyeOffIcon from '../../../assets/icons/eyeOff.png';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { useRegisterStore } from '../../../store/useRegisterStore';
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import tickIcon from '../../../assets/icons/tickIcon.png';
import { useTranslation } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import { useAuthStore } from '../../../store/useAuthStore';
import { useHaptic } from '../../../hooks/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const SignUpScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { register, isRegistering } = useRegisterStore();

  const { sendVerificationOtp } = useAuthStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const { t, i18n } = useTranslation();
  const { trigger: triggerHaptic } = useHaptic();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t('validation_name_required')),
    email: Yup.string()
      .email(t('validation_email_invalid'))
      .required(t('validation_email_required')),
    password: Yup.string()
      .required(t('validation_password_required'))
      .min(6, t('validation_password_min')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('validation_passwords_match'))
      .required(t('validation_confirm_password_required')),
    agree: Yup.boolean().oneOf([true], t('validation_agree_required')),
  });

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
              {t('signup_header')}
            </Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
              {t('signup_subheader')}
            </Text>

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                agree: false,
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const timezone = RNLocalize.getTimeZone();
                const app_language = i18n.language;
                const payload = {
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  confirmPassword: values.confirmPassword,
                  timezone: timezone,
                  app_language: app_language,
                };
                const registerResult = await register(payload);

                // 2. If registration is successful, send OTP
                if (registerResult.success) {
                  const otpSent = await sendVerificationOtp(values.email);

                  // 3. If OTP sent successfully, navigate
                  if (otpSent) {
                    navigation.navigate('VerifyEmailScreen', {
                      email: values.email,
                    });
                    // No need to setSubmitting(false) because we are navigating away
                    return; // Exit onSubmit early
                  } else {
                    // Show error if OTP sending failed
                    Alert.alert(
                      'OTP Error',
                      'Could not send verification email. Please try again or contact support.',
                    );
                  }
                }

                // If registration failed OR OTP sending failed, re-enable the form
                setSubmitting(false);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                isSubmitting,
                isValid, // <-- **IMPROVEMENT 1**: isValid ADDED
              }) => (
                <>
                  {/* Name Field */}
                  <Text style={[styles.label, { color: colors.white }]}>
                    {t('name_label')}
                  </Text>
                  <TextInput
                    placeholder={t('name_placeholder')}
                    placeholderTextColor="#ccc"
                    onChangeText={handleChange('name')}
                    onBlur={e => {
                      handleBlur('name')(e);
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('name')}
                    value={values.name}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.bgBox,
                        color: colors.white,
                        borderWidth: focusedField === 'name' ? 1 : 0,
                        borderColor:
                          focusedField === 'name'
                            ? colors.primary
                            : 'transparent',
                      },
                    ]}
                  />
                  {errors.name && touched.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  {/* Email Field */}
                  <Text style={[styles.label, { color: colors.white }]}>
                    {t('email_label')}
                  </Text>
                  <TextInput
                    placeholder={t('email_placeholder')}
                    placeholderTextColor="#ccc"
                    onChangeText={handleChange('email')}
                    onBlur={e => {
                      handleBlur('email')(e);
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('email')}
                    value={values.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.bgBox,
                        color: colors.white,
                        borderWidth: focusedField === 'email' ? 1 : 0,
                        borderColor:
                          focusedField === 'email'
                            ? colors.primary
                            : 'transparent',
                      },
                    ]}
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  {/* Password Field */}
                  <Text style={[styles.label, { color: colors.white }]}>
                    {t('password_label')}
                  </Text>
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      {
                        backgroundColor: colors.bgBox,
                        borderWidth: focusedField === 'password' ? 1 : 0,
                        borderColor:
                          focusedField === 'password'
                            ? colors.primary
                            : 'transparent',
                      },
                    ]}
                  >
                    <TextInput
                      placeholder={t('password_placeholder')}
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange('password')}
                      onBlur={e => {
                        handleBlur('password')(e);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('password')}
                      value={values.password}
                      style={{ flex: 1, color: colors.white }}
                      textContentType="newPassword" // <-- **IMPROVEMENT 3**: textContentType ADDED
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Image
                        source={showPassword ? eyeOffIcon : eyeIcon}
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  {/* Confirm Password Field */}
                  <Text style={[styles.label, { color: colors.white }]}>
                    {t('confirm_password_label')}
                  </Text>
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      {
                        backgroundColor: colors.bgBox,
                        borderWidth: focusedField === 'confirmPassword' ? 1 : 0,
                        borderColor:
                          focusedField === 'confirmPassword'
                            ? colors.primary
                            : 'transparent',
                      },
                    ]}
                  >
                    <TextInput
                      placeholder={t('confirm_password_placeholder')}
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={e => {
                        handleBlur('confirmPassword')(e);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      value={values.confirmPassword}
                      style={{ flex: 1, color: colors.white }}
                      textContentType="newPassword" // <-- **IMPROVEMENT 3**: textContentType ADDED
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Image
                        source={showConfirmPassword ? eyeOffIcon : eyeIcon}
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}

                  {/* Terms & Conditions */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFieldValue('agree', !values.agree)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        values.agree && {
                          backgroundColor: colors.bgBox,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {values.agree && (
                        <Image source={tickIcon} style={styles.tickIcon} />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>
                      {t('agree_with')}
                      <Text
                        style={[{ color: colors.primary }, styles.linkText]}
                      >
                        {t('terms_and_conditions')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agree && touched.agree && (
                    <Text style={styles.errorText}>{errors.agree}</Text>
                  )}

                  {/* Create Account Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerHaptic(HapticFeedbackTypes.impactLight);
                      handleSubmit();
                    }}
                    style={{ width: '100%' }}
                    disabled={!isValid || isSubmitting} // <-- **IMPROVEMENT 2**: DISABLED LOGIC UPDATED
                  >
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={[
                        styles.signinBtn,
                        { borderWidth: 1, borderColor: colors.primary },
                      ]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <Text style={styles.signinText}>
                          {t('create_account_button')}
                        </Text>
                      )}
                    </GradientBox>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('already_have_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>
                  {' '}
                  {t('login_link')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  heading: {
    fontSize: 36,
    lineHeight: 43,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: '100%',
    height: 59,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#ccc',
  },
  signinBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    fontFamily: Fonts.aeonikRegular,
    alignItems: 'center',
    marginTop: 30,
  },
  signinText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  tickIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  checkboxText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 45,
  },
  footerText: {
    fontFamily: Fonts.aeonikRegular,
    color: '#fff',
  },
  signupLink: {
    fontSize: 14,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 4,
  },
});
