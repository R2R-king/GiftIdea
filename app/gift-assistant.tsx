import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Gift, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import gigaChatService, { GigaChatMessage } from '@/lib/gigachat-service';
import { v4 as uuidv4 } from 'uuid';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function GiftAssistantScreen() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageRef = useRef<GigaChatMessage[]>([]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: 'Привет! Я помогу подобрать идеальный подарок. Расскажите, для кого вы ищете подарок?',
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Convert our app messages to GigaChat format
  const prepareMessagesForAPI = (): GigaChatMessage[] => {
    // Add system message to guide the AI
    const systemMessage: GigaChatMessage = {
      role: 'system',
      content: 'Ты — помощник по выбору подарков. Твоя задача — помочь пользователю подобрать идеальный подарок. Задавай уточняющие вопросы о человеке, для которого ищут подарок: возраст, пол, увлечения, повод для подарка, бюджет. На основе этой информации предлагай конкретные идеи подарков. Отвечай кратко, но информативно. Используй дружелюбный, но профессиональный тон. Всегда старайся предложить несколько вариантов подарков с разными ценовыми категориями.'
    };

    // Convert app messages to GigaChat format
    const apiMessages: GigaChatMessage[] = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));

    // Add the current user input if any
    if (inputText.trim()) {
      apiMessages.push({
        role: 'user',
        content: inputText
      });
    }

    // Add system message at the beginning
    return [systemMessage, ...apiMessages];
  };

  // Handle retry when connection fails
  const handleRetry = () => {
    setIsError(false);
    setIsRetrying(true);
    
    if (useStreaming) {
      streamMessageFromGigaChat();
    } else {
      sendMessageToGigaChat();
    }
  };

  // Fallback function for when server is unavailable
  const handleUseLocalResponse = () => {
    setIsError(false);
    setIsRetrying(false);
    
    // Simple fallback for demonstration
    setTimeout(() => {
      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: "Извините, сервер недоступен, но я могу предложить несколько универсальных идей подарков: подарочный сертификат в популярный магазин, набор качественного чая/кофе, смарт-гаджет, книгу бестселлер, или персонализированный предмет с памятной надписью.",
        isUser: false,
        timestamp: new Date(),
      };
      
      addMessage(newMessage);
      setIsTyping(false);
    }, 1000);
  };

  // Функция для безопасного добавления сообщения
  const addMessage = (message: MessageType) => {
    setMessages(prev => [...prev, message]);
  };

  // Stream messages from GigaChat API
  const streamMessageFromGigaChat = async () => {
    setIsTyping(true);
    setStreamingMessage('');
    setIsError(false);
    
    const apiMessages = prepareMessagesForAPI();
    lastMessageRef.current = apiMessages;
    
    try {
      // Check if backend is available
      const isConnected = await gigaChatService.checkBackendStatus();
      if (!isConnected) {
        console.log('Backend is not available, using local response');
        handleUseLocalResponse();
        return;
      }
      
      let accumulatedText = '';
      
      // Use the streaming method from our service
      await gigaChatService.streamMessage(
        apiMessages,
        // On chunk handler
        (chunk) => {
          accumulatedText += chunk;
          setStreamingMessage(accumulatedText);
        },
        // On complete handler
        () => {
          // Add the complete message to our list
          const newMessage: MessageType = {
            id: Date.now().toString(),
            text: accumulatedText,
            isUser: false,
            timestamp: new Date(),
          };
            
          addMessage(newMessage);
          setStreamingMessage('');
          setIsTyping(false);
          setIsRetrying(false);
        },
        // On error handler
        (error) => {
          console.error('Error with streaming message:', error);
          setIsTyping(false);
          setIsRetrying(false);
          setIsError(true);
          
          // Only show alert if not retrying
          if (!isRetrying) {
            Alert.alert(
              'Ошибка соединения',
              'Не удалось получить ответ от сервера. Проверьте подключение к интернету.',
              [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Повторить', onPress: handleRetry }
              ]
            );
          }
        }
      );
    } catch (error) {
      console.error('Error setting up streaming message:', error);
      setIsTyping(false);
      setIsRetrying(false);
      setIsError(true);
      
      if (!isRetrying) {
        Alert.alert(
          'Ошибка соединения',
          'Не удалось получить ответ от сервера. Проверьте подключение к интернету.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Повторить', onPress: handleRetry }
          ]
        );
      }
    }
  };

  // Send message to GigaChat API using the standard option
  const sendMessageToGigaChat = async () => {
    setIsTyping(true);
    setIsError(false);
    
    const apiMessages = prepareMessagesForAPI();
    lastMessageRef.current = apiMessages;
    
    try {
      // Check if backend is available
      const isConnected = await gigaChatService.checkBackendStatus();
      if (!isConnected) {
        console.log('Backend is not available, using local response');
        handleUseLocalResponse();
        return;
      }
      
      // Use the new sendMessage method
      const response = await gigaChatService.sendMessage(apiMessages);
      const assistantMessage = response.choices[0].message.content;

      // Add the assistant's response to our messages
      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: assistantMessage,
        isUser: false,
        timestamp: new Date(),
      };
      
      addMessage(newMessage);
      setIsTyping(false);
      setIsRetrying(false);
    } catch (error) {
      console.error('Error sending message to GigaChat:', error);
      setIsTyping(false);
      setIsRetrying(false);
      setIsError(true);
      
      // Only show alert if not retrying
      if (!isRetrying) {
        Alert.alert(
          'Ошибка соединения',
          'Не удалось получить ответ от сервера. Проверьте подключение к интернету.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Повторить', onPress: handleRetry }
          ]
        );
      }
    }
  };

  const handleSend = () => {
    if (inputText.trim() === '' || isTyping) return;
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    
    // Clear input
    const messageToSend = inputText;
    setInputText('');
    
    // Use streaming or standard response based on setting
    if (useStreaming) {
      streamMessageFromGigaChat();
    } else {
      sendMessageToGigaChat();
    }
  };

  // Render all messages including streaming message if available
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

  const renderMessage = ({ item }: { item: MessageType }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.assistantIconContainer}>
          <Gift size={18} color="#FF0844" />
        </View>
      )}
      <View style={item.isUser ? styles.userTextContainer : styles.assistantTextContainer}>
        <Text style={item.isUser ? styles.userMessageText : styles.assistantMessageText}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Заголовок */}
      <LinearGradient
        colors={[COLORS.valentinePink, COLORS.valentineLightPink]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Помощник с подарками</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={allMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messageList,
              { flexGrow: 1, justifyContent: 'flex-start' }
            ]}
            showsVerticalScrollIndicator={true}
            // Простой автоматический скролл при изменении данных
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            // Нет другой настройки для скролла - только этот метод автоскролла
          />
          
          {/* Показываем индикатор набора текста */}
          {isTyping && !streamingMessage && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.valentinePink} />
              <Text style={styles.typingText}>Ассистент печатает...</Text>
            </View>
          )}
          
          {/* Показываем кнопку повторной попытки */}
          {isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Не удалось получить ответ</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Повторить</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Введите сообщение..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isTyping}
              placeholderTextColor="#999"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  messageList: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.valentinePink,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...SHADOWS.small,
  },
  assistantIconContainer: {
    width: 36,
    height: '100%',
    backgroundColor: 'rgba(255, 8, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    padding: SPACING.md,
  },
  assistantTextContainer: {
    padding: SPACING.md,
    flex: 1,
  },
  userMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#FFFFFF',
  },
  assistantMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#1E293B',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  typingText: {
    marginLeft: SPACING.xs,
    color: '#666',
    fontSize: FONTS.sizes.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: FONTS.sizes.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.valentinePink,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    marginLeft: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyChatText: {
    color: '#999',
    fontSize: FONTS.sizes.md,
  },
}); 