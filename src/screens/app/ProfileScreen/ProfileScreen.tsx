


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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { Fonts } from '../../../constants/fonts';
import LogOutModal from '../../../components/LogOutModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/routeTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const H_PADDING = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// --- ADDED: Data array for all Zodiac signs ---
const ZODIACS: { key: string; name: string; icon: ImageSourcePropType }[] = [
  { key: 'aries', name: 'Aries', icon: require('../../../assets/icons/aries.png') },
  { key: 'taurus', name: 'Taurus', icon: require('../../../assets/icons/taurus.png') },
  { key: 'gemini', name: 'Gemini', icon: require('../../../assets/icons/gemini.png') },
  { key: 'cancer', name: 'Cancer', icon: require('../../../assets/icons/cancer.png') },
  { key: 'leo', name: 'Leo', icon: require('../../../assets/icons/leo.png') },
  { key: 'virgo', name: 'Virgo', icon: require('../../../assets/icons/virgo.png') },
  { key: 'libra', name: 'Libra', icon: require('../../../assets/icons/libra.png') },
  { key: 'scorpio', name: 'Scorpio', icon: require('../../../assets/icons/scorpio.png') },
  { key: 'sagittarius', name: 'Sagittarius', icon: require('../../../assets/icons/sagittarius.png') },
  { key: 'capricorn', name: 'Capricorn', icon: require('../../../assets/icons/capricorn.png') },
  { key: 'aquarius', name: 'Aquarius', icon: require('../../../assets/icons/aquarius.png') },
  { key: 'pisces', name: 'Pisces', icon: require('../../../assets/icons/pisces.png') },
];

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
  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, fetchCurrentUser, logout } = useAuthStore();

  // --- FIX: Fetches fresh user data every time the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
    }, [])
  );

  // --- NEW: Finds the user's zodiac object from the ZODIACS array ---
  const userZodiac = useMemo(() => {
    if (!user?.sign_in_zodiac) return null;
    return ZODIACS.find(z => z.key === user.sign_in_zodiac);
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]} edges={['top', 'left', 'right', 'bottom']}>
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: insets.bottom + 70,
            paddingHorizontal: H_PADDING,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 18, height: 18 }} />
            <Text style={[styles.headerTitle, { color: colors.white }]}>Profile</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => { /* navigate to settings */ }}>
              <Image
                source={require('../../../assets/icons/settingIcon.png')}
                style={{ width: 18, height: 18 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
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
        source={require('../../../assets/icons/userprofile.png')}
        style={styles.avatar}
      />
      <View style={styles.onlineDot} />
    </View>
    <View style={{ marginLeft: 10 }}>
      <Text style={[styles.name, { color: colors.white }]}>
        {user?.name || 'User Name'}
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
                source={userZodiac ? userZodiac.icon : require('../../../assets/icons/libraIcon.png')}
                style={{ width: 50, height: 50, marginBottom: 12 }}
                resizeMode="contain"
              />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>
                {userZodiac ? userZodiac.name : '---'}
              </Text>
              <Text style={[styles.cardSub, { color: colors.white }]}>Zodiac Sign</Text>
            </View>

            {/* Box 2 */}
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
              <Text style={[styles.cardTitle, { color: colors.primary }]}>Notification</Text>
              <Text style={[styles.cardSub, { color: colors.white, opacity: 0.8 }]}>Disabled</Text>
            </View>
          </View>

          {/* Subscription */}
          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>Subscription</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('BuySubscription')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
            <Text style={[styles.rowText, { color: colors.white }]}>Buy Subscription</Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Document */}
          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>Document</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('TermOfService')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
            <Text style={[styles.rowText, { color: colors.white }]}>Terms of Service</Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('SubscriptionTerms')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
            <Text style={[styles.rowText, { color: colors.white }]}>Subscription Terms</Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('PrivacyPolicy')}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
            <Text style={[styles.rowText, { color: colors.white }]}>Privacy Policy</Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* General */}
          <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 18 }]}>General</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => { navigation.navigate('SupportScreen') }}
            style={[styles.rowBtn, { backgroundColor: colors.bgBox }]}>
            <Text style={[styles.rowText, { color: colors.white }]}>Support</Text>
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
            <Text style={[styles.rowText, { color: colors.white }]}>Log Out</Text>
            <Image
              source={require('../../../assets/icons/rightArrowIcon.png')}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.rowBtn, { backgroundColor: colors.bgBox }]} onPress={() => { navigation.navigate('DeleteAccount') }}>
            <Text style={[styles.rowText, { color: colors.white }]}>Delete Account</Text>
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
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageBackground: { flex: 1 },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 26,
    textTransform: 'uppercase',
    fontFamily: Fonts.cormorantSCBold,
    textAlign: 'center',
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
  },
  avatar: { width: '100%', height: '100%' },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#1a1a1a',
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
    color: '#D9B699'
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
