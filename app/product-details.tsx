import React, { useState } from 'react';
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
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Варианты объёма парфюма
const volumeOptions = [
  { value: '50 ml', price: '3 500 ₽' },
  { value: '100 ml', price: '4 200 ₽' },
  { value: '150 ml', price: '5 000 ₽' },
];

// Данные продуктов для демонстрации
type ProductKey = 'perfume' | 'roses' | 'chocolates' | 'teddyBear' | 'loveLetterSet' | 'valentineCard' | 'diamondPendant';

interface ProductDetails {
  id: string;
  name: string;
  nameRu: string;
  category: string;
  categoryRu: string;
  description: string;
  descriptionRu: string;
  image: string;
  price: string;
  showVolume?: boolean;
}

const productData: Record<ProductKey, ProductDetails> = {
  perfume: {
    id: 'perfume',
    name: 'Perfume',
    nameRu: 'Парфюм',
    category: 'Scents of Love',
    categoryRu: 'Ароматы любви',
    description: 'Elevate the romance with a timeless fragrance. A perfect gift to make your loved one feel special and cherished. Choose a scent that speaks to their unique personality.',
    descriptionRu: 'Подчеркните романтику с помощью неподвластного времени аромата. Идеальный подарок, чтобы ваш любимый человек чувствовал себя особенным и ценным. Выберите аромат, который подойдет его уникальной индивидуальности.',
    image: 'https://images.unsplash.com/photo-1588680388356-44efef343a2a?w=800&q=80',
    price: '5 000 ₽',
    showVolume: true,
  },
  roses: {
    id: 'roses',
    name: 'Valentine\'s Rose Bouquet',
    nameRu: 'Букет роз на День святого Валентина',
    category: 'Fresh Flowers',
    categoryRu: 'Свежие цветы',
    description: 'A beautiful bouquet of fresh roses, perfect for expressing your love and affection on Valentine\'s Day or any special occasion.',
    descriptionRu: 'Красивый букет свежих роз, идеально подходящий для выражения любви и привязанности в День святого Валентина или по любому особому случаю.',
    image: 'https://plus.unsplash.com/premium_photo-1682431264193-41352acd1fe4?w=800&q=80',
    price: '3 499 ₽',
    showVolume: false,
  },
  chocolates: {
    id: 'chocolates',
    name: 'Heart Shaped Chocolates',
    nameRu: 'Шоколадные конфеты в форме сердца',
    category: 'Sweets & Treats',
    categoryRu: 'Сладости',
    description: 'Premium Belgian chocolates in a heart-shaped box. The perfect way to show someone you care with a sweet treat they\'ll love.',
    descriptionRu: 'Премиальный бельгийский шоколад в коробке в форме сердца. Идеальный способ показать, что вы заботитесь о ком-то, порадовав сладостью, которую они полюбят.',
    image: 'https://images.unsplash.com/photo-1549007994-cb8bed490c79?w=800&q=80',
    price: '1 799 ₽',
    showVolume: false,
  },
  teddyBear: {
    id: 'teddyBear',
    name: 'Cute Teddy Bear',
    nameRu: 'Милый плюшевый мишка',
    category: 'Plush Toys',
    categoryRu: 'Плюшевые игрушки',
    description: 'Soft plush teddy bear with a heart, perfect for cuddling and showing affection to your loved ones.',
    descriptionRu: 'Мягкий плюшевый мишка с сердечком, идеально подходящий для объятий и проявления нежности к вашим близким.',
    image: 'https://images.unsplash.com/photo-1615031335724-f7fb76ae5fc9?w=800&q=80',
    price: '1 299 ₽',
    showVolume: false,
  },
  loveLetterSet: {
    id: 'loveLetterSet',
    name: 'Love Letter Stationery',
    nameRu: 'Набор для писем о любви',
    category: 'Stationery',
    categoryRu: 'Канцтовары',
    description: 'Luxury paper set with envelopes, perfect for writing heartfelt love letters to your special someone.',
    descriptionRu: 'Роскошный набор бумаги с конвертами, идеально подходящий для написания искренних любовных писем вашему особенному человеку.',
    image: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=800&q=80',
    price: '999 ₽',
    showVolume: false,
  },
  valentineCard: {
    id: 'valentineCard',
    name: 'Valentine\'s Day Card',
    nameRu: 'Открытка ко Дню святого Валентина',
    category: 'Cards',
    categoryRu: 'Открытки',
    description: 'Handcrafted Valentine\'s Day card with a personalized message to express your feelings.',
    descriptionRu: 'Открытка ручной работы ко Дню святого Валентина с персонализированным посланием для выражения ваших чувств.',
    image: 'https://images.unsplash.com/photo-1612344891345-1b62d29d9d6d?w=800&q=80',
    price: '399 ₽',
    showVolume: false,
  },
  diamondPendant: {
    id: 'diamondPendant',
    name: 'Diamond Pendant Necklace',
    nameRu: 'Кулон с бриллиантом',
    category: 'Jewelry',
    categoryRu: 'Украшения',
    description: 'Sterling silver necklace with a heart-shaped diamond pendant, a timeless gift she will cherish forever.',
    descriptionRu: 'Ожерелье из стерлингового серебра с кулоном в форме сердца с бриллиантом, вневременной подарок, который она будет ценить вечно.',
    image: 'https://images.unsplash.com/photo-1636138390765-c2bf51992db1?w=800&q=80',
    price: '8 999 ₽',
    showVolume: false,
  },
};

export default function ProductDetailScreen() {
  const { t } = useAppLocalization();
  const params = useLocalSearchParams();
  const productId = (params.id as string || 'perfume') as ProductKey;
  
  const product = productData[productId];
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(product.showVolume ? '150 ml' : '');
  const [price, setPrice] = useState(product.price);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleVolumeChange = (volume: string) => {
    if (!product.showVolume) return;
    
    setSelectedVolume(volume);
    // Обновляем цену в зависимости от выбранного объема
    const option = volumeOptions.find(opt => opt.value === volume);
    if (option) {
      setPrice(option.price);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Розовый фон */}
      <View style={styles.pinkBackground} />

      {/* Верхняя панель с кнопками */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorite ? "#FF0844" : "#64748B"} 
            fill={isFavorite ? "#FF0844" : "transparent"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Изображение продукта */}
        <View style={styles.imageContainer}>
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

        {/* Информация о продукте */}
        <View style={styles.productInfoCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productCategory}>{product.categoryRu}</Text>
            <Text style={styles.productPrice}>{price}</Text>
          </View>
          <Text style={styles.productName}>{product.nameRu}</Text>

          <Text style={styles.productDescription}>
            {product.descriptionRu}
          </Text>

          {/* Выбор объема */}
          {product.showVolume && (
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
        </View>
      </ScrollView>
      
      {/* Кнопки действий зафиксированные внизу экрана */}
      <View style={styles.fixedActionButtonsContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton}>
            <ShoppingBag size={18} color="#1E293B" />
            <Text style={styles.addToCartText}>В корзину</Text>
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
    backgroundColor: '#fff',
  },
  pinkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: '#FFF0F5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    zIndex: 10,
  },
  backButton: {
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
  favoriteButton: {
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
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    height: 450,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  productImage: {
    width: '80%',
    height: '80%',
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
  productInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 14,
    color: '#64748B',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
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
    justifyContent: 'center',
    gap: 10,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addToCartButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginRight: 15,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
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
  fixedActionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 45 : 25,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
}); 