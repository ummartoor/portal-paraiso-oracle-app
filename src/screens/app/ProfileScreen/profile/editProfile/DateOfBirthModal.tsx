

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Platform, 
} from 'react-native';

import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';

import DateTimePickerModal from "react-native-modal-datetime-picker";

import { useTranslation } from 'react-i18next';

interface DateOfBirthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (dob: string) => void;
  defaultValue?: Date | null;
}

const DateOfBirthModal: React.FC<DateOfBirthModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
}) => {
  const colors = useThemeStore(state => state.theme.colors);
  const { t } = useTranslation();
  

  const [date, setDate] = useState(() => defaultValue || new Date(2000, 0, 1));
  const [isLoading, setIsLoading] = useState(false);
  

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


  const showDatePicker = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };


  const handleConfirmPicker = (selectedDate: Date) => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      // Vibration.vibrate([0, 35, 40, 35]);
      setDate(selectedDate);
    } else {
      console.warn("Invalid date selected from picker");
    }
    hideDatePicker(); 
  };
  // -----------------------------------------------------------------


  useEffect(() => {
    if (isVisible) {
      setDate(defaultValue || new Date(2000, 0, 1));
      setDatePickerVisibility(false);
    }
  }, [isVisible, defaultValue]);


  const handleConfirm = async () => {
    // Vibration.vibrate([0, 35, 40, 35]);
    setIsLoading(true);
    // Format logic wahi hai
    const formattedDate = date.toISOString().split('T')[0];
    await onConfirm(formattedDate);
    setIsLoading(false);
   
  };


  const displayDateString = date instanceof Date && !isNaN(date.getTime())
                            ? date.toLocaleDateString() // Simple format
                            : t('select_date_placeholder', 'Select Date');

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          {/* Modal Content Box */}
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>{t('dob_modal_header')}</Text>

            
            <TouchableOpacity
              style={[
                styles(colors).dobBox, // Style reuse kiya
                { paddingVertical: 18, width: '95%', marginBottom: 25 }, 
              ]}
              onPress={showDatePicker} 
              accessibilityLabel={t('open_date_picker_label', 'Open date picker')}
              accessibilityRole="button"
            >
              <Text style={[styles(colors).pickerButtonText, { color: colors.primary }]}>
                  {displayDateString}
              </Text>
            </TouchableOpacity>
            {/* --- END BADLAAV --- */}

      
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date" 
                onConfirm={handleConfirmPicker}
                onCancel={hideDatePicker}
                date={date} // Current date state
                display={Platform.OS === 'ios' ? 'spinner' : 'spinner'} 
                maximumDate={new Date()} 
            />
            {/* --- END ADDITION --- */}

     
            <View style={styles(colors).buttonRow}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  // Vibration.vibrate([0, 35, 40, 35]);
                  hideDatePicker(); 
                  onClose(); 
                }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>
                  {t('cancel_button')}
                </Text>
              </TouchableOpacity>
              {/* Update Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Text style={styles(colors).updateText}>
                      {t('update_button')}
                    </Text>
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

export default DateOfBirthModal;

// --- Styles (TimeOfBirthModal se milte julte) ---
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
      maxWidth: 400,
      backgroundColor: colors.bgBox,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.primary, // Color primary rakha (Time modal jaisa)
      marginBottom: 25,
      textAlign: 'center',
    },
    // Yeh style ab button ke liye hai
    dobBox: {
      borderWidth: 1,
      borderRadius: 16,
      borderColor: colors.white + '80',
      backgroundColor: colors.bgBox,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Yeh naya style add kiya hai button ke text ke liye
    pickerButtonText: { 
      fontSize: 18,
      fontFamily: Fonts.aeonikRegular,
      // Color inline set hai
    },
    // Yeh style (datePicker) ab zaroori nahin
    // datePicker: { ... },

    buttonRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      columnGap: 12,
      marginTop: 20, // Margin badhaya (Time modal jaisa)
    },
    cancelButton: {
      flex: 1, // 'flexGrow: 1, flexBasis: 0' ki jagah 'flex: 1'
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 25, // Pill shape
      borderWidth: 1,
      borderColor: colors.grey || '#ccc',
    },
    cancelText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.black,
      fontWeight: '500',
    },
    gradientTouchable: {
      flex: 1, // 'flexGrow: 1, flexBasis: 0' ki jagah 'flex: 1'
      height: 50,
      borderRadius: 25, // Pill shape
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
      fontWeight: '500',
    },
  });

