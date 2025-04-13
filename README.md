# GiftIdea - чат-бот с подарками на базе GigaChat

Мобильное приложение для подбора идей подарков с использованием GigaChat API.

## Как запустить приложение

### Настройка бэкенда (обязательно)

1. Откройте файл `backend/.env` и установите корректные значения для:
   ```
   GIGACHAT_CLIENT_ID=ваш_клиент_id
   GIGACHAT_CLIENT_SECRET=ваш_клиент_секрет
   ```

2. Запустите бэкенд сервер:
   - Windows: Запустите `backend/run.bat`
   - macOS/Linux: 
     ```
     cd backend
     npm install
     npm run dev
     ```

3. Убедитесь, что бэкенд сервер запущен, открыв в браузере:
   ```
   http://localhost:3000/api/gigachat/status
   ```
   Вы должны увидеть ответ в формате JSON с информацией о статусе.

### Настройка мобильного приложения

1. Отредактируйте файл `lib/gigachat-service.ts` и установите правильный IP-адрес:
   ```typescript
   // Для реального устройства используйте IP вашего компьютера в локальной сети
   default: 'http://192.168.56.1:3000/api/gigachat', // Замените на ваш IP-адрес
   ```

   Вы можете узнать IP-адрес вашего компьютера:
   - Windows: `ipconfig` в командной строке
   - macOS/Linux: `ifconfig` в терминале

2. Установите зависимости и запустите приложение:
   ```
   npm install
   npm run dev
   ```

## Структура проекта

- `/app` - Экраны приложения
- `/components` - Переиспользуемые компоненты
- `/lib` - Утилиты и сервисы, включая интеграцию с GigaChat
- `/backend` - Бэкенд сервер для безопасного взаимодействия с GigaChat API

## Как работает интеграция с GigaChat

1. Мобильное приложение отправляет запрос на бэкенд-сервер
2. Бэкенд-сервер добавляет необходимые учетные данные и отправляет запрос в GigaChat API
3. Ответ от GigaChat API возвращается через бэкенд на мобильное приложение

Это обеспечивает безопасность учетных данных, которые не хранятся в мобильном приложении.

## Возможные проблемы и решения

### Ошибка "Network request failed"

1. Проверьте, что бэкенд-сервер запущен
2. Убедитесь, что IP-адрес в `lib/gigachat-service.ts` соответствует IP вашего компьютера
3. Проверьте, что мобильное устройство/эмулятор и компьютер находятся в одной сети
4. Проверьте, что порт 3000 не заблокирован файрволом

### Ошибка авторизации GigaChat

1. Проверьте корректность учетных данных в файле `backend/.env`
2. Убедитесь, что у вас активна подписка на GigaChat API

## Полезные ссылки

- [Документация GigaChat API](https://developers.sber.ru/docs/ru/gigachat/api/overview)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Chat Interface with Streaming Support

The application includes a reusable `ChatInterface` component that properly handles streaming messages from AI assistants. This fixes the common issue where streaming messages can cause the chat view to jump around or fail to show the latest content.

### Key Features

- **Streaming Text Display**: Properly displays and auto-scrolls during streaming text responses
- **Visual Indicators**: Shows when a message is being streamed with a visual indicator
- **Scroll Position Maintenance**: Maintains proper scroll position during updates
- **Reusable Component**: Can be used in any part of the application that needs chat functionality

### Usage

```tsx
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { Gift } from 'lucide-react-native';

// In your component
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isTyping, setIsTyping] = useState(false);
const [streamingMessage, setStreamingMessage] = useState('');

// Handle sending message
const handleSendMessage = (text: string) => {
  // Add user message
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text,
    isUser: true,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);
  
  // Trigger your streaming response here
  // During streaming, update the streamingMessage state
  // When complete, add the full response to messages
};

// In your render method
return (
  <ChatInterface
    messages={messages}
    onSendMessage={handleSendMessage}
    isTyping={isTyping}
    streamingMessage={streamingMessage}
    messageIcon={<Gift size={18} color="#FF0844" />}
    placeholderText="Введите сообщение..."
  />
);
``` 