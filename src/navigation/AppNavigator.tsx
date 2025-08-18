

import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import { AppStackParamList } from './routeTypes';
import MainTabs from './MainTabs';






const Stack = createNativeStackNavigator<AppStackParamList>();


const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='MainTabs' component={MainTabs} />
       {/* <Stack.Screen name='ProfileCardDetailScreen' component={ProfileCardDetailScreen} /> */}
 
    

    </Stack.Navigator>
  )
}

export default AppNavigator

const styles = StyleSheet.create({})
