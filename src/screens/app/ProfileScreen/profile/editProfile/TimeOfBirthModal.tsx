import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Platform, // Platform import ko rakhein DateTimePickerModal ke liye
} from 'react-native';
// Ensure these paths are correct for your project structure
import { useThemeStore } from '../../../../../store/useThemeStore'; 
import { Fonts } from '../../../../../constants/fonts'; 
import GradientBox from '../../../../../components/GradientBox'; 
// --- Import the NEW library ---
// Ensure this library is installed: npm install react-native-modal-datetime-picker @react-native-community/datetimepicker
import DateTimePickerModal from "react-native-modal-datetime-picker"; 
import { useTranslation } from 'react-i18next'; // Keep translation import

interface TimeOfBirthModalProps {
  isVisible: boolean; // Main modal visibility
  onClose: () => void;
  onConfirm: (time: string) => Promise<any>; // Keep Promise if it returns one
  defaultValue?: string; // Default time string (e.g., "08:00 AM")
}

// --- parseTimeString function (improved robustness) ---
const parseTimeString = (timeString?: string): Date => {
  const defaultDate = new Date(); // Start with current date
  defaultDate.setHours(8, 0, 0, 0); // Set default time to 8:00 AM

  if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
    // console.log("Parsing default time: No valid time string provided.");
    return defaultDate;
  }

  try {
    // Handle potential spaces and AM/PM using regex for flexibility
    const timeParts = timeString.match(/(\d{1,2}):(\d{1,2})\s*(AM|PM)?/i);
    if (!timeParts) {
      // console.log("Parsing default time: Regex failed for", timeString);
      return defaultDate;
    }


    let hours = parseInt(timeParts[1], 10);
    let minutes = parseInt(timeParts[2], 10);
    const modifier = timeParts[3];

    // Validate parsed numbers
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
       // console.log("Parsing default time: Invalid hours/minutes in", timeString);
       return defaultDate;
    }

    // Adjust hours for AM/PM if present
    if (modifier) {
        const upperModifier = modifier.toUpperCase();
        if (upperModifier === 'PM' && hours > 0 && hours < 12) { // 12 PM should remain 12
            hours += 12;
        } else if (upperModifier === 'AM' && hours === 12) { // 12 AM (Midnight) should be 0
            hours = 0; 
        }
        // Handle cases like 12:xx PM (already correct) or 12:xx AM (needs to be 0)
    }
    
    // Create a new Date object and set the time
    const date = new Date(); // Use today's date, only time matters
    date.setHours(hours, minutes, 0, 0); 
    
    // Final check for validity
    if (isNaN(date.getTime())) {
       // console.log("Parsing default time: Final date object is invalid for", timeString);
       return defaultDate;
    }
    // console.log("Parsed time:", date, "from", timeString);
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
  // Use selector for colors - Ensure this selector doesn't cause re-renders if colors object reference changes
  const colors = useThemeStore(state => state.theme.colors); 
  const { t } = useTranslation(); // Keep t function
  
  // State for the selected time, initialized from defaultValue
  // Use functional update for initial state based on potentially changing prop
  const [time, setTime] = useState(() => parseTimeString(defaultValue)); 
  const [isLoading, setIsLoading] = useState(false);
  // --- State to control the visibility of the new modal picker ---
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- Functions to show/hide the new modal picker ---
  const showDatePicker = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // --- Handler for when a time is confirmed in the new modal picker ---
  const handleConfirmPicker = (selectedTime: Date) => {
    // Ensure selectedTime is valid before setting state
    if (selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
      Vibration.vibrate([0, 35, 40, 35]);
      setTime(selectedTime); // Update the time state
    } else {
      console.warn("Invalid time selected from picker");
      // Optionally fallback to default or keep the previous time
      // setTime(parseTimeString(defaultValue)); 
    }
    hideDatePicker(); // Close the modal picker
  };
  
  // Reset time state ONLY when modal becomes visible OR defaultValue truly changes
  useEffect(() => {
    if (isVisible) {
      // console.log("Modal visible. Setting time from defaultValue:", defaultValue);
      setTime(parseTimeString(defaultValue));
      setDatePickerVisibility(false); // Ensure picker modal is closed initially
    }
    // Dependency array ensures this runs when isVisible or defaultValue changes
  }, [isVisible, defaultValue]); 

  // --- Main confirm handler (for the Update button) ---
  const handleConfirm = async () => {
      // Ensure time is valid before proceeding
      if (!(time instanceof Date) || isNaN(time.getTime())) {
          console.error("Invalid time state, cannot confirm.");
          return;
      }
      Vibration.vibrate([0, 35, 40, 35]); 
    setIsLoading(true);
    // Format the time correctly using 'en-US' locale for AM/PM consistency
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Force AM/PM
    });
    try {
        await onConfirm(formattedTime); // Call the passed onConfirm function
        // Consider closing the modal after successful confirmation
        // onClose(); 
    } catch (error) {
        console.error("Error during onConfirm callback:", error);
        // Handle potential errors - maybe show an alert to the user
    } finally {
        setIsLoading(false);
    }
  };

  // Format the time for display on the button
  const displayTimeString = time instanceof Date && !isNaN(time.getTime()) 
                            ? time.toLocaleTimeString('en-US', { // Use 'en-US' for consistent AM/PM
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            // Fallback using t, ensure 'select_time_placeholder' exists in translations
                            : t('select_time_placeholder', 'Select Time'); 

  return (
    // Main Modal (controlled by isVisible prop)
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          {/* Modal Content Box */}
          <View style={styles(colors).modal}>
            <Text style={styles(colors).heading}>{t('tob_modal_header')}</Text>

            {/* --- Button to open the time picker --- */}
            <TouchableOpacity
              style={[
                styles(colors).dobBox, // Reuse dobBox style for consistency
                 { paddingVertical: 18, width: '95%', marginBottom: 25 }, // Adjust styles
              ]}
              onPress={showDatePicker} // Show the picker modal on press
              accessibilityLabel={t('open_time_picker_label', 'Open time picker')} // Accessibility
              accessibilityRole="button"
            >
              <Text style={[styles(colors).pickerButtonText, { color: colors.primary }]}>
                  {displayTimeString}
              </Text>
            </TouchableOpacity>
            {/* --- END BUTTON --- */}

            {/* --- DateTimePickerModal Component (invisible until triggered) --- */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time" // Set mode to time
                onConfirm={handleConfirmPicker}
                onCancel={hideDatePicker}
                date={time} // Pass the current time state
                display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                // Optional props:
                // is24Hour={false} // Force AM/PM or 24h based on locale preference
                // headerTextIOS={t('pick_a_time', "Pick a Time")} 
                // confirmTextIOS={t('confirm', "Confirm")}
                // cancelTextIOS={t('cancel', "Cancel")}
                // themeVariant="dark" // 'dark', 'light', 'automatic'
                // accentColor={colors.primary} 
            />
            {/* --- END NEW COMPONENT --- */}

            {/* Buttons Row (Cancel and Update) */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35]); 
                  hideDatePicker(); // Hide picker modal if open
                  onClose(); // Close the main modal         
                }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
                accessibilityLabel={t('cancel_button_label', 'Cancel time selection')}
                accessibilityRole="button"
              >
                <Text style={styles(colors).cancelText}>{t('cancel_button')}</Text>
              </TouchableOpacity>
              {/* Update Button */}
              <TouchableOpacity
                onPress={handleConfirm} // Call main confirm handler
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading}
                accessibilityLabel={t('update_button_label', 'Update time')}
                accessibilityRole="button"
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]} // Check colors
                  style={styles(colors).gradientFill}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} size="small" /> // Use size prop
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

// --- Styles (adapted from DateOfBirthModal and previous examples) ---
const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Standard overlay color
    },
    overlay: {
      flex: 1,
      justifyContent: 'center', // Center vertically
      alignItems: 'center', // Center horizontally
      paddingHorizontal: 20, // Padding on the sides
    },
    modal: {
      width: '100%', // Take full width within padding
      maxWidth: 400, // Optional max width for larger screens
      backgroundColor: colors.bgBox, // Use theme background color
      paddingVertical: 30, // Vertical padding inside modal
      paddingHorizontal: 20, // Horizontal padding inside modal
      borderRadius: 15, // Rounded corners
      alignItems: 'center', // Center items like the button
      // Add subtle shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5, // Android shadow
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold, // Use defined font
      fontSize: 22, // Heading size
      color: colors.primary, // Use theme primary color
      marginBottom: 25, // Space below heading
      textAlign: 'center', // Center align heading
    },
    dobBox: { // Style for the button triggering the picker
      borderWidth: 1, // Border width
      borderRadius: 16, // Rounded corners
      borderColor: colors.white + '80', // Border color (slightly transparent white)
      backgroundColor: colors.bgBox, // Background matches modal
      justifyContent: 'center', // Center content vertically
      alignItems: 'center', // Center content horizontally
      // Padding and margin are set directly on the TouchableOpacity now
    },
     pickerButtonText: { // Style for the text inside the button
      fontSize: 18, // Font size for the displayed time
      fontFamily: Fonts.aeonikRegular, // Use defined font
      // Color is set inline using theme colors
    },
     buttonRow: {
      width: '100%', // Take full width for button container
      flexDirection: 'row', // Arrange buttons side-by-side
      justifyContent: 'space-between', // Space them out
      columnGap: 12, // Gap between buttons
      marginTop: 20, // Increased margin above buttons
    },
    cancelButton: {
      flex: 1, // Make buttons share width equally
      height: 50, // Standard button height
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white, // White background for cancel
      borderRadius: 25, // Pill shape
      borderWidth: 1, // Subtle border
      borderColor: colors.grey || '#ccc', // Use theme grey or fallback
    },
    cancelText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14, // Standard button text size
      color: colors.black, // Black text for contrast
       fontWeight: '500', // Medium weight
    },
    gradientTouchable: {
      flex: 1, // Make buttons share width equally
      height: 50, // Standard button height
      borderRadius: 25, // Pill shape
      borderWidth: 1.7, // Border width
      borderColor: '#D9B699', // Keep specific border color
      overflow: 'hidden', // Necessary for gradient border radius
    },
    gradientFill: {
      flex: 1, // Fill the touchable area
      width: '100%',
      height: '100%',
      alignItems: 'center', // Center content (indicator or text)
      justifyContent: 'center', // Center content
    },
    updateText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14, // Standard button text size
      color: colors.white, // White text on gradient
       fontWeight: '500', // Medium weight
    },
  });

