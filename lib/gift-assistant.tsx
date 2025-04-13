import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { statusBarHeight } from '../utils/constants';
import { RootStackParamList } from '../navigation/types';
import gigaChatService, { GigaChatMessage } from './gigachat-service';
import MockResponses from './mock-responses';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  error?: boolean;
};

type GiftAssistantScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GiftAssistant'>;

// System message to guide the AI
const SYSTEM_MESSAGE: GigaChatMessage = {
  role: 'system',
  content: 
    'You are a gift suggestion assistant. Help users find gift ideas based on information they provide about the recipient. ' +
    'Ask follow-up questions to gather more details if needed. Provide 3-5 specific gift suggestions with brief explanations. ' +
    'Suggestions should be practical, thoughtful, and within a reasonable price range unless specified otherwise. ' +
    'Be friendly, conversational, and enthusiastic.'
};

export const GiftAssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help you find the perfect gift. Tell me about the person you\'re shopping for.',
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<GiftAssistantScreenNavigationProp>();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check backend connectivity when component mounts
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const isAvailable = await gigaChatService.checkBackendStatus();
      return isAvailable;
    } catch (error) {
      console.error('Error checking backend connection:', error);
      return false;
    }
  };

  const handleRetry = async (messageId: string) => {
    // Find the failed message
    const failedMessageIndex = messages.findIndex(msg => msg.id === messageId);
    if (failedMessageIndex === -1) return;
    
    // Get the user message that preceded this failed response
    let userMessageIndex = failedMessageIndex - 1;
    while (userMessageIndex >= 0 && !messages[userMessageIndex].isUser) {
      userMessageIndex--;
    }
    
    if (userMessageIndex < 0) {
      // If we can't find a user message, show an error
      Alert.alert('Error', 'Could not find the original message to retry.');
      return;
    }
    
    // Remove the failed message
    const updatedMessages = [...messages];
    updatedMessages.splice(failedMessageIndex, 1);
    
    // Add a new loading message
    const newId = Date.now().toString();
    updatedMessages.push({
      id: newId,
      text: '',
      isUser: false,
      isLoading: true,
    });
    
    setMessages(updatedMessages);
    
    // Try connecting to the backend
    const isBackendAvailable = await checkBackendConnection();
    if (!isBackendAvailable) {
      // If backend is still not available, use local response
      handleUseLocalResponse(newId, messages[userMessageIndex].text);
      return;
    }
    
    // Try streaming the message again
    const history = prepareMessagesForAPI(messages.slice(0, failedMessageIndex));
    streamMessageFromGigaChat(history, newId);
  };

  const handleUseLocalResponse = (messageId: string, userMessage: string) => {
    // Use a local mock response when the backend is unavailable
    const mockResponse = MockResponses.getResponseFor(userMessage);
    
    // Update the loading message with the mock response
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: mockResponse, isLoading: false } 
          : msg
      )
    );

    // Scroll to the bottom of the chat
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const prepareMessagesForAPI = (messageHistory: Message[]): GigaChatMessage[] => {
    // Start with the system message
    const apiMessages: GigaChatMessage[] = [SYSTEM_MESSAGE];
    
    // Convert chat messages to the API format
    messageHistory.forEach(msg => {
      if (msg.text.trim() !== '') {
        apiMessages.push({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        });
      }
    });
    
    return apiMessages;
  };

  const streamMessageFromGigaChat = async (messageHistory: GigaChatMessage[], messageId: string) => {
    try {
      setIsConnecting(true);
      
      // Start with empty message
      let accumulatedText = '';
      
      // Define callbacks for streaming
      const handleProgress = (chunk: string) => {
        accumulatedText += chunk;
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: accumulatedText, isLoading: false } 
              : msg
          )
        );
        
        // Scroll to the latest message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      };
      
      const handleComplete = () => {
        setIsTyping(false);
        setIsConnecting(false);
        
        // Final update to ensure message is marked as completed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: accumulatedText, isLoading: false } 
              : msg
          )
        );
      };
      
      const handleError = (error: Error) => {
        console.error('Error streaming message:', error);
        setIsTyping(false);
        setIsConnecting(false);
        
        // Mark message as error
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  text: 'Sorry, I couldn\'t connect to the server. Tap to retry or continue with basic suggestions.',
                  isLoading: false,
                  error: true
                } 
              : msg
          )
        );
      };
      
      // Start streaming
      await gigaChatService.streamMessage(
        messageHistory,
        handleProgress,
        handleComplete,
        handleError
      );
      
    } catch (error) {
      console.error('Error in streamMessageFromGigaChat:', error);
      setIsTyping(false);
      setIsConnecting(false);
      
      // Mark message as error
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                text: 'Sorry, I couldn\'t connect to the server. Tap to retry or continue with basic suggestions.',
                isLoading: false,
                error: true
              } 
            : msg
        )
      );
    }
  };

  const sendMessageToGigaChat = async (text: string) => {
    if (text.trim() === '') return;

    // Add user message
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: userMessageId,
        text,
        isUser: true,
      },
      {
        id: assistantMessageId,
        text: '',
        isUser: false,
        isLoading: true,
      },
    ]);

    setInputText('');
    setIsTyping(true);

    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Check if backend is available
      const isBackendAvailable = await checkBackendConnection();
      
      if (!isBackendAvailable) {
        // If backend is not available, use local response
        handleUseLocalResponse(assistantMessageId, text);
        return;
      }
      
      // Prepare message history
      const messageHistory = prepareMessagesForAPI([
        ...messages,
        { id: userMessageId, text, isUser: true }
      ]);
      
      // Stream the response
      streamMessageFromGigaChat(messageHistory, assistantMessageId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Update the assistant message to show the error
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
                error: true,
              }
            : msg
        )
      );
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isLoading) {
      return (
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          <ActivityIndicator size="small" color="#888" />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.assistantBubble,
          item.error ? styles.errorBubble : null,
        ]}
        disabled={!item.error}
        onPress={() => item.error && handleRetry(item.id)}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        {item.error && (
          <Text style={styles.retryText}>Tap to retry</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Gift Assistant</Text>
          {isConnecting && (
            <ActivityIndicator size="small" color="#888" style={styles.headerLoader} />
          )}
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessageToGigaChat(inputText)}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => sendMessageToGigaChat(inputText)}
            disabled={inputText.trim() === '' || isTyping}
          >
            <FontAwesome 
              name="send" 
              size={20} 
              color={inputText.trim() === '' || isTyping ? '#ccc' : '#4FC3F7'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? statusBarHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerLoader: {
    marginLeft: 10,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBubble: {
    backgroundColor: '#4FC3F7',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  retryText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    fontStyle: 'italic',
  },
  typingText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GiftAssistantScreen; 