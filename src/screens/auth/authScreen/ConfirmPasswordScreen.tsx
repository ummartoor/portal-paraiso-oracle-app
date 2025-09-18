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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { Fonts } from '../../../constants/fonts';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import GradientBox from '../../../components/GradientBox';

import eyeIcon from '../../../assets/icons/eye.png';
import eyeOffIcon from '../../../assets/icons/eyeOff.png';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

type ConfirmPasswordScreenRouteProp = RouteProp<AuthStackParamsList, 'ConfirmPassword'>;

const ConfirmPasswordScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const route = useRoute<ConfirmPasswordScreenRouteProp>(); 

  const emailFromRoute = route.params?.email || ''; 
  const resetPassword = useAuthStore(state => state.resetPassword);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('Password is required')
      .min(6, 'Minimum 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match') 
      .required('Confirm Password is required'),
  });

  const handleSubmitPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!emailFromRoute) {
      Alert.alert("Error", "User email is missing. Please restart the password reset process.");
      return;
    }

    console.log("Attempting to reset password for email:", emailFromRoute);
    console.log("With newPassword:", values.newPassword, "and confirmPassword:", values.confirmPassword);

    const success = await resetPassword(
      emailFromRoute,
      values.newPassword,
      values.confirmPassword
    );

    if (success) {
      navigation.navigate('Login');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
            <Text style={[styles.heading, { color: colors.white }]}>Reset Password</Text>
            <Text style={[styles.subheading, { color: colors.primary }]}>
              Set a new password for your account
            </Text>

            <Formik
              initialValues={{ newPassword: '', confirmPassword: '' }} 
              validationSchema={validationSchema}
              onSubmit={handleSubmitPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  {/* Password */}
                  <Text style={[styles.label, { color: colors.white }]}>New Password</Text> 
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      { backgroundColor: colors.bgBox },
                    ]}
                  >
                    <TextInput
                      placeholder="Enter new password"
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange('newPassword')} 
                      onBlur={handleBlur('newPassword')}       
                      value={values.newPassword}          
                      style={{ flex: 1, color: colors.white }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Image
                        source={showPassword ? eyeOffIcon : eyeIcon}
                        style={{ width: 20, height: 20, marginRight: 8, tintColor: '#ccc' }}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.newPassword && touched.newPassword && (
                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                  )}

                  {/* Confirm Password */}
                  <Text style={[styles.label, { color: colors.white }]}>Confirm Password</Text>
                  <View
                    style={[
                      styles.input,
                      styles.passwordWrapper,
                      { backgroundColor: colors.bgBox },
                    ]}
                  >
                    <TextInput
                      placeholder="Confirm password"
                      placeholderTextColor="#ccc"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      style={{ flex: 1, color: colors.white }}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Image
                        source={showConfirmPassword ? eyeOffIcon : eyeIcon}
                        style={{ width: 20, height: 20, marginRight: 8, tintColor: '#ccc' }}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}

                  {/* Gradient Continue Button */}
                  <TouchableOpacity activeOpacity={0.8} onPress={() => handleSubmit()} style={{ width: '100%' }}>
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={[
                        styles.signinBtn,
                        { borderWidth: 1.5, borderColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.signinText}>Continue</Text>
                    </GradientBox>
                  </TouchableOpacity>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Back to</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={[styles.signupLink, { color: colors.primary }]}> Login</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ConfirmPasswordScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
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
    marginBottom: 8,
  },
  passwordWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
