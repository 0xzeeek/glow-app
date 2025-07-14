import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fonts } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const isDisabled = disabled;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.base;
    const variantStyle = styles[variant];
    const disabledStyle = isDisabled ? styles.disabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = styles.text;
    const variantTextStyle = textStyles[variant];
    const disabledTextStyle = isDisabled ? styles.disabledText : {};

    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...disabledTextStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '90%',
  },
  // Variant styles
  primary: {
    backgroundColor: colors.background.primary,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
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
    fontFamily: fonts.primary,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  disabledText: {
    opacity: 0.7,
  },
});

const textStyles = {
  // Variant text styles
  primary: {
    color: colors.text.primary,
  },
  secondary: {
    color: colors.text.secondary,
  },
  outline: {
    color: colors.text.secondary,
  },
};
