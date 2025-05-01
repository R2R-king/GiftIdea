import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  useColorScheme,
  Image,
  FlatList,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Map, MapPin, Search, X, ChevronRight, Navigation } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

type Store = {
  id: string;
  name: string;
  address: string;
  distance: number;
  imageUrl: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hasProduct: boolean;
};

export const MapGiftFinder = ({ productId, onClose }: { productId?: string; onClose?: () => void }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [showMap, setShowMap] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Для поиска ближайших магазинов необходим доступ к геолокации');
        return;
      }

      try {
        setLoading(true);
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // In a real app, this would be an API call to get stores near the user's location
        if (productId) {
          fetchStoresWithProduct(location, productId);
        } else {
          fetchNearbyStores(location);
        }
      } catch (error) {
        setErrorMsg('Не удалось определить местоположение');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const fetchNearbyStores = async (location: Location.LocationObject) => {
    // Mock data - in a real app, this would fetch from an API
    // This would normally use the location to find nearby stores
    
    // Simulating API delay
    setTimeout(() => {
      setStores([
        {
          id: 'store1',
          name: 'Мегамолл "Подарки"',
          address: 'ул. Пушкина, 10',
          distance: 1.2,
          imageUrl: 'https://example.com/store1.jpg',
          coordinates: {
            latitude: location.coords.latitude + 0.01,
            longitude: location.coords.longitude + 0.01,
          },
          hasProduct: true,
        },
        {
          id: 'store2',
          name: 'ГифтМаркет',
          address: 'пр. Ленина, 45',
          distance: 2.5,
          imageUrl: 'https://example.com/store2.jpg',
          coordinates: {
            latitude: location.coords.latitude - 0.01,
            longitude: location.coords.longitude + 0.02,
          },
          hasProduct: true,
        },
        {
          id: 'store3',
          name: 'ПодарокСити',
          address: 'ул. Гагарина, 78',
          distance: 3.8,
          imageUrl: 'https://example.com/store3.jpg',
          coordinates: {
            latitude: location.coords.latitude + 0.02,
            longitude: location.coords.longitude - 0.01,
          },
          hasProduct: false,
        },
      ]);
    }, 1000);
  };

  const fetchStoresWithProduct = async (location: Location.LocationObject, productId: string) => {
    // In a real app, this would fetch stores that have the specific product in stock
    // using the product ID and location
    
    // Simulating API delay
    setTimeout(() => {
      setStores([
        {
          id: 'store1',
          name: 'Мегамолл "Подарки"',
          address: 'ул. Пушкина, 10',
          distance: 1.2,
          imageUrl: 'https://example.com/store1.jpg',
          coordinates: {
            latitude: location.coords.latitude + 0.01,
            longitude: location.coords.longitude + 0.01,
          },
          hasProduct: true,
        },
        {
          id: 'store2',
          name: 'ГифтМаркет',
          address: 'пр. Ленина, 45',
          distance: 2.5,
          imageUrl: 'https://example.com/store2.jpg',
          coordinates: {
            latitude: location.coords.latitude - 0.01,
            longitude: location.coords.longitude + 0.02,
          },
          hasProduct: true,
        },
      ]);
    }, 1000);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // In a real app, this would search for the location and nearby stores
    setTimeout(() => {
      // Mock response
      setLoading(false);
      
      if (searchQuery.toLowerCase().includes('москва')) {
        const mockLocation = {
          coords: {
            latitude: 55.7558,
            longitude: 37.6173,
            altitude: null,
            accuracy: 10,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        setLocation(mockLocation);
        fetchNearbyStores(mockLocation);
      } else {
        Alert.alert('Местоположение не найдено', 'Пожалуйста, уточните запрос');
      }
    }, 1000);
  };

  const openMap = (store: Store) => {
    if (!location) {
      Alert.alert('Ошибка', 'Не удалось определить ваше местоположение');
      return;
    }
    
    // On a real device, this would open the maps app with directions
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.coords.latitude},${location.coords.longitude}&destination=${store.coordinates.latitude},${store.coordinates.longitude}&travelmode=driving`;
    
    WebBrowser.openBrowserAsync(url);
  };

  const openWebMap = () => {
    if (!location) {
      Alert.alert('Ошибка', 'Не удалось определить ваше местоположение');
      return;
    }
    
    setShowMap(true);
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Map color={isDark ? '#e0e0e0' : '#333'} size={20} />
        <Text style={[styles.title, isDark && styles.darkText]}>
          {productId ? 'Где купить этот товар' : 'Магазины поблизости'}
        </Text>
      </View>
      
      <View style={[styles.searchContainer, isDark && styles.darkSearchContainer]}>
        <Search color={isDark ? '#aaa' : '#666'} size={18} />
        <TextInput
          style={[styles.searchInput, isDark && styles.darkSearchInput]}
          placeholder="Введите адрес или город..."
          placeholderTextColor={isDark ? '#aaa' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={isDark ? '#aaa' : '#666'} size={18} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={[styles.loadingText, isDark && styles.darkText]}>
            Поиск ближайших магазинов...
          </Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDark && styles.darkText]}>{errorMsg}</Text>
        </View>
      ) : stores.length > 0 ? (
        <>
          <TouchableOpacity 
            style={[styles.viewMapButton, isDark && styles.darkViewMapButton]}
            onPress={openWebMap}
          >
            <Text style={[styles.viewMapText, isDark && styles.darkViewMapText]}>
              Показать на карте
            </Text>
            <Map color={isDark ? '#2196f3' : '#2196f3'} size={16} />
          </TouchableOpacity>
          
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.storeCard, isDark && styles.darkStoreCard]}
                onPress={() => router.push(`/store?id=${item.id}`)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.storeImage}
                  defaultSource={require('../assets/images/placeholder.png')}
                />
                
                <View style={styles.storeInfo}>
                  <Text style={[styles.storeName, isDark && styles.darkText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.storeAddress, isDark && styles.darkTextSecondary]}>
                    {item.address}
                  </Text>
                  <View style={styles.storeDetails}>
                    <Text style={[styles.storeDistance, isDark && styles.darkTextSecondary]}>
                      {item.distance.toFixed(1)} км от вас
                    </Text>
                    {productId && (
                      <Text 
                        style={[
                          styles.availability, 
                          item.hasProduct ? styles.inStock : styles.outOfStock,
                          isDark && item.hasProduct ? styles.darkInStock : styles.darkOutOfStock
                        ]}
                      >
                        {item.hasProduct ? 'В наличии' : 'Нет в наличии'}
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.directionsButton}
                  onPress={() => openMap(item)}
                >
                  <Navigation color="#2196f3" size={24} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.storesList}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.darkText]}>
            Магазины поблизости не найдены. Попробуйте изменить местоположение.
          </Text>
        </View>
      )}
      
      <Modal
        visible={showMap}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, isDark && styles.darkModalHeader]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              Карта магазинов
            </Text>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <X color={isDark ? '#e0e0e0' : '#333'} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              Здесь будет карта с маркерами магазинов.
              В настоящем приложении используйте React Native Maps.
            </Text>
            
            <FlatList
              data={stores}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.mapStoreCard, isDark && styles.darkMapStoreCard]}
                  onPress={() => {
                    setShowMap(false);
                    router.push(`/store?id=${item.id}`);
                  }}
                >
                  <Text style={[styles.mapStoreName, isDark && styles.darkText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.mapStoreAddress, isDark && styles.darkTextSecondary]}>
                    {item.address}
                  </Text>
                  <Text style={[styles.mapStoreDistance, isDark && styles.darkTextSecondary]}>
                    {item.distance.toFixed(1)} км
                  </Text>
                  <View style={styles.mapStoreActions}>
                    <TouchableOpacity 
                      style={[styles.mapStoreButton, isDark && styles.darkMapStoreButton]}
                      onPress={() => openMap(item)}
                    >
                      <Text style={styles.mapStoreButtonText}>Маршрут</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.mapStoreButton, isDark && styles.darkMapStoreButton]}
                      onPress={() => {
                        setShowMap(false);
                        router.push(`/store?id=${item.id}`);
                      }}
                    >
                      <Text style={styles.mapStoreButtonText}>Подробнее</Text>
                      <ChevronRight color="#2196f3" size={16} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.mapStoreList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  darkText: {
    color: '#e0e0e0',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  darkSearchContainer: {
    backgroundColor: '#333',
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: '#333',
  },
  darkSearchInput: {
    color: '#e0e0e0',
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  darkViewMapButton: {
    backgroundColor: '#0d47a1',
  },
  viewMapText: {
    color: '#2196f3',
    fontWeight: '500',
  },
  darkViewMapText: {
    color: '#e3f2fd',
  },
  storesList: {
    flexGrow: 1,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  darkStoreCard: {
    backgroundColor: '#333',
  },
  storeImage: {
    width: 80,
    height: 80,
  },
  storeInfo: {
    flex: 1,
    padding: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeDistance: {
    fontSize: 12,
    color: '#666',
  },
  availability: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inStock: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  outOfStock: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  darkInStock: {
    backgroundColor: '#1b5e20',
    color: '#e8f5e9',
  },
  darkOutOfStock: {
    backgroundColor: '#b71c1c',
    color: '#ffebee',
  },
  directionsButton: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkModalContainer: {
    backgroundColor: '#121212',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkModalHeader: {
    borderBottomColor: '#333',
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  mapPlaceholderText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  mapStoreList: {
    padding: 8,
  },
  mapStoreCard: {
    width: width * 0.75,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkMapStoreCard: {
    backgroundColor: '#2a2a2a',
  },
  mapStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mapStoreAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mapStoreDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mapStoreActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  darkMapStoreButton: {
    backgroundColor: '#0d47a1',
  },
  mapStoreButtonText: {
    color: '#2196f3',
    fontWeight: '500',
    fontSize: 12,
  },
});

export default MapGiftFinder; 