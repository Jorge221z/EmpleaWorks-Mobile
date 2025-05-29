import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  children: React.ReactNode;
  isVisible?: boolean;
  animationType?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
  delay?: number;
}

export default function ScreenTransition({
  children,
  isVisible = true,
  animationType = 'fade',
  duration = 250,
  delay = 0,
}: ScreenTransitionProps) {
  const progress = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    if (isVisible) {
      progress.value = withTiming(1, {
        duration,
      });
    } else {
      progress.value = withTiming(0, {
        duration: duration * 0.8,
      });
    }
  }, [isVisible, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
        };
      
      case 'slide':
        return {
          opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [30, 0], Extrapolate.CLAMP),
            },
          ],
        };
      
      case 'slideUp':
        return {
          opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [20, 0], Extrapolate.CLAMP),
            },
          ],
        };
      
      case 'scale':
        return {
          opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.95, 1], Extrapolate.CLAMP),
            },
          ],
        };
      
      default:
        return {
          opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
        };
    }
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// Hook personalizado para transiciones de entrada en pantallas
export function useScreenTransition(animationType: 'fade' | 'slide' | 'scale' | 'slideUp' = 'fade') {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const translateX = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case 'fade':
        return { opacity: opacity.value };
      
      case 'slide':
        return {
          opacity: opacity.value,
          transform: [{ translateX: translateX.value }],
        };
      
      case 'slideUp':
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }],
        };
      
      case 'scale':
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };
      
      default:
        return { opacity: opacity.value };
    }
  });

  return animatedStyle;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
