import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Switch,
} from 'react-native';
import { 
  ArrowLeft,
  Bell,
  Globe,
  Moon,
  Shield,
  Info,
  MessageSquare,
} from 'lucide-react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

// Define SettingsOption interface
interface SettingsOption {
  id: string;
  title: string;
  icon: React.ElementType;
  hasToggle?: boolean;
  isEnabled?: boolean;
}

export default function SettingsScreen() {
  const { t, locale, setLocale } = useAppLocalization();
  const deviceColorScheme = useColorScheme();
  const { theme, toggleTheme, colors } = useTheme();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: theme === 'dark',
    language: locale === 'en' ? 'English' : 'Русский',
  });

  // Update darkMode setting when theme changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, darkMode: theme === 'dark' }));
  }, [theme]);
  
  // Toggle settings handlers
  const toggleNotifications = () => {
    setSettings(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  const toggleDarkMode = () => {
    toggleTheme(); // This will update the global theme
    // No need to update local state as it will happen via the useEffect
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ru' : 'en';
    setLocale(newLocale);
    setSettings(prev => ({ 
      ...prev, 
      language: newLocale === 'en' ? 'English' : 'Русский' 
    }));
  };

  // Settings options
  const settingsOptions: SettingsOption[] = [
    {
      id: 'notifications',
      title: t('settings.notifications'),
      icon: Bell,
      hasToggle: true,
      isEnabled: settings.notifications,
    },
    {
      id: 'darkMode',
      title: t('settings.darkMode'),
      icon: Moon,
      hasToggle: true,
      isEnabled: settings.darkMode,
    },
    {
      id: 'language',
      title: t('settings.language'),
      icon: Globe,
    },
    {
      id: 'privacy',
      title: t('settings.privacy'),
      icon: Shield,
    },
    {
      id: 'about',
      title: t('settings.about'),
      icon: Info,
    },
    {
      id: 'feedback',
      title: t('settings.feedback'),
      icon: MessageSquare,
    },
  ];

  // Handle setting option press
  const handleSettingPress = (id: string) => {
    switch (id) {
      case 'notifications':
        toggleNotifications();
        break;
      case 'darkMode':
        toggleDarkMode();
        break;
      case 'language':
        toggleLanguage();
        break;
      // Other options would navigate to respective screens
      default:
        // Handle navigation to specific setting screens
        break;
    }
  };

  // Render setting item
  const renderSettingItem = (option: SettingsOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.settingItem, 
        { 
          borderBottomColor: colors.gray100,
          backgroundColor: theme === 'dark' ? '#1A1A1A' : 'transparent'
        }
      ]}
      onPress={() => handleSettingPress(option.id)}
    >
      <View style={styles.settingItemLeft}>
        <View style={[
          styles.settingIconContainer, 
          { 
            backgroundColor: theme === 'dark' ? 'rgba(255, 107, 157, 0.15)' : `${colors.primary}15` 
          }
        ]}>
          <option.icon 
            size={20} 
            color={colors.primary} 
          />
        </View>
        <Text style={[
          styles.settingItemText, 
          { color: theme === 'dark' ? colors.gray800 : colors.gray800 }
        ]}>
          {option.title}
        </Text>
      </View>
      
      <View style={styles.settingItemRight}>
        {option.hasToggle ? (
          <Switch
            value={option.isEnabled}
            onValueChange={() => handleSettingPress(option.id)}
            trackColor={{ 
              false: theme === 'dark' ? '#333' : colors.gray200, 
              true: theme === 'dark' ? `${colors.primary}40` : `${colors.primary}50` 
            }}
            thumbColor={option.isEnabled ? colors.primary : theme === 'dark' ? '#666' : colors.gray400}
          />
        ) : (
          option.id === 'language' ? (
            <Text style={[
              styles.settingValueText, 
              { color: theme === 'dark' ? colors.gray600 : colors.gray600 }
            ]}>
              {settings.language}
            </Text>
          ) : null
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : colors.white }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#121212' : colors.white }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.gray800} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gray800 }]}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Options */}
        <View style={[
          styles.settingsSection, 
          { 
            backgroundColor: theme === 'dark' ? '#1A1A1A' : colors.white,
            shadowColor: theme === 'dark' ? 'rgba(0,0,0,0)' : '#000'
          }
        ]}>
          {settingsOptions.map((option) => renderSettingItem(option))}
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.gray500 }]}>
            {t('settings.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  settingsSection: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  settingItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
  },
  versionContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  versionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
}); 