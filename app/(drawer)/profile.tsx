import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original profile screen component
import ProfileScreen from '@/app/(tabs)/profile';

export default function DrawerProfile() {
  // Redirect to tabs navigation
  return <Redirect href="/(tabs)/profile" />;
} 