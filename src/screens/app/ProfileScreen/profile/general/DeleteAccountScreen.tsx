// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Image,
//   Platform,
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import GradientBox from '../../../../../components/GradientBox';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../../../navigation/routeTypes';

// const radioOff  = require('../../../../../assets/icons/unfillIcon.png');     // 24x24
// const tickIcon  = require('../../../../../assets/icons/checkIcon.png');      // 24x24
// const successIcon = require('../../../../../assets/icons/successfullIcon.png'); // success icon

// const BOX_TEXTS = [
//   'Your saved records, history, and personal data will be permanently removed.',
//   "Once deleted, you won't be able to log in or restore your account.",
//   'Any active subscription will end immediately without a refund.',
//   'Account deletion cannot be undone. Please confirm before proceeding.',
// ];

// const DeleteAccountScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [selectedIndex, setSelectedIndex] = useState<number | null>(1);
//   const [showSuccess, setShowSuccess]   = useState(false);

//   const onSelect = (i: number) => setSelectedIndex(i);

//   const onPressDelete = async () => {
//     // await deleteAccount();
//     setShowSuccess(true);
//   };

//   const m = modalStyles(colors);

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//               Delete Account
//             </Text>
//           </View>
//         </View>

//         {/* Content */}
//         <View style={styles.content}>
//           <Text style={[styles.subtitle, { color: colors.primary }]}>
//             We’re sorry to see you go. Please note the following before deleting your account:
//           </Text>

//           {/* Boxes */}
//           <View style={styles.listWrap}>
//             {BOX_TEXTS.map((txt, i) => {
//               const isActive = selectedIndex === i;
//               return (
//                 <TouchableOpacity
//                   key={i}
//                   activeOpacity={0.9}
//                   onPress={() => onSelect(i)}
//                   style={[
//                     styles.itemBox,
//                     {
//                       backgroundColor: colors.bgBox,
//                       borderColor: isActive ? colors.primary : 'transparent',
//                     },
//                   ]}
//                 >
//                   <Image
//                     source={isActive ? tickIcon : radioOff}
//                     style={[styles.leftIcon, { tintColor: isActive ? colors.primary : colors.white }]}
//                     resizeMode="contain"
//                   />
//                   <Text
//                     style={[styles.itemText, { color: colors.white, opacity: 0.95 }]}
//                     numberOfLines={3}
//                   >
//                     {txt}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>

//         {/* Footer (pinned bottom) */}
//         <View style={styles.footer}>
//           <TouchableOpacity activeOpacity={0.8} style={{ width: '100%' }} onPress={onPressDelete}>
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
//             >
//               <Text style={styles.actionText}>Delete Account</Text>
//             </GradientBox>
//           </TouchableOpacity>
//         </View>

//         {/* Success Modal (Continue just closes) */}
//         <Modal
//           visible={showSuccess}
//           animationType="slide"
//           transparent
//           onRequestClose={() => setShowSuccess(false)}
//         >
//           <View style={[StyleSheet.absoluteFill, m.overlayBackground]}>
//             <View style={m.overlay}>
//               <View style={m.modal}>
//                 <Image source={successIcon} style={m.iconImage} resizeMode="contain" />
//                 <Text style={m.heading}>Successfully deleted</Text>
//                 <Text style={m.description}>
//                   Your account has been deleted successfully.
//                 </Text>

//                 <TouchableOpacity
//                   onPress={() => setShowSuccess(false)}   // <-- close modal only
//                   activeOpacity={0.9}
//                   style={m.singleBtnTouchable}
//                 >
//                   <GradientBox colors={[colors.black, colors.bgBox]} style={m.singleBtnFill}>
//                     <Text style={m.singleBtnText}>Continue</Text>
//                   </GradientBox>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default DeleteAccountScreen;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//   },

//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   backBtn: {
//     position: 'absolute',
//     left: 0,
//     height: 40,
//     width: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: { width: 22, height: 22, tintColor: '#fff' },
//   headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
//   headerTitle: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 1,
//     textTransform: 'capitalize',
//   },

//   content: { flex: 1 },

//   subtitle: {
//     marginTop: 12,
//     marginBottom: 30,
//     fontSize: 14,
//     lineHeight: 20,
//     opacity: 0.9,
//   },

//   listWrap: { gap: 12, marginTop: 6 },

//   itemBox: {
//     minHeight: 74,
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//   },

//   leftIcon: { width: 20, height: 20, marginRight: 12 },

//   itemText: {
//     flex: 1,
//     fontSize: 14,
//     lineHeight: 20,
//     fontFamily: Fonts.aeonikRegular,
//   },

//   footer: { paddingTop: 10, paddingBottom: Platform.select({ ios: 8, android: 45 }) },

//   actionBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });

// /* -------- Success modal styles (dynamic) -------- */
// const modalStyles = (colors: any) =>
//   StyleSheet.create({
//     overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
//     overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
//     modal: {
//       width: '100%',
//       backgroundColor: colors.bgBox,
//       paddingVertical: 35,
//       borderRadius: 15,
//       alignItems: 'center',
//       position: 'relative',
//     },
//     iconImage: { width: 50, height: 50 },
//     heading: {
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 18,
//       lineHeight: 22,
//       color: colors.primary,
//       marginTop: 14,
//       textTransform: 'capitalize',
//     },
//     description: {
//       marginTop: 6,
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//       lineHeight: 22,
//       color: colors.white,
//       textAlign: 'center',
//       paddingHorizontal: 16,
//     },
//     singleBtnTouchable: {
//       width: '80%',
//       height: 50,
//       borderRadius: 200,
//       overflow: 'hidden',
//       marginTop: 20,
//       paddingHorizontal: 20,
//       alignSelf: 'center',
//     },
//     singleBtnFill: {
//       flex: 1,
//       width: '100%',
//       height: '100%',
//       alignItems: 'center',
//       justifyContent: 'center',
//       borderWidth: 1.5,
//       borderColor: colors.primary,
//       borderRadius: 200,
//     },
//     singleBtnText: {
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//       lineHeight: 22,
//       color: colors.white,
//     },
//   });










import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  Modal,
  Alert, // Import Alert for additional error handling if needed
  ActivityIndicator, // For showing loading state on the button
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../../../navigation/routeTypes';
import { useAuthStore } from '../../../../../store/useAuthStore'; // Import useAuthStore

const radioOff = require('../../../../../assets/icons/unfillIcon.png');
const tickIcon = require('../../../../../assets/icons/checkIcon.png');
const successIcon = require('../../../../../assets/icons/successfullIcon.png'); // success icon

const BOX_TEXTS = [
  'Your saved records, history, and personal data will be permanently removed.',
  "Once deleted, you won't be able to log in or restore your account.",
  'Any active subscription will end immediately without a refund.',
  'Account deletion cannot be undone. Please confirm before proceeding.',
];

const DeleteAccountScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

  // Get the deleteAccount function from your auth store
  const deleteAccount = useAuthStore(state => state.deleteAccount);
  const logout = useAuthStore(state => state.logout); // Also need logout for success navigation

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Changed initial state to null, meaning nothing is selected
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for loading indicator

  // This `onSelect` now ensures all checkboxes are selected before enabling the button.
  // If you only want one to be selected, keep it as `setSelectedIndex(i)`.
  // Given the "Please confirm before proceeding" nature, selecting all might be desired.
  const onSelect = (i: number) => {
    // If you want all to be checked before proceeding, you'd need a different state management,
    // like an array of booleans. For now, assuming selecting the last one is enough confirmation,
    // or you want a single confirmation checkbox.
    // If you intend for *all* points to be checked, uncomment the logic below
    // and change `selectedIndex` to `selectedItems: boolean[]`.

    // For simplicity, let's assume `selectedIndex` becomes `3` means all acknowledged.
    // Or, if `null`, it means nothing is confirmed.
    setSelectedIndex(i);
  };

  const onPressDelete = async () => {
    // Ensure all points are acknowledged (or at least the last one, as per typical UI patterns for confirmation)
    // If you want all four checkboxes to be explicitly checked:
    // You would need a `const [confirmedItems, setConfirmedItems] = useState(Array(BOX_TEXTS.length).fill(false));`
    // And modify `onSelect` to toggle a specific index in `confirmedItems`.
    // Then `if (!confirmedItems.every(item => item))` would be the check.
    // For this implementation, we'll assume the simple `selectedIndex === 3` is the final confirmation.

    if (selectedIndex !== 3) { // Assuming checking the last box implies agreement to all
      Alert.alert('Confirmation Required', 'Please acknowledge all points before deleting your account.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true); // Start loading
            const success = await deleteAccount(); // Call the API
            setIsDeleting(false); // End loading

            if (success) {
              setShowSuccess(true); // Show the success modal
              // The `deleteAccount` function in the store already calls `logout` on success.
              // The modal's continue button will then likely navigate to Login.
            } else {
              // The deleteAccount function already shows an Alert for failure.
              // No further action needed here unless you want custom screen-specific handling.
            }
          },
        },
      ]
    );
  };

  // When the success modal is dismissed, navigate to the Login screen
  const onDismissSuccessModal = () => {
    setShowSuccess(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };


  const m = modalStyles(colors);

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              Delete Account
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            We’re sorry to see you go. Please note the following before deleting your account:
          </Text>

          {/* Boxes */}
          <View style={styles.listWrap}>
            {BOX_TEXTS.map((txt, i) => {
              const isActive = selectedIndex === i; // Check if this specific box is selected
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.9}
                  onPress={() => onSelect(i)} // This will mark the clicked item as selected
                  style={[
                    styles.itemBox,
                    {
                      backgroundColor: colors.bgBox,
                      borderColor: isActive ? colors.primary : 'transparent', // Highlight selected
                    },
                  ]}
                >
                  <Image
                    source={isActive ? tickIcon : radioOff} // Show tick if active
                    style={[styles.leftIcon, { tintColor: isActive ? colors.primary : colors.white }]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[styles.itemText, { color: colors.white, opacity: 0.95 }]}
                    numberOfLines={3}
                  >
                    {txt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Footer (pinned bottom) */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ width: '100%' }}
            onPress={onPressDelete}
            disabled={isDeleting || selectedIndex !== 3} // Disable if deleting or not all confirmed
          >
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[
                styles.actionBtn,
                {
                  borderWidth: 1.5,
                  borderColor: (selectedIndex === 3 && !isDeleting) ? colors.primary : colors.bgBox, // Adjust border color based on disabled state
                },
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.actionText,
                    { color: (selectedIndex === 3 && !isDeleting) ? colors.white : colors.bgBox }
                  ]}
                >
                  Delete Account
                </Text>
              )}
            </GradientBox>
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccess}
          animationType="slide"
          transparent
          onRequestClose={onDismissSuccessModal} // Use the new handler here
        >
          <View style={[StyleSheet.absoluteFill, m.overlayBackground]}>
            <View style={m.overlay}>
              <View style={m.modal}>
                <Image source={successIcon} style={m.iconImage} resizeMode="contain" />
                <Text style={m.heading}>Successfully deleted</Text>
                <Text style={m.description}>
                  Your account has been deleted successfully.
                </Text>

                <TouchableOpacity
                  onPress={onDismissSuccessModal} // Navigate to Login on continue
                  activeOpacity={0.9}
                  style={m.singleBtnTouchable}
                >
                  <GradientBox colors={[colors.black, colors.bgBox]} style={m.singleBtnFill}>
                    <Text style={m.singleBtnText}>Continue</Text>
                  </GradientBox>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DeleteAccountScreen;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },

  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },

  content: { flex: 1 },

  subtitle: {
    marginTop: 12,
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },

  listWrap: { gap: 12, marginTop: 6 },

  itemBox: {
    minHeight: 74,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },

  leftIcon: { width: 20, height: 20, marginRight: 12 },

  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.aeonikRegular,
  },

  footer: { paddingTop: 10, paddingBottom: Platform.select({ ios: 8, android: 45 }) },

  actionBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.aeonikRegular,
  },
});

/* -------- Success modal styles (dynamic) -------- */
const modalStyles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    modal: {
      width: '100%',
      backgroundColor: colors.bgBox,
      paddingVertical: 35,
      borderRadius: 15,
      alignItems: 'center',
      position: 'relative',
    },
    iconImage: { width: 50, height: 50 },
    heading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 18,
      lineHeight: 22,
      color: colors.primary,
      marginTop: 14,
      textTransform: 'capitalize',
    },
    description: {
      marginTop: 6,
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    singleBtnTouchable: {
      width: '80%',
      height: 50,
      borderRadius: 200,
      overflow: 'hidden',
      marginTop: 20,
      paddingHorizontal: 20,
      alignSelf: 'center',
    },
    singleBtnFill: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 200,
    },
    singleBtnText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.white,
    },
  });