

import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import { AppStackParamList } from './routeTypes';
import MainTabs from './MainTabs';
import CarouselCardDetailScreen from '../screens/app/homeScreen/carouselCardDetail/CarouselCardDetailScreen';






const Stack = createNativeStackNavigator<AppStackParamList>();


const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='MainTabs' component={MainTabs} />
       <Stack.Screen name='CarouselCardDetail' component={CarouselCardDetailScreen} />
 
    

    </Stack.Navigator>
  )
}

export default AppNavigator

const styles = StyleSheet.create({})
