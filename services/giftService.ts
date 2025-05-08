import apiClient from './api';

// Интерфейс для подарка из Java-бэкенда
export interface Gift {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
}

// Сервис для работы с подарками через API
class GiftService {
  // Получить все подарки
  async getAllGifts(): Promise<Gift[]> {
    try {
      return await apiClient.get('/gifts');
    } catch (error) {
      console.error('Ошибка при получении списка подарков:', error);
      throw error;
    }
  }

  // Получить подарок по ID
  async getGiftById(id: number): Promise<Gift> {
    try {
      return await apiClient.get(`/gifts/${id}`);
    } catch (error) {
      console.error(`Ошибка при получении подарка с ID ${id}:`, error);
      throw error;
    }
  }

  // Получить подарки по категории
  async getGiftsByCategory(category: string): Promise<Gift[]> {
    try {
      return await apiClient.get(`/gifts/category/${encodeURIComponent(category)}`);
    } catch (error) {
      console.error(`Ошибка при получении подарков категории ${category}:`, error);
      throw error;
    }
  }

  // Получить избранные подарки
  async getFavoriteGifts(): Promise<Gift[]> {
    try {
      return await apiClient.get('/gifts/favorites');
    } catch (error) {
      console.error('Ошибка при получении избранных подарков:', error);
      throw error;
    }
  }

  // Поиск подарков по имени
  async searchGiftsByName(keyword: string): Promise<Gift[]> {
    try {
      return await apiClient.get(`/gifts/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      console.error(`Ошибка при поиске подарков по ключевому слову "${keyword}":`, error);
      throw error;
    }
  }

  // Получить подарки по максимальной цене
  async getGiftsByMaxPrice(maxPrice: number): Promise<Gift[]> {
    try {
      return await apiClient.get(`/gifts/price?maxPrice=${maxPrice}`);
    } catch (error) {
      console.error(`Ошибка при получении подарков с ценой до ${maxPrice}:`, error);
      throw error;
    }
  }

  // Переключить статус "избранное"
  async toggleFavorite(id: number): Promise<Gift> {
    try {
      return await apiClient.put(`/gifts/${id}/favorite`, {});
    } catch (error) {
      console.error(`Ошибка при изменении статуса "избранное" для подарка с ID ${id}:`, error);
      throw error;
    }
  }

  // Конвертировать подарок из Java-бэкенда в формат для фронтенда
  convertToProductFormat(gift: Gift) {
    return {
      id: gift.id?.toString() || '',
      name: gift.name,
      subtitle: gift.description,
      description: gift.description,
      features: [gift.category],
      price: gift.price.toFixed(2),
      image: gift.imageUrl,
      occasion: 'all', // Маппинг категорий можно настроить при необходимости
      budget: gift.price < 30 ? 'cheap' : gift.price < 100 ? 'medium' : 'expensive',
      type: 'emotional',
      location: 'delivery',
      rating: 4.5,
      isFavorite: gift.isFavorite
    };
  }
}

export default new GiftService(); 