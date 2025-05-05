import * as React from 'react';
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
import { useTheme } from '@/components/ThemeProvider';

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
  
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';
  
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newWishlistName, setNewWishlistName] = React.useState('');
  const [newWishlistDescription, setNewWishlistDescription] = React.useState('');
  const [editingWishlist, setEditingWishlist] = React.useState<Wishlist | null>(null);
  const [activeWishlist, setActiveWishlist] = React.useState<Wishlist | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = React.useState(false);
  
  // New states for category and budget filtering
  const [selectedCategory, setSelectedCategory] = React.useState('Все');
  const [selectedBudgetRange, setSelectedBudgetRange] = React.useState(BUDGET_RANGES[0]);
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState<WishlistItem[]>([]);
  
  // States for tinder-like swiping
  const [currentItemIndex, setCurrentItemIndex] = React.useState(0);
  const [swipingMode, setSwipingMode] = React.useState(false);
  const swipeAnim = React.useRef(new Animated.ValueXY()).current;
  
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
  React.useEffect(() => {
    if (activeWishlist) {
      setFilteredItems(activeWishlist.items);
    }
  }, [activeWishlist]);
  
  // Apply filters when filter options change
  React.useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedBudgetRange, activeWishlist]);

  // Reset animation when swipingMode changes
  React.useEffect(() => {
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
      style={[
        styles.wishlistCard, 
        isDark && { 
          backgroundColor: isDark ? '#1A1A1A' : colors.white, 
          borderColor: 'rgba(255,255,255,0.1)'
        }
      ]}
      onPress={() => handleOpenWishlist(item)}
    >
      <View style={styles.wishlistHeader}>
        <View>
          <Text style={[
            styles.wishlistName,
            isDark && { color: '#F3F4F6' }
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.wishlistItems,
            isDark && { color: '#9CA3AF' }
          ]}>
            {getItemsCountText(item.items.length)}
          </Text>
        </View>
        
        <View style={styles.wishlistActions}>
          <TouchableOpacity
            style={[styles.actionButton, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => {
              setEditingWishlist(item);
              setNewWishlistName(item.name);
              setNewWishlistDescription(item.description || '');
              setModalVisible(true);
            }}
          >
            <Edit size={16} color={isDark ? '#F3F4F6' : "#111"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => handleShareWishlist(item)}
          >
            <ShareIcon size={16} color={isDark ? '#F3F4F6' : "#111"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => handleDeleteWishlist(item.id)}
          >
            <Trash2 size={16} color={isDark ? "#FF4949" : "#EF4444"} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.description && (
        <Text style={[
          styles.wishlistDescription,
          isDark && { color: '#9CA3AF' }
        ]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.itemPreview}>
        {item.items.slice(0, 3).map((wishlistItem, index) => (
          <Image
            key={wishlistItem.id}
            source={{ uri: wishlistItem.image }}
            style={[
              styles.previewImage,
              index > 0 && { marginLeft: -15 },
              { zIndex: 3 - index }
            ]}
          />
        ))}
        
        {item.items.length > 3 && (
          <View style={[
            styles.moreItemsIndicator,
            isDark && { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#1A1A1A' }
          ]}>
            <Text style={[
              styles.moreItemsText,
              isDark && { color: '#F3F4F6' }
            ]}>
              +{item.items.length - 3}
            </Text>
          </View>
        )}
        
        {item.items.length === 0 && (
          <View style={styles.emptyPreview}>
            <ShoppingBag size={24} color={isDark ? '#444444' : "#E0E0E0"} />
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.openButton,
          isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
        ]}
        onPress={() => handleOpenWishlist(item)}
      >
        <Text style={[
          styles.openButtonText,
          isDark && { color: '#F3F4F6' }
        ]}>
          Открыть
        </Text>
        <ArrowRight size={16} color={isDark ? '#F3F4F6' : "#111"} />
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
          <View style={[
            styles.detailsModalContent,
            isDark && { backgroundColor: isDark ? '#1A1A1A' : colors.white }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={[
                  styles.backButton,
                  isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
                ]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <ChevronLeft size={24} color={isDark ? '#F3F4F6' : "#000"} />
              </TouchableOpacity>
              
              <Text style={[
                styles.modalTitle,
                isDark && { color: '#F3F4F6' }
              ]}>
                {activeWishlist.name}
              </Text>
              
              <View style={{ width: 40 }} />
            </View>
            
            {/* Wishlist Description and Item Count */}
            <View style={styles.wishlistHeaderInfo}>
              <Text style={[
                styles.itemCount,
                isDark && { color: '#9CA3AF' }
              ]}>
                {getItemsCountText(activeWishlist.items.length)}
              </Text>
              
              {activeWishlist.description && (
                <Text style={[
                  styles.wishlistDescriptionModal,
                  isDark && { color: '#9CA3AF' }
                ]}>
                  {activeWishlist.description}
                </Text>
              )}
            </View>
            
            {/* Tab selection for swipe/list mode */}
            <View style={[
              styles.modeSwitcher,
              isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.modeTab,
                  !swipingMode && styles.activeTab,
                  isDark && !swipingMode && { backgroundColor: isDark ? '#1A1A1A' : colors.white }
                ]}
                onPress={() => {
                  setSwipingMode(false);
                }}
              >
                <Text style={[
                  styles.modeTabText,
                  !swipingMode && styles.activeTabText,
                  isDark && { color: swipingMode ? '#9CA3AF' : '#F3F4F6' }
                ]}>
                  Список
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modeTab,
                  swipingMode && styles.activeTab,
                  isDark && swipingMode && { backgroundColor: isDark ? '#1A1A1A' : colors.white }
                ]}
                onPress={() => {
                  if (activeWishlist.items.length === 0) {
                    Alert.alert("Список пуст", "Добавьте товары в вишлист, чтобы использовать режим свайпа");
                    return;
                  }
                  
                  setSwipingMode(true);
                  setCurrentItemIndex(0);
                  applyFilters(); // Apply any current filters to the displayed items
                }}
              >
                <Text style={[
                  styles.modeTabText,
                  swipingMode && styles.activeTabText,
                  isDark && { color: !swipingMode ? '#9CA3AF' : '#F3F4F6' }
                ]}>
                  Свайп
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Filter button */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Filter size={16} color={isDark ? '#F3F4F6' : "#111"} />
              <Text style={[
                styles.filterButtonText,
                isDark && { color: '#F3F4F6' }
              ]}>
                Фильтры
              </Text>
            </TouchableOpacity>
            
            {/* Content area for list or swipe mode */}
            <LinearGradient
              colors={isDark ? 
                ['#121212', '#1A1A1A'] : 
                ['#F9FAFB', '#FFFFFF']}
              style={styles.contentContainer}
            >
              {swipingMode ? (
                // Swipe mode content
                filteredItems.length > 0 ? (
                  <View style={styles.swipeContainer}>
                    {/* Current card */}
                    {currentItemIndex < filteredItems.length && (
                      <Animated.View
                        style={[
                          styles.swipeCard,
                          isDark && { backgroundColor: isDark ? '#1A1A1A' : colors.white },
                          {
                            transform: [
                              { translateX: swipeAnim.x },
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
                        
                        <View style={styles.swipeCardContent}>
                          <Text style={[
                            styles.swipeCardTitle,
                            isDark && { color: '#F3F4F6' }
                          ]}>
                            {filteredItems[currentItemIndex].name}
                          </Text>
                          
                          <Text style={[
                            styles.swipeCardPrice,
                            isDark && { color: COLORS.primary }
                          ]}>
                            {filteredItems[currentItemIndex].price.toLocaleString()} ₽
                          </Text>
                          
                          {filteredItems[currentItemIndex].category && (
                            <View style={[
                              styles.categoryTag,
                              isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
                            ]}>
                              <Text style={[
                                styles.categoryTagText,
                                isDark && { color: '#9CA3AF' }
                              ]}>
                                {filteredItems[currentItemIndex].category}
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        {/* Like overlay */}
                        <Animated.View style={[
                          styles.swipeOverlay,
                          styles.likeOverlay,
                          { opacity: likeOpacity }
                        ]}>
                          <ThumbsUp size={64} color="#FFFFFF" />
                        </Animated.View>
                        
                        {/* Dislike overlay */}
                        <Animated.View style={[
                          styles.swipeOverlay,
                          styles.dislikeOverlay,
                          { opacity: dislikeOpacity }
                        ]}>
                          <ThumbsDown size={64} color="#FFFFFF" />
                        </Animated.View>
                      </Animated.View>
                    )}
                    
                    {/* Action buttons */}
                    <View style={styles.swipeActions}>
                      <TouchableOpacity
                        style={[
                          styles.swipeActionButton,
                          styles.dislikeButton,
                          isDark && { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                        ]}
                        onPress={() => triggerSwipe('left')}
                      >
                        <ThumbsDown size={24} color="#EF4444" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.swipeActionButton,
                          styles.likeButton,
                          isDark && { backgroundColor: 'rgba(34, 197, 94, 0.2)' }
                        ]}
                        onPress={() => triggerSwipe('right')}
                      >
                        <ThumbsUp size={24} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Progress indicator */}
                    <View style={styles.swipeProgress}>
                      <Text style={[
                        styles.swipeProgressText,
                        isDark && { color: '#9CA3AF' }
                      ]}>
                        {currentItemIndex + 1} / {filteredItems.length}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Heart size={64} color={isDark ? '#444444' : "#E0E0E0"} />
                    <Text style={[
                      styles.emptyStateText,
                      isDark && { color: '#F3F4F6' }
                    ]}>
                      В этом вишлисте пока нет товаров
                    </Text>
                    <Text style={[
                      styles.emptyStateSubtext,
                      isDark && { color: '#9CA3AF' }
                    ]}>
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
                )
              ) : (
                // List mode content
                activeWishlist.items.length > 0 ? (
                  <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.wishlistItemsList}
                    renderItem={({ item }) => (
                      <View style={[
                        styles.wishlistItemCard,
                        isDark && { 
                          backgroundColor: isDark ? '#1A1A1A' : colors.white,
                          borderColor: 'rgba(255,255,255,0.05)' 
                        }
                      ]}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                          <Text style={[
                            styles.itemName,
                            isDark && { color: '#F3F4F6' }
                          ]}>
                            {item.name}
                          </Text>
                          <Text style={[
                            styles.itemPrice,
                            isDark && { color: COLORS.primary }
                          ]}>
                            {item.price.toLocaleString()} ₽
                          </Text>
                          {item.category && (
                            <View style={[
                              styles.categoryPill,
                              isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
                            ]}>
                              <Text style={[
                                styles.categoryPillText,
                                isDark && { color: '#9CA3AF' }
                              ]}>
                                {item.category}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            style={styles.itemActionButton}
                            onPress={() => {
                              if (!activeWishlist) return;
                              handleRemoveItem(activeWishlist.id, item.id);
                            }}
                          >
                            <Trash2 size={20} color={isDark ? "#FF4949" : "#EF4444"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Heart size={64} color={isDark ? '#444444' : "#E0E0E0"} />
                    <Text style={[
                      styles.emptyStateText,
                      isDark && { color: '#F3F4F6' }
                    ]}>
                      В этом вишлисте пока нет товаров
                    </Text>
                    <Text style={[
                      styles.emptyStateSubtext,
                      isDark && { color: '#9CA3AF' }
                    ]}>
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
                )
              )}
            </LinearGradient>
          </View>
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
          <View style={[
            styles.filterModalContent, 
            isDark && { 
              backgroundColor: colors.cardBackground,
              borderTopColor: 'rgba(255,255,255,0.1)'
            }
          ]}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text style={[
                styles.filterModalTitle,
                isDark && { color: colors.textPrimary }
              ]}>
                Фильтры
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={isDark ? colors.textPrimary : "#000"} />
              </TouchableOpacity>
            </View>
            
            <View>
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Tag size={20} color={COLORS.primary} />
                  <Text style={[
                    styles.filterSectionTitle,
                    isDark && { color: colors.textPrimary }
                  ]}>
                    Категория
                  </Text>
                </View>
                
                <View style={styles.categoryScrollContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category && styles.categoryChipSelected,
                        isDark && selectedCategory !== category && { backgroundColor: 'rgba(255,255,255,0.1)' }
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextSelected,
                        isDark && selectedCategory !== category && { color: colors.textSecondary }
                      ]}>
                        {category}
                      </Text>
                      {selectedCategory === category && (
                        <Check size={14} color="#FFF" style={styles.categorySelectedIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <DollarSign size={20} color={COLORS.primary} />
                  <Text style={[
                    styles.filterSectionTitle,
                    isDark && { color: colors.textPrimary }
                  ]}>
                    Бюджет
                  </Text>
                </View>
                
                <View style={styles.budgetRangeContainer}>
                  {BUDGET_RANGES.map((range, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.budgetRangeOption,
                        selectedBudgetRange.label === range.label && styles.budgetRangeOptionSelected,
                        isDark && selectedBudgetRange.label !== range.label && { backgroundColor: 'rgba(255,255,255,0.1)' }
                      ]}
                      onPress={() => setSelectedBudgetRange(range)}
                    >
                      <Text 
                        style={[
                          styles.budgetRangeText,
                          selectedBudgetRange.label === range.label && styles.budgetRangeTextSelected,
                          isDark && selectedBudgetRange.label !== range.label && { color: colors.textSecondary }
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
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={[
        styles.loadingContainer,
        isDark && { backgroundColor: colors.primaryBackground }
      ]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[
          styles.loadingText,
          isDark && { color: colors.textSecondary }
        ]}>
          Загрузка вишлистов...
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isDark && { backgroundColor: colors.primaryBackground }
    ]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with back button */}
      <View style={[
        styles.header,
        isDark && { backgroundColor: colors.cardBackground }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            isDark && { backgroundColor: 'rgba(255,255,255,0.05)' }
          ]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={isDark ? colors.textPrimary : COLORS.gray800} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isDark && { color: colors.textPrimary }
        ]}>
          Мои вишлисты
        </Text>
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
        <View style={[
          styles.emptyContainer,
          isDark && { backgroundColor: colors.primaryBackground }
        ]}>
          <Heart size={80} color={isDark ? '#444444' : "#E0E0E0"} />
          <Text style={[
            styles.emptyTitle,
            isDark && { color: colors.textPrimary }
          ]}>
            У вас пока нет вишлистов
          </Text>
          <Text style={[
            styles.emptySubtitle,
            isDark && { color: colors.textSecondary }
          ]}>
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
          <View style={[
            styles.modalContent,
            isDark && { 
              backgroundColor: colors.cardBackground,
              borderTopColor: 'rgba(255,255,255,0.1)'
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDark && { color: colors.textPrimary }
              ]}>
                {editingWishlist ? 'Редактировать вишлист' : 'Создать вишлист'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={isDark ? colors.textPrimary : "#000"} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[
                styles.input,
                isDark && {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: colors.textPrimary,
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              ]}
              placeholder="Название вишлиста"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : "#999"}
              value={newWishlistName}
              onChangeText={setNewWishlistName}
            />
            
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                isDark && {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: colors.textPrimary,
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              ]}
              placeholder="Описание (необязательно)"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : "#999"}
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
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
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  wishlistCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  wishlistItems: {
    fontSize: 14,
    color: '#64748B',
  },
  wishlistActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  itemPreview: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  previewImage: {
    width: (width - 104) / 4,
    height: (width - 104) / 4,
    borderRadius: 8,
  },
  emptyPreview: {
    width: (width - 104) / 4,
    height: (width - 104) / 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  openButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createWishlistButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
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
  wishlistItemsList: {
    padding: 16,
    paddingBottom: 80,
  },
  wishlistItemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  categorySelectedIcon: {
    marginLeft: 4,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryTag: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#64748B',
  },
  itemActions: {
    justifyContent: 'center',
  },
  itemActionButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
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
  detailsModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '75%',
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
  wishlistHeaderInfo: {
    marginBottom: 20,
  },
  itemCount: {
    fontSize: 14,
    color: '#64748B',
  },
  wishlistDescriptionModal: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  modeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: RADIUS.md,
    padding: 4,
    backgroundColor: '#F1F5F9',
  },
  modeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  contentContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
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
  swipeCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  likeOverlay: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  swipeActions: {
    position: 'absolute',
    bottom: -70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
  },
  swipeActionButton: {
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
  dislikeButton: {
    backgroundColor: '#FFF',
  },
  likeButton: {
    backgroundColor: '#FFF',
  },
  swipeProgress: {
    position: 'absolute',
    bottom: -110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeProgressText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  filterModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '75%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  categoryScrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  budgetRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  budgetRangeOption: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginRight: 8,
    marginBottom: 8,
  },
  budgetRangeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  budgetRangeText: {
    fontSize: 14,
    color: '#64748B',
  },
  budgetRangeTextSelected: {
    color: 'white',
  },
  applyFilterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  applyFilterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: 16,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginLeft: 8,
  },
  moreItemsIndicator: {
    width: (width - 104) / 4,
    height: (width - 104) / 4,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    marginLeft: -15,
    zIndex: 0,
  },
  moreItemsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
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
    color: '#9CA3AF',
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
}); 