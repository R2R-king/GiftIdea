import { Tabs } from 'expo-router';
import { Home, Gift, User, ShoppingCart, Heart } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import React from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  const { t } = useAppLocalization();

  // Кастомная анимированная иконка для табов
  const AnimatedTabIcon: React.FC<{
    focused: boolean;
    Icon: React.ElementType;
    color: string;
  }> = ({ focused, Icon, color }) => {
    return (
      <Animatable.View
        animation={focused ? 'pulse' : undefined}
        iterationCount={focused ? 'infinite' : 1}
        duration={1500}
        style={styles.iconContainer}
      >
        <Icon color={color} size={24} />
      </Animatable.View>
    );
  };

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF0844',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            height: 70,
            borderRadius: 35,
            paddingBottom: 10,
            paddingHorizontal: 20,
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            overflow: 'hidden',
          },
          tabBarBackground: () => (
            <View style={styles.tabBarBackground}>
              <LinearGradient
                colors={['rgba(255, 8, 68, 0.08)', 'rgba(255, 8, 68, 0.02)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
          ),
          tabBarItemStyle: {
            marginTop: 8,
            borderRadius: 16,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: Platform.OS === 'ios' ? -1 : 1,
          },
          headerShown: false,
          tabBarHideOnKeyboard: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} Icon={Home} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="catalog"
          options={{
            title: t('tabs.shop'),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} Icon={Gift} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: t('tabs.favorites'),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} Icon={Heart} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: t('tabs.cart'),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} Icon={ShoppingCart} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} Icon={User} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
});