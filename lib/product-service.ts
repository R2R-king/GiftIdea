import { Product } from '../types/product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Ключи для локального хранилища
const STORAGE_KEYS = {
  PRODUCTS: 'local_products',
  PRODUCT_COUNTER: 'local_product_counter'
};

class ProductService {
  // Настройка URL бэкенда - важно указать полный URL с протоколом
  private baseUrl = 'http://localhost:8080/api/products';
  private isOnline = false;
  private localProducts: Product[] = [];
  private localIdCounter = 1000; // Начальное значение для локальных ID

  constructor() {
    // Автоматически исправляем URL, если мы на устройстве или эмуляторе
    if (__DEV__) {
      // На Android эмуляторе localhost это 10.0.2.2
      if (Platform.OS === 'android') {
        this.baseUrl = this.baseUrl.replace('localhost', '10.0.2.2');
      }
    }
    console.log(`API URL: ${this.baseUrl}`);
    // Инициализация сервиса
    this.init();
  }

  private async init() {
    try {
      // Проверяем соединение с сервером
      await this.checkServerConnection();
      // Загружаем локальные товары
      await this.loadLocalProducts();
    } catch (error) {
      console.error('Ошибка инициализации ProductService:', error);
    }
  }

  // Проверка соединения с сервером
  private async checkServerConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/ping`);
      this.isOnline = response.ok;
      console.log(`Соединение с бэкендом: ${this.isOnline ? 'доступно' : 'недоступно'}`);
    } catch (error) {
      this.isOnline = false;
      console.log('Работаем в оффлайн-режиме');
    }
  }

  // Загрузка локальных товаров из AsyncStorage
  private async loadLocalProducts() {
    try {
      const productData = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (productData) {
        this.localProducts = JSON.parse(productData);
      }
      
      const counterData = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_COUNTER);
      if (counterData) {
        this.localIdCounter = parseInt(counterData);
      }
    } catch (error) {
      console.error('Ошибка загрузки локальных товаров:', error);
    }
  }

  // Сохранение локальных товаров в AsyncStorage
  private async saveLocalProducts() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.localProducts));
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_COUNTER, this.localIdCounter.toString());
    } catch (error) {
      console.error('Ошибка сохранения локальных товаров:', error);
    }
  }

  // Получение следующего локального ID
  private getNextLocalId(): number {
    this.localIdCounter += 1;
    return this.localIdCounter;
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    try {
      console.log(`Поиск товаров: ${keyword}`);
      const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        console.warn(`Ошибка поиска товаров: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`Найдено товаров: ${data.length}`);
      return data;
    } catch (error) {
      console.error('Ошибка поиска товаров:', error);
      // Если возникла ошибка сети, возвращаем локальные товары
      const lowerKeyword = keyword.toLowerCase();
      return this.localProducts.filter(product => 
        product.name.toLowerCase().includes(lowerKeyword) || 
        product.description.toLowerCase().includes(lowerKeyword)
      );
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/category/${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        console.warn(`Ошибка получения товаров по категории: ${response.status}`);
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения товаров по категории:', error);
      return this.localProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      console.log(`Создание товара: ${product.name}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        console.warn(`Ошибка создания товара: ${response.status}`);
        // Создаем локальный товар в случае ошибки
        const localProduct: Product = {
          ...product,
          id: this.getNextLocalId()
        };
        this.localProducts.push(localProduct);
        await this.saveLocalProducts();
        console.log(`Создан локальный товар с ID: ${localProduct.id}`);
        return localProduct;
      }
      
      const createdProduct = await response.json();
      console.log(`Товар успешно создан в бэкенде, ID: ${createdProduct.id}`);
      return createdProduct;
    } catch (error) {
      console.error('Ошибка создания товара:', error);
      
      // В случае сетевой ошибки создаем локальный товар
      const localProduct: Product = {
        ...product,
        id: this.getNextLocalId()
      };
      this.localProducts.push(localProduct);
      await this.saveLocalProducts();
      console.log(`Создан локальный товар с ID: ${localProduct.id}`);
      return localProduct;
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      console.log(`Получение товара по ID: ${id}`);
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        console.warn(`Товар с ID ${id} не найден: ${response.status}`);
        // Ищем в локальных товарах
        const localProduct = this.localProducts.find(product => product.id === id);
        return localProduct || null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения товара:', error);
      // Ищем в локальных товарах
      const localProduct = this.localProducts.find(product => product.id === id);
      return localProduct || null;
    }
  }
}

export const productService = new ProductService();
export default productService; 