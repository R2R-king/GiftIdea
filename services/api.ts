import { Platform } from 'react-native';

// Базовый URL бэкенда в зависимости от платформы
// Android - используем 10.0.2.2, т.к. localhost в эмуляторе Android указывает на сам эмулятор
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api';
};

// Базовый класс для работы с API
class ApiClient {
  baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  // Общий метод для выполнения запросов
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Произошла ошибка при обращении к API');
      }

      const responseData = await response.json();
      return responseData.data; // Возвращаем только data из обертки ApiResponse
    } catch (error) {
      console.error('API ошибка:', error);
      throw error;
    }
  }

  // GET запрос
  get(endpoint: string, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST запрос
  post(endpoint: string, body: any, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  // PUT запрос
  put(endpoint: string, body: any, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  // DELETE запрос
  delete(endpoint: string, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Создаем экземпляр API-клиента для экспорта
const apiClient = new ApiClient();
export default apiClient; 