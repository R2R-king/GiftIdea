import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const mockResponses = [
  "Я могу предложить подарок для разных случаев. Для кого вы ищете подарок?",
  "Отлично! А по какому случаю вы хотите сделать подарок?",
  "Бюджет подарка имеет значение. В каком ценовом диапазоне вы рассматриваете подарок?",
  "Спасибо за информацию! Вот несколько идей, которые могут вам подойти: букет цветов с шоколадными конфетами, парфюмерный набор, ювелирное украшение или подарочный сертификат на СПА-процедуры.",
  "Еще я могу предложить персонализированный фотоальбом, билеты в театр или на концерт, подписку на стриминговый сервис или набор натуральной косметики."
];

export default function GiftAssistantScreen() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Привет! Я помогу подобрать идеальный подарок. Расскажите, для кого вы ищете подарок?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    // Добавляем сообщение пользователя
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Симулируем ответ ассистента с небольшой задержкой
    setTimeout(() => {
      const responseIndex = Math.min(
        messages.filter(m => !m.isUser).length,
        mockResponses.length - 1
      );
      
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: mockResponses[responseIndex],
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => 
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.valentinePink} />
              <Text style={styles.typingText}>Ассистент печатает...</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Введите сообщение..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send
                size={20}
                color={inputText.trim() ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"}
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  typingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: '#1E293B',
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.valentinePink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 8, 68, 0.5)',
  },
}); 