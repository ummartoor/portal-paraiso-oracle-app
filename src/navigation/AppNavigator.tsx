

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

import AstrologyCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/astrologyCardDetail/AstrologyCardDetailScreen';


import AskQuestionAstrologyScreen from '../screens/app/homeScreen/carouselCardDetail/astrologyCardDetail/AskQuestionAstrologyScreen';
import TarotCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/TarotCardDetail/TarotCardDetailScreen';
import AskQuestionTarotScreen from '../screens/app/homeScreen/carouselCardDetail/TarotCardDetail/AskQuestionTarotScreen';
import AskQuestionCariusScreen from '../screens/app/homeScreen/carouselCardDetail/CariusCardDetail/AskQuestionCariusScreen';
import CaurisCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/CariusCardDetail/CaurisCardDetailScreen';
import DailyWisdomCardScreen from '../screens/app/homeScreen/dailyWisdomCard/DailyWisdomCardScreen';
import RitualTipScreen from '../screens/app/homeScreen/ritualTip/RitualTipScreen';
import FeaturedOrishaScreen from '../screens/app/homeScreen/featuredOrisha/FeaturedOrishaScreen';
import RecentReadingsScreen from '../screens/app/homeScreen/recentReadings/RecentReadingsScreen';






const Stack = createNativeStackNavigator<AppStackParamList>();


const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='MainTabs' component={MainTabs} />
      {/* <Stack.Screen name='CarouselCardDetail' component={CarouselCardDetailScreen} /> */}
   <Stack.Screen name='AskQuestionTarotScreen' component={AskQuestionTarotScreen} />
      <Stack.Screen name='TarotCardDetail' component={TarotCardDetailScreen} />
         <Stack.Screen name='AskQuestionAstrologyScreen' component={AskQuestionAstrologyScreen} />
      <Stack.Screen name='AstrologyCardDetail' component={AstrologyCardDetailScreen} />
        <Stack.Screen name='AskQuestionCariusScreen' component={AskQuestionCariusScreen} />
      <Stack.Screen name='CaurisCardDetail' component={CaurisCardDetailScreen} />
         <Stack.Screen name='DailyWisdomCardScreen' component={DailyWisdomCardScreen} />
           <Stack.Screen name='FeaturedOrishaScreen' component={FeaturedOrishaScreen} />
           <Stack.Screen name='RitualTipScreen' component={RitualTipScreen} />
              <Stack.Screen name='RecentReadingsScreen' component={RecentReadingsScreen} />
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
