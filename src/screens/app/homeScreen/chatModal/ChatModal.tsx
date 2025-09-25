import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Platform,
} from 'react-native';

import { useThemeStore } from '../../../../store/useThemeStore';
import GradientBox from '../../../../components/GradientBox';
import { Fonts } from '../../../../constants/fonts';

// Assets
const closeIcon = require('../../../../assets/icons/close.png');
const sendIcon = require('../../../../assets/icons/sendIcon.png');
const avatarIcon = require('../../../../assets/images/chatAvatar.png');

interface ChatModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isVisible, onClose }) => {
  const { colors } = useThemeStore((s) => s.theme);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <GradientBox
          colors={[colors.black, colors.bgBox]}
          style={styles.modalContainer}
        >
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image source={closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            <Image source={avatarIcon} style={styles.avatar} />
            <Text style={styles.title}>Portal Paraíso AI Guide</Text>
            <Text style={styles.subtitle}>
              Ask me about your day, your stars, or your path.
            </Text>
          </View>

          {/* Input Field at the bottom */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type something..."
              placeholderTextColor="#8A8A8D"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity onPress={handleSend}>
              <Image source={sendIcon} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </GradientBox>
      </View>
    </Modal>
  );
};

export default ChatModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
   
    minHeight: 480,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9B699',

    justifyContent: 'space-between', 
    flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  closeIcon: {
    width: 32,
    height: 32,
  },
  contentArea: {
   
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    paddingBottom: 20, 
  },
  avatar: {
    width: 140,
    height: 140,
marginBottom: 4,
  
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontFamily: Fonts.cormorantSCBold,
    textAlign: 'center',
  },
  subtitle: {
    color: '#D9B699',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
  },
  inputContainer: {

    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A3F50',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
  },
  sendIcon: {
    width: 30,
    height: 30,
  },
});