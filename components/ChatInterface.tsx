import React, { useState, useRef, useEffect, ReactElement } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ListRenderItem,
  Keyboard,
  Dimensions,
  EmitterSubscription,
  TouchableWithoutFeedback,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import textFormatter, { formatTextForDisplay } from '@/lib/text-formatter';

const { STYLE_MARKER } = textFormatter;

export type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  streamingMessage?: string;
  placeholderText?: string;
  messageIcon?: React.ReactNode;
  renderCustomMessage?: (message: ChatMessage) => ReactElement;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  streamingMessage = '',
  placeholderText = 'Введите сообщение...',
  messageIcon,
  renderCustomMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Handle keyboard show/hide events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        
        // Scroll to bottom with a slight delay to ensure layout is updated
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }, 100);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle send message
  const handleSend = () => {
    if (inputText.trim() === '' || isTyping) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  // Scroll when streaming message updates
  useEffect(() => {
    if (streamingMessage && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [streamingMessage]);

  // Combine regular messages with streaming message if present
  const allMessages = React.useMemo(() => {
    const result = [...messages];
    
    if (streamingMessage) {
      result.push({
        id: 'streaming-' + Date.now(),
        text: streamingMessage,
        isUser: false,
        timestamp: new Date(),
      });
    }
    
    return result;
  }, [messages, streamingMessage]);

  // Function to render formatted text with bold styling
  const renderFormattedText = (text: string, style: any) => {
    if (!text) return null;
    
    // Split by our custom markers
    const parts = text.split(new RegExp(`(${STYLE_MARKER.BOLD_START}|${STYLE_MARKER.BOLD_END})`, 'g'));
    
    // Remove empty parts and markers
    const filteredParts = parts.filter(part => 
      part !== '' && 
      part !== STYLE_MARKER.BOLD_START && 
      part !== STYLE_MARKER.BOLD_END
    );
    
    // Track if we're inside a bold section
    let isBold = false;
    
    // Render each part with appropriate styling
    return filteredParts.map((part, index) => {
      // We need to toggle the bold state for each marker we pass
      const currentPart = (
        <Text 
          key={index}
          style={[style, isBold ? styles.boldText : null]}
        >
          {part}
        </Text>
      );
      
      // Toggle the state for the next part
      isBold = !isBold;
      
      return currentPart;
    });
  };

  // Default message renderer
  const defaultRenderMessage = (item: ChatMessage): ReactElement => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.assistantBubble,
        item.id.startsWith('streaming-') && styles.streamingBubble,
      ]}
    >
      {!item.isUser && messageIcon && (
        <View style={styles.assistantIconContainer}>
          {messageIcon}
        </View>
      )}
      <View style={item.isUser ? styles.userTextContainer : styles.assistantTextContainer}>
        {renderFormattedText(
          formatTextForDisplay(item.text),
          item.isUser ? styles.userMessageText : styles.assistantMessageText
        )}
        {item.id.startsWith('streaming-') && (
          <View style={styles.streamingIndicator}>
            <ActivityIndicator size="small" color={COLORS.valentinePink} />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.chatWrapper, { flex: 1 }]}>
          <FlatList
            ref={flatListRef}
            data={allMessages}
            renderItem={({ item }) => {
              return renderCustomMessage ? renderCustomMessage(item) : defaultRenderMessage(item);
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messageList,
              { 
                flexGrow: 1, 
                justifyContent: allMessages.length === 0 ? 'center' : 'flex-start',
                paddingBottom: keyboardVisible ? Math.max(keyboardHeight * 0.7, 120) : SPACING.md 
              }
            ]}
            showsVerticalScrollIndicator={true}
            onContentSizeChange={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
          
          {/* Input area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={placeholderText}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isTyping}
              placeholderTextColor="#999"
              onSubmitEditing={handleSend}
              onFocus={() => {
                // When input gets focus, scroll to bottom after a short delay
                setTimeout(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                  }
                }, 200);
              }}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
            >
              <Send
                size={20}
                color={inputText.trim() && !isTyping ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatWrapper: {
    flex: 1,
    position: 'relative',
  },
  messageList: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  messageBubble: {
    maxWidth: '90%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.valentinePink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: SPACING.xs,
    width: '100%',
  },
  streamingBubble: {
    borderColor: COLORS.valentinePink,
    borderWidth: 1,
  },
  assistantIconContainer: {
    width: 36,
    height: '100%',
    backgroundColor: 'rgba(255, 8, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
  },
  userTextContainer: {
    padding: SPACING.md,
  },
  assistantTextContainer: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  userMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  assistantMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#1E293B',
    lineHeight: 22,
  },
  streamingIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.valentinePink,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 8, 68, 0.5)',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default ChatInterface; 