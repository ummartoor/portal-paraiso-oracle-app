
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
  Vibration, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { Formik } from 'formik';
import * as Yup from 'yup';
import messaging from '@react-native-firebase/messaging'; 
import eyeIcon from '../../../assets/icons/eye.png';
import eyeOffIcon from '../../../assets/icons/eyeOff.png';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNotificationStore } from '../../../store/useNotificationStore'; 
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const LoginScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore(state => state.login); // Your login function from store
    const { registerFcmToken } = useNotificationStore();
const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

const validationSchema = Yup.object().shape({
  email: Yup.string().email(t('validation_email_invalid')).required(t('validation_email_required')),
  password: Yup.string().required(t('validation_password_required')),
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.heading, { color: colors.white }]}>
                   {t('login_header')}
            </Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
               {t('login_subheader')}
            </Text>

            {/* <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              // --- CHANGE 1: Updated onSubmit ---
              onSubmit={async (values, { setSubmitting }) => {
                const deviceToken = 'some-placeholder-device-token'; 
                
                // Call the login function from your store with form values
                const success = await login(
                  values.email,
                  values.password,
                  deviceToken,
                );

                // If success is false, you can re-enable the form
                if (!success) {
                  setSubmitting(false);
                }
              }}
            > */}

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              // --- THE FIX IS HERE ---
              onSubmit={async (values, { setSubmitting }) => {
                let fcmToken = 'no-token-found'; // Default value
                try {
                  // Step 1: Get the device token from Firebase first
                  const token = await messaging().getToken();
                  if (token) {
                    fcmToken = token;
                    console.log('Obtained FCM Token:', fcmToken);
                  } else {
                    console.log('Could not get FCM token.');
                  }
                } catch (error) {
                  console.error('Error getting FCM token:', error);
                }

                // Step 2: Attempt to log in the user with the token
                const loginSuccess = await login(values.email, values.password, fcmToken);

                // Step 3: If login is successful, also register the FCM token with the notification API
                if (loginSuccess) {
                  // This call ensures the token is registered against the user ID in your DB
                  await registerFcmToken(fcmToken);
                  // The app will navigate away, so no need to setSubmitting(false)
                } else {
                  // If login fails, re-enable the form
                  setSubmitting(false);
                }
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting, // --- ADDED: For loading state ---
              }) => (
                <>
                  <Text style={[styles.label, { color: colors.white }]}>
                   {t('email_label')}
                  </Text>
                  <TextInput
                     placeholder={t('email_placeholder')}
                    placeholderTextColor="#ccc"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgBox, color: colors.white },
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <Text style={[styles.label, { color: colors.white }]}>
            {t('password_label')}
                  </Text>
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      { backgroundColor: colors.bgBox },
                    ]}
                  >
                    <TextInput
                     placeholder={t('password_placeholder')}
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      style={{ flex: 1, color: colors.white }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Image
                        source={showPassword ? eyeOffIcon : eyeIcon}
                        style={{
                          width: 20,
                          height: 20,
                          marginRight: 8,
                          tintColor: '#ccc',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.forgotContainer}
                    onPress={() =>
                      
                    {  
                               Vibration.vibrate([0, 35, 40, 35]);
                      navigation.navigate('ForgotPasswordScreen')}}
                  >
                    <Text style={styles.forgotText}>{t('forgot_password_link')}</Text>
                  </TouchableOpacity>

                  {/* --- CHANGE 2: Updated Button --- */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                               Vibration.vibrate([0, 35, 40, 35]);
                      handleSubmit()}}
                    disabled={isSubmitting} // Disable button when submitting
                    style={{ width: '100%' }}
                  >
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={[
                        styles.signinBtn,
                        { borderWidth: 1.5, borderColor: colors.primary },
                      ]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <Text style={styles.signinText}>{t('signin_button')}</Text>
                      )}
                    </GradientBox>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('dont_have_account')}</Text>
              <TouchableOpacity
                onPress={() => {
                           Vibration.vibrate([0, 35, 40, 35]);
                  navigation.navigate('SignUp')}}
              >
                <Text style={[styles.signupLink, { color: colors.primary }]}>
                  {' '}
              {t('signup_link')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginScreen;


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
    paddingTop: 80,
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
    marginBottom: 40,
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    color: '#ccc',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 115,
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
