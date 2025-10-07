

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
  Vibration, // --- ADDED ---
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
import { useRegisterStore } from '../../../store/useRegisterStore'; // --- UPDATED ---
import GradientBox from '../../../components/GradientBox';
import { Fonts } from '../../../constants/fonts';
import tickIcon from '../../../assets/icons/tickIcon.png';
import { useTranslation } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const SignUpScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // --- ADDED ---

  // --- UPDATED: Using useRegisterStore ---
  const { register, isRegistering } = useRegisterStore();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
const { t, i18n } = useTranslation();
  // --- UPDATED: Added confirmPassword validation ---
const validationSchema = Yup.object().shape({
  name: Yup.string().required(t('validation_name_required')),
  email: Yup.string().email(t('validation_email_invalid')).required(t('validation_email_required')),
  password: Yup.string().required(t('validation_password_required')).min(6, t('validation_password_min')),
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
              // --- UPDATED: Added confirmPassword to initial values ---
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
                    app_language: app_language 
                };
                
                const result = await register(payload);

                if (result.success) {
                  navigation.navigate('GenderScreen');
                }
                
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
                isSubmitting, // --- ADDED ---
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
                    onBlur={handleBlur('name')}
                    value={values.name}
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgBox, color: colors.white },
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
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgBox, color: colors.white },
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
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                  
                  {/* --- ADDED: Confirm Password Field --- */}
                  <Text style={[styles.label, { color: colors.white }]}>
                   {t('confirm_password_label')}
                  </Text>
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      { backgroundColor: colors.bgBox },
                    ]}
                  >
                    <TextInput
                      placeholder={t('confirm_password_placeholder')}
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      style={{ flex: 1, color: colors.white }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Image
                        source={showConfirmPassword ? eyeOffIcon : eyeIcon}
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
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
                        style={[
                          styles.linkText,
                          { color: colors.primary },
                        ]}
                      >
                       {t('terms_and_conditions')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agree && touched.agree && (
                    <Text style={styles.errorText}>{errors.agree}</Text>
                  )}

                  {/* --- UPDATED: Create Account Button with loading state --- */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                               Vibration.vibrate([0, 35, 40, 35]);
                      handleSubmit()}}
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
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
                        <Text style={styles.signinText}>{t('create_account_button')}</Text>
                      )}
                    </GradientBox>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('already_have_account')}</Text>
              <TouchableOpacity onPress={() => {
                         Vibration.vibrate([0, 35, 40, 35]);
                navigation.navigate('Login')}
                }>
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

















































// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   ScrollView,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { Formik } from 'formik';
// import * as Yup from 'yup';

// import eyeIcon from '../../../assets/icons/eye.png';
// import eyeOffIcon from '../../../assets/icons/eyeOff.png';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { useAuthStore } from '../../../store/useAuthStore';
// import GradientBox from '../../../components/GradientBox';
// import { Fonts } from '../../../constants/fonts';
// import tickIcon from '../../../assets/icons/tickIcon.png';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const SignUpScreen = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const [showPassword, setShowPassword] = useState(false);
//   const login = useAuthStore(state => state.login);

//   const handleLogin = async () => {
//     await login();
//   };

//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const validationSchema = Yup.object().shape({
//     name: Yup.string().required('Name is required'),
//     email: Yup.string().email('Invalid email').required('Email is required'),
//     password: Yup.string().required('Password is required'),
//     agree: Yup.boolean().oneOf([true], 'You must agree to Terms & Conditions'),
//   });

//   const handleFormSubmit = (submit: () => void) => () => {
//     submit();
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
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             <Text style={[styles.heading, { color: colors.white }]}>
//               Create an Account
//             </Text>
//             <Text style={[styles.subheading, { color: colors.primary }]}>
//               Welcome to Portal Paraíso
//             </Text>

//             <Formik
//               initialValues={{ name: '', email: '', password: '', agree: false }}
//               validationSchema={validationSchema}
//               onSubmit={values => {
//                 console.log(values);
//        navigation.navigate('GenderScreen')
//               }}
//             >
//               {({
//                 handleChange,
//                 handleBlur,
//                 handleSubmit,
//                 values,
//                 errors,
//                 touched,
//                 setFieldValue,
//               }) => (
//                 <>
//                   {/* 🔹 Name Field */}
//                   <Text style={[styles.label, { color: colors.white }]}>
//                     Name
//                   </Text>
//                   <TextInput
//                     placeholder="Name"
//                     placeholderTextColor="#ccc"
//                     onChangeText={handleChange('name')}
//                     onBlur={handleBlur('name')}
//                     value={values.name}
//                     style={[
//                       styles.input,
//                       { backgroundColor: colors.bgBox, color: colors.white },
//                     ]}
//                   />
//                   {errors.name && touched.name && (
//                     <Text style={styles.errorText}>{errors.name}</Text>
//                   )}

//                   {/* 🔹 Email Field */}
//                   <Text style={[styles.label, { color: colors.white }]}>
//                     Email
//                   </Text>
//                   <TextInput
//                     placeholder="Email"
//                     placeholderTextColor="#ccc"
//                     onChangeText={handleChange('email')}
//                     onBlur={handleBlur('email')}
//                     value={values.email}
//                     style={[
//                       styles.input,
//                       { backgroundColor: colors.bgBox, color: colors.white },
//                     ]}
//                   />
//                   {errors.email && touched.email && (
//                     <Text style={styles.errorText}>{errors.email}</Text>
//                   )}

//                   {/* 🔹 Password Field */}
//                   <Text style={[styles.label, { color: colors.white }]}>
//                     Password
//                   </Text>
//                   <View
//                     style={[
//                       styles.input,
//                       styles.passwordWrapper,
//                       { backgroundColor: colors.bgBox },
//                     ]}
//                   >
//                     <TextInput
//                       placeholder="Password"
//                       placeholderTextColor="#ccc"
//                       secureTextEntry={!showPassword}
//                       onChangeText={handleChange('password')}
//                       onBlur={handleBlur('password')}
//                       value={values.password}
//                       style={{ flex: 1, color: colors.white }}
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword(!showPassword)}
//                     >
//                       <Image
//                         source={showPassword ? eyeOffIcon : eyeIcon}
//                         style={{
//                           width: 20,
//                           height: 20,
//                           marginRight: 8,
//                           tintColor: '#ccc',
//                         }}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                   {errors.password && touched.password && (
//                     <Text style={styles.errorText}>{errors.password}</Text>
//                   )}

//                   {/* 🔹 Terms & Conditions */}
//                   <TouchableOpacity
//                     style={styles.checkboxRow}
//                     onPress={() => setFieldValue('agree', !values.agree)}
//                     activeOpacity={0.7}
//                   >
//                     <View
//                       style={[
//                         styles.checkbox,
//                         values.agree && {
//                           backgroundColor: colors.bgBox, 
//                           borderColor: colors.primary,
//                         },
//                       ]}
//                     >
//                       {values.agree && (
//                         <Image source={tickIcon} style={styles.tickIcon} />
//                       )}
//                     </View>
//                     <Text style={styles.checkboxText}>
//                       Agree with{' '}
//                       <Text
//                         style={[
//                           styles.linkText,
//                           { color: colors.primary }, 
//                         ]}
//                       >
//                         Terms & Conditions
//                       </Text>
//                     </Text>
//                   </TouchableOpacity>
//                   {errors.agree && touched.agree && (
//                     <Text style={styles.errorText}>{errors.agree}</Text>
//                   )}

//                   {/* 🔹 Create Account Button */}
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={handleFormSubmit(handleSubmit)}
//                     style={{ width: '100%' }}
//                   >
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={[
//                         styles.signinBtn,
//                         { borderWidth: 1.5, borderColor: colors.primary },
//                       ]}
//                     >
//                       <Text style={styles.signinText}>Create Account</Text>
//                     </GradientBox>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </Formik>

//             {/* 🔹 Footer */}
//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Already have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                 <Text style={[styles.signupLink, { color: colors.primary }]}>
//                   {' '}
//                   Log in
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default SignUpScreen;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingTop: 80,
//     paddingBottom: 40,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 36,
//     lineHeight: 43,
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 18,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     marginBottom: 25,
//   },
//   label: {
//     fontSize: 14,
//     alignSelf: 'flex-start',
//     marginBottom: 6,
//     marginTop: 16,
//   },
//   input: {
//     width: '100%',
//     height: 59,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//   },
//   passwordWrapper: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   signinBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     alignItems: 'center',
//     marginTop: 30,
//   },
//   signinText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//   },
//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 16,
//     alignSelf: 'flex-start',
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 5,
//     borderWidth: 1.5,
//     borderColor: '#ccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//     backgroundColor: 'transparent',
//   },
//   tickIcon: {
//     width: 14,
//     height: 14,
//     tintColor: '#fff',
//   },
//   checkboxText: {
//     fontSize: 14,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
//   linkText: {
//     textDecorationLine: 'underline',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 45,
//   },
//   footerText: {
//     fontFamily: Fonts.aeonikRegular,
//     color: '#fff',
//   },
//   signupLink: {
//     fontSize: 14,
//     lineHeight: 18,
//     textDecorationLine: 'underline',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     alignSelf: 'flex-start',
//     marginTop: 4,
//     marginLeft: 4,
//   },
// });
