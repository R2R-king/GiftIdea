import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as en from '../translations/en';
import * as ru from '../translations/ru';
import { mockEventsRu, mockPartnersRu, mockProductsRu } from '../data/mockDataRu';
import { mockEvents, mockPartners, mockProducts } from '../data/mockData';

// Доступные языки
export type Language = 'en' | 'ru';

// Получение строки из переводов по ключу с поддержкой вложенных ключей
const getTranslation = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Возвращаем исходный путь, если перевод не найден
    }
  }
  
  return typeof result === 'string' ? result : path;
};

// Хук для использования локализации
export const useLocalization = () => {
  const [locale, setLocaleState] = useState<Language>('en');
  const [initialized, setInitialized] = useState(false);
  
  // Загрузка языка при инициализации
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('locale');
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
          setLocaleState(savedLocale as Language);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Failed to load locale from storage', error);
        setInitialized(true);
      }
    };
    
    loadLocale();
  }, []);
  
  // Функция для изменения языка
  const setLocale = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('locale', lang);
      setLocaleState(lang);
    } catch (error) {
      console.error('Failed to set locale', error);
    }
  };
  
  // Словари переводов
  const translations = {
    en: en.default,
    ru: ru.default,
  };
  
  // Функция для получения перевода
  const t = (key: string, ...args: any[]): string => {
    const translation = getTranslation(translations[locale], key);
    
    // Если есть аргументы для форматирования, применяем их
    if (args.length > 0 && typeof translation === 'string') {
      return translation.replace(/%s/g, (match, index) => {
        const argIndex = parseInt(index) || 0;
        return args[argIndex] !== undefined ? String(args[argIndex]) : match;
      });
    }
    
    return translation;
  };
  
  // Получить локализованные данные для mockData
  const getLocalizedData = () => {
    if (locale === 'ru') {
      return {
        events: mockEventsRu,
        partners: mockPartnersRu,
        products: mockProductsRu
      };
    }
    
    return {
      events: mockEvents,
      partners: mockPartners,
      products: mockProducts
    };
  };
  
  return {
    t,
    locale,
    setLocale,
    initialized,
    localizedData: getLocalizedData()
  };
}; 