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
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/design';
import { SkeletonMessage } from '../../../components/SkeletonLoader';
import Pressable from '../../../components/Pressable';

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
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      });
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
      const isUserMessage = item.role === 'user';
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

  const keyExtractor = useCallback(
    (item: ChatMessage, index: number) => item.message_id || `msg-${index}`,
    [],
  );

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
        <View style={styles.skeletonContainer}>
          <SkeletonMessage isUser={false} />
          <SkeletonMessage isUser={true} />
          <SkeletonMessage isUser={false} />
          <SkeletonMessage isUser={true} />
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hapticType="light"
          >
            <Image
              source={backIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
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
            removeClippedSubviews={false}
            maxToRenderPerBatch={15}
            updateCellsBatchingPeriod={100}
            initialNumToRender={20}
            windowSize={21}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder={t('chat_detail_placeholder')}
                placeholderTextColor={Colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline={true}
                textAlignVertical="top"
                maxLength={500}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={handleSend}
                disabled={isSendingMessage || !inputText.trim()}
                hapticType="medium"
                haptic={!isSendingMessage && !!inputText.trim()}
                style={[
                  styles.sendButton,
                  (isSendingMessage || !inputText.trim()) &&
                    styles.sendButtonDisabled,
                ]}
              >
                {isSendingMessage ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <View style={styles.sendButtonInner}>
                    <Image
                      source={sendIcon}
                      style={[
                        styles.sendIcon,
                        (isSendingMessage || !inputText.trim()) &&
                          styles.sendIconDisabled,
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </Pressable>
            </View>
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
    marginHorizontal: Spacing.lg,
    marginTop: Platform.OS === 'android' ? 10 : 8,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
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
    paddingHorizontal: Spacing.xl,
  },
  mainAvatar: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.borderSecondary,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.cormorantSCBold,
    marginTop: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xs,
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
    paddingRight: Spacing.xl,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
    paddingLeft: Spacing.xl,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderSecondary,
  },
  aiAvatar: {
    width: 45,
    height: 45,
    marginRight: Spacing.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  messageContent: {
    maxWidth: '75%',
    flexShrink: 1,
  },
  messageBubble: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  aiBubble: {
    backgroundColor: Colors.bgBoxDark,
    borderBottomLeftRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
    // Soft glow effect
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    // Enhanced shadow for user messages
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  messageText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.bgOverlay,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSecondary,
    ...Shadows.medium,
    minHeight: 56,
    maxHeight: 120,
    // Soft backdrop effect
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    marginRight: Spacing.md,
    fontFamily: Fonts.aeonikRegular,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    minHeight: 24,
    maxHeight: 100,
    lineHeight: 22,
    paddingTop: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryAlpha20,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Platform.OS === 'ios' ? 2 : 0,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.bgBoxDark,
    borderColor: Colors.borderMuted,
    opacity: 0.5,
  },
  sendButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },
  sendIconDisabled: {
    opacity: 0.4,
    tintColor: Colors.textMuted,
  },
  typingIndicator: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.bgBoxDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
    ...Shadows.small,
    minWidth: 60,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.lg,
  },
});
