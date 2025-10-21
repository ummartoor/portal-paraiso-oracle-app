import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { Fonts } from '../../../constants/fonts';
import LogOutModal from '../../../components/LogOutModal';
import { useGetNotificationsStore } from '../../../store/useGetNotificationsStore';
import NotificationToggleModal from './NotificationToggleModal';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/routeTypes';
import { useTranslation } from 'react-i18next';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const H_PADDING = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;
type Zodiac = { key: string; name: string; icon: any };

// Helper function to format the date string
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeStore(state => state.theme);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, fetchCurrentUser, logout } = useAuthStore();
  const notificationSettings = useGetNotificationsStore(state => state.notificationSettings);
  

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, [fetchCurrentUser]),
  );
  const ZODIACS: Zodiac[] = [
    {
      key: 'aries',
      name: t('zodiac_aries'),
      icon: require('../../../assets/icons/AriesIcon.png'),
    },
    {
      key: 'taurus',
      name: t('zodiac_taurus'),
      icon: require('../../../assets/icons/TaurusIcon.png'),
    },
    {
      key: 'gemini',
      name: t('zodiac_gemini'),
      icon: require('../../../assets/icons/GeminiIcon.png'),
    },
    {
      key: 'cancer',
      name: t('zodiac_cancer'),
      icon: require('../../../assets/icons/CancerIcon.png'),
    },
    {
      key: 'leo',
      name: t('zodiac_leo'),
      icon: require('../../../assets/icons/leoIcon.png'),
    },
    {
      key: 'virgo',
      name: t('zodiac_virgo'),
      icon: require('../../../assets/icons/VirgoIcon.png'),
    },
    {
      key: 'libra',
      name: t('zodiac_libra'),
      icon: require('../../../assets/icons/libraIcon.png'),
    },
    {
      key: 'scorpio',
      name: t('zodiac_scorpio'),
      icon: require('../../../assets/icons/ScorpioIcon.png'),
    },
    {
      key: 'sagittarius',
      name: t('zodiac_sagittarius'),
      icon: require('../../../assets/icons/SagittariusIcon.png'),
    },
    {
      key: 'capricorn',
      name: t('zodiac_capricorn'),
      icon: require('../../../assets/icons/CapricornIcon.png'),
    },
    {
      key: 'aquarius',
      name: t('zodiac_aquarius'),
      icon: require('../../../assets/icons/AquariusIcon.png'),
    },
    {
      key: 'pisces',
      name: t('zodiac_pisces'),
      icon: require('../../../assets/icons/PiscesIcon.png'),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, []),
  );
  // --- CHANGE: Logic to determine if any notification is enabled ---
  const isAnyNotificationEnabled = useMemo(() => {
    if (!notificationSettings) return false;
    return (
      notificationSettings.email ||
      notificationSettings.push ||
      notificationSettings.daily_wisdom_cards ||
      notificationSettings.ritual_tips
    );
  }, [notificationSettings]);

  
  const userZodiac = useMemo(() => {
    if (!user?.sign_in_zodiac) return null;
    return ZODIACS.find(z => z.key === user.sign_in_zodiac);
  }, [user, ZODIACS]);
  console.log('Checking User Profile Image URL:', user?.profile_image);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: 'black' }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: insets.bottom + 10,
            paddingHorizontal: H_PADDING,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          {/* Header */}
        <View style={styles.header}>
                   <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={styles.backBtn}
                    >
                      <Image
                        source={require('../../../assets/icons/backIcon.png')}
                        style={styles.backIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <View style={styles.headerTitleWrap}>
                      <Text style={[styles.headerTitle, { color: colors.white }]}>
                        Profile
                      </Text>
                    </View>
                  </View>   


          {/* profile name  */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.topRow, { backgroundColor: colors.bgBox }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.leftProfile}>
              <View style={styles.avatarWrap}>
                <Image
                  style={styles.avatar}
                  source={
                    // Check karein ke profile_image object ke andar URL mojood hai
                    user?.profile_image?.url
                      ? { uri: user.profile_image.url } // Yahan .url ka istemal karein
                      : require('../../../assets/icons/userprofile.png')
                  }
                />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.name, { color: colors.white }]}>
                  {user?.name || t('profile_user_name_fallback')}
                </Text>
              </View>
            </View>

            <Text style={[styles.dob, { color: colors.white }]}>
              {user?.dob ? formatDate(user.dob) : '...'}
            </Text>
          </TouchableOpacity>

          {/* Two Boxes Row */}
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            {/* --- MODIFIED: Dynamic Zodiac Sign Box --- */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.bgBox,
                  width: CARD_WIDTH,
                  marginRight: CARD_GAP,
                },
              ]}
            >
              <Image
                source={
                  userZodiac
                    ? userZodiac.icon
                    : require('../../../assets/icons/libraIcon.png')
                }
                style={{ width: 50, height: 50, marginBottom: 12 }}
                resizeMode="contain"
              />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>
                {userZodiac ? userZodiac.name : '---'}
              </Text>
              <Text style={[styles.cardSub, { color: colors.white }]}>
                {t('profile_zodiac_sign_label')}
              </Text>
            </View>

            {/* Box 2 */}
            {/* Notification Box */}
                {/* Notification Box */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setNotificationModalVisible(true)}
            >
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: colors.bgBox,
                    width: CARD_WIDTH,
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/icons/NotificationIcons.png')}
                  style={{ width: 50, height: 50, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={[styles.cardTitle, { color: colors.primary }]}>
                  {t('profile_notification_title')}
                </Text>
                {/* --- CHANGE: Updated dynamic status text --- */}
                <Text
                  style={[
                    styles.cardSub,
                    { color: colors.white, opacity: 0.8 },
                  ]}
                >
                  {isAnyNotificationEnabled
                    ? t('profile_notification_status_enabled')
                    : t('profile_notification_status_disabled')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Subscription */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 18 },
            ]}
          >
            {t('profile_subscription_header')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('BuySubscription')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_buy_subscription_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PurchaseHistory')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              Purchase History
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SubscriptionDetails')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              Subscription Details
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Document */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 18 },
            ]}
          >
            {t('profile_document_header')}
          </Text>
          {/* <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TermOfService')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_terms_of_service_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SubscriptionTerms')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_subscription_terms_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_privacy_policy_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* General */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 18 },
            ]}
          >
            {t('profile_general_header')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate('SupportScreen');
            }}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_support_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.85}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_logout_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
            onPress={() => {
              navigation.navigate('DeleteAccount');
            }}
          >
            <Text style={[styles.rowText, { color: colors.white }]}>
              {t('profile_delete_account_button')}
            </Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Logout Modal */}
        <LogOutModal
          isVisible={logoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onConfirm={() => {
            setLogoutModalVisible(false);
            logout();
          }}
        />
          <NotificationToggleModal
          isVisible={notificationModalVisible}
          onClose={() => setNotificationModalVisible(false)}
       
          defaultValues={notificationSettings ? {
            email: notificationSettings.email,
            push: notificationSettings.push,
            daily_wisdom_cards: notificationSettings.daily_wisdom_cards,
            ritual_tips: notificationSettings.ritual_tips,
          } : undefined}
        />

      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageBackground: { flex: 1 },
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
  topRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: 55,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  leftProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  name: {
    fontSize: 16,
    fontFamily: Fonts.aeonikBold,
  },
  dob: {
    fontSize: 12,
    opacity: 0.9,
    fontFamily: Fonts.aeonikRegular,
  },
  infoCard: {
    height: 151,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.aeonikBold,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    opacity: 0.85,
  },
  sectionTitle: {
    marginTop: 7,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    color: '#D9B699',
  },
  rowBtn: {
    height: 55,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  rowText: {
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
  },
});

// import React, { useState, useCallback, useEffect } from 'react';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ImageBackground,
//   Dimensions,
//   Image,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { useAuthStore } from '../../../store/useAuthStore';
// import { Fonts } from '../../../constants/fonts';
// import LogOutModal from '../../../components/LogOutModal';

// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../../navigation/routeTypes';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const H_PADDING = 20;
// const CARD_GAP = 12;
// const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// const ProfileScreen: React.FC = () => {
//   const { colors } = useThemeStore(state => state.theme);
//   // const logout = useAuthStore(state => state.logout);
//   const insets = useSafeAreaInsets();
//   const [logoutModalVisible, setLogoutModalVisible] = useState(false);
//     const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { user, fetchCurrentUser, logout } = useAuthStore();
//   console.log("Current user data:", user);
//     // Helper function to format the date string
// const formatDate = (dateString?: string) => {
//   if (!dateString) return ''; // Return empty if no date is available
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   }); // This will format it like "5 Dec, 2020"
// };
//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]} edges={['top', 'left', 'right', 'bottom']}>
//       <ImageBackground
//         source={require('../../../assets/images/backgroundImage.png')}
//         style={styles.imageBackground}
//         resizeMode="cover"
//       >
//         {/* FULL-SCREEN SCROLL (header + content all scroll together) */}
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{
//             paddingTop: 10 ,
//             paddingBottom: insets.bottom + 70,
//             paddingHorizontal: H_PADDING,
//           }}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header  */}
//           <View style={styles.header}>
//             <View style={{ width: 18, height: 18 }} />
//             <Text style={[styles.headerTitle, { color: colors.white }]}>Profile</Text>
//             <TouchableOpacity activeOpacity={0.8} onPress={() => { /* navigate to settings */ }}>
//               <Image
//                 source={require('../../../assets/icons/settingIcon.png')}
//                 style={{ width: 18, height: 18 }}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           </View>

//           {/* Avatar + Name + DOB */}

// <View style={styles.topRow}>
//   <View style={styles.leftProfile}>
//     <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8} onPress={() => navigation.navigate('EditProfile')}>
//       <Image
//         source={require('../../../assets/icons/userprofile.png')}
//         style={styles.avatar}
//       />
//       <View style={styles.onlineDot} />
//     </TouchableOpacity>
//     <View style={{ marginLeft: 10 }}>
//       {/* --- MODIFIED: Dynamic User Name --- */}
//       <Text style={[styles.name, { color: colors.white }]}>
//         {user?.name || 'User Name'}
//       </Text>
//     </View>
//   </View>

//   {/* --- MODIFIED: Dynamic and Formatted Date of Birth --- */}
//  <Text style={[styles.dob, { color: colors.white }]}>
//     {user?.dob ? formatDate(user.dob) : 'Loading...'}
// </Text>
// </View>

//           {/* Two Boxes Row */}
//           <View style={{ flexDirection: 'row', marginTop: 16 }}>
//             {/* Box 1 */}
//             <View
//               style={[
//                 styles.infoCard,
//                 {
//                   backgroundColor: colors.bgBox,
//                   width: CARD_WIDTH,
//                   marginRight: CARD_GAP,
//                 },
//               ]}
//             >
//               <Image
//                 source={require('../../../assets/icons/libraIcon.png')}
//                 style={{ width: 50, height: 50, marginBottom: 12 }}
//                 resizeMode="contain"
//               />
//               <Text style={[styles.cardTitle, { color: colors.primary }]}>Libra</Text>
//               <Text style={[styles.cardSub, { color: colors.white}]}>Zodiac Sign</Text>
//             </View>

//             {/* Box 2 */}
//             <View
//               style={[
//                 styles.infoCard,
//                 {
//                   backgroundColor: colors.bgBox,
//                   width: CARD_WIDTH,
//                 },
//               ]}
//             >
//               <Image
//                 source={require('../../../assets/icons/NotificationIcons.png')}
//                 style={{ width: 50, height: 50, marginBottom: 12 }}
//                 resizeMode="contain"
//               />
//               <Text style={[styles.cardTitle, { color: colors.primary }]}>Notification</Text>
//               <Text style={[styles.cardSub, { color: colors.white, opacity: 0.8 }]}>Disabled</Text>
//             </View>
//           </View>

//           {/* Subscription */}
//           <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>Subscription</Text>
//           <TouchableOpacity activeOpacity={0.85}  onPress={()=>navigation.navigate('BuySubscription')}
//            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
//             <Text style={[styles.rowText, { color: colors.white }]}>Buy Subscription</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Document */}
//           <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>Document</Text>

//           <TouchableOpacity activeOpacity={0.85} onPress={()=>navigation.navigate('TermOfService')}
//            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
//             <Text style={[styles.rowText, { color: colors.white }]}>Terms of Service</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.85} onPress={()=>navigation.navigate('SubscriptionTerms')}
//            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
//             <Text style={[styles.rowText, { color: colors.white }]}>Subscription Terms</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.85}  onPress={()=>navigation.navigate('PrivacyPolicy')}
//            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
//             <Text style={[styles.rowText, { color: colors.white }]}>Privacy Policy</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//              {/* General */}
//           <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>General</Text>

//           <TouchableOpacity activeOpacity={0.85}  onPress={()=>{navigation.navigate('SupportScreen')}}
//           style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
//             <Text style={[styles.rowText, { color: colors.white }]}>Support</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//         {/* Log Out Row */}
//           <TouchableOpacity
//             onPress={() => setLogoutModalVisible(true)}
//             activeOpacity={0.85}
//             style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}
//           >
//             <Text style={[styles.rowText, { color: colors.white }]}>Log Out</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.85} style={[styles.rowBtn, { backgroundColor: colors.bgBox }]} onPress={()=>{navigation.navigate('DeleteAccount')}}  >
//             <Text style={[styles.rowText, { color: colors.white }]}>Delete Account</Text>
//             <Image
//               source={require('../../../assets/icons/rightArrowIcon.png')}
//               style={{ width: 18, height: 18 }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </ScrollView>

//            {/* Logout Modal */}
//         <LogOutModal
//           isVisible={logoutModalVisible}
//           onClose={() => setLogoutModalVisible(false)}
//           onConfirm={() => {
//             setLogoutModalVisible(false);
//             logout();
//           }}
//         />
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   imageBackground: { flex: 1 },

//   // Header (now inside ScrollView)
//   header: {
//     height: 48,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerTitle: {
//     fontSize: 24,
//     lineHeight: 26,
//     textTransform: 'uppercase',
//     fontFamily: Fonts.cormorantSCBold,
//     textAlign: 'center',
//   },

//   // Top row with avatar & DOB
//   topRow: {
//     marginTop: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   leftProfile: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarWrap: {
//     width: 37,
//     height: 37,
//     borderRadius: 18.5,

//   },
//   avatar: { width: '100%', height: '100%' },
//   onlineDot: {
//     position: 'absolute',
//     right: -1,
//     bottom: -1,
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#2ecc71',
//     borderWidth: 2,
//     borderColor: '#1a1a1a',
//   },
//   name: {
//     fontSize: 16,
//     fontFamily: Fonts.aeonikBold,
//   },
//   dob: {
//     fontSize: 12,
//     opacity: 0.9,
//        fontFamily: Fonts.aeonikRegular,
//   },

//   // Info cards
//   infoCard: {
//     height: 151,
//     borderRadius: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',

//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 6,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontFamily: Fonts.aeonikBold,
//     marginBottom: 4,
//   },
//   cardSub: {
//     fontSize: 14,
//         fontFamily: Fonts.aeonikRegular,
//     opacity: 0.85,
//   },

//   // Section title
//   sectionTitle: {
//     marginTop: 7,
//     marginBottom: 10,
//     fontSize: 16,
//            fontFamily: Fonts.aeonikRegular,
//            color:'#D9B699'

//   },

//   // Row buttons
//   rowBtn: {
//     height: 55,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     marginBottom: 12,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',

//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 4,
//   },
//   rowText: {
//     fontSize: 14,
//         fontFamily: Fonts.aeonikRegular,

//   },
// });
