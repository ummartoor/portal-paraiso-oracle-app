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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const EditProfileScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString() : 'Select your date of birth';

  const onSave = () => {
    // TODO: call update profile API
    // updateProfile({ name, dob: dob?.toISOString() })
  };

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
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
             Profile
            </Text>
          </View>
        </View>

        {/* Form area (avoids keyboard) */}
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
            {/* Name */}
            <Text style={[styles.label, { color: colors.white }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgBox,
                  color: colors.white,
                  borderColor: 'transparent',
                },
              ]}
            />

            {/* Date of Birth */}
            <Text style={[styles.label, { color: colors.white }]}>Date of Birth</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickerOpen(true)}
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgBox,
                  borderColor: 'transparent',
                  justifyContent: 'center',
                },
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

            {/* Date Picker (react-native-date-picker) */}
            <DatePicker
              modal
              open={pickerOpen}
              date={dob ?? new Date(2000, 0, 1)}
              mode="date"
              maximumDate={new Date()}
              onConfirm={(date) => {
                setPickerOpen(false);
                setDob(date);
              }}
              onCancel={() => setPickerOpen(false)}
              // Optional: make it feel on-brand
              theme="dark" // remove if you prefer system default
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer pinned to bottom (outside KAV) */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} style={{ width: '100%' }} onPress={onSave}>
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
            >
              <Text style={styles.actionText}>Save</Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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

  scrollInner: {
    paddingBottom: 20,
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

  footer: {
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 8, android: 28 }),
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
