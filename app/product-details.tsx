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
import { Stack, router } from 'expo-router';

const { width } = Dimensions.get('window');

// Варианты объёма парфюма
const volumeOptions = [
  { value: '50 ml', price: '$40' },
  { value: '100 ml', price: '$45' },
  { value: '150 ml', price: '$50' },
];

export default function ProductDetailScreen() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState('150 ml');
  const [price, setPrice] = useState('$50');
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
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
            source={{ uri: 'https://images.unsplash.com/photo-1615354065567-5580e55f66d5?w=800' }}
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
            <View>
              <Text style={styles.productCategory}>Scents of Love</Text>
              <Text style={styles.productName}>Perfume</Text>
            </View>
            <Text style={styles.productPrice}>{price}</Text>
          </View>

          <Text style={styles.productDescription}>
            Elevate the romance with a timeless fragrance. A perfect gift to make your loved one feel special and cherished. Choose a scent that speaks to their unique personality.
          </Text>

          {/* Выбор объема */}
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

          {/* Кнопки действий */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addToCartButton}>
              <View style={styles.addToCartContent}>
                <ShoppingBag size={18} color="#1E293B" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buyNowText}>Buy now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pinkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: '#FFD1DC',
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
    paddingBottom: 30,
  },
  imageContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
  },
  productImage: {
    width: width * 0.7,
    height: 350,
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
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
  actionButtons: {
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