import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import { useTranslation } from 'react-i18next'; 
// Gender Icons
const maleIcon = require('../../../../../assets/icons/maleIcon.png');
const femaleIcon = require('../../../../../assets/icons/femaleIcon.png');
const nonBinaryIcon = require('../../../../../assets/icons/nonBinaryIcon.png');

interface GenderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (gender: string) => void;
   defaultValue?: string | null;
}

const GenderModal: React.FC<GenderModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
   defaultValue,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
    const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<string | null>(defaultValue || null);
  const [isLoading, setIsLoading] = useState(false);

    const genderOptions = [
    { key: 'male', label: t('gender_male'), icon: maleIcon },
    { key: 'female', label: t('gender_female'), icon: femaleIcon },
    { key: 'other', label: t('gender_non_binary'), icon: nonBinaryIcon },
  ];
  
 useEffect(() => {
    if (isVisible) {
      setSelectedGender(defaultValue || null);
    }
  }, [isVisible, defaultValue]);

  const handleConfirm = async () => {
         Vibration.vibrate([0, 35, 40, 35]); 
    if (!selectedGender) return;
    setIsLoading(true);
    await onConfirm(selectedGender);
    setIsLoading(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
        <Text style={styles(colors).heading}>{t('gender_modal_header')}</Text>
            {/* <Text style={styles(colors).subheading}>
              Gender reveals the balance of your masculine and feminine energy
            </Text> */}

            {/* Gender Options */}
           <View style={styles(colors).genderRow}>
              {/* --- CHANGED: Using the translated array --- */}
              {genderOptions.map((item) => {
                const isSelected = selectedGender === item.key;
                return (
                  <View
                    key={item.key}
                    style={{ flex: 1, alignItems: 'center' }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                             Vibration.vibrate([0, 35, 40, 35]); 
                        setSelectedGender(item.key)}}
                    >
                      <GradientBox
                        colors={[colors.black, colors.bgBox]}
                        style={[
                          styles(colors).genderBox,
                          {
                            borderWidth: isSelected ? 1.5 : 1,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.white,
                          },
                        ]}
                      >
                        <Image
                          source={item.icon}
                          style={{
                            width: 50,
                            height: 50,
                            tintColor: isSelected
                              ? colors.primary
                              : '#8D8B8E',
                          }}
                          resizeMode="contain"
                        />
                      </GradientBox>
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles(colors).genderLabel,
                        {
                          color: isSelected ? colors.primary : '#fff',
                          fontFamily: isSelected
                            ? Fonts.aeonikBold
                            : Fonts.aeonikRegular,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
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

              {/* Next (Confirm) */}
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading || !selectedGender}
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

export default GenderModal;

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
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 24,
      color: colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    subheading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    genderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
    },
    genderBox: {
      height: 85,
      width: 85,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    genderLabel: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
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
