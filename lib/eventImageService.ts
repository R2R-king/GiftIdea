import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Базовый URL для API бэкенда
// В эмуляторе localhost указывает на устройство, а не на компьютер
// В Android эмуляторе можно использовать 10.0.2.2
// На реальном устройстве нужно использовать IP-адрес компьютера в той же сети
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    if (__DEV__) {
      // В эмуляторе Android используем 10.0.2.2 (специальный IP для localhost хоста)
      return 'http://10.0.2.2:4000';
    }
  } else if (Platform.OS === 'ios') {
    if (__DEV__) {
      // В эмуляторе iOS можно использовать localhost
      return 'http://localhost:4000';
    }
  }
  
  // Для реальных устройств используем IP-адрес компьютера
  return 'http://172.20.10.9:4000';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Генерирует URL для запроса к API бэкенда
 * @param path Путь к API
 * @returns Полный URL для запроса
 */
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

/**
 * Интерфейс для хранения информации об изображении
 */
interface ImageInfo {
  fileName: string;
  createdAt: string;
  filePath: string;
  eventName: string;
}

/**
 * Интерфейс для логирования процесса генерации
 */
interface ImageGenerationLog {
  id: string;
  timestamp: string;
  eventName: string;
  status: 'pending' | 'complete' | 'error';
  message: string;
}

/**
 * Логирует процесс генерации изображения
 */
async function logImageGeneration(eventName: string, status: 'pending' | 'complete' | 'error', message: string): Promise<void> {
  try {
    // Получаем текущие логи
    const storedLogs = await AsyncStorage.getItem('imageGenerationLogs');
    const logs: ImageGenerationLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    
    // Добавляем новый лог
    logs.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      eventName,
      status,
      message
    });
    
    // Ограничиваем количество логов (хранить последние 50)
    const trimmedLogs = logs.slice(0, 50);
    
    // Сохраняем логи
    await AsyncStorage.setItem('imageGenerationLogs', JSON.stringify(trimmedLogs));
    
    // Также выводим в консоль
    console.log(`[ImageGen] ${status.toUpperCase()} - ${eventName}: ${message}`);
  } catch (error) {
    console.error('Ошибка при логировании:', error);
  }
}

/**
 * Генерирует изображение для события через бэкенд и сохраняет локально
 * @param eventName Название события
 * @returns URI локально сохраненного изображения
 */
export async function generateAndSaveEventImage(eventName: string): Promise<string> {
  try {
    // Логируем начало процесса
    await logImageGeneration(eventName, 'pending', 'Начало генерации изображения');
    
    // Проверяем, есть ли уже сохраненное изображение для этого события
    const existingImage = await getEventImageUri(eventName);
    if (existingImage) {
      await logImageGeneration(eventName, 'complete', 'Использование существующего изображения');
      console.log(`Используем существующее изображение для события "${eventName}"`);
      return existingImage;
    }
    
    // Подготавливаем запрос к бэкенду
    const requestUrl = apiUrl('/api/generate-image');
    const requestBody = {
      eventName,
      prompt: `Нарисуй красивую иллюстрацию для события "${eventName}". Изображение должно быть ярким, красочным и подходить для мобильного приложения.`,
    };
    
    console.log(`Отправляем запрос на: ${requestUrl}`);
    console.log('Тело запроса:', JSON.stringify(requestBody));
    
    await logImageGeneration(eventName, 'pending', `Отправка запроса на ${requestUrl}`);

    // Формируем запрос к бэкенду для генерации изображения
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).catch(error => {
      console.error('Ошибка при выполнении fetch:', error);
      throw error;
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Текст ответа при ошибке:', responseText);
      
      const errorMessage = `Ошибка при запросе к API: ${response.status} ${response.statusText}. Ответ: ${responseText}`;
      await logImageGeneration(eventName, 'error', errorMessage);
      throw new Error(errorMessage);
    }

    // Получаем изображение как base64-строку
    await logImageGeneration(eventName, 'pending', 'Получение данных изображения от API');
    
    const responseText = await response.text();
    console.log('Первые 100 символов ответа:', responseText.substring(0, 100));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e: any) {
      console.error('Ошибка при парсинге JSON:', e);
      await logImageGeneration(eventName, 'error', `Ошибка при парсинге JSON: ${e}`);
      throw new Error(`Неверный формат ответа: ${e.message}`);
    }
    
    const imageBase64 = data.imageData; // Предполагаем, что бэкенд возвращает изображение в формате base64

    if (!imageBase64) {
      const errorMessage = 'Изображение не было получено от бэкенда';
      console.error(errorMessage, data);
      await logImageGeneration(eventName, 'error', errorMessage);
      throw new Error(errorMessage);
    }

    // Генерируем уникальное имя файла
    const fileName = `event_${Date.now()}_${eventName.replace(/\s+/g, '_').toLowerCase()}.jpg`;
    
    // Директория для хранения изображений
    const imageDir = `${FileSystem.documentDirectory}event_images/`;
    const filePath = `${imageDir}${fileName}`;
    
    // Проверяем и создаем директорию, если она не существует
    await logImageGeneration(eventName, 'pending', 'Подготовка к сохранению изображения');
    const dirInfo = await FileSystem.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    }
    
    // Сохраняем изображение в файловой системе
    await logImageGeneration(eventName, 'pending', 'Сохранение изображения в файловой системе');
    await FileSystem.writeAsStringAsync(filePath, imageBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Сохраняем информацию об изображении
    await saveImageInfo({
      fileName,
      createdAt: new Date().toISOString(),
      filePath,
      eventName,
    });
    
    await logImageGeneration(eventName, 'complete', `Изображение успешно сохранено по пути: ${filePath}`);
    console.log(`Изображение для события "${eventName}" успешно сохранено`);
    return filePath;
  } catch (error) {
    console.error('Ошибка при генерации и сохранении изображения:', error);
    await logImageGeneration(
      eventName, 
      'error', 
      `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    );
    // Возвращаем дефолтное изображение в случае ошибки
    return getDefaultEventImage(eventName);
  }
}

/**
 * Сохраняет информацию об изображении в AsyncStorage
 * @param imageInfo Информация об изображении
 */
async function saveImageInfo(imageInfo: ImageInfo): Promise<void> {
  try {
    // Получаем текущий список изображений
    const storedImages = await AsyncStorage.getItem('eventImages');
    const eventImages: Record<string, ImageInfo> = storedImages 
      ? JSON.parse(storedImages) 
      : {};
    
    // Добавляем информацию о новом изображении
    eventImages[imageInfo.eventName] = imageInfo;
    
    // Сохраняем обновленную информацию
    await AsyncStorage.setItem('eventImages', JSON.stringify(eventImages));
  } catch (error) {
    console.error('Ошибка при сохранении информации об изображении:', error);
  }
}

/**
 * Получает URI изображения для события
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
    if (fileInfo.exists) {
      return imageInfo.filePath;
    }
    
    // Если файл не существует, возвращаем null
    return null;
  } catch (error) {
    console.error('Ошибка при получении URI изображения:', error);
    return null;
  }
}

/**
 * Возвращает URI дефолтного изображения для события
 * @param eventName Название события
 * @returns URI дефолтного изображения
 */
function getDefaultEventImage(eventName: string): string {
  // В зависимости от названия события выбираем подходящее дефолтное изображение
  // В реальном приложении эти изображения должны быть включены в сборку
  if (eventName.toLowerCase().includes('день рождения')) {
    return 'asset:/birthday.jpg';
  } else if (eventName.toLowerCase().includes('свадьба')) {
    return 'asset:/wedding.jpg';
  } else if (eventName.toLowerCase().includes('новый год')) {
    return 'asset:/newyear.jpg';
  }
  
  // Если не нашли подходящее изображение, возвращаем общее дефолтное
  return 'asset:/event_default.jpg';
}

/**
 * Удаляет изображение события
 * @param eventName Название события
 * @returns true, если удаление прошло успешно
 */
export async function removeEventImage(eventName: string): Promise<boolean> {
  try {
    // Получаем информацию об изображениях
    const storedImages = await AsyncStorage.getItem('eventImages');
    if (!storedImages) return false;
    
    const eventImages = JSON.parse(storedImages);
    const imageInfo = eventImages[eventName];
    
    if (!imageInfo) return false;
    
    // Проверяем существование файла
    const fileInfo = await FileSystem.getInfoAsync(imageInfo.filePath);
    if (fileInfo.exists) {
      // Удаляем файл
      await FileSystem.deleteAsync(imageInfo.filePath);
    }
    
    // Удаляем информацию об изображении
    delete eventImages[eventName];
    await AsyncStorage.setItem('eventImages', JSON.stringify(eventImages));
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    return false;
  }
} 