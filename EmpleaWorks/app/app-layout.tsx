// filepath: c:\Users\Usuario\expo_proyects\EmpleaWorks-Mobile\EmpleaWorks\app\app-layout.tsx
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Configuración global de transiciones suaves
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
        // Transiciones más sutiles para Android
        ...(Platform.OS === 'android' && {
          animation: 'fade_from_bottom',
          animationDuration: 200,
        }),
      }}
    >
      {/* Aquí puedes definir rutas específicas o usar screenOptions para personalizar pantallas individuales */}
      {/* Por ejemplo:
      <Stack.Screen name="welcome" options={{ 
        animation: 'slide_from_bottom', 
        animationDuration: 300,
        gestureEnabled: false 
      }} />
      */}
    </Stack>
  );
}
