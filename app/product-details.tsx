import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar as RNStatusBar,
  Alert,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Heart, ShoppingBag, Gift, Plus, Check, X, ExternalLink } from 'lucide-react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { useCart } from '@/hooks/useCart';
import { useWishlists, WishlistItem } from '@/hooks/useWishlists';
import { useTheme } from '@/components/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import giftService from '@/services/giftService';

const { width, height } = Dimensions.get('window');

// Варианты объёма парфюма
const volumeOptions = [
  { value: '50 мл', price: '3 000 ₽' },
  { value: '100 мл', price: '3 400 ₽' },
  { value: '150 мл', price: '3 800 ₽' },
];

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { localizedData } = useAppLocalization();
  const { addItem, isInCart } = useCart();
  const { theme } = useTheme();
  const { 
    wishlists, 
    isItemInAnyWishlist, 
    addItemToWishlist, 
    getWishlistsForItem,
    createWishlist 
  } = useWishlists();
  
  const [selectedVolume, setSelectedVolume] = useState('150 мл');
  const [price, setPrice] = useState('');
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);
  const [createWishlistModalVisible, setCreateWishlistModalVisible] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  
  // Добавляем состояния для работы с API
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Получение стилей на основе темы
  const getThemedStyles = useCallback(() => {
    return {
      backgroundColor: theme === 'dark' ? '#121212' : '#FFFFFF',
      cardBackground: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      textPrimary: theme === 'dark' ? '#FFFFFF' : '#1E293B',
      textSecondary: theme === 'dark' ? '#CCCCCC' : '#64748B',
      borderColor: theme === 'dark' ? '#333333' : 'rgba(0,0,0,0.05)',
      buttonBackground: theme === 'dark' ? '#333333' : '#FFFFFF',
      iconBackgroundColor: theme === 'dark' ? '#333333' : '#FFFFFF',
      iconColor: theme === 'dark' ? '#FFFFFF' : '#1E293B',
      volumeBg: theme === 'dark' ? '#333333' : '#F1F5F9',
      volumeText: theme === 'dark' ? '#CCCCCC' : '#64748B',
      featureTextColor: theme === 'dark' ? '#CCCCCC' : '#64748B',
      wishlistItemBorder: theme === 'dark' ? '#333333' : '#E2E8F0',
      modalBg: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      inputBg: theme === 'dark' ? '#333333' : '#F1F5F9',
      inputText: theme === 'dark' ? '#FFFFFF' : '#1E293B',
      wishlistButtonBg: theme === 'dark' ? '#1A1A1A' : '#F8FAFC',
    };
  }, [theme]);

  const themedStyles = getThemedStyles();
  
  // Загрузка данных о товаре из бэкенда
  useEffect(() => {
    loadProductData();
  }, [productId]);
  
  // Функция для загрузки данных о товаре из бэкенда
  const loadProductData = async () => {
    if (!productId) {
      setError('ID товара не указан');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Преобразуем строковый ID в числовой для запроса к API
      const numericId = parseInt(productId as string);
      
      if (isNaN(numericId)) {
        throw new Error('Некорректный ID товара');
      }
      
      // Получаем данные о товаре из Java-бэкенда
      const giftData = await giftService.getGiftById(numericId);
      
      // Конвертируем в формат продукта для фронтенда
      const productData = giftService.convertToProductFormat(giftData);
      
      setProduct(productData);
      setPrice(productData.price);
    } catch (error) {
      console.error('Ошибка при загрузке данных о товаре:', error);
      setError('Не удалось загрузить информацию о товаре');
      
      // В случае ошибки пытаемся найти продукт в моковых данных как запасной вариант
      const fallbackProduct = localizedData.products.find(p => p.id === productId) || localizedData.products[0];
      setProduct(fallbackProduct);
      setPrice(fallbackProduct.price);
    } finally {
      setLoading(false);
    }
  };
  
  // Проверяем, находится ли товар в любом вишлисте
  const isInWishlist = product ? isItemInAnyWishlist(product.id) : false;
  
  const handleToggleFavorite = () => {
    if (product) {
      // Вызываем API для изменения статуса в бэкенде
      try {
        const numericId = parseInt(product.id);
        if (!isNaN(numericId)) {
          giftService.toggleFavorite(numericId).catch(err => 
            console.error('Ошибка при изменении статуса избранного в бэкенде:', err)
          );
        }
      } catch (error) {
        console.error('Ошибка при обработке ID товара:', error);
      }
      
      // Обновляем локальное состояние
      toggleFavorite(product);
    }
  };
  
  const handleVolumeChange = (volume: string) => {
    setSelectedVolume(volume);
    // Обновляем цену в зависимости от выбранного объема
    const option = volumeOptions.find(opt => opt.value === volume);
    if (option) {
      setPrice(option.price);
    }
  };

  // Функция для добавления товара в корзину
  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Преобразование цены из строки в число
      const numericPrice = parseFloat(price.replace(/\s+/g, '').replace('₽', '').replace(',', '.'));
      
      if (isNaN(numericPrice)) {
        console.error('Не удалось преобразовать цену в число:', price);
        return;
      }
      
      // Добавляем товар в корзину
      addItem({
        id: product.id,
        name: product.name,
        price: numericPrice,
        quantity: 1,
        image: product.image,
        subtitle: product.subtitle
      });
      
      // Показать всплывающее сообщение об успехе
      Alert.alert('Товар добавлен в корзину', '', [{ text: 'OK' }], { cancelable: true });
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    }
  };
  
  // Функция для покупки сейчас (добавляем в корзину и переходим к оформлению)
  const handleBuyNow = () => {
    handleAddToCart();
    // Переходим на страницу корзины
    router.push('/(tabs)/cart');
  };

  // Функция для добавления товара в вишлист
  const handleAddToWishlist = (wishlistId: string) => {
    if (!product) return;
    
    // Создаем объект с данными о товаре для вишлиста
    const wishlistItem: WishlistItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: price,
      image: product.image,
      category: product.subtitle || 'Default'
    };
    
    // Добавляем товар в вишлист
    addItemToWishlist(wishlistId, wishlistItem);
    
    // Закрываем модальное окно
    setWishlistModalVisible(false);
    
    // Показываем сообщение об успехе
    Alert.alert('Товар добавлен в вишлист', '', [{ text: 'OK' }], { cancelable: true });
  };
  
  // Функция для создания нового вишлиста и добавления товара в него
  const handleCreateWishlistWithItem = () => {
    // Открываем модальное окно для создания нового вишлиста
    setCreateWishlistModalVisible(true);
  };
  
  // Функция для подтверждения создания вишлиста
  const handleConfirmCreateWishlist = () => {
    if (newWishlistName && newWishlistName.trim()) {
      // Создаем новый вишлист
      const newWishlist = createWishlist(newWishlistName);
      
      // Добавляем товар в новый вишлист
      const wishlistItem: WishlistItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: price,
        image: product.image,
        category: product.subtitle || 'Default'
      };
      
      addItemToWishlist(newWishlist.id, wishlistItem);
      
      // Закрываем модальные окна
      setCreateWishlistModalVisible(false);
      setWishlistModalVisible(false);
      
      // Очищаем поле ввода
      setNewWishlistName('');
      
      // Показываем сообщение об успехе
      Alert.alert(
        'Вишлист создан',
        `Товар добавлен в вишлист "${newWishlistName.trim()}"`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };
  
  // Отображение модального окна с выбором вишлиста
  const renderWishlistModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={wishlistModalVisible}
        onRequestClose={() => setWishlistModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: themedStyles.modalBg}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: themedStyles.textPrimary}]}>Добавить в вишлист</Text>
              <TouchableOpacity
                onPress={() => setWishlistModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={themedStyles.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {wishlists.length > 0 ? (
              <FlatList
                data={wishlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isItemInThisWishlist = item.items.some(
                    wishlistItem => wishlistItem.productId === product.id
                  );
                  
                  return (
                    <TouchableOpacity
                      style={[styles.wishlistItem, {borderBottomColor: themedStyles.wishlistItemBorder}]}
                      onPress={() => {
                        if (!isItemInThisWishlist) {
                          handleAddToWishlist(item.id);
                        } else {
                          Alert.alert('Товар уже в вишлисте', '', [{ text: 'OK' }]);
                        }
                      }}
                    >
                      <View style={styles.wishlistItemInfo}>
                        <Text style={[styles.wishlistItemName, {color: themedStyles.textPrimary}]}>{item.name}</Text>
                        <Text style={[styles.wishlistItemCount, {color: themedStyles.textSecondary}]}>
                          {item.items.length} {item.items.length === 1 ? 'товар' : 
                            (item.items.length >= 2 && item.items.length <= 4) ? 'товара' : 'товаров'}
                        </Text>
                      </View>
                      
                      {isItemInThisWishlist ? (
                        <Check size={20} color="#10B981" />
                      ) : (
                        <Plus size={20} color="#6C63FF" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text style={[styles.emptyWishlistText, {color: themedStyles.textSecondary}]}>
                У вас пока нет вишлистов
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.createWishlistButton}
              onPress={handleCreateWishlistWithItem}
            >
              <Text style={styles.createWishlistText}>Создать новый вишлист</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Рендер компонента загрузки
  const renderLoading = () => (
    <View style={[styles.loadingContainer, { backgroundColor: themedStyles.backgroundColor }]}>
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text style={[styles.loadingText, { color: themedStyles.textSecondary }]}>
        Загрузка информации о товаре...
      </Text>
    </View>
  );
  
  // Рендер компонента ошибки
  const renderError = () => (
    <View style={[styles.errorContainer, { backgroundColor: themedStyles.backgroundColor }]}>
      <Text style={[styles.errorText, { color: '#FF6B6B' }]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadProductData}
      >
        <Text style={styles.retryButtonText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Если данные загружаются или произошла ошибка
  if (loading) return renderLoading();
  if (error && !product) return renderError();
  if (!product) return null;
  
  return (
    <View style={[styles.container, {backgroundColor: themedStyles.backgroundColor}]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Статичный фоновый градиент - не скроллится */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={theme === 'dark' ? ['#121212', '#1A1A1A'] : ['#FFD1DC', '#FFE6EB']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      
      {/* Фиксированная верхняя панель */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.headerButton, {backgroundColor: themedStyles.buttonBackground}]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={themedStyles.iconColor} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerButton, {backgroundColor: themedStyles.buttonBackground}]}
          onPress={handleToggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorite(product.id) ? "#FF0844" : themedStyles.textSecondary} 
            fill={isFavorite(product.id) ? "#FF0844" : "transparent"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Скроллящийся контент */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Верхний отступ для прозрачной навигации */}
        <View style={styles.topSpacer} />
        
        {/* Область изображения продукта */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
          
          {/* Декоративные элементы - показываем только в светлой теме */}
          {theme !== 'dark' && (
            <>
              <View style={[styles.heartDecoration, { top: '10%', left: '15%' }]}>
                <Heart size={14} color="#FFB6C1" fill="#FFB6C1" />
              </View>
              <View style={[styles.heartDecoration, { top: '25%', left: '80%' }]}>
                <Heart size={16} color="#FFB6C1" fill="#FFB6C1" />
              </View>
              <View style={[styles.heartDecoration, { top: '70%', left: '10%' }]}>
                <Heart size={12} color="#FFB6C1" fill="#FFB6C1" />
              </View>
              <View style={[styles.heartDecoration, { top: '65%', left: '90%' }]}>
                <Heart size={10} color="#FFB6C1" fill="#FFB6C1" />
              </View>
              
              {/* Лепестки роз */}
              <View style={[styles.petalDecoration, { top: '15%', left: '5%' }]} />
              <View style={[styles.petalDecoration, { top: '30%', left: '85%', transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.petalDecoration, { top: '75%', left: '20%', transform: [{ rotate: '120deg' }] }]} />
              <View style={[styles.petalDecoration, { top: '60%', left: '75%', transform: [{ rotate: '210deg' }] }]} />
            </>
          )}
        </View>
        
        {/* Блок с информацией о продукте */}
        <View style={styles.infoCardContainer}>
          <View style={[styles.infoCard, {backgroundColor: themedStyles.cardBackground}]}>
            {/* Заголовок и цена */}
            <View style={styles.productHeader}>
              <View>
                <Text style={[styles.productCategory, {color: themedStyles.textSecondary}]}>{product.subtitle}</Text>
                <Text style={[styles.productName, {color: themedStyles.textPrimary}]}>{product.name}</Text>
              </View>
              <Text style={styles.productPrice}>{price}</Text>
            </View>
            
            {/* Описание */}
            <Text style={[styles.productDescription, {color: themedStyles.textSecondary}]}>
              {product.description}
            </Text>
            
            {/* Селектор объема (для парфюма) */}
            {product.id === '5' && (
              <View style={styles.volumeSelector}>
                {volumeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.volumeOption,
                      {backgroundColor: themedStyles.volumeBg},
                      selectedVolume === option.value && styles.selectedVolumeOption,
                    ]}
                    onPress={() => handleVolumeChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.volumeText,
                        {color: themedStyles.volumeText},
                        selectedVolume === option.value && styles.selectedVolumeText,
                      ]}
                    >
                      {option.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Характеристики продукта */}
            {product.features && (
              <View style={styles.featuresContainer}>
                {product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={[styles.featureText, {color: themedStyles.featureTextColor}]}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Добавляем пустое пространство внизу для кнопок */}
            <View style={styles.bottomPadding} />
          </View>
        </View>
        
        {product && product.storeLinks && product.storeLinks.length > 0 && (
          <View style={styles.storeLinksContainer}>
            <Text style={styles.storeLinksTitle}>Где купить:</Text>
            {product.storeLinks.map((link, index) => (
              <TouchableOpacity 
                key={`store-${index}`}
                style={styles.storeLinkButton}
                onPress={() => Linking.openURL(link.url)}
              >
                <ExternalLink size={18} color={themedStyles.textSecondary} />
                <Text style={styles.storeLinkText}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Фиксированные кнопки действий внизу экрана */}
      <View style={[styles.fixedActionButtonsContainer, {
        backgroundColor: themedStyles.cardBackground,
        borderTopColor: themedStyles.borderColor,
      }]}>
        <View style={styles.actionButtonsWrapper}>
          <TouchableOpacity 
            style={[styles.wishlistButton, {backgroundColor: themedStyles.wishlistButtonBg}]}
            onPress={() => setWishlistModalVisible(true)}
          >
            <Gift size={22} color={isInWishlist ? "#6C63FF" : themedStyles.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <ShoppingBag size={22} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Добавить в корзину</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buyNowButton}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowText}>Купить сейчас</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Модальное окно с выбором вишлиста */}
      {renderWishlistModal()}
      
      {/* Модальное окно для создания нового вишлиста */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createWishlistModalVisible}
        onRequestClose={() => setCreateWishlistModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: themedStyles.modalBg}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: themedStyles.textPrimary}]}>Новый вишлист</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateWishlistModalVisible(false);
                  setNewWishlistName('');
                }}
                style={styles.closeButton}
              >
                <X size={24} color={themedStyles.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, {color: themedStyles.textSecondary}]}>
              Введите название для нового вишлиста
            </Text>
            
            <TextInput
              style={[styles.input, {
                backgroundColor: themedStyles.inputBg,
                color: themedStyles.inputText,
                borderColor: themedStyles.borderColor
              }]}
              value={newWishlistName}
              onChangeText={setNewWishlistName}
              placeholder="Название вишлиста"
              placeholderTextColor={themedStyles.textSecondary}
              autoFocus={true}
            />
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, {
                  borderColor: themedStyles.borderColor
                }]}
                onPress={() => {
                  setCreateWishlistModalVisible(false);
                  setNewWishlistName('');
                }}
              >
                <Text style={[styles.cancelButtonText, {color: themedStyles.textPrimary}]}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmCreateWishlist}
                disabled={!newWishlistName.trim()}
              >
                <Text style={styles.confirmButtonText}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55, // 55% экрана
    overflow: 'hidden',
    zIndex: 0,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90, // Добавляем отступ снизу для кнопок
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  imageSection: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: width * 0.8,
    height: 280,
  },
  heartDecoration: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petalDecoration: {
    position: 'absolute',
    width: 20,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#FF5E87',
    opacity: 0.3,
  },
  infoCardContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 400, // Уменьшаем минимальную высоту, так как кнопки теперь отдельно
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0844',
  },
  productDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 25,
  },
  volumeSelector: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  volumeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  selectedVolumeOption: {
    backgroundColor: '#FF0844',
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedVolumeText: {
    color: '#FFFFFF',
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0844',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomPadding: {
    height: 20, // Дополнительный отступ внизу контента
  },
  fixedActionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  actionButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 16,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  buyNowButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF0844',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  wishlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wishlistItemInfo: {
    flex: 1,
  },
  wishlistItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  wishlistItemCount: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyWishlistText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 24,
  },
  createWishlistButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createWishlistText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 8,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EDF2F7',
  },
  cancelButtonText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#6C63FF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 16,
  },
  retryButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6C63FF',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storeLinksContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 20,
  },
  storeLinksTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  storeLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  storeLinkText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 10,
    fontWeight: '500',
  },
}); 