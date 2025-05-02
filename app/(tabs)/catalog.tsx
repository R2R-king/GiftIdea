import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Heart, ShoppingBag, MapPin, Star, ChevronRight } from 'lucide-react-native';
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
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
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
  categoryTabs: {
    marginBottom: SPACING.md,
  },
  categoryTabsContent: {
    paddingRight: SPACING.lg,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  categoryTabTextActive: {
    color: COLORS.gray900,
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray800,
    marginLeft: SPACING.sm,
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

  // Исходный список товаров из локализованных данных
  const [products, setProducts] = useState<Product[]>(() => 
    localizedData.products.map(product => ({
      ...product,
      isFavorite: false
    }))
  );

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
    const updatedProducts = products.map(product => ({
      ...product,
      isFavorite: favoriteItems.some(item => item.id === product.id)
    }));
    setProducts(updatedProducts);
  }, [favoriteItems]);

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

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
  };

  const handleToggleFavorite = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      toggleFavorite(product);
    }
  };

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
      style={styles.productCard}
      onPress={() => navigateToProductDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
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
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.productPrice}>$ {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[COLORS.primaryBackground, COLORS.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fabulous</Text>
        <Text style={styles.headerSubtitle}>gifts for everyone</Text>
        
        {/* Category tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          <TouchableOpacity 
            style={[styles.categoryTab, styles.categoryTabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryTabText, styles.categoryTabTextActive]}>Flower</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab} activeOpacity={0.7}>
            <Text style={styles.categoryTabText}>Cake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab} activeOpacity={0.7}>
            <Text style={styles.categoryTabText}>Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab} activeOpacity={0.7}>
            <Text style={styles.categoryTabText}>Toys</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Product grid */}
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
          <Text style={styles.emptyText}>
            {t('catalog.noProductsFound')}
          </Text>
        </View>
      )}
      
      <TabBarShadow />
    </View>
  );
}