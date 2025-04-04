import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large' | 'pink';
  variant?: 'default' | 'outlined' | 'filled';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'small',
  variant = 'default',
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          ...styles.card,
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.gray200,
          ...SHADOWS[elevation],
        };
      case 'filled':
        return {
          ...styles.card,
          backgroundColor: COLORS.valentineBackground,
          ...SHADOWS[elevation],
        };
      default:
        return {
          ...styles.card,
          backgroundColor: COLORS.white,
          ...SHADOWS[elevation],
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});

export default Card; 