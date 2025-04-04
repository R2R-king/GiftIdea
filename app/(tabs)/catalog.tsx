import React, { useState } from 'react';
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
} from 'react-native';
import { Heart, ShoppingBag, MapPin, Star } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import TabBarShadow from '@/components/TabBarShadow';
import Filters from '@/components/Filters';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

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
  const { t } = useAppLocalization();
  const [activeFilters, setActiveFilters] = useState({
    occasion: '',
    budget: '',
    type: '',
    location: 'all',
    searchQuery: ''
  });

  // Исходный список товаров
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Valentine\'s Rose Bouquet',
      subtitle: 'Fresh roses with gift wrap',
      price: '$49.99',
      image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=300',
      occasion: 'valentine',
      budget: 'expensive',
      type: 'emotional',
      location: 'delivery',
      rating: 4.8,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Heart Shaped Chocolates',
      subtitle: 'Premium Belgian chocolate',
      price: '$24.99',
      image: 'https://images.unsplash.com/photo-1582394785765-717d6a5e1c21?w=300',
      occasion: 'valentine',
      budget: 'medium',
      type: 'emotional',
      location: 'nearby',
      rating: 4.5,
      isFavorite: false
    },
    {
      id: '3',
      name: 'Cute Teddy Bear',
      subtitle: 'Soft plush with heart',
      price: '$19.99',
      image: 'https://images.unsplash.com/photo-1605980625600-88c7a85c31cd?w=300',
      occasion: 'valentine',
      budget: 'cheap',
      type: 'emotional',
      location: 'nearby',
      rating: 4.2,
      isFavorite: false
    },
    {
      id: '4',
      name: 'Love Letter Stationery',
      subtitle: 'Luxury paper set with envelopes',
      price: '$14.99',
      image: 'https://images.unsplash.com/photo-1567011355042-42ce535e6a82?w=300',
      occasion: 'valentine',
      budget: 'cheap',
      type: 'handmade',
      location: 'delivery',
      rating: 4.3,
      isFavorite: false
    },
    {
      id: '5',
      name: 'Valentine\'s Day Card',
      subtitle: 'Handcrafted with message',
      price: '$5.99',
      image: 'https://images.unsplash.com/photo-1549048144-9d2a7495ef3e?w=300',
      occasion: 'valentine',
      budget: 'cheap',
      type: 'handmade',
      location: 'nearby',
      rating: 4.0,
      isFavorite: true
    },
    {
      id: '6',
      name: 'Diamond Pendant Necklace',
      subtitle: 'Sterling silver with heart charm',
      price: '$129.99',
      image: 'https://images.unsplash.com/photo-1588444650733-d76f8a408aae?w=300',
      occasion: 'valentine',
      budget: 'expensive',
      type: 'emotional',
      location: 'delivery',
      rating: 4.9,
      isFavorite: false
    }
  ]);

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

  const toggleFavorite = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? {...product, isFavorite: !product.isFavorite}
        : product
    ));
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    // Determine if the item should be rendered on the left or right
    const isOdd = index % 2 === 1;
    
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          {
            marginLeft: isOdd ? SPACING.sm : 0,
            marginRight: isOdd ? 0 : SPACING.sm
          }
        ]}
        onPress={() => router.push('/product-details')}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Heart 
              size={18} 
              color={COLORS.white} 
              fill={item.isFavorite ? COLORS.primary : 'transparent'} 
            />
          </TouchableOpacity>
          
          <View style={styles.locationBadge}>
            <MapPin size={12} color={COLORS.gray500} />
            <Text style={styles.locationText}>
              {item.location === 'nearby' ? t('filters.locations.nearby') : t('filters.locations.delivery')}
            </Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <View style={styles.ratingContainer}>
            <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
          
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addButton}>
              <ShoppingBag size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.valentinePink} />
      
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
        <Text style={styles.headerTitle}>{t('catalog.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('catalog.subtitle')}</Text>
      </LinearGradient>

      {/* Фильтры */}
      <Filters onApplyFilters={handleApplyFilters} />

      {/* Список товаров */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('catalog.noProducts')}</Text>
          </View>
        }
      />

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
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.pink,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  productList: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  locationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginLeft: 2,
  },
  productInfo: {
    padding: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray700,
    marginLeft: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
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
    color: COLORS.valentinePink,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.valentinePink,
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
  }
});