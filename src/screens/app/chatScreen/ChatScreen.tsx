import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useChatStore, ChatSession } from '../../../store/useChatStore';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import GradientBox from '../../../components/GradientBox'; // Make sure this path is correct
import { useTranslation } from 'react-i18next';
// Assets
const addIcon = require('../../../assets/icons/newChatIcon.png');
const menuIcon = require('../../../assets/icons/dotIcon.png'); // Add this icon if you haven't already

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
  } = useChatStore();
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  // Fetch sessions every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      getSessions();
    }, []),
  );

  const handleNewChat = () => {
    createNewChat(); // Clears any old session from the store
    navigation.navigate('ChatDetail'); // Navigate to the detail screen
  };

  const handleSessionSelect = (sessionId: string) => {
    navigation.navigate('ChatDetail', { sessionId }); // Navigate with the session ID
  };

  const handleDelete = (sessionId: string) => {
    setMenuVisibleFor(null); // Close the dropdown menu
    deleteSession(sessionId); // Directly call the delete function
  };

  const renderSessionItem = (session: ChatSession) => (
    <TouchableOpacity
      key={session.session_id}
      style={styles.sessionItem}
      onPress={() => handleSessionSelect(session.session_id)}
    >
      <View style={styles.sessionTextContainer}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.title}
        </Text>
        {session.last_message && (
          <Text style={styles.sessionSubtitle} numberOfLines={1}>
            {session.last_message.content}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() =>
          setMenuVisibleFor(
            menuVisibleFor === session.session_id ? null : session.session_id,
          )
        }
      >
        <Image source={menuIcon} style={styles.menuIcon} />
      </TouchableOpacity>

      {menuVisibleFor === session.session_id && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleDelete(session.session_id)}
          >
         <Text style={styles.dropdownText}>{t('chat_delete_button')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        {/* --- SCROLLABLE CONTENT --- */}
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {isLoadingSessions ? (
            <ActivityIndicator color="#FFFFFF" style={{ marginTop: 30 }} />
          ) : sessions && sessions.length > 0 ? (
            sessions.map(renderSessionItem)
          ) : (
            <View style={styles.noSessionsContainer}>
              <Text style={styles.noSessionsText}>{t('chat_no_recent_chats')}</Text>
                  <Text style={styles.noSessionsSubtext}>
                {t('chat_no_recent_chats_subtitle')}
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatScreen;

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
  headerSubtitle: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    textAlign: 'center',
    marginBottom: 30,
  },
  newChatButton: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 15,
    borderWidth: 1.5,
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
    paddingBottom: 80,
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

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TextInput,
//   Platform,
//   ImageBackground,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   Pressable,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import { useUIStore } from '../../../store/useUiStore';
// import { useChatStore, ChatMessage } from '../../../store/useChatStore';
// import ChatSidebar from './ChatSidebar';

// // Assets
// const sendIcon = require('../../../assets/icons/sendIcon.png');
// const aiAvatar = require('../../../assets/images/chatAvatar.png');
// const userAvatar = require('../../../assets/icons/userprofile.png');
// const menuIcon = require('../../../assets/icons/humBurgerMenuIcon.png');

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const ChatScreen: React.FC = () => {
//   const { colors } = useThemeStore((s) => s.theme);
//   const [inputText, setInputText] = useState('');
//   const [isSidebarVisible, setSidebarVisible] = useState(false);
//   const insets = useSafeAreaInsets();
//   const isKeyboardVisible = useUIStore((state) => state.isKeyboardVisible);
//   const scrollViewRef = useRef<ScrollView>(null);

//   const {
//     activeSession,
//     isSendingMessage,
//     isLoadingHistory,
//     sendMessage,
//     createNewChat,
//   } = useChatStore();

//   useEffect(() => {
//     // Scroll to the bottom when new messages arrive
//     if (activeSession?.messages?.length) {
//       setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
//     }
//   }, [activeSession?.messages]);

//   const handleSend = () => {
//     if (inputText.trim() && !isSendingMessage) {
//       const payload = {
//         message: inputText,
//         session_id: activeSession?.session?.session_id || null,
//         preferences: {
//           response_style: 'mystical',
//           focus_areas: ['love', 'career', 'health', 'finance'],
//         },
//       };
//       sendMessage(payload);
//       setInputText('');
//     }
//   };

//   const renderMessage = (item: ChatMessage, index: number) => {
//     const isUserMessage = item.role === 'user_message';
//     return (
//       <View
//         key={item._id || `msg-${index}`}
//         style={[styles.messageRow, isUserMessage ? styles.userMessageRow : styles.aiMessageRow]}
//       >
//         {!isUserMessage && <Image source={aiAvatar} style={styles.messageAvatar} />}
//         <View style={styles.messageContent}>
//           <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.aiBubble]}>
//             <Text style={styles.messageText}>{item.content}</Text>
//           </View>
//         </View>
//         {isUserMessage && <Image source={userAvatar} style={styles.messageAvatar} />}
//       </View>
//     );
//   };

//   const handleNewChat = () => {
//     createNewChat();
//     setSidebarVisible(false);
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <ImageBackground
//         source={require('../../../assets/images/backgroundImage.png')}
//         style={styles.imageBackground}
//         resizeMode="cover"
//       >
//         <ChatSidebar
//           isVisible={isSidebarVisible}
//           onClose={() => setSidebarVisible(false)}
//           onNewChat={handleNewChat}
//         />

//         {/* --- Top Header --- */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => setSidebarVisible(true)}>
//             <Image source={menuIcon} style={styles.headerIcon} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Oracle Chat</Text>
//           <View style={styles.headerIcon} />
//         </View>

//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
//         >
//           {isLoadingHistory ? (
//             <View style={styles.centeredContent}>
//               <ActivityIndicator size="large" color="#FFFFFF" />
//             </View>
//           ) : activeSession && activeSession.messages.length > 0 ? (
//             <ScrollView
//               ref={scrollViewRef}
//               style={{ flex: 1 }}
//               contentContainerStyle={styles.messagesContainer}
//               showsVerticalScrollIndicator={false}
//             >
//               {activeSession.messages.map(renderMessage)}
//               {isSendingMessage && (
//                   <View style={styles.aiMessageRow}>
//                        <Image source={aiAvatar} style={styles.messageAvatar} />
//                       <View style={styles.typingIndicator}>
//                           <ActivityIndicator size="small" color="#FFF" />
//                       </View>
//                   </View>
//               )}
//             </ScrollView>
//           ) : (
//             <View style={styles.centeredContent}>
//               <Image source={aiAvatar} style={styles.mainAvatar} />
//               <Text style={styles.title}>How can I help you?</Text>
//             </View>
//           )}

//          <View style={[styles.inputContainer, { bottom: isKeyboardVisible?insets.bottom+5:insets.bottom + 80 }]}>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Ask the Oracle..."
//               placeholderTextColor="#8A8A8D"
//               value={inputText}
//               onChangeText={setInputText}
//             />
//             <TouchableOpacity onPress={handleSend} disabled={isSendingMessage}>
//               <Image source={sendIcon} style={styles.sendIcon} />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   imageBackground: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   headerIcon: {
//     width: 24,
//     height: 24,
//     tintColor: '#FFF',
//     zIndex:100
//   },
//   headerTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontFamily: Fonts.cormorantSCBold,
//   },
//   centeredContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 100, // Offset for input bar
//   },
//   mainAvatar: {
//     width: 80,
//     height: 80,
//     marginBottom: 16,
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontFamily: Fonts.cormorantSCBold,
//   },
//   messagesContainer: {
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//   },
//   messageRow: {
//     flexDirection: 'row',
//     marginVertical: 8,
//     alignItems: 'flex-end',
//   },
//   aiMessageRow: {
//     justifyContent: 'flex-start',
//   },
//   userMessageRow: {
//     justifyContent: 'flex-end',
//   },
//   messageAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     marginHorizontal: 8,
//   },
//   messageContent: {
//     maxWidth: '75%',
//   },
//   messageBubble: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   aiBubble: {
//     backgroundColor: '#2F2B3B',
//     borderBottomLeftRadius: 4,
//   },
//   userBubble: {
//     backgroundColor: '#4A3F50',
//     borderBottomRightRadius: 4,
//   },
//   messageText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//     lineHeight: 22,
//   },
//   // --- INPUT ---
//   inputContainer: {
//     position: 'absolute',
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4A3F50',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 12 : 8,
//   },
//   textInput: {
//     flex: 1,
//     color: '#FFFFFF',
//     fontSize: 15,
//     marginRight: 10,
//     fontFamily: Fonts.aeonikRegular,
//   },
//   sendIcon: {
//     width:32,
//     height: 32,
//   },
//   typingIndicator: {
//     backgroundColor: '#2F2B3B',
//     borderRadius: 20,
//     padding: 15,
//     alignSelf: 'flex-start',
// },
// });

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TextInput,
//   Platform,
//   ImageBackground,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   ScrollView,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { Fonts } from '../../../constants/fonts';
// import { useUIStore } from '../../../store/useUiStore';

// // Assets
// const sendIcon = require('../../../assets/icons/sendIcon.png');
// const aiAvatar = require('../../../assets/images/chatAvatar.png');
// const userAvatar = require('../../../assets/icons/userprofile.png');

// const initialMessages = [
//   { id: '1', text: "What does today's ritual mean?", sender: 'user', timestamp: '8:15 PM' },
//   {
//     id: '2',
//     text: "Today's ritual calls for candlelight. It means clarity and protection will guide you",
//     sender: 'ai',
//     timestamp: '8:15 PM',
//   },
//   { id: '3', text: 'Pull me a tarot card.', sender: 'user', timestamp: '8:15 PM' },
//   {
//     id: '4',
//     text: 'You drew The Star a sign of hope, renewal, and trust in divine timing.',
//     sender: 'ai',
//     timestamp: '8:15 PM',
//   },
//     { id: '5', text: "What does today's ritual mean?", sender: 'user', timestamp: '8:15 PM' },
//   {
//     id: '6',
//     text: "Today's ritual calls for candlelight. It means clarity and protection will guide you",
//     sender: 'ai',
//     timestamp: '8:15 PM',
//   },
//   { id: '7', text: 'Pull me a tarot card.', sender: 'user', timestamp: '8:15 PM' },
//   {
//     id: '8',
//     text: 'You drew The Star a sign of hope, renewal, and trust in divine timing.',
//     sender: 'ai',
//     timestamp: '8:15 PM',
//   },
// ];

// const ChatScreen: React.FC = () => {
//   const { colors } = useThemeStore((s) => s.theme);
//   const [messages, setMessages] = useState(initialMessages);
//   const [inputText, setInputText] = useState('');
//   const insets = useSafeAreaInsets();
// const isKeyboardVisible = useUIStore(state => state.isKeyboardVisible);
//   const handleSend = () => {
//     if (inputText.trim()) {
//       const newMessage = {
//         id: Math.random().toString(),
//         text: inputText,
//         sender: 'user',
//         timestamp: new Date().toLocaleTimeString('en-US', {
//           hour: 'numeric',
//           minute: '2-digit',
//         }),
//       };
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//       setInputText('');
//     }
//   };

//   const renderMessage = (item: typeof initialMessages[0]) => {
//     const isUserMessage = item.sender === 'user';
//     return (
//       <View
//         key={item.id}
//         style={[styles.messageRow, isUserMessage ? styles.userMessageRow : styles.aiMessageRow]}
//       >
//         {!isUserMessage && <Image source={aiAvatar} style={styles.messageAvatar} />}
//         <View style={styles.messageContent}>
//           <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.aiBubble]}>
//             <Text style={styles.messageText}>{item.text}</Text>
//           </View>
//           <Text style={styles.timestamp}>{item.timestamp}</Text>
//         </View>
//         {isUserMessage && <Image source={userAvatar} style={styles.messageAvatar} />}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <ImageBackground
//         source={require('../../../assets/images/backgroundImage.png')}
//         style={styles.imageBackground}
//         resizeMode="cover"
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={{ flex: 1 }}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//         >
//           <ScrollView
//             style={{ flex: 1 }}
//             contentContainerStyle={{ paddingBottom: 140 }}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* --- Top Header --- */}
//             <View style={styles.topContentArea}>
//               <Image source={aiAvatar} style={styles.mainAvatar} />
//               <Text style={styles.title}>Portal Paraíso AI Guide</Text>
//             </View>

//             {/* --- Chat Messages --- */}
//             {messages.map((msg) => renderMessage(msg))}
//           </ScrollView>

//           <View style={[styles.inputContainer, { bottom: isKeyboardVisible?insets.bottom+5:insets.bottom + 80 }]}

//           >
//             <TextInput
//               style={styles.textInput}
//               placeholder="Type something..."
//               placeholderTextColor="#8A8A8D"
//               value={inputText}
//               onChangeText={setInputText}
//             />
//             <TouchableOpacity onPress={handleSend}>
//               <Image source={sendIcon} style={styles.sendIcon} />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   imageBackground: {
//     flex: 1,
//   },

//   // --- TOP CONTENT ---
//   topContentArea: {
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 8,
//   },
//   mainAvatar: {
//     width: 80,
//     height: 80,
//     marginBottom: 4,
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontFamily: Fonts.cormorantSCBold,
//     textAlign: 'center',
//   },

//   // --- MESSAGES ---
//   messageRow: {
//     flexDirection: 'row',
//     marginVertical: 6,
//     alignItems: 'flex-end',
//   },
//   aiMessageRow: {
//     justifyContent: 'flex-start',
//   },
//   userMessageRow: {
//     justifyContent: 'flex-end',
//   },
//   messageAvatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     marginHorizontal: 6,
//   },
//   messageContent: {
//     maxWidth: '75%',
//   },
//   messageBubble: {
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderRadius: 18,
//   },
//   aiBubble: {
//     backgroundColor: '#2F2B3B',
//     borderBottomLeftRadius: 4,
//   },
//   userBubble: {
//     backgroundColor: '#4A3F50',
//     borderBottomRightRadius: 4,
//   },
//   messageText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontFamily: Fonts.aeonikRegular,
//     lineHeight: 20,
//   },
//   timestamp: {
//     color: '#9E9E9E',
//     fontSize: 11,
//     fontFamily: Fonts.aeonikRegular,
//     marginTop: 3,
//     marginHorizontal: 6,
//   },

//   // --- INPUT ---
//   inputContainer: {
//     position: 'absolute',
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4A3F50',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 12 : 8,
//   },
//   textInput: {
//     flex: 1,
//     color: '#FFFFFF',
//     fontSize: 15,
//     marginRight: 10,
//     fontFamily: Fonts.aeonikRegular,
//   },
//   sendIcon: {
//     width:32,
//     height: 32,
//   },
// });
