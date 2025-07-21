export const colors = {
  // Neutral colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#000000',
    grey: '#232323',
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#FFFFFF',
    neutral: '#616161',
  },
  
  // Semantic colors
  green: {
    black: "#04FF58",
    white: "#0ACA30",
  },
  red: {
    black: "#FF3366",
    white: "#FF0000",
  },
  
  // Special effects
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.2)',
  shimmer: 'rgba(255, 255, 255, 0.08)',
} as const;

export type Colors = typeof colors; 