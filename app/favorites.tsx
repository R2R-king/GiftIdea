import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAppLocalization } from '@/components/LocalizationWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';
import { useTheme } from '@/components/ThemeProvider';

export default function FavoritesScreen() {
  const { t } = useAppLocalization();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Redirect to profile after a short delay
    const timer = setTimeout(() => {
      router.replace('/(tabs)/profile');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : COLORS.white }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Фоновые элементы */}
      <LinearGradient
        colors={[theme === 'dark' ? '#121212' : COLORS.primaryBackground, theme === 'dark' ? '#121212' : COLORS.white]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Заголовок */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.headerTitle}>
          {t('favorites.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('favorites.subtitle')}
        </Text>
      </LinearGradient>

      {/* Redirect message */}
      <View style={styles.redirectContainer}>
        <Text style={[styles.redirectText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>
          Избранное теперь доступно в профиле
        </Text>
        <Text style={[styles.redirectSubtext, { color: theme === 'dark' ? '#CCCCCC' : '#666666' }]}>
          Перенаправление на профиль...
        </Text>
        
        <TouchableOpacity
          style={styles.redirectButton}
          onPress={() => router.replace('/(tabs)/profile')}
        >
          <Text style={styles.redirectButtonText}>
            Перейти сейчас
          </Text>
        </TouchableOpacity>
      </View>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  redirectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  redirectText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  redirectSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  redirectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  redirectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 