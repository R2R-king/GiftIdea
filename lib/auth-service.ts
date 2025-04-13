import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { setUser, logout, updateUserProfile } from '@/store/slices/authSlice';

// Обновленный URL для локального доступа
const API_URL = 'http://10.0.2.2:3000/api/auth'; // Для Android эмулятора
// const API_URL = 'http://localhost:3000/api/auth'; // Для iOS
// const API_URL = 'http://192.168.1.X:3000/api/auth'; // Замените X на ваш локальный IP для тестирования на реальных устройствах

/**
 * Интерфейс для обновления профиля пользователя
 */
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

/**
 * Интерфейс для профиля пользователя
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  bio: string;
  roles: string[];
}

/**
 * Authentication service for handling login, registration and token management
 */
class AuthService {
  /**
   * Login user and store token
   */
  async login(username: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      await AsyncStorage.setItem('auth_token', data.token);
      
      store.dispatch(setUser({
        id: data.id.toString(),
        name: data.username,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        avatar: data.avatar || '',
      }));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          roles: ['user']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get profile');
      }

      const userData = await response.json();
      
      // Update Redux store with the latest profile data
      store.dispatch(updateUserProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        avatar: userData.avatar || '',
        email: userData.email || '',
      }));
      
      return userData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<UserProfile> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUserData = await response.json();
      
      // Update Redux store with the latest profile data
      store.dispatch(updateUserProfile({
        firstName: updatedUserData.firstName || '',
        lastName: updatedUserData.lastName || '',
        avatar: updatedUserData.avatar || '',
        email: updatedUserData.email || '',
      }));
      
      return updatedUserData;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated by token
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return false;
      }

      // Validate token with backend
      const response = await fetch(`${API_URL}/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        // Clear invalid token
        await this.logoutUser();
        return false;
      }

      // Load user data from token validation
      const userData = await response.json();
      store.dispatch(setUser({
        id: userData.id.toString(),
        name: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        avatar: userData.avatar || '',
      }));

      return true;
    } catch (error) {
      console.error('Auth validation error:', error);
      await this.logoutUser();
      return false;
    }
  }

  /**
   * Logout and clear token
   */
  async logoutUser() {
    try {
      await AsyncStorage.removeItem('auth_token');
      store.dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get auth token
   */
  async getToken() {
    return await AsyncStorage.getItem('auth_token');
  }
}

export default new AuthService(); 