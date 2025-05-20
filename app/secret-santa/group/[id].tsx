import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import SecretSantaGroupManager from '../../../components/SecretSantaGroupManager';

export default function SecretSantaGroupScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Screen
        options={{
          title: 'Группа Тайного Санты',
          headerShown: true,
        }}
      />
      <SecretSantaGroupManager groupId={id as string} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
}); 