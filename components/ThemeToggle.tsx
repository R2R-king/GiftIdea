import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAppLocalization } from './LocalizationWrapper';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from './ThemeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { t } = useAppLocalization();

  return (
    <View style={styles.container}>
      <Sun size={18} color={isDarkMode ? '#94A3B8' : '#FF0844'} />
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: '#E2E8F0', true: '#334155' }}
        thumbColor={isDarkMode ? '#0EA5E9' : '#FF0844'}
        ios_backgroundColor="#E2E8F0"
        style={styles.switch}
      />
      <Moon size={18} color={isDarkMode ? '#0EA5E9' : '#94A3B8'} />
      <Text style={styles.text}>{isDarkMode ? t('profile.darkMode') : t('profile.lightMode')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  switch: {
    marginHorizontal: 10,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
});

export default ThemeToggle; 