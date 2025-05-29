import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmoothPressable from './SmoothPressable';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Calcular la altura total del tab bar incluyendo el área segura
  const tabBarHeight = 60;
  const minBottomPadding = 8; // Padding mínimo desde el bottom
  const totalBottomPadding = Math.max(insets.bottom, minBottomPadding);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.tabBarBackground,
      borderTopColor: colors.tabBarBorder,
      borderTopWidth: 1,
      height: tabBarHeight,
      paddingBottom: 5,
      paddingTop: 5,
      paddingHorizontal: 10,
    },
    safeAreaContainer: {
      backgroundColor: colors.tabBarBackground,
      paddingBottom: totalBottomPadding,
      // Altura mínima para evitar que se mueva
      minHeight: tabBarHeight + totalBottomPadding,
      // En Android, asegurar que no se superponga con los botones del sistema
      ...(Platform.OS === 'android' && {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
      // En iOS, aplicar shadow
      ...(Platform.OS === 'ios' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
    },    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      borderRadius: 12,
      marginHorizontal: 4,
      minHeight: 48,
    },
    activeTabButton: {
      backgroundColor: `${colors.tint}15`,
    },    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      textAlign: 'center',
      lineHeight: 13,
    },
    activeTabLabel: {
      color: colors.tint,
    },
    inactiveTabLabel: {
      color: colorScheme === 'dark' ? 'rgba(155, 109, 255, 0.4)' : 'rgba(124, 40, 235, 0.35)',
    },
  });

  const getIconName = (routeName: string): any => {
    switch (routeName) {
      case 'index':
        return 'th-large';
      case 'two':
        return 'bookmark';
      case 'profile':
        return 'user';
      default:
        return 'home';
    }
  };

  const getTabTitle = (routeName: string): string => {
    switch (routeName) {
      case 'index':
        return 'Ofertas';
      case 'two':
        return 'Candidaturas';
      case 'profile':
        return 'Mi Perfil';
      default:
        return routeName;
    }
  };
  return (
    <View style={styles.safeAreaContainer}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Navegación suave con transiciones
            navigation.navigate(route.name);
          }
        };        const animatedStyle = useAnimatedStyle(() => {
          const scale = withSpring(isFocused ? 1.08 : 1, {
            damping: 18,
            stiffness: 200,
            mass: 0.8,
          });

          const translateY = withSpring(isFocused ? -2 : 0, {
            damping: 15,
            stiffness: 180,
          });

          return {
            transform: [{ scale }, { translateY }],
          };
        });

        return (
          <SmoothPressable
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused && styles.activeTabButton,
            ]}
            scaleValue={0.95}
            animationType="scale"          >
            <Animated.View style={[{ 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              width: '100%'
            }, animatedStyle]}>
              <FontAwesome
                name={getIconName(route.name)}
                size={20}
                color={isFocused ? colors.tint : (colorScheme === 'dark' ? 'rgba(155, 109, 255, 0.4)' : 'rgba(124, 40, 235, 0.35)')}
                style={{ marginBottom: 1 }}
              />
              <Animated.Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
              >
                {getTabTitle(route.name)}</Animated.Text>
            </Animated.View>
          </SmoothPressable>
        );
      })}
      </View>
    </View>
  );
}
