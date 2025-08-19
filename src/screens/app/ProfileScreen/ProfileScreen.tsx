import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore'; 
import { Fonts } from '../../../constants/fonts';

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeStore(state => state.theme);
  const logout = useAuthStore(state => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image like Home */}
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')} 
        style={styles.imageBackground}
        resizeMode="cover"
      >
 

        {/* Center Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.white }]}>My Profile</Text>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.8}
            style={[styles.button, { borderColor: colors.white }]}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageBackground: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
   fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom:10  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
