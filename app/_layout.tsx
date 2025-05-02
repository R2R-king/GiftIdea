import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { LocalizationWrapper } from '@/components/LocalizationWrapper';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { Platform, StatusBar, View } from 'react-native';
import { COLORS } from '@/constants/theme';

// Предотвращаем скрытие сплэш экрана
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Configure status bar to be transparent
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setTranslucent(true);
  }, []);

  useEffect(() => {
    // После загрузки приложения, переходим на промо-экран
    const redirectToPromo = async () => {
      // Небольшая задержка для анимаций
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Скрываем сплэш экран
      await SplashScreen.hideAsync();
      
      // Перенаправляем на промо экран
      router.replace('/gift-promo');
    };

    redirectToPromo();
  }, []);

  return (
    <Provider store={store}>
      <LocalizationWrapper>
        <ExpoStatusBar style="dark" translucent backgroundColor="transparent" />
        <View style={{ 
          flex: 1, 
          backgroundColor: COLORS.primaryBackground 
        }}>
          <Stack 
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
              animationDuration: 400,
              gestureEnabled: true,
              presentation: 'transparentModal',
              animationTypeForReplace: 'push',
              gestureDirection: 'horizontal',
              contentStyle: {
                backgroundColor: COLORS.primaryBackground
              }
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
            {/* Keeping the drawer navigation in the project but not actively using it */}
            {/* The drawer navigation will remain accessible for future reference */}
            <Stack.Screen 
              name="(drawer)" 
              options={{ 
                headerShown: false, 
                animation: 'fade', 
                animationDuration: 200 
              }} 
              redirect={true}
            />
            <Stack.Screen name="gift-promo" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen 
              name="product-details" 
              options={{ 
                headerShown: false, 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 400,
              }} 
            />
            <Stack.Screen 
              name="map-gift-finder" 
              options={{ 
                headerShown: false, 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 300,
              }} 
            />
            <Stack.Screen 
              name="loyalty-program" 
              options={{ 
                headerShown: false, 
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 300,
              }} 
            />
          </Stack>
        </View>
      </LocalizationWrapper>
    </Provider>
  );
}