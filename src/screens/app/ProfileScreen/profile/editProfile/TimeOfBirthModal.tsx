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
import { useTranslation } from 'react-i18next';

interface TimeOfBirthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => Promise<any>;
  defaultValue?: string;
}

// --- THIS FUNCTION IS NOW FIXED AND MORE ROBUST ---
const parseTimeString = (timeString?: string): Date => {
  const defaultDate = new Date(2000, 0, 1, 8, 0); // Default to 8:00 AM

  if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
    return defaultDate;
  }

  try {
    const [time, modifier] = timeString.split(' ');
    const timeParts = time.split(':');
    
    if (timeParts.length < 2) {
      return defaultDate;
    }

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      return defaultDate;
    }

    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0; // Midnight case
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    if (isNaN(date.getTime())) {
      return defaultDate;
    }
    
    return date;
  } catch (error) {
    console.error("Error parsing time string:", timeString, error);
    return defaultDate;
  }
};

const TimeOfBirthModal: React.FC<TimeOfBirthModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
}) => {
  const colors = useThemeStore(state => state.theme.colors);
  const { t } = useTranslation();
  const [time, setTime] = useState(parseTimeString(defaultValue));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTime(parseTimeString(defaultValue));
    }
  }, [isVisible, defaultValue]);

  const handleConfirm = async () => {
    setIsLoading(true);
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    await onConfirm(formattedTime);
    setIsLoading(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            <Text style={styles(colors).heading}>{t('tob_modal_header')}</Text>

            <View
              style={[
                styles(colors).dobBox,
                { backgroundColor: colors.bgBox, borderColor: colors.white },
              ]}
            >
              <DatePicker
                date={time}
                mode="time"
                onDateChange={setTime}
                theme="dark"
                style={styles(colors).datePicker}
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

export default TimeOfBirthModal;

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
      color: colors.primary,
      marginBottom: 25,
      textAlign: 'center',
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
      borderWidth: 1.7,
      borderColor: '#D9B699',
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

