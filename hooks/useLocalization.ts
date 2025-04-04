import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../translations/en';
import ru from '../translations/ru';
import { mockEventsRu, mockPartnersRu } from '../data/mockDataRu';
import { mockEvents, mockPartners } from '../data/mockData';

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
    en,
    ru,
  };
  
  // Функция для получения перевода
  const t = (key: string): string => {
    return getTranslation(translations[locale], key);
  };
  
  // Получить локализованные данные для mockData
  const getLocalizedData = () => {
    if (locale === 'ru') {
      return {
        events: mockEventsRu,
        partners: mockPartnersRu
      };
    }
    
    return {
      events: mockEvents,
      partners: mockPartners
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