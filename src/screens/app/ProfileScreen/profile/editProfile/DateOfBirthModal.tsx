import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
import DatePicker from 'react-native-date-picker';

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
  const colors = useThemeStore((state) => state.theme.colors);

  const [date, setDate] = useState(defaultValue || new Date(2000, 0, 1));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (isVisible) {
          setDate(defaultValue || new Date(2000, 0, 1));
      }
  }, [isVisible, defaultValue]);

  const handleConfirm = async () => {
    setIsLoading(true);
    const formattedDate = date.toISOString().split('T')[0];
    await onConfirm(formattedDate);
    setIsLoading(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>Select Date of Birth</Text>
            {/* <Text style={styles(colors).subheading}>
              Please enter your date of birth
            </Text> */}

            {/* Date Picker */}
            <View
              style={[
                styles(colors).dobBox,
                { backgroundColor: colors.bgBox, borderColor: colors.white },
              ]}
            >
              <DatePicker
                date={date}
                mode="date"
                onDateChange={setDate}
                theme="dark"
                style={styles(colors).datePicker}
              />
            </View>

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

              {/* Update */}
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
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles(colors).updateText}>Save</Text>
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
      fontSize: 22,
      color: colors.white,
      marginBottom: 25,
      textAlign: 'center',
    },
    subheading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
    },
    dobBox: {
      borderWidth: 1,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      marginBottom: 20,
    },
    datePicker: {
      width: 280,
      height: 200,
      alignSelf: 'center',
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
