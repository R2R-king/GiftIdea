import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
}: ButtonProps) => {
  // Get button style
  let buttonStyle = [styles.button];
  
  // Add size style
  if (size === 'small') buttonStyle.push(styles.buttonSmall);
  if (size === 'medium') buttonStyle.push(styles.buttonMedium);
  if (size === 'large') buttonStyle.push(styles.buttonLarge);
  
  // Add variant style
  if (variant === 'primary') buttonStyle.push(styles.buttonPrimary);
  if (variant === 'secondary') buttonStyle.push(styles.buttonSecondary);
  if (variant === 'outline') buttonStyle.push(styles.buttonOutline);
  if (variant === 'ghost') buttonStyle.push(styles.buttonGhost);
  
  // Add other styles
  if (fullWidth) buttonStyle.push(styles.buttonFullWidth);
  if (disabled) buttonStyle.push(styles.buttonDisabled);
  
  // Get text style
  let textStyle = [styles.text];
  
  // Add size text style
  if (size === 'small') textStyle.push(styles.textSmall);
  if (size === 'medium') textStyle.push(styles.textMedium);
  if (size === 'large') textStyle.push(styles.textLarge);
  
  // Add variant text style
  if (variant === 'outline' || variant === 'ghost') {
    textStyle.push(styles.textOutline);
  } else {
    textStyle.push(styles.textDefault);
  }
  
  // Add disabled text style
  if (disabled) textStyle.push(styles.textDisabled);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} 
          size="small" 
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 36,
  },
  buttonMedium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    height: 44,
  },
  buttonLarge: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    height: 52,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
    borderColor: COLORS.gray300,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
  textDefault: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.gray500,
  },
});

export default Button; 