import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Heart, ShoppingBag } from 'lucide-react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppLocalization } from '@/components/LocalizationWrapper';

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
  const [selectedVolume, setSelectedVolume] = useState('150 мл');
  const [price, setPrice] = useState('3 800 ₽');
  
  // Найти продукт по ID из локализованных данных
  const product = localizedData.products.find(p => p.id === productId) || localizedData.products[0];
  
  // Обновить цену при изменении продукта
  useEffect(() => {
    if (product) {
      setPrice(product.price);
    }
  }, [product]);
  
  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };
  
  const handleVolumeChange = (volume: string) => {
    setSelectedVolume(volume);
    // Обновляем цену в зависимости от выбранного объема
    const option = volumeOptions.find(opt => opt.value === volume);
    if (option) {
      setPrice(option.price);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Статичный фоновый градиент - не скроллится */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#FFD1DC', '#FFE6EB']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      
      {/* Фиксированная верхняя панель */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleToggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorite(product.id) ? "#FF0844" : "#64748B"} 
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
          
          {/* Декоративные элементы */}
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
        </View>
        
        {/* Блок с информацией о продукте */}
        <View style={styles.infoCardContainer}>
          <View style={styles.infoCard}>
            {/* Заголовок и цена */}
            <View style={styles.productHeader}>
              <View>
                <Text style={styles.productCategory}>{product.subtitle}</Text>
                <Text style={styles.productName}>{product.name}</Text>
              </View>
              <Text style={styles.productPrice}>{price}</Text>
            </View>
            
            {/* Описание */}
            <Text style={styles.productDescription}>
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
                      selectedVolume === option.value && styles.selectedVolumeOption,
                    ]}
                    onPress={() => handleVolumeChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.volumeText,
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
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Добавляем пустое пространство внизу для кнопок */}
            <View style={styles.bottomPadding} />
          </View>
        </View>
      </ScrollView>
      
      {/* Фиксированные кнопки действий внизу экрана */}
      <View style={styles.fixedActionButtonsContainer}>
        <View style={styles.actionButtonsWrapper}>
          <TouchableOpacity style={styles.addToCartButton}>
            <View style={styles.addToCartContent}>
              <ShoppingBag size={18} color="#1E293B" />
              <Text style={styles.addToCartText}>В корзину</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.buyNowButton}>
            <Text style={styles.buyNowText}>Купить сейчас</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  addToCartButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  addToCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF0844',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 