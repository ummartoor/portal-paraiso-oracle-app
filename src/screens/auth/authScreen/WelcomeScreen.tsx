import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import GradientBox from '../../../components/GradientBox';

import { useTranslation } from 'react-i18next';
const WelcomeScreen: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const { colors } = theme;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
 const { t } = useTranslation();
  return (
    <ImageBackground
      source={require('../../../assets/images/welcomeImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Center Content */}
        <View style={styles.centerContent}>
          <Text style={[styles.title, { color: colors.white }]}>
            {t('welcome_title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
         {t('welcome_subtitle')}
          </Text>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonWrapper}>
          {/* 🔹 Sign up with Gradient */}
    
<TouchableOpacity
  onPress={() => navigation.navigate('SignUp')}
  activeOpacity={0.8}
>
  <GradientBox
    colors={[colors.black, colors.bgBox]}
    style={[styles.button, { borderColor: colors.primary }]} 
  >
    <Text style={[styles.buttonText, { color: colors.white }]}>
  {t('signup_button')}
    </Text>
  </GradientBox>
</TouchableOpacity>


          {/* 🔹 Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            style={[
              styles.button,
              { backgroundColor: colors.bgBox, borderColor: colors.white },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
        {t('login_button')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 250,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    gap: 14,
  },
  button: {
    paddingVertical: 16,
    width: '100%',
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  fontFamily:Fonts.aeonikRegular
  }
});
