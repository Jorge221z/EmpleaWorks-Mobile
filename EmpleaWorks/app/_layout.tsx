import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start with welcome screen for better UX
  initialRouteName: 'welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Este componente se encarga de la redirección basada en autenticación
function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('=== AuthRedirect Debug ===');
    console.log('Auth state:', isAuthenticated ? 'Autenticado' : 'No autenticado');
    console.log('isLoading:', isLoading);
    console.log('Current path segments:', segments);
    console.log('Current route:', segments[0] || 'root/undefined');
    
    // Skip redirections during loading state
    if (isLoading) {
      console.log('⏳ Cargando estado de autenticación...');
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';
    const currentRoute = segments[0];
    
    console.log('inTabsGroup:', inTabsGroup);
    console.log('Processing route logic...');
    
    // If the user is authenticated, redirect to main app
    if (isAuthenticated) {
      console.log('✅ Usuario autenticado');
      if (!inTabsGroup && currentRoute !== 'modal') {
        console.log('🔄 Redirigiendo usuario autenticado a tabs...');
        router.replace('/(tabs)');
      } else {
        console.log('✅ Usuario autenticado ya en ruta correcta');
      }
    } 
    // If the user is not authenticated
    else {
      console.log('❌ Usuario NO autenticado');
      // Only allow access to welcome, login, and register screens
      const allowedRoutes = ['welcome', 'login', 'register'];
      console.log('Rutas permitidas:', allowedRoutes);
      console.log('Ruta actual válida?', currentRoute ? allowedRoutes.includes(currentRoute) : false);
      
      // If user is not on an allowed route OR on root route (no segments), redirect to welcome
      if (!currentRoute || !allowedRoutes.includes(currentRoute)) {
        console.log('🔄 Redirigiendo usuario no autenticado a welcome desde:', currentRoute || 'root');
        router.replace('/welcome');
      } else {
        console.log('✅ Usuario no autenticado ya en ruta permitida:', currentRoute);
      }
    }
    console.log('=== Fin AuthRedirect Debug ===');
  }, [isAuthenticated, segments, isLoading, router]);

  return <Slot />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthRedirect />
    </AuthProvider>
  );
}
