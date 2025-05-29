import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
  animationType?: 'scale' | 'opacity' | 'both';
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SmoothPressable({
  children,
  onPressIn,
  onPressOut,
  scaleValue = 0.96,
  animationType = 'both',
  springConfig = { damping: 18, stiffness: 280, mass: 0.8 },
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    const transforms = [];
    
    if (animationType === 'scale' || animationType === 'both') {
      transforms.push({ scale: scale.value });
    }

    return {
      transform: transforms,
      opacity: animationType === 'opacity' || animationType === 'both' ? opacity.value : 1,
    };
  });

  const handlePressIn = (event: any) => {
    if (animationType === 'scale' || animationType === 'both') {
      scale.value = withSpring(scaleValue, springConfig);
    }
    if (animationType === 'opacity' || animationType === 'both') {
      opacity.value = withTiming(0.7, { duration: 100 });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (animationType === 'scale' || animationType === 'both') {
      scale.value = withSpring(1, springConfig);
    }
    if (animationType === 'opacity' || animationType === 'both') {
      opacity.value = withTiming(1, { duration: 150 });
    }
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
