import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Heart, ShoppingBag, MapPin, Star, ChevronRight, Search, SlidersHorizontal, X, Cake, Package, Building2, Truck, Globe, Coins, CreditCard, DollarSign, TreePine, HeartHandshake, Ticket, Palette } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import TabBarShadow from '@/components/TabBarShadow';
import Filters from '@/components/Filters';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import BudgetRangeFilter from '@/components/BudgetRangeFilter';
import MapGiftFinder from '@/components/MapGiftFinder';
import { useTheme } from '@/components/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import giftService from '@/services/giftService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

// Define styles first to avoid linter errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : RNStatusBar.currentHeight! + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 20,
    color: COLORS.gray700,
    marginBottom: SPACING.lg,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray800,
    marginLeft: SPACING.sm,
    paddingLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // To account for the tab bar
  },
  productCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  productImageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 6,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterScrollView: {
    maxHeight: 500,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  selectedOptionText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  occasion: string;
  budget: string;
  type: string;
  location: string;
  rating: number;
  isFavorite: boolean;
}

export default function CatalogScreen() {
  const { t, localizedData } = useAppLocalization();
  const { favoriteItems, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  // Get collection parameter from URL
  const { collection, name } = params;
  
  console.log('Catalog Screen Params:', params);
  
  const [activeFilters, setActiveFilters] = useState({
    occasion: '',
    budget: '',
    type: '',
    location: 'all',
    searchQuery: ''
  });

  // Добавляем состояния для работы с API
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    occasion: '',
    budget: '',
    type: '',
    location: 'all',
    searchQuery: ''
  });

  // Получение стилей на основе темы
  const getThemedStyles = useCallback(() => {
    return {
      backgroundColor: theme === 'dark' ? '#121212' : COLORS.white,
      cardBackground: theme === 'dark' ? '#1E1E1E' : COLORS.white,
      textPrimary: theme === 'dark' ? '#FFFFFF' : COLORS.gray900,
      textSecondary: theme === 'dark' ? '#FFFFFF' : COLORS.gray700,
      textTertiary: theme === 'dark' ? '#CCCCCC' : COLORS.gray500,
      borderColor: theme === 'dark' ? '#333333' : COLORS.gray200,
      favoriteButtonBg: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      categoryTabText: theme === 'dark' ? '#CCCCCC' : COLORS.gray500,
      categoryTabTextActive: theme === 'dark' ? '#FFFFFF' : COLORS.gray900,
      emptyText: theme === 'dark' ? '#CCCCCC' : COLORS.gray600,
    };
  }, [theme]);

  const themedStyles = getThemedStyles();

  // Загрузка товаров из Java-бэкенда при монтировании компонента
  useEffect(() => {
    loadProductsFromBackend();
  }, []);

  // Функция для загрузки товаров из бэкенда
  const loadProductsFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем данные из Java-бэкенда
      const gifts = await giftService.getAllGifts();
      
      // Конвертируем подарки в формат продуктов для фронтенда
      const productsFromGifts = gifts.map(gift => giftService.convertToProductFormat(gift));
      
      // Обновляем состояния с продуктами из Java-бэкенда
      setProducts(productsFromGifts);
    } catch (error) {
      console.error('Ошибка при загрузке данных из бэкенда:', error);
      setError('Не удалось загрузить товары. Пожалуйста, проверьте соединение с бэкендом.');
      
      // Если произошла ошибка, загружаем моковые данные как запасной вариант
      setProducts(localizedData.products.map(product => ({
        ...product,
        isFavorite: false
      })));
    } finally {
      setLoading(false);
    }
  };

  // Apply collection filters when component mounts or collection param changes
  useEffect(() => {
    if (collection) {
      console.log(`Applying filter for collection: ${collection}`);
      
      // Map collection IDs to filter types
      const filterMap: Record<string, Partial<typeof activeFilters>> = {
        'holidays': { occasion: 'holiday' },
        'hobbies': { type: 'hobby' },
        'age-groups': { type: 'age' },
        'budget': { budget: 'medium' }
      };
      
      const newFilters = filterMap[collection as string];
      
      if (newFilters) {
        setActiveFilters(prev => ({
          ...prev,
          ...newFilters
        }));
      }
    }
  }, [collection]);

  // Update local product state to match favorites in Redux
  useEffect(() => {
    if (products.length > 0) {
      const updatedProducts = products.map(product => ({
        ...product,
        isFavorite: favoriteItems.some(item => item.id === product.id)
      }));
      setProducts(updatedProducts);
    }
  }, [favoriteItems, products.length]);

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesOccasion = !activeFilters.occasion || product.occasion === activeFilters.occasion;
    const matchesBudget = !activeFilters.budget || product.budget === activeFilters.budget;
    const matchesType = !activeFilters.type || product.type === activeFilters.type;
    const matchesLocation = activeFilters.location === 'all' || product.location === activeFilters.location;
    const matchesSearch = !activeFilters.searchQuery || 
      product.name.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(activeFilters.searchQuery.toLowerCase());

    return matchesOccasion && matchesBudget && matchesType && matchesLocation && matchesSearch;
  });

  useEffect(() => {
    // Инициализируем selectedFilters текущими activeFilters
    setSelectedFilters({...activeFilters});
  }, [isFilterModalVisible]);

  const handleFilterSelect = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const applyFilters = () => {
    setActiveFilters({...selectedFilters});
    setIsFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedFilters({
      occasion: '',
      budget: '',
      type: '',
      location: 'all',
      searchQuery: activeFilters.searchQuery
    });
  };

  // Определяем опции фильтра
  const occasions = [
    { id: 'birthday', label: t('filters.occasions.birthday'), value: 'birthday', icon: Cake },
    { id: 'anniversary', label: t('filters.occasions.anniversary'), value: 'anniversary', icon: Heart },
    { id: 'new_year', label: t('filters.occasions.new_year'), value: 'new_year', icon: TreePine },
    { id: 'valentine', label: t('filters.occasions.valentine'), value: 'valentine', icon: HeartHandshake },
  ];

  const budgets = [
    { id: 'cheap', label: t('filters.budgets.cheap'), value: 'cheap', icon: Coins },
    { id: 'medium', label: t('filters.budgets.medium'), value: 'medium', icon: CreditCard },
    { id: 'expensive', label: t('filters.budgets.expensive'), value: 'expensive', icon: DollarSign },
  ];

  const giftTypes = [
    { id: 'emotional', label: t('filters.types.emotional'), value: 'emotional', icon: Heart },
    { id: 'practical', label: t('filters.types.practical'), value: 'practical', icon: Package },
    { id: 'experience', label: t('filters.types.experience'), value: 'experience', icon: Ticket },
    { id: 'handmade', label: t('filters.types.handmade'), value: 'handmade', icon: Palette },
  ];

  const locations = [
    { id: 'all', label: t('filters.locations.all'), value: 'all', icon: Globe },
    { id: 'nearby', label: t('filters.locations.nearby'), value: 'nearby', icon: Building2 },
    { id: 'delivery', label: t('filters.locations.delivery'), value: 'delivery', icon: Truck },
  ];

  // Рендер секции фильтра
  const renderFilterSection = (title: string, options: any[], category: keyof typeof selectedFilters) => (
    <View style={styles.filterSection}>
      <Text style={[styles.sectionTitle, {color: theme === 'dark' ? COLORS.white : COLORS.gray900}]}>
        {title}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map(option => {
          const Icon = option.icon;
          const isSelected = selectedFilters[category] === option.value;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption
              ]}
              onPress={() => handleFilterSelect(category, option.value)}
            >
              <Icon 
                size={16} 
                color={isSelected ? '#FFFFFF' : theme === 'dark' ? COLORS.gray400 : COLORS.gray600} 
              />
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
                {color: isSelected ? '#FFFFFF' : theme === 'dark' ? COLORS.gray300 : COLORS.gray700}
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Функция для перехода к деталям товара
  const navigateToProductDetails = (item: Product) => {
    router.push({
      pathname: '/product-details',
      params: { productId: item.id }
    });
  };

  // Функция для добавления товара в корзину
  const handleAddToCart = (item: Product, event: any) => {
    // Останавливаем всплытие события, чтобы не переходить на страницу деталей
    event.stopPropagation();
    
    try {
      // Преобразование цены из строки в число
      const numericPrice = parseFloat(item.price.replace(/\s+/g, '').replace('₽', '').replace(',', '.'));
      
      if (isNaN(numericPrice)) {
        console.error('Не удалось преобразовать цену в число:', item.price);
        return;
      }
      
      // Добавляем товар в корзину
      addItem({
        id: item.id,
        name: item.name,
        price: numericPrice,
        quantity: 1,
        image: item.image,
        subtitle: item.subtitle
      });
      
      // Показать всплывающее сообщение об успешном добавлении
      Alert.alert('Товар добавлен в корзину', '', [{ text: 'OK' }], { cancelable: true });
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    }
  };

  // Update the product item rendering
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, {backgroundColor: themedStyles.cardBackground}]}
      onPress={() => navigateToProductDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
        />
        <TouchableOpacity 
          style={[styles.favoriteButton, {backgroundColor: themedStyles.favoriteButtonBg}]}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Heart 
            size={18} 
            color={item.isFavorite ? COLORS.secondary : COLORS.gray600} 
            fill={item.isFavorite ? COLORS.secondary : 'transparent'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, {color: themedStyles.textPrimary}]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productSubtitle, {color: themedStyles.textTertiary}]} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.productPrice}>{item.price} ₽</Text>
      </View>
    </TouchableOpacity>
  );

  // Содержимое при загрузке
  const renderLoadingContent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.loadingText, {color: themedStyles.textSecondary}]}>
        Загружаем товары...
      </Text>
    </View>
  );

  // Содержимое при ошибке
  const renderErrorContent = () => (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorText, {color: COLORS.secondary}]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadProductsFromBackend}
      >
        <Text style={styles.retryButtonText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );

  const handleToggleFavorite = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Добавляем интеграцию с Java-бэкендом
      try {
        const numericId = parseInt(productId);
        if (!isNaN(numericId)) {
          await giftService.toggleFavorite(numericId);
        }
      } catch (error) {
        console.error('Ошибка при переключении избранного в бэкенде:', error);
      }
      
      // Обновляем локальное состояние через Redux
      toggleFavorite(product);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: themedStyles.backgroundColor}]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[theme === 'dark' ? '#121212' : COLORS.primaryBackground, theme === 'dark' ? '#121212' : COLORS.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: themedStyles.textPrimary}]}>
          {name || 'Магазин подарков'}
        </Text>
        <Text style={[styles.headerSubtitle, {color: themedStyles.textSecondary}]}>
          Подарки на любой вкус
        </Text>
      </View>
      
      {/* Строка поиска */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme === 'dark' ? '#1E1E1E' : COLORS.white }]}>
        <Search size={20} color={COLORS.gray500} />
        <TextInput
          style={[styles.searchInput, { color: theme === 'dark' ? COLORS.white : COLORS.gray800 }]}
          placeholder="Поиск..."
          placeholderTextColor={theme === 'dark' ? COLORS.gray500 : COLORS.gray500}
          value={activeFilters.searchQuery}
          onChangeText={(text) => setActiveFilters(prev => ({ ...prev, searchQuery: text }))}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <SlidersHorizontal size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
      
      {/* Модальное окно фильтров */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E1E1E' : COLORS.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme === 'dark' ? COLORS.white : COLORS.gray900 }]}>
                Фильтры
              </Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X size={24} color={theme === 'dark' ? COLORS.white : COLORS.gray800} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersScroll}>
              {renderFilterSection(t('filters.occasions.title'), occasions, 'occasion')}
              {renderFilterSection(t('filters.budgets.title'), budgets, 'budget')}
              {renderFilterSection(t('filters.types.title'), giftTypes, 'type')}
              {renderFilterSection(t('filters.locations.title'), locations, 'location')}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearFilters}
              >
                <Text style={[styles.clearButtonText, { color: theme === 'dark' ? COLORS.gray300 : COLORS.gray700 }]}>
                  Очистить
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>
                  Применить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Основное содержимое */}
      {loading ? (
        renderLoadingContent()
      ) : error ? (
        renderErrorContent()
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={styles.productsGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: themedStyles.emptyText}]}>
                {t('catalog.noProductsFound')}
              </Text>
            </View>
          )}
        </>
      )}
      
      <TabBarShadow />
    </View>
  );
}