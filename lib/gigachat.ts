import { GigaChat, detectImage } from 'gigachat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Ключ API GigaChat - в реальном приложении лучше хранить в .env файле
const GIGACHAT_API_KEY = 'ваш_ключ_авторизации';

// Инициализация клиента GigaChat
const gigaChat = new GigaChat({
  credentials: GIGACHAT_API_KEY,
});

/**
 * Генерирует изображение на основе названия события
 * @param eventName Название события
 * @returns URL изображения, сохраненного локально
 */
export async function generateEventImage(eventName: string): Promise<string> {
  try {
    // Формируем промпт для генерации изображения
    const prompt = `Нарисуй красивую иллюстрацию для события "${eventName}". Изображение должно быть ярким, красочным и подходить для мобильного приложения.`;
    
    // Отправляем запрос к API GigaChat
    const response = await gigaChat.chat({
      messages: [
        {
          role: "system",
          content: "Ты — талантливый художник, специализирующийся на создании красивых иллюстраций для событий и праздников"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      function_call: 'auto',
    });
    
    // Получаем контент из ответа
    const content = response.choices[0]?.message.content || '';
    
    // Извлекаем идентификатор изображения из ответа
    const detectedImage = detectImage(content);
    if (!detectedImage || !detectedImage.uuid) {
      throw new Error('Не удалось получить идентификатор изображения');
    }
    
    // Скачиваем изображение по идентификатору
    const image = await gigaChat.getImage(detectedImage.uuid);
    
    // Генерируем уникальное имя файла на основе даты и названия события
    const fileName = `event_${Date.now()}_${eventName.replace(/\s+/g, '_').toLowerCase()}.jpg`;
    
    // Путь к директории для сохранения изображений
    const imageDir = `${FileSystem.documentDirectory}images/`;
    const filePath = `${imageDir}${fileName}`;
    
    // Проверяем существование директории и создаем, если нужно
    const dirInfo = await FileSystem.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    }
    
    // Сохраняем изображение локально
    await FileSystem.writeAsStringAsync(filePath, image.content, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Сохраняем информацию об изображении в AsyncStorage
    await saveImageInfo(fileName, eventName);
    
    // Возвращаем URI изображения
    return filePath;
  } catch (error) {
    console.error('Ошибка при генерации изображения:', error);
    throw error;
  }
}

/**
 * Сохраняет информацию об изображении в AsyncStorage
 * @param fileName Имя файла изображения
 * @param eventName Название события
 */
async function saveImageInfo(fileName: string, eventName: string): Promise<void> {
  try {
    // Получаем текущий список изображений из AsyncStorage
    const storedImages = await AsyncStorage.getItem('eventImages');
    const eventImages = storedImages ? JSON.parse(storedImages) : {};
    
    // Добавляем информацию о новом изображении
    eventImages[eventName] = {
      fileName,
      createdAt: new Date().toISOString(),
      filePath: `${FileSystem.documentDirectory}images/${fileName}`,
    };
    
    // Сохраняем обновленный список
    await AsyncStorage.setItem('eventImages', JSON.stringify(eventImages));
  } catch (error) {
    console.error('Ошибка при сохранении информации об изображении:', error);
  }
}

/**
 * Получает URI изображения для события по его названию
 * @param eventName Название события
 * @returns URI изображения или null, если изображение не найдено
 */
export async function getEventImageUri(eventName: string): Promise<string | null> {
  try {
    const storedImages = await AsyncStorage.getItem('eventImages');
    if (!storedImages) return null;
    
    const eventImages = JSON.parse(storedImages);
    const imageInfo = eventImages[eventName];
    
    if (!imageInfo) return null;
    
    // Проверяем существование файла
    const fileInfo = await FileSystem.getInfoAsync(imageInfo.filePath);
    return fileInfo.exists ? imageInfo.filePath : null;
  } catch (error) {
    console.error('Ошибка при получении URI изображения:', error);
    return null;
  }
} 