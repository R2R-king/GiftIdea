import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original catalog screen component
import CatalogScreen from '@/app/(tabs)/catalog';

export default function DrawerCatalog() {
  // Redirect to tabs navigation
  return <Redirect href="/(tabs)/catalog" />;
} 