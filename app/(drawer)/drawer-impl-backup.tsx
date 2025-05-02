/**
 * DRAWER IMPLEMENTATION BACKUP
 * 
 * This file contains the original drawer navigation implementation that was removed from active use.
 * It is preserved here for future reference and can be reactivated if needed.
 */

import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { Home, Gift, User, ShoppingCart, Heart, Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';

const { width } = Dimensions.get('window');

type DrawerStatus = 'open' | 'closed';

// Define our own drawer content props structure
interface CustomDrawerState {
  index: number;
  routes: Array<{ name: string; key: string }>;
  history: Array<{ 
    type: 'route' | 'drawer';
    key?: string; 
    status?: DrawerStatus;
  }>;
}

interface CustomDrawerNavigation {
  navigate: (routeName: string) => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  toggleDrawer: () => void;
}

interface CustomDrawerContentProps {
  state: CustomDrawerState;
  navigation: CustomDrawerNavigation;
  descriptors: Record<string, any>;
}

/**
 * Original Drawer Layout Component
 * This is a reference implementation of the drawer navigation that was previously used.
 * Currently, this code is not active and is kept only for reference.
 */
export default function DrawerLayoutReference() {
  const { t } = useAppLocalization();
  const drawerProgress = useSharedValue(0);

  // Custom drawer item component
  const DrawerItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isFocused: boolean;
    onPress: () => void;
  }> = ({ icon, label, isFocused, onPress }) => (
    <TouchableOpacity 
      style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.drawerIconContainer}>
        {icon}
      </View>
      <Text style={[styles.drawerLabel, isFocused && styles.drawerLabelFocused]}>
        {label}
      </Text>
      {isFocused && (
        <View style={styles.activeIndicator} />
      )}
    </TouchableOpacity>
  );

  // Animation style for the drawer content
  const drawerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(drawerProgress.value * 30, { duration: 250 }) },
        { scale: withTiming(1 - 0.05 * (1 - drawerProgress.value), { duration: 250 }) }
      ],
      opacity: withTiming(0.5 + drawerProgress.value * 0.5, { duration: 250 }),
    };
  });

  // Custom drawer toggle button
  const CustomDrawerToggle: React.FC<{ tintColor: string }> = ({ tintColor }) => {
    const navigation = useNavigation();
    
    return (
      <TouchableOpacity 
        onPress={() => {
          // @ts-ignore - we know this method exists on the drawer navigation
          navigation.toggleDrawer();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={styles.drawerToggle}
      >
        <Menu color={tintColor} size={24} />
      </TouchableOpacity>
    );
  };

  return (
    <Drawer
      screenOptions={{
        drawerStyle: {
          width: width * 0.8,
          backgroundColor: 'transparent',
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        swipeEdgeWidth: 50,
        headerShown: true,
        headerTransparent: true,
        headerTintColor: '#FF0844',
        headerLeft: () => <CustomDrawerToggle tintColor="#FF0844" />,
        headerTitle: '',
        drawerPosition: 'left',
      }}
      drawerContent={(props: any) => {
        const { state, navigation } = props;
        
        // Update drawer progress for animations
        drawerProgress.value = state.history.some(
          (h: any) => h.type === 'drawer' && h.status === 'open'
        ) ? 1 : 0;

        return (
          <View style={styles.drawerContainer}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)']}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Menu Items */}
            <Animated.View style={[styles.drawerContent, drawerAnimatedStyle]}>
              <View>
                <DrawerItem
                  icon={<Home color={state.index === 0 ? '#FF0844' : '#94A3B8'} size={24} />}
                  label={t('tabs.home')}
                  isFocused={state.index === 0}
                  onPress={() => {
                    navigation.navigate('index');
                    navigation.closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={<Gift color={state.index === 1 ? '#FF0844' : '#94A3B8'} size={24} />}
                  label={t('tabs.shop')}
                  isFocused={state.index === 1}
                  onPress={() => {
                    navigation.navigate('catalog');
                    navigation.closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={<Heart color={state.index === 2 ? '#FF0844' : '#94A3B8'} size={24} />}
                  label={t('tabs.favorites')}
                  isFocused={state.index === 2}
                  onPress={() => {
                    navigation.navigate('favorites');
                    navigation.closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={<ShoppingCart color={state.index === 3 ? '#FF0844' : '#94A3B8'} size={24} />}
                  label={t('tabs.cart')}
                  isFocused={state.index === 3}
                  onPress={() => {
                    navigation.navigate('cart');
                    navigation.closeDrawer();
                  }}
                />
                <DrawerItem
                  icon={<User color={state.index === 4 ? '#FF0844' : '#94A3B8'} size={24} />}
                  label={t('tabs.profile')}
                  isFocused={state.index === 4}
                  onPress={() => {
                    navigation.navigate('profile');
                    navigation.closeDrawer();
                  }}
                />
              </View>
            </Animated.View>
            
            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.version}>v1.0.0</Text>
            </View>
          </View>
        );
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: t('tabs.home'),
          title: t('tabs.home'),
        }}
      />
      <Drawer.Screen
        name="catalog"
        options={{
          drawerLabel: t('tabs.shop'),
          title: t('tabs.shop'),
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          drawerLabel: t('tabs.favorites'),
          title: t('tabs.favorites'),
        }}
      />
      <Drawer.Screen
        name="cart"
        options={{
          drawerLabel: t('tabs.cart'),
          title: t('tabs.cart'),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: t('tabs.profile'),
          title: t('tabs.profile'),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    paddingLeft: 0,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
    paddingRight: 10,
    paddingLeft: 0,
    marginLeft: -10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingLeft: 0,
    paddingRight: 15,
    marginVertical: 5,
    marginLeft: -20,
    borderRadius: 12,
  },
  drawerItemFocused: {
    backgroundColor: 'rgba(255, 8, 68, 0.1)',
  },
  drawerIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 15,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  drawerLabelFocused: {
    fontWeight: '600',
    color: '#FF0844',
  },
  activeIndicator: {
    position: 'absolute',
    right: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0844',
  },
  drawerToggle: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#94A3B8',
  },
}); 