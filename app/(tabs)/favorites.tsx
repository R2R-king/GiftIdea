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
import { useTheme } from '@/components/ThemeProvider';

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
  const { theme, colors } = useTheme();
  
  // Функция для получения стилей на основе темы
  const getThemedStyles = React.useCallback(() => {
    return {
      backgroundColor: theme === 'dark' ? '#121212' : COLORS.white,
      cardBackground: theme === 'dark' ? '#1E1E1E' : COLORS.white,
      textPrimary: theme === 'dark' ? '#FFFFFF' : COLORS.gray800,
      textSecondary: theme === 'dark' ? '#FFFFFF' : COLORS.gray600,
      textTertiary: theme === 'dark' ? '#CCCCCC' : COLORS.gray500,
      borderColor: theme === 'dark' ? '#333333' : COLORS.gray200,
      iconColor: theme === 'dark' ? '#FFFFFF' : COLORS.gray600,
      emptyStateIconColor: theme === 'dark' ? '#444444' : COLORS.gray300,
    };
  }, [theme]);

  const themedStyles = getThemedStyles();

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
      style={[styles.favoriteItem, { backgroundColor: themedStyles.cardBackground }]}
      onPress={() => navigateToProductDetails(item)}
      activeOpacity={0.9}
    >
      <View style={styles.favoriteImageContainer}>
        <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      </View>
      <View style={styles.favoriteContent}>
        <View>
          <Text style={[styles.favoriteName, { color: themedStyles.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.favoriteSubtitle, { color: themedStyles.textTertiary }]}>{item.subtitle}</Text>
          <Text style={styles.favoritePrice}>{item.price}</Text>
        </View>
        <View style={styles.favoriteActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton, { backgroundColor: theme === 'dark' ? '#333333' : COLORS.gray100 }]}
            onPress={() => removeFavorite(item.id)}
          >
            <X size={18} color={themedStyles.iconColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => addToCart(item)}
          >
            <ShoppingBag size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themedStyles.backgroundColor }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[theme === 'dark' ? '#121212' : COLORS.primaryBackground, theme === 'dark' ? '#121212' : COLORS.white]}
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
        contentContainerStyle={[styles.favoritesList, { backgroundColor: theme === 'dark' ? '#121212' : 'transparent' }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme === 'dark' ? '#121212' : 'transparent' }]}>
            <Heart size={64} color={themedStyles.emptyStateIconColor} />
            <Text style={[styles.emptyTitle, { color: themedStyles.textPrimary }]}>
              {t('favorites.empty')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themedStyles.textSecondary }]}>
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
    ...SHADOWS.purple,
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
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  browseButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
}); 