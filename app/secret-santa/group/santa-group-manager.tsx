import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import CreateSecretSantaGroup from '../../../components/CreateSecretSantaGroup';

export default function NewSecretSantaGroupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Screen
        options={{
          title: 'Создать группу',
          headerShown: true,
        }}
      />
      <CreateSecretSantaGroup />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
}); 