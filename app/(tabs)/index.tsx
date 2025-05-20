import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  ImageBackground,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Button as NativeButton,
  StatusBar as RNStatusBar
} from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, ArrowUpRight, Search, Filter, Heart, Gift, Star, ShoppingCart, X, ArrowRight, Plus, Trash2 } from 'lucide-react-native';
import TabBarShadow from '@/components/TabBarShadow';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThematicCollections from '@/components/ThematicCollections';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import UpcomingEvents from '@/components/UpcomingEvents';
import { useTheme } from '@/components/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

// Define the theme colors - will be selected based on the current theme
const THEME = {
  light: {
    primary: '#6C63FF',
    primaryLight: '#8A84FF',
    secondary: '#FF6B6B',
    secondaryLight: '#FF8E8E',
    background: '#F5F8FF',
    cardBg: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    accent: '#00D2D3',
    gradientStart: '#6C63FF',
    gradientEnd: '#5A52E0',
  },
  dark: {
    primary: '#6C63FF', // Keep the purple accent
    primaryLight: '#8A84FF',
    secondary: '#FF6B6B',
    secondaryLight: '#FF8E8E',
    background: '#121212', // Dark background instead of blue
    cardBg: '#1A1A1A',
    text: '#FFFFFF',
    textLight: '#CCCCCC',
    accent: '#00D2D3',
    gradientStart: '#6C63FF',
    gradientEnd: '#5A52E0',
  }
};

// Иконки категорий из интернета
const categoryIcons = {
  all: 'https://cdn-icons-png.flaticon.com/128/4474/4474132.png',
  flowers: 'https://cdn-icons-png.flaticon.com/128/2518/2518224.png',
  chocolates: 'https://cdn-icons-png.flaticon.com/128/3361/3361005.png',
  jewellery: 'https://cdn-icons-png.flaticon.com/128/7627/7627448.png',
  cosmetics: 'https://cdn-icons-png.flaticon.com/128/10801/10801811.png',
};

// Популярные продукты
const popularProducts = [
  {
    id: '1',
    name: 'Букет "Розовая мечта"',
    price: '4 590 ₽',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589244158278-b417ffe2b893?w=400',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Набор шоколадных конфет',
    price: '1 290 ₽',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1549007994-cb8bed63823b?w=400',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Серебряное колье',
    price: '6 990 ₽',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    isFavorite: true,
  },
  {
    id: '4',
    name: 'Подарочный набор чая',
    price: '2 490 ₽',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Ароматическая свеча',
    price: '1 790 ₽',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
    isFavorite: false,
  },
  {
    id: '6',
    name: 'Подушка с фото',
    price: '2 190 ₽',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    isFavorite: false,
  },
  {
    id: '7',
    name: 'Браслет с шармами',
    price: '3 290 ₽',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400',
    isFavorite: false,
  },
  {
    id: '8',
    name: 'Набор косметики',
    price: '4 990 ₽',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400',
    isFavorite: false,
  },
  {
    id: '9',
    name: 'Мягкая игрушка',
    price: '1 490 ₽',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1563170261-90260910461d?w=400',
    isFavorite: false,
  },
  {
    id: '10',
    name: 'Подарочный набор вина',
    price: '5 990 ₽',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    isFavorite: false,
  },
];

// Создадим тип для событий
type HolidayEvent = {
  id: string;
  name: string;
  date: string;
  daysLeft: number;
  image: string;
  color: [string, string];
};

// Mock upcoming holidays
const getHolidays = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;

  // Get date objects for each holiday
  const valentinesDay = new Date(currentYear, 1, 14); // Feb 14
  if (valentinesDay < today) valentinesDay.setFullYear(nextYear);

  const womensDay = new Date(currentYear, 2, 8); // Mar 8
  if (womensDay < today) womensDay.setFullYear(nextYear);

  const defendersDay = new Date(currentYear, 1, 23); // Feb 23
  if (defendersDay < today) defendersDay.setFullYear(nextYear);

  const birthdayFriend = new Date(currentYear, 3, 15); // Apr 15
  if (birthdayFriend < today) birthdayFriend.setFullYear(nextYear);

  // Calculate days left for each holiday
  const calculateDaysLeft = (date: Date): number => {
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date to Russian format (e.g., "14 февраля")
  const formatDateToRussian = (date: Date): string => {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Create holidays array with calculated days
  const holidays = [
    {
      id: '1',
      name: 'День святого Валентина',
      date: formatDateToRussian(valentinesDay),
      daysLeft: calculateDaysLeft(valentinesDay),
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500',
      color: ['#FF5E87', '#FF3366'] as [string, string],
    },
    {
      id: '2',
      name: 'Международный женский день',
      date: formatDateToRussian(womensDay),
      daysLeft: calculateDaysLeft(womensDay),
      image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=500',
      color: ['#9C27B0', '#673AB7'] as [string, string],
    },
    {
      id: '3',
      name: 'День защитника Отечества',
      date: formatDateToRussian(defendersDay),
      daysLeft: calculateDaysLeft(defendersDay),
      image: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=500',
      color: ['#4CAF50', '#2E7D32'] as [string, string],
    },
    {
      id: '4',
      name: 'День рождения друга',
      date: formatDateToRussian(birthdayFriend),
      daysLeft: calculateDaysLeft(birthdayFriend),
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500',
      color: ['#FFC107', '#FF9800'] as [string, string],
    },
  ];

  // Sort holidays by days left (closest first)
  return holidays.sort((a, b) => a.daysLeft - b.daysLeft);
};

// Get sorted holidays
const getInitialHolidays = getHolidays();

// Обновляем daysLeft для события на основе текущей даты
const updateDaysLeft = (event: HolidayEvent): HolidayEvent => {
  const today = new Date();
  const eventDateParts = event.date.split(' ');
  
  // Находим номер месяца по названию
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const monthIndex = months.findIndex(month => month === eventDateParts[1]);
  
  // Если формат даты корректный
  if (monthIndex !== -1) {
    // Создаем объект даты для события
    const day = parseInt(eventDateParts[0], 10);
    if (!isNaN(day)) {
      const eventDate = new Date(today.getFullYear(), monthIndex, day);
      
      // Если дата уже прошла, добавляем год
      if (eventDate < today) {
        eventDate.setFullYear(today.getFullYear() + 1);
      }
      
      // Вычисляем количество дней до события
      const diffTime = eventDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Возвращаем обновленное событие
      return { ...event, daysLeft };
    }
  }
  
  // Если формат даты некорректный, возвращаем исходное событие
  return event;
};

export default function FeedScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t, locale, localizedData } = useAppLocalization();
  const { colors, theme } = useTheme();
  const { events } = localizedData;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({
    '2': true, // Teddy Bear предустановлен как избранный
  });
  const [upcomingHolidays, setUpcomingHolidays] = useState<HolidayEvent[]>(getInitialHolidays);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    date?: string;
  }>({});
  const [customEvents, setCustomEvents] = useState<HolidayEvent[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, name: string} | null>(null);

  // Получение стилей на основе темы
  const getThemedStyles = useCallback(() => {
    return {
      backgroundColor: theme === 'dark' ? THEME.dark.background : THEME.light.background,
      cardBackground: theme === 'dark' ? THEME.dark.cardBg : THEME.light.cardBg,
      textPrimary: theme === 'dark' ? THEME.dark.text : THEME.light.text,
      textSecondary: theme === 'dark' ? THEME.dark.textLight : THEME.light.textLight,
      buttonBackground: theme === 'dark' ? '#333333' : COLORS.white,
      modalBg: theme === 'dark' ? '#1E1E1E' : COLORS.white,
      inputBg: theme === 'dark' ? '#333333' : '#F1F5F9',
      inputText: theme === 'dark' ? THEME.dark.text : THEME.light.text,
      borderColor: theme === 'dark' ? '#333333' : '#E2E8F0',
    };
  }, [theme]);

  const themedStyles = getThemedStyles();

  // Set StatusBar configuration when component mounts
  useEffect(() => {
    // Make sure the status bar has transparent background
    RNStatusBar.setBackgroundColor('transparent', true);
    RNStatusBar.setTranslucent(true);
    
    // Clean up when component unmounts
    return () => {
      // Reset to default if needed when leaving this screen
      RNStatusBar.setBackgroundColor('transparent', true);
    };
  }, []);

  // Функция для получения приветствия в зависимости от времени суток
  const getGreetingByTime = (): string => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return `Доброе утро, %s`;
    } else if (hours >= 12 && hours < 18) {
      return `Добрый день, %s`;
    } else {
      return `Добрый вечер, %s`;
    }
  };

  // Загрузка пользовательских событий при запуске
  useEffect(() => {
    const loadCustomEvents = async () => {
      try {
        // Сначала обновим daysLeft для предустановленных событий
        const updatedInitialHolidays = getInitialHolidays.map(updateDaysLeft);
        setUpcomingHolidays(updatedInitialHolidays);
        
        const savedEvents = await AsyncStorage.getItem('customEvents');
        
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents) as HolidayEvent[];
          console.log("Загружены сохраненные события:", parsedEvents);
          
          // Обновляем daysLeft для сохраненных событий
          const updatedSavedEvents = parsedEvents.map(updateDaysLeft);
          
          // Добавляем сохраненные события к существующим, а не заменяем их
          if (updatedSavedEvents && updatedSavedEvents.length > 0) {
            setUpcomingHolidays(prevHolidays => {
              // Собираем все существующие ID, чтобы избежать дубликатов
              const existingIds = prevHolidays.map(event => event.id);
              // Фильтруем сохраненные события, чтобы добавить только те, которых еще нет
              const newEvents = updatedSavedEvents.filter(event => !existingIds.includes(event.id));
              
              if (newEvents.length > 0) {
                // Объединяем существующие и новые события, затем сортируем по дням
                const allEvents = [...prevHolidays, ...newEvents].sort((a, b) => a.daysLeft - b.daysLeft);
                console.log("Все события после загрузки:", allEvents);
                return allEvents;
              }
              
              return prevHolidays;
            });
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке событий:", error);
      }
    };
    
    loadCustomEvents();
  }, []);
  
  // Сохранение пользовательских событий при изменении
  useEffect(() => {
    const saveCustomEvents = async () => {
      try {
        // Находим пользовательские события (те, что не входят в предустановленные)
        const presetEventIds = getInitialHolidays.map(event => event.id);
        const customEvents = upcomingHolidays.filter(event => !presetEventIds.includes(event.id));
        
        // Сохраняем только, если есть что сохранять
        await AsyncStorage.setItem('customEvents', JSON.stringify(customEvents));
        console.log("Пользовательские события сохранены:", customEvents);
      } catch (error) {
        console.error("Ошибка при сохранении событий:", error);
      }
    };
    
    // Запускаем сохранение только если был forceUpdate или изменились события
    if (forceUpdate > 0) {
      saveCustomEvents();
    }
  }, [upcomingHolidays, forceUpdate]);

  // Скидки и акции с локализацией
  const discountItems = useMemo(() => [
    {
      id: '1',
      title: t('feed.specialOffer.discount30'),
      description: t('feed.specialOffer.discountDesc'),
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400',
      color: ['#FF5E87', '#FF0844'] as readonly [string, string],
    },
    {
      id: '2',
      title: t('feed.specialOffer.gift'),
      description: t('feed.specialOffer.giftDesc'),
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      color: ['#845EC2', '#5F43B2'] as readonly [string, string],
    },
  ], [t]);

  // Создаем локализованные категории
  const categories = useMemo(() => {
    return [
      { id: 'all', name: t('feed.category.all'), icon: categoryIcons.all, isActive: selectedCategory === 'all' },
      { id: 'flowers', name: t('feed.category.flowers'), icon: categoryIcons.flowers, isActive: selectedCategory === 'flowers' },
      { id: 'chocolates', name: t('feed.category.chocolates'), icon: categoryIcons.chocolates, isActive: selectedCategory === 'chocolates' },
      { id: 'jewellery', name: t('feed.category.jewellery'), icon: categoryIcons.jewellery, isActive: selectedCategory === 'jewellery' },
      { id: 'cosmetics', name: t('feed.category.cosmetics'), icon: categoryIcons.cosmetics, isActive: selectedCategory === 'cosmetics' },
    ];
  }, [t, selectedCategory]);

  // Предстоящие события
  const upcomingEvents = events.slice(0, 1);
  
  // Популярные события
  const popularEvents = events.slice(1);

  // Эффект для отслеживания появления и скрытия клавиатуры
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    // Очистка слушателей при размонтировании компонента
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Эффект для отслеживания изменений в списке событий
  useEffect(() => {
    console.log("Список событий изменился:", upcomingHolidays);
    
    // Выводим информацию о количестве стандартных и пользовательских событий
    const presetEventIds = getInitialHolidays.map(event => event.id);
    const customEvents = upcomingHolidays.filter(event => !presetEventIds.includes(event.id));
    
    console.log(`Всего событий: ${upcomingHolidays.length}`);
    console.log(`Стандартных событий: ${upcomingHolidays.length - customEvents.length}`);
    console.log(`Пользовательских событий: ${customEvents.length}`);
  }, [upcomingHolidays, forceUpdate]);

  // Функция для добавления нового события
  const handleAddEvent = () => {
    // Сбрасываем ошибки валидации
    setValidationErrors({});
    
    // Собираем ошибки
    const errors: {name?: string; date?: string} = {};
    
    // Валидация полей
    if (!newEventName.trim()) {
      errors.name = t('events.errors.nameRequired');
    }
    
    if (!newEventDate.trim()) {
      errors.date = t('events.errors.dateRequired');
    } else {
      // Проверяем формат даты
      const eventDateParts = newEventDate.split(' ');
      if (eventDateParts.length !== 2) {
        errors.date = t('events.errors.dateFormat');
      } else {
        // Находим номер месяца по названию
        const months = [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const monthIndex = months.findIndex(month => month === eventDateParts[1]);
        
        if (monthIndex === -1) {
          errors.date = t('events.errors.dateMonthInvalid');
        } else {
          // Проверяем, что день является числом
          const day = parseInt(eventDateParts[0], 10);
          if (isNaN(day) || day < 1 || day > 31) {
            errors.date = t('events.errors.dateDayInvalid');
          }
        }
      }
    }
    
    // Если есть ошибки, обновляем состояние и прерываем выполнение
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Создаем новое событие
    const newEvent: HolidayEvent = {
      id: Date.now().toString(), // Используем timestamp в качестве уникального ID
      name: newEventName,
      date: newEventDate,
      daysLeft: 0, // Временное значение, будет обновлено функцией updateDaysLeft
      image: newEventImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500', // Дефолтная картинка если не указана
      color: ['#FFC107', '#FF9800'] as [string, string], // Дефолтный цвет для новых событий
    };
    
    // Обновляем daysLeft с помощью нашей функции
    const updatedNewEvent = updateDaysLeft(newEvent);
    
    console.log("Добавляем новое событие:", updatedNewEvent);
    
    // Используем функциональное обновление состояния
    setUpcomingHolidays(prevHolidays => {
      const newHolidays = [...prevHolidays, updatedNewEvent].sort((a, b) => a.daysLeft - b.daysLeft);
      console.log("Новый список событий:", newHolidays);
      return newHolidays;
    });
    
    // Принудительно обновляем компонент
    setForceUpdate(prev => prev + 1);
    
    // Очищаем поля и закрываем модальное окно
    setNewEventName('');
    setNewEventDate('');
    setNewEventImage('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500');
    setIsCreateEventModalVisible(false);
    
    // Добавляем небольшую задержку перед закрытием модального окна
    // для обеспечения корректного обновления UI
    setTimeout(() => {
      console.log("События после добавления:", upcomingHolidays);
    }, 100);
  };

  // Функция для обработки нажатия на праздник
  const handleHolidayPress = (holiday: any) => {
    router.push({
      pathname: '/gift-assistant',
      params: { occasion: holiday.name }
    });
  };

  // Обновляем функцию handleGenerateGift, чтобы добавить параметр предзаполненного сообщения
  const handleGenerateGift = (holiday: any) => {
    // Создаем предзаполненный промпт на основе события
    const prefilledPrompt = `Помоги мне выбрать идеальный подарок на ${holiday.name}. Мероприятие состоится ${holiday.date}, осталось ${holiday.daysLeft} дней.`;
    
    router.push({
      pathname: '/gift-assistant',
      params: { 
        occasion: holiday.name,
        prefilledPrompt: encodeURIComponent(prefilledPrompt)
      }
    });
  };

  // Функция для удаления события
  const handleDeleteEvent = (eventId: string, eventName: string) => {
    // Проверяем, не является ли событие стандартным (предустановленным)
    const presetEventIds = getInitialHolidays.map(event => event.id);
    if (presetEventIds.includes(eventId)) {
      Alert.alert(
        t('events.delete.cannotDelete'),
        t('events.delete.cannotDeleteMessage'),
        [{ text: t('events.delete.ok'), style: "default" }]
      );
      return;
    }

    // Запрашиваем подтверждение удаления
    Alert.alert(
      t('events.delete.title'),
      t('events.delete.message').replace('{name}', eventName),
      [
        {
          text: t('events.delete.cancel'),
          style: "cancel"
        },
        {
          text: t('events.delete.confirm'),
          style: "destructive",
          onPress: async () => {
            try {
              // Удаляем событие из списка
              setUpcomingHolidays(prevEvents => {
                const updatedEvents = prevEvents.filter(event => event.id !== eventId);
                console.log(`Все события после удаления:`, updatedEvents);
                return updatedEvents;
              });
              
              // Принудительно обновляем компонент
              setForceUpdate(prev => prev + 1);
            } catch (error) {
              console.error("Ошибка при удалении события:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: themedStyles.backgroundColor }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
      >
        {/* Приветствие */}
        <View style={styles.newHeader}>
          {showGreeting && (
            <>
              <Text style={[styles.newHeaderTitle, { color: themedStyles.textPrimary }]}>
                {getGreetingByTime().replace('%s', user?.name || t('profile.guestUser'))}
              </Text>
              <Text style={[styles.newHeaderSubtitle, { color: themedStyles.textSecondary }]}>
                {t('feed.findGifts')}
              </Text>
            </>
          )}
        </View>

        {/* Ближайшие мероприятия - используем новый компонент */}
        <UpcomingEvents 
          events={upcomingHolidays}
          onEventPress={handleHolidayPress} 
          onGenerateGiftPress={handleGenerateGift} 
          onAddEventPress={() => setIsCreateEventModalVisible(true)} 
          onDeleteEvent={handleDeleteEvent}
        />

        {/* Тематические коллекции */}
        <ThematicCollections 
          onCollectionPress={(collectionId, collectionName) => {
            console.log(`Main screen handling collection press: ${collectionId} - ${collectionName}`);
            router.navigate({
              pathname: '/(tabs)/catalog',
              params: { collection: collectionId, name: collectionName }
            });
          }}
        />

        {/* Персонализированные рекомендации */}
        <PersonalizedRecommendations />
      </ScrollView>
      
      {/* Модальное окно для создания события */}
      <Modal
        visible={isCreateEventModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateEventModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: themedStyles.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themedStyles.textPrimary }]}>
                Создать новое событие
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsCreateEventModalVisible(false)}
              >
                <X size={24} color={themedStyles.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themedStyles.textSecondary }]}>
                Название события
              </Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.name ? styles.inputError : null,
                  { 
                    backgroundColor: themedStyles.inputBg,
                    color: themedStyles.inputText,
                    borderColor: themedStyles.borderColor
                  }
                ]}
                placeholder="Например: День рождения мамы"
                placeholderTextColor={themedStyles.textSecondary}
                value={newEventName}
                onChangeText={setNewEventName}
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themedStyles.textSecondary }]}>
                Дата (например: 15 апреля)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.date ? styles.inputError : null,
                  { 
                    backgroundColor: themedStyles.inputBg,
                    color: themedStyles.inputText,
                    borderColor: themedStyles.borderColor
                  }
                ]}
                placeholder="Дата в формате: 15 апреля"
                placeholderTextColor={themedStyles.textSecondary}
                value={newEventDate}
                onChangeText={setNewEventDate}
              />
              {validationErrors.date && (
                <Text style={styles.errorText}>{validationErrors.date}</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddEvent}
            >
              <Text style={styles.submitButtonText}>Создать событие</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  newHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 40,
  },
  newHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  newHeaderSubtitle: {
    fontSize: 16,
    color: COLORS.gray600,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  modalCloseButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.gray600,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
  },
  inputError: {
    borderColor: COLORS.secondary,
  },
  errorText: {
    color: COLORS.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});