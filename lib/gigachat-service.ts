import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Global warnings disabled
// @ts-ignore
console.ignoredYellowBox = ['Warning: ...'];
// @ts-ignore
console.disableYellowBox = true;

export type GigaChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
};

export type GigaChatResponse = {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

class GigaChatService {
  // Set the backend URL based on platform
  private backendUrl: string;
  private token: string | null = null;
  
  constructor() {
    this.backendUrl = this.determineBackendUrl();
    console.log('GigaChat service initialized with backend URL:', this.backendUrl);
    
    // Запрос токена при инициализации сервиса
    this.refreshToken().catch(err => {
      console.warn('Failed to get initial token:', err);
    });
  }
  
  /**
   * Determine the correct backend URL based on platform and environment
   */
  private determineBackendUrl(): string {
    // Web platform handling
    if (Platform.OS === 'web') {
      // For web, use the same host but different port
      const windowUrl = new URL(window.location.href);
      const port = '4000'; // Hardcoded backend port
      
      return `${windowUrl.protocol}//${windowUrl.hostname}:${port}`;
    }
    
    // For Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000';  // Special IP for Android emulator to access host
    }
    
    // For iOS or other devices
    return 'http://172.20.10.9:4000';
  }
  
  /**
   * Get or refresh GigaChat API token
   */
  private async refreshToken(): Promise<string> {
    try {
      console.log('Requesting new token from backend');
      
      const response = await fetch(`${this.backendUrl}/api/gigachat/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'GigaChat'
        }),
        ...(Platform.OS === 'web' ? { mode: 'cors', credentials: 'omit' } : {})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh error:', errorText);
        throw new Error(`Token error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Token received successfully');
      
      // Используем прямой доступ - запрос не требует токена
      return 'direct-access-authorized';
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }
  
  /**
   * Get current token or refresh if needed
   */
  private async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await this.refreshToken();
    }
    return this.token;
  }
  
  /**
   * Send messages to GigaChat API via our backend
   */
  public async sendMessage(messages: GigaChatMessage[]): Promise<GigaChatResponse> {
    try {
      console.log('Sending message to backend');
      
      // Получаем токен перед запросом
      const token = await this.getToken();
      
      const chatResponse = await fetch(`${this.backendUrl}/api/gigachat/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: messages,
          model: 'GigaChat',
          temperature: 0.7,
          max_tokens: 1500,
        }),
        // CORS options for web
        ...(Platform.OS === 'web' ? { mode: 'cors', credentials: 'omit' } : {})
      });
      
      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('Chat API error:', errorText);
        throw new Error(`Backend error (${chatResponse.status}): ${errorText}`);
      }
      
      const responseData = await chatResponse.json();
      console.log('Response received successfully');
      
      return responseData;
    } catch (error) {
      console.error('Error sending message to backend:', error);
      throw error;
    }
  }
  
  /**
   * Stream messages from GigaChat API via our backend
   */
  public async streamMessage(
    messages: GigaChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('Requesting streaming response from backend');
      
      // Получаем токен перед запросом
      const token = await this.getToken();
      
      // Используем прямой endpoint без потоковой передачи
      const response = await fetch(`${this.backendUrl}/api/gigachat/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: messages,
          model: 'GigaChat',
          temperature: 0.7,
          max_tokens: 1500,
        }),
        // CORS options for web
        ...(Platform.OS === 'web' ? { mode: 'cors', credentials: 'omit' } : {})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stream API error:', errorText);
        throw new Error(`Backend stream error (${response.status}): ${errorText}`);
      }
      
      // Обработка обычного ответа как потокового (имитация)
      const responseData = await response.json();
      
      if (responseData.choices && responseData.choices.length > 0) {
        const content = responseData.choices[0].message.content;
        
        // Симуляция потока - разбиваем текст на части
        const chunkSize = 15; // Количество символов в части
        let processed = 0;
        
        const simulateChunk = () => {
          if (processed < content.length) {
            const end = Math.min(processed + chunkSize, content.length);
            const chunk = content.substring(processed, end);
            onChunk(chunk);
            processed = end;
            
            // Имитируем задержку для реалистичной потоковой передачи
            setTimeout(simulateChunk, 50);
          } else {
            console.log('Stream completed successfully');
            onComplete();
          }
        };
        
        // Запускаем симуляцию
        simulateChunk();
      } else {
        // Если ответ не содержит сообщения
        console.error('Invalid response format:', responseData);
        onError(new Error('Invalid response format from backend'));
      }
    } catch (error) {
      console.error('Error in stream message:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Get the current backend URL (for debugging)
   */
  public getBackendUrl(): string {
    return this.backendUrl;
  }
  
  /**
   * Check backend connectivity
   */
  public async checkBackendStatus(): Promise<boolean> {
    try {
      console.log('Checking backend connectivity at:', this.backendUrl);
      
      const response = await fetch(`${this.backendUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Важно для веб-версии - без этого CORS может блокировать
        mode: 'cors',
        credentials: 'omit'
      });
      
      const result = response.ok;
      console.log('Backend status check response:', result);
      return result;
    } catch (error) {
      console.error('Backend connectivity check failed:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Проверка, связана ли ошибка с CORS (только для веб-версии)
      if (Platform.OS === 'web' && error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('Возможная ошибка CORS. Убедитесь, что сервер разрешает запросы с этого источника.');
      }
      
      return false;
    }
  }
}

// Export singleton instance
export const gigaChatService = new GigaChatService();
export default gigaChatService; 