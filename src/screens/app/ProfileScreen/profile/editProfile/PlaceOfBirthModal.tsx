import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';

interface PlaceOfBirthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (place: string) => void;
   defaultValue?: string;
}

const PlaceOfBirthModal: React.FC<PlaceOfBirthModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
    defaultValue = '',
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
 const [place, setPlace] = useState(defaultValue);

useEffect(() => {
    if (isVisible) {
      setPlace(defaultValue || '');
    }
  }, [isVisible, defaultValue]);

  const handleUpdate = () => {
    if (place.trim().length > 0) {
      onConfirm(place.trim());
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>Place of Birth</Text>

            {/* Input */}
            <View style={styles(colors).fieldContainer}>
              <Text style={styles(colors).label}>Enter Place of Birth</Text>
              <TextInput
                placeholder="Type your place of birth"
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
                onPress={onClose}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>Cancel</Text>
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
                  <Text style={styles(colors).updateText}>Save</Text>
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
