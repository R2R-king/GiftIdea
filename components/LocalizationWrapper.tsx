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

const translations = {
  en: {
    filters: {
      search_placeholder: 'Search gifts...',
      clear: 'Clear',
      apply: 'Apply',
      occasions: {
        title: 'Occasion',
        birthday: 'Birthday',
        anniversary: 'Anniversary',
        new_year: 'New Year',
        valentine: 'Valentine\'s Day'
      },
      budgets: {
        title: 'Budget',
        cheap: 'Under $20',
        medium: '$20-$50',
        expensive: '$50+'
      },
      types: {
        title: 'Gift Type',
        emotional: 'Emotional',
        practical: 'Practical',
        experience: 'Experience',
        handmade: 'Handmade'
      },
      locations: {
        title: 'Location',
        all: 'All',
        nearby: 'Nearby',
        delivery: 'Delivery'
      }
    },
    tabs: {
      home: 'Home',
      shop: 'Shop',
      cart: 'Cart',
      favorites: 'Favorites',
      profile: 'Profile',
    },
    catalog: {
      title: 'Gift Catalog',
      subtitle: 'Find the perfect gift for any occasion',
      noProducts: 'No products match your filters. Try changing or clearing your filters.'
    },
    profile: {
      settings: 'Settings',
      orders: 'Orders',
      favorites: 'Favorites',
      notifications: 'Notifications',
      help: 'Help & Support',
      logout: 'Log Out',
      language: 'Language',
      accountSettings: 'Account Settings',
      valentineOffer: 'Holiday Special Offer',
      offerDescription: 'Get 30% off on festive gifts with code HOLIDAY2024',
      editProfile: 'Edit Profile',
      premiumMember: 'Premium Member',
      account: 'My Account',
      version: 'Version',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    },
    favorites: {
      title: 'My Favorites',
      subtitle: 'Your collection of favorite items',
      empty: 'Your Favorites is Empty',
      emptyDesc: 'Items added to your favorites will appear here',
      browse: 'Browse Products',
      removeTitle: 'Remove from Favorites',
      removeConfirm: 'Are you sure you want to remove this item from your favorites?',
      addedToCart: 'Item added to your cart!'
    },
    common: {
      cancel: 'Cancel',
      remove: 'Remove',
      add: 'Add',
      save: 'Save'
    }
  },
  ru: {
    filters: {
      search_placeholder: 'Поиск подарков...',
      clear: 'Сбросить',
      apply: 'Применить',
      occasions: {
        title: 'Повод',
        birthday: 'День рождения',
        anniversary: 'Годовщина',
        new_year: 'Новый год',
        valentine: 'День святого Валентина'
      },
      budgets: {
        title: 'Бюджет',
        cheap: 'До 2000₽',
        medium: '2000₽-5000₽',
        expensive: '5000₽+'
      },
      types: {
        title: 'Тип подарка',
        emotional: 'Эмоциональный',
        practical: 'Практичный',
        experience: 'Впечатление',
        handmade: 'Handmade'
      },
      locations: {
        title: 'Местоположение',
        all: 'Все',
        nearby: 'Рядом',
        delivery: 'Доставка'
      }
    },
    tabs: {
      home: 'Главная',
      shop: 'Магазин',
      cart: 'Корзина',
      favorites: 'Избранное',
      profile: 'Профиль',
    },
    catalog: {
      title: 'Каталог подарков',
      subtitle: 'Найдите идеальный подарок для любого случая',
      noProducts: 'По вашим фильтрам ничего не найдено. Попробуйте изменить или сбросить фильтры.'
    },
    profile: {
      settings: 'Настройки',
      orders: 'Заказы',
      favorites: 'Избранное',
      notifications: 'Уведомления',
      help: 'Помощь',
      logout: 'Выйти',
      language: 'Язык',
      accountSettings: 'Настройки аккаунта',
      valentineOffer: 'Праздничное предложение',
      offerDescription: 'Скидка 30% на подарки к праздникам с кодом ПРАЗДНИК2024',
      editProfile: 'Редактировать профиль',
      premiumMember: 'Премиум-аккаунт',
      account: 'Мой аккаунт',
      version: 'Версия',
      privacyPolicy: 'Политика конфиденциальности',
      termsOfService: 'Условия использования'
    },
    favorites: {
      title: 'Избранное',
      subtitle: 'Ваша коллекция избранных товаров',
      empty: 'Список избранного пуст',
      emptyDesc: 'Товары, добавленные в избранное, появятся здесь',
      browse: 'Просмотреть товары',
      removeTitle: 'Удалить из избранного',
      removeConfirm: 'Вы уверены, что хотите удалить этот товар из избранного?',
      addedToCart: 'Товар добавлен в корзину!'
    },
    common: {
      cancel: 'Отмена',
      remove: 'Удалить',
      add: 'Добавить',
      save: 'Сохранить'
    }
  }
}; 