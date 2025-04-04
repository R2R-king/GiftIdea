import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../translations/en';
import ru from '../translations/ru';

// Определяем типы для переводов
type TranslationKeys = keyof typeof en;
type Translations = typeof en;

// Доступные языки
export type Language = 'en' | 'ru';

// Контекст локализации
type LocalizationContextType = {
  t: (key: string) => string;
  locale: Language;
  setLocale: (lang: Language) => Promise<void>;
  isRTL: boolean;
};

// Создаем контекст
const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

// Доступные переводы
const translations: Record<Language, Translations> = {
  en,
  ru,
};

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

// Провайдер локализации
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleInternal] = useState<Language>('en');
  
  // Загрузка языка при инициализации
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('locale');
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
          setLocaleInternal(savedLocale as Language);
        }
      } catch (error) {
        console.error('Failed to load locale from storage', error);
      }
    };
    
    loadLocale();
  }, []);
  
  // Функция для изменения языка
  const setLocale = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('locale', lang);
      setLocaleInternal(lang);
      
      // В русском языке нет необходимости в RTL
      // Этот код может понадобиться в будущем при добавлении RTL языков
    } catch (error) {
      console.error('Failed to set locale', error);
    }
  };
  
  // Функция для получения перевода
  const t = (key: string): string => {
    return getTranslation(translations[locale], key);
  };
  
  const value = {
    t,
    locale,
    setLocale,
    isRTL: I18nManager.isRTL,
  };
  
  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Хук для использования локализации
export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LocalizationProvider');
  }
  
  return context;
}; 