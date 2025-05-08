import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { 
  Trash2, 
  Heart, 
  ShoppingBag,
  CreditCard,
  MapPin,
  Truck,
  Package,
  CalendarClock,
  ChevronLeft,
  ArrowUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import TabBarShadow from '@/components/TabBarShadow';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/components/ThemeProvider';
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { CartItem } from '@/store/slices/cartSlice';

const { width } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Функция для форматирования цены в рублях с защитой от ошибок
const formatPrice = (price: number): string => {
  try {
    return price.toLocaleString('ru-RU') + ' ₽';
  } catch (error) {
    console.error('Ошибка при форматировании цены:', error);
    return price + ' ₽';
  }
};

export default function CartScreen() {
  const { t } = useAppLocalization();
  const { theme, colors } = useTheme();
  const scrollY = useSharedValue(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Используем хук для работы с корзиной
  const { 
    cartItems, 
    getTotalItems, 
    getTotalPrice, 
    removeItem, 
    increaseQuantity, 
    decreaseQuantity 
  } = useCart();
  
  // Используем хук для работы с избранным
  const { toggleFavorite, isFavorite } = useFavorites();

  // Мемоизированные расчеты для предотвращения лишних ререндеров
  const { subtotal, shipping, discount, total } = useMemo(() => {
    const calculatedSubtotal = getTotalPrice();
    const calculatedShipping = calculatedSubtotal > 0 ? 450 : 0;
    const calculatedDiscount = calculatedSubtotal > 0 ? 500 : 0;
    const calculatedTotal = calculatedSubtotal + calculatedShipping - calculatedDiscount;
    
    return {
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      discount: calculatedDiscount,
      total: calculatedTotal
    };
  }, [getTotalPrice]);

  // Исправлен обработчик прокрутки с дополнительными проверками
  const scrollHandler = useAnimatedScrollHandler((event) => {
    try {
      if (event && typeof event.contentOffset === 'object' && event.contentOffset !== null) {
        const y = event.contentOffset.y;
        if (typeof y === 'number' && !isNaN(y)) {
          scrollY.value = y;
          if (y > 200) {
            runOnJS(setShowScrollTop)(true);
          } else {
            runOnJS(setShowScrollTop)(false);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка в обработчике прокрутки:', error);
    }
  });

  // Безопасная обработка прокрутки вверх
  const handleScrollToTop = useCallback(() => {
    try {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } catch (error) {
      console.error('Ошибка при прокрутке вверх:', error);
    }
  }, []);

  // Анимация для кнопки прокрутки вверх
  const scrollToTopButtonStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: withSpring(showScrollTop ? 1 : 0),
        transform: [{ scale: withSpring(showScrollTop ? 1 : 0) }],
      };
    } catch (error) {
      console.error('Ошибка в анимированном стиле:', error);
      return { opacity: showScrollTop ? 1 : 0 };
    }
  });

  // Функция для получения текста с правильным окончанием
  const getItemsText = useCallback((count: number) => {
    try {
      if (count === 1) {
        return `1 ${t('cart.item')}`;
      } else if (count > 1 && count < 5) {
        return `${count} ${t('cart.items')}`;
      } else {
        return `${count} ${t('cart.manyItems')}`;
      }
    } catch (error) {
      console.error('Ошибка при форматировании количества товаров:', error);
      return count + ' ' + t('cart.items');
    }
  }, [t]);

  // Безопасный переход к другим экранам
  const navigateToCatalog = useCallback(() => {
    try {
      router.push('/(tabs)/catalog');
    } catch (error) {
      console.error('Ошибка при переходе к каталогу:', error);
    }
  }, []);

  // Безопасный вызов всплывающего окна
  const handleCheckout = useCallback(() => {
    try {
      Alert.alert('Заказ оформлен', 'Спасибо за покупку!');
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
    }
  }, []);

  // Функция для удаления товара из корзины с подтверждением
  const handleRemoveItem = useCallback((itemId: string) => {
    try {
      // Показать подтверждение перед удалением
      Alert.alert(
        "Удаление товара",
        "Вы уверены, что хотите удалить этот товар из корзины?",
        [
          {
            text: "Отмена",
            style: "cancel"
          },
          { 
            text: "Удалить", 
            onPress: () => {
              removeItem(itemId);
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
    }
  }, [removeItem]);

  // Функция для добавления/удаления из избранного
  const handleToggleFavorite = useCallback((item: CartItem) => {
    try {
      toggleFavorite({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle || '',
        price: formatPrice(item.price),
        image: item.image,
        rating: 5,
        location: 'delivery'
      });
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error);
    }
  }, [toggleFavorite]);

  // Настройки стилей для темной темы и светлой темы
  const getThemedStyles = useCallback(() => {
    return {
      backgroundColor: theme === 'dark' ? '#121212' : COLORS.white,
      cardBackground: theme === 'dark' ? '#1E1E1E' : COLORS.white,
      textPrimary: theme === 'dark' ? '#FFFFFF' : COLORS.gray800,
      textSecondary: theme === 'dark' ? '#FFFFFF' : COLORS.gray600,
      textTertiary: theme === 'dark' ? '#CCCCCC' : COLORS.gray500,
      borderColor: theme === 'dark' ? '#333333' : COLORS.gray200,
      quantityBg: theme === 'dark' ? '#333333' : COLORS.gray100,
      quantityBorderColor: theme === 'dark' ? '#444444' : COLORS.gray200,
      quantityTextColor: theme === 'dark' ? '#FFFFFF' : COLORS.gray700,
      removeBtnBg: theme === 'dark' ? '#333333' : COLORS.gray100,
      removeBtnIconColor: theme === 'dark' ? '#FFFFFF' : COLORS.gray600,
      emptyStateIconColor: theme === 'dark' ? '#444444' : COLORS.gray300,
    };
  }, [theme]);

  const themedStyles = getThemedStyles();

  // Рендер элемента корзины с обработкой ошибок
  const renderCartItem = useCallback(({ item }: { item: CartItem }) => {
    return (
      <View key={item.id} style={[styles.cartItem, {backgroundColor: themedStyles.cardBackground}]}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.itemImage} 
          defaultSource={require('@/assets/images/icon.png')}
        />
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, {color: themedStyles.textPrimary}]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
          
          <View style={styles.itemActions}>
            <View style={[styles.quantityContainer, {borderColor: themedStyles.quantityBorderColor}]}>
              <TouchableOpacity 
                style={[styles.quantityButton, {backgroundColor: themedStyles.quantityBg}]}
                onPress={() => decreaseQuantity(item.id)}
              >
                <Text style={[styles.quantityButtonText, {color: themedStyles.quantityTextColor}]}>-</Text>
              </TouchableOpacity>
              
              <Text style={[styles.quantityText, {color: themedStyles.textPrimary}]}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={[styles.quantityButton, {backgroundColor: themedStyles.quantityBg}]}
                onPress={() => increaseQuantity(item.id)}
              >
                <Text style={[styles.quantityButtonText, {color: themedStyles.quantityTextColor}]}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.favoriteButton, { 
                  backgroundColor: isFavorite(item.id) ? 
                    (theme === 'dark' ? 'rgba(255, 107, 157, 0.3)' : `${COLORS.primary}30`) : 
                    (theme === 'dark' ? '#333333' : COLORS.gray100)
                }]}
                onPress={() => handleToggleFavorite(item)}
              >
                <Heart 
                  size={18} 
                  color={COLORS.primary}
                  fill={isFavorite(item.id) ? COLORS.primary : 'transparent'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.removeButton, {backgroundColor: themedStyles.removeBtnBg}]}
                onPress={() => handleRemoveItem(item.id)}
              >
                <Trash2 size={18} color={themedStyles.removeBtnIconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }, [decreaseQuantity, increaseQuantity, handleRemoveItem, handleToggleFavorite, isFavorite, themedStyles, theme]);

  // Отображаем пустое состояние корзины, если нет товаров
  const renderEmptyCart = useCallback(() => {
    return (
      <View style={[styles.emptyCartContainer, {backgroundColor: theme === 'dark' ? '#121212' : 'transparent'}]}>
        <ShoppingBag size={80} color={themedStyles.emptyStateIconColor} />
        <Text style={[styles.emptyCartTitle, {color: themedStyles.textPrimary}]}>
          {t('cart.emptyCart')}
        </Text>
        <Text style={[styles.emptyCartDescription, {color: themedStyles.textSecondary}]}>
          {t('cart.emptyCartDesc')}
        </Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={navigateToCatalog}
        >
          <Text style={styles.browseButtonText}>{t('cart.backToShopping')}</Text>
        </TouchableOpacity>
      </View>
    );
  }, [t, navigateToCatalog, theme, themedStyles]);

  return (
    <SafeAreaView style={[styles.safeAreaContainer, {backgroundColor: theme === 'dark' ? '#121212' : COLORS.primaryBackground}]}>
      <View style={[styles.container, {backgroundColor: theme === 'dark' ? '#121212' : COLORS.white}]}>
        {/* Фоновые элементы */}
        <LinearGradient
          colors={[theme === 'dark' ? '#121212' : COLORS.primaryBackground, theme === 'dark' ? '#121212' : COLORS.white]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <StatusBar style={theme === 'dark' ? 'light' : 'light'} />
        
        {/* Заголовок */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {getItemsText(getTotalItems())}
          </Text>
        </LinearGradient>

        <AnimatedScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, {backgroundColor: theme === 'dark' ? '#121212' : 'transparent'}]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Элементы корзины или пустое состояние */}
          {cartItems.length > 0 ? (
            <>
              <View style={styles.cartItemsContainer}>
                {cartItems.map(item => renderCartItem({ item }))}
              </View>

              {/* Доставка и итоги только если есть товары */}
              <View style={styles.cartSummarySection}>
                <View style={[styles.deliverySection, {backgroundColor: themedStyles.cardBackground, borderColor: themedStyles.borderColor}]}>
                  <Text style={[styles.sectionTitle, {color: themedStyles.textPrimary}]}>{t('cart.shippingOptionsTitle')}</Text>
                  
                  <TouchableOpacity style={[styles.deliveryOption, {backgroundColor: themedStyles.cardBackground, borderColor: themedStyles.borderColor}]}>
                    <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                      <Truck size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.deliveryDetails}>
                      <Text style={[styles.deliveryTitle, {color: themedStyles.textPrimary}]}>{t('cart.standardDelivery')}</Text>
                      <Text style={[styles.deliveryDate, {color: themedStyles.textTertiary}]}>14 - 16 февраля</Text>
                    </View>
                    <Text style={[styles.deliveryPrice, {color: themedStyles.textPrimary}]}>{formatPrice(450)}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.deliveryOption, styles.selectedDelivery]}>
                    <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                      <CalendarClock size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.deliveryDetails}>
                      <Text style={[styles.deliveryTitle, {color: themedStyles.textPrimary}]}>{t('cart.expressDelivery')}</Text>
                      <Text style={[styles.deliveryDate, {color: themedStyles.textTertiary}]}>13 февраля</Text>
                    </View>
                    <Text style={[styles.deliveryPrice, {color: themedStyles.textPrimary}]}>{formatPrice(900)}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.deliveryOption, {backgroundColor: themedStyles.cardBackground, borderColor: themedStyles.borderColor}]}>
                    <View style={[styles.deliveryIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                      <Package size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.deliveryDetails}>
                      <Text style={[styles.deliveryTitle, {color: themedStyles.textPrimary}]}>{t('cart.pickupDelivery')}</Text>
                      <Text style={[styles.deliveryDate, {color: themedStyles.textTertiary}]}>{t('cart.today')}</Text>
                    </View>
                    <Text style={[styles.deliveryPrice, {color: themedStyles.textPrimary}]}>{t('cart.free')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.cartTotals, {backgroundColor: themedStyles.cardBackground}]}>
                  <Text style={[styles.sectionTitle, {color: themedStyles.textPrimary}]}>{t('cart.orderSummaryTitle')}</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, {color: themedStyles.textTertiary}]}>{t('cart.subtotalLabel')}</Text>
                    <Text style={[styles.summaryValue, {color: themedStyles.textPrimary}]}>{formatPrice(subtotal)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, {color: themedStyles.textTertiary}]}>{t('cart.shippingLabel')}</Text>
                    <Text style={[styles.summaryValue, {color: themedStyles.textPrimary}]}>{formatPrice(shipping)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, {color: themedStyles.textTertiary}]}>{t('cart.discountLabel')}</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.primary }]}>-{formatPrice(discount)}</Text>
                  </View>
                  
                  <View style={[styles.summaryRow, styles.totalRow, {borderTopColor: themedStyles.borderColor}]}>
                    <Text style={[styles.totalLabel, {color: themedStyles.textPrimary}]}>{t('cart.totalLabel')}</Text>
                    <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            renderEmptyCart()
          )}
        </AnimatedScrollView>

        {/* Кнопка прокрутки вверх */}
        <Animated.View style={[styles.scrollTopButton, scrollToTopButtonStyle]}>
          <TouchableOpacity onPress={handleScrollToTop} style={styles.scrollTopButtonContent}>
            <ArrowUp size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Кнопки внизу экрана - показываем только если есть товары */}
        {cartItems.length > 0 && (
          <View style={[
            styles.bottomButtonsContainer, 
            {
              backgroundColor: theme === 'dark' ? '#1E1E1E' : COLORS.white, 
              borderTopColor: theme === 'dark' ? '#333333' : COLORS.gray200
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.backToShoppingButton,
                {borderColor: COLORS.primary}
              ]}
              onPress={navigateToCatalog}
            >
              <ChevronLeft size={20} color={COLORS.primary} />
              <Text style={styles.backToShoppingText}>{t('cart.backToShopping')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>{t('cart.proceedToCheckout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TabBarShadow />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
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
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
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
  scrollContent: {
    paddingBottom: 200,
  },
  cartItemsContainer: {
    padding: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  itemImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartSummarySection: {
    padding: SPACING.lg,
  },
  deliverySection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.sm,
  },
  selectedDelivery: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  deliveryDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
  deliveryPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  cartTotals: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
    zIndex: 10,
  },
  backToShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  backToShoppingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.purple,
  },
  checkoutButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.purple,
    zIndex: 10,
  },
  scrollTopButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: 100,
  },
  emptyCartTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.gray800,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyCartDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
}); 