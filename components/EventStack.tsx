import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  PanResponder,
  TouchableOpacity,
  Text,
  Easing
} from 'react-native';
import { COLORS } from '@/constants/theme';

// Define HolidayEvent type here to avoid importing from UpcomingEvents
export interface HolidayEvent {
  id: string;
  name: string;
  date: string;
  daysLeft: number;
  image: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_ROTATION = 5; // degrees
const MAX_VISIBLE_CARDS = 3;
const PERSPECTIVE = 1200; // 3D perspective
const ROTATION_X = 10; // Rotation in degrees for 3D effect
const CARDS_OFFSET = 30; // Vertical offset between cards
const OFFSET_Y = 15; // Smaller vertical offset between cards
const SCALE_FACTOR = 0.03; // Smaller scale reduction for subtler effect

interface EventStackProps {
  events: HolidayEvent[];
  onEventPress: (event: HolidayEvent) => void;
  onSwipeLeft?: (event: HolidayEvent) => void;
  onSwipeRight?: (event: HolidayEvent) => void;
  renderCard: (item: HolidayEvent, isTop: boolean) => React.ReactNode;
}

const EventStack: React.FC<EventStackProps> = ({ 
  events, 
  onEventPress,
  onSwipeLeft,
  onSwipeRight,
  renderCard
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const rotationRef = useRef(position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [`-${CARD_ROTATION}deg`, '0deg', `${CARD_ROTATION}deg`],
    extrapolate: 'clamp'
  }));
  
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true
    }).start();
  };
  
  // Enhanced swipe card animation
  const swipeCard = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    const y = direction === 'right' ? -30 : 30;
    
    // Create more dynamic animation sequence
    Animated.sequence([
      // First slight rotation and lift
      Animated.timing(position, {
        toValue: { 
          x: direction === 'right' ? SCREEN_WIDTH * 0.1 : -SCREEN_WIDTH * 0.1, 
          y: -10 
        },
        duration: 100,
        useNativeDriver: true
      }),
      // Then full swipe with smooth easing
      Animated.timing(position, {
        toValue: { x, y },
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true
      }),
    ]).start(() => {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft(events[currentIndex]);
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight(events[currentIndex]);
      }
      
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prevIndex => Math.min(prevIndex + 1, events.length - 1));
    });
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;
  
  const getCardStyle = (index: number) => {
    const isTopCard = index === currentIndex;
    
    if (isTopCard) {
      return {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotationRef.current }
        ],
        zIndex: 1000,
        // Enhanced shadow for top card
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
      };
    }
    
    const diff = index - currentIndex;
    if (diff > MAX_VISIBLE_CARDS - 1) {
      return { opacity: 0 };
    }
    
    // Use supported transform properties
    return {
      transform: [
        { translateY: diff * CARDS_OFFSET }, // Vertical stacking
        { rotateX: `${diff * ROTATION_X}deg` }, // 3D rotation on X axis
        { scale: 1 - 0.08 * diff } // Size reduction for perspective effect
      ],
      opacity: 1 - 0.15 * diff,
      zIndex: 900 - diff,
      // Enhanced shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 - diff * 5 },
      shadowOpacity: 0.35 - 0.1 * diff,
      shadowRadius: 15 - diff * 3,
      elevation: 15 - diff * 3,
    };
  };
  
  const renderCards = () => {
    return events.map((item, index) => {
      if (index < currentIndex) return null;
      
      const isTopCard = index === currentIndex;
      const cardStyle = getCardStyle(index);
      
      if (isTopCard) {
        return (
          <Animated.View
            key={item.id}
            style={[styles.card, cardStyle]}
            {...panResponder.panHandlers}
          >
            {renderCard(item, true)}
          </Animated.View>
        );
      }
      
      return (
        <Animated.View
          key={item.id}
          style={[styles.card, cardStyle]}
        >
          {renderCard(item, false)}
        </Animated.View>
      );
    });
  };
  
  const onPressNext = () => {
    if (currentIndex < events.length - 1) {
      swipeCard('left');
    }
  };
  
  const onPressPrevious = () => {
    if (currentIndex > 0) {
      // Set initial position with slight rotation
      position.setValue({ x: -SCREEN_WIDTH, y: 20 });
      setCurrentIndex(prevIndex => prevIndex - 1);
      
      // Use spring for a more dynamic bounce effect
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  };
  
  // Add a tilt effect when user is dragging the card
  useEffect(() => {
    rotationRef.current = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [`-${CARD_ROTATION}deg`, '0deg', `${CARD_ROTATION}deg`],
      extrapolate: 'clamp'
    });
  }, [position.x]);
  
  // Improved card rendering with staggered animation on mount
  useEffect(() => {
    if (events.length > 0) {
      const cardAnimations = events.slice(0, MAX_VISIBLE_CARDS + 1).map((_, index) => {
        const animatedValue = new Animated.Value(0);
        return Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true
        });
      });
      
      Animated.stagger(50, cardAnimations).start();
    }
  }, [events]);
  
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>У вас пока нет событий</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {renderCards()}
      </View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]} 
          onPress={onPressPrevious}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.disabledButtonText]}>← Назад</Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicatorContainer}>
          <Text style={styles.pageIndicator}>
            {currentIndex + 1} / {events.length}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === events.length - 1 && styles.disabledButton]} 
          onPress={onPressNext}
          disabled={currentIndex === events.length - 1}
        >
          <Text style={[styles.navButtonText, currentIndex === events.length - 1 && styles.disabledButtonText]}>Вперед →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 40,
    paddingBottom: 20,
    perspective: '1500px', // Increased perspective for more dramatic 3D
  },
  card: {
    width: SCREEN_WIDTH - 50, // Slightly narrower cards for better stack visibility
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'transparent',
    height: 180, // Fixed height for cards
    backfaceVisibility: 'hidden', // Prevent seeing backside of cards
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20, // More rounded buttons
    minWidth: 100, // Fixed width for consistency
    alignItems: 'center', // Center text
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#EEEEEE',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#BBBBBB',
  },
  pageIndicatorContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
  },
});

export default EventStack; 