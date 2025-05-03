import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  X, 
  Heart, 
  Share as ShareIcon, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ChevronLeft,
  Filter,
  Tag,
  DollarSign,
  Check,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';
import { useWishlists, Wishlist, WishlistItem } from '@/hooks/useWishlists';

const { width, height } = Dimensions.get('window');

// Define product categories
const CATEGORIES = [
  'Все',
  'Электроника',
  'Одежда',
  'Аксессуары',
  'Дом и сад',
  'Красота',
  'Книги', 
  'Спорт',
  'Игрушки',
  'Прочее'
];

// Define budget ranges
const BUDGET_RANGES = [
  { label: 'Все', min: 0, max: Infinity },
  { label: 'До 1000₽', min: 0, max: 1000 },
  { label: '1000₽ - 5000₽', min: 1000, max: 5000 },
  { label: '5000₽ - 15000₽', min: 5000, max: 15000 },
  { label: 'Более 15000₽', min: 15000, max: Infinity }
];

export default function WishlistScreen() {
  const { 
    wishlists, 
    isLoading, 
    createWishlist, 
    updateWishlist, 
    deleteWishlist,
    removeItemFromWishlist 
  } = useWishlists();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistDescription, setNewWishlistDescription] = useState('');
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  // New states for category and budget filtering
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState(BUDGET_RANGES[0]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  
  // States for tinder-like swiping
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [swipingMode, setSwipingMode] = useState(false);
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  
  // For rotation animation during swipe
  const rotateAnim = swipeAnim.x.interpolate({
    inputRange: [-width/2, 0, width/2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });
  
  // For opacity of action buttons
  const likeOpacity = swipeAnim.x.interpolate({
    inputRange: [0, width/4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  const dislikeOpacity = swipeAnim.x.interpolate({
    inputRange: [-width/4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  
  // Completely reimplemented PanResponder for handling swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Store the initial position when touch starts
      swipeAnim.setOffset({
        x: 0,
        y: 0
      });
      swipeAnim.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: swipeAnim.x, dy: swipeAnim.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      // Clear offsets
      swipeAnim.flattenOffset();
      
      // Define swipe threshold
      const swipeThreshold = width * 0.25;
      
      if (gestureState.dx > swipeThreshold) {
        // Swipe right (like)
        Animated.timing(swipeAnim, {
          toValue: { x: width + 100, y: 0 },
          duration: 300,
          useNativeDriver: true
        }).start(() => handleNextCard('like'));
      } else if (gestureState.dx < -swipeThreshold) {
        // Swipe left (dislike)
        Animated.timing(swipeAnim, {
          toValue: { x: -width - 100, y: 0 },
          duration: 300,
          useNativeDriver: true
        }).start(() => handleNextCard('dislike'));
      } else {
        // Return to center if not enough swipe
        Animated.spring(swipeAnim, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }).start();
      }
    }
  });
  
  // Function to handle next card after swipe
  const handleNextCard = (action: 'like' | 'dislike') => {
    // Here you can handle the action (like or dislike)
    // For now, just move to next card
    if (currentItemIndex < filteredItems.length - 1) {
      // Reset animation before moving to next card
      swipeAnim.setValue({ x: 0, y: 0 });
      
      // Use setTimeout to ensure animation completes before changing index
      setTimeout(() => {
        setCurrentItemIndex(prevIndex => prevIndex + 1);
      }, 50);
    } else {
      // Reached the end of the cards
      setSwipingMode(false);
      Alert.alert("Конец", "Вы просмотрели все товары");
    }
  };
  
  // Function to manually trigger swipe
  const triggerSwipe = (direction: 'left' | 'right') => {
    if (!swipingMode || currentItemIndex >= filteredItems.length) return;
    
    // Reset any existing animation
    swipeAnim.setValue({ x: 0, y: 0 });
    
    // Apply the swipe animation
    Animated.timing(swipeAnim, {
      toValue: {
        x: direction === 'right' ? width + 100 : -width - 100,
        y: 0
      },
      duration: 300,
      useNativeDriver: true
    }).start(() => handleNextCard(direction === 'right' ? 'like' : 'dislike'));
  };

  // Apply filters to get filtered items
  const applyFilters = () => {
    if (!activeWishlist) return;
    
    let items = [...activeWishlist.items];
    
    // Apply category filter if not "All"
    if (selectedCategory !== 'Все') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // Apply budget filter
    items = items.filter(item => {
      // Convert price string to number, assuming format like "1299₽" or "$39.99"
      const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
      return price >= selectedBudgetRange.min && price <= selectedBudgetRange.max;
    });
    
    setFilteredItems(items);
    setCurrentItemIndex(0);
    
    // Reset animation
    swipeAnim.setValue({ x: 0, y: 0 });
  };
  
  // Update filtered items when active wishlist changes
  useEffect(() => {
    if (activeWishlist) {
      setFilteredItems(activeWishlist.items);
    }
  }, [activeWishlist]);
  
  // Apply filters when filter options change
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedBudgetRange, activeWishlist]);

  // Reset animation when swipingMode changes
  useEffect(() => {
    // Reset animation and index when toggling swipe mode
    swipeAnim.setValue({ x: 0, y: 0 });
    
    if (swipingMode) {
      // Reset to first item when entering swipe mode
      setCurrentItemIndex(0);
    }
  }, [swipingMode]);

  const handleCreateWishlist = () => {
    if (!newWishlistName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название вишлиста');
      return;
    }

    createWishlist(newWishlistName, newWishlistDescription);
    setNewWishlistName('');
    setNewWishlistDescription('');
    setModalVisible(false);
  };

  const handleEditWishlist = () => {
    if (!editingWishlist || !newWishlistName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название вишлиста');
      return;
    }

    updateWishlist(editingWishlist.id, {
      name: newWishlistName.trim(),
      description: newWishlistDescription.trim()
    });
    
    setNewWishlistName('');
    setNewWishlistDescription('');
    setEditingWishlist(null);
    setModalVisible(false);
  };

  const handleDeleteWishlist = (wishlistId: string) => {
    Alert.alert(
      'Удаление вишлиста',
      'Вы уверены, что хотите удалить этот вишлист?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            deleteWishlist(wishlistId);
            if (activeWishlist?.id === wishlistId) {
              setActiveWishlist(null);
              setDetailsModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const handleShareWishlist = async (wishlist: Wishlist) => {
    try {
      // Generate a shareable text or URL for the wishlist
      const shareMessage = `Мой вишлист "${wishlist.name}"\n\n${wishlist.description}\n\nТоваров: ${wishlist.items.length}\n\nПосмотреть в приложении GiftIdea`;
      
      const result = await Share.share({
        message: shareMessage,
        title: `Вишлист: ${wishlist.name}`
      });
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться вишлистом');
    }
  };

  const handleOpenWishlist = (wishlist: Wishlist) => {
    setActiveWishlist(wishlist);
    setDetailsModalVisible(true);
  };

  const handleRemoveItem = (wishlistId: string, itemId: string) => {
    removeItemFromWishlist(wishlistId, itemId);
    
    // Update active wishlist if it's the one being modified
    if (activeWishlist && activeWishlist.id === wishlistId) {
      const updatedActiveWishlist = wishlists.find(w => w.id === wishlistId);
      if (updatedActiveWishlist) {
        setActiveWishlist(updatedActiveWishlist);
      }
    }
  };

  const renderWishlistItem = ({ item }: { item: Wishlist }) => (
    <TouchableOpacity 
      style={styles.wishlistCard}
      onPress={() => handleOpenWishlist(item)}
    >
      <View style={styles.wishlistHeader}>
        <View>
          <Text style={styles.wishlistName}>{item.name}</Text>
          <Text style={styles.itemCount}>{item.items.length} {getItemsCountText(item.items.length)}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              setEditingWishlist(item);
              setNewWishlistName(item.name);
              setNewWishlistDescription(item.description);
              setModalVisible(true);
            }}
          >
            <Edit size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => handleShareWishlist(item)}
          >
            <ShareIcon size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => handleDeleteWishlist(item.id)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.items.length > 0 ? (
        <View style={styles.thumbnailContainer}>
          {item.items.slice(0, 4).map((wishItem, index) => (
            <Image 
              key={index}
              source={{ uri: wishItem.image }}
              style={styles.thumbnail}
            />
          ))}
          {item.items.length > 4 && (
            <View style={styles.moreItems}>
              <Text style={styles.moreItemsText}>+{item.items.length - 4}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.emptyListText}>Нет товаров в вишлисте</Text>
      )}
      
      <TouchableOpacity 
        style={styles.seeAllButton}
        onPress={() => handleOpenWishlist(item)}
      >
        <Text style={styles.seeAllText}>Посмотреть всё</Text>
        <ArrowRight size={16} color="#6C63FF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getItemsCountText = (count: number) => {
    if (count === 1) return 'товар';
    if (count >= 2 && count <= 4) return 'товара';
    return 'товаров';
  };

  const renderWishlistDetailsModal = () => {
    if (!activeWishlist) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#F5F8FF', '#FFFFFF']}
            style={[styles.modalContent, { minHeight: '90%' }]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{activeWishlist.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {activeWishlist.items.length} {getItemsCountText(activeWishlist.items.length)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {activeWishlist.description ? (
              <Text style={styles.wishlistDescription}>{activeWishlist.description}</Text>
            ) : null}
            
            <View style={styles.filterControlsContainer}>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => handleShareWishlist(activeWishlist)}
              >
                <ShareIcon size={18} color="#FFF" />
                <Text style={styles.shareButtonText}>Поделиться</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <Filter size={18} color={COLORS.primary} />
                <Text style={styles.filterButtonText}>Фильтры</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.swipeModeButton, swipingMode && styles.swipeModeButtonActive]}
                onPress={() => setSwipingMode(!swipingMode)}
              >
                <Heart size={18} color={swipingMode ? "#FFF" : COLORS.primary} />
                <Text style={[styles.swipeModeButtonText, swipingMode && styles.swipeModeButtonTextActive]}>
                  Свайп режим
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Category selector */}
            <View style={{ marginBottom: 15 }}>
              <ScrollView 
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContainer}
              >
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipSelected
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text 
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <Check size={14} color="#FFF" style={styles.categorySelectedIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Show either swipe cards or list based on mode */}
            {activeWishlist.items.length > 0 ? (
              swipingMode ? (
                <View style={styles.swipeContainer}>
                  {filteredItems.length > 0 ? (
                    <>
                      {/* Current card */}
                      {currentItemIndex < filteredItems.length && (
                        <Animated.View 
                          style={[
                            styles.swipeCard,
                            {
                              transform: [
                                { translateX: swipeAnim.x },
                                { translateY: swipeAnim.y },
                                { rotate: rotateAnim }
                              ]
                            }
                          ]}
                          {...panResponder.panHandlers}
                        >
                          <Image 
                            source={{ uri: filteredItems[currentItemIndex].image }} 
                            style={styles.swipeCardImage} 
                          />
                          
                          {/* Like overlay */}
                          <Animated.View style={[styles.likeOverlay, { opacity: likeOpacity }]}>
                            <Text style={styles.overlayText}>НРАВИТСЯ</Text>
                          </Animated.View>
                          
                          {/* Dislike overlay */}
                          <Animated.View style={[styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
                            <Text style={styles.overlayText}>НЕ НРАВИТСЯ</Text>
                          </Animated.View>
                          
                          <View style={styles.swipeCardContent}>
                            <Text style={styles.swipeCardTitle}>{filteredItems[currentItemIndex].name}</Text>
                            <View style={styles.itemMetaRow}>
                              <Text style={styles.itemPrice}>{filteredItems[currentItemIndex].price}</Text>
                              <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>{filteredItems[currentItemIndex].category}</Text>
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={styles.viewProductButton}
                              onPress={() => router.push(`/product-details?productId=${filteredItems[currentItemIndex].productId}`)}
                            >
                              <Text style={styles.viewProductButtonText}>Подробнее</Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      )}
                      
                      {/* Next card (shown partially underneath) */}
                      {currentItemIndex < filteredItems.length - 1 && (
                        <View style={[styles.swipeCard, styles.nextCard]}>
                          <Image 
                            source={{ uri: filteredItems[currentItemIndex + 1].image }} 
                            style={styles.swipeCardImage} 
                          />
                        </View>
                      )}
                      
                      {/* Swipe control buttons */}
                      <View style={styles.swipeControls}>
                        <TouchableOpacity 
                          style={styles.swipeButton}
                          onPress={() => triggerSwipe('left')}
                        >
                          <ThumbsDown size={24} color={COLORS.error} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.swipeButton}
                          onPress={() => triggerSwipe('right')}
                        >
                          <ThumbsUp size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Progress indicator */}
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                          {currentItemIndex + 1} из {filteredItems.length}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>
                        Нет товаров, соответствующих фильтрам
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.wishlistItemCard}>
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.itemImage}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemMetaRow}>
                          <Text style={styles.itemPrice}>{item.price}</Text>
                          <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>{item.category}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.itemActions}>
                        <TouchableOpacity 
                          style={styles.itemActionButton}
                          onPress={() => router.push(`/product-details?productId=${item.productId}`)}
                        >
                          <ShoppingBag size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.itemActionButton}
                          onPress={() => handleRemoveItem(activeWishlist.id, item.id)}
                        >
                          <Trash2 size={18} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.wishlistItemsList}
                />
              )
            ) : (
              <View style={styles.emptyStateContainer}>
                <Heart size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>
                  В этом вишлисте пока нет товаров
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Добавляйте товары, которые хотели бы получить в подарок
                </Text>
                <TouchableOpacity 
                  style={styles.browseCatalogButton}
                  onPress={() => {
                    setDetailsModalVisible(false);
                    router.push('/(tabs)/catalog');
                  }}
                >
                  <Text style={styles.browseCatalogText}>Перейти в каталог</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    );
  };
  
  // Render filter modal
  const renderFilterModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Фильтры</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* Category filter */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Tag size={20} color={COLORS.primary} />
                <Text style={styles.filterSectionTitle}>Категория</Text>
              </View>
              
              <ScrollView 
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContainer}
              >
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipSelected
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text 
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <Check size={14} color="#FFF" style={styles.categorySelectedIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Budget filter */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <DollarSign size={20} color={COLORS.primary} />
                <Text style={styles.filterSectionTitle}>Бюджет</Text>
              </View>
              
              <View style={styles.budgetRangeContainer}>
                {BUDGET_RANGES.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.budgetRangeOption,
                      selectedBudgetRange.label === range.label && styles.budgetRangeOptionSelected
                    ]}
                    onPress={() => setSelectedBudgetRange(range)}
                  >
                    <Text 
                      style={[
                        styles.budgetRangeText,
                        selectedBudgetRange.label === range.label && styles.budgetRangeTextSelected
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Apply filter button */}
            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => {
                applyFilters();
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyFilterButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка вишлистов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={COLORS.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мои вишлисты</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setEditingWishlist(null);
            setNewWishlistName('');
            setNewWishlistDescription('');
            setModalVisible(true);
          }}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      {wishlists.length > 0 ? (
        <FlatList
          data={wishlists}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>У вас пока нет вишлистов</Text>
          <Text style={styles.emptySubtitle}>
            Создайте вишлист, чтобы сохранять товары, которые вы хотели бы получить в подарок
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => {
              setEditingWishlist(null);
              setNewWishlistName('');
              setNewWishlistDescription('');
              setModalVisible(true);
            }}
          >
            <Text style={styles.createButtonText}>Создать вишлист</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Modal for creating/editing wishlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingWishlist ? 'Редактировать вишлист' : 'Создать вишлист'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Название вишлиста"
              placeholderTextColor="#999"
              value={newWishlistName}
              onChangeText={setNewWishlistName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание (необязательно)"
              placeholderTextColor="#999"
              value={newWishlistDescription}
              onChangeText={setNewWishlistDescription}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={styles.createWishlistButton}
              onPress={editingWishlist ? handleEditWishlist : handleCreateWishlist}
            >
              <Text style={styles.createButtonText}>
                {editingWishlist ? 'Сохранить' : 'Создать'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Render wishlist details modal */}
      {renderWishlistDetailsModal()}
      
      {/* Render filter modal */}
      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray700,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  wishlistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wishlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  thumbnail: {
    width: (width - 104) / 4,
    height: (width - 104) / 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  moreItems: {
    width: (width - 104) / 4,
    height: (width - 104) / 4,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyListText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: RADIUS.sm,
    marginBottom: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createWishlistButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  wishlistItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemActions: {
    justifyContent: 'space-around',
  },
  itemActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistItemsList: {
    paddingVertical: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseCatalogButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  browseCatalogText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wishlistDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  filterControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    paddingVertical: 10,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    marginBottom: 5,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  swipeModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    marginBottom: 5,
  },
  swipeModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  swipeModeButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  swipeModeButtonTextActive: {
    color: '#FFF',
  },
  filterModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '75%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  categoryScrollContainer: {
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#FFF',
  },
  categorySelectedIcon: {
    marginLeft: 4,
  },
  budgetRangeContainer: {
    marginTop: 8,
  },
  budgetRangeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  budgetRangeOptionSelected: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  budgetRangeText: {
    fontSize: 14,
    color: '#64748B',
  },
  budgetRangeTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  applyFilterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  applyFilterButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
    marginBottom: 60,
  },
  swipeCard: {
    width: width - 60,
    height: height * 0.4,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    zIndex: 2,
    overflow: 'hidden',
  },
  nextCard: {
    top: 10,
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
    zIndex: 1,
  },
  swipeCardImage: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  swipeCardContent: {
    padding: 16,
    height: '50%',
    justifyContent: 'space-between',
  },
  swipeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  viewProductButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  viewProductButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTag: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  swipeControls: {
    position: 'absolute',
    bottom: -70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  likeOverlay: {
    position: 'absolute',
    top: '25%',
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  dislikeOverlay: {
    position: 'absolute',
    top: '25%',
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EF4444',
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    position: 'absolute',
    bottom: -100,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  categoryScrollView: {
    marginBottom: 20,
    maxHeight: 90,
  },
}); 