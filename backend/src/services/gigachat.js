import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ваши учетные данные
const CREDENTIALS = process.env.GIGACHAT_CREDENTIALS || "MWMzMzgzYjctZGU4Zi00YmE1LTk4ZTktOWIyY2EzMDIxNDllOjRlNDU0YWY2LWQxNGEtNGRjNi1hYWU5LTdmNzJhYWM1ZTc0MQ==";

// Create an axios instance with SSL verification disabled
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Функция для получения токена
async function getGigaChatToken() {
  try {
    const requestId = uuidv4();
    
    const response = await axiosInstance({
      method: 'POST',
      url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': requestId,
        'Authorization': `Basic ${CREDENTIALS}`,
      },
      data: 'scope=GIGACHAT_API_PERS'
    });
    
    return {
      accessToken: response.data.access_token,
      expiresAt: response.data.expires_at
    };
  } catch (error) {
    console.error('Error getting GigaChat token:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Функция для отправки запроса к модели
async function sendChatRequest(messages, model = "GigaChat-Max") {
  try {
    const tokenData = await getGigaChatToken();
    
    const response = await axiosInstance({
      method: 'POST',
      url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.accessToken}`,
      },
      data: {
        model: model,
        messages: messages,
        temperature: 0.7,
        top_p: 0.7,
        stream: false
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending chat request:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Пример использования
async function testGigaChat() {
  try {
    const messages = [
      { role: "user", content: "Привет, как дела?" }
    ];
    
    const response = await sendChatRequest(messages);
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('GigaChat test failed:', error);
    return { error: error.message };
  }
}

// Экспорт функций
export {
  getGigaChatToken,
  sendChatRequest,
  testGigaChat
}; 