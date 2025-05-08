import { Tabs } from 'expo-router';
import { Home, User, ShoppingCart, List, MessageSquare } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { View, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import React from 'react';
import { COLORS } from '@/constants/theme';
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '@/components/ThemeProvider';
import { router } from 'expo-router';

export default function TabLayout() {
  const { t } = useAppLocalization();
  const { theme, colors } = useTheme();
  const isDark = theme === 'dark';

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

  // Кнопка чата GigaChat посередине
  const ChatButton = () => (
    <TouchableOpacity
      style={[
        styles.chatButton,
        { borderColor: isDark ? '#1A1A1A' : 'white', backgroundColor: 'white' }
      ]}
      activeOpacity={0.8}
      onPress={() => router.push('/gift-assistant')}
    >
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={2000}
        style={styles.iconWrapper}
      >
        <Image 
          source={require('@/assets/icons/svg/gift-icon.jpg')} 
          style={styles.giftIcon} 
          resizeMode="contain"
        />
      </Animatable.View>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? '#888888' : COLORS.gray400,
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
          backgroundColor: isDark ? '#1A1A1A' : 'white',
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 25,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { backgroundColor: isDark ? '#1A1A1A' : 'white' }]}>
            <LinearGradient
              colors={isDark 
                ? ['rgba(26, 26, 26, 0.9)', 'rgba(26, 26, 26, 1)']
                : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <LinearGradient
              colors={isDark
                ? [`${COLORS.primary}15`, `${COLORS.primary}10`]
                : [`${COLORS.primary}10`, `${COLORS.primary}05`]}
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
          color: isDark ? '#E0E0E0' : undefined
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
            <AnimatedTabIcon focused={focused} Icon={List} color={color} />
          ),
        }}
      />
      {/* GigaChat Screen */}
      <Tabs.Screen
        name="giga-chat"
        options={{
          title: '',
          tabBarButton: () => <ChatButton />,
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
    overflow: 'hidden',
  },
  gradientOverlay: {
    opacity: 0.5,
    borderRadius: 40,
  },
  chatButton: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 56,
    height: 40,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  giftIcon: {
    width: 55,
    height: 55,
  },
});