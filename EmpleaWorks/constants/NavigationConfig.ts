import { Platform } from 'react-native';

// Configuración global de transiciones para Expo Router
export const globalScreenOptions: any = {
  headerShown: false,
  // Transiciones para iOS
  animation: 'slide_from_right',
  animationDuration: 250,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  
  // Transiciones más sutiles para Android
  ...(Platform.OS === 'android' && {
    animation: 'fade_from_bottom',
    animationDuration: 200,
  }),
};

// Configuraciones específicas por tipo de pantalla
export const modalScreenOptions: any = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'vertical',
};

export const authScreenOptions: any = {
  animation: 'slide_from_bottom',
  animationDuration: 300,
  gestureEnabled: false,
};

export const tabScreenOptions: any = {
  animation: 'fade',
  animationDuration: 200,
};
