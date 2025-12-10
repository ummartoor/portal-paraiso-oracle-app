import React, { useEffect, useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import { useTranslation } from 'react-i18next';
import { useFeaturePermission } from '../../../../../store/useFeaturePermissionStore';
import SubscriptionPlanModal from '../../../../../components/SubscriptionPlanModal';
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

  // Check feature permissions
  const {
    isAllowed,
    hasReachedLimit,
    remainingUsage,
    dailyLimit,
    isUnlimited,
    isLoading: isCheckingPermission,
    refresh: refreshPermission,
  } = useFeaturePermission('buzios');

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch permissions on mount (non-blocking - don't wait for it)
  useEffect(() => {
    // Fetch in background, don't block UI
    refreshPermission().catch(err => {
      console.log('Permission check failed (non-critical):', err);
      // Don't show error to user, just log it
    });
  }, [refreshPermission]);

  const requiredError = t('alert_input_required_message_question');
  const minLengthError = t('validation_question_min_length', { count: 10 });
  const maxLengthError = t('validation_question_max_length', { count: 500 });

  const validationSchema = Yup.object().shape({
    question: Yup.string()
      .required(requiredError)
      .min(10, minLengthError)
      .max(500, maxLengthError),
  });

  const handlePermissionCheck = async (question: string) => {
    // If permissions are still loading, wait a bit and refresh
    if (isCheckingPermission) {
      // Wait for permission check to complete (with timeout)
      try {
        await Promise.race([
          new Promise(resolve => {
            const checkInterval = setInterval(() => {
              if (!isCheckingPermission) {
                clearInterval(checkInterval);
                resolve(true);
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve(false);
            }, 3000); // 3 second timeout
          }),
        ]);
        // Refresh one more time to be sure
        await refreshPermission();
      } catch (err) {
        console.log('Permission check timeout, proceeding anyway');
      }
    }

    // Check permissions and show alert then upgrade modal if needed
    if (!isAllowed) {
      Alert.alert(
        'Upgrade your package',
        'This feature is not available in your current package. Please upgrade to access Búzios readings.',
        [
          {
            text: 'OK',
            onPress: () => setShowSubscriptionModal(true),
          },
        ],
        { cancelable: false },
      );
      return false;
    }

    if (hasReachedLimit) {
      Alert.alert(
        'Daily Limit Reached',
        `You have reached your daily limit of ${dailyLimit} Búzios reading${
          dailyLimit === 1 ? '' : 's'
        }. Please upgrade to get unlimited access.`,
        [
          {
            text: 'OK',
            onPress: () => setShowSubscriptionModal(true),
          },
        ],
        { cancelable: false },
      );
      return false;
    }

    return true;
  };

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
            onSubmit={async values => {
              // Prevent multiple submissions
              if (isSubmitting) {
                return;
              }

              setIsSubmitting(true);
              Vibration.vibrate([0, 35, 40, 35]);
              // Check permissions before navigating
              const canProceed = await handlePermissionCheck(values.question);
              if (canProceed) {
                navigation.navigate('CaurisCardDetail', {
                  userQuestion: values.question,
                });
                // Note: We don't reset isSubmitting here because we're navigating away
              } else {
                setIsSubmitting(false);
              }
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

                  {/* Permission Status Display */}
                  {!isCheckingPermission && (
                    <View style={styles.permissionStatus}>
                      {!isAllowed ? (
                        <Text style={styles.permissionText}>
                          Feature not available in your package
                        </Text>
                      ) : hasReachedLimit ? (
                        <Text style={styles.permissionText}>
                          Daily limit reached ({dailyLimit} readings)
                        </Text>
                      ) : (
                        <Text style={styles.permissionTextSuccess}>
                          {isUnlimited
                            ? 'Unlimited readings available'
                            : `${remainingUsage} of ${dailyLimit} readings remaining today`}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.footer}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSubmit()}
                      style={{ width: '100%' }}
                      disabled={!isValid || !dirty || isSubmitting}
                    >
                      <GradientBox
                        colors={
                          !isValid ||
                          !dirty ||
                          isSubmitting ||
                          (isCheckingPermission === false &&
                            (!isAllowed || hasReachedLimit))
                            ? ['#a19a9aff', '#a19a9aff']
                            : [colors.black, colors.bgBox]
                        }
                        style={[
                          styles.nextBtn,
                          !isValid ||
                          !dirty ||
                          isSubmitting ||
                          (isCheckingPermission === false &&
                            (!isAllowed || hasReachedLimit))
                            ? { borderWidth: 0 }
                            : { borderWidth: 1, borderColor: colors.primary },
                        ]}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator
                            color={colors.white}
                            size="small"
                          />
                        ) : (
                          <Text style={styles.nextText}>
                            {t('continue_button')}
                          </Text>
                        )}
                      </GradientBox>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </Formik>
        </KeyboardAvoidingView>
        <SubscriptionPlanModal
          isVisible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onConfirm={() => {
            setShowSubscriptionModal(false);
            refreshPermission();
          }}
        />
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
    height: 120,
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
    marginTop: 30,
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
  permissionStatus: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 63, 80, 0.3)',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 13,
    fontFamily: Fonts.aeonikRegular,
    color: '#FF7070',
    textAlign: 'center',
  },
  permissionTextSuccess: {
    fontSize: 13,
    fontFamily: Fonts.aeonikRegular,
    color: '#4CAF50',
    textAlign: 'center',
  },
});
