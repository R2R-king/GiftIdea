import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { COLORS } from '@/constants/theme';

// Define theme types
export type Theme = 'light' | 'dark';

// Define colors for each theme
export const themes = {
  light: {
    ...COLORS,
    // Light theme colors remain the same
  },
  dark: {
    ...COLORS,
    // Override colors for dark theme
    primaryBackground: '#121212',
    white: '#1A1A1A', // Card background
    black: '#FFFFFF', // Inverted for text
    gray800: '#F3F4F6', // Text colors - lightest in dark theme
    gray700: '#E5E7EB',
    gray600: '#D1D5DB',
    gray500: '#9CA3AF',
    gray400: '#6B7280',
    gray300: '#4B5563',
    gray200: '#374151',
    gray100: '#222222', // Border color
    gray50: '#1F1F1F',
    
    // Keep primary colors (pink) for branding consistency
    primary: '#FF6B9D', // Keep pink as accent
    primaryLight: '#FF8CB3',
    
    // Dark theme specific
    menuBackground: '#1A1A1A', // Menu background
    cardBackground: '#1A1A1A', // Card background
    textPrimary: '#F3F4F6', // Primary text
    textSecondary: '#9CA3AF', // Secondary text
    
    // Don't invert these colors
    error: '#FF4949', // Keep error color vibrant
    success: '#10B981', // Keep success color
    
    // Override gift backgrounds and valentine backgrounds
    giftBackground: '#1A1A1A',
    valentineBackground: '#1A1A1A',
    valentineLightBackground: '#222222',
  }
};

// Create the context
interface ThemeContextType {
  theme: Theme;
  colors: typeof themes.light;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: themes.light,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Create a provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<Theme>(deviceColorScheme === 'dark' ? 'dark' : 'light');

  // Update the theme when device color scheme changes
  useEffect(() => {
    setTheme(deviceColorScheme === 'dark' ? 'dark' : 'light');
  }, [deviceColorScheme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a hook to use the theme context
export const useTheme = () => useContext(ThemeContext); 