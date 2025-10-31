// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ImageBackground,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { useChatStore, ChatSession } from '../../../store/useChatStore';
// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// import GradientBox from '../../../components/GradientBox'; 
// import { useTranslation } from 'react-i18next';
// // Assets
// const addIcon = require('../../../assets/icons/newChatIcon.png');
// const menuIcon = require('../../../assets/icons/dotIcon.png'); 

// const ChatScreen: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const { colors } = useThemeStore(s => s.theme);
//     const { t } = useTranslation(); 
//   const {
//     sessions,
//     isLoadingSessions,
//     getSessions,
//     createNewChat,
//     deleteSession,
//   } = useChatStore();
//   const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

//   // Fetch sessions every time the screen is focused
//   useFocusEffect(
//     React.useCallback(() => {
//       getSessions();
//     }, []),
//   );

//   const handleNewChat = () => {
//     createNewChat(); // Clears any old session from the store
//     navigation.navigate('ChatDetail'); // Navigate to the detail screen
//   };

//   const handleSessionSelect = (sessionId: string) => {
//     navigation.navigate('ChatDetail', { sessionId }); // Navigate with the session ID
//   };

//   const handleDelete = (sessionId: string) => {
//     setMenuVisibleFor(null); // Close the dropdown menu
//     deleteSession(sessionId); // Directly call the delete function
//   };

//   const renderSessionItem = (session: ChatSession) => (
//     <TouchableOpacity
//       key={session.session_id}
//       style={styles.sessionItem}
//       onPress={() => handleSessionSelect(session.session_id)}
//     >
//       <View style={styles.sessionTextContainer}>
//         <Text style={styles.sessionTitle} numberOfLines={1}>
//           {session.title}
//         </Text>
//         {session.last_message && (
//           <Text style={styles.sessionSubtitle} numberOfLines={1}>
//             {session.last_message.content}
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity
//         style={styles.menuButton}
//         onPress={() =>
//           setMenuVisibleFor(
//             menuVisibleFor === session.session_id ? null : session.session_id,
//           )
//         }
//       >
//         <Image source={menuIcon} style={styles.menuIcon} />
//       </TouchableOpacity>

//       {menuVisibleFor === session.session_id && (
//         <View style={styles.dropdownMenu}>
//           <TouchableOpacity
//             style={styles.dropdownItem}
//             onPress={() => handleDelete(session.session_id)}
//           >
//          <Text style={styles.dropdownText}>{t('chat_delete_button')}</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <ImageBackground
//         source={require('../../../assets/images/backgroundImage.png')}
//         style={styles.imageBackground}
//         resizeMode="cover"
//       >
//         {/* --- FIXED (NON-SCROLLABLE) CONTENT --- */}
//         <View style={styles.headerContainer}>
//            <Text style={styles.headerTitle}>{t('chat_screen_title')}</Text>
         

//           <TouchableOpacity onPress={handleNewChat}>
//             <GradientBox
//               colors={[colors.black, colors.bgBox]}
//               style={styles.newChatButton}
//             >
//               <Image source={addIcon} style={styles.addIcon} />
//              <Text style={styles.newChatText}>{t('chat_start_new_chat')}</Text>
//             </GradientBox>
//           </TouchableOpacity>

//                 <Text style={styles.sessionListHeader}>{t('chat_recent_chats')}</Text>
//         </View>

//         {/* --- SCROLLABLE CONTENT --- */}
//         <ScrollView contentContainerStyle={styles.scrollViewContent}>
//           {isLoadingSessions ? (
//             <ActivityIndicator color="#FFFFFF" style={{ marginTop: 30 }} />
//           ) : sessions && sessions.length > 0 ? (
//             sessions.map(renderSessionItem)
//           ) : (
//             <View style={styles.noSessionsContainer}>
//               <Text style={styles.noSessionsText}>{t('chat_no_recent_chats')}</Text>
//                   <Text style={styles.noSessionsSubtext}>
//                 {t('chat_no_recent_chats_subtitle')}
//               </Text>
//             </View>
//           )}
//         </ScrollView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   imageBackground: { flex: 1 },
//   // --- Fixed Content Styles ---
//   headerContainer: {
//     paddingHorizontal: 20,
//   },
//   headerTitle: {
//     color: '#FFFFFF',
//     fontSize: 32,
//     fontFamily: Fonts.cormorantSCBold,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   headerSubtitle: {
//     color: '#B0B0B0',
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   newChatButton: {
//     height:56,
//     marginTop:20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // paddingVertical: 18,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#D9B699', // Gold border for gradient button
//   },
//   addIcon: { width: 24, height: 24, marginRight: 12, tintColor: '#FFFFFF' },
//   newChatText: { color: '#FFFFFF', fontSize: 18, fontFamily: Fonts.aeonikBold },
//   sessionListHeader: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontFamily: Fonts.cormorantSCBold,
//     marginTop: 40,
//     marginBottom: 15,
//   },
//   // --- Scrollable Content Styles ---
//   scrollViewContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 80,
//   },
//   sessionItem: {
//     backgroundColor: 'rgba(47, 43, 59, 0.8)',
//     padding: 20,
//     borderRadius: 12,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sessionTextContainer: { flex: 1 },
//   sessionTitle: {
//     color: '#EAEAEA',
//     fontSize: 16,
//     fontFamily: Fonts.aeonikBold,
//   },
//   sessionSubtitle: {
//     color: '#9E9E9E',
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//     marginTop: 4,
//   },
//   menuButton: { padding: 5 },
//   menuIcon: { width: 20, height: 20, tintColor: '#B0B0B0' },
//   dropdownMenu: {
//     position: 'absolute',
//     right: 45,
//     top: 40,
//     backgroundColor: '#3A3A3C',
//     borderRadius: 8,
//     padding: 5,
//     zIndex: 100,
//     elevation: 5,
//   },
//   dropdownItem: { paddingVertical: 8, paddingHorizontal: 15 },
//   dropdownText: {
//     color: '#FF453A',
//     fontSize: 15,
//     fontFamily: Fonts.aeonikRegular,
//   }, // Red color for delete
//   noSessionsContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     backgroundColor: 'rgba(47, 43, 59, 0.5)',
//     borderRadius: 12,
//   },
//   noSessionsText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontFamily: Fonts.aeonikBold,
//   },
//   noSessionsSubtext: {
//     color: '#B0B0B0',
//     fontSize: 14,
//     fontFamily: Fonts.aeonikRegular,
//     marginTop: 8,
//     textAlign: 'center',
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  FlatList, // <-- Import FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Make sure this is imported
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useChatStore, ChatSession } from '../../../store/useChatStore';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import GradientBox from '../../../components/GradientBox';
import { useTranslation } from 'react-i18next';

// Assets
const addIcon = require('../../../assets/icons/newChatIcon.png');
const menuIcon = require('../../../assets/icons/dotIcon.png');

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useThemeStore(s => s.theme);
  const { t } = useTranslation();
  const {
    sessions,
    isLoadingSessions,
    getSessions,
    createNewChat,
    deleteSession,
    loadMoreSessions,
    isLoadingMoreSessions,
    sessionsPagination,
  } = useChatStore();
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  // Fetch sessions every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Always fetch page 1 on focus to get the latest list
      getSessions(1);
    }, []),
  );

  const handleNewChat = () => {
    createNewChat();
    navigation.navigate('ChatDetail');
  };

  const handleSessionSelect = (sessionId: string) => {
    navigation.navigate('ChatDetail', { sessionId });
  };

  const handleDelete = (sessionId: string) => {
    setMenuVisibleFor(null);
    deleteSession(sessionId);
  };

  // --- Handler for FlatList onEndReached ---
  const handleLoadMore = () => {
    // Prevent fetching if already loading
    if (isLoadingMoreSessions || isLoadingSessions) return;

    // Check if there are more pages to load
    if (
      sessionsPagination &&
      sessionsPagination.current_page < sessionsPagination.total_pages
    ) {
      loadMoreSessions();
    }
  };

  // --- Renders the loading spinner at the bottom of the list ---
  // This is your professional pagination loader
  const renderFooter = () => {
    if (!isLoadingMoreSessions) return null;
    return <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 20 }} />;
  };

  // --- Renders content when the list is empty ---
  const renderListEmpty = () => {
    // Show spinner on initial load
    if (isLoadingSessions) {
      return <ActivityIndicator color="#FFFFFF" style={{ marginTop: 30 }} />;
    }
    // Show "no chats" message if loading is done and list is empty
    if (!isLoadingSessions && (!sessions || sessions.length === 0)) {
      return (
        <View style={styles.noSessionsContainer}>
          <Text style={styles.noSessionsText}>{t('chat_no_recent_chats')}</Text>
          <Text style={styles.noSessionsSubtext}>
            {t('chat_no_recent_chats_subtitle')}
          </Text>
        </View>
      );
    }
    return null;
  };

  // --- renderItem for FlatList ---
  const renderSessionItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      key={item.session_id}
      style={styles.sessionItem}
      onPress={() => handleSessionSelect(item.session_id)}
    >
      <View style={styles.sessionTextContainer}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.last_message && (
          <Text style={styles.sessionSubtitle} numberOfLines={1}>
            {item.last_message.content}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() =>
          setMenuVisibleFor(
            menuVisibleFor === item.session_id ? null : item.session_id,
          )
        }
      >
        <Image source={menuIcon} style={styles.menuIcon} />
      </TouchableOpacity>

      {menuVisibleFor === item.session_id && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleDelete(item.session_id)}
          >
            <Text style={styles.dropdownText}>{t('chat_delete_button')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    // --- MODIFIED: Added 'bottom' to edges ---
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {/* --- FIXED (NON-SCROLLABLE) CONTENT --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t('chat_screen_title')}</Text>

          <TouchableOpacity onPress={handleNewChat}>
            <GradientBox
              colors={[colors.black, colors.bgBox]}
              style={styles.newChatButton}
            >
              <Image source={addIcon} style={styles.addIcon} />
              <Text style={styles.newChatText}>{t('chat_start_new_chat')}</Text>
            </GradientBox>
          </TouchableOpacity>

          <Text style={styles.sessionListHeader}>{t('chat_recent_chats')}</Text>
        </View>

        {/* --- SCROLLABLE CONTENT (FLATLIST) --- */}
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.session_id}
          contentContainerStyle={styles.scrollViewContent} // <-- Style updated below
          ListEmptyComponent={renderListEmpty}
          ListFooterComponent={renderFooter} // <-- This adds your pagination loader
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatScreen;

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageBackground: { flex: 1 },
  // --- Fixed Content Styles ---
  headerContainer: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: Fonts.cormorantSCBold,
    textAlign: 'center',
    marginTop: 20,
  },
  newChatButton: {
    height: 56,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9B699', // Gold border for gradient button
  },
  addIcon: { width: 24, height: 24, marginRight: 12, tintColor: '#FFFFFF' },
  newChatText: { color: '#FFFFFF', fontSize: 18, fontFamily: Fonts.aeonikBold },
  sessionListHeader: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.cormorantSCBold,
    marginTop: 40,
    marginBottom: 15,
  },
  // --- Scrollable Content Styles ---
  scrollViewContent: {
    paddingHorizontal: 20,
    // --- MODIFIED: Reduced padding, as SafeAreaView now handles the tab bar ---
    paddingBottom: 60,
  },
  sessionItem: {
    backgroundColor: 'rgba(47, 43, 59, 0.8)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTextContainer: { flex: 1 },
  sessionTitle: {
    color: '#EAEAEA',
    fontSize: 16,
    fontFamily: Fonts.aeonikBold,
  },
  sessionSubtitle: {
    color: '#9E9E9E',
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    marginTop: 4,
  },
  menuButton: { padding: 5 },
  menuIcon: { width: 20, height: 20, tintColor: '#B0B0B0' },
  dropdownMenu: {
    position: 'absolute',
    right: 45,
    top: 40,
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    padding: 5,
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 15 },
  dropdownText: {
    color: '#FF453A',
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
  }, // Red color for delete
  noSessionsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(47, 43, 59, 0.5)',
    borderRadius: 12,
    marginTop: 20,
  },
  noSessionsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.aeonikBold,
  },
  noSessionsSubtext: {
    color: '#B0B0B0',
    fontSize: 14,
    fontFamily: Fonts.aeonikRegular,
    marginTop: 8,
    textAlign: 'center',
  },
});