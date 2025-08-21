import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Fonts } from '../constants/fonts';
import { useAuthStore } from '../store/useAuthStore';
import logoutIcon from '../assets/icons/logOutIcon.png';
import GradientBox from './GradientBox';

interface LogOutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogOutModal: React.FC<LogOutModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    onClose();
    onConfirm();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Icon */}
            <Image
              source={logoutIcon}
              style={styles(colors).iconImage}
              resizeMode="contain"
            />

            {/* Heading */}
            <Text style={styles(colors).heading}>Log out</Text>

            {/* Description */}
            <Text style={styles(colors).description}>
              Are you sure you want to logout?
            </Text>

            {/* Buttons */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* Confirm (Gradient) */}
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  <Text style={styles(colors).logoutText}>Log Out</Text>
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogOutModal;

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
      paddingVertical: 35,
      borderRadius: 15,
      alignItems: 'center',
      position: 'relative',
    },
    iconImage: {
      width: 50,
      height: 50,
    },
    heading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 18,
      lineHeight: 22,
      color: colors.primary,
      marginTop: 14,
      zIndex: 1,
    },
    description: {
      marginTop: 4,
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
      textAlign: 'center',
      zIndex: 1,
    },
    buttonRow: {
      width: '100%',
      flexDirection: 'row',
      columnGap: 12, // (better support than 'gap' on some RN versions)
      zIndex: 1,
      paddingHorizontal: 20,
      marginTop: 20,
    },

    // Equal-width buttons: flexGrow + flexBasis: 0 forces 50/50 split
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
      lineHeight: 24,
      color: colors.black,
    },

    gradientTouchable: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
      borderRadius: 200,
      overflow: 'hidden', // clip gradient corners
    },
    gradientFill: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoutText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 24,
      color: colors.white,
    },
  });
