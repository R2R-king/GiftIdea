/**
 * App Theme Configuration
 */

export const COLORS = {
  // Primary Colors
  primary: '#FF3366',
  primaryLight: '#FF6699',
  primaryDark: '#CC2952',
  primaryBackground: '#FFF0F5',
  
  // Secondary Colors
  secondary: '#8A2BE2',
  secondaryLight: '#A45EE5',
  secondaryDark: '#6A1FB0',
  secondaryBackground: '#F5F0FF',
  
  // Accent Colors
  accent: '#00BFFF',
  accentLight: '#66D9FF',
  accentDark: '#0099CC',
  
  // Valentine's Theme Colors
  valentinePink: '#FF3366',
  valentineLightPink: '#FF6B98',
  valentineRed: '#E91E63',
  valentineDarkRed: '#C2185B',
  valentineBackground: '#FFF5F8',
  valentineLightBackground: '#FFF9FB',
  
  // Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
  warning: '#FBBF24',
  info: '#3B82F6',
  
  // Transparency
  transparent: 'transparent',
}

export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    title: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
}

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  pink: {
    shadowColor: COLORS.valentinePink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
}

export const LAYOUT = {
  // Screen padding
  screenPadding: SPACING.lg,
  
  // Card styles
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
    backgroundColor: COLORS.white,
  },
  
  // Button
  button: {
    height: 48,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Input
  input: {
    height: 50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray100,
    color: COLORS.gray800,
  },
}

export default {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  LAYOUT,
}; 