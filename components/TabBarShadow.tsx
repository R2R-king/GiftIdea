import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';

const { width } = Dimensions.get('window');

export default function TabBarShadow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gradientColors = isDark 
    ? ['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)'] as const
    : ['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)'] as const;
    
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
    pointerEvents: 'none',
  },
  gradient: {
    width: width,
    height: 120,
    position: 'absolute',
    bottom: 0,
  },
}); 