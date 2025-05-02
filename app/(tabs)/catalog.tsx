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

      <View style={styles.scrollContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product grid */}
          <View style={styles.productGrid}>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('catalog.noProducts')}</Text>
              </View>
            ) : (
              <View style={styles.productsContainer}>
                {filteredProducts.map((item, index) => {
                  const isOdd = index % 2 === 1;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.productCard,
                        {
                          marginLeft: isOdd ? SPACING.sm : 0,
                          marginRight: isOdd ? 0 : SPACING.sm
                        }
                      ]}
                      onPress={() => navigateToProductDetails(item)}
                      activeOpacity={0.95}
                    >
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                        <TouchableOpacity 
                          style={styles.favoriteButton}
                          onPress={() => handleToggleFavorite(item.id)}
                        >
                          <Heart 
                            size={18} 
                            color={COLORS.white} 
                            fill={item.isFavorite ? COLORS.secondary : 'transparent'} 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.productSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                        
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>${item.price.replace(/\s+₽/g, '')}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          
          {/* "See more" button at the bottom */}
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>see more</Text>
            <View style={styles.seeMoreArrow}>
              <ChevronRight size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

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
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  categoryTabs: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryTabsContent: {
    paddingRight: SPACING.md,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  productGrid: {
    marginTop: SPACING.md,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 6,
    height: 44,
  },
  productSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  filtersContainer: {
    padding: SPACING.lg,
  },
  mapSection: {
    padding: SPACING.lg,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    alignSelf: 'flex-end',
  },
  seeMoreText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  seeMoreArrow: {
    marginLeft: 4,
  },
});