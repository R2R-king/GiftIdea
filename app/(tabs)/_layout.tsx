import { Tabs } from 'expo-router';
import { Home, Gift, User, ShoppingCart, Heart } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import React from 'react';
import { COLORS } from '@/constants/theme';

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
        style={[
          styles.iconContainer,
          focused && styles.focusedIconContainer
        ]}
      >
        <Icon 
          color={color} 
          size={focused ? 26 : 22} 
          strokeWidth={focused ? 2.5 : 2}
        />
        {focused && (
          <Animatable.View 
            animation="fadeIn" 
            duration={300} 
            style={styles.activeIndicator} 
          />
        )}
      </Animatable.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 80,
          borderRadius: 40,
          paddingBottom: Platform.OS === 'ios' ? 16 : 12,
          paddingTop: 12,
          paddingHorizontal: 16,
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 25,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.primary}05`]}
              style={[StyleSheet.absoluteFill, styles.gradientOverlay]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </View>
        ),
        tabBarItemStyle: {
          marginVertical: 8,
          borderRadius: 16,
          height: 50,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: Platform.OS === 'ios' ? 0 : 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  focusedIconContainer: {
    backgroundColor: `${COLORS.primary}15`,
    transform: [{ scale: 1.05 }],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  gradientOverlay: {
    opacity: 0.5,
    borderRadius: 40,
  },
});