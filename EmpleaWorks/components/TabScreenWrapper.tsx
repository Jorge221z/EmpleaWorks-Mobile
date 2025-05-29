import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface TabScreenWrapperProps {
  children: React.ReactNode;
  isFocused: boolean;
}

export default function TabScreenWrapper({ children, isFocused }: TabScreenWrapperProps) {
  const opacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { 
      duration: 200 
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[{ flex: 1 }, animatedStyle]}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
    >
      {children}
    </Animated.View>
  );
}
