import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LiquidSwipeGiftPromo from '@/components/LiquidSwipeGiftPromo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GiftPromoScreen() {
  const insets = useSafeAreaInsets();
  
  // Функция для перехода к основному приложению после окончания promo
  const handleFinishPromo = () => {
    console.log("Переход к основному приложению!");
    router.replace('/(tabs)');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
          gestureEnabled: false, // Отключаем жесты навигации
        }} 
      />
      <LiquidSwipeGiftPromo onFinish={handleFinishPromo} />
      
      {/* Кнопка пропуска в правом верхнем углу */}
      <TouchableOpacity 
        style={[
          styles.skipButton,
          { top: insets.top + 20 }
        ]}
        onPress={handleFinishPromo}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Пропустить</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    zIndex: 2000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
}); 