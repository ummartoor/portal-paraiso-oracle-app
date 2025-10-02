import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { useTranslation } from 'react-i18next'; 
interface NameModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<boolean>; // Returns a promise to handle loading
  defaultValue?: string;
}

const NameModal: React.FC<NameModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue = '',
}) => {
  const colors = useThemeStore(state => state.theme.colors);
  const [name, setName] = useState(defaultValue);
    const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setName(defaultValue || '');
    }
  }, [isVisible, defaultValue]);

  const handleUpdate = async () => {
    if (name.trim().length > 0 && !isLoading) {
      setIsLoading(true);
      const success = await onConfirm(name.trim());
      setIsLoading(false);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
     <Text style={styles(colors).heading}>{t('name_modal_header')}</Text>

            <View style={styles(colors).fieldContainer}>
               <Text style={styles(colors).label}>{t('name_modal_label')}</Text>
              <TextInput
               placeholder={t('name_modal_placeholder')}
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={name}
                onChangeText={setName}
                style={[
                  styles(colors).input,
                  { backgroundColor: colors.bgBox, color: colors.white },
                ]}
              />
            </View>

            <View style={styles(colors).buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
               <Text style={styles(colors).cancelText}>{t('cancel_button')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdate}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                         <Text style={styles(colors).updateText}>{t('update_button')}</Text>
                  )}
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NameModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    modal: {
      width: '100%',
      backgroundColor: colors.bgBox,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: 'center',
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.primary,
      marginBottom: 20,
    },
    fieldContainer: { width: '100%', marginBottom: 16 },
    label: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
      marginBottom: 6,
      opacity: 0.8,
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
