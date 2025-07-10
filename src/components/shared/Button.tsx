import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[size];
    const variantStyle = styles[variant];
    const disabledStyle = isDisabled ? styles.disabled : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = textStyles[size];
    const variantTextStyle = textStyles[variant];
    const disabledTextStyle = isDisabled ? styles.disabledText : {};

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      ...variantTextStyle,
      ...disabledTextStyle,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.neutral[1000] : colors.neutral[0]}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Size styles
  small: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    minHeight: 48,
  },
  // Variant styles
  primary: {
    backgroundColor: colors.neutral[0],
  },
  secondary: {
    backgroundColor: colors.primary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[0],
  },
  // State styles
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.7,
  },
});

const textStyles = {
  // Size text styles
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  // Variant text styles
  primary: {
    color: colors.neutral[1000],
  },
  secondary: {
    color: colors.neutral[0],
  },
  outline: {
    color: colors.neutral[0],
  },
}; 