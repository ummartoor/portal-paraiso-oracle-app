





import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../constants/fonts';
import DatePicker from 'react-native-date-picker';
import GradientBox from '../../../components/GradientBox';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const DateofBirthScreen_3 = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

  const [date, setDate] = useState(new Date(2000, 0, 1));

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header with back arrow + progress bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white }]}>
          Date of Birth
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
          Please enter your date of birth
        </Text>

        {/* DOB Picker inside bgBox */}
        <View
          style={[
            styles.dobBox,
            { backgroundColor: colors.bgBox, borderColor: colors.white },
          ]}
        >
          <DatePicker
            date={date}
            mode="date"
            onDateChange={setDate}

            
            locale="en"
            style={{
              alignSelf: 'center',
              width: 350,
            }}
          />
        </View>

        {/* Next Button fixed at bottom */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TimeofBirth')}
            style={{ width: '100%' }}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.nextBtn,
                { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              <Text style={styles.nextText}>Next</Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DateofBirthScreen_3;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50',
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    marginBottom: 35,
  },
  dobBox: {

    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
 footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  nextBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});
