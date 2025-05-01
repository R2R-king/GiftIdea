import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Button as NativeButton
} from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, ArrowUpRight, Search, Filter, Heart, Gift, Star, ShoppingCart, X, ArrowRight, Plus, Trash2 } from 'lucide-react-native';
import TabBarShadow from '@/components/TabBarShadow';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThematicCollections from '@/components/ThematicCollections';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

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
  const { t, localizedData } = useAppLocalization();
  const { events } = localizedData;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({
    '2': true, // Teddy Bear предустановлен как избранный
  });
  const [upcomingHolidays, setUpcomingHolidays] = useState<HolidayEvent[]>(getInitialHolidays);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    date?: string;
  }>({});

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

  // Эффект для скрытия приветствия через 5 секунд
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

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
        // Если текстовое поле пустое, сбрасываем фокус поиска
        if (searchQuery.length === 0) {
          setIsSearchFocused(false);
        }
      }
    );

    // Очистка слушателей при размонтировании компонента
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [searchQuery]);

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
                console.log(`Событие "${eventName}" удалено. Осталось событий: ${updatedEvents.length}`);
                return updatedEvents;
              });
              
              // Обновляем UI
              setForceUpdate(prev => prev + 1);
              
              // Получаем актуальные данные, чтобы корректно сохранить
              // Важно использовать currentEvents, а не upcomingHolidays,
              // так как upcomingHolidays может еще не обновиться
              const currentEvents = upcomingHolidays.filter(event => event.id !== eventId);
              const customEvents = currentEvents.filter(event => !presetEventIds.includes(event.id));
              
              // Сохраняем обновленный список
              await AsyncStorage.setItem('customEvents', JSON.stringify(customEvents));
              console.log("События обновлены в хранилище после удаления:", customEvents.length);
            } catch (error) {
              console.error("Ошибка при удалении события:", error);
            }
          }
        }
      ]
    );
  };
  
  // Предотвращаем всплытие события при нажатии на кнопку удаления
  const handleDeleteButtonPress = (e: any, eventId: string, eventName: string) => {
    e.stopPropagation();
    e.preventDefault();
    handleDeleteEvent(eventId, eventName);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Фоновые элементы */}
          <LinearGradient
            colors={[COLORS.valentineBackground, COLORS.valentineLightBackground]}
            style={styles.backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Заголовок */}
          <LinearGradient
            colors={[COLORS.valentinePink, COLORS.valentineLightPink]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.headerContent}>
              {showGreeting && (
                <>
                  <Text style={styles.headerTitle}>{t('feed.greeting').replace('%s', 'Алексей')}</Text>
                  <Text style={styles.headerSubtitle}>{t('feed.findGifts')}</Text>
                </>
              )}
              
              <Pressable
                style={[styles.searchBar, !showGreeting && styles.searchBarNoGreeting]}
                onPress={() => {
                  searchInputRef.current?.focus();
                  setIsSearchFocused(true);
                }}
              >
                <Search size={20} color={COLORS.gray500} />
                <TextInput
                  ref={searchInputRef}
                  placeholder={t('feed.searchPlaceholder')}
                  placeholderTextColor={COLORS.gray500}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    if (searchQuery.length === 0) {
                      setIsSearchFocused(false);
                    }
                  }}
                />
                {searchQuery ? (
                  <Pressable onPress={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}>
                    <X size={20} color={COLORS.gray500} />
                  </Pressable>
                ) : null}
              </Pressable>
            </View>
          </LinearGradient>

          {/* Ближайшие праздники */}
          <View style={styles.upcomingSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Ближайшие мероприятия</Text>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.eventsScrollView}
              contentContainerStyle={styles.eventsScrollContent}
            >
              {upcomingHolidays.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.eventCard}
                  activeOpacity={0.95}
                  onPress={() => handleHolidayPress(item)}
                >
                  <ImageBackground 
                    source={{ uri: item.image }} 
                    style={styles.eventImageBackground}
                    imageStyle={styles.eventBackgroundImage}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                      style={styles.eventGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <View style={styles.eventDateBadge}>
                        <Text style={styles.eventDateMonth}>
                          {item.date.split(' ')[1].substring(0, 3)}
                        </Text>
                        <Text style={styles.eventDateDay}>
                          {item.date.split(' ')[0]}
                        </Text>
                      </View>
                      
                      {/* Кнопка удаления события */}
                      <TouchableOpacity 
                        style={styles.deleteEventButton}
                        onPress={(e) => handleDeleteButtonPress(e, item.id, item.name)}
                      >
                        <Trash2 size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      
                      <View style={styles.eventContent}>
                        <Text style={styles.eventName}>{item.name}</Text>
                        <View style={styles.eventDetailRow}>
                          <Calendar size={14} color="#FFFFFF" />
                          <Text style={styles.eventDetail}>{item.date}</Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                          <Text style={styles.daysLeftText}>
                            {item.daysLeft === 0 
                              ? "Сегодня!" 
                              : `Осталось ${item.daysLeft} ${item.daysLeft === 1 ? 'день' : 
                                item.daysLeft < 5 ? 'дня' : 'дней'}`
                            }
                          </Text>
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.generateButton}
                          onPress={() => handleGenerateGift(item)}
                        >
                          <Text style={styles.generateButtonText}>Найти подарок</Text>
                          <Gift size={14} color="#FFFFFF" style={styles.buttonIcon} />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
              
              {/* Кнопка добавления события */}
              <TouchableOpacity
                style={styles.addEventCard}
                activeOpacity={0.9}
                onPress={() => setIsCreateEventModalVisible(true)}
              >
                <LinearGradient
                  colors={['#64B5F6', '#2196F3']}
                  style={styles.addEventCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <View style={styles.addEventContent}>
                    <View style={styles.addEventIconContainer}>
                      <Plus size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.addEventText}>{t('events.addEvent')}</Text>
                    <Text style={styles.addEventSubtext}>{t('events.addEventSubtext')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>

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
          
          {/* Идеи для особых случаев */}
          <View style={styles.specialCasesSection}>
            <Text style={styles.sectionTitle}>Идеи для особых случаев</Text>
            
            <View style={styles.specialCasesGrid}>
              <TouchableOpacity 
                style={styles.specialCaseCard}
                onPress={() => router.push({
                  pathname: '/gift-assistant',
                  params: { occasion: 'День рождения' }
                })}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500' }} 
                  style={styles.specialCaseImage}
                />
                <Text style={styles.specialCaseTitle}>День рождения</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.specialCaseCard}
                onPress={() => router.push({
                  pathname: '/gift-assistant',
                  params: { occasion: 'Юбилей' }
                })}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1465310477141-6fb93167a273?w=500' }} 
                  style={styles.specialCaseImage}
                />
                <Text style={styles.specialCaseTitle}>Юбилей</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.specialCaseCard}
                onPress={() => router.push({
                  pathname: '/gift-assistant',
                  params: { occasion: 'Свадьба' }
                })}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500' }} 
                  style={styles.specialCaseImage}
                />
                <Text style={styles.specialCaseTitle}>Свадьба</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.specialCaseCard}
                onPress={() => router.push({
                  pathname: '/gift-assistant',
                  params: { occasion: 'Новоселье' }
                })}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500' }} 
                  style={styles.specialCaseImage}
                />
                <Text style={styles.specialCaseTitle}>Новоселье</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Модальное окно для создания события */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateEventModalVisible}
        onRequestClose={() => setIsCreateEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('events.createEventTitle')}</Text>
              <TouchableOpacity 
                onPress={() => setIsCreateEventModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t('events.eventName')}</Text>
              <TextInput
                style={[styles.input, validationErrors.name ? styles.inputError : null]}
                value={newEventName}
                onChangeText={setNewEventName}
                placeholder={t('events.eventNamePlaceholder')}
                placeholderTextColor={COLORS.gray400}
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
              
              <Text style={styles.inputLabel}>{t('events.eventDate')}</Text>
              <TextInput
                style={[styles.input, validationErrors.date ? styles.inputError : null]}
                value={newEventDate}
                onChangeText={setNewEventDate}
                placeholder={t('events.eventDatePlaceholder')}
                placeholderTextColor={COLORS.gray400}
              />
              {validationErrors.date && (
                <Text style={styles.errorText}>{validationErrors.date}</Text>
              )}
              
              <Text style={styles.inputHelp}>{t('events.eventDateHelp')}</Text>
              
              <Text style={styles.inputLabel}>{t('events.eventImage')}</Text>
              <TextInput
                style={styles.input}
                value={newEventImage}
                onChangeText={setNewEventImage}
                placeholder="https://..."
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsCreateEventModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('events.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.saveButtonText}>{t('events.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Всегда показываем тень для панели навигации */}
      <TabBarShadow />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.pink,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    paddingRight: SPACING.lg,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchBarNoGreeting: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  backgroundContainer: {
    display: 'none',
  },
  pinkBackground: {
    display: 'none',
  },
  contentContainer: {
    display: 'none',
  },
  welcomeContainer: {
    display: 'none',
  },
  welcomeText: {
    display: 'none',
  },
  subtitleText: {
    display: 'none',
  },
  avatarContainer: {
    display: 'none',
  },
  avatar: {
    display: 'none',
  },
  searchContainer: {
    display: 'none',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  specialsSection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.valentinePink,
    fontWeight: '500',
  },
  specialsScrollContent: {
    paddingRight: SPACING.lg,
  },
  specialCard: {
    width: width - 60,
    height: 140,
    borderRadius: 20,
    marginRight: 15,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  specialCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  specialCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  specialCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  specialCardImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  categoriesSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  categoriesScrollContent: {
    paddingTop: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#FF0844',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  productsSection: {
    marginTop: 30,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF0844',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#1E293B',
    marginLeft: 4,
  },
  ideasSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ideasContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 8, 68, 0.1)',
  },
  ideasContent: {
    alignItems: 'center',
  },
  ideasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  ideasDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 15,
  },
  ideasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 8, 68, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  ideasButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0844',
    marginRight: 5,
  },
  upcomingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  holidaysList: {
    paddingBottom: 10,
  },
  holidayCard: {
    marginBottom: 16,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  holidayGradient: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  holidayImage: {
    width: 100,
    height: 130,
  },
  holidayContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  holidayTextContainer: {
    flex: 1,
  },
  holidayName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  holidayDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    marginLeft: 6,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.xs,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  generateButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
  },
  buttonIcon: {
    marginLeft: 6,
  },
  aiAssistantSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  aiCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...SHADOWS.medium,
  },
  aiCardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  aiCardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
    marginBottom: 5,
  },
  aiCardDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    marginBottom: 15,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.xs,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aiButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
  },
  aiCardImage: {
    width: 100,
    height: 130,
  },
  specialCasesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  specialCasesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specialCaseCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 15,
    ...SHADOWS.small,
  },
  specialCaseImage: {
    width: '100%',
    height: 120,
  },
  specialCaseTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium as any,
    color: COLORS.gray800,
    textAlign: 'center',
    paddingVertical: 10,
  },
  eventsScrollView: {
    marginTop: SPACING.sm,
  },
  eventsScrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  eventCard: {
    width: 300,
    height: 200,
    marginRight: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  eventImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  eventBackgroundImage: {
    borderRadius: RADIUS.lg,
  },
  eventGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  eventDateBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    alignItems: 'center',
    minWidth: 50,
    zIndex: 10,
  },
  eventDateMonth: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold as any,
    color: COLORS.valentinePink,
    textTransform: 'uppercase',
  },
  eventDateDay: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.gray800,
  },
  eventContent: {
    marginTop: 'auto',
  },
  eventName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  daysLeftText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    backgroundColor: 'rgba(255, 51, 102, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  createEventButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.valentinePink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  createEventButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium as any,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.gray800,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium as any,
    color: COLORS.gray700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.xs,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  inputHelp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  cancelButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray700,
    fontWeight: FONTS.weights.medium as any,
  },
  saveButton: {
    backgroundColor: COLORS.valentinePink,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold as any,
  },
  addEventCard: {
    width: 250,
    height: 200,
    marginRight: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  addEventCardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  addEventContent: {
    alignItems: 'center',
  },
  addEventIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addEventText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold as any,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  addEventSubtext: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  deleteEventButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 51, 102, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
