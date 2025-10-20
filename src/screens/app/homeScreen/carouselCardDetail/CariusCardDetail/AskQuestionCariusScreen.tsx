import React from 'react';
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
// --- NEW: Import Formik and Yup ---
import { Formik } from 'formik';
import * as Yup from 'yup';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const AskQuestionCariusScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();

  const requiredError = t('alert_input_required_message_question');
  const minLengthError = t('validation_question_min_length', { count: 10 });
  const maxLengthError = t('validation_question_max_length', { count: 500 });

  const validationSchema = Yup.object().shape({
    question: Yup.string()
      .required(requiredError)
      .min(10, minLengthError)
      .max(500, maxLengthError),
  });

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

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* --- FIX: Formik now wraps everything to provide context to the button --- */}
          <Formik
            initialValues={{ question: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              Vibration.vibrate([0, 35, 40, 35]);
              navigation.navigate('CaurisCardDetail', { userQuestion: values.question });
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty, // <-- 1. GET THE 'dirty' PROP FROM FORMIK
            }) => (
              <>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={[styles.heading, { color: colors.white }]}>
                    {t('ask_question_heading')}
                  </Text>
                  <Text style={[styles.subheading, { color: colors.primary }]}>
                    {t('ask_question_subheading')}
                  </Text>
                  
                  <TextInput
                    style={styles.inputField}
                    placeholder={t('ask_question_placeholder')}
                    placeholderTextColor="#999"
                    value={values.question}
                    onChangeText={handleChange('question')}
                    onBlur={handleBlur('question')}
                    multiline={true}
                  />
                  {touched.question && errors.question && (
                    <Text style={styles.errorText}>{errors.question}</Text>
                  )}
                </ScrollView>

                {/* --- FIX: Footer is now outside the ScrollView but inside Formik --- */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSubmit()}
                    style={{ width: '100%' }}
                    // --- 2. THE FIX IS HERE: Button is disabled if form is not valid OR if it hasn't been touched ---
                    disabled={!isValid || !dirty} 
                  >
                    <GradientBox
                      colors={
                        !isValid || !dirty // <-- 3. MATCH THE DISABLED LOGIC FOR STYLING
                          ? ['#a19a9aff', '#a19a9aff']
                          : [colors.black, colors.bgBox]
                      }
                      style={[
                        styles.nextBtn,
                        !isValid || !dirty // <-- 4. MATCH THE DISABLED LOGIC FOR STYLING
                          ? { borderWidth: 0 }
                          : { borderWidth: 1, borderColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.nextText}>{t('continue_button')}</Text>
                    </GradientBox>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default AskQuestionCariusScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 10, // Adjusted for padding
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
  // --- FIX: Updated styles for better layout ---
  scrollContent: {
    flexGrow: 1,
 
    paddingHorizontal: 20,
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
    height: 150,
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
  errorText: {
    color: '#FF7070',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    marginTop: 8,
    width: '100%',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20, 
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent', 
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

