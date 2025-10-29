// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Vibration,
// } from 'react-native';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import { Fonts } from '../../../../../constants/fonts';
// import GradientBox from '../../../../../components/GradientBox';
// import DatePicker from 'react-native-date-picker';
// import { useTranslation } from 'react-i18next';
// interface DateOfBirthModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onConfirm: (dob: string) => void;
//   defaultValue?: Date | null;
// }

// const DateOfBirthModal: React.FC<DateOfBirthModalProps> = ({
//   isVisible,
//   onClose,
//   onConfirm,
//   defaultValue,
// }) => {
//   const colors = useThemeStore(state => state.theme.colors);
//   const { t } = useTranslation();
//   const [date, setDate] = useState(defaultValue || new Date(2000, 0, 1));
//   const [isLoading, setIsLoading] = useState(false);

//   const handleDateChange = (newDate: Date) => {
//     Vibration.vibrate([0, 35, 40, 35]); 
//     setDate(newDate);                   
//   };

//   useEffect(() => {
//     if (isVisible) {
//       setDate(defaultValue || new Date(2000, 0, 1));
//     }
//   }, [isVisible, defaultValue]);

//   const handleConfirm = async () => {
//          Vibration.vibrate([0, 35, 40, 35]); 
//     setIsLoading(true);
//     const formattedDate = date.toISOString().split('T')[0];
//     await onConfirm(formattedDate);
//     setIsLoading(false);
//   };

//   return (
//     <Modal visible={isVisible} animationType="slide" transparent>
//       <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
//         <View style={styles(colors).overlay}>
//           <View style={styles(colors).modal}>
//             {/* Heading */}
//             <Text style={styles(colors).heading}>{t('dob_modal_header')}</Text>
//             {/* <Text style={styles(colors).subheading}>
//               Please enter your date of birth
//             </Text> */}

//             {/* Date Picker */}
//             <View
//               style={[
//                 styles(colors).dobBox,
//                 { backgroundColor: colors.bgBox, borderColor: colors.white },
//               ]}
//             >
//               <DatePicker
//                 date={date}
//                 mode="date"
//               onDateChange={handleDateChange}
//                 theme="dark"
//                 style={styles(colors).datePicker}
//               />
//             </View>

//             {/* Buttons */}
//             <View style={styles(colors).buttonRow}>
//               {/* Cancel */}
//               <TouchableOpacity
//              onPress={() => {
//                   Vibration.vibrate([0, 35, 40, 35]);
//                   onClose();
//                 }}
//                 activeOpacity={0.85}
//                 style={styles(colors).cancelButton}
//               >
//                 <Text style={styles(colors).cancelText}>
//                   {t('cancel_button')}
//                 </Text>
//               </TouchableOpacity>

//               {/* Update */}
//               <TouchableOpacity
//                 onPress={handleConfirm}
//                 activeOpacity={0.9}
//                 style={styles(colors).gradientTouchable}
//                 disabled={isLoading}
//               >
//                 <GradientBox
//                   colors={[colors.black, colors.bgBox]}
//                   style={styles(colors).gradientFill}
//                 >
//                   {isLoading ? (
//                     <ActivityIndicator color={colors.primary} />
//                   ) : (
//                     <Text style={styles(colors).updateText}>
//                       {t('update_button')}
//                     </Text>
//                   )}
//                 </GradientBox>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default DateOfBirthModal;

// const styles = (colors: any) =>
//   StyleSheet.create({
//     overlayBackground: {
//       backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     },
//     overlay: {
//       flex: 1,
//       justifyContent: 'center',
//       paddingHorizontal: 20,
//     },
//     modal: {
//       width: '100%',
//       backgroundColor: colors.bgBox,
//       paddingVertical: 30,
//       paddingHorizontal: 20,
//       borderRadius: 15,
//       alignItems: 'center',
//     },
//     heading: {
//       fontFamily: Fonts.cormorantSCBold,
//       fontSize: 22,
//       color: colors.white,
//       marginBottom: 25,
//       textAlign: 'center',
//     },
//     subheading: {
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//       color: colors.primary,
//       textAlign: 'center',
//       marginBottom: 20,
//     },
//     dobBox: {
//       borderWidth: 1,
//       borderRadius: 16,
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingVertical: 20,
//       marginBottom: 20,
//     },
//     datePicker: {
//       width: 280,
//       height: 200,
//       alignSelf: 'center',
//     },
//     buttonRow: {
//       width: '100%',
//       flexDirection: 'row',
//       columnGap: 12,
//       marginTop: 10,
//     },
//     cancelButton: {
//       flexGrow: 1,
//       flexBasis: 0,
//       height: 50,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.white,
//       borderRadius: 200,
//     },
//     cancelText: {
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//       color: colors.black,
//     },
//     gradientTouchable: {
//       flexGrow: 1,
//       flexBasis: 0,
//       height: 50,
//       borderRadius: 200,
//       borderWidth: 1.7,
//       borderColor: '#D9B699',
//       overflow: 'hidden',
//     },
//     gradientFill: {
//       flex: 1,
//       width: '100%',
//       height: '100%',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     updateText: {
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//       color: colors.white,
//     },
//   });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Platform, // Platform import
} from 'react-native';
// Ensure these paths are correct for your project structure
import { useThemeStore } from '../../../../../store/useThemeStore';
import { Fonts } from '../../../../../constants/fonts';
import GradientBox from '../../../../../components/GradientBox';
// --- YEH BADLA GAYA HAI: Library badal di ---
import DateTimePickerModal from "react-native-modal-datetime-picker";
// ------------------------------------------
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
  
  // State for the selected date
  const [date, setDate] = useState(() => defaultValue || new Date(2000, 0, 1));
  const [isLoading, setIsLoading] = useState(false);
  
  // --- YEH ADD KIYA GAYA HAI: Picker modal ko control karne ke liye ---
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- YEH ADD KIYA GAYA HAI: Functions naye picker modal ke liye ---
  const showDatePicker = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // --- YEH ADD KIYA GAYA HAI: Jab naye picker se date confirm ho ---
  const handleConfirmPicker = (selectedDate: Date) => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      Vibration.vibrate([0, 35, 40, 35]);
      setDate(selectedDate); // Date state ko update karein
    } else {
      console.warn("Invalid date selected from picker");
    }
    hideDatePicker(); // Picker modal ko band karein
  };
  // -----------------------------------------------------------------

  // Jab main modal khule, toh date ko reset karein
  useEffect(() => {
    if (isVisible) {
      setDate(defaultValue || new Date(2000, 0, 1));
      setDatePickerVisibility(false); // Picker modal ko bhi band rakhein
    }
  }, [isVisible, defaultValue]);

  // Jab "Update" button dabe (Main modal ka confirm)
  const handleConfirm = async () => {
    Vibration.vibrate([0, 35, 40, 35]);
    setIsLoading(true);
    // Format logic wahi hai
    const formattedDate = date.toISOString().split('T')[0];
    await onConfirm(formattedDate);
    setIsLoading(false);
    // (Aap chahein toh yahan onClose() call kar sakte hain agar update ke baad modal band karna hai)
  };

  // Button par dikhane ke liye date format
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

            {/* --- YEH BADLA GAYA HAI: Ab yeh picker kholne ka button hai --- */}
            <TouchableOpacity
              style={[
                styles(colors).dobBox, // Style reuse kiya
                { paddingVertical: 18, width: '95%', marginBottom: 25 }, // Time modal se styles liye
              ]}
              onPress={showDatePicker} // Picker modal ko kholein
              accessibilityLabel={t('open_date_picker_label', 'Open date picker')}
              accessibilityRole="button"
            >
              <Text style={[styles(colors).pickerButtonText, { color: colors.primary }]}>
                  {displayDateString}
              </Text>
            </TouchableOpacity>
            {/* --- END BADLAAV --- */}

            {/* --- YEH ADD KIYA GAYA HAI: Naya Picker Modal --- */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date" // Mode ko 'date' rakha
                onConfirm={handleConfirmPicker}
                onCancel={hideDatePicker}
                date={date} // Current date state
                display={Platform.OS === 'ios' ? 'spinner' : 'spinner'} // Dono par spinner
                maximumDate={new Date()} // Future dates select nahi kar sakte
            />
            {/* --- END ADDITION --- */}

            {/* Buttons (Cancel and Update) - Koi Change Nahin */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35]);
                  hideDatePicker(); // Picker modal ko bhi band karein (agar khula ho)
                  onClose(); // Main modal band karein
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

