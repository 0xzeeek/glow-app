export * from './colors';
export * from './typography';
export * from './motion';

// Combined theme object for convenience
import { colors } from './colors';
import { typography } from './typography';
import { durations, easings, animations } from './motion';

export const theme = {
  colors,
  typography,
  motion: {
    durations,
    easings,
    animations,
  },
}; 