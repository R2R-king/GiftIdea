import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalization, Language } from '../hooks/useLocalization';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocalization();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Язык / Language</Text>
      <View style={styles.switcherContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageButton,
              locale === lang.code && styles.activeLanguage,
            ]}
            onPress={() => setLocale(lang.code)}
          >
            <Text
              style={[
                styles.languageText,
                locale === lang.code && styles.activeLanguageText,
              ]}
            >
              {lang.label}
            </Text>
            {locale === lang.code && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: 'rgba(247, 248, 252, 0.8)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  switcherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E9EBF8',
    borderRadius: 30,
    padding: 4,
  },
  languages: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
  },
  activeLanguage: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 16,
  },
  activeLanguageText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  }
}); 