import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import { useUIStore } from '../../../store/useUiStore';

// Assets
const sendIcon = require('../../../assets/icons/sendIcon.png');
const aiAvatar = require('../../../assets/images/chatAvatar.png');
const userAvatar = require('../../../assets/icons/userprofile.png');


const initialMessages = [
  { id: '1', text: "What does today's ritual mean?", sender: 'user', timestamp: '8:15 PM' },
  {
    id: '2',
    text: "Today's ritual calls for candlelight. It means clarity and protection will guide you",
    sender: 'ai',
    timestamp: '8:15 PM',
  },
  { id: '3', text: 'Pull me a tarot card.', sender: 'user', timestamp: '8:15 PM' },
  {
    id: '4',
    text: 'You drew The Star a sign of hope, renewal, and trust in divine timing.',
    sender: 'ai',
    timestamp: '8:15 PM',
  },
    { id: '5', text: "What does today's ritual mean?", sender: 'user', timestamp: '8:15 PM' },
  {
    id: '6',
    text: "Today's ritual calls for candlelight. It means clarity and protection will guide you",
    sender: 'ai',
    timestamp: '8:15 PM',
  },
  { id: '7', text: 'Pull me a tarot card.', sender: 'user', timestamp: '8:15 PM' },
  {
    id: '8',
    text: 'You drew The Star a sign of hope, renewal, and trust in divine timing.',
    sender: 'ai',
    timestamp: '8:15 PM',
  },
];

const ChatScreen: React.FC = () => {
  const { colors } = useThemeStore((s) => s.theme);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const insets = useSafeAreaInsets();
const isKeyboardVisible = useUIStore(state => state.isKeyboardVisible);
  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Math.random().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');
    }
  };

  const renderMessage = (item: typeof initialMessages[0]) => {
    const isUserMessage = item.sender === 'user';
    return (
      <View
        key={item.id}
        style={[styles.messageRow, isUserMessage ? styles.userMessageRow : styles.aiMessageRow]}
      >
        {!isUserMessage && <Image source={aiAvatar} style={styles.messageAvatar} />}
        <View style={styles.messageContent}>
          <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        {isUserMessage && <Image source={userAvatar} style={styles.messageAvatar} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground
        source={require('../../../assets/images/backgroundImage.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 140 }} 
            showsVerticalScrollIndicator={false}
          >
            {/* --- Top Header --- */}
            <View style={styles.topContentArea}>
              <Image source={aiAvatar} style={styles.mainAvatar} />
              <Text style={styles.title}>Portal Paraíso AI Guide</Text>
            </View>

            {/* --- Chat Messages --- */}
            {messages.map((msg) => renderMessage(msg))}
          </ScrollView>

          <View style={[styles.inputContainer, { bottom: isKeyboardVisible?insets.bottom+5:insets.bottom + 80 }]}
          
          >
            <TextInput
              style={styles.textInput}
              placeholder="Type something..."
              placeholderTextColor="#8A8A8D"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity onPress={handleSend}>
              <Image source={sendIcon} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageBackground: {
    flex: 1,
  },

  // --- TOP CONTENT ---
  topContentArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  mainAvatar: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.cormorantSCBold,
    textAlign: 'center',
  },

  // --- MESSAGES ---
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 6,
  },
  messageContent: {
    maxWidth: '75%',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#2F2B3B',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4A3F50',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.aeonikRegular,
    lineHeight: 20,
  },
  timestamp: {
    color: '#9E9E9E',
    fontSize: 11,
    fontFamily: Fonts.aeonikRegular,
    marginTop: 3,
    marginHorizontal: 6,
  },

  // --- INPUT ---
  inputContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
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
    fontSize: 15,
    marginRight: 10,
    fontFamily: Fonts.aeonikRegular,
  },
  sendIcon: {
    width:32,
    height: 32,
  },
});
