import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../../store/useThemeStore';

const OnBoardingScreen: React.FC = () => {
  const { colors } = useThemeStore(state => state.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      <View style={styles.centerContent}>
        <Text style={[styles.title, { color: colors.primary }]}>
          OnBoarding Screen
        </Text>

        <TouchableOpacity
        onPress={()=>{
navigation.navigate('WelcomeScreen')
        }}
          activeOpacity={0.8}
          style={[
            styles.button,
            { backgroundColor: colors.primary, borderColor: colors.white },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
