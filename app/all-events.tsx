import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ImageBackground, 
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Button,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Gift, ArrowLeft, Plus, Trash2, X, ChevronRight, Calendar as CalendarIcon, List, Layers } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/theme';
import { HolidayEvent, UpcomingEvents } from '@/components/UpcomingEvents';
import EventStack, { HolidayEvent as EventStackHolidayEvent } from '../components/EventStack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Updated EventCard component with isGeneratingImage prop
const EventCard = ({ 
  item, 
  index, 
  expandedEventId, 
  onEventPress, 
  onGenerateGiftPress,
  onDeleteButtonPress,
  isGeneratingImage
}: { 
  item: HolidayEvent; 
  index: number; 
  expandedEventId: string | null;
  onEventPress: (event: HolidayEvent) => void;
  onGenerateGiftPress: (event: HolidayEvent, e: any) => void;
  onDeleteButtonPress: (e: any, eventId: string, eventName: string) => void;
  isGeneratingImage?: boolean;
}) => {
  const isExpanded = expandedEventId === item.id;
  
  // Используем только нативные анимации (transform, opacity)
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Анимация раскрытия/скрытия карточки
  useEffect(() => {
    Animated.timing(scale, {
      toValue: isExpanded ? 1.02 : 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    Animated.timing(contentOpacity, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [isExpanded]);
  
  // Начальная анимация появления
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 50),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.eventCardContainer,
        {
          transform: [
            { scale },
            { translateY }
          ],
          opacity
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onEventPress(item)}
        style={styles.eventCardTouchable}
      >
        <ImageBackground 
          source={{ uri: item.image }} 
          style={styles.eventImageBackground}
          imageStyle={styles.eventBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.7)']}
            style={styles.eventGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Image generation overlay indicator */}
            {isGeneratingImage && (
              <View style={styles.generatingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.generatingText}>Генерация изображения...</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.deleteEventButton}
              onPress={(e) => onDeleteButtonPress(e, item.id, item.name)}
            >
              <Trash2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.eventContent}>
              <View style={styles.eventMainInfo}>
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
              </View>
              
              {/* Дополнительный контент с анимацией прозрачности */}
              {isExpanded && (
                <Animated.View 
                  style={[
                    styles.expandedContent, 
                    { opacity: contentOpacity }
                  ]}
                >
                  <Text style={styles.expandedText}>
                    Нажмите на кнопку ниже, чтобы найти идеальный подарок для этого события
                  </Text>
                </Animated.View>
              )}
              
              <TouchableOpacity 
                style={[styles.generateButton, isExpanded && styles.expandedButton]}
                onPress={(e) => onGenerateGiftPress(item, e)}
              >
                <Text style={styles.generateButtonText}>Найти подарок</Text>
                <Gift size={14} color="#FFFFFF" style={styles.buttonIcon} />
              </TouchableOpacity>
              
              {!isExpanded && (
                <TouchableOpacity 
                  style={styles.expandButton}
                  onPress={() => onEventPress(item)}
                >
                  <Text style={styles.expandButtonText}>Подробнее</Text>
                  <ChevronRight size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AllEventsScreen() {
  const router = useRouter();
  const [upcomingHolidays, setUpcomingHolidays] = useState<HolidayEvent[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<HolidayEvent[]>([]);
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [daysInMonth, setDaysInMonth] = useState<number>(31);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    date?: string;
  }>({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, name: string} | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [isStackView, setIsStackView] = useState(true);
  
  // Get sorted holidays from AsyncStorage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const savedEvents = await AsyncStorage.getItem('customEvents');
        const standardEvents = await AsyncStorage.getItem('upcomingHolidays');
        
        let allEvents: HolidayEvent[] = [];
        
        if (savedEvents) {
          const parsedCustomEvents = JSON.parse(savedEvents) as HolidayEvent[];
          allEvents = [...allEvents, ...parsedCustomEvents];
        }
        
        let parsedStandardEvents: HolidayEvent[] = [];
        if (standardEvents) {
          parsedStandardEvents = JSON.parse(standardEvents) as HolidayEvent[];
        } else {
          // Если стандартные события не найдены, используем предзагруженные события
          parsedStandardEvents = [
            {
              id: 'default-1',
              name: 'Новый год',
              date: '31 декабря',
              daysLeft: calculateDaysLeft('31 декабря'),
              image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=500'
            },
            {
              id: 'default-2',
              name: 'День святого Валентина',
              date: '14 февраля',
              daysLeft: calculateDaysLeft('14 февраля'),
              image: 'https://images.unsplash.com/photo-1518542331925-4e91e9aa0074?w=500'
            },
            {
              id: 'default-3',
              name: 'Международный женский день',
              date: '8 марта',
              daysLeft: calculateDaysLeft('8 марта'),
              image: 'https://images.unsplash.com/photo-1520010017217-2bd91f03cbfb?w=500'
            },
            {
              id: 'default-4',
              name: 'День защитника Отечества',
              date: '23 февраля',
              daysLeft: calculateDaysLeft('23 февраля'),
              image: 'https://images.unsplash.com/photo-1485981133625-f5584c1e0c63?w=500'
            },
            {
              id: 'default-5',
              name: 'День Победы',
              date: '9 мая',
              daysLeft: calculateDaysLeft('9 мая'),
              image: 'https://images.unsplash.com/photo-1583346846259-b6b0baf6bb84?w=500'
            }
          ];
          
          // Сохраняем стандартные события в AsyncStorage для будущего использования
          await AsyncStorage.setItem('upcomingHolidays', JSON.stringify(parsedStandardEvents));
        }
        
        allEvents = [...allEvents, ...parsedStandardEvents];
        
        // Sort by days left
        allEvents.sort((a, b) => a.daysLeft - b.daysLeft);
        setUpcomingHolidays(allEvents);
        
        // Set featured events (first 3-5 events) for the horizontal UpcomingEvents component
        setFeaturedEvents(allEvents.slice(0, Math.min(5, allEvents.length)));
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    
    loadEvents();
  }, []);

  // Функция для расчета дней до события
  const calculateDaysLeft = (dateString: string): number => {
    try {
      const [day, month] = dateString.split(' ');
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      
      const today = new Date();
      const currentYear = today.getFullYear();
      
      const monthIndex = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (monthIndex !== -1) {
        const eventDate = new Date(currentYear, monthIndex, parseInt(day));
        
        // Если дата уже прошла в этом году, устанавливаем на следующий год
        if (eventDate < today) {
          eventDate.setFullYear(currentYear + 1);
        }
        
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
      }
      return 30; // Значение по умолчанию, если не удалось распарсить дату
    } catch (error) {
      console.error('Error calculating days left:', error);
      return 30;
    }
  };
  
  // Функция для определения количества дней в месяце
  const getDaysInMonth = (month: number, year: number = new Date().getFullYear()): number => {
    // В JavaScript месяцы начинаются с 0, а если день указать как 0, 
    // то получим последний день предыдущего месяца
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Обновить количество дней при изменении месяца
  useEffect(() => {
    // Получаем количество дней в текущем месяце
    const currentDaysInMonth = getDaysInMonth(date.getMonth());
    
    // Если количество дней в месяце изменилось, обновляем
    if (daysInMonth !== currentDaysInMonth) {
      // Анимируем прозрачность для плавного перехода
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
      
      // Устанавливаем новое количество дней
      setDaysInMonth(currentDaysInMonth);
      
      // Если текущий день превышает количество дней в месяце,
      // устанавливаем последний день месяца
      if (date.getDate() > currentDaysInMonth) {
        const newDate = new Date(date);
        newDate.setDate(currentDaysInMonth);
        setDate(newDate);
      }
    }
  }, [date.getMonth()]);

  // Обработчики событий
  const handleEventPress = (event: HolidayEvent) => {
    if (expandedEventId === event.id) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(event.id);
    }
  };

  const handleGenerateGiftPress = (event: HolidayEvent, e: any) => {
    e.stopPropagation(); // Prevent triggering the card press
    const prefilledPrompt = `Помоги мне выбрать идеальный подарок на ${event.name}. Мероприятие состоится ${event.date}, осталось ${event.daysLeft} дней.`;
    router.push({
      pathname: '/gift-assistant',
      params: {
        prompt: prefilledPrompt,
        occasion: event.name,
      }
    });
  };

  const handleDeleteButtonPress = (e: any, eventId: string, eventName: string) => {
    e.stopPropagation(); // Prevent triggering the card press
    setEventToDelete({ id: eventId, name: eventName });
    setIsDeleteModalVisible(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // Check if this is a preset event
      const savedEvents = await AsyncStorage.getItem('customEvents');
      let customEvents: HolidayEvent[] = savedEvents ? JSON.parse(savedEvents) : [];
      
      // Find if the event is in custom events
      const isCustomEvent = customEvents.some(event => event.id === eventToDelete.id);
      
      if (isCustomEvent) {
        // Remove from custom events
        customEvents = customEvents.filter(event => event.id !== eventToDelete.id);
        await AsyncStorage.setItem('customEvents', JSON.stringify(customEvents));
        
        // Update local state without анимации, которая вызывает конфликт
        setUpcomingHolidays(prevEvents => 
          prevEvents.filter(event => event.id !== eventToDelete.id)
        );
        
        console.log(`Событие "${eventToDelete.name}" успешно удалено`);
      } else {
        Alert.alert('Невозможно удалить', 'Это стандартное событие, его нельзя удалить.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Ошибка', 'Не удалось удалить событие');
    } finally {
      setIsDeleteModalVisible(false);
      setEventToDelete(null);
    }
  };

  const handleAddEvent = async () => {
    // Validate fields
    const errors: {name?: string; date?: string} = {};
    
    if (!newEventName.trim()) {
      errors.name = 'Название события обязательно';
    }
    
    if (!newEventDate) {
      errors.date = 'Выберите дату события';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear errors
    setValidationErrors({});
    
    // Default image temporarily until we generate a custom one
    let eventImage = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500';
    
    // Create new event with temporary image
    const newEvent: HolidayEvent = {
      id: `custom-${Date.now()}`,
      name: newEventName.trim(),
      date: newEventDate,
      daysLeft: calculateDaysLeft(newEventDate),
      image: eventImage,
    };
    
    try {
      // Close modal first for better UX
      setIsCreateEventModalVisible(false);
      
      // Set loading state for this specific event
      setGeneratingImages(prev => ({...prev, [newEvent.id]: true}));
      
      // Get existing custom events
      const savedEvents = await AsyncStorage.getItem('customEvents');
      let customEvents: HolidayEvent[] = savedEvents ? JSON.parse(savedEvents) : [];
      
      // Add new event
      customEvents.push(newEvent);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('customEvents', JSON.stringify(customEvents));
      
      // Update UI first with temporary image
      setUpcomingHolidays(prevHolidays => {
        const newHolidays = [...prevHolidays, newEvent].sort((a, b) => a.daysLeft - b.daysLeft);
        return newHolidays;
      });
      
      // Import the image generation service
      const { generateAndSaveEventImage } = require('@/lib/eventImageService');
      
      console.log(`Запуск генерации изображения для события: "${newEventName.trim()}"`);
      
      // Generate image based on event name
      const generatedImageUri = await generateAndSaveEventImage(newEventName.trim());
      
      if (generatedImageUri) {
        console.log(`Изображение успешно сгенерировано: ${generatedImageUri}`);
        
        // Update the event with the generated image
        const updatedEvent = {...newEvent, image: generatedImageUri};
        
        // Update in AsyncStorage
        const updatedEvents = customEvents.map(event => 
          event.id === newEvent.id ? updatedEvent : event
        );
        await AsyncStorage.setItem('customEvents', JSON.stringify(updatedEvents));
        
        // Update in state
        setUpcomingHolidays(prevHolidays => {
          return prevHolidays.map(event => 
            event.id === newEvent.id ? updatedEvent : event
          ).sort((a, b) => a.daysLeft - b.daysLeft);
        });
      } else {
        console.log(`Не удалось сгенерировать изображение для события "${newEventName.trim()}"`);
      }
      
      // Clear form
      setNewEventName('');
      setNewEventDate('');
      setNewEventImage('');
      
      console.log('Событие успешно добавлено');
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить событие или создать изображение');
    } finally {
      // Clear loading state regardless of outcome
      setGeneratingImages(prev => {
        const updated = {...prev};
        delete updated[newEvent.id];
        return updated;
      });
    }
  };

  // Вместо функции renderEventItem используем компонент EventCard
  const renderEventItem = ({ item, index }: { item: HolidayEvent, index: number }) => (
    <EventCard
      item={item}
      index={index}
      expandedEventId={expandedEventId}
      onEventPress={handleEventPress}
      onGenerateGiftPress={handleGenerateGiftPress}
      onDeleteButtonPress={handleDeleteButtonPress}
      isGeneratingImage={generatingImages[item.id]}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Все события',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.gray800} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => router.push('/image-generation-logs')}
                style={styles.logsButton}
              >
                <Text style={styles.logsButtonText}>Логи</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsCreateEventModalVisible(true)}
                style={styles.addButton}
              >
                <Plus size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
          headerShadowVisible: false,
        }} 
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Ваши предстоящие события и праздники
        </Text>
      </View>
      
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setIsCreateEventModalVisible(true)}
        style={styles.addEventButtonContainer}
      >
        <LinearGradient
          colors={['#FF6B9D', '#FF9181', '#FFC168']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addEventGradient}
        >
          <Plus size={22} color="#FFFFFF" style={{marginRight: 2}} />
          <Text style={styles.addEventButtonText}>Добавить событие</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[styles.viewToggleButton, isStackView && styles.viewToggleActive]}
          onPress={() => setIsStackView(true)}
        >
          <Layers size={16} color={isStackView ? '#FFFFFF' : COLORS.gray700} style={{marginRight: 6}} />
          <Text style={[styles.viewToggleText, isStackView && styles.viewToggleTextActive]}>Стопка</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, !isStackView && styles.viewToggleActive]}
          onPress={() => setIsStackView(false)}
        >
          <List size={16} color={!isStackView ? '#FFFFFF' : COLORS.gray700} style={{marginRight: 6}} />
          <Text style={[styles.viewToggleText, !isStackView && styles.viewToggleTextActive]}>Список</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {upcomingHolidays.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>У вас пока нет событий</Text>
            <TouchableOpacity 
              style={styles.addFirstEventButton}
              onPress={() => setIsCreateEventModalVisible(true)}
            >
              <Text style={styles.addFirstEventText}>Добавить событие</Text>
            </TouchableOpacity>
          </View>
        ) : isStackView ? (
          <EventStack
            events={upcomingHolidays}
            onEventPress={handleEventPress}
            renderCard={(item: EventStackHolidayEvent, isTop: boolean) => (
              <EventCard
                item={item}
                index={upcomingHolidays.indexOf(item)}
                expandedEventId={expandedEventId}
                onEventPress={handleEventPress}
                onGenerateGiftPress={handleGenerateGiftPress}
                onDeleteButtonPress={handleDeleteButtonPress}
                isGeneratingImage={generatingImages[item.id]}
              />
            )}
          />
        ) : (
          <FlatList
            data={upcomingHolidays}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.eventsList}
            numColumns={1}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Модальное окно для создания события */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateEventModalVisible}
        onRequestClose={() => setIsCreateEventModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Создать событие</Text>
              <TouchableOpacity 
                onPress={() => setIsCreateEventModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Название события</Text>
              <TextInput
                style={[styles.input, validationErrors.name ? styles.inputError : null]}
                value={newEventName}
                onChangeText={setNewEventName}
                placeholder="День рождения мамы"
                placeholderTextColor={COLORS.gray400}
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
              
              <Text style={styles.inputLabel}>Дата события</Text>
              <TouchableOpacity 
                style={[styles.datePickerButton, validationErrors.date ? styles.inputError : null]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.datePickerContent}>
                  <CalendarIcon size={20} color={COLORS.gray600} style={styles.dateIcon} />
                  <Text style={[
                    styles.datePickerText, 
                    !newEventDate ? styles.datePickerPlaceholder : null
                  ]}>
                    {newEventDate || 'Выберите дату события'}
                  </Text>
                </View>
              </TouchableOpacity>
              {validationErrors.date && (
                <Text style={styles.errorText}>{validationErrors.date}</Text>
              )}
              
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableOpacity 
                  style={styles.datePickerModalOverlay} 
                  activeOpacity={1} 
                  onPress={() => setShowDatePicker(false)}
                >
                  <View 
                    style={styles.datePickerModalContent}
                    onStartShouldSetResponder={() => true}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <View style={styles.datePickerHeader}>
                      <Text style={styles.datePickerTitle}>Выберите дату</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <X size={24} color={COLORS.gray600} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.datePickerMonths}>
                      {[
                        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                      ].map((month, index) => (
                        <TouchableOpacity 
                          key={month}
                          style={[
                            styles.monthButton,
                            date.getMonth() === index && styles.selectedMonthButton
                          ]}
                          onPress={() => {
                            const newDate = new Date(date);
                            newDate.setMonth(index);
                            setDate(newDate);
                          }}
                        >
                          <Text 
                            style={[
                              styles.monthButtonText,
                              date.getMonth() === index && styles.selectedMonthButtonText
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <View style={styles.datePickerDays}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                        // Показываем только дни, которые актуальны для текущего месяца
                        const isValidDay = day <= daysInMonth;
                        
                        return (
                          <Animated.View 
                            key={day} 
                            style={[
                              styles.dayButtonWrapper,
                              { opacity: isValidDay ? fadeAnim : 0 },
                              { display: isValidDay ? 'flex' : 'none' }
                            ]}
                          >
                            <TouchableOpacity 
                              style={[
                                styles.dayButton,
                                date.getDate() === day && styles.selectedDayButton
                              ]}
                              onPress={() => {
                                const newDate = new Date(date);
                                newDate.setDate(day);
                                setDate(newDate);
                              }}
                              disabled={!isValidDay}
                            >
                              <Text 
                                style={[
                                  styles.dayButtonText,
                                  date.getDate() === day && styles.selectedDayButtonText
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.confirmDateButton}
                      onPress={() => {
                        const day = date.getDate();
                        const months = [
                          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
                        ];
                        const month = months[date.getMonth()];
                        setNewEventDate(`${day} ${month}`);
                        setShowDatePicker(false);
                      }}
                    >
                      <LinearGradient
                        colors={['#FF6B9D', '#FF9181', '#FFC168']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.confirmGradient}
                      >
                        <Text style={styles.confirmDateButtonText}>Выбрать дату</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
              
              <View style={styles.inputHelpContainer}>
                <CalendarIcon size={14} color={COLORS.gray500} style={{ marginRight: 4 }} />
                <Text style={styles.inputHelp}>Нажмите на поле выше, чтобы выбрать дату</Text>
              </View>
              
              <Text style={styles.inputLabel}>Ссылка на изображение (необязательно)</Text>
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
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddEvent}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Модальное окно подтверждения удаления */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Удалить событие?</Text>
            {eventToDelete && (
              <Text style={styles.deleteModalText}>
                Вы уверены, что хотите удалить событие "{eventToDelete.name}"?
              </Text>
            )}
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setEventToDelete(null);
                }}
              >
                <Text style={styles.cancelDeleteText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={handleDeleteEvent}
              >
                <Text style={styles.confirmDeleteText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  backButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButton: {
    marginRight: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  eventsList: {
    padding: 16,
    paddingBottom: 80,
  },
  eventCardContainer: {
    width: '100%',
    height: 180,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#FFF',
  },
  eventCardTouchable: {
    flex: 1,
  },
  eventImageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  eventBackgroundImage: {
    borderRadius: 12,
  },
  eventGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  deleteEventButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  eventContent: {
    width: '100%',
  },
  eventMainInfo: {
    marginBottom: 8,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetail: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  daysLeftText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,107,157,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  expandedContent: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  expandedText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generateButton: {
    marginTop: 8,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  expandedButton: {
    alignSelf: 'center',
    width: '90%',
    marginTop: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginRight: 6,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  expandButton: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  expandButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    marginBottom: 16,
  },
  addFirstEventButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstEventText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.gray800,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 12,
  },
  inputHelpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputHelp: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deleteModalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelDeleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addEventButtonContainer: {
    marginVertical: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(255, 107, 157, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addEventGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  addEventButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  datePickerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  datePickerPlaceholder: {
    color: COLORS.gray400,
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerModalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  datePickerMonths: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  monthButton: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 8,
  },
  selectedMonthButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  selectedMonthButtonText: {
    color: '#FFFFFF',
  },
  datePickerDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButtonWrapper: {
    margin: 4,
  },
  dayButton: {
    width: 50,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  selectedDayButtonText: {
    color: '#FFFFFF',
  },
  confirmDateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  confirmGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 3,
  },
  generatingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logsButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.gray300,
    borderRadius: 4,
  },
  logsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.gray200,
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewToggleActive: {
    backgroundColor: COLORS.primary,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
}); 