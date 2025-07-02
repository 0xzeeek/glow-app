export const durations = { 
  instant: 120, 
  quick: 200, 
  base: 300, 
  slow: 400 
} as const;

export const easings = {
  spring: { mass: 1, damping: 14 },
  easeOut: [0.25, 0.8, 0.25, 1] as const,
};

// Animation presets
export const animations = {
  // Scale animations
  scaleIn: {
    from: { transform: [{ scale: 0.95 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
  scaleOut: {
    from: { transform: [{ scale: 1 }], opacity: 1 },
    to: { transform: [{ scale: 0.95 }], opacity: 0 },
  },
  // Fade animations  
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  // Slide animations
  slideInRight: {
    from: { transform: [{ translateX: 100 }] },
    to: { transform: [{ translateX: 0 }] },
  },
  slideInLeft: {
    from: { transform: [{ translateX: -100 }] },
    to: { transform: [{ translateX: 0 }] },
  },
  slideInUp: {
    from: { transform: [{ translateY: 100 }] },
    to: { transform: [{ translateY: 0 }] },
  },
  slideInDown: {
    from: { transform: [{ translateY: -100 }] },
    to: { transform: [{ translateY: 0 }] },
  },
} as const; 