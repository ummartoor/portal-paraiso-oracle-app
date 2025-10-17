import React from 'react';
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
  Vibration, // --- ADDED ---
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import GradientBox from '../../../components/GradientBox';
import { useAuthStore } from '../../../store/useAuthStore'; // --- ADDED ---
import { useTranslation } from 'react-i18next';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const ForgotPasswordScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
   const { t } = useTranslation();
  // --- ADDED: Get the forgotPassword function from your store ---
  const forgotPassword = useAuthStore(state => state.forgotPassword);

  const validationSchema = Yup.object().shape({
email: Yup.string().email(t('validation_email_invalid')).required(t('validation_email_required')),
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
                  {t('forgot_password_header')}
            </Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
                  {t('forgot_password_subheader')}
            </Text>

            <Formik
              initialValues={{ email: '' }}
              validationSchema={validationSchema}
              // --- UPDATED: onSubmit now calls the API ---
              onSubmit={async (values, { setSubmitting }) => {
                // Call the API from the store
                const success = await forgotPassword(values.email);

                // Navigate only if the API call was successful
                if (success) {
                  navigation.navigate('OTPScreen', { email: values.email });
                }
                
                // Re-enable the button after the process is complete
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
                      {
                        backgroundColor: colors.bgBox,
                        color: colors.white,
                      },
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                 
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                               Vibration.vibrate([0, 35, 40, 35]);
                      handleSubmit()}}
                    style={{ width: '100%' }}
                    disabled={isSubmitting} // Disable button while loading
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
                        <Text style={styles.signinText}>{t('continue_button')}</Text>
                      )}
                    </GradientBox>
                  </TouchableOpacity>
                </>
              )}
            </Formik>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('back_to_footer')}</Text>
              <TouchableOpacity onPress={() =>  {
                         Vibration.vibrate([0, 35, 40, 35]);
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

export default ForgotPasswordScreen;

// Styles are unchanged
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
    fontFamily: Fonts.aeonikRegular,
  },
  input: {
    width: '100%',
    height: 59,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  signinBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  signinText: {
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
    fontFamily: Fonts.aeonikRegular,
    color: '#fff',
  },
  signupLink: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.aeonikRegular,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 4,
    fontFamily: Fonts.aeonikRegular,
  },
});























// import React from 'react';
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
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import GradientBox from '../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const ForgotPasswordScreen = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const validationSchema = Yup.object().shape({
//     email: Yup.string().email('Invalid email').required('Email is required'),
//   });

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bglinearImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
//             <Text style={[styles.heading, { color: colors.white }]}>Forgot Password</Text>
//             <Text style={[styles.subheading, { color: colors.primary }]}>
//               Enter the email associated with your account and we’ll send you a code.
//             </Text>

//             <Formik
//               initialValues={{ email: '' }}
//               validationSchema={validationSchema}
//               onSubmit={(values) => {
//                 console.log(' Forgot Password:', values.email);
//                 navigation.navigate('OTPScreen', { email: values.email });
//               }}
//             >
//               {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
//                 <>
//                   <Text style={[styles.label, { color: colors.white }]}>Email</Text>
//                   <TextInput
//                     placeholder="Email"
//                     placeholderTextColor="#ccc"
//                     onChangeText={handleChange('email')}
//                     onBlur={handleBlur('email')}
//                     value={values.email}
//                     style={[
//                       styles.input,
//                       {
//                         backgroundColor: colors.bgBox,
//                         color: colors.white,
                 
//                       },
//                     ]}
//                   />
//                   {errors.email && touched.email && (
//                     <Text style={styles.errorText}>{errors.email}</Text>
//                   )}

//                   {/* Gradient Continue Button */}
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={() => handleSubmit()}
//                     style={{ width: '100%' }}
//                   >
//                     <GradientBox
//                       colors={[colors.black, colors.bgBox]}
//                       style={[
//                         styles.signinBtn,
//                         { borderWidth: 1.5, borderColor: colors.primary },
//                       ]}
//                     >
//                       <Text style={styles.signinText}>Continue</Text>
//                     </GradientBox>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </Formik>

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Back to</Text>
//               <TouchableOpacity 
//               onPress={() => navigation.navigate('Login')}
//               >
//                 <Text style={[styles.signupLink, { color: colors.primary }]}> Sign In</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default ForgotPasswordScreen;

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
//     marginBottom: 40,
//   },
//   label: {
//     fontSize: 14,
//     alignSelf: 'flex-start',
//     marginBottom: 6,
//     marginTop: 16,
//     fontFamily: Fonts.aeonikRegular,
//   },
//   input: {
//     width: '100%',
//     height: 59,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//   },
//   signinBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 30,
//   },
//   signinText: {
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
//     fontFamily: Fonts.aeonikRegular,
//     color: '#fff',
//   },
//   signupLink: {
//     fontSize: 14,
//     lineHeight: 18,
//     fontFamily: Fonts.aeonikRegular,
//     textDecorationLine: 'underline',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 12,
//     alignSelf: 'flex-start',
//     marginTop: 4,
//     marginLeft: 4,
//     fontFamily: Fonts.aeonikRegular,
//   },
// });
