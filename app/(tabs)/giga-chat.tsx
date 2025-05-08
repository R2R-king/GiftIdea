import React from 'react';
import { Redirect } from 'expo-router';

export default function GigaChatScreen() {
  // Перенаправление на существующий компонент gift-assistant
  return <Redirect href="/gift-assistant" />;
} 