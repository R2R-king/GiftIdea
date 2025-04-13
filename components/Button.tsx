import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress?: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#CCCCCC';
    switch (type) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary || '#6C757D';
      case 'danger': return COLORS.error || '#DC3545';
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#888888';
    switch (type) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#FFFFFF';
      case 'danger': return '#FFFFFF';
      case 'outline': return COLORS.primary;
      case 'text': return COLORS.primary;
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return '#CCCCCC';
    return type === 'outline' ? COLORS.primary : 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'large': return { paddingVertical: 14, paddingHorizontal: 20 };
      default: return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={loading || disabled ? undefined : onPress}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: type === 'outline' ? 1 : 0,
          ...getPadding(),
          width: fullWidth ? '100%' : undefined
        },
        style
      ]}
      activeOpacity={0.8}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === 'large' ? 'large' : 'small'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getTextSize()
            },
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.medium || 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default Button; 