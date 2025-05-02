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
  Heart, 
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
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import TabBarShadow from '@/components/TabBarShadow';
import ThemeToggle from '@/components/ThemeToggle';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

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
        router.push('/(tabs)/favorites');
        break;
      case 'orders':
        // Пока не реализовано
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
      count: 12,
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
      id: 'notifications',
      title: t('profile.notifications'),
      icon: Bell,
      hasToggle: true,
      isEnabled: true,
    },
    {
      id: 'help',
      title: t('profile.help'),
      icon: HelpCircle,
    },
    {
      id: 'logout',
      title: t('profile.logout'),
      icon: LogOut,
      isDanger: true,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[COLORS.primaryBackground, COLORS.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Профиль пользователя */}
        <View style={styles.profileHeader}>
          {/* Фон профиля */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.profileHeaderBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
              <User size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>Sophie Anderson</Text>
          <Text style={styles.profileEmail}>sophie.a@example.com</Text>
          
          <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.7}>
            <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.recentOrders')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Order #2305</Text>
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
                  <Text style={styles.orderItemName}>Pink Roses Bouquet</Text>
                  <Text style={styles.orderItemPrice}>$39.00</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>{t('profile.reorder')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Saved Addresses */}
        <View style={styles.addressesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.savedAddresses')}</Text>
            <TouchableOpacity>
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIconContainer}>
                <MapPin size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.addressType}>{t('profile.home')}</Text>
                <Text style={styles.addressText}>123 Main Street, Apartment 4B</Text>
                <Text style={styles.addressText}>New York, NY 10001</Text>
              </View>
            </View>
            
            <View style={styles.addressActions}>
              <TouchableOpacity style={styles.addressActionButton}>
                <Edit size={16} color={COLORS.gray600} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addressActionButton}>
                <Trash2 size={16} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Опции меню */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          
          {menuOptions.slice(0, 6).map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={() => handleMenuOptionPress(option.id)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <option.icon
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.menuItemTitle}>{option.title}</Text>
              </View>
              
              <View style={styles.menuRight}>
                {option.count && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{option.count}</Text>
                  </View>
                )}
                
                {option.hasToggle ? (
                  <Switch
                    value={option.isEnabled}
                    onValueChange={() => {}}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                    thumbColor={option.isEnabled ? COLORS.primary : COLORS.gray200}
                    ios_backgroundColor={COLORS.gray300}
                  />
                ) : (
                  <ChevronRight size={20} color={COLORS.gray500} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => handleMenuOptionPress('logout')}
        >
          <LogOut size={20} color={COLORS.primary} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
        
        {/* Информация о приложении */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>{t('profile.version')} 1.0.0</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('profile.privacyPolicy')}</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('profile.termsOfService')}</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: 20,
    position: 'relative',
    marginBottom: 30,
  },
  profileHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 3,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  profileName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editProfileText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ordersSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
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
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginBottom: 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuItemTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  countText: {
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
});
