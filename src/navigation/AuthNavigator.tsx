import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import { AuthStackParamsList } from './routeTypes';
import LoginScreen from '../screens/auth/authScreen/LoginScreen';
import WelcomeScreen from '../screens/auth/authScreen/WelcomeScreen';
import OnBoardingScreen from '../screens/auth/onBoardingScreen/OnBoardingScreen';
import SignUpScreen from '../screens/auth/authScreen/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/authScreen/ForgotPasswordScreen';
import OTPScreen from '../screens/auth/authScreen/OTPScreen';
import ConfirmPasswordScreen from '../screens/auth/authScreen/ConfirmPasswordScreen';
import GenderScreen_1 from '../screens/auth/authScreen/GenderScreen_1';
import GoalScreen_2 from '../screens/auth/authScreen/GoalScreen_2';
import DateofBirthScreen_3 from '../screens/auth/authScreen/DateofBirthScreen_3';
import TimeofBirthScreen_4 from '../screens/auth/authScreen/TimeofBirthScreen_4';
import PlaceofBirthScreen_5 from '../screens/auth/authScreen/PlaceofBirthScreen_5';
import RelationshipScreen_6 from '../screens/auth/authScreen/RelationshipScreen_6';
import ZodiacSymbolScreen_7 from '../screens/auth/authScreen/ZodiacSymbolScreen_7';
import VerifyEmailScreen from '../screens/auth/authScreen/VerifyEmailScreen';
import VerifyLoginOtpScreen from '../screens/auth/authScreen/VerifyLoginOtpScreen';









const Stack = createNativeStackNavigator<AuthStackParamsList>();


const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>

      <Stack.Screen name='OnBoarding' component={OnBoardingScreen} />
      <Stack.Screen name='WelcomeScreen' component={WelcomeScreen} />

      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='VerifyLoginOtpScreen' component={VerifyLoginOtpScreen} />
      <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen} />
      <Stack.Screen name='OTPScreen' component={OTPScreen} />
      <Stack.Screen name='ConfirmPassword' component={ConfirmPasswordScreen} />
      <Stack.Screen name='SignUp' component={SignUpScreen} />
          <Stack.Screen name='VerifyEmailScreen' component={VerifyEmailScreen} />
      <Stack.Screen name='GenderScreen' component={GenderScreen_1} />
      <Stack.Screen name='GoalScreen' component={GoalScreen_2} />
      <Stack.Screen name='DateofBirth' component={DateofBirthScreen_3} />
      <Stack.Screen name='TimeofBirth' component={TimeofBirthScreen_4} />
      <Stack.Screen name='PlaceofBirth' component={PlaceofBirthScreen_5} />
      <Stack.Screen name='RelationshipStatus' component={RelationshipScreen_6} />
      <Stack.Screen name='ZodiacSymbol' component={ZodiacSymbolScreen_7} />
    </Stack.Navigator>
  )
}

export default AuthNavigator

const styles = StyleSheet.create({})