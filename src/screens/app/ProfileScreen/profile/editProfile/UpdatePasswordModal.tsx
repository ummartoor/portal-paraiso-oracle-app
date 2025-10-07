import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Vibration,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { useTranslation } from 'react-i18next';


const eyeIcon = require('../../../../../assets/icons/eye.png');
const eyeOffIcon = require('../../../../../assets/icons/eyeOff.png');

interface UpdatePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (oldPass: string, newPass: string, confirmPass: string) => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

const handleUpdate = () => {
    Vibration.vibrate([0, 35, 40, 35]); 
  onConfirm(oldPassword, newPassword, confirmPassword);
};


  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
         <Text style={styles(colors).heading}>{t('update_password_header')}</Text>

            {/* Old Password */}
            <View style={styles(colors).fieldContainer}>
                    <Text style={styles(colors).label}>{t('old_password_label')}</Text>
              <View style={styles(colors).inputWrapper}>
                <TextInput
                 placeholder={t('old_password_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showOld}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  style={[
                    styles(colors).input,
                    { backgroundColor: colors.bgBox, color: colors.white },
                  ]}
                />
                <TouchableOpacity
                  style={styles(colors).eyeButton}
                  onPress={() => setShowOld(!showOld)}
                >
                  <Image
                    source={showOld ? eyeOffIcon : eyeIcon}
                    style={styles(colors).eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles(colors).fieldContainer}>
               <Text style={styles(colors).label}>{t('new_password_modal_label')}</Text>
              <View style={styles(colors).inputWrapper}>
                <TextInput
                   placeholder={t('new_password_modal_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[
                    styles(colors).input,
                    { backgroundColor: colors.bgBox, color: colors.white },
                  ]}
                />
                <TouchableOpacity
                  style={styles(colors).eyeButton}
                  onPress={() => setShowNew(!showNew)}
                >
                  <Image
                    source={showNew ? eyeOffIcon : eyeIcon}
                    style={styles(colors).eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles(colors).fieldContainer}>
              <Text style={styles(colors).label}>{t('confirm_password_modal_label')}</Text>
              <View style={styles(colors).inputWrapper}>
                <TextInput
                  placeholder={t('confirm_password_modal_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[
                    styles(colors).input,
                    { backgroundColor: colors.bgBox, color: colors.white },
                  ]}
                />
                <TouchableOpacity
                  style={styles(colors).eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <Image
                    source={showConfirm ? eyeOffIcon : eyeIcon}
                    style={styles(colors).eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel */}
              <TouchableOpacity
            onPress={() => {
                           Vibration.vibrate([0, 35, 40, 35]); 
                           onClose();                          
                         }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
            <Text style={styles(colors).cancelText}>{t('cancel_button')}</Text>
              </TouchableOpacity>

              {/* Update (Gradient) */}
              <TouchableOpacity
                onPress={handleUpdate}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
              <Text style={styles(colors).updateText}>{t('update_button')}</Text>
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdatePasswordModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modal: {
      width: '100%',
      backgroundColor: colors.bgBox,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: 'center',
    },
    heading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 18,
      lineHeight: 22,
      color: colors.primary,
      marginBottom: 20,
    },
    fieldContainer: {
      width: '100%',
      marginBottom: 16,
    },
    label: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.6)',
      backgroundColor: colors.bgBox,
    },
    input: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 14,
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
    },
    eyeButton: {
      paddingHorizontal: 12,
    },
    eyeIcon: {
      width: 16,
      height: 16,
      tintColor: colors.white,
      resizeMode: 'contain',
    },
    buttonRow: {
      width: '100%',
      flexDirection: 'row',
      columnGap: 12,
      marginTop: 10,
    },
    cancelButton: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 200,
    },
    cancelText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.black,
    },
    gradientTouchable: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
           borderWidth:1.7,
      borderColor:'#D9B699',
      borderRadius: 200,
      overflow: 'hidden',
    },
    gradientFill: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    updateText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
    },
  });
