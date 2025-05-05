import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { LocalizationWrapper } from '@/components/LocalizationWrapper';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { Platform, StatusBar, View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Предотвращаем автоматическое скрытие сплеш-скрина
SplashScreen.preventAutoHideAsync();

// Компонент для рендеринга правильных стилей на основе темы
function ThemedLayout() {
  const { theme, colors } = useTheme();
  
  useEffect(() => {
    // Configure status bar to match theme
    StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content', true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setTranslucent(true);
  }, [theme]);
  
  return (
    <>
      <ExpoStatusBar style={theme === 'dark' ? "light" : "dark"} translucent backgroundColor="transparent" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ 
          flex: 1, 
          backgroundColor: theme === 'dark' ? '#121212' : colors.primaryBackground 
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
                backgroundColor: theme === 'dark' ? '#121212' : colors.primaryBackground
              }
            }}
            initialRouteName="gift-promo"
          >
            {/* Показываем gift-promo первым при запуске */}
            <Stack.Screen 
              name="gift-promo" 
              options={{ 
                headerShown: false, 
                gestureEnabled: false,
                animation: 'fade',
              }} 
            />
            
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
      </GestureHandlerRootView>
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useFrameworkReady();

  useEffect(() => {
    // Initial status bar config
    StatusBar.setBarStyle('dark-content', true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setTranslucent(true);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize a default user in the Redux store
        store.dispatch(setUser({
          id: 'default_user',
          name: 'Guest User',
          email: 'guest@example.com'
        }));
        
        // Здесь можно загрузить ресурсы
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        // После подготовки приложения скрываем сплеш-экран
        await SplashScreen.hideAsync();
        
        // После скрытия сплеш-скрина перенаправляем на gift-promo
        router.replace('/gift-promo');
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <LocalizationWrapper>
        <ThemeProvider>
          <ThemedLayout />
        </ThemeProvider>
      </LocalizationWrapper>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});