import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ValentinePromoScreen() {
  const handleStartPlanning = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#880E4F" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1547414368-ac947d00b91d?w=800' }}
        style={styles.background}
      >
        <LinearGradient
          colors={['rgba(136, 14, 79, 0.5)', 'rgba(136, 14, 79, 0.9)', '#880E4F']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.createText}>Create an</Text>
              <Text style={styles.unforgettableText}>Unforgettable</Text>
              <Text style={styles.valentineText}>Valentine's Day!</Text>
            </View>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPlanning}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Planning</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width,
    height,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  createText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '600',
    marginBottom: 5,
  },
  unforgettableText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  valentineText: {
    color: '#FF4081',
    fontSize: 36,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#FF4081',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    width: '90%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 