// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ImageBackground,
//   Platform,
//   TextInput,
//   KeyboardAvoidingView,
//   ScrollView,
//   Image,
//   Dimensions,
// } from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
// import { Fonts } from '../../../../../constants/fonts';
// import { useThemeStore } from '../../../../../store/useThemeStore';
// import GradientBox from '../../../../../components/GradientBox';
// import ImagePickerModal from '../../../../../components/ImagePickerModel';
// import UpdatePasswordModal from './UpdatePasswordModal';
// import GenderModal from './GenderModal';
// import DateOfBirthModal from './DateOfBirthModal';

// import { useAuthStore } from '../../../../../store/useAuthStore';
// import GoalsModal from './GoalsModal';
// import TimeOfBirthModal from './TimeOfBirthModal';
// import PlaceOfBirthModal from './PlaceOfBirthModal';
// import RelationshipStatusModal from './RelationshipStatusModal';

// import ZodiacSymbolModal from './ZodiaSymbolModal';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const EditProfileScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<any>();
//  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
// const updatePassword = useAuthStore(state => state.updatePassword);

//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
// const [gender, setGender] = useState<string | null>(null);
// const [isGenderModalVisible, setGenderModalVisible] = useState(false);
// const [goals, setGoals] = useState<string[]>([]);
// const [isGoalsModalVisible, setGoalsModalVisible] = useState(false);

//   const [dob, setDob] = useState<Date | null>(null);
// const [isDobModalVisible, setDobModalVisible] = useState(false);

// const [timeOfBirth, setTimeOfBirth] = useState('');
// const [isTimeModalVisible, setTimeModalVisible] = useState(false);

// const [placeOfBirth, setPlaceOfBirth] = useState('');
// const [isPlaceModalVisible, setPlaceModalVisible] = useState(false);

// const [relationshipStatus, setRelationshipStatus] = useState('');
// const [isRelationshipModalVisible, setRelationshipModalVisible] = useState(false);

// const [zodiac, setZodiac] = useState<string | null>(null);
// const [isZodiacModalVisible, setZodiacModalVisible] = useState(false);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);

//   const formatDate = (d: Date | null) =>
//     d ? d.toLocaleDateString() : 'Select your date of birth';

//   const onSave = () => {
//     // TODO: call update profile API
//   };

//   return (
//     <ImageBackground
//       source={require('../../../../../assets/images/backgroundImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollInner}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                 <Image
//                   source={require('../../../../../assets/icons/backIcon.png')}
//                   style={styles.backIcon}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>

//               <View style={styles.headerTitleWrap} pointerEvents="none">
//                 <Text
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                   style={[styles.headerTitle, { color: colors.white }]}
//                 >
//                   Profile
//                 </Text>
//               </View>
//             </View>

//             {/* Profile Image with Camera Icon */}
//             <View style={styles.profileImageWrap}>
//               <Image
//                 source={
//                   profileImage
//                     ? { uri: profileImage }
//                     : require('../../../../../assets/icons/userprofile.png')
//                 }
//                 style={styles.profileImage}
//               />
//               <TouchableOpacity
//                 style={styles.cameraBtn}
//                 onPress={() => setModalVisible(true)}
//               >
//                 <Image
//                   source={require('../../../../../assets/icons/cameraIcon.png')}
//                   style={{ width: 22, height: 22, tintColor: '#fff' }}
//                 />
//               </TouchableOpacity>
//             </View>

//             {/* Name */}
//             <Text style={[styles.label, { color: colors.white }]}>Name</Text>
//             <TextInput
//               value={name}
//               onChangeText={setName}
//               placeholder="Enter your name"
//               placeholderTextColor="rgba(255,255,255,0.6)"
//               style={[
//                 styles.input,
//                 { backgroundColor: colors.bgBox, color: colors.white, borderColor: 'transparent' },
//               ]}
//             />

//             {/* Email */}
//             <Text style={[styles.label, { color: colors.white }]}>Email</Text>
//             <TextInput
//               value={email}
//               onChangeText={setEmail}
//               placeholder="Enter your email"
//               keyboardType="email-address"
//               placeholderTextColor="rgba(255,255,255,0.6)"
//               style={[
//                 styles.input,
//                 { backgroundColor: colors.bgBox, color: colors.white, borderColor: 'transparent' },
//               ]}
//             />

//             {/* Update Password btn (below Email, right aligned) */}
//             <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
//               <TouchableOpacity activeOpacity={0.85}       onPress={() => setPasswordModalVisible(true)}>
//                 <Text style={{ color: colors.primary, fontFamily: Fonts.aeonikRegular, fontSize: 14 }}>
//                   Update Password
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Gender */}
// <Text style={[styles.label, { color: colors.white }]}>Gender</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setGenderModalVisible(true)}   // ✅ opens modal
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: gender ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {gender || 'Select Gender'}
//   </Text>
// </TouchableOpacity>

// {/* Goals */}
// <Text style={[styles.label, { color: colors.white }]}>Goals</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setGoalsModalVisible(true)}
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: goals.length > 0 ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {goals.length > 0 ? goals.join(', ') : 'Select Goals'}
//   </Text>
// </TouchableOpacity>

//             {/* Date of Birth */}
//             <Text style={[styles.label, { color: colors.white }]}>Date of Birth</Text>
//            <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setDobModalVisible(true)}   // open modal
//   style={[styles.input, { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' }]}
// >
//   <Text style={{ color: dob ? colors.white : 'rgba(255,255,255,0.6)', fontFamily: Fonts.aeonikRegular, fontSize: 14 }}>
//     {formatDate(dob)}
//   </Text>
// </TouchableOpacity>

// <Text style={[styles.label, { color: colors.white }]}>Time of Birth</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setTimeModalVisible(true)}
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: timeOfBirth ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {timeOfBirth ? timeOfBirth : 'Select Time of Birth'}
//   </Text>
// </TouchableOpacity>

//      <Text style={[styles.label, { color: colors.white }]}>Place of Birth</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setPlaceModalVisible(true)}
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: placeOfBirth ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {placeOfBirth ? placeOfBirth : 'Enter Place of Birth'}
//   </Text>
// </TouchableOpacity>

// <Text style={[styles.label, { color: colors.white }]}>Relationship Status</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setRelationshipModalVisible(true)}
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: relationshipStatus ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {relationshipStatus ? relationshipStatus : 'Select Relationship Status'}
//   </Text>
// </TouchableOpacity>

//         <Text style={[styles.label, { color: colors.white }]}>Zodiac Symbol</Text>
// <TouchableOpacity
//   activeOpacity={0.8}
//   onPress={() => setZodiacModalVisible(true)}
//   style={[
//     styles.input,
//     { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
//   ]}
// >
//   <Text
//     style={{
//       color: zodiac ? colors.white : 'rgba(255,255,255,0.6)',
//       fontFamily: Fonts.aeonikRegular,
//       fontSize: 14,
//     }}
//   >
//     {zodiac ? zodiac.charAt(0).toUpperCase() + zodiac.slice(1) : 'Select Zodiac'}
//   </Text>
// </TouchableOpacity>

//             {/* Save Button */}
//             <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 30 }} onPress={onSave}>
//               <GradientBox
//                 colors={[colors.black, colors.bgBox]}
//                 style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
//               >
//                 <Text style={styles.actionText}>Save</Text>
//               </GradientBox>
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>

//       {/* Image Picker Modal */}
//       <ImagePickerModal
//         isVisible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onImagePicked={path => setProfileImage(path)}
//       />

//        <UpdatePasswordModal
//   isVisible={isPasswordModalVisible}
//   onClose={() => setPasswordModalVisible(false)}
//   onConfirm={async (oldPass, newPass, confirmPass) => {
//     const success = await updatePassword(oldPass, newPass, confirmPass);
//     if (success) {
//       setPasswordModalVisible(false);
//     }
//   }}
// />
// <GenderModal
//   isVisible={isGenderModalVisible}
//   onClose={() => setGenderModalVisible(false)}
//   onConfirm={async (selectedGender) => {
//     setGender(selectedGender);
//     setGenderModalVisible(false);
//   }}
// />

// <GoalsModal
//   isVisible={isGoalsModalVisible}
//   onClose={() => setGoalsModalVisible(false)}
//   onConfirm={(selectedGoals) => {
//     setGoals(selectedGoals);
//     setGoalsModalVisible(false);
//   }}
// />

// <DateOfBirthModal
//   isVisible={isDobModalVisible}
//   onClose={() => setDobModalVisible(false)}
//   onConfirm={(selectedDob) => {
//     setDob(new Date(selectedDob));
//     setDobModalVisible(false);
//   }}
// />

// <TimeOfBirthModal
//   isVisible={isTimeModalVisible}
//   onClose={() => setTimeModalVisible(false)}
//   onConfirm={(time) => {
//     setTimeOfBirth(time);
//     setTimeModalVisible(false);
//   }}
// />

// <PlaceOfBirthModal
//   isVisible={isPlaceModalVisible}
//   onClose={() => setPlaceModalVisible(false)}
//   onConfirm={(place) => {
//     setPlaceOfBirth(place);
//     setPlaceModalVisible(false);
//   }}
// />

// <RelationshipStatusModal
//   isVisible={isRelationshipModalVisible}
//   onClose={() => setRelationshipModalVisible(false)}
//   onConfirm={(status) => {
//     setRelationshipStatus(status);
//     setRelationshipModalVisible(false);
//   }}
// />

// <ZodiacSymbolModal
//   isVisible={isZodiacModalVisible}
//   onClose={() => setZodiacModalVisible(false)}
//   onConfirm={(selectedZodiac: string) => {
//     setZodiac(selectedZodiac);
//     setZodiacModalVisible(false);
//   }}
//   defaultValue={zodiac}
// />

//     </ImageBackground>

//   );
// };

// export default EditProfileScreen;

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
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
//     marginBottom: 20,
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

//   profileImageWrap: {
//     alignSelf: 'center',
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 3,
//     borderColor: '#fff',
//   },
//   cameraBtn: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#000',
//     borderRadius: 20,
//     padding: 6,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },

//   scrollInner: {
//     paddingBottom: 40,
//   },

//   label: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     opacity: 0.9,
//     marginBottom: 8,
//     marginTop: 16,
//   },

//   input: {
//     height: 55,
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     borderWidth: 1,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//   },

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

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';
import ImagePickerModal from '../../../../../components/ImagePickerModel';
import UpdatePasswordModal from './UpdatePasswordModal';
import GenderModal from './GenderModal';
import DateOfBirthModal from './DateOfBirthModal';
import { useAuthStore } from '../../../../../store/useAuthStore';
import GoalsModal from './GoalsModal';
import TimeOfBirthModal from './TimeOfBirthModal';
import PlaceOfBirthModal from './PlaceOfBirthModal';
import RelationshipStatusModal from './RelationshipStatusModal';
import ZodiacSymbolModal from './ZodiaSymbolModal';
import { AppStackParamList } from '../../../../../navigation/routeTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const EditProfileScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // --- Get everything needed from the Auth Store ---
  const {
    user,
    fetchCurrentUser,
    updatePassword,
    uploadProfilePicture,
    updateUserProfile,
    isUpdating, // This will be our loading state for the Save button
  } = useAuthStore();

  // --- Local state for all form fields ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [dob, setDob] = useState<Date | null>(null);
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [zodiac, setZodiac] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Local loading state for image upload

  // --- Modal visibility states ---
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isGoalsModalVisible, setGoalsModalVisible] = useState(false);
  const [isDobModalVisible, setDobModalVisible] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isPlaceModalVisible, setPlaceModalVisible] = useState(false);
  const [isRelationshipModalVisible, setRelationshipModalVisible] =
    useState(false);
  const [isZodiacModalVisible, setZodiacModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Fetch fresh user data every time the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, []),
  );

  // --- Populate local state once user data is fetched from the store ---
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGender(user.gender || null);
      setGoals(Array.isArray(user.goals) ? user.goals : []);
      setDob(user.dob ? new Date(user.dob) : null);
      setTimeOfBirth(user.time_of_birth || '');
      setPlaceOfBirth(user.place_of_birth || '');
      setRelationshipStatus(user.relationship_status || '');
      setZodiac(user.sign_in_zodiac || null);
      setProfileImage(user.profile_image?.url || null);
    }
  }, [user]);

  // --- Handle profile picture upload ---
  const handleImagePicked = async (image: {
    uri: string;
    type: string;
    name: string;
  }) => {
    setIsUploading(true);
    await uploadProfilePicture(image);
    setIsUploading(false);
  };

  // --- Handle Save button press to update profile ---
  const onSave = async () => {
    const payload = {
      name,
      email,
      gender: gender || undefined,
      goals: goals.length > 0 ? goals : undefined,
      dob: dob ? dob.toISOString() : undefined,
      time_of_birth: timeOfBirth || undefined,
      place_of_birth: placeOfBirth || undefined,
      relationship_status: relationshipStatus || undefined,
      sign_in_zodiac: zodiac || undefined,
    };

    const success = await updateUserProfile(payload);
    if (success) {
      navigation.goBack(); // Navigate back on successful update
    }
  };

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-GB') : 'Select your date of birth';

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
              >
                <Image
                  source={require('../../../../../assets/icons/backIcon.png')}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.headerTitleWrap}>
                <Text style={[styles.headerTitle, { color: colors.white }]}>
                  Edit Profile
                </Text>
              </View>
            </View>

            {/* Profile Image with Camera Icon */}
            <View style={styles.profileImageWrap}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('../../../../../assets/icons/userprofile.png')
                }
                style={styles.profileImage}
              />
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => setModalVisible(true)}
                disabled={isUploading}
              >
                <Image
                  source={require('../../../../../assets/icons/cameraIcon.png')}
                  style={{ width: 22, height: 22, tintColor: '#fff' }}
                />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <Text style={[styles.label, { color: colors.white }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={styles.input}
              placeholderTextColor="rgba(255,255,255,0.6)"
            />

            <Text style={[styles.label, { color: colors.white }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              style={styles.input}
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="email-address"
            />

            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPasswordModalVisible(true)}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: Fonts.aeonikRegular,
                    fontSize: 14,
                  }}
                >
                  Update Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* All Modal Triggers */}
            <Text style={[styles.label, { color: colors.white }]}>Gender</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setGenderModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: gender ? colors.white : 'rgba(255,255,255,0.6)' },
                ]}
              >
                {gender || 'Select Gender'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>Goals</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setGoalsModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color:
                      goals.length > 0 ? colors.white : 'rgba(255,255,255,0.6)',
                  },
                ]}
              >
                {goals.length > 0 ? goals.join(', ') : 'Select Goals'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>
              Date of Birth
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDobModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: dob ? colors.white : 'rgba(255,255,255,0.6)' },
                ]}
              >
                {formatDate(dob)}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>
              Time of Birth
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTimeModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: timeOfBirth ? colors.white : 'rgba(255,255,255,0.6)',
                  },
                ]}
              >
                {timeOfBirth || 'Select Time of Birth'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>
              Place of Birth
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPlaceModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: placeOfBirth
                      ? colors.white
                      : 'rgba(255,255,255,0.6)',
                  },
                ]}
              >
                {placeOfBirth || 'Enter Place of Birth'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>
              Relationship Status
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRelationshipModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  {
                    color: relationshipStatus
                      ? colors.white
                      : 'rgba(255,255,255,0.6)',
                  },
                ]}
              >
                {relationshipStatus || 'Select Relationship Status'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.white }]}>
              Zodiac Symbol
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setZodiacModalVisible(true)}
              style={styles.input}
            >
              <Text
                style={[
                  styles.inputText,
                  { color: zodiac ? colors.white : 'rgba(255,255,255,0.6)' },
                ]}
              >
                {zodiac
                  ? zodiac.charAt(0).toUpperCase() + zodiac.slice(1)
                  : 'Select Zodiac'}
              </Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={{ marginTop: 30 }}
              onPress={onSave}
              disabled={isUpdating}
            >
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[
                  styles.actionBtn,
                  { borderWidth: 1.5, borderColor: colors.primary },
                ]}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.actionText}>Update</Text>
                )}
              </GradientBox>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* All Modals */}
      <ImagePickerModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onImagePicked={handleImagePicked}
      />
      <UpdatePasswordModal
        isVisible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onConfirm={async (oldPass, newPass, confirmPass) => {
          const success = await updatePassword(oldPass, newPass, confirmPass);
          if (success) {
            setPasswordModalVisible(false);
          }
        }}
      />
      <GenderModal
        isVisible={isGenderModalVisible}
        onClose={() => setGenderModalVisible(false)}
        onConfirm={selectedGender => {
          setGender(selectedGender);
          setGenderModalVisible(false);
        }}
         defaultValue={gender}
      />
      <GoalsModal
        isVisible={isGoalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
        onConfirm={selectedGoals => {
          setGoals(selectedGoals);
          setGoalsModalVisible(false);
        }}
         defaultValue={goals}
      />
      <DateOfBirthModal
        isVisible={isDobModalVisible}
        onClose={() => setDobModalVisible(false)}
        onConfirm={selectedDob => {
          setDob(new Date(selectedDob));
          setDobModalVisible(false);
        }}
        defaultValue={dob}
      />
      <TimeOfBirthModal
        isVisible={isTimeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        onConfirm={time => {
          setTimeOfBirth(time);
          setTimeModalVisible(false);
        }}
       defaultValue={timeOfBirth}
      />
      <PlaceOfBirthModal
        isVisible={isPlaceModalVisible}
        onClose={() => setPlaceModalVisible(false)}
        onConfirm={place => {
          setPlaceOfBirth(place);
          setPlaceModalVisible(false);
        }}
         defaultValue={placeOfBirth}
      />
      <RelationshipStatusModal
        isVisible={isRelationshipModalVisible}
        onClose={() => setRelationshipModalVisible(false)}
        onConfirm={status => {
          setRelationshipStatus(status);
          setRelationshipModalVisible(false);
        }}
          defaultValue={relationshipStatus}
      />
      <ZodiacSymbolModal
        isVisible={isZodiacModalVisible}
        onClose={() => setZodiacModalVisible(false)}
        onConfirm={(selectedZodiac: string) => {
          setZodiac(selectedZodiac);
          setZodiacModalVisible(false);
        }}
        defaultValue={zodiac}
      />
    </ImageBackground>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1, paddingTop: Platform.select({ ios: 0, android: 10 }) },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
    color: '#fff',
  },
  profileImageWrap: { alignSelf: 'center', marginBottom: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  scrollInner: { paddingBottom: 40, paddingHorizontal: 20 },
  label: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
    marginTop: 16,
    color: '#fff',
  },
  input: {
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 16,
borderColor:'#fff',
borderWidth:0.9,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    backgroundColor: 'rgba(74, 63, 80, 0.5)',
    color: '#fff',
    justifyContent: 'center',
  },
  inputText: { fontFamily: Fonts.aeonikRegular, fontSize: 14 },
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
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});
