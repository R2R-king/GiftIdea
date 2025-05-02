import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { router, Redirect } from 'expo-router';

// Import the original home screen component
import HomeScreen from '@/app/(tabs)/index';

export default function DrawerHome() {
  // Redirect to tabs navigation
  return <Redirect href="/(tabs)" />;
} 