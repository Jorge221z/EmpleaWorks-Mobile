import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  duration?: number;
}

export default function TabTransition({ 
  children, 
  isActive,
  duration = 200 
}: TabTransitionProps) {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateX = useSharedValue(isActive ? 0 : 20);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, { duration });
    translateX.value = withTiming(isActive ? 0 : 20, { duration });
  }, [isActive, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  if (!isActive && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
