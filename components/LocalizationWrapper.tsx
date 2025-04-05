import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, useLocalization } from '@/hooks/useLocalization';

// Создаем контекст для локализации
type LocalizationContextType = ReturnType<typeof useLocalization>;

const LocalizationContext = createContext<LocalizationContextType | null>(null);

// Хук для использования локализации в компонентах
export const useAppLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useAppLocalization must be used within a LocalizationWrapper');
  }
  return context;
};

// Компонент-обертка для локализации
export const LocalizationWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const localization = useLocalization();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (localization.initialized) {
      setIsLoading(false);
    }
  }, [localization.initialized]);

  if (isLoading) {
    // Можно добавить компонент загрузки здесь
    return null;
  }

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
}; 