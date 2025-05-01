import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Stack, router } from 'expo-router';
import LoyaltyProgram from '@/components/LoyaltyProgram';

export default function LoyaltyProgramScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LoyaltyProgram onClose={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
}); 