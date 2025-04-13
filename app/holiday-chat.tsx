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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Gift, RefreshCw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import gigaChatService, { GigaChatMessage } from '@/lib/gigachat-service';
import { v4 as uuidv4 } from 'uuid';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Иконки для различных праздников
const holidayIcons = {
  birthday: 'https://cdn-icons-png.flaticon.com/128/2290/2290755.png',
  newYear: 'https://cdn-icons-png.flaticon.com/128/1356/1356964.png',
  valentines: 'https://cdn-icons-png.flaticon.com/128/2589/2589175.png',
  wedding: 'https://cdn-icons-png.flaticon.com/128/2227/2227523.png',
  womensDay: 'https://cdn-icons-png.flaticon.com/128/2620/2620443.png',
  mensDay: 'https://cdn-icons-png.flaticon.com/128/3502/3502686.png',
  graduation: 'https://cdn-icons-png.flaticon.com/128/3976/3976631.png',
  housewarming: 'https://cdn-icons-png.flaticon.com/128/1067/1067457.png',
  anniversary: 'https://cdn-icons-png.flaticon.com/128/3152/3152806.png',
};

export default function HolidayChatScreen() {
  // Get holiday info from route params
  const params = useLocalSearchParams();
  const holidayId = params.holidayId as string || 'birthday';
  const holidayName = params.holidayName as string || 'День рождения';
  const promptTemplate = params.promptTemplate as string || '';
  const primaryColor = params.primaryColor as string || '#FF5E87';
  const secondaryColor = params.secondaryColor as string || '#FF0844';
  
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

  // Initialize chat with welcome message based on holiday
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: `Привет! Я помогу подобрать идеальный подарок на ${holidayName}. Расскажите, для кого вы ищете подарок?`,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [holidayName]);

  // Add this effect after other useEffects
  useEffect(() => {
    // This ensures that when streaming message updates, we scroll to the bottom
    if (streamingMessage && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [streamingMessage]);

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

  // Convert our app messages to GigaChat format with holiday-specific system prompt
  const prepareMessagesForAPI = (): GigaChatMessage[] => {
    // Use the holiday-specific prompt template
    const systemMessage: GigaChatMessage = {
      role: 'system',
      content: promptTemplate || `Ты — эксперт по подаркам на ${holidayName}. Помоги подобрать идеальный подарок для этого события. Задавай уточняющие вопросы о человеке, для которого ищут подарок, и о бюджете. Предлагай оригинальные и уместные подарки для этого праздника.`
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
    
    // Simple fallback for demonstration with holiday flavor
    setTimeout(() => {
      let localResponse = "";
      
      switch(holidayId) {
        case 'birthday':
          localResponse = "Для дня рождения я могу предложить: персонализированный фотоальбом, подарочный сертификат на впечатление, качественные наушники, стильный аксессуар или подписку на хобби.";
          break;
        case 'newYear':
          localResponse = "На Новый год хорошими подарками будут: уютный плед, набор для глинтвейна, настольная игра для компании, красивый ежедневник на новый год или подарочный набор любимых деликатесов.";
          break;
        case 'valentines':
          localResponse = "Для Дня святого Валентина подойдут: парные украшения, романтический ужин, фотосессия для пары, подарочный сертификат на СПА для двоих или персонализированный подарок с памятной датой.";
          break;
        default:
          localResponse = "Извините, сервер недоступен, но я могу предложить несколько универсальных идей подарков: подарочный сертификат в популярный магазин, набор качественного чая/кофе, смарт-гаджет, книгу бестселлер или персонализированный предмет.";
      }
      
      const newMessage: MessageType = {
        id: Date.now().toString(),
        text: localResponse,
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
    
    // Scroll to bottom with a slight delay to ensure layout is updated
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
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
          
          // Manually trigger scroll after each chunk update
          requestAnimationFrame(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          });
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
        item.id.startsWith('streaming-') && styles.streamingBubble,
      ]}
    >
      {!item.isUser && (
        <View style={[styles.assistantIconContainer, { backgroundColor: primaryColor }]}>
          <Gift size={18} color="#FFFFFF" />
        </View>
      )}
      <View style={item.isUser ? styles.userTextContainer : styles.assistantTextContainer}>
        <Text style={item.isUser ? styles.userMessageText : styles.assistantMessageText}>
          {item.text}
        </Text>
        {item.id.startsWith('streaming-') && (
          <View style={styles.streamingIndicator}>
            <ActivityIndicator size="small" color={primaryColor} />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Gradient Header with Holiday Icon */}
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: holidayIcons[holidayId as keyof typeof holidayIcons] || holidayIcons.birthday }}
              style={styles.holidayIcon}
            />
          </View>
          <Text style={styles.headerTitle}>
            Подбор подарка: {holidayName}
          </Text>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={allMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={true}
          onLayout={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Chat Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Напишите сообщение..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: primaryColor },
                (!inputText.trim() || isTyping) && styles.disabledSendButton
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holidayIcon: {
    width: 20,
    height: 20,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    marginVertical: 5,
    maxWidth: '90%',
    flexDirection: 'row',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  streamingBubble: {
    opacity: 0.8,
  },
  assistantIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 5,
  },
  userTextContainer: {
    backgroundColor: '#E2E8F0',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  assistantTextContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    flex: 1,
  },
  userMessageText: {
    color: '#1E293B',
    fontSize: 16,
  },
  assistantMessageText: {
    color: '#1E293B',
    fontSize: 16,
  },
  streamingIndicator: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
}); 