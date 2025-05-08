import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original favorites screen component
import FavoritesScreen from '@/app/favorites';

export default function DrawerFavorites() {
  // Redirect to the new favorites screen
  return <Redirect href="/favorites" />;
} 