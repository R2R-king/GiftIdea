import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original favorites screen component
import FavoritesScreen from '@/app/(tabs)/favorites';

export default function DrawerFavorites() {
  // Redirect to tabs navigation
  return <Redirect href="/(tabs)/favorites" />;
} 