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
      sessionsPagination.current_page < sessionsPagination.total_pages
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
      return <ActivityIndicator color="#FFFFFF" style={{ marginTop: 30 }} />;
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
    height: 56,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D9B699',
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
  },
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
