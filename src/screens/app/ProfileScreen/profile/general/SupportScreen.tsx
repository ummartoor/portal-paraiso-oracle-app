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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';
import GradientBox from '../../../../../components/GradientBox';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const SupportScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();

  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSend = () => {
    // TODO: call support API
    // sendSupport({ subject, email, message })
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
              Support
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
            {/* Subject */}
            <Text style={[styles.label, { color: colors.white }]}>Question for Support</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Type your question"
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

            {/* Email */}
            <Text style={[styles.label, { color: colors.white }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

            {/* Message */}
            <Text style={[styles.label, { color: colors.white }]}>Text</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message…"
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              textAlignVertical="top"
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.bgBox,
                  color: colors.white,
                  borderColor: 'transparent',
                },
              ]}
            />

                {/* Footer pinned to bottom (outside KAV) */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} style={{ width: '100%' }} onPress={onSend}>
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={[styles.actionBtn, { borderWidth: 1.5, borderColor: colors.primary }]}
            >
              <Text style={styles.actionText}>Send</Text>
            </GradientBox>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>

    
      </SafeAreaView>
    </ImageBackground>
  );
};

export default SupportScreen;

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
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },

  textArea: {
    minHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderWidth: 1,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
  },

  footer: {
    paddingTop: 40,
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
