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
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Gift, RefreshCw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import gigaChatService, { GigaChatMessage } from '@/lib/gigachat-service';
import { v4 as uuidv4 } from 'uuid';
import textFormatter, { formatTextForDisplay } from '@/lib/text-formatter';

const { STYLE_MARKER } = textFormatter;

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function GiftAssistantScreen() {
  // Получаем параметры из URL
  const { occasion, prefilledPrompt } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageRef = useRef<GigaChatMessage[]>([]);
  const initialPromptRef = useRef<boolean>(true);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: 'Привет! Я помогу подобрать идеальный подарок. Расскажите, для кого вы ищете подарок?',
        isUser: false,
        timestamp: new Date(),
      }]);
      
      // Если есть предзаполненный промпт, установить его в поле ввода
      if (prefilledPrompt && typeof prefilledPrompt === 'string' && initialPromptRef.current) {
        const decodedPrompt = decodeURIComponent(prefilledPrompt);
        setInputText(decodedPrompt);
        initialPromptRef.current = false;
        
        // Фокус на input поле и автоматическая отправка через короткое время
        setTimeout(() => {
          const userMessage: MessageType = {
            id: Date.now().toString(),
            text: decodedPrompt,
            isUser: true,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, userMessage]);
          setInputText('');
          
          // Небольшая задержка перед запросом к ИИ
          setTimeout(() => {
            if (useStreaming) {
              streamMessageFromGigaChat();
            } else {
              sendMessageToGigaChat();
            }
          }, 500);
        }, 1000);
      }
    }
  }, [prefilledPrompt]);

  // Force scroll to bottom whenever messages change
  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: false});
      }
    }, 50);
  }, [messages, streamingMessage]);

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
        
        // Also scroll to bottom when keyboard hides
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }, 100);
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Convert our app messages to GigaChat format
  const prepareMessagesForAPI = (): GigaChatMessage[] => {
    // Add system message to guide the AI
    const systemMessage: GigaChatMessage = {
      role: 'system',
      content: 'Ты — помощник по выбору подарков. Твоя задача — помочь пользователю подобрать идеальный подарок. Проанализируй первое сообщение пользователя и извлеки из него информацию о поле, возрасте, увлечениях и поводе для подарка. Не спрашивай информацию, которую пользователь уже предоставил. Задавай только уточняющие вопросы об информации, которая еще не была предоставлена: возраст, пол, увлечения, повод для подарка, бюджет. На основе полученной информации предлагай конкретные идеи подарков. Отвечай кратко и информативно. Используй дружелюбный тон. Предлагай несколько вариантов подарков с разными ценовыми категориями.'
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
          
          // Force scroll after each chunk update
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }, 10);
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

  // Enhance the message rendering for form-like content
  const renderMessage = ({ item }: { item: MessageType }) => {
    // Special handling for assistant messages that might contain forms
    const isFormContent = !item.isUser && (
      item.text.includes(':') || 
      (item.text.includes('1.') && item.text.includes('2.'))
    );

    // Apply additional formatting to form text if needed
    let formattedText = item.text;
    
    // Render dividers for sections in assistant messages
    const renderDividers = isFormContent && !item.isUser && !item.id.startsWith('streaming-');

    return (
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.assistantBubble,
          item.id.startsWith('streaming-') && styles.streamingBubble,
          isFormContent && styles.formContent,
        ]}
      >
        {!item.isUser && (
          <View style={styles.assistantAvatarContainer}>
            <View style={styles.assistantAvatar}>
              <Gift size={16} color="#FFFFFF" />
            </View>
          </View>
        )}
        <View style={[
          item.isUser ? styles.userTextContainer : styles.assistantTextContainer,
          isFormContent && styles.formContainer,
        ]}>
          {renderDividers && (
            <View style={styles.divider} />
          )}
          
          {renderFormattedText(
            formatTextForDisplay(formattedText),
            [
              item.isUser ? styles.userMessageText : styles.assistantMessageText,
              isFormContent && styles.formText
            ]
          )}
          
          {renderDividers && (
            <View style={styles.divider} />
          )}
          
          {item.id.startsWith('streaming-') && (
            <View style={styles.streamingIndicator}>
              <ActivityIndicator size="small" color={item.isUser ? "#FFFFFF" : COLORS.valentinePink} />
            </View>
          )}
        </View>
        {item.isUser && (
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatarPlaceholder} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.valentinePink, '#FF4775']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Помощник с подарками</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={allMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messageList,
              { 
                paddingBottom: keyboardVisible ? Math.max(keyboardHeight * 0.7, 120) : SPACING.xl 
              }
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            bounces={false}
            alwaysBounceVertical={false}
            scrollEventThrottle={16}
            initialNumToRender={allMessages.length}
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
                <RefreshCw size={14} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Повторить</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Введите сообщение..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isTyping}
                placeholderTextColor="#A0A0A0"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
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
                  size={18}
                  color={inputText.trim() && !isTyping ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: '#F8F9FB',
  },
  messageList: {
    flexGrow: 1,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    maxWidth: '95%',
  },
  formContent: {
    maxWidth: '100%',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    paddingLeft: 0,
  },
  assistantAvatarContainer: {
    width: 36,
    height: 36,
    marginRight: 8,
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.valentinePink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarContainer: {
    width: 36,
    height: 36,
    marginLeft: 8,
  },
  userAvatarPlaceholder: {
    width: 28,
    height: 28,
  },
  userTextContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.valentinePink,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  assistantTextContainer: {
    padding: SPACING.md,
    paddingLeft: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    maxWidth: '90%',
    paddingTop: 0,
  },
  formContainer: {
    paddingTop: 4,
    paddingRight: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  userMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  assistantMessageText: {
    fontSize: FONTS.sizes.md,
    color: '#333333',
    lineHeight: 24,
  },
  formText: {
    lineHeight: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    marginVertical: SPACING.sm,
  },
  inputWrapper: {
    backgroundColor: '#F8F9FB',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.sm,
    marginLeft: 4,
  },
  streamingBubble: {
    opacity: 0.9,
    borderColor: COLORS.valentinePink,
    borderWidth: 1,
  },
  streamingIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  boldText: {
    fontWeight: '700',
    color: '#222',
    fontSize: FONTS.sizes.md,
  },
}); 