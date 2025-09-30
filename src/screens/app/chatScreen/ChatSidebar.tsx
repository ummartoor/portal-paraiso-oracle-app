import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useChatStore, ChatSession } from '../../../store/useChatStore';
import { Fonts } from '../../../constants/fonts';

const deleteIcon = require('../../../assets/icons/deleteIcon.png'); 
const addIcon = require('../../../assets/icons/newChatIcon.png'); 

interface ChatSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isVisible, onClose, onNewChat }) => {
  const {
    sessions,
    isLoadingSessions,
    getSessions,
    getSessionHistory,
    deleteSession,
    isDeletingSession,
  } = useChatStore();

  useEffect(() => {
    // Fetch sessions when the sidebar is opened for the first time or becomes visible
    if (isVisible) {
      getSessions();
    }
  }, [isVisible]);

  const handleSessionSelect = (sessionId: string) => {
    getSessionHistory(sessionId);
    onClose();
  };
  
  const handleDelete = (sessionId: string) => {
      deleteSession(sessionId);
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sidebarContainer}>
          <TouchableOpacity style={styles.newChatButton} onPress={onNewChat}>
            <Image source={addIcon} style={styles.icon} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {isLoadingSessions ? (
              <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
            ) : (
              sessions?.map((session: ChatSession) => (
                <TouchableOpacity
                  key={session.session_id}
                  style={styles.sessionItem}
                  onPress={() => handleSessionSelect(session.session_id)}
                >
                  <Text style={styles.sessionText} numberOfLines={1}>
                    {session.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(session.session_id)} disabled={isDeletingSession}>
                     <Image source={deleteIcon} style={styles.deleteIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ChatSidebar;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebarContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#1C1C1E',
    padding: 20,
    paddingTop: 60,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  icon: {
      width: 24,
      height: 24,
      marginRight: 10,
      tintColor: '#FFF',
  },
  newChatText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
  },
  sessionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionText: {
    color: '#EAEAEA',
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
    flex: 1,
  },
  deleteIcon: {
      width: 18,
      height: 18,
      tintColor: '#999',
      marginLeft: 10,
  }
});
