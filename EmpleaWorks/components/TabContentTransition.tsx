import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface TabContentTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  animationType?: 'fade' | 'slideHorizontal' | 'scale';
  duration?: number;
}

export default function TabContentTransition({
  children,
  isActive,
  animationType = 'fade',
  duration = 200,
}: TabContentTransitionProps) {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateX = useSharedValue(isActive ? 0 : 20);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  useEffect(() => {
    if (isActive) {
      // Entrada del tab
      opacity.value = withTiming(1, { duration });
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      // Salida del tab
      opacity.value = withTiming(0, { duration: duration * 0.8 });
      translateX.value = withTiming(-10, { duration: duration * 0.8 });
      scale.value = withTiming(0.98, { duration: duration * 0.8 });
    }
  }, [isActive, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const getTransforms = () => {
      switch (animationType) {
        case 'slideHorizontal':
          return [
            { translateX: translateX.value },
            { scale: scale.value },
          ];
        case 'scale':
          return [{ scale: scale.value }];
        case 'fade':
        default:
          return [
            { translateX: translateX.value * 0.5 },
            { scale: scale.value },
          ];
      }
    };

    return {
      opacity: opacity.value,
      transform: getTransforms(),
    };
  });

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
