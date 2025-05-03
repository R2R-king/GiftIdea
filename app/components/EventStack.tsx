import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  PanResponder,
  TouchableOpacity,
  Text
} from 'react-native';
import { HolidayEvent } from './UpcomingEvents';
import { COLORS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_ROTATION = 5; // degrees
const MAX_VISIBLE_CARDS = 3;

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
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [`-${CARD_ROTATION}deg`, '0deg', `${CARD_ROTATION}deg`],
    extrapolate: 'clamp'
  });
  
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true
    }).start();
  };
  
  const swipeCard = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: true
    }).start(() => {
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
        position.setValue({ x: gesture.dx, y: 0 });
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
        ...position.getLayout(),
        transform: [
          ...position.getTranslateTransform(),
          { rotate: rotation }
        ],
        zIndex: 1000
      };
    }
    
    const diff = index - currentIndex;
    if (diff > MAX_VISIBLE_CARDS - 1) {
      return { opacity: 0 };
    }
    
    // For cards beneath the top card
    return {
      top: 10 * diff,
      transform: [
        { scale: 1 - 0.05 * diff },
        { translateY: -7 * diff }
      ],
      opacity: 1 - 0.2 * diff,
      zIndex: 900 - diff
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
      setCurrentIndex(prevIndex => prevIndex - 1);
      position.setValue({ x: 0, y: 0 });
    }
  };
  
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
          <Text style={styles.navButtonText}>← Назад</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageIndicator}>
          {currentIndex + 1} / {events.length}
        </Text>
        
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === events.length - 1 && styles.disabledButton]} 
          onPress={onPressNext}
          disabled={currentIndex === events.length - 1}
        >
          <Text style={styles.navButtonText}>Вперед →</Text>
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
  },
  card: {
    width: SCREEN_WIDTH - 40,
    position: 'absolute',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: COLORS.gray300,
    opacity: 0.7,
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