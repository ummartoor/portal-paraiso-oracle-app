
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../../../navigation/routeTypes';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

// --- Assets ---
const radioOff = require('../../../../../assets/icons/unfillIcon.png');
const radioOn = require('../../../../../assets/icons/checkIcon.png');
const successIcon = require('../../../../../assets/icons/successfullIcon.png'); // Re-added for modal

// --- Constants ---
// Step 2: Reasons for deletion - will be populated with translations
let DELETION_REASONS: string[] = [];
let WARNING_POINTS: string[] = [];

const DeleteAccountScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const deleteAccount = useAuthStore(state => state.deleteAccount);
  const { t } = useTranslation();

  // Initialize translation arrays
  DELETION_REASONS = [
    t('delete_account_reason_1'),
    t('delete_account_reason_2'),
    t('delete_account_reason_3'),
    t('delete_account_reason_4'),
    t('delete_account_reason_5'),
    t('delete_account_reason_6'),
  ];

  WARNING_POINTS = [
    t('delete_account_warning_1'),
    t('delete_account_warning_2'),
    t('delete_account_warning_3'),
    t('delete_account_warning_4'),
  ];

  // --- State Management ---
  const [step, setStep] = useState(1); // 1 for warning, 2 for reasons
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Derived State ---
  const isReasonSelected = selectedReason !== '';
  const isOtherReasonValid =
    selectedReason !== 'Other' ||
    (selectedReason === 'Other' && otherReason.trim() !== '');
  const canDelete = isReasonSelected && isOtherReasonValid && !isDeleting;

  // --- Handlers ---
  const handleBackPress = () => {
    if (step === 2) {
      setStep(1); // Go back to the warning screen from the reason screen
    } else {
      navigation.goBack(); // Go back to the previous screen from the warning screen
    }
  };

  const onPressDelete = async () => {
    if (!canDelete) {
       Alert.alert(t('delete_account_reason_required_title'), t('delete_account_reason_required_message'));
       return;
    }

    setIsDeleting(true);
    const success = await deleteAccount(selectedReason, otherReason);
    setIsDeleting(false);

    if (success) {
      setShowSuccess(true);
    }
  };

  const onDismissSuccessModal = () => {
    setShowSuccess(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderStepOne = () => (
    <>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.heading, { color: colors.white }]}>
                {t('delete_account_sorry_title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.white, opacity: 0.8 }]}>
                {t('delete_account_warning_subtitle')}
            </Text>
            <View style={styles.listWrap}>
                {WARNING_POINTS.map((txt, i) => {
                    const isLastItem = i === WARNING_POINTS.length - 1;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.warningItemBox,
                                { backgroundColor: colors.bgBox },
                                // --- FIX: Apply border style only to the last item ---
                                isLastItem && {
                                    // borderColor: colors.primary,
                                    // borderWidth: 1.5,
                                },
                            ]}>
                            {/* --- FIX: Removed conditional text styling --- */}
                            <Text style={[styles.itemText, { color: colors.white }]}>
                                {txt}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
        {/* --- Footer for Step 1 --- */}
        <View style={styles.footer}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={{ width: '100%' }}
                onPress={() => setStep(2)}>
                <GradientBox
                    colors={[colors.black, colors.bgBox]}
                    style={[styles.actionBtn, { borderColor: colors.primary, borderWidth: 1 }]}>
                    <Text style={[styles.actionText, { color: colors.white }]}>{t('continue_button')}</Text>
                </GradientBox>
            </TouchableOpacity>
        </View>
    </>
  );

  const renderStepTwo = () => (
    <>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: colors.white }]}>
          {t('delete_account_reason_title')}
        </Text>

        {/* Deletion Reasons */}
        <View style={styles.listWrap}>
          {DELETION_REASONS.map((reason, i) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                onPress={() => setSelectedReason(reason)}
                style={[
                  styles.itemBox,
                  {
                    backgroundColor: colors.bgBox,
                    borderColor: isSelected ? colors.primary : 'transparent',
                  },
                ]}>
                <Image
                  source={isSelected ? radioOn : radioOff}
                  style={[styles.leftIcon, { tintColor: isSelected ? colors.primary : colors.white }]}
                  resizeMode="contain"
                />
                <Text style={[styles.itemText, { color: colors.white }]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Other Reason Text Input */}
        {selectedReason === t('delete_account_reason_6') && (
          <View style={[styles.textInputContainer, { backgroundColor: colors.bgBox }]}>
            <TextInput
              style={[styles.textInput, { color: colors.white }]}
              placeholder={t('delete_account_other_placeholder')}
              placeholderTextColor={`${colors.white}80`}
              value={otherReason}
              onChangeText={setOtherReason}
              multiline
            />
          </View>
        )}
      </ScrollView>

      {/* --- Footer for Step 2 --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ width: '100%' }}
          onPress={onPressDelete}
          disabled={!canDelete}>
          <GradientBox
            colors={[colors.black, colors.bgBox]}
            style={[
              styles.actionBtn,
              {
                borderWidth: 1,
                borderColor: canDelete ? colors.primary : colors.bgBox,
              },
            ]}>
            {isDeleting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.actionText, { color: colors.white }]}>
                {t('delete_account_button')}
              </Text>
            )}
          </GradientBox>
        </TouchableOpacity>
      </View>
    </>
  );

  const m = modalStyles(colors);

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backBtn}>
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.headerTitle, { color: colors.white }]}>
              {t('delete_account_header')}
            </Text>
          </View>
        </View>

        {/* --- Main Content: Renders Step 1 or Step 2 --- */}
        {step === 1 ? renderStepOne() : renderStepTwo()}

        {/* --- Success Modal (Restored) --- */}
        <Modal
          visible={showSuccess}
          animationType="slide"
          transparent
          onRequestClose={onDismissSuccessModal}>
          <View style={[StyleSheet.absoluteFill, m.overlayBackground]}>
            <View style={m.overlay}>
              <View style={m.modal}>
                <Image
                  source={successIcon}
                  style={m.iconImage}
                  resizeMode="contain"
                />
                <Text style={m.heading}>{t('delete_account_success_title')}</Text>
                <Text style={m.description}>
                  {t('delete_account_success_message')}
                </Text>
                <TouchableOpacity
                  onPress={onDismissSuccessModal}
                  activeOpacity={0.9}
                  style={m.singleBtnTouchable}>
                  <GradientBox
                    colors={[colors.black, colors.bgBox]}
                    style={m.singleBtnFill}>
                    <Text style={m.singleBtnText}>{t('continue_button')}</Text>
                  </GradientBox>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DeleteAccountScreen;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: {
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  content: { flex: 1 },
  heading: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  listWrap: { gap: 12, marginTop: 6 },
  itemBox: { // For Step 2 reasons
    minHeight: 60,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  warningItemBox: { // For Step 1 warnings
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftIcon: { width: 20, height: 20, marginRight: 12 },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.aeonikRegular,
  },
  textInputContainer: {
    minHeight: 80,
    borderRadius: 14,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    textAlignVertical: 'top',
  },
  footer: {
    paddingTop: 10,
    paddingBottom: Platform.select({ ios: 8, android: 45 }),
    // --- FIX: Changed background color to transparent ---
    backgroundColor: 'transparent',
  },
  actionBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.aeonikRegular,
  },
});

/* -------- Success modal styles (Restored) -------- */
const modalStyles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    modal: {
      width: '100%',
      backgroundColor: colors.bgBox,
      paddingVertical: 35,
      borderRadius: 15,
      alignItems: 'center',
      position: 'relative',
    },
    iconImage: { width: 50, height: 50 },
    heading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 18,
      lineHeight: 22,
      color: colors.primary,
      marginTop: 14,
      textTransform: 'capitalize',
    },
    description: {
      marginTop: 6,
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    singleBtnTouchable: {
      width: '80%',
      height: 50,
      borderRadius: 200,
      overflow: 'hidden',
      marginTop: 20,
      paddingHorizontal: 20,
      alignSelf: 'center',
    },
    singleBtnFill: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 200,
    },
    singleBtnText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
    },
  });
