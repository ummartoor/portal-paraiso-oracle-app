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
import { useTranslation } from 'react-i18next';
import { Fonts } from '../../../../constants/fonts';
import { useThemeStore } from '../../../../store/useThemeStore';
import {
  useGetNotificationsStore,
  NotificationItem,
} from '../../../../store/useGetNotificationsStore';
import { AppStackParamList } from '../../../../navigation/routeTypes';
import { SkeletonListItem } from '../../../../components/SkeletonLoader';

// --- Import Icons ---
const BackIcon = require('../../../../assets/icons/backIcon.png');
const MenuIcon = require('../../../../assets/icons/dotIcon.png');

const NotificationScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  const {
    notifications,
    pagination, // For checking if there are more pages
    isLoading,
    isLoadingMore, // For the footer spinner
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
  } = useGetNotificationsStore(
    useShallow(state => ({
      notifications: state.notifications,
      pagination: state.pagination,
      isLoading: state.isLoading,
      isLoadingMore: state.isLoadingMore,
      getNotifications: state.getNotifications,
      markNotificationAsRead: state.markNotificationAsRead,
      deleteNotification: state.deleteNotification,
    })),
  );

  useFocusEffect(
    useCallback(() => {
      // Fetch the first page when the screen is focused
      getNotifications(1);
    }, []),
  );

  // --- NEW: Function to load the next page ---
  const loadMoreNotifications = () => {
    // Prevent fetching if already loading or if there are no more pages
    if (isLoadingMore || !pagination?.hasNextPage) {
      return;
    }
    getNotifications(pagination.currentPage + 1);
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.is_read) {
      markNotificationAsRead(item._id);
    }

    if (item.type === 'daily_wisdom_card') {
      navigation.navigate('DailyWisdomCardScreen');
    } else if (item.type === 'daily_ritual_tip') {
      navigation.navigate('RitualTipScreen');
    }
  };

  const handleDelete = (notificationId: string) => {
    setMenuVisibleFor(null);
    deleteNotification(notificationId);
  };

  // const formatRelativeTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  //   if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  //   const diffInMinutes = Math.floor(diffInSeconds / 60);
  //   if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  //   const diffInHours = Math.floor(diffInMinutes / 60);
  //   if (diffInHours < 24) return `${diffInHours}h ago`;
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   return `${diffInDays}d ago`;
  // };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60)
      return t('time_ago_seconds', { count: diffInSeconds });
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return t('time_ago_minutes', { count: diffInMinutes });
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('time_ago_hours', { count: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    return t('time_ago_days', { count: diffInDays });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      activeOpacity={0.8}
      onPress={() => handleNotificationPress(item)}
    >
      {!item.is_read && <View style={styles.unreadDot} />}

      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      <View style={styles.cardRightContainer}>
        <Text style={styles.cardDate}>
          {formatRelativeTime(item.createdAt)}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() =>
            setMenuVisibleFor(menuVisibleFor === item._id ? null : item._id)
          }
        >
          <Image source={MenuIcon} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {menuVisibleFor === item._id && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.dropdownText}>
              {t('notifications_delete_button')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // --- NEW: Footer component for the FlatList ---
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginVertical: 20 }}
      />
    );
  };

  return (
    <ImageBackground
      source={require('../../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image
              source={BackIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.white }]}>
              {t('notifications_screen_header')}
            </Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4, 5].map(i => (
                <SkeletonListItem key={i} />
              ))}
            </View>
          ) : notifications && notifications.length > 0 ? (
            <FlatList
              data={notifications}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
              onEndReached={loadMoreNotifications} // Trigger for loading more
              onEndReachedThreshold={0.5} // How close to the end to trigger
              ListFooterComponent={renderFooter} // The spinner at the bottom
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('notifications_empty_state')}
              </Text>
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontFamily: Fonts.aeonikRegular, fontSize: 16 },
  notificationCard: {
    backgroundColor: 'rgba(74, 63, 80, 0.7)', // Read card background
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadCard: {
    backgroundColor: 'rgba(113, 111, 116, 0.85)', // Slightly lighter background
  },
  unreadDot: {
    position: 'absolute',
    top: 22,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5899E2',
  },
  cardTextContainer: { flex: 1, marginLeft: 15 },
  cardTitle: {
    color: '#fff',
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 16,
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#E0E0E0',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  cardRightContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  cardDate: {
    color: '#BDBDBD',
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    marginBottom: 8,
  },
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
  dropdownText: {
    color: '#FF453A',
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
  },
  skeletonContainer: {
    paddingTop: 10,
  },
});

// import React, { useCallback, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   ImageBackground,
//   FlatList,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useShallow } from 'zustand/react/shallow';

// import { Fonts } from '../../../../constants/fonts';
// import { useThemeStore } from '../../../../store/useThemeStore';
// import { useGetNotificationsStore, NotificationItem } from '../../../../store/useGetNotificationsStore';
// import { AppStackParamList } from '../../../../navigation/routeTypes';

// // --- Import Icons ---
// const BackIcon = require('../../../../assets/icons/backIcon.png');
// const MenuIcon = require('../../../../assets/icons/dotIcon.png');

// const NotificationScreen: React.FC = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

//   const {
//     notifications,
//     isLoading,
//     getNotifications,
//     markAllNotificationsAsRead,
//     deleteNotification,
//   } = useGetNotificationsStore(
//     useShallow(state => ({
//       notifications: state.notifications,
//       isLoading: state.isLoading,
//       getNotifications: state.getNotifications,
//       markAllNotificationsAsRead: state.markAllNotificationsAsRead,
//       deleteNotification: state.deleteNotification,
//     }))
//   );

//   useFocusEffect(
//     useCallback(() => {
//       getNotifications();
//       markAllNotificationsAsRead();
//     }, [])
//   );

//   const handleDelete = (notificationId: string) => {
//     setMenuVisibleFor(null);
//     deleteNotification(notificationId);
//   };

//   const formatRelativeTime = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
//     const diffInMinutes = Math.floor(diffInSeconds / 60);
//     if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     const diffInDays = Math.floor(diffInHours / 24);
//     return `${diffInDays}d ago`;
//   };

//   const renderItem = ({ item }: { item: NotificationItem }) => (
//     <View style={styles.notificationCard}>
//         {!item.is_read && <View style={styles.unreadDot} />}

//         <View style={styles.cardTextContainer}>
//             <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
//             <Text style={styles.cardSubtitle} numberOfLines={2}>{item.message}</Text>
//         </View>

//         <View style={styles.cardRightContainer}>
//             <Text style={styles.cardDate}>{formatRelativeTime(item.createdAt)}</Text>
//             <TouchableOpacity
//                 style={styles.menuButton}
//                 onPress={() => setMenuVisibleFor(menuVisibleFor === item._id ? null : item._id)}
//             >
//                 <Image source={MenuIcon} style={styles.menuIcon} />
//             </TouchableOpacity>
//         </View>

//         {menuVisibleFor === item._id && (
//             <View style={styles.dropdownMenu}>
//                 <TouchableOpacity style={styles.dropdownItem} onPress={() => handleDelete(item._id)}>
//                     <Text style={styles.dropdownText}>Delete</Text>
//                 </TouchableOpacity>
//             </View>
//         )}
//     </View>
//   );

//   return (
//     <ImageBackground
//       source={require('../../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//         {/* --- FIXED HEADER --- */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Image source={BackIcon} style={styles.backIcon} resizeMode="contain" />
//           </TouchableOpacity>
//           <View style={styles.headerTitleWrap}>
//             <Text style={[styles.headerTitle, { color: colors.white }]}>
//               Notifications
//             </Text>
//           </View>
//           <View style={styles.backBtn} />
//         </View>

//         {/* --- SCROLLABLE LIST --- */}
//         <View style={styles.listContainer}>
//             {isLoading ? (
//                 <ActivityIndicator size="large" color={colors.primary} style={{flex: 1}} />
//             ) : notifications && notifications.length > 0 ? (
//                 <FlatList
//                     data={notifications}
//                     renderItem={renderItem}
//                     keyExtractor={item => item._id}
//                     contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
//                 />
//             ) : (
//                 <View style={styles.emptyContainer}>
//                     <Text style={styles.emptyText}>You have no notifications yet.</Text>
//                 </View>
//             )}
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default NotificationScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: Platform.select({ ios: 0, android: 10 }),
//   },
//   header: {
//     height: 56,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 10,
//   },
//   backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
//   backIcon: { width: 22, height: 22, tintColor: '#fff' },
//   headerTitleWrap: { alignItems: 'center' },
//   headerTitle: { fontFamily: Fonts.cormorantSCBold, fontSize: 22, letterSpacing: 1 },
//   listContainer: {
//       flex: 1, // This makes the list container take up the remaining space
//   },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyText: { color: '#fff', fontFamily: Fonts.aeonikRegular, fontSize: 16 },
//   notificationCard: {
//     backgroundColor: 'rgba(74, 63, 80, 0.7)',
//     borderRadius: 20,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   unreadDot: {
//       position: 'absolute',
//       top: 20,
//       left: 8,
//       width: 8,
//       height: 8,
//       borderRadius: 4,
//       backgroundColor: '#5899E2',
//   },
//   cardTextContainer: { flex: 1, marginLeft: 15 },
//   cardTitle: { color: '#fff', fontFamily: Fonts.cormorantSCBold, fontSize: 16, marginBottom: 5 },
//   cardSubtitle: { color: '#E0E0E0', fontFamily: Fonts.aeonikRegular, fontSize: 13, lineHeight: 18 },
//   // --- FIX IS HERE ---
//   cardRightContainer: {
//       alignItems: 'flex-end',
//       marginLeft: 8
//     },
//   cardDate: { color: '#BDBDBD', fontFamily: Fonts.aeonikRegular, fontSize: 12, marginBottom: 8 },
//   menuButton: { padding: 5 },
//   menuIcon: { width: 18, height: 18, tintColor: '#B0B0B0' },
//   dropdownMenu: {
//     position: 'absolute',
//     right: 40,
//     top: 50,
//     backgroundColor: '#3A3A3C',
//     borderRadius: 8,
//     padding: 5,
//     zIndex: 100,
//     elevation: 5,
//   },
//   dropdownItem: { paddingVertical: 8, paddingHorizontal: 15 },
//   dropdownText: { color: '#FF453A', fontSize: 14, fontFamily: Fonts.aeonikRegular },
// });

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
