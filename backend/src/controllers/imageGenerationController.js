const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Конфигурация API
const GIGACHAT_API_URL = process.env.GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
const GIGACHAT_API_KEY = process.env.GIGACHAT_API_KEY || 'MWMzMzgzYjctZGU4Zi00YmE1LTk4ZTktOWIyY2EzMDIxNDllOjRlNDU0YWY2LWQxNGEtNGRjNi1hYWU5LTdmNzJhYWM1ZTc0MQ==';

// Проверяем наличие API-ключа
const isApiKeySet = GIGACHAT_API_KEY && GIGACHAT_API_KEY !== 'demo_key' && GIGACHAT_API_KEY !== 'your_gigachat_api_key_here';

// Функция-заглушка для тестирования без реального API
function getMockImageData() {
  try {
    // Пытаемся прочитать заглушку изображения из файловой системы
    const mockImagePath = path.join(__dirname, '../../assets/mock_event_image.jpg');
    
    if (fs.existsSync(mockImagePath)) {
      const imageBuffer = fs.readFileSync(mockImagePath);
      return imageBuffer.toString('base64');
    } else {
      console.log('Файл с заглушкой изображения не найден:', mockImagePath);
      // Возвращаем очень маленькое base64-закодированное изображение как заглушку
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    }
  } catch (error) {
    console.error('Ошибка при чтении заглушки изображения:', error);
    // Возвращаем очень маленькое base64-закодированное изображение как заглушку
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  }
}

/**
 * Генерирует изображение через GigaChat API
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.generateImage = async (req, res) => {
  try {
    console.log('Получен запрос на генерацию изображения:', req.body);
    
    const { eventName, prompt } = req.body;

    if (!eventName || !prompt) {
      console.error('Отсутствуют обязательные параметры');
      return res.status(400).json({ error: 'Название события и промпт обязательны' });
    }

    console.log(`Начинаем генерацию изображения для события "${eventName}"`);
    
    // Если API-ключ не установлен, используем заглушку
    if (!isApiKeySet) {
      console.log('GIGACHAT_API_KEY не установлен, используем заглушку изображения');
      
      const mockImageBase64 = getMockImageData();
      
      return res.status(200).json({
        imageData: mockImageBase64,
        eventName,
        mock: true
      });
    }
    
    // Продолжаем с реальным API, если ключ установлен
    // Шаг 1: Получаем токен для доступа к GigaChat API
    console.log('Получаем токен доступа...');
    const authToken = await getAuthToken();
    console.log('Токен получен успешно');

    // Шаг 2: Генерируем изображение через GigaChat API
    console.log('Отправляем запрос на генерацию изображения...');
    const imageId = await generateImageViaGigaChat(prompt, authToken);
    console.log(`Получен ID изображения: ${imageId}`);

    // Шаг 3: Скачиваем изображение
    console.log('Скачиваем изображение...');
    const imageBytes = await downloadImage(imageId, authToken);
    console.log(`Изображение скачано, размер: ${imageBytes.length} байт`);

    // Шаг 4: Кодируем изображение в base64
    const imageBase64 = Buffer.from(imageBytes).toString('base64');
    console.log('Изображение успешно закодировано в base64');

    const response = {
      imageData: imageBase64,
      eventName
    };
    
    console.log('Отправляем ответ клиенту');
    return res.status(200).json(response);
  } catch (error) {
    console.error('Ошибка при генерации изображения:', error);
    return res.status(500).json({ 
      error: error.message || 'Неизвестная ошибка при генерации изображения'
    });
  }
};

/**
 * Получает токен авторизации для GigaChat API
 * @returns {Promise<string>} Токен авторизации
 */
async function getAuthToken() {
  try {
    const response = await axios.post(
      `${GIGACHAT_API_URL}/oauth/token`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GIGACHAT_API_KEY}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Ошибка при получении токена авторизации:', error.response?.data || error.message);
    throw new Error('Не удалось получить токен авторизации для GigaChat API');
  }
}

/**
 * Генерирует изображение через GigaChat API
 * @param {string} prompt - Текстовое описание для генерации изображения
 * @param {string} authToken - Токен авторизации
 * @returns {Promise<string>} ID сгенерированного изображения
 */
async function generateImageViaGigaChat(prompt, authToken) {
  try {
    const response = await axios.post(
      `${GIGACHAT_API_URL}/chat/completions`,
      {
        model: 'GigaChat',
        messages: [
          {
            role: 'system',
            content: 'Ты — талантливый художник, специализирующийся на создании красивых иллюстраций для событий и праздников'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        function_call: 'auto'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('Ответ от GigaChat:', content);
    
    // Извлекаем ID изображения с помощью cheerio (парсинг HTML)
    const $ = cheerio.load(content);
    const imageId = $('img').attr('src');

    if (!imageId) {
      throw new Error('ID изображения не найден в ответе');
    }

    return imageId;
  } catch (error) {
    console.error('Ошибка при генерации изображения через GigaChat:', error.response?.data || error.message);
    throw new Error('Не удалось сгенерировать изображение через GigaChat API');
  }
}

/**
 * Скачивает изображение по его ID
 * @param {string} imageId - ID изображения
 * @param {string} authToken - Токен авторизации
 * @returns {Promise<Buffer>} Данные изображения
 */
async function downloadImage(imageId, authToken) {
  try {
    const response = await axios.get(
      `${GIGACHAT_API_URL}/files/${imageId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/jpg'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Ошибка при скачивании изображения:', error.response?.data || error.message);
    throw new Error('Не удалось скачать изображение из GigaChat API');
  }
} 