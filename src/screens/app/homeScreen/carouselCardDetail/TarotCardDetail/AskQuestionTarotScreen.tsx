import React, { useState, useEffect } from 'react';
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
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const AskQuestionTarotScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check feature permissions
  const {
    isAllowed,
    hasReachedLimit,
    remainingUsage,
    dailyLimit,
    isUnlimited,
    isLoading: isCheckingPermission,
    refresh: refreshPermission,
  } = useFeaturePermission('tarot');

  // Fetch permissions on mount (non-blocking - don't wait for it)
  useEffect(() => {
    // Fetch in background, don't block UI
    refreshPermission().catch(err => {
      console.log('Permission check failed (non-critical):', err);
      // Don't show error to user, just log it
    });
  }, [refreshPermission]);

  const handleNext = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    Vibration.vibrate([0, 35, 40, 35]);
    if (!question.trim()) {
      Alert.alert(
        t('alert_input_required_title'),
        t('alert_input_required_message_question'),
      );
      return;
    }

    setIsSubmitting(true);

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

    // Check permissions before navigating - show alert then upgrade modal if needed
    if (!isAllowed) {
      Alert.alert(
        'Upgrade your package',
        'This feature is not available in your current package. Please upgrade to access Tarot readings.',
        [
          {
            text: 'OK',
            onPress: () => setShowSubscriptionModal(true),
          },
        ],
        { cancelable: false },
      );
      return;
    }

    if (hasReachedLimit) {
      Alert.alert(
        'Daily Limit Reached',
        `You have reached your daily limit of ${dailyLimit} Tarot reading${
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
      setIsSubmitting(false);
      return;
    }

    // This is the important change: send the question to the next screen
    navigation.navigate('TarotCardDetail', { userQuestion: question });
    // Note: We don't reset isSubmitting here because we're navigating away
  };

  // Disable button if question is empty or if submitting
  const isButtonDisabled = !question.trim() || isSubmitting;
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
            </View>

            {/* Footer with button */}
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
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.nextText}>{t('continue_button')}</Text>
                  )}
                </GradientBox>
              </TouchableOpacity>
            </View>
          </ScrollView>
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

export default AskQuestionTarotScreen;

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
  footer: {
    marginTop: 30,
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
