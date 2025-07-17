import { useEffect, useRef, useState } from 'react';
import {
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface UseCountingAnimationOptions {
  duration?: number;
  enableBounce?: boolean;
}

export function useCountingAnimation(
  value: number,
  options: UseCountingAnimationOptions = {}
) {
  const { duration = 800, enableBounce = true } = options;
  
  // State for the displayed value during animation
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  
  // Animation value for bounce effect
  const bounceScale = useSharedValue(1);
  
  // Counter animation function
  const animateValue = (from: number, to: number, animationDuration: number) => {
    const startTime = Date.now();
    const difference = to - from;
    
    const updateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const currentValue = from + (difference * easedProgress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else if (enableBounce) {
        // Trigger bounce when animation completes
        bounceScale.value = withSequence(
          withSpring(1.12, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 150 })
        );
      }
    };
    
    requestAnimationFrame(updateValue);
  };
  
  // Detect value changes
  useEffect(() => {
    if (value > previousValueRef.current && previousValueRef.current > 0) {
      // Animate the counter for increases
      animateValue(previousValueRef.current, value, duration);
    } else if (value !== previousValueRef.current) {
      // For decreases or initial load, just update immediately
      setDisplayValue(value);
      
      // Optionally animate decreases too (commented out by default)
      // if (value < previousValueRef.current && previousValueRef.current > 0) {
      //   animateValue(previousValueRef.current, value, duration);
      // }
    }
    
    previousValueRef.current = value;
  }, [value, duration, enableBounce]);
  
  return {
    displayValue,
    bounceScale,
  };
} 