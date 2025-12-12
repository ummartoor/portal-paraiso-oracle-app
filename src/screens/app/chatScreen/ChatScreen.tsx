import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore, ChatSession } from '../../../store/useChatStore';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import GradientBox from '../../../components/GradientBox';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../../constants/design';
import { SkeletonListItem } from '../../../components/SkeletonLoader';
import Pressable from '../../../components/Pressable';

// Assets
const addIcon = require('../../../assets/icons/newChatIcon.png');
const menuIcon = require('../../../assets/icons/dotIcon.png');

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = useThemeStore(s => s.theme.colors);
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
  } = useChatStore(
    useShallow(state => ({
      sessions: state.sessions,
      isLoadingSessions: state.isLoadingSessions,
      getSessions: state.getSessions,
      createNewChat: state.createNewChat,
      deleteSession: state.deleteSession,
      loadMoreSessions: state.loadMoreSessions,
      isLoadingMoreSessions: state.isLoadingMoreSessions,
      sessionsPagination: state.sessionsPagination,
    })),
  );
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  // Fetch sessions every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      getSessions(1);
    }, [getSessions]),
  );

  const handleNewChat = useCallback(() => {
    createNewChat();
    navigation.navigate('ChatDetail');
  }, [createNewChat, navigation]);

  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      navigation.navigate('ChatDetail', { sessionId });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (sessionId: string) => {
      setMenuVisibleFor(null);
      deleteSession(sessionId);
    },
    [deleteSession],
  );

  // Handler for FlatList onEndReached
  const handleLoadMore = useCallback(() => {
    if (isLoadingMoreSessions || isLoadingSessions) return;

    if (
      sessionsPagination &&
      sessionsPagination.page < sessionsPagination.pages
    ) {
      loadMoreSessions();
    }
  }, [
    isLoadingMoreSessions,
    isLoadingSessions,
    sessionsPagination,
    loadMoreSessions,
  ]);

  // Renders the loading spinner at the bottom of the list
  const renderFooter = useCallback(() => {
    if (!isLoadingMoreSessions) return null;
    return <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 20 }} />;
  }, [isLoadingMoreSessions]);

  // Renders content when the list is empty
  const renderListEmpty = useCallback(() => {
    if (isLoadingSessions) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      );
    }
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
  }, [isLoadingSessions, sessions, t]);

  // renderItem for FlatList
  const renderSessionItem = useCallback(
    ({ item }: { item: ChatSession }) => (
      <Pressable
        key={item.session_id}
        style={[styles.sessionItem, Shadows.small]}
        hapticType="light"
        onPress={() => handleSessionSelect(item.session_id)}
      >
        <View style={styles.sessionTextContainer}>
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.last_message_at && (
            <Text style={styles.sessionSubtitle} numberOfLines={1}>
              {new Date(item.last_message_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        <Pressable
          style={styles.menuButton}
          hapticType="light"
          haptic={false}
          onPress={() =>
            setMenuVisibleFor(
              menuVisibleFor === item.session_id ? null : item.session_id,
            )
          }
        >
          <Image source={menuIcon} style={styles.menuIcon} />
        </Pressable>

        {menuVisibleFor === item.session_id && (
          <View style={[styles.dropdownMenu, Shadows.medium]}>
            <Pressable
              style={styles.dropdownItem}
              hapticType="medium"
              onPress={() => handleDelete(item.session_id)}
            >
              <Text style={styles.dropdownText}>{t('chat_delete_button')}</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    ),
    [handleSessionSelect, handleDelete, menuVisibleFor, t],
  );

  const keyExtractor = useCallback((item: ChatSession) => item.session_id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        {/* Fixed (non-scrollable) content */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t('chat_screen_title')}</Text>

          <Pressable hapticType="medium" onPress={handleNewChat}>
            <GradientBox
              colors={[
                colors.black || Colors.black,
                colors.bgBox || Colors.bgBox,
              ]}
              style={[styles.newChatButton, Shadows.medium]}
            >
              <Image source={addIcon} style={styles.addIcon} />
              <Text style={styles.newChatText}>{t('chat_start_new_chat')}</Text>
            </GradientBox>
          </Pressable>

          <Text style={styles.sessionListHeader}>{t('chat_recent_chats')}</Text>
        </View>

        {/* Scrollable content (FlatList) */}
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.scrollViewContent}
          ListEmptyComponent={renderListEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageBackground: { flex: 1 },
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
    height: 60,
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  addIcon: { width: 24, height: 24, marginRight: 12, tintColor: '#FFFFFF' },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.aeonikBold,
  },
  sessionListHeader: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.cormorantSCBold,
    marginTop: 40,
    marginBottom: 15,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  sessionItem: {
    backgroundColor: Colors.bgOverlay,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMuted,
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
    backgroundColor: Colors.bgBoxDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    zIndex: 100,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  dropdownItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  dropdownText: {
    color: Colors.error,
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
  },
  noSessionsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.bgOverlayLight,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
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
  skeletonContainer: {
    paddingTop: Spacing.md,
  },
});
