import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';
import ImagePickerModal from '../../../../../components/ImagePickerModel';
import UpdatePasswordModal from './UpdatePasswordModal';
import { useAuthStore } from '../../../../../store/useAuthStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const EditProfileScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();
 const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
const updatePassword = useAuthStore(state => state.updatePassword);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
const [gender, setGender] = useState<string | null>(null);
const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [dob, setDob] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString() : 'Select your date of birth';

  const onSave = () => {
    // TODO: call update profile API
  };

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.headerTitle, { color: colors.white }]}
                >
                  Profile
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
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => setModalVisible(true)}
              >
                <Image
                  source={require('../../../../../assets/icons/cameraIcon.png')}
                  style={{ width: 22, height: 22, tintColor: '#fff' }}
                />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={[styles.label, { color: colors.white }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[
                styles.input,
                { backgroundColor: colors.bgBox, color: colors.white, borderColor: 'transparent' },
              ]}
            />

            {/* Email */}
            <Text style={[styles.label, { color: colors.white }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[
                styles.input,
                { backgroundColor: colors.bgBox, color: colors.white, borderColor: 'transparent' },
              ]}
            />

            {/* Update Password btn (below Email, right aligned) */}
            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity activeOpacity={0.85}       onPress={() => setPasswordModalVisible(true)}>
                <Text style={{ color: colors.primary, fontFamily: Fonts.aeonikRegular, fontSize: 14 }}>
                  Update Password
                </Text>
              </TouchableOpacity>
            </View>



            {/* Gender */}
<Text style={[styles.label, { color: colors.white }]}>Gender</Text>
<TouchableOpacity
  activeOpacity={0.8}
  onPress={() => setGenderModalVisible(true)}
  style={[
    styles.input,
    { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
  ]}
>
  <Text
    style={{
      color: gender ? colors.white : 'rgba(255,255,255,0.6)',
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
    }}
  >
    {gender || 'Select Gender'}
  </Text>
</TouchableOpacity>


            {/* Date of Birth */}
            <Text style={[styles.label, { color: colors.white }]}>Date of Birth</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickerOpen(true)}
              style={[
                styles.input,
                { backgroundColor: colors.bgBox, borderColor: 'transparent', justifyContent: 'center' },
              ]}
            >
              <Text
                style={{
                  color: dob ? colors.white : 'rgba(255,255,255,0.6)',
                  fontFamily: Fonts.aeonikRegular,
                  fontSize: 14,
                }}
              >
                {formatDate(dob)}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={pickerOpen}
              date={dob ?? new Date(2000, 0, 1)}
              mode="date"
              maximumDate={new Date()}
              onConfirm={date => {
                setPickerOpen(false);
                setDob(date);
              }}
              onCancel={() => setPickerOpen(false)}
              theme="dark"
            />

         

            {/* Save Button */}
            <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 30 }} onPress={onSave}>
              <GradientBox
                colors={[colors.black, colors.bgBox]}
                style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
              >
                <Text style={styles.actionText}>Save</Text>
              </GradientBox>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onImagePicked={path => setProfileImage(path)}
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



    </ImageBackground>
     

     
  );
};

export default EditProfileScreen;

/* ----------------- STYLES ----------------- */
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
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
    marginBottom: 20,
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

  profileImageWrap: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
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

  scrollInner: {
    paddingBottom: 40,
  },

  label: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },

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
