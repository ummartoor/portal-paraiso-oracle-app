import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomTabBarParamList } from './routeTypes'

import { MyBottomTabBar } from './MyBottomTabBar'

import DivineScreen from '../screens/app/divineScreen/DivineScreen'
import LibraryScreen from '../screens/app/libraryScreen/LibraryScreen'

import HomeScreen from '../screens/app/homeScreen/HomeScreen'
import ChatScreen from '../screens/app/chatScreen/ChatScreen'






const Tab = createBottomTabNavigator<BottomTabBarParamList>()

const MainTabs = () => {
  return (
    <Tab.Navigator tabBar={props => <MyBottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name='Home' component={HomeScreen} />
           <Tab.Screen name='Divine' component={DivineScreen} />
            <Tab.Screen name='Library' component={LibraryScreen} />
               <Tab.Screen name='Chat' component={ChatScreen} />
 

    </Tab.Navigator>
  )
}

export default MainTabs

const styles = StyleSheet.create({})