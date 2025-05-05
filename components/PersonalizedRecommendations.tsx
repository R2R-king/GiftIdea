import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { SparklesIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeProvider';

type Gift = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number;
};

export const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  
  // Normally you would get these from Redux store
  const favorites = useSelector((state: any) => state.favorites?.items || []);
  const cartItems = useSelector((state: any) => state.cart?.items || []);
  
  useEffect(() => {
    fetchRecommendations();
  }, [favorites, cartItems]);
  
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get browsing history from AsyncStorage
      const historyData = await AsyncStorage.getItem('browsingHistory');
      const browsingHistory = historyData ? JSON.parse(historyData) : [];
      
      // In a real application, you would make an API call to your recommendation service
      // with the user's favorites, cart items, and browsing history
      
      // For demo purposes, we'll mock personalized recommendations
      const mockRecommendations = getMockRecommendations(favorites, cartItems, browsingHistory);
      
      // Wait for a moment to simulate network request
      setTimeout(() => {
        setRecommendations(mockRecommendations);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };
  
  const getMockRecommendations = (
    userFavorites: any[], 
    userCartItems: any[], 
    browsingHistory: any[]
  ): Gift[] => {
    // This would normally be a sophisticated algorithm on your backend
    // Here we're just returning mock data
    return [
      {
        id: 'rec1',
        name: 'Умная колонка с голосовым ассистентом',
        price: 5990,
        imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=300',
        category: 'Электроника',
        rating: 4.7,
      },
      {
        id: 'rec2',
        name: 'Набор для создания домашнего сада',
        price: 2490,
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300',
        category: 'Хобби',
        rating: 4.9,
      },
      {
        id: 'rec3',
        name: 'Подарочный набор чая премиум-класса',
        price: 1890,
        imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=300',
        category: 'Еда и напитки',
        rating: 4.8,
      },
      {
        id: 'rec4',
        name: 'Книга "Искусство подарка"',
        price: 990,
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300',
        category: 'Книги',
        rating: 4.6,
      },
      {
        id: 'rec5',
        name: 'Портативная Bluetooth-колонка',
        price: 3490,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=300',
        category: 'Электроника',
        rating: 4.5,
      },
    ];
  };
  
  const handleGiftPress = (giftId: string) => {
    console.log(`Pressing gift item: ${giftId}`);
    try {
      // Use explicit navigation with router.navigate
      router.navigate({
        pathname: '/product-details',
        params: { id: giftId }
      });
    } catch (error) {
      console.error('Navigation error in handleGiftPress:', error);
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && { backgroundColor: colors.primaryBackground }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, isDark && { backgroundColor: colors.primaryBackground }]}>
        <Text style={[styles.emptyText, isDark && { color: colors.textSecondary }]}>
          У нас пока недостаточно данных для персонализированных рекомендаций.
          Добавьте товары в избранное или корзину для получения рекомендаций.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SparklesIcon color={isDark ? colors.textPrimary : '#333'} size={20} />
        <Text style={[styles.title, isDark && { color: colors.textPrimary }]}>
          Персональные рекомендации
        </Text>
      </View>
      
      <FlatList
        data={recommendations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.giftCard, isDark && { backgroundColor: colors.cardBackground }]}
            onPress={() => handleGiftPress(item.id)}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.giftImage}
                defaultSource={require('../assets/images/placeholder.png')}
              />
            </View>
            
            <View style={styles.giftInfo}>
              <Text style={[styles.giftName, isDark && { color: colors.textPrimary }]} numberOfLines={2}>
                {item.name}
              </Text>
              
              <View style={styles.giftDetails}>
                <Text style={[styles.giftCategory, isDark && { color: colors.textSecondary }]}>
                  {item.category}
                </Text>
                
                <View style={styles.ratingContainer}>
                  <Text style={[styles.ratingText, isDark && { color: colors.textSecondary }]}>
                    {item.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.starIcon, isDark && { color: colors.textSecondary }]}>★</Text>
                </View>
              </View>
              
              <Text style={[styles.giftPrice, isDark && { color: colors.textPrimary }]}>
                {formatPrice(item.price)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  giftCard: {
    width: 180,
    height: 280,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 160,
  },
  giftImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  giftInfo: {
    padding: 12,
  },
  giftName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    height: 40,
  },
  giftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginRight: 2,
  },
  starIcon: {
    fontSize: 12,
    color: '#FFB800',
  },
  giftPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PersonalizedRecommendations; 