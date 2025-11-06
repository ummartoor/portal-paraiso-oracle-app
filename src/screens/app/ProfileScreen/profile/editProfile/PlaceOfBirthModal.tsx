import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { useTranslation } from 'react-i18next';
interface PlaceOfBirthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (place: string) => Promise<boolean>;
  defaultValue?: string;
}

const PlaceOfBirthModal: React.FC<PlaceOfBirthModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue = '',
}) => {
  const colors = useThemeStore(state => state.theme.colors);
  const { t } = useTranslation();
  const [place, setPlace] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isVisible) {
      setPlace(defaultValue || '');
    }
  }, [isVisible, defaultValue]);

  const handleUpdate = async () => {
    // Vibration.vibrate([0, 35, 40, 35]);
    Vibration.vibrate([0, 15, 30, 15]);
    if (place.trim().length > 0 && !isLoading) {
      setIsLoading(true);
      await onConfirm(place.trim());
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>{t('pob_modal_header')}</Text>

            {/* Input */}
            <View style={styles(colors).fieldContainer}>
              <Text style={styles(colors).label}>{t('pob_modal_label')}</Text>
              <TextInput
                placeholder={t('pob_modal_placeholder')}
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={place}
                onChangeText={setPlace}
                style={[
                  styles(colors).input,
                  { backgroundColor: colors.bgBox, color: colors.white },
                ]}
              />
            </View>

            {/* Buttons */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel */}
              <TouchableOpacity
                onPress={() => {
                  // Vibration.vibrate([0, 35, 40, 35]);
                  Vibration.vibrate([0, 15, 30, 15]);
                  onClose();
                }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>
                  {t('cancel_button')}
                </Text>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity
                onPress={handleUpdate}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  <Text style={styles(colors).updateText}>
                    {t('update_button')}
                  </Text>
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PlaceOfBirthModal;

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
    input: {
      width: '100%',
      height: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.6)',
      paddingHorizontal: 14,
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
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
      borderRadius: 200,
      borderWidth: 1.7,
      borderColor: '#D9B699',
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
