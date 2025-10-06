import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShallow } from 'zustand/react/shallow';

import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import { useGetNotificationsStore, NotificationItem } from '../../../../store/useGetNotificationsStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';

// --- Import Icons ---
const BackIcon = require('../../../../assets/icons/backIcon.png');
const MenuIcon = require('../../../../assets/icons/dotIcon.png');

const NotificationScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  const {
    notifications,
    isLoading,
    getNotifications,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useGetNotificationsStore(
    useShallow(state => ({
      notifications: state.notifications,
      isLoading: state.isLoading,
      getNotifications: state.getNotifications,
      markAllNotificationsAsRead: state.markAllNotificationsAsRead,
      deleteNotification: state.deleteNotification,
    }))
  );

  useFocusEffect(
    useCallback(() => {
      getNotifications();
      markAllNotificationsAsRead();
    }, [])
  );
  
  const handleDelete = (notificationId: string) => {
    setMenuVisibleFor(null);
    deleteNotification(notificationId);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={styles.notificationCard}>
        {!item.is_read && <View style={styles.unreadDot} />}
        
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>{item.message}</Text>
        </View>

        <View style={styles.cardRightContainer}>
            <Text style={styles.cardDate}>{formatRelativeTime(item.createdAt)}</Text>
            <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => setMenuVisibleFor(menuVisibleFor === item._id ? null : item._id)}
            >
                <Image source={MenuIcon} style={styles.menuIcon} />
            </TouchableOpacity>
        </View>

        {menuVisibleFor === item._id && (
            <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.dropdownText}>Delete</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* --- FIXED HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image source={BackIcon} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.white }]}>
              Notifications
            </Text>
          </View>
          <View style={styles.backBtn} /> 
        </View>

        {/* --- SCROLLABLE LIST --- */}
        <View style={styles.listContainer}>
            {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{flex: 1}} />
            ) : notifications && notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You have no notifications yet.</Text>
                </View>
            )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1 },
  listContainer: {
      flex: 1, // This makes the list container take up the remaining space
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontFamily: Fonts.aeonikRegular, fontSize: 16 },
  notificationCard: {
    backgroundColor: 'rgba(74, 63, 80, 0.7)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadDot: {
      position: 'absolute',
      top: 20,
      left: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#5899E2',
  },
  cardTextContainer: { flex: 1, marginLeft: 15 },
  cardTitle: { color: '#fff', fontFamily: Fonts.cormorantSCBold, fontSize: 16, marginBottom: 5 },
  cardSubtitle: { color: '#E0E0E0', fontFamily: Fonts.aeonikRegular, fontSize: 13, lineHeight: 18 },
  // --- FIX IS HERE ---
  cardRightContainer: { 
      alignItems: 'flex-end', 
      marginLeft: 8 
    },
  cardDate: { color: '#BDBDBD', fontFamily: Fonts.aeonikRegular, fontSize: 12, marginBottom: 8 },
  menuButton: { padding: 5 },
  menuIcon: { width: 18, height: 18, tintColor: '#B0B0B0' },
  dropdownMenu: {
    position: 'absolute',
    right: 40,
    top: 50,
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 5,
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 15 },
  dropdownText: { color: '#FF453A', fontSize: 14, fontFamily: Fonts.aeonikRegular },
});








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
// import DatePicker from 'react-native-date-picker';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';

// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import GradientBox from '../../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const NotificationScreen = () => {
//   const colors = useThemeStore(s => s.theme.colors);
//   const navigation = useNavigation<any>();



//   return (
//     <ImageBackground
//       source={require('../../../../assets/images/backgroundImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image
//               source={require('../../../../assets/icons/backIcon.png')}
//               style={styles.backIcon}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           <View style={styles.headerTitleWrap} pointerEvents="none">
//             <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
//       Notifications
//             </Text>
//           </View>
//         </View>



    
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default NotificationScreen;

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

//   scrollInner: {
//     paddingBottom: 20,
//   },

// });
