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

interface TimeOfBirthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
    defaultValue?: string;
}


const parseTimeString = (timeString?: string): Date => {
    if (!timeString) return new Date(2000, 0, 1, 8, 0); // Default 8 AM
    
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) { 
        hours = 0;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0);
    return date;
};

const TimeOfBirthModal: React.FC<TimeOfBirthModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
}) => {
  const colors = useThemeStore(state => state.theme.colors);

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
            {/* Heading */}
            <Text style={styles(colors).heading}>Select Time of Birth</Text>

            {/* Time Picker */}
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
