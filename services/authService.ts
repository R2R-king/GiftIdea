import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы для данных авторизации
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

// Ключи для хранения данных в AsyncStorage
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

class AuthService {
  // Авторизация пользователя
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', data);
      await this.saveAuthData(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Регистрация пользователя
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', data);
      await this.saveAuthData(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Выход из аккаунта
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Ошибка при выходе из аккаунта:', error);
      throw error;
    }
  }

  // Проверка, авторизован ли пользователь
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Ошибка при проверке аутентификации:', error);
      return false;
    }
  }

  // Получение токена для запросов
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка при получении токена:', error);
      return null;
    }
  }

  // Получение данных пользователя
  async getUserData(): Promise<AuthResponse | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  }

  // Сохранение данных аутентификации
  private async saveAuthData(data: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка при сохранении данных аутентификации:', error);
      throw error;
    }
  }
}

export default new AuthService(); 