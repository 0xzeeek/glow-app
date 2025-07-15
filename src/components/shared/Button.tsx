import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors, fonts } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'filled';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ImageSourcePropType;
  iconStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  icon,
  iconStyle,
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

  const getIconStyle = () => {
    const baseIconStyle = styles.icon;
    
    return {
      ...baseIconStyle,
      ...iconStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={getIconStyle()} />}
        <Text style={getTextStyle()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  filled: {
    backgroundColor: colors.neutral[100],
  },
  // State styles
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
    fontFamily: fonts.primaryMedium,
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  disabledText: {
    opacity: 0.7,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
  filled: {
    color: colors.text.primary,
  },
};
