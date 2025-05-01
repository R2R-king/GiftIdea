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
  CalendarClock
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
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
          
          <View style={styles.memberStatusBadge}>
            <Gift size={14} color={COLORS.white} />
            <Text style={styles.memberStatusText}>{t('profile.premiumMember')}</Text>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.7}>
            <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Valentine's Day Offers */}
        <View style={styles.offerSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.offerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.offerContent}>
              <View style={styles.offerTextContainer}>
                <Text style={styles.offerTitle}>{t('profile.valentineOffer')}</Text>
                <Text style={styles.offerDescription}>{t('profile.offerDescription')}</Text>
              </View>
              <View style={styles.discountContainer}>
                <Text style={styles.offerDiscount}>30%</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Language Switcher */}
        <View style={styles.languageSection}>
          <View style={styles.languageSwitcher}>
            <Text style={styles.languageTitle}>{t('profile.language')}</Text>
            <View style={styles.languageOptions}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  locale === 'en' && styles.activeLanguage,
                ]}
                onPress={() => setLocale('en')}
              >
                <Text
                  style={[
                    styles.languageText,
                    locale === 'en' && styles.activeLanguageText,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  locale === 'ru' && styles.activeLanguage,
                ]}
                onPress={() => setLocale('ru')}
              >
                <Text
                  style={[
                    styles.languageText,
                    locale === 'ru' && styles.activeLanguageText,
                  ]}
                >
                  Русский
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Опции меню */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{t('profile.account')}</Text>
          
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.menuItem,
                option.isDanger && styles.dangerMenuItem,
              ]}
              onPress={() => handleMenuOptionPress(option.id)}
            >
              <View style={styles.menuLeft}>
                <View style={[
                  styles.menuIconContainer, 
                  option.isDanger && styles.dangerIconContainer
                ]}>
                  <option.icon
                    size={20}
                    color={option.isDanger ? COLORS.error : COLORS.primary}
                  />
                </View>
                <Text style={[
                  styles.menuItemTitle,
                  option.isDanger && styles.dangerText
                ]}>{option.title}</Text>
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
                ) : option.id !== 'logout' ? (
                  <ChevronRight size={20} color={COLORS.gray500} />
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Информация о приложении */}
        <View style={styles.appInfoSection}>
          <ThemeToggle />
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
    marginBottom: 70,
  },
  profileHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
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
    marginBottom: 10,
  },
  memberStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  memberStatusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    marginLeft: 4,
    fontWeight: '500',
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
  offerSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  offerCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
    marginBottom: SPACING.lg,
  },
  offerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  discountContainer: {
    justifyContent: 'center', 
    alignItems: 'flex-end',
  },
  offerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    flexWrap: 'wrap',
    width: '100%',
  },
  offerDescription: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    width: '100%',
    flexWrap: 'wrap',
  },
  offerDiscount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  languageSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  languageSwitcher: {
    padding: SPACING.md,
  },
  languageTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  languageOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  activeLanguage: {
    backgroundColor: '#FF0844',
    borderColor: '#FF0844',
  },
  languageText: {
    fontSize: FONTS.sizes.sm,
    color: '#1E293B',
  },
  activeLanguageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  menuSectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  dangerMenuItem: {
    backgroundColor: '#FFFFFF',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemTitle: {
    fontSize: FONTS.sizes.md,
    color: '#1E293B',
  },
  dangerText: {
    color: '#FF0844',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#FF0844',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  appInfoSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  appVersion: {
    fontSize: FONTS.sizes.xs,
    color: '#94A3B8',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: FONTS.sizes.xs,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  footerDivider: {
    fontSize: FONTS.sizes.xs,
    color: '#94A3B8',
    marginHorizontal: SPACING.sm,
  },
});