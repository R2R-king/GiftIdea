import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Heart, ShoppingBag, X, ChevronRight } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import TabBarShadow from '@/components/TabBarShadow';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';

const { width } = Dimensions.get('window');

interface FavoriteItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  rating?: number;
  location?: string;
}

export default function FavoritesScreen() {
  const { t } = useAppLocalization();
  const { favoriteItems, removeFavorite } = useFavorites();
  
  // Функция для перехода к деталям товара
  const navigateToProductDetails = (item: FavoriteItem) => {
    router.push({
      pathname: '/product-details',
      params: { productId: item.id }
    });
  };

  // Функция для добавления товара в корзину
  const addToCart = (item: FavoriteItem) => {
    Alert.alert(t('favorites.addedToCart'));
    // Здесь будет логика добавления в корзину
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => navigateToProductDetails(item)}
      activeOpacity={0.9}
    >
      <View style={styles.favoriteImageContainer}>
        <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      </View>
      <View style={styles.favoriteContent}>
        <View>
          <Text style={styles.favoriteName}>{item.name}</Text>
          <Text style={styles.favoriteSubtitle}>{item.subtitle}</Text>
          <Text style={styles.favoritePrice}>{item.price}</Text>
        </View>
        <View style={styles.favoriteActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => removeFavorite(item.id)}
          >
            <X size={18} color={COLORS.gray600} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => addToCart(item)}
          >
            <ShoppingBag size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>
          {t('favorites.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('favorites.subtitle')}
        </Text>
      </LinearGradient>

      {/* Список избранного */}
      <FlatList
        data={favoriteItems}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.favoritesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={64} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>{t('favorites.empty')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('favorites.emptyDesc')}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/catalog')}
            >
              <Text style={styles.browseButtonText}>
                {t('favorites.browse')}
              </Text>
            </TouchableOpacity>
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
  favoritesList: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  favoriteImageContainer: {
    width: 120,
    height: 120,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteContent: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  favoriteName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  favoriteSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  favoritePrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.valentinePink,
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: COLORS.gray100,
  },
  addButton: {
    backgroundColor: COLORS.valentinePink,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.gray700,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.valentinePink,
    borderRadius: RADIUS.md,
  },
  browseButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
}); 