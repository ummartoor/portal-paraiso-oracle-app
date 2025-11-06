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
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import { useTranslation } from 'react-i18next';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const AskQuestionAstrologyScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');

  const handleNext = () => {
      Vibration.vibrate([0, 35, 40, 35]); 
    if (!question.trim()) {
      Alert.alert(
        t('alert_input_required_title'),
        t('alert_input_required_message_question'),
      );
      return;
    }

    navigation.navigate('AstrologyCardDetail', { userQuestion: question });
  };
  const isButtonDisabled = !question.trim();
  return (
    <ImageBackground
      source={require('../../../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* --- Header --- */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{t('ask_question_header')}</Text>
          </View>
        </View>

        {/* --- Body with scroll and keyboard handling --- */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Heading and Subheading in center */}
              <Text style={[styles.heading, { color: colors.white }]}>
                {t('ask_question_heading')}
              </Text>
              <Text style={[styles.subheading, { color: colors.primary }]}>
                {t('ask_question_subheading')}
              </Text>

              {/* Input Field */}
              <TextInput
                style={styles.inputField}
                placeholder={t('ask_question_placeholder')}
                placeholderTextColor="#999"
                value={question}
                onChangeText={setQuestion}
                multiline={true}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={{ width: '100%' }}
              disabled={isButtonDisabled}
            >
              <GradientBox
                colors={
                  isButtonDisabled
                    ? ['#a19a9aff', '#a19a9aff']
                    : [colors.black, colors.bgBox]
                }
                style={[
                  styles.nextBtn,

                  isButtonDisabled
                    ? { borderWidth: 0 }
                    : { borderWidth: 1, borderColor: colors.primary },
                ]}
              >
                <Text style={styles.nextText}>{t('continue_button')}</Text>
              </GradientBox>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default AskQuestionAstrologyScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginBottom: 10,
  },
  backBtn: {
    position: 'absolute',
    left: -10,
    height: 40,
    width: 40,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
  },
  content: {
    justifyContent: 'center', // Center vertically
    alignItems: 'center',
    paddingBottom: 100, // space for button
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
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  inputField: {
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 63, 80, 0.5)',
    paddingHorizontal: 20,
    paddingTop: 20,
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
    textAlignVertical: 'top',
    width: '100%',
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 10,
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
