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
} from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, ArrowUpRight, Search, Filter, Heart, Gift, Star, ShoppingCart, X } from 'lucide-react-native';
import TabBarShadow from '@/components/TabBarShadow';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

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

export default function FeedScreen() {
  const { t, localizedData } = useAppLocalization();
  const { events } = localizedData;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({
    '2': true, // Teddy Bear предустановлен как избранный
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [showGreeting, setShowGreeting] = useState(true);

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

  // Функция для обработки нажатия на событие
  const handleEventPress = (event: any) => {
    // В будущем можно использовать router.push для перехода на страницу детализации
    // router.push(`/event-details/${event.id}`);
    
    // Пока такой страницы нет, покажем Alert с информацией о событии
    Alert.alert(
      event.title,
      event.description,
      [
        { text: 'Закрыть', style: 'cancel' },
        { text: 'Подробнее', onPress: () => console.log('Переход на детали события', event.id) }
      ]
    );
  };

  // Функция для обработки нажатия на кнопку поиска
  const handleSearchPress = () => {
    Alert.alert('Поиск', 'Поиск событий будет доступен в будущих обновлениях');
  };
  
  // Функция для обработки нажатия на кнопку фильтра
  const handleFilterPress = () => {
    Alert.alert('Фильтр', 'Фильтрация событий будет доступна в будущих обновлениях');
  };

  // Функция для обработки нажатия на элемент
  const handleItemPress = (item: any) => {
    Alert.alert(
      item.name || item.title,
      item.description || `Цена: ${item.price}, Рейтинг: ${item.rating}`,
      [
        { text: 'Закрыть', style: 'cancel' },
        { text: 'Подробнее', onPress: () => console.log('Переход на детали', item.id) }
      ]
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites({
      ...favorites,
      [id]: !favorites[id]
    });
  };

  const navigateToDetails = (item: any) => {
    Alert.alert(
      item.name,
      `View details for ${item.name}. Price: ${item.price}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View More', onPress: () => console.log('Navigate to details', item.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[COLORS.valentineBackground, COLORS.valentineLightBackground]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <StatusBar style="light" />
      
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Спецпредложения */}
        <View style={styles.specialsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('feed.specialOffers')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('feed.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialsScrollContent}
          >
            {discountItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                activeOpacity={0.9}
                onPress={() => handleItemPress(item)}
              >
                <LinearGradient
                  colors={item.color}
                  style={styles.specialCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.specialCardContent}>
                    <Text style={styles.specialCardTitle}>{item.title}</Text>
                    <Text style={styles.specialCardDescription}>{item.description}</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>{t('feed.viewButton')}</Text>
                    </TouchableOpacity>
                  </View>
                  <Image source={{ uri: item.image }} style={styles.specialCardImage} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Категории */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t('feed.categories')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  category.isActive && styles.activeCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Image 
                  source={{ uri: category.icon }} 
                  style={styles.categoryIcon} 
                />
                <Text
                  style={[
                    styles.categoryText,
                    category.isActive && styles.activeCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Популярные продукты */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('feed.popular')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('feed.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {popularProducts.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCard}
                onPress={() => navigateToDetails(product)}
                activeOpacity={0.9}
              >
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(product.id)}
                    activeOpacity={0.7}
                  >
                    <Heart 
                      size={16} 
                      color="#FFFFFF" 
                      fill={favorites[product.id] ? "#FF0844" : "transparent"} 
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={12} color="#FFC107" fill="#FFC107" />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Раздел идей для подарков */}
        <View style={styles.ideasSection}>
          <LinearGradient
            colors={['rgba(255,94,135,0.1)', 'rgba(255,8,68,0.1)']}
            style={styles.ideasContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ideasContent}>
              <Gift size={28} color="#FF0844" />
              <Text style={styles.ideasTitle}>{t('feed.giftIdeas')}</Text>
              <Text style={styles.ideasDescription}>
                {t('feed.giftIdeasDesc')}
              </Text>
              <TouchableOpacity 
                style={styles.ideasButton}
                onPress={() => router.push("/gift-assistant" as any)}
              >
                <Text style={styles.ideasButtonText}>{t('feed.startButton')}</Text>
                <ArrowUpRight size={16} color="#FF0844" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

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
});