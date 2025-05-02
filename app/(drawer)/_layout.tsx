import React from 'react';
import { Stack } from 'expo-router';
import { useAppLocalization } from '@/components/LocalizationWrapper';

/**
 * Drawer Layout Component
 * 
 * This component previously contained the drawer navigation implementation
 * which has been temporarily disabled in favor of using the tab navigation.
 * 
 * The drawer implementation files are kept for future reference and can be 
 * re-enabled in the future if needed.
 */
export default function DrawerLayout() {
  const { t } = useAppLocalization();

  // Using Stack instead of Drawer to simplify redirection
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="catalog" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="profile" />
    </Stack>
  );
} 