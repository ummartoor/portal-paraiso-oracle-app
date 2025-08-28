

import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import { AppStackParamList } from './routeTypes';
import MainTabs from './MainTabs';

import DeleteAccountScreen from '../screens/app/ProfileScreen/profile/general/DeleteAccountScreen';
import SupportScreen from '../screens/app/ProfileScreen/profile/general/SupportScreen';
import EditProfileScreen from '../screens/app/ProfileScreen/profile/editProfile/EditProfileScreen';
import TermOfServiceScreen from '../screens/app/ProfileScreen/profile/document/TermOfServiceScreen';
import BuySubscriptionScreen from '../screens/app/ProfileScreen/profile/subscription/BuySubscriptionScreen';
import SubscriptionTermsScreen from '../screens/app/ProfileScreen/profile/document/SubscriptionTermsScreen';
import PrivacyPolicyScreen from '../screens/app/ProfileScreen/profile/document/PrivacyPolicyScreen';
import TarotCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/TarotCardDetailScreen';
import AstrologyCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/astrologyCardDetail/AstrologyCardDetailScreen';
import NumerologyCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/CaurisCardDetailScreen';






const Stack = createNativeStackNavigator<AppStackParamList>();


const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='MainTabs' component={MainTabs} />
       {/* <Stack.Screen name='CarouselCardDetail' component={CarouselCardDetailScreen} /> */}
        <Stack.Screen name='TarotCardDetail' component={TarotCardDetailScreen} />
         <Stack.Screen name='AstrologyCardDetail' component={AstrologyCardDetailScreen} />
            <Stack.Screen name='NumerologyCardDetail' component={NumerologyCardDetailScreen} />
      <Stack.Screen name='DeleteAccount' component={DeleteAccountScreen} />
      <Stack.Screen name='SupportScreen' component={SupportScreen} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} /> 
               <Stack.Screen name='BuySubscription' component={BuySubscriptionScreen} />
             <Stack.Screen name='TermOfService' component={TermOfServiceScreen} />
               <Stack.Screen name='SubscriptionTerms' component={SubscriptionTermsScreen} />
                <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
          
    </Stack.Navigator>
  )
}

export default AppNavigator

const styles = StyleSheet.create({})
