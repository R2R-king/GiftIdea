import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useTheme } from '@/components/ThemeProvider';
import { Heart, ShoppingCart, ChevronLeft, Share2, Trash2 } from 'lucide-react-native';

// Моковые данные для избранных товаров
const FAVORITES_DATA = [
  {
    id: '1',
    name: 'Букет розовых роз',
    price: '2500₽',
    image: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=500',
    discount: '15%',
  },
  {
    id: '2',
    name: 'Набор шоколадных конфет "Люкс"',
    price: '1800₽',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500',
  },
  {
    id: '3',
    name: 'Подарочная коробка "Сюрприз"',
    price: '3200₽',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
    discount: '20%',
  },
  {
    id: '4',
    name: 'Плюшевый мишка (большой)',
    price: '1950₽',
    image: 'https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=500',
  },
];

export default function FavoritesScreen() {
  const { t } = useAppLocalization();
  const { theme, colors } = useTheme();
  const [favorites, setFavorites] = useState(FAVORITES_DATA);
  
  const isDark = theme === 'dark';
  
  const handleRemoveFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };
  
  const handleAddToCart = (id) => {
    // В реальном приложении здесь будет логика добавления в корзину
    console.log('Добавлено в корзину:', id);
  };
  
  const renderFavoriteItem = ({ item }) => (
    <View style={[styles.favoriteCard, { backgroundColor: isDark ? '#1E1E1E' : COLORS.white }]}>
      <View style={styles.favoriteImageContainer}>
        <Image source={{ uri: item.image }} style={styles.favoriteImage} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.favoriteInfo}>
        <Text style={[styles.favoriteName, { color: isDark ? '#FFFFFF' : COLORS.gray800 }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.favoritePrice, { color: isDark ? COLORS.primary : COLORS.primary }]}>
          {item.price}
        </Text>
        
        <View style={styles.favoriteActions}>
          <TouchableOpacity
            style={[styles.favoriteActionButton, { backgroundColor: isDark ? 'rgba(255, 107, 157, 0.15)' : `${COLORS.primary}15` }]}
            onPress={() => handleAddToCart(item.id)}
          >
            <ShoppingCart size={18} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.favoriteActionButton, { backgroundColor: isDark ? '#333333' : COLORS.gray100 }]}
            onPress={() => {}}
          >
            <Share2 size={18} color={isDark ? '#FFFFFF' : COLORS.gray600} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.favoriteActionButton, { backgroundColor: isDark ? 'rgba(255, 73, 73, 0.2)' : `${COLORS.error}20` }]}
            onPress={() => handleRemoveFromFavorites(item.id)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyFavoritesView = () => (
    <View style={styles.emptyContainer}>
      <Heart size={60} color={COLORS.primary} style={{ opacity: 0.5 }} />
      <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : COLORS.gray800 }]}>
        {t('favorites.emptyTitle')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? '#CCCCCC' : COLORS.gray600 }]}>
        {t('favorites.emptyDescription')}
      </Text>
      <TouchableOpacity
        style={styles.exploreCatalogButton}
        onPress={() => router.push('/(tabs)/catalog')}
      >
        <Text style={styles.exploreCatalogButtonText}>
          {t('favorites.exploreCatalog')}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : COLORS.white }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[isDark ? '#121212' : COLORS.primaryBackground, isDark ? '#121212' : COLORS.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Заголовок */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View>
            <Text style={styles.headerTitle}>
              {t('favorites.title')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length > 0 
                ? t('favorites.itemsCount', { count: favorites.length }) 
                : t('favorites.noItems')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Список избранных товаров */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.favoritesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyFavoritesView />
      )}
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  favoritesList: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  favoriteCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  favoriteImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  favoriteInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  favoriteName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  favoritePrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  favoriteActionButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  exploreCatalogButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  exploreCatalogButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 