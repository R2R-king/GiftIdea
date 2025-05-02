import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original cart screen component
import CartScreen from '@/app/(tabs)/cart';

export default function DrawerCart() {
  // Redirect to tabs navigation
  return <Redirect href="/(tabs)/cart" />;
} 