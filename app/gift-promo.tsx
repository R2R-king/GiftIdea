import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// Создаем собственный массив цветов для сердечек
const HEART_COLORS = [
  COLORS.giftYellow,    // Светло-оранжевый
  COLORS.giftPink,      // Светло-розовый
  COLORS.giftBlue,      // Светло-голубой
  COLORS.giftTeal,      // Мятный
];

// Создаем кастомные анимации
Animatable.initializeRegistryWithDefinitions({
  bounceInDown: {
    0: {
      opacity: 0,
      translateY: -100,
    },
    0.6: {
      opacity: 1,
      translateY: 20,
    },
    0.8: {
      translateY: -10,
    },
    1: {
      translateY: 0,
    },
  },
  floatHeart: {
    0: {
      translateY: 0,
      translateX: 0,
    },
    0.5: {
      translateY: -10,
      translateX: 5,
    },
    1: {
      translateY: 0,
      translateX: 0,
    },
  },
});

export default function GiftPromoScreen() {
  const handleStartPlanning = () => {
    router.replace('/(tabs)');
  };

  // Создаем анимированные значения
  const giftRotate = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Анимация для вращения подарка
    Animated.loop(
      Animated.sequence([
        Animated.timing(giftRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(giftRotate, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Анимация пульсации кнопки
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Интерполируем значения для анимации
  const rotateInterpolation = giftRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.giftBackground} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#E1F5FE', '#E8F5E9', '#FFF8E1']}
        style={styles.gradient}
      >
        {/* Анимированные сердечки */}
        <View style={styles.animationContainer}>
          {[...Array(12)].map((_, i) => (
            <Animatable.View
              key={i}
              animation="floatHeart"
              iterationCount="infinite"
              direction="alternate"
              duration={3000 + i * 500}
              delay={i * 300}
              style={[
                styles.heart,
                {
                  top: i === 0 ? height * 0.15 : i === 11 ? height * 0.85 : Math.random() * height * 0.7 + height * 0.15,
                  left: i === 0 ? width * 0.5 : Math.random() * width * 0.8 + width * 0.1,
                  opacity: i === 0 ? 0.8 : Math.random() * 0.6 + 0.2,
                  transform: [{ scale: i === 0 ? 1 : 0.4 + Math.random() * 0.6 }],
                }
              ]}
              useNativeDriver
            >
              <MaterialCommunityIcons 
                name="heart" 
                size={i === 0 ? 24 : 16 + Math.floor(Math.random() * 12)} 
                color={HEART_COLORS[i % HEART_COLORS.length]} 
              />
            </Animatable.View>
          ))}
        </View>
        
        {/* Анимированная подарочная коробка */}
        <View style={styles.contentContainer}>
          <Animatable.View 
            style={styles.giftContainer}
            animation="bounceInDown"
            duration={1500}
            useNativeDriver
          >
            <Animated.View style={{
              transform: [{ rotate: rotateInterpolation }]
            }}>
              <MaterialCommunityIcons name="gift" size={120} color={COLORS.primary} />
            </Animated.View>
          </Animatable.View>
          
          <View style={styles.textContainer}>
            <Animatable.Text 
              style={styles.createText}
              animation="fadeInUp"
              duration={800}
              delay={600}
              useNativeDriver
            >
              Найди
            </Animatable.Text>
            <Animatable.Text 
              style={styles.unforgettableText}
              animation="fadeInUp"
              duration={800}
              delay={800}
              useNativeDriver
            >
              Идеальный
            </Animatable.Text>
            <Animatable.Text 
              style={styles.giftText}
              animation="fadeInUp"
              duration={800}
              delay={1000}
              useNativeDriver
            >
              Подарок!
            </Animatable.Text>
          </View>
          
          <Animatable.View
            animation="fadeIn"
            duration={800}
            delay={1200}
            useNativeDriver
          >
            <Animated.View style={{
              transform: [{ scale: buttonScale }]
            }}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartPlanning}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Начать</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animatable.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width,
    height,
  },
  animationContainer: {
    position: 'absolute',
    width,
    height,
  },
  heart: {
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  giftContainer: {
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  createText: {
    color: COLORS.gray800,
    fontSize: 34,
    fontWeight: '600',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unforgettableText: {
    color: COLORS.gray800,
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  giftText: {
    color: COLORS.primary,
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    ...SHADOWS.yellow,
    width: width * 0.9,
    maxWidth: 350,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 