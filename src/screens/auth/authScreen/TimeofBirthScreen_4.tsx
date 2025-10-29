
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Vibration, 
  Platform, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Ensure these paths are correct for your project structure
import { useThemeStore } from '../../../store/useThemeStore'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes'; 
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../constants/fonts'; 
// --- Import the NEW library ---
import DateTimePickerModal from "react-native-modal-datetime-picker"; 
// Ensure these paths are correct
import GradientBox from '../../../components/GradientBox'; 
import { useRegisterStore } from '../../../store/useRegisterStore'; 
import { useTranslation } from 'react-i18next'; // Keep translation import

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const TimeofBirthScreen_4 = () => {

  const colors = useThemeStore(state => state.theme.colors);
  // --- END BADLAAV ---

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
  const { t } = useTranslation(); // Keep t function

  // State for the selected time
  const [time, setTime] = useState(new Date(2000, 0, 1, 8, 0)); 

  // --- YEH BADLA GAYA HAI (FIXED) ---
  // Values ko alag alag select karein taake infinite loop na ho
  const updateUserDetails = useRegisterStore(state => state.updateUserDetails);
  const isUpdating = useRegisterStore(state => state.isUpdating);
  // --- END BADLAAV ---

  // State to control the visibility of the new modal picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Functions to show/hide the new modal picker
  const showDatePicker = () => {
    Vibration.vibrate([0, 35, 40, 35]);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };


  // useEffect(() => {
  //   showDatePicker(); // Screen load hotay hi modal ko show kar dega
  // }, []); // [
  // --- END ---

  // Handler for when a time is confirmed in the new modal picker
  const handleConfirmPicker = (selectedTime: Date) => {
    if (selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
      Vibration.vibrate([0, 35, 40, 35]);
      setTime(selectedTime); // Update the time state
    } else {
      console.warn("Invalid time selected");
    }
    hideDatePicker(); // Close the modal picker
  };

  // handleNext function (logic remains the same)
  const handleNext = async () => {
    if (!(time instanceof Date) || isNaN(time.getTime())) {
        console.error("Invalid time selected, cannot proceed.");
        return; 
    }

    Vibration.vibrate([0, 35, 40, 35]);
    
    // Format the time correctly
    const formattedTime = time.toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, 
    });

    const success = await updateUserDetails({ time_of_birth: formattedTime }); 
    
    if (success) {
      navigation.navigate('PlaceofBirth'); // Navigate on success
    } else {
        console.error("Failed to update user details with time");
        // Handle failure appropriately
    }
  };

  // Format the time for display on the button - Use simple string for placeholder
  const displayTimeString = time instanceof Date && !isNaN(time.getTime()) 
                            ? time.toLocaleTimeString([], { 
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : 'Select Time'; // Simple string

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')} // Check path
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header (remains the same) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')} // Check path
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '70%' }]} />
          </View>
        </View>

        {/* Heading (remains the same, uses t) */}
        <Text style={[styles.heading, { color: colors.white }]}>
            {t('tob_header')} 
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
            {t('tob_subheader')}
        </Text>

        {/* --- Button to open the time picker modal --- */}
        <View style={styles.pickerTriggerContainer}>
          <TouchableOpacity
            style={[
              styles.dobBox, 
              { backgroundColor: colors.bgBox, borderColor: colors.primary+'90' },
              styles.pickerButton
            ]}
            onPress={showDatePicker} // Show the modal picker on press
          >
             <Text style={[styles.pickerButtonText, { color: colors.primary }]}>
                {displayTimeString} 
             </Text>
          </TouchableOpacity>
        </View>
        {/* --- END Button --- */}
        
        {/* --- DateTimePickerModal Component for TIME --- */}
        <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time" // Set mode to time
            onConfirm={handleConfirmPicker}
            onCancel={hideDatePicker}
            date={time} // Pass the current time state
            display={Platform.OS === 'ios' ? 'spinner' : 'spinner'} // Spinner on iOS
        />
         {/* --- END Modal Component --- */}

        {/* Footer with Next Button - Use simple string for button text */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
            style={{ width: '100%' }}
            disabled={isUpdating}
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]} // Check colors
              style={[
                styles.nextBtn,
                { borderWidth: 1, borderColor: colors.primary },
              ]}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.nextText}>Next</Text> // Simple string
              )}
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default TimeofBirthScreen_4;

// --- Styles (remain the same) ---
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50', 
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff', 
  },
  heading: {
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    marginBottom: 35,
  },
  pickerTriggerContainer: { 
     alignItems: 'center', 
     marginTop: 20, 
     marginBottom: 20,
  },
  dobBox: { 
    borderWidth: 1.5, 
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18, 
    paddingHorizontal: 30, 
    width: '90%', 
    minHeight: 60, 
    flexDirection: 'row', 

  },
  pickerButton: { 
    // Inherits from dobBox
  },
  pickerButtonText: { 
    fontSize: 18,
    fontFamily: Fonts.aeonikRegular,
    // color is set inline using theme
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  nextBtn: {
    height: 56,
    width: '100%',
    borderRadius: 28, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff', 
    fontFamily: Fonts.aeonikRegular,
    fontWeight: '500', 
  },
});












// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   ActivityIndicator,
//   Vibration, 
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { Fonts } from '../../../constants/fonts';
// import DatePicker from 'react-native-date-picker';
// import GradientBox from '../../../components/GradientBox';
// import { useRegisterStore } from '../../../store/useRegisterStore'; // --- ADDED ---
// import { useTranslation } from 'react-i18next';
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const TimeofBirthScreen_4 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
//   const { t } = useTranslation();

//   const [time, setTime] = useState(new Date(2000, 0, 1, 8, 0));


//   const { updateUserDetails, isUpdating } = useRegisterStore();

//   const handleTimeChange = (newTime: Date) => {

//     Vibration.vibrate([0, 35, 40, 35]);

//     setTime(newTime);
//   };


//   const handleNext = async () => {

//     Vibration.vibrate([0, 35, 40, 35]);
    
//     const formattedTime = time.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });

//     const success = await updateUserDetails({ time_of_birth: formattedTime });
    
//     if (success) {
//       navigation.navigate('PlaceofBirth');
//     }
//   };

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bglinearImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />

//         {/* Header with back arrow + progress bar */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '70%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//             {t('tob_header')}
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//             {t('tob_subheader')}
//         </Text>

//         {/* Time Picker inside bgBox */}
//         <View style={styles.dobContainer}>
//           <View
//             style={[
//               styles.dobBox,
//               { backgroundColor: colors.bgBox, borderColor: colors.white },
//             ]}
//           >
//             <DatePicker
//               date={time}
//               mode="time"
//               onDateChange={handleTimeChange}
    
//               theme="dark"
//               style={styles.datePicker}
//             />
//           </View>
//         </View>

//         {/* --- UPDATED: Next Button with loading state and API call --- */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             activeOpacity={0.8}
//             onPress={handleNext}
//             style={{ width: '100%' }}
//             disabled={isUpdating}
//           >
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[
//                 styles.nextBtn,
//                 { borderWidth: 1, borderColor: colors.primary },
//               ]}
//             >
//               {isUpdating ? (
//                 <ActivityIndicator color={colors.primary} />
//               ) : (
//                 <Text style={styles.nextText}>{t('next_button')}</Text>
//               )}
//             </GradientBox>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default TimeofBirthScreen_4;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   progressBarBackground: {
//     flex: 1,
//     height: 7,
//     backgroundColor: '#4A3F50',
//     borderRadius: 5,
//     marginLeft: 12,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     borderRadius: 5,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 32,
//     lineHeight: 36,
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     marginBottom: 35,
//   },
//   dobContainer: {

//     justifyContent: 'center',
//   },
//   dobBox: {
//     borderWidth: 1,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   datePicker: {
//     width: Dimensions.get('window').width - 80,
//     height: 200,
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   nextBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });


























// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { Fonts } from '../../../constants/fonts';
// import DatePicker from 'react-native-date-picker';
// import GradientBox from '../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const TimeofBirthScreen_4 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   // default time (08:00 AM)
//   const [time, setTime] = useState(new Date(2000, 0, 1, 8, 0));

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bglinearImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />

//         {/* Header with back arrow + progress bar */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Progress Bar */}
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '70%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//           Time of Birth
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//           Please enter your time of birth
//         </Text>

//         {/* Time Picker inside bgBox */}
//         <View
//           style={[
//             styles.dobBox,
//             { backgroundColor: colors.bgBox, borderColor: colors.white },
//           ]}
//         >
//           <DatePicker
//             date={time}
//             mode="time"  // ✅ time picker mode
//             onDateChange={setTime}
//             locale="en"
//             style={{
//               alignSelf: 'center',
//               width: 350,
//             }}
//           />

//           {/* Show selected time below */}
//           <Text style={{ color: colors.white, marginTop: 10 }}>
//             Selected: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           </Text>
//         </View>
//       </SafeAreaView>

//       {/*  Next Button fixed at bottom */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={() => navigation.navigate('PlaceofBirth')}
//           style={{ width: '100%' }}
//         >
//           <GradientBox
//             colors={[colors.black, colors.bgBox]}
//             style={[
//               styles.nextBtn,
//               { borderWidth: 1.5, borderColor: colors.primary },
//             ]}
//           >
//             <Text style={styles.nextText}>Next</Text>
//           </GradientBox>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// };

// export default TimeofBirthScreen_4;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   progressBarBackground: {
//     flex: 1,
//     height: 7,
//     backgroundColor: '#4A3F50',
//     borderRadius: 5,
//     marginLeft: 12,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     borderRadius: 5,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 32,
//     lineHeight: 36,
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     marginBottom: 35,
//   },
//   dobBox: {
   
//     borderWidth: 1,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//     marginBottom: 20,
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   nextBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });
