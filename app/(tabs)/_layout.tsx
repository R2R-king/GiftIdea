import { Tabs } from 'expo-router';
import { Chrome as Home, Gift, MessageSquare, User, ShoppingBag, Heart } from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const { t } = useAppLocalization();

  return (
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Home size={size * 0.9} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Gift size={size * 0.9} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <ShoppingBag size={size * 0.9} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Heart size={size * 0.9} color={color} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <User size={size * 0.9} color={color} strokeWidth={2.2} />
            </View>
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
    height: 24,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
});