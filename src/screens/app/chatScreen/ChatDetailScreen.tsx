import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
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
  route: any;
}

// Memoized message item component for better performance
const MessageItem: React.FC<{
  item: ChatMessage;
  isUserMessage: boolean;
  userAvatarUri: string | null;
}> = React.memo(({ item, isUserMessage, userAvatarUri }) => {
  const colors = useThemeStore(s => s.theme.colors);

  return (
    <View
      style={[
        styles.messageRow,
        isUserMessage ? styles.userMessageRow : styles.aiMessageRow,
      ]}
    >
      {!isUserMessage && (
        <View style={styles.aiAvatar}>
          <Image source={aiAvatar} style={styles.avatarImage} />
        </View>
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
        <View style={styles.messageAvatar}>
          <Image
            source={userAvatarUri ? { uri: userAvatarUri } : userAvatar}
            style={styles.avatarImage}
          />
        </View>
      )}
    </View>
  );
});

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route }) => {
  const { sessionId } = route.params || {};
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const { user } = useAuthStore(
    useShallow(state => ({
      user: state.user,
    })),
  );

  const {
    activeSession,
    isSendingMessage,
    isLoadingHistory,
    sendMessage,
    getSessionHistory,
  } = useChatStore(
    useShallow(state => ({
      activeSession: state.activeSession,
      isSendingMessage: state.isSendingMessage,
      isLoadingHistory: state.isLoadingHistory,
      sendMessage: state.sendMessage,
      getSessionHistory: state.getSessionHistory,
    })),
  );

  const displayMessages = useMemo(
    () => activeSession?.messages || [],
    [activeSession?.messages],
  );

  useEffect(() => {
    if (sessionId) {
      getSessionHistory(sessionId);
    }
  }, [sessionId, getSessionHistory]);

  useEffect(() => {
    if (displayMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayMessages.length]);

  const handleSend = useCallback(() => {
    if (inputText.trim() && !isSendingMessage) {
      const trimmedText = inputText.trim();

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
            'future_planning',
          ],
        },
      };

      sendMessage(payload);
      setInputText('');
    }
  }, [inputText, isSendingMessage, activeSession, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUserMessage = item.role === 'user_message';
      return (
        <MessageItem
          item={item}
          isUserMessage={isUserMessage}
          userAvatarUri={user?.profile_image?.url || null}
        />
      );
    },
    [user?.profile_image?.url],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item._id || '', []);

  const renderFooter = useCallback(() => {
    if (!isSendingMessage) return null;
    return (
      <View style={styles.aiMessageRow}>
        <View style={styles.aiAvatar}>
          <Image source={aiAvatar} style={styles.avatarImage} />
        </View>
        <View style={styles.typingIndicator}>
          <TypingIndicator />
        </View>
      </View>
    );
  }, [isSendingMessage]);

  const renderEmpty = useCallback(() => {
    if (isLoadingHistory) {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }
    return (
      <View style={styles.centeredContent}>
        <Image source={aiAvatar} style={styles.aiAvatar} />
        <Text style={styles.emptyTitle}>{t('chat_detail_how_can_i_help')}</Text>
      </View>
    );
  }, [isLoadingHistory, t]);

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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Messages Area - Using FlatList for better performance */}
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t('chat_detail_placeholder')}
              placeholderTextColor="#8A8A8D"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSendingMessage || !inputText.trim()}
            >
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  mainAvatar: { width: 80, height: 80, marginBottom: 16 },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: Fonts.cormorantSCBold,
    marginTop: 16,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    overflow: 'hidden',
  },
  aiAvatar: { width: 45, height: 45 },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    borderWidth: 1,
    borderColor: '#D9B699',
    marginBottom: 12,
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
    marginLeft: 6,
    backgroundColor: '#2F2B3B',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
});
