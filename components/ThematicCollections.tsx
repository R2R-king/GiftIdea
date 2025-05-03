import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

type CollectionType = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  itemCount: number;
};

const defaultCollections: CollectionType[] = [
  {
    id: 'holidays',
    title: 'Праздники',
    description: 'Подарки на Новый год, 8 марта, 23 февраля и другие праздники',
    imageUrl: 'https://images.unsplash.com/photo-1482330454287-3cf6611d0bc9?q=80&w=300',
    itemCount: 42,
  },
  {
    id: 'hobbies',
    title: 'Хобби',
    description: 'Подарки для людей с разными увлечениями',
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=300',
    itemCount: 38,
  },
  {
    id: 'age-groups',
    title: 'Возрастные группы',
    description: 'Подарки для детей, подростков, взрослых и пожилых',
    imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=300',
    itemCount: 56,
  },
  {
    id: 'budget',
    title: 'По бюджету',
    description: 'Подарки в разных ценовых категориях',
    imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=300',
    itemCount: 60,
  },
];

export const ThematicCollections = ({ 
  collections = defaultCollections,
  onCollectionPress
}: { 
  collections?: CollectionType[],
  onCollectionPress?: (collectionId: string, collectionName: string) => void
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCollectionPress = (collectionId: string, collectionName: string) => {
    console.log(`Pressing collection: ${collectionId} - ${collectionName}`);
    
    try {
      if (onCollectionPress) {
        console.log('Using custom onCollectionPress handler');
        onCollectionPress(collectionId, collectionName);
      } else {
        console.log('Navigating to catalog page');
        // Force navigation to the catalog tab with the collection parameter
        router.navigate({
          pathname: '/(tabs)/catalog',
          params: { collection: collectionId, name: collectionName }
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.darkText]}>Тематические коллекции</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={[styles.card, isDark && styles.darkCard]}
            onPress={() => handleCollectionPress(collection.id, collection.title)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: collection.imageUrl }} 
              style={styles.image}
              defaultSource={require('../assets/images/placeholder.png')}
            />
            <View style={styles.infoContainer}>
              <Text style={[styles.collectionTitle, isDark && styles.darkText]}>
                {collection.title}
              </Text>
              <Text 
                selectable={false}
                numberOfLines={2}
                style={[styles.description, isDark && styles.darkTextSecondary]}
              >
                {collection.description}
              </Text>
              <Text style={[styles.itemCount, isDark && styles.darkText]}>
                {collection.itemCount} товаров
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  card: {
    width: 260,
    height: 200,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
    textDecorationLine: 'none',
    textDecorationColor: 'transparent',
    textDecorationStyle: 'solid',
  },
  itemCount: {
    fontSize: 12,
    color: '#888',
  },
  darkText: {
    color: '#e0e0e0',
  },
  darkTextSecondary: {
    color: '#a0a0a0',
  },
});

export default ThematicCollections; 