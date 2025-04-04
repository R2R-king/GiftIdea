import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function TabBarShadow() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)']}
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