import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LiquidSwipeGiftPromo from '@/components/LiquidSwipeGiftPromo';

export default function GiftPromoScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <LiquidSwipeGiftPromo />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 