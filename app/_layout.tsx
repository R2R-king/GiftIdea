import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { LocalizationWrapper } from '@/components/LocalizationWrapper';
import * as SplashScreen from 'expo-splash-screen';

// Предотвращаем скрытие сплэш экрана
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // После загрузки приложения, переходим на промо-экран
    const redirectToPromo = async () => {
      // Небольшая задержка для анимаций
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Скрываем сплэш экран
      await SplashScreen.hideAsync();
      
      // Перенаправляем на промо экран
      router.replace('/valentine-promo');
    };

    redirectToPromo();
  }, []);

  return (
    <Provider store={store}>
      <LocalizationWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="valentine-promo" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="product-details" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </LocalizationWrapper>
    </Provider>
  );
}