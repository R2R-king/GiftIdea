import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { LocalizationWrapper } from '@/components/LocalizationWrapper';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { Platform } from 'react-native';

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
        <Stack 
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
            animationDuration: 400,
            gestureEnabled: true,
            presentation: 'transparentModal',
            animationTypeForReplace: 'push',
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false, 
              animation: 'fade', 
              animationDuration: 200 
            }} 
          />
          <Stack.Screen name="valentine-promo" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen 
            name="product-details" 
            options={{ 
              headerShown: false, 
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 400,
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </LocalizationWrapper>
    </Provider>
  );
}