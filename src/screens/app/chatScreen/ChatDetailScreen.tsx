import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useChatStore, ChatMessage } from '../../../store/useChatStore';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore';
import TypingIndicator from '../../../components/TypingIndicator'; 
import { useTranslation } from 'react-i18next';
// Assets
const sendIcon = require('../../../assets/icons/sendIcon.png');
const aiAvatar = require('../../../assets/images/chatAvatar.png');
const userAvatar = require('../../../assets/icons/userprofile.png');
const backIcon = require('../../../assets/icons/backIcon.png');

interface ChatDetailScreenProps {
  route: any; // From React Navigation
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route }) => {
  const { sessionId } = route.params || {};
  const { colors } = useThemeStore(s => s.theme);
  const navigation = useNavigation<any>();
    const { t } = useTranslation(); 
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets(); // Hook to get safe area dimensions



    // --- 2. Get user data from Auth Store ---
  const { user } = useAuthStore();
  const {
    activeSession,
    isSendingMessage,
    isLoadingHistory,
    sendMessage,
    getSessionHistory,
  } = useChatStore();

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (sessionId) {
      getSessionHistory(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    setDisplayMessages(activeSession?.messages || []);
  }, [activeSession]);

  useEffect(() => {
    if (displayMessages.length > 0) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [displayMessages]);
console.log(user)
  const handleSend = () => {
    if (inputText.trim() && !isSendingMessage) {
      const trimmedText = inputText.trim();

      const tempUserMessage: ChatMessage = {
        _id: `temp_${Date.now()}`,
        role: 'user_message',
        content: trimmedText,
        timestamp: new Date().toISOString(),
      };

      setDisplayMessages(prev => [...prev, tempUserMessage]);

      const payload = {
        message: trimmedText,
        session_id: activeSession?.session?.session_id || null,
        preferences: {
          response_style: 'mystical',
   focus_areas: [
            'love',
            'career',
            'health',
            'finance',
            'spirituality',
            'relationships',
            'personal_growth',
            'future_planning'
          ],
        },
      };

      sendMessage(payload);
      setInputText('');
    }
  };

  const renderMessage = (item: ChatMessage, index: number) => {
    const isUserMessage = item.role === 'user_message';
    return (
      <View
        key={item._id || `msg-${index}`}
        style={[
          styles.messageRow,
          isUserMessage ? styles.userMessageRow : styles.aiMessageRow,
        ]}
      >
        {!isUserMessage && (
          <Image source={aiAvatar} style={styles.messageAvatar} />
        )}
        <View style={styles.messageContent}>
          <View
            style={[
              styles.messageBubble,
              isUserMessage ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        </View>
        {isUserMessage && (
           <Image
            source={
              user?.profile_image?.url
                ? { uri: user.profile_image.url }
                : userAvatar
            }
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  };

  const headerHeight = 60;

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              source={backIcon}
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
             {activeSession?.session?.title || t('chat_screen_title')}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
     
        >
          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {isLoadingHistory ? (
              <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : displayMessages.length > 0 ? (
              <>
                {displayMessages.map(renderMessage)}
             {isSendingMessage && (
  <View style={styles.aiMessageRow}>
    <Image source={aiAvatar} style={styles.messageAvatar} />
    <View style={styles.typingIndicator}>
      <TypingIndicator />
    </View>
  </View>
)}
              </>
            ) : (
              <View style={styles.centeredContent}>
                <Image source={aiAvatar} style={styles.mainAvatar} />
                 <Text style={styles.emptyTitle}>{t('chat_detail_how_can_i_help')}</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
      placeholder={t('chat_detail_placeholder')}
              placeholderTextColor="#8A8A8D"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} disabled={isSendingMessage}>
              <Image source={sendIcon} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1 },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 10 : 8,
    marginBottom: 10,
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
  headerTitleWrap: {
    maxWidth: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
  },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainAvatar: { width: 80, height: 80, marginBottom: 16 },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: Fonts.cormorantSCBold,
  },
  // --- FIX for Keyboard Gap ---
  // The ScrollView now takes up all available space, and the input is a sibling.
  messagesContainer: {
    flexGrow: 1, // Important: Allows the content to grow and push the container
    justifyContent: 'flex-end', // Pushes messages to the bottom initially
    paddingHorizontal: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  aiMessageRow: { justifyContent: 'flex-start' },
  userMessageRow: { justifyContent: 'flex-end' },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageContent: { maxWidth: '75%' },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  aiBubble: { backgroundColor: '#2F2B3B', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#4A3F50', borderBottomRightRadius: 4 },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A3F50',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 5,
    marginHorizontal: 15,
    marginTop: 10, 
    borderWidth:1,
    borderColor:'#D9B699',
    marginBottom:20
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginRight: 10,
    fontFamily: Fonts.aeonikRegular,
  },
  sendIcon: { width: 32, height: 32 },
typingIndicator: {
  backgroundColor: '#2F2B3B',
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 12,
  alignSelf: 'flex-start',
  borderBottomLeftRadius: 4, // bubble jaisa look dene ke liye
},
});

