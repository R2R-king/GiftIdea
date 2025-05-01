import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  useColorScheme,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, MapPin, Clock, Phone, Globe, Navigation, Star } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';

// Define types for store data
type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type Store = {
  id: string;
  name: string;
  address: string;
  description: string;
  phone: string;
  website: string;
  workingHours: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  topProducts: Product[];
};

type StoreMap = {
  [key: string]: Store;
};

// Mock data for a store
const MOCK_STORES: StoreMap = {
  'store1': {
    id: 'store1',
    name: 'Мегамолл "Подарки"',
    address: 'ул. Пушкина, 10',
    description: 'Большой магазин с широким ассортиментом подарков на любой случай. Специальные предложения каждый месяц.',
    phone: '+7 (123) 456-78-90',
    website: 'https://example.com/megamall',
    workingHours: 'Пн-Вс: 10:00 - 22:00',
    rating: 4.8,
    reviewCount: 245,
    imageUrl: 'https://example.com/store1.jpg',
    coordinates: {
      latitude: 55.7558,
      longitude: 37.6173,
    },
    topProducts: [
      {
        id: 'prod1',
        name: 'Умная колонка с голосовым ассистентом',
        price: 5990,
        imageUrl: 'https://example.com/smart-speaker.jpg',
      },
      {
        id: 'prod2',
        name: 'Набор для создания домашнего сада',
        price: 2490,
        imageUrl: 'https://example.com/garden-kit.jpg',
      },
      {
        id: 'prod3',
        name: 'Подарочный набор чая премиум-класса',
        price: 1890,
        imageUrl: 'https://example.com/tea-set.jpg',
      },
    ],
  },
  'store2': {
    id: 'store2',
    name: 'ГифтМаркет',
    address: 'пр. Ленина, 45',
    description: 'Специализированный магазин подарков ручной работы и эксклюзивных сувениров от местных мастеров.',
    phone: '+7 (987) 654-32-10',
    website: 'https://example.com/giftmarket',
    workingHours: 'Пн-Пт: 09:00 - 20:00, Сб-Вс: 10:00 - 18:00',
    rating: 4.6,
    reviewCount: 128,
    imageUrl: 'https://example.com/store2.jpg',
    coordinates: {
      latitude: 55.7539,
      longitude: 37.6208,
    },
    topProducts: [
      {
        id: 'prod4',
        name: 'Книга "Искусство подарка"',
        price: 990,
        imageUrl: 'https://example.com/gift-book.jpg',
      },
      {
        id: 'prod5',
        name: 'Портативная Bluetooth-колонка',
        price: 3490,
        imageUrl: 'https://example.com/bluetooth-speaker.jpg',
      },
    ],
  },
  'store3': {
    id: 'store3',
    name: 'ПодарокСити',
    address: 'ул. Гагарина, 78',
    description: 'Сеть магазинов оригинальных и необычных подарков. Возможность персонализации большинства товаров.',
    phone: '+7 (555) 123-45-67',
    website: 'https://example.com/podarokcity',
    workingHours: 'Ежедневно: 09:00 - 21:00',
    rating: 4.3,
    reviewCount: 87,
    imageUrl: 'https://example.com/store3.jpg',
    coordinates: {
      latitude: 55.7522,
      longitude: 37.6156,
    },
    topProducts: [
      {
        id: 'prod6',
        name: 'Именная кружка с гравировкой',
        price: 1290,
        imageUrl: 'https://example.com/personalized-mug.jpg',
      },
      {
        id: 'prod7',
        name: 'Подарочный сертификат',
        price: 2000,
        imageUrl: 'https://example.com/gift-card.jpg',
      },
    ],
  },
};

export default function StoreDetails() {
  const { id } = useLocalSearchParams();
  const storeId = typeof id === 'string' ? id : 'store1';
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Fetch store details - in a real app this would be an API call
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setStore(MOCK_STORES[storeId] || MOCK_STORES.store1);
      setLoading(false);
    }, 800);
    
    // Get user location for directions
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, [storeId]);

  const handleGetDirections = () => {
    if (!userLocation || !store) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords.latitude},${userLocation.coords.longitude}&destination=${store.coordinates.latitude},${store.coordinates.longitude}&travelmode=driving`;
    
    WebBrowser.openBrowserAsync(url);
  };

  const handleCall = () => {
    if (!store) return;
    Linking.openURL(`tel:${store.phone}`);
  };

  const handleVisitWebsite = () => {
    if (!store) return;
    WebBrowser.openBrowserAsync(store.website);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product-details?id=${productId}`);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && styles.darkContainer]}>
        <Stack.Screen options={{ title: 'Информация о магазине' }} />
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Загрузка информации...
        </Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={[styles.container, styles.errorContainer, isDark && styles.darkContainer]}>
        <Stack.Screen options={{ title: 'Ошибка' }} />
        <Text style={[styles.errorText, isDark && styles.darkText]}>
          Информация о магазине не найдена
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Stack.Screen options={{ 
        title: store.name,
        headerBackTitle: 'Назад',
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={{ uri: store.imageUrl }}
          style={styles.storeImage}
          defaultSource={require('../assets/images/placeholder.png')}
        />
        
        <View style={styles.contentContainer}>
          <Text style={[styles.storeName, isDark && styles.darkText]}>
            {store.name}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, isDark && styles.darkText]}>
              {store.rating.toFixed(1)}
            </Text>
            <Star fill="#FFC107" color="#FFC107" size={16} />
            <Text style={[styles.reviewCount, isDark && styles.darkTextSecondary]}>
              ({store.reviewCount} отзывов)
            </Text>
          </View>
          
          <Text style={[styles.storeDescription, isDark && styles.darkText]}>
            {store.description}
          </Text>
          
          <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
            <View style={styles.infoRow}>
              <MapPin color={isDark ? '#e0e0e0' : '#333'} size={20} />
              <Text style={[styles.infoText, isDark && styles.darkText]}>
                {store.address}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock color={isDark ? '#e0e0e0' : '#333'} size={20} />
              <Text style={[styles.infoText, isDark && styles.darkText]}>
                {store.workingHours}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Phone color={isDark ? '#e0e0e0' : '#333'} size={20} />
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.contactText, isDark && styles.darkContactText]}>
                  {store.phone}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoRow}>
              <Globe color={isDark ? '#e0e0e0' : '#333'} size={20} />
              <TouchableOpacity onPress={handleVisitWebsite}>
                <Text style={[styles.contactText, isDark && styles.darkContactText]}>
                  {store.website.replace('https://', '')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.directionsButton, isDark && styles.darkDirectionsButton]} 
            onPress={handleGetDirections}
          >
            <Navigation color="#fff" size={20} />
            <Text style={styles.directionsButtonText}>Проложить маршрут</Text>
          </TouchableOpacity>
          
          {store.topProducts && store.topProducts.length > 0 && (
            <View style={styles.productsSection}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                Популярные товары в этом магазине
              </Text>
              
              {store.topProducts.map((product: Product) => (
                <TouchableOpacity 
                  key={product.id}
                  style={[styles.productCard, isDark && styles.darkProductCard]}
                  onPress={() => handleProductPress(product.id)}
                >
                  <Image 
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    defaultSource={require('../assets/images/placeholder.png')}
                  />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, isDark && styles.darkText]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productPrice, isDark && styles.darkText]}>
                      {formatPrice(product.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  storeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  darkText: {
    color: '#e0e0e0',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  storeDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkInfoCard: {
    backgroundColor: '#2a2a2a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: '#2196f3',
  },
  darkContactText: {
    color: '#64b5f6',
  },
  directionsButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 24,
  },
  darkDirectionsButton: {
    backgroundColor: '#1976d2',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  productsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkProductCard: {
    backgroundColor: '#2a2a2a',
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 