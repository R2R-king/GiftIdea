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
import AuthService from '@/lib/auth-service';

// Предотвращаем скрытие сплэш экрана
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // После загрузки приложения, проверяем авторизацию
    const initApp = async () => {
      try {
        // Небольшая задержка для анимаций
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Скрываем сплэш экран
        await SplashScreen.hideAsync();
        
        // Проверяем авторизацию
        const isAuthenticated = await AuthService.isAuthenticated();
        
        // Перенаправляем на соответствующий экран
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          // Если первый запуск, показываем промо, иначе - логин
          // Здесь можно добавить проверку на первый запуск через AsyncStorage
          router.replace('/gift-promo');
          // Uncomment to skip promo screen: 
          // router.replace('/login');
        }
      } catch (error) {
        console.error('App init error:', error);
        // Если ошибка, отправляем на логин
        router.replace('/login');
      }
    };

    initApp();
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
          <Stack.Screen name="gift-promo" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="gift-assistant" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="holiday-chat" options={{ headerShown: false, presentation: 'modal' }} />
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