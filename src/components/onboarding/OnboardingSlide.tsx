import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { colors, typography } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlideProps {
  image?: any; // Will be imported image asset
  title: string;
  description: string;
  backgroundColor?: string;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  image,
  title,
  description,
  backgroundColor = colors.background.primary,
  imageStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={image} style={[styles.image, imageStyle]} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Image Placeholder</Text>
          </View>
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.1,
  },
  image: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    maxWidth: 350,
    maxHeight: 350,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    maxWidth: 350,
    maxHeight: 350,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodyMedium,
    color: colors.text.tertiary,
  },
  textContainer: {
    flex: 0.8,
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
}); 