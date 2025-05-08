import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
  Switch,
} from 'react-native';
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  MapPin, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings,
  Gift,
  Map,
  Award,
  CalendarClock,
  Plus,
  Edit,
  Trash2,
  Snowflake,
  DollarSign,
  Heart,
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import TabBarShadow from '@/components/TabBarShadow';

import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useSelector } from 'react-redux';
import { store } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { useFavorites } from '@/hooks/useFavorites';

// Define RootState type based on the store
type RootState = ReturnType<typeof store.getState>;

const { width } = Dimensions.get('window');

// Определяем интерфейс для опций меню
interface MenuOption {
  id: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  hasToggle?: boolean;
  isEnabled?: boolean;
  isDanger?: boolean;
}

export default function ProfileScreen() {
  const { t, locale, setLocale } = useAppLocalization();
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors, theme } = useTheme();
  const { favoriteItems } = useFavorites();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ru' : 'en');
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.replace('/login');
  };

  const handleMenuOptionPress = (id: string) => {
    switch (id) {
      case 'loyalty':
        router.push('/loyalty-program');
        break;
      case 'map':
        router.push('/map-gift-finder');
        break;
      case 'reminders':
        // Показываем компонент ReminderManager внутри профиля
        // Это можно реализовать с помощью модального окна
        break;
      case 'logout':
        handleLogout();
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'orders':
        // Пока не реализовано
        break;
      case 'wishlists':
        router.push('/wishlist');
        break;
      case 'secretSanta':
        router.push('/secret-santa' as any);
        break;
      case 'settings':
        router.push('/settings' as any);
        break;
      case 'giftCollection':
        router.push('/gift-collection' as any);
        break;
      default:
        // Для остальных пунктов меню
        break;
    }
  };

  // Опции меню в личном кабинете
  const menuOptions: MenuOption[] = [
    {
      id: 'settings',
      title: t('profile.settings'),
      icon: Settings,
    },
    {
      id: 'orders',
      title: t('profile.orders'),
      icon: ShoppingBag,
      count: 5,
    },
    {
      id: 'favorites',
      title: t('profile.favorites'),
      icon: Heart,
      count: favoriteItems.length,
    },
    {
      id: 'wishlists',
      title: t('profile.wishlists'),
      icon: Gift,
    },
    {
      id: 'giftCollection',
      title: t('profile.giftCollection'),
      icon: DollarSign,
    },
    {
      id: 'secretSanta',
      title: t('profile.secretSanta'),
      icon: Snowflake,
    },
    {
      id: 'loyalty',
      title: t('profile.loyalty'),
      icon: Award,
    },
    {
      id: 'map',
      title: t('profile.mapSearch'),
      icon: Map,
    },
    {
      id: 'reminders',
      title: t('profile.reminders'),
      icon: CalendarClock,
    },
    {
      id: 'help',
      title: t('profile.help'),
      icon: HelpCircle,
    },
    
  ];

  const renderMenuItem = (option: MenuOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.menuItem,
        option.isDanger && styles.dangerMenuItem,
        { 
          borderBottomColor: theme === 'dark' ? '#333333' : colors.gray100,
          backgroundColor: theme === 'dark' ? 'transparent' : 'transparent'
        }
      ]}
      onPress={() => handleMenuOptionPress(option.id)}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.menuIconContainer,
          option.isDanger && styles.dangerIcon,
          { backgroundColor: option.isDanger ? 
            (theme === 'dark' ? 'rgba(255, 73, 73, 0.2)' : `${colors.error}20`) : 
            (theme === 'dark' ? 'rgba(255, 107, 157, 0.15)' : `${colors.primary}15`) 
          }
        ]}>
          <option.icon 
            size={20} 
            color={option.isDanger ? 
              colors.error : 
              (theme === 'dark' ? colors.primary : colors.primary)
            } 
          />
        </View>
        <Text style={[
          styles.menuItemText,
          option.isDanger && styles.dangerText,
          { color: option.isDanger ? 
            colors.error : 
            (theme === 'dark' ? '#FFFFFF' : colors.gray800) 
          }
        ]}>
          {option.title}
        </Text>
      </View>
      
      <View style={styles.menuItemRight}>
        {option.count !== undefined && (
          <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>{option.count}</Text>
          </View>
        )}
        
        {option.hasToggle ? (
          <Switch
            value={option.isEnabled}
            onValueChange={() => {
              // Toggle logic
            }}
            trackColor={{ false: theme === 'dark' ? '#333333' : colors.gray200, true: `${colors.primary}50` }}
            thumbColor={option.isEnabled ? colors.primary : theme === 'dark' ? '#666666' : colors.gray400}
          />
        ) : (
          <ChevronRight size={20} color={option.isDanger ? colors.error : theme === 'dark' ? colors.primary : colors.gray400} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[theme === 'dark' ? colors.primary : colors.primaryBackground, colors.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Профиль пользователя */}
        <View style={styles.profileHeader}>
          {/* Фон профиля */}
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.profileHeaderBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.editButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileName, {color: theme === 'dark' ? '#FFFFFF' : '#000000'}]}>
            {user?.name || t('profile.guestUser')}
          </Text>
          <Text style={[styles.profileEmail, {color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)'}]}>
            {user?.email || ''}
          </Text>
          
        </View>
        
        {/* Promotional Info Card */}
        <View style={[styles.promoCard, {backgroundColor: theme === 'dark' ? '#222222' : colors.white}]}>
          <Text style={[styles.promoTitle, {color: theme === 'dark' ? colors.gray800 : '#000000'}]}>
            {t('profile.valentineOffer')}
          </Text>
          <Text style={[styles.promoDescription, {color: theme === 'dark' ? colors.gray600 : '#333333'}]}>
            {t('profile.offerDescription')}
          </Text>
        </View>
        
        {/* Menu Options */}
        <View style={[
          styles.menuSection, 
          {
            backgroundColor: theme === 'dark' ? '#1E1E1E' : colors.white,
            shadowColor: theme === 'dark' ? 'rgba(0,0,0,0)' : '#000',
          }
        ]}>
          {menuOptions.map((option) => renderMenuItem(option))}
        </View>
        
        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: theme === 'dark' ? '#FFFFFF' : colors.gray800}]}>
              {t('profile.recentOrders')}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, {color: theme === 'dark' ? colors.primary : colors.primary}]}>
                {t('profile.seeAll')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.orderCard, {backgroundColor: theme === 'dark' ? '#1E1E1E' : colors.white}]}>
            <View style={styles.orderHeader}>
              <Text style={[styles.orderNumber, {color: theme === 'dark' ? '#FFFFFF' : colors.gray800}]}>Order #2305</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Delivered</Text>
              </View>
            </View>
            
            <View style={styles.orderDetails}>
              <View style={styles.orderItem}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=500' }}
                  style={styles.orderItemImage} 
                />
                <View style={styles.orderItemInfo}>
                  <Text style={[styles.orderItemName, {color: theme === 'dark' ? '#FFFFFF' : colors.gray700}]}>
                    Pink Roses Bouquet
                  </Text>
                  <Text style={[styles.orderItemPrice, {color: theme === 'dark' ? colors.primary : colors.primary}]}>
                    $39.00
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={[
              styles.reorderButton, 
              {backgroundColor: theme === 'dark' ? 'rgba(255, 107, 157, 0.15)' : `${colors.primary}15`}
            ]}>
              <Text style={[styles.reorderButtonText, {color: colors.primary}]}>
                {t('profile.reorder')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Saved Addresses */}
        <View style={styles.addressesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: theme === 'dark' ? '#FFFFFF' : colors.gray800}]}>
              {t('profile.savedAddresses')}
            </Text>
            <TouchableOpacity>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.addressCard, {backgroundColor: theme === 'dark' ? '#1E1E1E' : colors.white}]}>
            <View style={styles.addressHeader}>
              <View style={[
                styles.addressIconContainer, 
                {backgroundColor: theme === 'dark' ? 'rgba(255, 107, 157, 0.15)' : `${colors.primary}15`}
              ]}>
                <MapPin size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.addressType, {color: theme === 'dark' ? '#FFFFFF' : colors.gray800}]}>
                  {t('profile.home')}
                </Text>
                <Text style={[styles.addressText, {color: theme === 'dark' ? '#CCCCCC' : colors.gray600}]}>
                  123 Main Street, Apartment 4B
                </Text>
                <Text style={[styles.addressText, {color: theme === 'dark' ? '#CCCCCC' : colors.gray600}]}>
                  New York, NY 10001
                </Text>
              </View>
            </View>
            
            <View style={styles.addressActions}>
              <TouchableOpacity style={[
                styles.addressActionButton, 
                {backgroundColor: theme === 'dark' ? '#333333' : colors.gray100}
              ]}>
                <Edit size={16} color={theme === 'dark' ? '#FFFFFF' : colors.gray600} />
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.addressActionButton, 
                {backgroundColor: theme === 'dark' ? '#333333' : colors.gray100}
              ]}>
                <Trash2 size={16} color={theme === 'dark' ? '#FFFFFF' : colors.gray600} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            {backgroundColor: theme === 'dark' ? '#1E1E1E' : colors.white}
          ]}
          onPress={() => handleMenuOptionPress('logout')}
        >
          <LogOut size={20} color={colors.primary} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, {color: colors.primary}]}>
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>
        
        {/* Информация о приложении */}
        <View style={styles.appInfoSection}>
          <Text style={[styles.appVersion, {color: theme === 'dark' ? '#999999' : colors.gray400}]}>
            {t('profile.version')} 1.0.0
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={[styles.footerLink, {color: theme === 'dark' ? '#CCCCCC' : colors.gray500}]}>
                {t('profile.privacyPolicy')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.footerDivider, {color: theme === 'dark' ? '#999999' : colors.gray400}]}>•</Text>
            <TouchableOpacity>
              <Text style={[styles.footerLink, {color: theme === 'dark' ? '#CCCCCC' : colors.gray500}]}>
                {t('profile.termsOfService')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <TabBarShadow />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 20,
    paddingBottom: 30,
  },
  profileHeaderBackground: {
    ...StyleSheet.absoluteFillObject,
    height: 180,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 15,
  },
  ordersSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: SPACING.lg,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: SPACING.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reorderButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
  },
  reorderButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addressesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
    marginBottom: SPACING.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  addressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  addressType: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addressActionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  menuSection: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  logoutIcon: {
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  appInfoSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  appVersion: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
    marginBottom: SPACING.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    textDecorationLine: 'underline',
  },
  footerDivider: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
    marginHorizontal: SPACING.sm,
  },
  dangerMenuItem: {
    backgroundColor: COLORS.error + '10',
  },
  dangerIcon: {
    backgroundColor: COLORS.error + '20',
  },
  dangerText: {
    color: COLORS.error,
  },
  promoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  promoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: '#000000',
    marginBottom: SPACING.xs,
  },
  promoDescription: {
    fontSize: FONTS.sizes.sm,
    color: '#333333',
    fontWeight: '500',
  },
});
